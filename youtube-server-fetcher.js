/**
 * Server-Side YouTube InnerTube Subtitle Extractor
 * Fetches native caption tracks and translated tracks for ANY YouTube video.
 */

const CHAR_MAP = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'ā', 'ء': '’', 'ؤ': '’', 'ئ': '’',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': '‘', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'ā', 'ة': 'ah',
  'َ': 'a', 'ُ': 'u', 'ِ': 'i', 'ً': 'an', 'ٌ': 'un', 'ٍ': 'in',
  'ّ': '', 'ْ': ''
};

export function transliterateArabic(text) {
  let res = '';
  for (let ch of text) {
    res += CHAR_MAP[ch] !== undefined ? CHAR_MAP[ch] : ch;
  }
  return res.replace(/\s+/g, ' ').trim();
}

export function parseXmlCues(xml) {
  const cues = [];
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  while ((match = pRegex.exec(xml)) !== null) {
    const startMs = parseInt(match[1], 10);
    const durMs = parseInt(match[2], 10);
    const rawText = match[3]
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rlm;/g, '')
      .replace(/&lrm;/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (rawText && rawText !== '[موسيقى]' && rawText !== '[Music]') {
      cues.push({
        start: Math.round(startMs / 100) / 10,
        end: Math.round((startMs + durMs) / 100) / 10,
        text: rawText
      });
    }
  }

  if (cues.length === 0) {
    const textRegex = /<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
    while ((match = textRegex.exec(xml)) !== null) {
      const start = parseFloat(match[1]);
      const dur = parseFloat(match[2]);
      const rawText = match[3]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&rlm;/g, '')
        .replace(/&lrm;/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (rawText && rawText !== '[موسيقى]' && rawText !== '[Music]') {
        cues.push({
          start: Math.round(start * 10) / 10,
          end: Math.round((start + dur) * 10) / 10,
          text: rawText
        });
      }
    }
  }

  return cues;
}

export async function fetchYouTubeSubtitles(videoId, targetLang = 'ar', transLang = 'en') {
  try {
    const resp = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)'
      },
      body: JSON.stringify({
        context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
        videoId
      })
    });

    if (!resp.ok) {
      throw new Error(`YouTube API returned HTTP ${resp.status}`);
    }

    const data = await resp.json();
    const title = data?.videoDetails?.title || `Arabic Video (${videoId})`;
    const channel = data?.videoDetails?.author || '';
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];

    if (tracks.length === 0) {
      return {
        success: false,
        videoId,
        title,
        channel,
        subtitles: [],
        error: 'No subtitles/captions are available on YouTube for this video.'
      };
    }

    // 1. Pick primary target language track (e.g. Arabic)
    let primaryTrack = tracks.find(t => t.languageCode === targetLang && !t.vssId?.startsWith('a.')) ||
                       tracks.find(t => t.languageCode === targetLang) ||
                       tracks[0];

    // 2. Pick translation track (e.g. English)
    let transTrack = tracks.find(t => t.languageCode === transLang && !t.vssId?.startsWith('a.')) ||
                     tracks.find(t => t.languageCode === transLang);

    const primaryUrl = primaryTrack.baseUrl;
    const transUrl = transTrack 
      ? transTrack.baseUrl 
      : (primaryTrack.isTranslatable ? `${primaryTrack.baseUrl}&tlang=${transLang}` : null);

    const [primaryXml, transXml] = await Promise.all([
      fetch(primaryUrl).then(r => r.text()),
      transUrl ? fetch(transUrl).then(r => r.text()).catch(() => '') : Promise.resolve('')
    ]);

    const primaryCues = parseXmlCues(primaryXml);
    const transCues = transXml ? parseXmlCues(transXml) : [];

    if (primaryCues.length === 0) {
      return {
        success: false,
        videoId,
        title,
        channel,
        subtitles: [],
        error: 'Could not extract text lines from the caption track.'
      };
    }

    const subtitles = primaryCues.map((cue, idx) => {
      let translationText = '—';
      if (transCues.length > 0) {
        const matched = transCues.filter(tc => (tc.start < cue.end && tc.end > cue.start) || Math.abs(tc.start - cue.start) < 1.0);
        if (matched.length > 0) {
          translationText = matched.map(m => m.text).join(' ').trim();
        }
      }

      return {
        id: idx + 1,
        start: cue.start,
        end: cue.end,
        text: cue.text,
        vocalizedText: cue.text,
        transliteration: transliterateArabic(cue.text),
        translation: translationText,
        notes: ''
      };
    });

    return {
      success: true,
      videoId,
      title,
      channel,
      subtitles
    };
  } catch (err) {
    return {
      success: false,
      videoId,
      title: `YouTube Video (${videoId})`,
      channel: '',
      subtitles: [],
      error: err.message || 'Failed to fetch subtitles'
    };
  }
}
