# PolyTube Caption Bridge

Small Chrome/Edge extension that fetches a YouTube video's captions (with timings and
translation) and hands them to the PolyTube PWA. No overlay, no UI.

## Install (personal use, no Google approval needed)
1. Open `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
2. Click **Load unpacked** and pick this `extension/` folder.
3. Open the PWA (GitHub Pages or `http://localhost:3000`), paste a YouTube link.
   The first load opens the video in a muted background tab for a few seconds, reads the
   captions, closes the tab, and caches the cues in the PWA.

After a video is cached the extension is not needed for it again.

## Download from the app
The app offers this folder as `polytube-caption-bridge.zip` (menu, Get the caption extension). `npm run build` regenerates the zip from this folder via `scripts/pack-extension.mjs`.

## Version notes
- 0.3.0: also returns upload date, duration, description and channel link, shown at the top of exports.

## How it works
- `bridge.js` runs on the PWA origin; relays `postMessage` requests to the background.
- `background.js` finds or opens the watch page, runs `extractCues` inside it, returns cues.
- Caption sources, in order: Android-client player response (URLs work without a PO token),
  then the web page's own player response.
- The PWA side lives in `src/utils/extensionBridge.ts` and `src/utils/sentenceMerge.ts`.

## Notes
- Allowed PWA origins are listed in `manifest.json` (`content_scripts.matches`).
  Add your own if you host the PWA elsewhere. `file://` is not supported.
- YouTube can change its internal player API; if captions stop loading, `extractCues`
  in `background.js` is the only place to fix.
