/**
 * Backup, restore and exports meant for other programs (Excel, a browser, scripts).
 * AI keys are never included in a backup.
 */
import { CuratedVideo, SavedSentence, SavedWord, WorkspaceSettings } from '../types';
import { getStoredVideos, putStoredVideo } from './videoStore';
import { getAllProgress, mergeProgress, Progress } from './resume';
import { cardFields, cardHtml } from './wordCard';
import { composeInfo, infoHtml, watchUrl } from './videoInfo';

export const BACKUP_FORMAT = 'polytube-backup';
export const BACKUP_VERSION = 2;

export interface BackupV2 {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  videos: CuratedVideo[];
  words: SavedWord[];
  sentences: SavedSentence[];
  settings: WorkspaceSettings;
  progress: Record<string, Progress>;
  prefs: Record<string, string>;
}

/** Small display preferences worth carrying over to another computer. */
const PREF_KEYS = [
  'polytube_shown_langs',
  'polytube_show_phonetics',
  'polytube_sentence_mode',
  'polytube_show_tashkeel',
  'polytube_loop_gap',
  'polytube_slow_repeat',
  'polytube_loop_count',
  'polytube_export_prefs_v1',
  'lingotube_theme',
];

export function buildBackup(words: SavedWord[], sentences: SavedSentence[], settings: WorkspaceSettings): BackupV2 {
  const prefs: Record<string, string> = {};
  for (const k of PREF_KEYS) {
    try {
      const v = localStorage.getItem(k);
      if (v !== null) prefs[k] = v;
    } catch {}
  }
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    videos: getStoredVideos(),
    words,
    sentences,
    settings,
    progress: getAllProgress(),
    prefs,
  };
}

export function isBackup(x: any): x is BackupV2 {
  return !!x && x.format === BACKUP_FORMAT && Array.isArray(x.videos);
}

export interface RestoreSummary {
  videos: number;
  words: number;
  sentences: number;
}

/** Merges a backup into what is already here: nothing is deleted. */
export function restoreBackup(
  payload: BackupV2,
  current: { words: SavedWord[]; sentences: SavedSentence[] }
): { summary: RestoreSummary; words: SavedWord[]; sentences: SavedSentence[]; settings: WorkspaceSettings } {
  for (const v of payload.videos) putStoredVideo(v);
  mergeProgress(payload.progress ?? {});
  for (const [k, v] of Object.entries(payload.prefs ?? {})) {
    try {
      localStorage.setItem(k, v);
    } catch {}
  }
  const wordIds = new Set(current.words.map(w => w.id));
  const sentenceIds = new Set(current.sentences.map(s => s.id));
  const newWords = (payload.words ?? []).filter(w => !wordIds.has(w.id));
  const newSentences = (payload.sentences ?? []).filter(s => !sentenceIds.has(s.id));
  return {
    summary: { videos: payload.videos.length, words: newWords.length, sentences: newSentences.length },
    words: [...newWords, ...current.words],
    sentences: [...newSentences, ...current.sentences],
    settings: payload.settings,
  };
}

// ---------- exports for Excel and other programs ----------

const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' / ')}"`;
const clock = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const BOM = '﻿'; // lets Excel read Arabic and Malayalam correctly

/** Saved words and saved sentences, one row each. */
export function notesCsv(words: SavedWord[], sentences: SavedSentence[]): string {
  const header = ['Type', 'Arabic', 'Vowelled', 'Phonetic', 'Root', 'Part of speech', 'Meaning / translation', 'Context sentence', 'Context translation', 'Video', 'Time', 'Dictionary', 'Examples', 'AI notes'];
  const rows: string[] = [];
  for (const w of words) {
    rows.push([
      'word', w.word, w.vocalized, w.transliteration, w.root, w.partOfSpeech, w.translation,
      w.contextSentence, w.contextTranslation, w.videoTitle, clock(w.timestamp),
      cardFields(w).dictionary, cardFields(w).examples, cardFields(w).notes,
    ].map(cell).join(','));
  }
  for (const s of sentences) {
    rows.push([
      'sentence', s.text, s.vocalizedText, s.transliteration, '', '', s.translation, '', '', s.videoTitle, clock(s.start), '', '', '',
    ].map(cell).join(','));
  }
  return BOM + [header.map(cell).join(','), ...rows].join('\r\n');
}

