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
      const cleanLine = line.replace(/<[^>]+>/g, '').replace(/\[موسيقى\]/g, '').replace(/\[Music\]/g, '').trim();
      if (cleanLine) {
        current.text = current.text ? `${current.text} ${cleanLine}` : cleanLine;
      }
    } else if (line === '' && current) {
      if (current.text) items.push(current);
      current = null;
    }
  }
  if (current && current.text) items.push(current);
  return items;
}

function parseTimestamp(ts) {
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

const aligned = arSubs.map((ar, idx) => {
  // Collect all overlapping English subtitles
  const matched = enSubs.filter(en => (en.start < ar.end && en.end > ar.start) || Math.abs(en.start - ar.start) < 1.0);
  const enText = matched.map(m => m.text).join(' ').trim();
  return {
    id: idx + 1,
    start: ar.start,
    end: ar.end,
    ar: ar.text,
    en: enText || '—'
  };
});

fs.writeFileSync('aligned_subs.json', JSON.stringify(aligned, null, 2));
console.log(`Saved ${aligned.length} aligned subtitles.`);
console.log('Sample around 105s (01:45):');
aligned.filter(s => s.start >= 90 && s.start <= 140).forEach(s => {
  const m = Math.floor(s.start / 60);
  const sec = Math.floor(s.start % 60);
  console.log(`[${m}:${sec < 10 ? '0':''}${sec}] AR: ${s.ar}`);
  console.log(`        EN: ${s.en}`);
});
