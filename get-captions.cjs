const https = require('https');
const fs = require('fs');

const url = 'https://www.youtube.com/watch?v=9thMVV4yM3Y';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'ar,en;q=0.9'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const idx = data.indexOf('"captionTracks":');
    if (idx !== -1) {
      const rest = data.slice(idx + 16);
      let depth = 0;
      let endIdx = 0;
      for (let i = 0; i < rest.length; i++) {
        if (rest[i] === '[') depth++;
        if (rest[i] === ']') {
          depth--;
          if (depth === 0) {
            endIdx = i + 1;
            break;
          }
        }
      }
      const jsonStr = rest.slice(0, endIdx);
      try {
        const tracks = JSON.parse(jsonStr);
        console.log('Available Caption Tracks:');
        tracks.forEach(t => {
          console.log(`- Lang: ${t.languageCode}, Name: ${t.name?.simpleText || t.name?.runs?.[0]?.text}, URL: ${t.baseUrl}`);
        });
        fs.writeFileSync('tracks.json', JSON.stringify(tracks, null, 2));
      } catch (e) {
        console.error('JSON parse error:', e.message);
      }
    } else {
      console.log('captionTracks string not found in HTML.');
    }
  });
}).on('error', err => console.error(err));
