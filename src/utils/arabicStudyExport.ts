/**
 * Arabic Study Export Utility
 * Generates Markdown study notes, Anki CSV flashcards, and printable PDF/HTML cheat sheets
 * for Arabic sentences, vocabulary, and linguistic roots.
 */

import { SavedSentence, SavedWord } from '../types';
import { cleanArabicWord, lookupArabicWord, transliterateArabic } from './arabic';

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * 1. Export to Markdown (.md)
 */
export function exportToMarkdown(
  sentences: SavedSentence[],
  words: SavedWord[],
  videoTitle: string = 'Arabic Immersion Session'
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let md = `# 📖 Arabic Linguistic Study Notes: ${videoTitle}\n\n`;
  md += `> **Generated on:** ${dateStr} | **App:** PolyTube Arabic Workstation\n`;
  md += `> **Total Analyzed Sentences:** ${sentences.length} | **Total Saved Vocabulary:** ${words.length}\n\n`;
  md += `---\n\n`;

  // Section 1: Vocabulary & Morphological Roots
  if (words.length > 0) {
    md += `## 🔤 Vocabulary & Morphological Roots (المفردات والجذور)\n\n`;
    md += `| الكلمة (Word) | التشكيل (Vocalized) | النطق (Phonetic) | الجذر (Root) | الوزن (Pattern) | المعنى (Translation) | سياق الجملة (Context) |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    words.forEach(w => {
      const analysis = lookupArabicWord(w.word);
      const root = w.root || analysis.root || '—';
      const pattern = analysis.pattern || '—';
      const vocalized = w.vocalized || w.word;
      const translit = w.transliteration || analysis.transliteration || transliterateArabic(w.word);
      const meaning = (w.translation || analysis.translation || '').replace(/\|/g, '/');
      const context = (w.contextSentence || '').replace(/\|/g, '/');

      md += `| **${w.word}** | ${vocalized} | \`/${translit}/\` | **${root}** | ${pattern} | ${meaning} | *${context}* |\n`;
    });

    md += `\n---\n\n`;
  }

  // Section 2: Dialogue & Syntactic Breakdown
  if (sentences.length > 0) {
    md += `## 💬 Dialogue & Syntax Breakdown (الجمل والسياق اللغوي)\n\n`;

    sentences.forEach((s, idx) => {
      const time = formatTime(s.start);
      const vocalized = s.vocalizedText || s.text;
      const translit = s.transliteration || transliterateArabic(s.text);

      md += `### ${idx + 1}. [${time}] ${vocalized}\n\n`;
      md += `- **Phonetic Pronunciation:** \`/${translit}/\`\n`;
      md += `- **Translation (Malayalam / English):** ${s.translation}\n`;

      if (s.notes) {
        md += `- **Linguistic / Cultural Insight:** ${s.notes}\n`;
      }

      // Root breakdown for content words in this sentence
      const cleanWords = s.text.split(/\s+/).map(w => cleanArabicWord(w)).filter(w => w.length > 1);
      const analyzedRoots = cleanWords
        .slice(0, 6)
        .map(w => {
          const res = lookupArabicWord(w);
          return res.root && res.root !== '—' && res.root !== 'جذر لغوي' ? `${w} (${res.root})` : null;
        })
        .filter(Boolean);

      if (analyzedRoots.length > 0) {
        md += `- **Key Roots in Line:** ${analyzedRoots.join(' • ')}\n`;
      }

      md += `\n`;
    });
  }

  md += `---\n*Exported seamlessly from PolyTube Arabic PWA Studio*\n`;
  return md;
}

/**
 * 2. Export to Anki Flashcards CSV (.csv)
 * Format suitable for instant import into Anki (Front, Back, Tags)
 */