/** Every line of every saved video, with each translation language in its own column. */
export function linesCsv(videos: CuratedVideo[]): string {
  const langs = Array.from(new Set(videos.flatMap(v => v.subtitles.flatMap(s => Object.keys(s.translations ?? {}))))).sort();
  const header = ['Video', 'Video ID', 'YouTube link', '#', 'Start (s)', 'End (s)', 'Time', 'Arabic', 'Phonetic', ...langs.map(l => `Translation ${l}`), 'Translation (shown)'];
  const rows: string[] = [];
  for (const v of videos) {
    v.subtitles.forEach((s, i) => {
      rows.push([
        v.title, v.youtubeId, watchUrl(v.youtubeId, s.start), i + 1, s.start, s.end, clock(s.start), s.vocalizedText || s.text, s.transliteration,
        ...langs.map(l => s.translations?.[l] ?? ''), s.translation === '—' ? '' : s.translation,
      ].map(cell).join(','));
    });
  }
  return BOM + [header.map(cell).join(','), ...rows].join('\r\n');
}

const esc = (s: string) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** One self-contained web page with everything: opens anywhere, searchable with Ctrl+F. */
export function reportHtml(videos: CuratedVideo[], words: SavedWord[], sentences: SavedSentence[]): string {
  const wordRows = words
    .map(w => `<tr><td class="a" dir="rtl">${esc(w.vocalized || w.word)}</td><td>${esc(w.root || '')}</td><td>${esc(w.partOfSpeech || '')}</td><td>${esc(w.translation)}</td><td>${esc(w.videoTitle)}</td></tr>`)
    .join('\n');
  const sentenceRows = sentences
    .map(s => `<tr><td class="a" dir="rtl">${esc(s.vocalizedText || s.text)}</td><td>${esc(s.translation)}</td><td>${esc(s.videoTitle)} · ${clock(s.start)}</td></tr>`)
    .join('\n');
  const videoSections = videos
    .map(v => {
      const lines = v.subtitles
        .map(s => `<tr><td class="t">${clock(s.start)}</td><td class="a" dir="rtl">${esc(s.vocalizedText || s.text)}</td><td>${esc(s.translation === '—' ? '' : s.translation).replace(/\n/g, '<br>')}</td></tr>`)
        .join('\n');
      return `<details><summary>${esc(v.title)} <small>(${v.subtitles.length} lines)</small></summary>${infoHtml(composeInfo(v.youtubeId, v.title, v))}<table>${lines}</table></details>`;
    })
    .join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PolyTube study report</title>
<style>
body{font-family:Segoe UI,Arial,sans-serif;margin:24px;max-width:1000px;color:#111}
h1{font-size:22px}h2{margin-top:28px;font-size:17px;border-bottom:2px solid #e11d48;padding-bottom:4px}
table{border-collapse:collapse;width:100%;margin:8px 0}td,th{border-bottom:1px solid #ddd;padding:6px 8px;vertical-align:top;font-size:14px;text-align:left}
.a{font-family:'Traditional Arabic','Amiri',serif;font-size:20px;text-align:right}.t{width:46px;color:#666;font-size:12px}
details{margin:8px 0;border:1px solid #ddd;border-radius:8px;padding:6px 10px}summary{cursor:pointer;font-weight:600}
</style></head><body>
<h1>PolyTube study report</h1><p>Exported ${esc(new Date().toLocaleString())}</p>
<h2>Saved words (${words.length})</h2><table><tr><th>Word</th><th>Root</th><th>Type</th><th>Meaning</th><th>Video</th></tr>${wordRows}</table>
<h2>Saved sentences (${sentences.length})</h2><table><tr><th>Sentence</th><th>Translation</th><th>Source</th></tr>${sentenceRows}</table>
<h2>Word cards (${words.filter(w => w.card).length})</h2>${words.filter(w => w.card).map(cardHtml).join('')}
<h2>Videos (${videos.length})</h2>${videoSections}
</body></html>`;
}
