const fs = require('fs');
const subs = JSON.parse(fs.readFileSync('aligned_subs.json', 'utf8'));

subs.slice(0, 35).forEach((s, idx) => {
  const m = Math.floor(s.start / 60);
  const sec = Math.floor(s.start % 60);
  const timeStr = `${m}:${sec < 10 ? '0' : ''}${sec}`;
  console.log(`${idx + 1}. [${timeStr}] (Start: ${s.start}s, End: ${s.end}s)`);
  console.log(`   AR: ${s.ar}`);
  console.log(`   EN: ${s.en}\n`);
});
