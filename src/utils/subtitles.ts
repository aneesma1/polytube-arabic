import { SubtitleItem } from '../types';

/**
 * Format seconds to SRT timestamp: 00:01:24,500
 */
export function toSrtTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  const pad = (n: number, z = 2) => n.toString().padStart(z, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(millis, 3)}`;
}

/**
 * Format seconds to VTT timestamp: 00:01:24.500
 */
export function toVttTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  const pad = (n: number, z = 2) => n.toString().padStart(z, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(millis, 3)}`;
}

/**
 * Generate SRT file content
 * @param subtitles list of items
 * @param mode 'dual' | 'target' | 'native'
 * @param useTashkeel whether to use vocalized Arabic if available
 */
export function generateSrt(
  subtitles: SubtitleItem[],
  mode: 'dual' | 'target' | 'native' = 'dual',
  useTashkeel: boolean = true
): string {
  return subtitles
    .map((item, index) => {
      const start = toSrtTimestamp(item.start);
      const end = toSrtTimestamp(item.end);
      const target = (useTashkeel && item.vocalizedText) ? item.vocalizedText : item.text;
      
      let textContent = '';
      if (mode === 'dual') {
        textContent = `${target}\n${item.translation}`;
      } else if (mode === 'target') {
        textContent = target;
      } else {
        textContent = item.translation;
      }

      return `${index + 1}\n${start} --> ${end}\n${textContent}\n`;
    })
    .join('\n');
}

/**
 * Generate WebVTT file content
 */
export function generateVtt(
  subtitles: SubtitleItem[],
  mode: 'dual' | 'target' | 'native' = 'dual',
  useTashkeel: boolean = true
): string {
  const body = subtitles
    .map((item, index) => {
      const start = toVttTimestamp(item.start);
      const end = toVttTimestamp(item.end);
      const target = (useTashkeel && item.vocalizedText) ? item.vocalizedText : item.text;

      let textContent = '';
      if (mode === 'dual') {
        textContent = `${target}\n${item.translation}`;
      } else if (mode === 'target') {
        textContent = target;
      } else {
        textContent = item.translation;
      }

      return `${index + 1}\n${start} --> ${end}\n${textContent}\n`;
    })
    .join('\n');

  return `WEBVTT\n\n${body}`;
}

/**
 * Generate Side-by-Side Dual Column Table (CSV / TSV)
 */
export function generateSideBySideCsv(
  subtitles: SubtitleItem[],
  delimiter: ',' | '\t' = ','
): string {
  const headers = ['Index', 'Start Time', 'End Time', 'Target Text', 'Transliteration', 'Native Translation'];
  const rows = subtitles.map((item, idx) => {
    const start = toSrtTimestamp(item.start);
    const end = toSrtTimestamp(item.end);
    const target = item.vocalizedText || item.text;
    const translit = item.transliteration || '';
    const translation = item.translation;

    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    return [
      idx + 1,
      start,
      end,
      escape(target),
      escape(translit),
      escape(translation),
    ].join(delimiter);
  });

  return [headers.join(delimiter), ...rows].join('\n');
}

/**
 * Generate Line-by-Line Interlinear Format (Text / Markdown)
 */
export function generateLineByLineMarkdown(
  subtitles: SubtitleItem[],
  videoTitle: string = 'Video Dialogue'
): string {
  let md = `# ${videoTitle}\n\n`;
  md += `*Exported from LingoTube Web - Interlinear Study Sheet*\n\n---\n\n`;

  subtitles.forEach((item, idx) => {
    const target = item.vocalizedText || item.text;
    md += `### Sentence ${idx + 1} [${toSrtTimestamp(item.start)} - ${toSrtTimestamp(item.end)}]\n\n`;
    md += `**Target:** ${target}\n\n`;
    if (item.transliteration) {
      md += `*Phonetics:* ${item.transliteration}\n\n`;
    }
    md += `**Translation:** ${item.translation}\n\n`;
    if (item.notes) {
      md += `> Note: ${item.notes}\n\n`;
    }
    md += `---\n\n`;
  });

  return md;
}

