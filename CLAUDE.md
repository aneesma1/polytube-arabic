# Project instructions (PolyTube Arabic)

- Live status doc: `STATUS.md` (current state, standing decisions, untested items, RESUME POINT). Update it as you go; keep the last 5-6 sessions only.
- Local build: `npm run build` then `npm run serve` (http://localhost:3000). Type check: `npx tsc --noEmit`.
- Deploy to GitHub Pages: only when the user explicitly asks, via `scripts/deploy.bat`. A plain commit or push must not trigger a deploy.
- Commit in small units; local commits are fine at any time.
- `npm run build` repacks `extension/` into `public/polytube-caption-bridge.zip` (served as the in-app download); never edit the zip by hand.
- Extension changes require bumping `extension/manifest.json` version so the user can verify they refreshed it at chrome://extensions.
- Edits through patch scripts: avoid raw control characters and backslash-n inside strings (use explicit escapes).
