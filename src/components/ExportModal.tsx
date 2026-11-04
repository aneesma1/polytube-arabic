import React, { useEffect, useMemo, useState } from 'react';
import { X, Download } from 'lucide-react';
import { SubtitleItem, VideoInfo } from '../types';
import { LANG_LABELS } from '../utils/languages';
import { downloadFile } from '../utils/subtitles';
import { ExportFormat, ExportOptions, FORMATS, buildExport } from '../utils/exportFormats';

type ExportScope = 'all' | 'loop' | 'pinned';

interface ExportModalProps {
  subtitles: SubtitleItem[];
  /** Index range of the selected lines, if any */
  loopRange?: { startIndex: number; endIndex: number } | null;
  /** Time ranges of sentences the learner saved for this video */
  pinnedRanges?: { start: number; end: number }[];
  initialScope?: ExportScope;
  /** Current phonetics switch from the main screen */
  defaultPhonetics?: boolean;
  videoInfo: VideoInfo;
  /** Languages currently shown on the main screen; the picker starts from these */
  shownLangs?: string[];
  /** Fetches one more translation language through the extension */
  onAddLang?: (code: string) => void;
  onClose: () => void;
}

const PREFS_KEY = 'polytube_export_prefs_v1';
const DEFAULT_OPTS: ExportOptions = { arabic: true, vowels: true, phonetics: false, translation: true, description: 'brief' };

function loadPrefs(): { opts: ExportOptions; format: ExportFormat } {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null');
    if (raw && raw.opts && raw.format) return { opts: { ...DEFAULT_OPTS, ...raw.opts }, format: raw.format };
  } catch {}
  return { opts: DEFAULT_OPTS, format: 'srt' };
}

const GROUPS = ['Subtitles', 'Study sheet', 'Flashcards', 'Notes'] as const;

