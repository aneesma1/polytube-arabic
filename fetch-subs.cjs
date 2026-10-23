const https = require('https');
const fs = require('fs');

const tracks = JSON.parse(fs.readFileSync('tracks.json', 'utf8'));
const track = tracks.find(t => t.languageCode === 'ar' || t.languageCode === 'en');

console.log('Fetching URL:', track.baseUrl);

https.get(track.baseUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.youtube.com/watch?v=9thMVV4yM3Y'
  }
}, (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Length:', data.length);
    console.log('Preview:', data.slice(0, 500));
    fs.writeFileSync('raw-captions.xml', data);
  });
}).on('error', console.error);
