// Service worker: finds (or briefly opens) the YouTube watch page for a video,
// runs the extractor inside that page, and returns the cues to the PWA bridge.

const TAB_LOAD_TIMEOUT_MS = 25000;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.type !== 'GET_CUES') return false;
  getCues(msg.videoId, msg.lang, msg.transLangs || [])
    .then(sendResponse)
    .catch((err) => sendResponse({ ok: false, error: String(err && err.message ? err.message : err) }));
  return true; // async response
});

async function getCues(videoId, lang, transLangs) {
  if (!/^[\w-]{11}$/.test(videoId)) return { ok: false, error: 'Invalid video id.' };

  // Reuse an already-open tab for this video, otherwise open one in the background.
  const open = await chrome.tabs.query({ url: 'https://www.youtube.com/watch*' });
  let tab = open.find((t) => new URL(t.url).searchParams.get('v') === videoId);
  let created = false;

  if (!tab) {
    tab = await chrome.tabs.create({ url: `https://www.youtube.com/watch?v=${videoId}`, active: false });
    created = true;
    try {
      await chrome.tabs.update(tab.id, { muted: true });
    } catch (_) { /* best effort */ }
    await waitForComplete(tab.id);
  }

  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: 'MAIN',
      func: extractCues,
      args: [videoId, lang, transLangs || []]
    });
    return res && res.result ? res.result : { ok: false, error: 'Extractor returned nothing.' };
  } finally {
    if (created) chrome.tabs.remove(tab.id).catch(() => {});
  }
}

function waitForComplete(tabId) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      reject(new Error('YouTube page took too long to load.'));
    }, TAB_LOAD_TIMEOUT_MS);

    function onUpdated(id, info) {
      if (id === tabId && info.status === 'complete') {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(onUpdated);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs.get(tabId).then((t) => {
      if (t.status === 'complete') onUpdated(tabId, { status: 'complete' });
    });
  });
}