export const ExportModal: React.FC<ExportModalProps> = ({
  subtitles: allSubtitles,
  loopRange = null,
  pinnedRanges = [],
  initialScope = 'all',
  defaultPhonetics,
  videoInfo,
  shownLangs = [],
  onAddLang,
  onClose,
}) => {
  const saved = useMemo(loadPrefs, []);
  const [scope, setScope] = useState<ExportScope>(initialScope === 'loop' && !loopRange ? 'all' : initialScope);
  const [opts, setOpts] = useState<ExportOptions>({
    ...saved.opts,
    phonetics: defaultPhonetics ?? saved.opts.phonetics,
  });
  const [format, setFormat] = useState<ExportFormat>(saved.format);

  // Translation languages this video actually has, shown ones first
  const availableLangs = useMemo(() => {
    const have = new Set<string>();
    for (const s of allSubtitles) for (const c of Object.keys(s.translations ?? {})) if (s.translations![c]) have.add(c);
    return [...shownLangs.filter(c => have.has(c)), ...Array.from(have).filter(c => !shownLangs.includes(c)).sort()];
  }, [allSubtitles, shownLangs]);
  const [pickedLangs, setPickedLangs] = useState<string[] | null>(null);
  const [addingLang, setAddingLang] = useState<string | null>(null);
  const langs = useMemo(() => {
    const base = pickedLangs ?? shownLangs;
    const ok = base.filter(c => availableLangs.includes(c));
    return ok.length > 0 ? ok : availableLangs.slice(0, 1);
  }, [pickedLangs, shownLangs, availableLangs]);
  const exportOpts: ExportOptions = useMemo(() => ({ ...opts, langs: availableLangs.length > 0 ? langs : undefined }), [opts, langs, availableLangs]);

  const toggleLang = (c: string) =>
    setPickedLangs(() => (langs.includes(c) ? (langs.length > 1 ? langs.filter(x => x !== c) : langs) : availableLangs.filter(x => x === c || langs.includes(x))));

  // After a language is fetched, tick it automatically
  useEffect(() => {
    if (addingLang && availableLangs.includes(addingLang)) {
      setPickedLangs(availableLangs.filter(x => x === addingLang || langs.includes(x)));
      setAddingLang(null);
    }
  }, [addingLang, availableLangs]);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ opts, format }));
    } catch {}
  }, [opts, format]);

  const subtitles = useMemo(() => {
    if (scope === 'loop' && loopRange) return allSubtitles.slice(loopRange.startIndex, loopRange.endIndex + 1);
    if (scope === 'pinned') return allSubtitles.filter(s => pinnedRanges.some(p => s.start < p.end && s.end > p.start));
    return allSubtitles;
  }, [scope, allSubtitles, loopRange, pinnedRanges]);

  const info = FORMATS.find(f => f.id === format)!;
  const nothingSelected = !opts.arabic && !opts.phonetics && !opts.translation;
  const preview = useMemo(
    () => (nothingSelected ? '' : buildExport(format, subtitles.slice(0, 3), exportOpts, videoInfo).slice(0, 900)),
    [format, subtitles, exportOpts, videoInfo, nothingSelected]
  );

  const handleDownload = () => {
    if (nothingSelected || subtitles.length === 0) return;
    const content = buildExport(format, subtitles, exportOpts, videoInfo);
    if (format === 'print') {
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(content);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 400);
        return;
      }
    }
    const base = videoInfo.title.replace(/[^a-zA-Z0-9_؀-ۿ-]/g, '_').slice(0, 30) || 'subtitles';
    downloadFile(content, `${base}.${info.ext}`, info.mime);
  };

  const seg = (on: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
      on
        ? 'bg-emerald-600 text-white border-emerald-500'
        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
    }`;

  const step = 'text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl p-5 shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" /> Export
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Lines */}
        <div>
          <div className={step}>1 · Lines</div>
          <div className="flex gap-2 flex-wrap">
            <button className={seg(scope === 'all')} onClick={() => setScope('all')}>
              Whole video ({allSubtitles.length})
            </button>
            <button className={seg(scope === 'loop')} disabled={!loopRange} onClick={() => setScope('loop')}>
              Selected lines{loopRange ? ` (${loopRange.endIndex - loopRange.startIndex + 1})` : ''}
            </button>
            <button className={seg(scope === 'pinned')} disabled={pinnedRanges.length === 0} onClick={() => setScope('pinned')}>
              Saved ({pinnedRanges.length})
            </button>
          </div>
        </div>

        {/* 2. Content */}
        <div>
          <div className={step}>2 · Include</div>
          <div className="flex gap-2 flex-wrap">
            <button className={seg(opts.arabic)} onClick={() => setOpts(o => ({ ...o, arabic: !o.arabic }))}>Arabic</button>
            <button className={seg(opts.vowels)} disabled={!opts.arabic} onClick={() => setOpts(o => ({ ...o, vowels: !o.vowels }))}>
              Vowel marks
            </button>
            <button className={seg(opts.phonetics)} onClick={() => setOpts(o => ({ ...o, phonetics: !o.phonetics }))}>Phonetics</button>
            <button className={seg(opts.translation)} onClick={() => setOpts(o => ({ ...o, translation: !o.translation }))}>
              Translations
            </button>
          </div>
          {opts.translation && availableLangs.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400">Languages</span>
                {availableLangs.map(c => (
                  <button key={c} className={seg(langs.includes(c))} onClick={() => toggleLang(c)}>
                    {LANG_LABELS[c] ?? c}
                  </button>
                ))}
                {onAddLang && (
                  <select
                    value=""
                    disabled={!!addingLang}
                    onChange={e => {
                      const code = e.target.value;
                      if (!code) return;
                      setAddingLang(code);
                      onAddLang(code);
                      setTimeout(() => setAddingLang(cur => (cur === code ? null : cur)), 20000);
                    }}
                    className="px-2 py-1.5 rounded-lg text-xs font-bold border bg-slate-800 text-slate-300 border-slate-700 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">{addingLang ? 'Fetching…' : '+ Add language'}</option>
                    {Object.keys(LANG_LABELS)
                      .filter(c => !availableLangs.includes(c))
                      .map(c => (
                        <option key={c} value={c}>{LANG_LABELS[c]}</option>
                      ))}
                  </select>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Each ticked language is exported, in this order. CSV gets one column per language; other formats stack them under the Arabic.
              </p>
            </div>
          )}
          {opts.translation && availableLangs.length === 0 && (
            <p className="text-[11px] text-slate-500 mt-1.5">Translations follow the language chips on the main screen.</p>
          )}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400">Video description</span>
            {(['brief', 'full', 'none'] as const).map(m => (
              <button key={m} className={seg(opts.description === m)} onClick={() => setOpts(o => ({ ...o, description: m }))}>
                {m === 'brief' ? 'Brief' : m === 'full' ? 'Full' : 'None'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Title, channel, upload date, length and link go at the top of Word, web page, print, Markdown, text and VTT. CSV and Anki get a YouTube link on every row. SRT has no place for these details.
          </p>
        </div>

        {/* 3. Format */}
        <div>
          <div className={step}>3 · Format</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {GROUPS.map(g => (
              <div key={g}>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">{g}</div>
                <div className="flex gap-1.5 flex-wrap">
                  {FORMATS.filter(f => f.group === g).map(f => (
                    <button key={f.id} className={seg(format === f.id)} onClick={() => setFormat(f.id)}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className={step}>Preview</div>
          <pre
            dir="auto"
            className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] leading-relaxed text-slate-300 overflow-auto max-h-40 whitespace-pre-wrap"
          >
            {nothingSelected ? 'Choose at least one thing to include.' : subtitles.length === 0 ? 'No lines in this selection.' : preview}
          </pre>
        </div>

        <button
          onClick={handleDownload}
          disabled={nothingSelected || subtitles.length === 0}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {format === 'print' ? 'Open print view' : `Download ${info.label}`} · {subtitles.length} lines
        </button>
      </div>
    </div>
  );
};