/**
 * Generate Side-by-Side Dual Subtitle Table in Markdown (.md)
 */
export function generateSideBySideMarkdown(
  subtitles: SubtitleItem[],
  videoTitle: string = 'Video Dialogue'
): string {
  let md = `# ${videoTitle}\n\n`;
  md += `*LingoTube - Side-by-Side Dual Subtitle Table*\n\n`;
  md += `| # | Timestamp | Target Text (Arabic) | Pronunciation / Phonetics | Translation |\n`;
  md += `| :---: | :---: | :---: | :--- | :--- |\n`;

  subtitles.forEach((item, idx) => {
    const time = `${toSrtTimestamp(item.start).slice(3, 8)} - ${toSrtTimestamp(item.end).slice(3, 8)}`;
    const target = (item.vocalizedText || item.text).replace(/\|/g, '-');
    const phonetics = (item.transliteration || '').replace(/\|/g, '-');
    const translation = item.translation.replace(/\|/g, '-');

    md += `| ${idx + 1} | \`${time}\` | **${target}** | *${phonetics}* | ${translation} |\n`;
  });

  return md;
}

/**
 * Generate Microsoft Word Document (.doc / .docx compatible HTML package)
 */
export function generateWordDoc(
  subtitles: SubtitleItem[],
  videoTitle: string,
  format: 'side-by-side' | 'line-by-line'
): string {
  const isArabic = true;
  let bodyContent = '';

  if (format === 'side-by-side') {
    bodyContent += `
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Calibri, Arial, sans-serif;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="width: 6%; text-align: center;">#</th>
            <th style="width: 14%; text-align: center;">Timestamp</th>
            <th style="width: 40%; text-align: right; direction: rtl; font-family: 'Amiri', 'Traditional Arabic', serif;">النص العربي</th>
            <th style="width: 40%;">Translation & Notes</th>
          </tr>
        </thead>
        <tbody>
    `;

    subtitles.forEach((item, idx) => {
      const time = `${toSrtTimestamp(item.start).slice(3, 8)} - ${toSrtTimestamp(item.end).slice(3, 8)}`;
      const target = item.vocalizedText || item.text;
      const phonetics = item.transliteration ? `<div style="color: #4f46e5; font-size: 11pt; margin-top: 4px;"><em>${item.transliteration}</em></div>` : '';
      const notes = item.notes ? `<div style="color: #64748b; font-size: 10pt; margin-top: 4px;">Note: ${item.notes}</div>` : '';

      bodyContent += `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="text-align: center; vertical-align: top; color: #64748b; font-weight: bold;">${idx + 1}</td>
          <td style="text-align: center; vertical-align: top; font-family: monospace; font-size: 10pt; color: #334155;">${time}</td>
          <td style="text-align: right; direction: rtl; vertical-align: top; font-size: 16pt; line-height: 1.8; font-family: 'Amiri', 'Traditional Arabic', Arial, serif; font-weight: bold; color: #0f172a;">
            ${target}
            ${phonetics}
          </td>
          <td style="vertical-align: top; font-size: 11pt; line-height: 1.5; color: #1e293b;">
            <strong>${item.translation}</strong>
            ${notes}
          </td>
        </tr>
      `;
    });

    bodyContent += `</tbody></table>`;
  } else {
    // Line-by-line Study Sheet
    subtitles.forEach((item, idx) => {
      const time = `${toSrtTimestamp(item.start).slice(3, 8)} - ${toSrtTimestamp(item.end).slice(3, 8)}`;
      const target = item.vocalizedText || item.text;
      const phonetics = item.transliteration ? `<div style="color: #4f46e5; font-size: 12pt; margin: 4px 0;"><em>${item.transliteration}</em></div>` : '';
      const notes = item.notes ? `<div style="color: #64748b; font-size: 10pt; margin-top: 6px; padding: 4px 8px; background: #f1f5f9; border-left: 3px solid #6366f1;">Note: ${item.notes}</div>` : '';

      bodyContent += `
        <div style="margin-bottom: 20px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <div style="font-size: 10pt; color: #64748b; font-family: monospace; margin-bottom: 6px;">#${idx + 1} • [${time}]</div>
          <div style="direction: rtl; text-align: right; font-size: 18pt; line-height: 1.8; font-family: 'Amiri', 'Traditional Arabic', serif; font-weight: bold; color: #0f172a;">
            ${target}
          </div>
          ${phonetics}
          <div style="font-size: 12pt; color: #1e293b; margin-top: 6px; font-weight: 500;">
            ${item.translation}
          </div>
          ${notes}
        </div>
      `;
    });
  }

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${videoTitle}</title>
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-family: 'Segoe UI', Calibri, Arial, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 20px;
        }
        h1 {
          font-size: 18pt;
          color: #0f172a;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
          margin-bottom: 4px;
        }
        .subtitle {
          color: #64748b;
          font-size: 10pt;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <h1>${videoTitle}</h1>
      <div class="subtitle">Generated by LingoTube Studio • Format: ${format === 'side-by-side' ? 'Side-by-Side Table' : 'Line-by-Line Study Sheet'}</div>
      ${bodyContent}
    </body>
    </html>
  `;
}

/**
 * Generate Standalone HTML Study Guide (.html format)
 * Responsive HTML file with Cairo and Amiri fonts, Web Speech audio, and interactive cards.
 */
export function generateHtmlStudyGuide(subtitles: SubtitleItem[], videoTitle: string): string {
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
  <title>${videoTitle} - PolyTube Arabic Study Guide</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800;900&family=Noto+Sans+Malayalam:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #e11d48;
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --accent: #4f46e5;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', 'Noto Sans Malayalam', sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 30px 16px;
      line-height: 1.6;
    }
    .container { max-width: 960px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #fff;
      padding: 24px 28px;
      border-radius: 20px;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      direction: ltr;
    }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .brand { font-size: 20px; font-weight: 900; color: #f43f5e; }
    .meta { font-size: 12px; color: #94a3b8; }
    h1 { font-size: 22px; font-weight: 800; color: #f8fafc; }
    .badge {
      display: inline-block;
      margin-top: 10px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 9999px;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 600;
      color: #fca5a5;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      direction: ltr;
    }
    .time {
      font-family: monospace;
      font-size: 11px;
      font-weight: 700;
      color: #e11d48;
      background: #ffe4e6;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .listen-btn {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
    }
    .listen-btn:hover { background: #e2e8f0; color: #0f172a; }
    .ar {
      font-family: 'Amiri', serif;
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.8;
      text-align: right;
    }
    .tr {
      font-family: monospace;
      font-size: 12px;
      color: var(--accent);
      direction: ltr;
      text-align: left;
      margin-top: 4px;
    }
    .meaning {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      direction: ltr;
      text-align: left;
      margin-top: 4px;
    }
    .note {
      font-size: 12px;
      color: #059669;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 6px 10px;
      border-radius: 6px;
      margin-top: 8px;
      direction: ltr;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-top">
        <div class="brand">PolyTube <span style="font-family:'Amiri'; color:#fb7185;">العربية</span></div>
        <div class="meta">📅 ${dateStr}</div>
      </div>
      <h1>${videoTitle}</h1>
      <span class="badge">Total Subtitles: ${subtitles.length} • Audio Enabled (Click Listen)</span>
    </div>

    ${subtitles.map((item, idx) => {
      const time = `${toSrtTimestamp(item.start).slice(3, 8)} - ${toSrtTimestamp(item.end).slice(3, 8)}`;
      const target = item.vocalizedText || item.text;
      return `
      <div class="card">
        <div class="card-top">
          <span class="time">#${idx + 1} • [${time}]</span>
          <button class="listen-btn" onclick="speak('${target.replace(/'/g, "\\'")}')">🔊 Listen</button>
        </div>
        <div class="ar">${target}</div>
        ${item.transliteration ? `<div class="tr">/${item.transliteration}/</div>` : ''}
        <div class="meaning">${item.translation}</div>
        ${item.notes ? `<div class="note">💡 <b>Insight:</b> ${item.notes}</div>` : ''}
      </div>`;
    }).join('')}
  </div>

  <script>
    function speak(text) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ar-SA';
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
      }
    }
  </script>
</body>
</html>`;
}


