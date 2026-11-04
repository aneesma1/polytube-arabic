import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fetchYouTubeSubtitles } from './youtube-server-fetcher.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Universal YouTube Subtitles & Translation Extractor
app.get('/api/youtube/subtitles', async (req, res) => {
  const videoId = req.query.videoId as string;
  const targetLang = (req.query.targetLang as string) || 'ar';
  const transLang = (req.query.transLang as string) || 'en';

  if (!videoId) {
    return res.status(400).json({ success: false, error: 'videoId query parameter is required.' });
  }

  try {
    const result = await fetchYouTubeSubtitles(videoId, targetLang, transLang);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`PolyTube full-stack server running successfully!`);
    console.log(`👉 Open in your browser: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

startServer();
