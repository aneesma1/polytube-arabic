import { SubtitleItem, VideoInfo } from '../types';
import { removeTashkeel } from './arabic';
import { toSrtTimestamp, toVttTimestamp } from './subtitles';
import { DescriptionMode, descriptionFor, infoRows, watchUrl } from './videoInfo';
import { LANG_LABELS } from './languages';

export interface ExportOptions {
  arabic: boolean;
  vowels: boolean;
  phonetics: boolean;
  translation: boolean;
  /** How much of the video description goes in the reference block */
  description: DescriptionMode;
  /** Translation languages to export, in order. Unset means whatever is shown on screen. */
  langs?: string[];
}

export type ExportFormat = 'srt' | 'vtt' | 'print' | 'doc' | 'html' | 'anki' | 'csv' | 'md' | 'txt';

export interface FormatInfo {
  id: ExportFormat;
  label: string;
  group: 'Subtitles' | 'Study sheet' | 'Flashcards' | 'Notes';
  ext: string;
  mime: string;
}

export const FORMATS: FormatInfo[] = [
  { id: 'srt', label: 'SRT', group: 'Subtitles', ext: 'srt', mime: 'text/plain;charset=utf-8' },
  { id: 'vtt', label: 'VTT', group: 'Subtitles', ext: 'vtt', mime: 'text/vtt;charset=utf-8' },
  { id: 'print', label: 'Print / PDF', group: 'Study sheet', ext: 'html', mime: 'text/html;charset=utf-8' },
  { id: 'doc', label: 'Word', group: 'Study sheet', ext: 'doc', mime: 'application/msword;charset=utf-8' },
  { id: 'html', label: 'Web page', group: 'Study sheet', ext: 'html', mime: 'text/html;charset=utf-8' },
  { id: 'anki', label: 'Anki', group: 'Flashcards', ext: 'tsv', mime: 'text/tab-separated-values;charset=utf-8' },
  { id: 'csv', label: 'CSV', group: 'Flashcards', ext: 'csv', mime: 'text/csv;charset=utf-8' },
  { id: 'md', label: 'Markdown', group: 'Notes', ext: 'md', mime: 'text/markdown;charset=utf-8' },
  { id: 'txt', label: 'Text', group: 'Notes', ext: 'txt', mime: 'text/plain;charset=utf-8' },
];

const clock = (t: number) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

/** The text lines to show for one subtitle under the chosen options. */
function parts(sub: SubtitleItem, o: ExportOptions): { arabic: string; phonetic: string; translation: string } {
  const source = sub.vocalizedText || sub.text;
  return {
    arabic: o.arabic ? (o.vowels ? source : removeTashkeel(source)) : '',
    phonetic: o.phonetics ? sub.transliteration || '' : '',
    translation: o.translation ? translationText(sub, o) : '',
  };
}

/** Translation text for one line: the chosen languages when picked, else what is shown on screen. */
function translationText(sub: SubtitleItem, o: ExportOptions): string {
  if (o.langs && o.langs.length > 0 && sub.translations) {
    return o.langs.map(c => sub.translations?.[c]).filter((t): t is string => !!t && t.trim().length > 0).join('\n');
  }
  return sub.translation && sub.translation !== '—' ? sub.translation : '';
}