export function exportToAnkiCsv(sentences: SavedSentence[], words: SavedWord[]): string {
  const rows: string[] = [];

  // Helper to escape CSV quotes
  const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;

  // Export Words
  words.forEach(w => {
    const analysis = lookupArabicWord(w.word);
    const root = w.root || analysis.root || '—';
    const pattern = analysis.pattern || '—';
    const vocalized = w.vocalized || w.word;
    const translit = w.transliteration || analysis.transliteration || transliterateArabic(w.word);

    const frontHtml = `<div style="font-family:'Amiri','Cairo',serif; font-size:32px; font-weight:bold; text-align:center; color:#1e293b;">${vocalized}</div><div style="text-align:center; font-family:monospace; color:#6366f1; margin-top:4px;">/${translit}/</div>`;

    const backHtml = `<div style="font-size:18px; font-weight:600; color:#0f172a; margin-bottom:8px;">${w.translation}</div><div style="font-size:14px; color:#475569; background:#f1f5f9; padding:8px; border-radius:6px;"><b>الجذر (Root):</b> <span style="font-family:'Amiri'; font-size:16px; font-weight:bold; color:#b45309;">${root}</span> &nbsp;|&nbsp; <b>الوزن (Form):</b> <span style="font-family:'Amiri';">${pattern}</span></div>${w.contextSentence ? `<div style="font-size:13px; font-style:italic; color:#64748b; margin-top:8px;">"${w.contextSentence}"</div>` : ''}`;

    rows.push(`${escapeCsv(frontHtml)},${escapeCsv(backHtml)},${escapeCsv('PolyTube::Arabic::Vocabulary')}`);
  });

  // Export Sentences
  sentences.forEach(s => {
    const vocalized = s.vocalizedText || s.text;
    const translit = s.transliteration || transliterateArabic(s.text);

    const frontHtml = `<div style="font-family:'Amiri','Cairo',serif; font-size:24px; font-weight:bold; text-align:right; direction:rtl; line-height:1.6; color:#1e293b;">${vocalized}</div><div style="text-align:left; font-family:monospace; color:#6366f1; font-size:13px; margin-top:6px;">/${translit}/</div>`;

    const backHtml = `<div style="font-size:17px; font-weight:600; color:#0f172a; margin-bottom:6px;">${s.translation}</div>${s.notes ? `<div style="font-size:13px; color:#059669; margin-top:4px;">💡 ${s.notes}</div>` : ''}<div style="font-size:11px; color:#94a3b8; margin-top:8px;">Source: ${s.videoTitle || 'Arabic Video'} @ ${formatTime(s.start)}</div>`;

    rows.push(`${escapeCsv(frontHtml)},${escapeCsv(backHtml)},${escapeCsv('PolyTube::Arabic::Sentences')}`);
  });

  return rows.join('\n');
}

/**
 * 3. Export to Printable HTML / PDF Cheat Sheet
 * Opens a beautifully formatted window styled with Cairo and Amiri fonts ready to print.
 */
