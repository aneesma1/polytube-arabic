# STATUS (live)

**RESUME POINT:** Pause-while-studying built and committed locally (not deployed). Earlier work (video details in exports, export language picker) is deployed. Next: user tests locally (install the 0.3.0 zip, open a fresh video, export), then deploy on request. Next step: user tests at http://localhost:3000, then deploy to GitHub Pages (only when the user asks).

## Current state
- App: React + Vite PWA. Extension: `extension/` (Manifest V3, version 0.2.1).
- Captions come from the extension (Android client first, web client as fallback, per language). Translations: YouTube manual track if present, else YouTube machine translation.
- Saved videos, words and sentences: IndexedDB (`src/utils/videoStore.ts`, DB v2), loaded into memory at startup; old localStorage copies are migrated once. Resume data: `src/utils/resume.ts`.
- Word cards: `SavedWord.card` is a snapshot of the pop-up (dictionary, examples, AI notes). Helpers for WhatsApp text, HTML, Markdown, Anki, CSV: `src/utils/wordCard.ts`. Pop-up has three equal buttons: Save card, Save word, Copy (WhatsApp-formatted text plus rich HTML).
- Video size slider and Fit mode (left column). Caption strip: toolbar row (nav, Translation on/off, A-/A+, speak, save); text box has fixed height per size, auto-shrinks to fit (never scrolls); Arabic and translation side by side when the strip is 760px+ wide.
- Word detail: built-in dictionary, Wiktionary (`dictionaryLookup.ts`), Tatoeba examples (`tatoebaLookup.ts`), link-out menu.
- Optional AI: `src/utils/aiProvider.ts` (provider-agnostic, key in localStorage, never in backups).
- Backup, restore, CSV and HTML exports: `src/utils/backup.ts`.

## Standing decisions (do not reverse)
- No AI features built into the app by default; AI is optional and keyed by the user.
- Never show guessed roots, patterns or meanings. Unknown means "not found" plus link-outs.
- No overlay on youtube.com (too fragile). The extension only fetches captions.
- Other dictionaries are link-outs only; no copying of their content (all rights reserved).
- Phonetics default OFF. Sentence mode default ON.
- Build policy: a save (commit) never triggers a deploy. Deploy to GitHub Pages only when the user asks (`scripts/deploy.bat`).

## Not yet tested by the user / me
- Pause while studying: pronunciation-audio and hidden-tab holds, and resume on phones (browsers may block play without a tap). Word pop-up pause/resume verified in the browser pane.
- Extension 0.3.0 reading date, duration, description from a live video through the real extension (YouTube field names verified in the page; the extension path itself not run).
- Word/print output of the new header block opened in real Word.
- Downloading each export format and opening the files; print view. (Markdown and Anki card output checked in the browser.)
- Pasting a copied card into real WhatsApp (text uses *bold*, _italic_, bullets).
- Backup/restore round trip with cards.
- Backup and restore round trip on a second browser.
- "Prepare video" with a real key (Explain works).
- Light mode on newer screens; phone layout of History tab.
- Extension multi-language fetch on 0.2.1 (extractor logic verified in-page on two videos).

## Known issues / ideas
- localStorage still holds small caches (dictionary, examples, AI answers), capped by entry count.
- Wikimedia/Tatoeba lookups have 10 s limits; on slow networks the pop-up shows an error and Save card still works.
- Offline service worker may serve an old build; Ctrl+Shift+R fixes it.
- Extension icon is a plain letter; add real icons.
- Unused libraries remain in package.json (`@google/genai`, `youtube-transcript` via server.ts); remove with the lockfile when convenient.

## Recent sessions (newest first)
- Pause while studying (`src/utils/studyPause.ts`, hold logic in `App.tsx`): video pauses while the word pop-up is open (and optionally during pronunciation audio, other dialogs, hidden tab) and resumes 2 s earlier; settings in Settings > While studying, quick switch and Play video in the pop-up. Only resumes if it was playing before.
- Export dialog language picker: tick which translation languages to export (any the video has), "+ Add language" fetches another through the extension; CSV gets one column per language (`src/utils/languages.ts` holds the 30-language list).
- Video reference details in exports (`src/utils/videoInfo.ts`): title, channel, upload date, duration, link, brief/full/no description at the top of Word, web page, print, Markdown, text, VTT; YouTube link per row in CSV and Anki (timestamp links in Word/web/Markdown); Study Deck exports and backup report/CSV too. Extension 0.3.0 returns the details; older saved videos are filled in quietly on first open.
- Extension download: `scripts/pack-extension.mjs` zips `extension/` into `public/polytube-caption-bridge.zip` on every build; install guide modal (`ExtensionInstallModal`, "..." menu, auto-opens when the extension does not answer).
- Caption strip rework (Translation toggle, no inner scroll, side-by-side) and emoji WhatsApp copy.
- Word cards (Save card / Save word / Copy), sticky pop-up header and footer, deck cards, saved words moved to IndexedDB, exports include cards, caption strip spacing and A-/A+, video size and Fit.
- Storage to IndexedDB, History tab, resume last video, slim caption strip, backup/restore and Excel/HTML exports, Tatoeba examples, dictionaries menu, dead code removed.
- Extension 0.2.x: per-language fetch with fallbacks, Captions info panel, version check.
- Optional multi-provider AI with test key, model list, retries.
- Wiktionary word detail; fake fallbacks removed.
- Translation chips, phonetics switch, export dialog rewrite.
- UI revamp: line selection, practice bar, caption display.
