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

/**
 * 4. Generate Standalone Interactive HTML Study Deck
 * Self-contained file with embedded fonts and Web Speech API audio for offline study
 */
export function generateStudyHtml(
  sentences: SavedSentence[],
  words: SavedWord[],
  videoTitle: string = 'Arabic Immersion Session'
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PolyTube Arabic Study Guide - ${videoTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700;800;900&family=Noto+Sans+Malayalam:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #e11d48;
      --primary-hover: #be123c;
      --bg-body: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --accent: #4f46e5;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', 'Noto Sans Malayalam', system-ui, sans-serif;
      background: var(--bg-body);
      color: var(--text-main);
      padding: 30px 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
    }
    .header-card {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #ffffff;
      border-radius: 20px;
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      direction: ltr;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
    .brand {
      font-size: 22px;
      font-weight: 900;
      color: #f43f5e;
      letter-spacing: -0.5px;
    }
    .badge {
      background: rgba(244, 63, 94, 0.2);
      color: #fda4af;
      border: 1px solid rgba(244, 63, 94, 0.4);
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: bold;
    }
    .meta-info {
      font-size: 12px;
      color: #94a3b8;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 6px;
    }
    .stats-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 16px;
    }
    .stat-pill {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      color: #e2e8f0;
    }
    .section-title {
      font-size: 19px;
      font-weight: 800;
      color: #1e293b;
      margin: 28px 0 14px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      border-right: 4px solid var(--primary);
      padding-right: 12px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      margin-bottom: 14px;
      padding: 18px 20px;
      transition: transform 0.2s;
    }
    .card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .sentence-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      direction: ltr;
    }
    .timestamp {
      background: #ffe4e6;
      color: #e11d48;
      font-family: monospace;
      font-size: 11px;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .audio-btn {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #475569;
      border-radius: 8px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    }
    .audio-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
    .ar-sentence {
      font-family: 'Amiri', serif;
      font-size: 26px;
      font-weight: bold;
      color: #0f172a;
      line-height: 1.8;
      margin-bottom: 6px;
      text-align: right;
    }
    .phonetic {
      font-family: monospace;
      font-size: 13px;
      color: var(--accent);
      direction: ltr;
      text-align: left;
      margin-bottom: 6px;
    }
    .translation {
      font-size: 15px;
      font-weight: 700;
      color: #334155;
      direction: ltr;
      text-align: left;
    }
    .note-box {
      margin-top: 8px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      color: #166534;
      direction: ltr;
      text-align: left;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card-bg);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      font-size: 13px;
      margin-bottom: 24px;
    }
    th {
      background: #f8fafc;
      color: #334155;
      font-weight: 800;
      padding: 12px 14px;
      border-bottom: 2px solid var(--border);
      text-align: right;
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: #fafafa; }
    .word-ar {
      font-family: 'Amiri', serif;
      font-size: 22px;
      font-weight: bold;
      color: #0f172a;
    }
    .root-tag {
      font-family: 'Amiri', serif;
      font-weight: bold;
      color: #b45309;
      background: #fef3c7;
      border: 1px solid #fde68a;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 15px;
      display: inline-block;
    }
    .pattern-tag {
      font-family: 'Amiri', serif;
      color: #047857;
      background: #d1fae5;
      border: 1px solid #a7f3d0;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 15px;
      display: inline-block;
    }
    .footer {
      text-align: center;
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-muted);
      direction: ltr;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-card">
      <div class="header-top">
        <div class="brand">PolyTube <span style="font-family:'Amiri'; color:#fb7185;">العربية</span></div>
        <div class="badge">Standalone Offline Study Deck</div>
        <div class="meta-info">📅 ${dateStr}</div>
      </div>
      <h1>${videoTitle}</h1>
      <div class="stats-row">
        <div class="stat-pill">📚 Saved Words: <b>${words.length}</b></div>
        <div class="stat-pill">💬 Analyzed Sentences: <b>${sentences.length}</b></div>
        <div class="stat-pill">🎧 Audio Enabled (Click Listen)</div>
      </div>
    </div>

    ${words.length > 0 ? `
    <h2 class="section-title">🔤 Vocabulary & Morphological Roots (المفردات والجذور)</h2>
    <table>
      <thead>
        <tr>
          <th>الكلمة (Word)</th>
          <th>الجذر (Root)</th>
          <th>الوزن (Pattern)</th>
          <th>المعنى (Translation)</th>
          <th>سياق الجملة (Context)</th>
          <th style="direction:ltr; text-align:center;">Audio</th>
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
            <td>
              <div class="word-ar">${vocalized}</div>
              <small style="color:#64748b; font-family:monospace; direction:ltr; display:block;">/${w.transliteration || transliterateArabic(w.word)}/</small>
            </td>
            <td><span class="root-tag">${root}</span></td>
            <td><span class="pattern-tag">${pattern}</span></td>
            <td><b>${meaning}</b></td>
            <td><small style="color:#475569; font-family:'Amiri'; font-size:15px;">${context}</small></td>
            <td style="direction:ltr; text-align:center;">
              <button class="audio-btn" onclick="speak('${vocalized.replace(/'/g, "\\'")}')">
                🔊 Listen
              </button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    ` : ''}

    ${sentences.length > 0 ? `
    <h2 class="section-title">💬 Analyzed Dialogue & Sentences (الجمل المحفوظة)</h2>
    ${sentences.map((s, idx) => {
      const time = formatTime(s.start);
      const vocalized = s.vocalizedText || s.text;
      const translit = s.transliteration || transliterateArabic(s.text);
      return `
      <div class="card">
        <div class="sentence-header">
          <span class="timestamp">#${idx + 1} • [${time}]</span>
          <button class="audio-btn" onclick="speak('${vocalized.replace(/'/g, "\\'")}')">
            🔊 Pronounce Sentence
          </button>
        </div>
        <div class="ar-sentence">${vocalized}</div>
        <div class="phonetic">/${translit}/</div>
        <div class="translation">${s.translation}</div>
        ${s.notes ? `<div class="note-box">💡 <b>Insight:</b> ${s.notes}</div>` : ''}
      </div>`;
    }).join('')}
    ` : ''}

    <div class="footer">
      Generated seamlessly with <b>PolyTube Arabic Immersion Studio</b> • 100% Client-Side & Offline Ready
    </div>
  </div>

  <script>
    function speak(text) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      } else {
        alert('Web Speech API is not supported in this browser.');
      }
    }
  </script>
</body>
</html>`;
}

/**
 * 5. Export to Downloadable HTML File (.html)
 */
export function exportToHtmlFile(
  sentences: SavedSentence[],
  words: SavedWord[],
  videoTitle: string = 'Arabic Immersion Session'
) {
  const html = generateStudyHtml(sentences, words, videoTitle);
  const filename = `Arabic-Study-Session-${Date.now()}.html`;
  downloadFile(html, filename, 'text/html;charset=utf-8');
}