/**
 * Generate Anki Flashcards Deck (.tsv format)
 * Front: Target Sentence (with optional audio hint)
 * Back: Translation + Transliteration + Context
 */
export function generateAnkiDeck(subtitles: SubtitleItem[], videoTitle: string): string {
  const rows = subtitles.map(item => {
    const target = item.vocalizedText || item.text;
    const translit = item.transliteration ? `<br><small style="color:#666;">[${item.transliteration}]</small>` : '';
    const front = `${target}${translit}`;
    const back = `<b>${item.translation}</b><br><hr><small>Video: ${videoTitle} (${toSrtTimestamp(item.start)})</small>`;
    return `${front}\t${back}\t"lingotube"`;
  });

  return `#separator:tab\n#html:true\n#tags column:3\n${rows.join('\n')}`;
}

/**
 * Browser file download helper
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Robust parser for user-uploaded .srt and .vtt files
 * Supports UTF-8 with/without BOM, WebVTT formatting, HTML tag stripping, and dual-track lines.
 */
export function parseSrtFile(content: string): SubtitleItem[] {
  if (!content || !content.trim()) return [];

  // Strip UTF-8 Byte Order Mark (BOM) and normalize line endings
  let cleanContent = content
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Strip WebVTT signature header if present
  cleanContent = cleanContent.replace(/^WEBVTT[^\n]*\n+/i, '');

  const blocks = cleanContent.split(/\n\s*\n/);
  const items: SubtitleItem[] = [];
  let idCounter = 1;

  for (const block of blocks) {
    const rawLines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (rawLines.length < 2) continue;

    let timeLineIdx = 0;
    // Check if line 0 is numeric index and line 1 is timestamp
    if (!rawLines[0].includes('-->') && rawLines.length > 1 && rawLines[1].includes('-->')) {
      timeLineIdx = 1;
    }

    const timeLine = rawLines[timeLineIdx];
    if (!timeLine || !timeLine.includes('-->')) continue;

    const [startStr, endStr] = timeLine.split('-->').map(s => s.trim().split(' ')[0]);
    const parseTime = (t: string): number => {
      const parts = t.replace(',', '.').split(':');
      if (parts.length === 3) {
        return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
      } else if (parts.length === 2) {
        return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
      }
      return 0;
    };

    const start = parseTime(startStr);
    const end = parseTime(endStr);
    if (isNaN(start) || isNaN(end) || end <= start) continue;

    // Extract text lines and strip HTML/formatting tags like <i>, <b>, <font>, <c.color>
    const textLines = rawLines
      .slice(timeLineIdx + 1)
      .map(line => line.replace(/<[^>]*>/g, '').trim())
      .filter(Boolean);

    if (textLines.length === 0) continue;

    // Detect if lines contain dual translation (e.g. line 1 Arabic/target, line 2 English translation)
    let target = textLines[0];
    let translation = '';

    if (textLines.length >= 2) {
      target = textLines[0];
      translation = textLines.slice(1).join(' ');
    } else {
      translation = '';
    }

    // Check if target is Arabic
    const isArabic = /[\u0600-\u06FF]/.test(target);

    items.push({
      id: idCounter++,
      start: parseFloat(start.toFixed(2)),
      end: parseFloat(end.toFixed(2)),
      text: target,
      vocalizedText: target,
      translation: translation || (isArabic ? '—' : target),
      transliteration: '',
    });
  }

  return items;
}
