# PolyTube Arabic (بولي تيوب العربية)

A web app (installable PWA) for learning Arabic from YouTube videos: dual subtitles, click-a-word dictionary, line looping, and study exports.

## How it works
- **The app** plays the video with YouTube's own embedded player and shows synced Arabic lines with translations.
- **The Chrome extension** (`extension/`) fetches a video's captions and YouTube translations and hands them to the app. Load it once: `chrome://extensions`, Developer mode, Load unpacked, pick the `extension` folder. After that, paste any YouTube link in the app.
- **Saved videos** are kept in the browser (IndexedDB) and open instantly from the History tab. The app reopens your last video and position.

## Main features
- Language chips (Malayalam, English, and 30 more), phonetics on/off, sentence mode.
- Select several lines and loop them, with repeat count, gap and slower repeats.
- Word pop-up: built-in meaning, Wiktionary, Tatoeba example sentences, a menu of other dictionaries.
- Export dialog (SRT, VTT, Word, web page, Anki, CSV, Markdown, text), and backup/restore plus Excel and web-page exports in Settings.
- Optional AI (Gemini, Groq, OpenRouter, Mistral, Cerebras or any OpenAI-compatible service): explain a word, and "Prepare video" for vowel marks and phonetics. The app works without it.

## Run locally
```
npm install
npm run build
npm run serve      # http://localhost:3000
```
Or double-click `start-app.bat` in the parent folder.

## Notes
- Your AI key stays in your browser. Backups never include it.
- If the app looks out of date after an update, hard-reload with Ctrl+Shift+R (the offline service worker can keep an old copy).
- Project status and next steps: see `STATUS.md`.