function lines(sub: SubtitleItem, o: ExportOptions): string[] {
  const p = parts(sub, o);
  return [p.arabic, p.phonetic ? `/${p.phonetic}/` : '', ...p.translation.split('\n')].filter(l => l.trim().length > 0);
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const csvCell = (s: string) => `"${s.replace(/"/g, '""')}"`;

function srt(subs: SubtitleItem[], o: ExportOptions): string {
  return subs
    .map((s, i) => `${i + 1}\n${toSrtTimestamp(s.start)} --> ${toSrtTimestamp(s.end)}\n${lines(s, o).join('\n')}\n`)
    .join('\n');
}

/** Reference lines as plain text, one per line (no blank lines, no arrow, so it is safe in a VTT NOTE). */
function plainRef(info: VideoInfo, mode: DescriptionMode): string[] {
  const out = [info.title, ...infoRows(info).map(r => `${r.label}: ${r.value}`)];
  const d = descriptionFor(info, mode).replace(/\n+/g, ' ').replace(/-->/g, '->');
  if (d) out.push(`Description: ${d}`);
  return out;
}

function vtt(subs: SubtitleItem[], o: ExportOptions, info: VideoInfo): string {
  const body = subs
    .map(s => `${toVttTimestamp(s.start)} --> ${toVttTimestamp(s.end)}\n${lines(s, o).join('\n')}\n`)
    .join('\n');
  return `WEBVTT\n\nNOTE\n${plainRef(info, o.description).join('\n')}\n\n${body}`;
}

function txt(subs: SubtitleItem[], o: ExportOptions, info: VideoInfo): string {
  const head = [info.title, ...infoRows(info).map(r => `${r.label}: ${r.value}`)];
  const d = descriptionFor(info, o.description);
  if (d) head.push('', d);
  const body = subs.map(s => `[${clock(s.start)}]\n${lines(s, o).join('\n')}\n`).join('\n');
  return `${head.join('\n')}\n\n${'-'.repeat(40)}\n\n${body}`;
}

function md(subs: SubtitleItem[], o: ExportOptions, info: VideoInfo): string {
  const body = subs
    .map(s => {
      const p = parts(s, o);
      let out = `### [${clock(s.start)}](${watchUrl(info.videoId, s.start)})\n`;
      if (p.arabic) out += `**${p.arabic}**\n\n`;
      if (p.phonetic) out += `\`/${p.phonetic}/\`\n\n`;
      if (p.translation) out += `${p.translation.split('\n').join('  \n')}\n`;
      return out;
    })
    .join('\n');
  const refs = infoRows(info).map(r => `- **${r.label}:** ${r.href ? `[${r.value}](${r.href})` : r.value}`);
  const d = descriptionFor(info, o.description);
  const quote = d ? `\n${d.split('\n').map(l => `> ${l}`.trimEnd()).join('\n')}\n` : '';
  return `# ${info.title}\n\n${refs.join('\n')}\n${quote}\n---\n\n${body}`;
}

function csv(subs: SubtitleItem[], o: ExportOptions, info: VideoInfo): string {
  // One column per chosen language when several are picked; otherwise a single Translation column
  const langCols = o.translation && o.langs && o.langs.length > 1 && subs.some(s => s.translations) ? o.langs : null;
  const header = ['Time', 'Arabic', 'Phonetic', ...(langCols ? langCols.map(c => `Translation (${LANG_LABELS[c] ?? c})`) : ['Translation']), 'YouTube link'].map(csvCell).join(',');
  const rows = subs.map(s => {
    const p = parts(s, o);
    const tr = langCols ? langCols.map(c => (s.translations?.[c] ?? '').replace(/\n/g, ' / ')) : [p.translation.replace(/\n/g, ' / ')];
    return [clock(s.start), p.arabic, p.phonetic, ...tr, watchUrl(info.videoId, s.start)].map(csvCell).join(',');
  });
  return '﻿' + [header, ...rows].join('\r\n');
}

function anki(subs: SubtitleItem[], o: ExportOptions, info: VideoInfo): string {
  return subs
    .map(s => {
      const p = parts(s, o);
      const front = p.arabic || p.translation.replace(/\n/g, ' / ');
      const back = [p.phonetic ? `/${p.phonetic}/` : '', p.arabic ? p.translation.replace(/\n/g, '<br>') : '']
        .filter(Boolean)
        .join('<br>');
      return `${front.replace(/\t/g, ' ')}\t${back.replace(/\t/g, ' ')}\t${clock(s.start)}\t${watchUrl(info.videoId, s.start)}`;
    })
    .join('\n');
}

/** Reference block for the web-style exports: linked title, details table, description. */
function sheetHeader(info: VideoInfo, mode: DescriptionMode): string {
  const rows = infoRows(info)
    .map(r => `<tr><th>${esc(r.label)}</th><td>${r.href ? `<a href="${esc(r.href)}">${esc(r.value)}</a>` : esc(r.value)}</td></tr>`)
    .join('');
  const d = descriptionFor(info, mode);
  return `<h1><a href="${watchUrl(info.videoId)}">${esc(info.title)}</a></h1><table class="info">${rows}</table>${d ? `<blockquote dir="auto">${esc(d)}</blockquote>` : ''}`;
}

function sheetHtml(subs: SubtitleItem[], o: ExportOptions, info: VideoInfo, forWord: boolean): string {
  const title = info.title;
  const rows = subs
    .map(s => {
      const p = parts(s, o);
      return `<tr>
<td class="t"><a href="${watchUrl(info.videoId, s.start)}">${clock(s.start)}</a></td>
<td class="a" dir="rtl">${esc(p.arabic)}${p.phonetic ? `<div class="p">/${esc(p.phonetic)}/</div>` : ''}</td>
<td class="m">${esc(p.translation).replace(/\n/g, '<br>')}</td>
</tr>`;
    })
    .join('\n');
  const head = forWord
    ? '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8">'
    : '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
  return `${head}<title>${esc(title)}</title>
<style>
body{font-family:Segoe UI,Arial,sans-serif;margin:24px;color:#111}
h1{font-size:20px;margin:0 0 14px}
table{border-collapse:collapse;width:100%}
td{border-bottom:1px solid #ddd;padding:8px;vertical-align:top}
.t{width:48px;color:#666;font-size:12px;white-space:nowrap}
.t a{color:#666;text-decoration:none}
h1 a{color:inherit;text-decoration:none}
table.info{width:auto;margin:0 0 10px}
table.info th{text-align:left;color:#666;font-weight:600;font-size:13px;padding:3px 14px 3px 0;border:0;white-space:nowrap}
table.info td{font-size:13px;padding:3px 0;border:0}
blockquote{margin:8px 0 18px;padding:6px 12px;border-left:3px solid #c7d2fe;color:#444;font-size:13px;white-space:pre-line}
.a{font-family:'Traditional Arabic','Amiri',serif;font-size:22px;width:45%;text-align:right}
.p{font-family:Consolas,monospace;font-size:12px;color:#4338ca;direction:ltr;text-align:left}
.m{font-size:14px}
@media print{body{margin:10mm}}
</style></head><body>${sheetHeader(info, o.description)}<table>${rows}</table></body></html>`;
}

export function buildExport(format: ExportFormat, subs: SubtitleItem[], o: ExportOptions, info: VideoInfo): string {
  switch (format) {
    case 'srt': return srt(subs, o);
    case 'vtt': return vtt(subs, o, info);
    case 'txt': return txt(subs, o, info);
    case 'md': return md(subs, o, info);
    case 'csv': return csv(subs, o, info);
    case 'anki': return anki(subs, o, info);
    case 'doc': return sheetHtml(subs, o, info, true);
    case 'print':
    case 'html':
      return sheetHtml(subs, o, info, false);
  }
}
