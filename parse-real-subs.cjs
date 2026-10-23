const fs = require('fs');

function parseVtt(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const items = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('-->')) {
      const parts = line.split('-->');
      const start = parseTimestamp(parts[0].trim());
      const end = parseTimestamp(parts[1].trim());
      current = { start, end, text: '' };
    } else if (current && line && !line.startsWith('NOTE') && !line.startsWith('WEBVTT') && !line.startsWith('Kind:') && !line.startsWith('Language:')) {
      // Remove VTT styling tags like <c.color> or <00:00:00.000>
      const cleanLine = line.replace(/<[^>]+>/g, '').replace(/\[موسيقى\]/g, '').replace(/\[Music\]/g, '').trim();
      if (cleanLine) {
        current.text = current.text ? `${current.text} ${cleanLine}` : cleanLine;
      }
    } else if (line === '' && current) {
      if (current.text) {
        items.push(current);
      }
      current = null;
    }
  }
  if (current && current.text) items.push(current);
  return items;
}

function parseTimestamp(ts) {
  // 00:01:45.800 or 01:45.800
  const parts = ts.split(':');
  let s = 0;
  if (parts.length === 3) {
    s = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
  } else if (parts.length === 2) {
    s = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return Math.round(s * 10) / 10;
}

const arSubs = parseVtt(fs.readFileSync('youtube_real_subtitles.ar.vtt', 'utf8'));
const enSubs = parseVtt(fs.readFileSync('youtube_real_subtitles.en.vtt', 'utf8'));

console.log(`Parsed ${arSubs.length} Arabic items and ${enSubs.length} English items.`);

// Show the first 20 items
console.log('\n--- First 15 Real Arabic Lines ---');
for (let i = 0; i < 15 && i < arSubs.length; i++) {
  const ar = arSubs[i];
  // Find matching English by time overlap
  const matchedEn = enSubs.find(en => Math.abs(en.start - ar.start) <= 2.5 || (en.start <= ar.end && en.end >= ar.start));
  console.log(`[${Math.floor(ar.start/60)}:${(ar.start%60 < 10 ? '0':'') + Math.floor(ar.start%60)}] ${ar.text}`);
  console.log(`   EN: ${matchedEn ? matchedEn.text : '—'}\n`);
}
