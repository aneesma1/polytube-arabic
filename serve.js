/**
 * Zero-dependency lightweight HTTP server for testing PolyTube.
 * Serves on http://localhost:3000 with proper HTTP Origin & Referrer headers,
 * allowing YouTube embedded playback without "Error 153".
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { fetchYouTubeSubtitles } from './youtube-server-fetcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  // Common security & embed headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  // Handle API routes - never serve HTML for /api/
  if (reqPath.startsWith('/api/')) {
    if (reqPath.startsWith('/api/health')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', llmAvailable: true, liveStatus: 'verified' }));
      return;
    }

    if (reqPath.startsWith('/api/youtube/subtitles')) {
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
      const videoId = urlObj.searchParams.get('videoId');
      const targetLang = urlObj.searchParams.get('targetLang') || 'ar';
      const transLang = urlObj.searchParams.get('transLang') || 'en';

      if (!videoId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'videoId is required' }));
        return;
      }

      fetchYouTubeSubtitles(videoId, targetLang, transLang)
        .then(result => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        })
        .catch(err => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message || 'Server error' }));
        });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint handled by offline SLA client engine' }));
    return;
  }

  let filePath = path.join(DIST_DIR, reqPath);

  // If path doesn't exist in dist, try root or fallback to index.html for SPA routing
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading ' + reqPath);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log('\n======================================================');
  console.log('PolyTube Standalone HTTP Server Running!');
  console.log(`Embedded YouTube & Dual Subtitles Active at: ${url}`);
  console.log('======================================================\n');

  // Automatically launch browser on Windows
  exec(`start ${url}`);
});
