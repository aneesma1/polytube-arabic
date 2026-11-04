const fs = require('fs');
const path = require('path');

const charMap = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'ā', 'ء': '’', 'ؤ': '’', 'ئ': '’',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': '‘', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'ā', 'ة': 'ah',
  'َ': 'a', 'ُ': 'u', 'ِ': 'i', 'ً': 'an', 'ٌ': 'un', 'ٍ': 'in',
  'ّ': '', 'ْ': ''
};

function transliterate(text) {
  let res = '';
  for (let ch of text) {
    res += charMap[ch] !== undefined ? charMap[ch] : ch;
  }
  return res.replace(/\s+/g, ' ').trim();
}

function cleanText(t) {
  if (!t) return '';
  return t.replace(/&rlm;/g, '').replace(/&lrm;/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

const baseDir = path.resolve(__dirname, '..');
const raw30 = JSON.parse(fs.readFileSync(path.join(baseDir, 'new_curated_subtitles.json'), 'utf8'));
const aligned = JSON.parse(fs.readFileSync(path.join(baseDir, 'aligned_subs.json'), 'utf8'));

// Read dictionary from arabic.ts
const arabicContent = fs.readFileSync(path.join(baseDir, 'src/utils/arabic.ts'), 'utf8');
const entries = {};
const regex = /'([^']+)':\s*\{\s*root:\s*'([^']+)',\s*pattern:\s*'([^']*)',\s*translation:\s*'([^']*)'/g;
let m;
while ((m = regex.exec(arabicContent)) !== null) {
  entries[m[1]] = { root: m[2], meaning: m[4] };
}

const remainingAligned = aligned.filter(a => a.start >= 260.0);

const fullSubtitles = [];

// 1. Add curated first 30
raw30.forEach((item, idx) => {
  fullSubtitles.push({
    id: idx + 1,
    start: item.start,
    end: item.end,
    text: item.text,
    vocalizedText: item.vocalizedText || item.text,
    transliteration: item.transliteration || transliterate(item.text),
    translation: item.translation,
    notes: item.notes || '',
    rootWords: item.rootWords || []
  });
});

// 2. Add all subsequent subtitles up to end of video
let nextId = 31;
remainingAligned.forEach(a => {
  const ar = cleanText(a.ar);
  if (!ar || ar === 'sinel') return;
  const en = cleanText(a.en) || '—';
  const translit = transliterate(ar);

  // Extract root words if present in dictionary
  const words = ar.replace(/[\u064B-\u065F\u0670،.؟!:;"'(){}\[\]]/g, '').split(/\s+/);
  const foundRoots = [];
  const seenRoots = new Set();
  words.forEach(w => {
    if (entries[w] && entries[w].root !== '—' && !seenRoots.has(entries[w].root)) {
      seenRoots.add(entries[w].root);
      foundRoots.push({ word: w, root: entries[w].root, meaning: entries[w].meaning.split('/')[0].trim() });
    }
  });

  fullSubtitles.push({
    id: nextId++,
    start: a.start,
    end: a.end,
    text: ar,
    vocalizedText: ar,
    transliteration: translit,
    translation: en,
    notes: 'Ahmad Al-Shugairi Hajj Episode (Seen 3).',
    rootWords: foundRoots.slice(0, 3)
  });
});

console.log('Total full subtitles:', fullSubtitles.length);
console.log('Subtitle at 550s (09:10):', fullSubtitles.find(s => 550 >= s.start && 550 <= s.end));

// Save full subtitles
fs.writeFileSync(path.join(baseDir, 'full_curated_subtitles.json'), JSON.stringify(fullSubtitles, null, 2), 'utf8');

// Update curatedVideos.ts
const curatedPath = path.join(baseDir, 'src/data/curatedVideos.ts');
let curatedContent = fs.readFileSync(curatedPath, 'utf8');

const startMarker = "subtitles: [";
const endMarker = "},\n  {\n    id: 'arabic-story-1',";

const startIndex = curatedContent.indexOf(startMarker);
const endIndex = curatedContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found in curatedVideos.ts:', { startIndex, endIndex });
  process.exit(1);
}

const before = curatedContent.substring(0, startIndex + startMarker.length);
const after = curatedContent.substring(endIndex);

const formattedSubtitles = fullSubtitles.map(s => {
  return `      {
        id: ${s.id},
        start: ${s.start},
        end: ${s.end},
        text: ${JSON.stringify(s.text)},
        vocalizedText: ${JSON.stringify(s.vocalizedText)},
        transliteration: ${JSON.stringify(s.transliteration)},
        translation: ${JSON.stringify(s.translation)},
        notes: ${JSON.stringify(s.notes)},
        rootWords: ${JSON.stringify(s.rootWords)}
      }`;
}).join(',\n');

const newCuratedContent = before + '\n' + formattedSubtitles + '\n    ]\n  ' + after;
fs.writeFileSync(curatedPath, newCuratedContent, 'utf8');
console.log('✓ Updated curatedVideos.ts with all', fullSubtitles.length, 'subtitles spanning the full video duration.');