export function exportToPrintableHtml(
  sentences: SavedSentence[],
  words: SavedWord[],
  videoTitle: string = 'Arabic Immersion Session'
) {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const printHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>PolyTube Arabic Study Sheet - ${videoTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800;900&family=Noto+Sans+Malayalam:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', 'Noto Sans Malayalam', sans-serif;
      color: #1e293b;
      background: #ffffff;
      padding: 24px;
      line-height: 1.6;
    }
    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      direction: ltr;
    }
    .brand { font-size: 20px; font-weight: 900; color: #e11d48; }
    .meta { font-size: 12px; color: #64748b; text-align: right; }
    h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    h2 { font-size: 18px; font-weight: 700; color: #334155; margin: 24px 0 12px 0; border-right: 4px solid #e11d48; padding-right: 8px; }
    
    .stats-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      direction: ltr;
    }
    .stat-pill {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      padding: 10px 12px;
      text-align: right;
      border: 1px solid #e2e8f0;
    }
    td {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    tr:nth-child(even) { background: #fafafa; }
    .ar-text {
      font-family: 'Amiri', serif;
      font-size: 18px;
      font-weight: bold;
      color: #0f172a;
    }
    .root-tag {
      font-family: 'Amiri', serif;
      font-weight: bold;
      color: #b45309;
      background: #fef3c7;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 14px;
      display: inline-block;
    }
    .pattern-tag {
      font-family: 'Amiri', serif;
      color: #047857;
      background: #d1fae5;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 14px;
      display: inline-block;
    }
    .sentence-card {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .sentence-ar {
      font-family: 'Amiri', serif;
      font-size: 20px;
      font-weight: bold;
      color: #0f172a;
      line-height: 1.8;
      margin-bottom: 4px;
    }
    .sentence-tr {
      font-family: monospace;
      font-size: 12px;
      color: #4f46e5;
      direction: ltr;
      text-align: left;
      margin-bottom: 4px;
    }
    .sentence-meaning {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      direction: ltr;
      text-align: left;
    }
    .sentence-note {
      font-size: 12px;
      color: #059669;
      margin-top: 4px;
      direction: ltr;
      text-align: left;
    }

    @media print {
      body { padding: 0; }
      .no-print { display: none; }
      .sentence-card { border: 1px solid #cbd5e1; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">✨ PolyTube Arabic Immersion Studio</div>
    <div class="meta">
      <div><b>Date:</b> ${dateStr}</div>
      <div><b>Video:</b> ${videoTitle}</div>
    </div>
  </div>

  <div class="no-print" style="margin-bottom: 16px; direction: ltr;">
    <button onclick="window.print()" style="background:#e11d48; color:white; border:none; padding:8px 18px; border-radius:6px; font-weight:bold; cursor:pointer; font-family:'Cairo';">
      🖨️ Print or Save as PDF
    </button>
  </div>

  <div class="stats-bar">
    <div class="stat-pill">📚 Saved Vocabulary: <b>${words.length} words</b></div>
    <div class="stat-pill">💬 Saved Sentences: <b>${sentences.length} sentences</b></div>
    <div class="stat-pill">🎯 Focus: <b>Arabic Morphology & Real Dialogue</b></div>
  </div>

  ${words.length > 0 ? `
  <h2>🔤 جدول المفردات والجذور اللغوية (Vocabulary & Roots)</h2>
  <table>
    <thead>
      <tr>
        <th>الكلمة (Word)</th>
        <th>الجذر (Root)</th>
        <th>الوزن (Pattern)</th>
        <th>المعنى (Translation)</th>
        <th>السياق (Context Sentence)</th>
      </tr>
    </thead>
    <tbody>
      ${words.map(w => {
        const analysis = lookupArabicWord(w.word);
        const root = w.root || analysis.root || '—';
        const pattern = analysis.pattern || '—';
        const vocalized = w.vocalized || w.word;
        const meaning = w.translation || analysis.translation || '';
        const context = w.contextSentence || '';
        return `
        <tr>
          <td><span class="ar-text">${vocalized}</span><br><small style="color:#64748b; font-family:monospace;">/${w.transliteration || transliterateArabic(w.word)}/</small></td>
          <td><span class="root-tag">${root}</span></td>
          <td><span class="pattern-tag">${pattern}</span></td>
          <td><b>${meaning}</b></td>
          <td><small style="color:#475569; font-family:'Amiri'; font-size:14px;">${context}</small></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
  ` : ''}

  ${sentences.length > 0 ? `
  <h2>💬 الجمل المحفوظة والتحليل التفاعلي (Analyzed Sentences)</h2>
  ${sentences.map((s, idx) => {
    const time = formatTime(s.start);
    const vocalized = s.vocalizedText || s.text;
    const translit = s.transliteration || transliterateArabic(s.text);
    return `
    <div class="sentence-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; direction:ltr;">
        <span style="font-size:11px; font-weight:bold; color:#e11d48; background:#ffe4e6; padding:2px 8px; border-radius:4px;">#${idx + 1} • [${time}]</span>
      </div>
      <div class="sentence-ar">${vocalized}</div>
      <div class="sentence-tr">/${translit}/</div>
      <div class="sentence-meaning">${s.translation}</div>
      ${s.notes ? `<div class="sentence-note">💡 <b>Linguistic Insight:</b> ${s.notes}</div>` : ''}
    </div>`;
  }).join('')}
  ` : ''}

  <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; direction: ltr;">
    Generated with PolyTube Arabic Language Studio • Master Authentic Arabic via YouTube Immersion
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }
}
