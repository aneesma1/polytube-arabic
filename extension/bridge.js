// Runs on the PolyTube PWA origin. Relays requests from the page to the
// extension background and posts the answer back. Only same-window messages
// from the page itself are accepted.
(() => {
  const VERSION = chrome.runtime.getManifest().version;

  const reply = (payload) => {
    window.postMessage({ source: 'polytube-ext', ...payload }, window.location.origin);
  };

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const msg = event.data;
    if (!msg || msg.source !== 'polytube-app') return;

    if (msg.type === 'PING') {
      reply({ type: 'PONG', reqId: msg.reqId, version: VERSION });
      return;
    }

    if (msg.type === 'GET_CUES') {
      chrome.runtime
        .sendMessage({
          type: 'GET_CUES',
          videoId: String(msg.videoId || ''),
          lang: String(msg.lang || 'ar'),
          transLangs: Array.isArray(msg.transLangs) ? msg.transLangs.map(String).slice(0, 8) : []
        })
        .then((result) => reply({ type: 'CUES_RESULT', reqId: msg.reqId, ...result }))
        .catch((err) =>
          reply({ type: 'CUES_RESULT', reqId: msg.reqId, ok: false, error: String(err && err.message ? err.message : err) })
        );
    }
  });

  reply({ type: 'READY', version: VERSION });
})();
