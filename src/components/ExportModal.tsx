import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Table, 
  AlignJustify, 
  BookOpen, 
  Printer, 
  Check, 
  Sparkles,
  Layers
} from 'lucide-react';
import { SubtitleItem } from '../types';
import { 
  generateSrt, 
  generateVtt, 
  generateSideBySideCsv, 
  generateLineByLineMarkdown, 
  generateSideBySideMarkdown,
  generateWordDoc,
  generateAnkiDeck, 
  downloadFile 
} from '../utils/subtitles';

interface ExportModalProps {
  subtitles: SubtitleItem[];
  videoTitle: string;
  targetLangName: string;
  nativeLangName: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  subtitles,
  videoTitle,
  targetLangName,
  nativeLangName,
  onClose,
}) => {
  const [useTashkeel, setUseTashkeel] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const cleanFilename = (ext: string) => {
    const base = videoTitle.replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_').slice(0, 30);
    return `${base}_subtitles.${ext}`;
  };

  const handleExport = (type: string) => {
    let content = '';
    let filename = '';
    let mime = 'text/plain;charset=utf-8';

    switch (type) {
      case 'dual-srt':
        content = generateSrt(subtitles, 'dual', useTashkeel);
        filename = cleanFilename('dual.srt');
        break;
      case 'dual-vtt':
        content = generateVtt(subtitles, 'dual', useTashkeel);
        filename = cleanFilename('dual.vtt');
        mime = 'text/vtt;charset=utf-8';
        break;
      case 'single-target-srt':
        content = generateSrt(subtitles, 'target', useTashkeel);
        filename = cleanFilename(`${targetLangName.toLowerCase()}.srt`);
        break;
      case 'single-native-srt':
        content = generateSrt(subtitles, 'native', useTashkeel);
        filename = cleanFilename(`${nativeLangName.toLowerCase()}.srt`);
        break;
      case 'side-by-side-csv':
        content = generateSideBySideCsv(subtitles, ',');
        filename = cleanFilename('side_by_side.csv');
        mime = 'text/csv;charset=utf-8';
        break;
      case 'side-by-side-md':
        content = generateSideBySideMarkdown(subtitles, videoTitle);
        filename = cleanFilename('side_by_side.md');
        mime = 'text/markdown;charset=utf-8';
        break;
      case 'line-by-line-md':
        content = generateLineByLineMarkdown(subtitles, videoTitle);
        filename = cleanFilename('line_by_line.md');
        mime = 'text/markdown;charset=utf-8';
        break;
      case 'side-by-side-doc':
        content = generateWordDoc(subtitles, videoTitle, 'side-by-side');
        filename = cleanFilename('side_by_side.doc');
        mime = 'application/msword;charset=utf-8';
        break;
      case 'line-by-line-doc':
        content = generateWordDoc(subtitles, videoTitle, 'line-by-line');
        filename = cleanFilename('study_sheet.doc');
        mime = 'application/msword;charset=utf-8';
        break;
      case 'anki-tsv':
        content = generateAnkiDeck(subtitles, videoTitle);
        filename = cleanFilename('anki_deck.tsv');
        mime = 'text/tab-separated-values;charset=utf-8';
        break;
      case 'print':
        window.print();
        return;
      default:
        return;
    }

    downloadFile(content, filename, mime);
    setDownloadSuccess(type);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Export Subtitles & Study Sheets
              </h2>
              <p className="text-xs text-slate-400">
                Choose from Single, Dual, Side-by-Side, Line-by-Line, or Anki formats.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-300 font-medium">
            Include Arabic Tashkeel / Harakat in exported text:
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={useTashkeel} 
              onChange={(e) => setUseTashkeel(e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. Dual Subtitles */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm text-slate-200">Dual Subtitles</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stacked {targetLangName} on top and {nativeLangName} underneath in standard caption format.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleExport('dual-srt')}
                className="flex-1 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                {downloadSuccess === 'dual-srt' ? 'Downloaded!' : '.SRT Format'}
              </button>
              <button
                onClick={() => handleExport('dual-vtt')}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                {downloadSuccess === 'dual-vtt' ? 'Downloaded!' : '.VTT Format'}
              </button>
            </div>
          </div>

          {/* 2. Single Subtitles */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="w-4 h-4 text-rose-400" />
                <h3 className="font-semibold text-sm text-slate-200">Single Subtitles</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Export only the {targetLangName} track or only the {nativeLangName} track.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleExport('single-target-srt')}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                {targetLangName} Only (.srt)
              </button>
              <button
                onClick={() => handleExport('single-native-srt')}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                {nativeLangName} Only (.srt)
              </button>
            </div>
          </div>

          {/* 3. Markdown (.MD) - Side-by-Side & Line-by-Line */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <AlignJustify className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-sm text-slate-200">Markdown (.MD) Export</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clean Markdown formatted for Notion, Obsidian, GitHub, or Logseq study vaults.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleExport('side-by-side-md')}
                className="flex-1 py-2 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Side-by-Side Table (.md)</span>
              </button>
              <button
                onClick={() => handleExport('line-by-line-md')}
                className="flex-1 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-200 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Line-by-Line (.md)</span>
              </button>
            </div>
          </div>

          {/* 4. Microsoft Word (.DOC) - Side-by-Side & Line-by-Line */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-sm text-slate-200">Microsoft Word (.DOC) Export</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Word document with full RTL Arabic typography (Amiri font), color styling, and vocabulary notes.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleExport('side-by-side-doc')}
                className="flex-1 py-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Side-by-Side Word (.doc)</span>
              </button>
              <button
                onClick={() => handleExport('line-by-line-doc')}
                className="flex-1 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-200 border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Line-by-Line Study Sheet (.doc)</span>
              </button>
            </div>
          </div>

          {/* 5. Side-by-Side Table (CSV) */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Table className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-sm text-slate-200">Side-by-Side Spreadsheet (.CSV)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parallel columns with Timestamps, {targetLangName}, Phonetics, and {nativeLangName} for Excel or Google Sheets.
              </p>
            </div>
            <button
              onClick={() => handleExport('side-by-side-csv')}
              className="w-full py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Side-by-Side CSV</span>
            </button>
          </div>

          {/* 5. Anki Flashcard Deck */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-sm text-slate-200">Anki Flashcard Deck (.TSV)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Directly importable into Anki for spaced repetition audio study.
              </p>
            </div>
            <button
              onClick={() => handleExport('anki-tsv')}
              className="w-full py-2 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Anki Deck (.tsv)</span>
            </button>
          </div>

          {/* 6. Printable Study Sheet */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Printer className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-sm text-slate-200">Print / PDF Study Guide</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clean, print-formatted worksheet with note margins for offline studying.
              </p>
            </div>
            <button
              onClick={() => handleExport('print')}
              className="w-full py-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Study Worksheet (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