// Injected into the YouTube page (MAIN world). Must be fully self-contained.
async function extractCues(videoId, lang, transLangs) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function readPlayerResponse() {
    let pr = window.ytInitialPlayerResponse;
    if (pr && pr.videoDetails && pr.videoDetails.videoId === videoId) return pr;
    // SPA navigation can leave the global stale: re-read the watch page.
    const html = await (await fetch(`/watch?v=${videoId}`, { credentials: 'include' })).text();
    const m = html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]+?\})\s*;\s*(?:var\s|<\/script>)/);
    return m ? JSON.parse(m[1]) : null;
  }

  async function androidPlayerResponse() {
    // Fallback client whose caption URLs do not need a PO token.
    const res = await fetch('/youtubei/v1/player?prettyPrint=false', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId,
        context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38', hl: 'en' } }
      })
    });
    return res.ok ? res.json() : null;
  }

  function tracksOf(pr) {
    const r = pr && pr.captions && pr.captions.playerCaptionsTracklistRenderer;
    return r ? { tracks: r.captionTracks || [], translatable: r.translationLanguages || [] } : { tracks: [], translatable: [] };
  }

  function pickTrack(tracks) {
    const matches = tracks.filter((t) => t.languageCode === lang || t.languageCode.startsWith(lang + '-'));
    return matches.find((t) => t.kind !== 'asr') || matches[0] || null;
  }

  // The player appends a PO token to its own caption requests; reuse it if present.
  function poTokenParams() {
    const hit = performance
      .getEntriesByType('resource')
      .map((e) => e.name)
      .find((n) => n.includes('/api/timedtext') && n.includes('pot='));
    if (!hit) return '';
    const u = new URL(hit);
    return ['pot', 'potc', 'c'].filter((k) => u.searchParams.has(k)).map((k) => `&${k}=${encodeURIComponent(u.searchParams.get(k))}`).join('');
  }

  async function fetchJson3(baseUrl, extra) {
    const u = new URL(baseUrl);
    u.searchParams.set('fmt', 'json3');
    let url = u.toString() + (extra || '');
    const isWebUrl = (u.searchParams.get('c') || 'WEB').toUpperCase().startsWith('WEB');
    if (isWebUrl && !u.searchParams.has('pot')) url += poTokenParams();
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return [];
    const text = await res.text();
    if (!text) return [];
    let data;
    try { data = JSON.parse(text); } catch (_) { return []; }
    const cues = [];
    for (const ev of data.events || []) {
      if (!ev.segs) continue;
      const t = ev.segs.map((s) => s.utf8 || '').join('').replace(/\s+/g, ' ').trim();
      if (!t || /^\[[^\]]*\]$/.test(t)) continue;
      const start = (ev.tStartMs || 0) / 1000;
      cues.push({ start, end: start + (ev.dDurationMs || 0) / 1000, text: t });
    }
    // Rolling auto-captions overlap: trim each cue to the next one's start, drop exact repeats.
    const out = [];
    for (let i = 0; i < cues.length; i++) {
      const c = cues[i];
      const next = cues[i + 1];
      if (next && c.end > next.start) c.end = Math.max(c.start + 0.2, next.start);
      const prev = out[out.length - 1];
      if (prev && prev.text === c.text) { prev.end = Math.max(prev.end, c.end); continue; }
      out.push(c);
    }
    return out;
  }

  const attempts = [];

  // One translation: a human-made track if the video has one, else YouTube's machine translation.
  async function getTranslation(tracks, track, code, via) {
    const direct =
      tracks.find((t) => t.languageCode === code && t.kind !== 'asr') ||
      tracks.find((t) => t.languageCode.startsWith(code + '-') && t.kind !== 'asr');
    let got = [];
    let how = '';
    if (direct) {
      got = await fetchJson3(direct.baseUrl);
      how = 'manual';
    }
    if (!got.length) {
      // Try the translation request even when the track does not advertise it
      got = await fetchJson3(track.baseUrl, `&tlang=${encodeURIComponent(code)}`);
      how = 'youtube-machine';
    }
    attempts.push({ lang: code, via, how, lines: got.length });
    return got.length ? { cues: got, source: how } : null;
  }

  async function fetchAll(tracks, via) {
    const track = pickTrack(tracks);
    if (!track) return { track: null, cues: [], translations: {} };
    const cues = await fetchJson3(track.baseUrl);
    if (!cues.length) {
      attempts.push({ lang: lang, via, how: 'main track', lines: 0 });
      return { track, cues: [], translations: {} };
    }
    attempts.push({ lang: lang, via, how: 'main track', lines: cues.length });
    const translations = {};
    for (const code of transLangs) {
      if (code === lang) continue;
      const got = await getTranslation(tracks, track, code, via);
      if (got) translations[code] = got;
    }
    return { track, cues, translations };
  }

  try {
    const webPr = await readPlayerResponse();
    const web = tracksOf(webPr);
    // The Android client's caption URLs currently work without a PO token, so try it first;
    // the web client's URLs are the fallback.
    let androidPr = null;
    try { androidPr = await androidPlayerResponse(); } catch (_) { /* fall through to web */ }
    const android = tracksOf(androidPr);

    const lists = [['android', android.tracks], ['web', web.tracks]].filter((x) => x[1].length);
    if (!lists.length) {
      return { ok: false, error: 'This video has no captions available.', videoId };
    }

    const known = lists[0][1];
    const available = known.map((t) => ({
      languageCode: t.languageCode,
      name: (t.name && (t.name.simpleText || (t.name.runs || []).map((r) => r.text).join(''))) || t.languageCode,
      kind: t.kind || 'manual'
    }));

    if (!pickTrack(known)) {
      return { ok: false, error: `No "${lang}" captions on this video.`, videoId, available };
    }

    let result = null;
    let resultVia = '';
    for (const entry of lists) {
      const r = await fetchAll(entry[1], entry[0]);
      if (r.cues.length) { result = r; resultVia = entry[0]; break; }
    }
    if (!result) {
      return { ok: false, error: 'YouTube returned empty captions (token required). Open the video with CC on, then retry.', videoId, available, debug: { via: '', attempts } };
    }

    // Fill any language still missing using the other client
    for (const code of transLangs) {
      if (code === lang || result.translations[code]) continue;
      for (const entry of lists) {
        if (entry[0] === resultVia) continue;
        const tr = pickTrack(entry[1]);
        if (!tr) continue;
        const got = await getTranslation(entry[1], tr, code, entry[0]);
        if (got) { result.translations[code] = got; break; }
      }
    }

    const details = (webPr && webPr.videoDetails) || (androidPr && androidPr.videoDetails) || {};
    const micro =
      (webPr && webPr.microformat && webPr.microformat.playerMicroformatRenderer) ||
      (androidPr && androidPr.microformat && androidPr.microformat.playerMicroformatRenderer) ||
      {};
    const dateRaw = String(micro.publishDate || micro.uploadDate || '');
    const lengthSec = Number(details.lengthSeconds || micro.lengthSeconds || 0);
    const info = {
      uploadDate: /^\d{4}-\d{2}-\d{2}/.test(dateRaw) ? dateRaw.slice(0, 10) : '',
      durationSec: Number.isFinite(lengthSec) && lengthSec > 0 ? lengthSec : 0,
      description: String(details.shortDescription || (micro.description && micro.description.simpleText) || ''),
      channelUrl: micro.ownerProfileUrl ? String(micro.ownerProfileUrl) : details.channelId ? 'https://www.youtube.com/channel/' + details.channelId : ''
    };
    return {
      ok: true,
      videoId,
      title: details.title || '',
      channel: details.author || '',
      info,
      lang: result.track.languageCode,
      kind: result.track.kind || 'manual',
      available,
      cues: result.cues,
      translations: result.translations,
      debug: { via: resultVia, attempts }
    };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err), videoId, debug: { via: '', attempts } };
  }
}
