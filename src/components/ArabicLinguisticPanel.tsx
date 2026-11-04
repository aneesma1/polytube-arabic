import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Bookmark, 
  Download, 
  Printer, 
  FileText, 
  Volume2, 
  Repeat, 
  Trash2, 
  Check, 
  Bot,
  Lightbulb,
  AlertTriangle,
  Search,
  ExternalLink,
  Globe,
  Key,
  Circle,
  CheckCircle2,
  Copy,
  ChevronDown
} from 'lucide-react';
import { PracticeBar, LineSelection } from './PracticeBar';
import { HistoryList } from './HistoryList';
import { WordCardView } from './WordCardView';
import { copyCardToClipboard } from '../utils/wordCard';
import { CuratedVideo } from '../types';
import { LANG_LABELS, CaptionInfo } from '../App';
import { SubtitleItem, LoopConfig, SavedWord, SavedSentence, VideoInfo } from '../types';
import { 
  cleanArabicWord, 
  lookupArabicWord, 
  transliterateArabic, 
  speakWord,
  removeTashkeel,
  hasTashkeel,
  smartVocalizeParticles
} from '../utils/arabic';
import { 
  exportToMarkdown, 
  exportToAnkiCsv, 
  exportToPrintableHtml, 
  exportToHtmlFile,
  downloadFile 
} from '../utils/arabicStudyExport';

interface ArabicLinguisticPanelProps {
  subtitles: SubtitleItem[];
  currentIndex: number;
  currentSubtitle: SubtitleItem | null;
  onSeekToSubtitle: (sub: SubtitleItem) => void;
  onStartSingleLoop: (sub: SubtitleItem, count: number) => void;
  loopConfig: LoopConfig;
  onStopLoop: () => void;
  savedWords: SavedWord[];
  onSaveWord: (word: SavedWord) => void;
  onRemoveWord: (id: string) => void;
  savedSentences: SavedSentence[];
  onPinSentence: (sub: SubtitleItem) => void;
  onRemoveSentence: (id: string) => void;
  videoTitle: string;
  videoInfo?: VideoInfo;
  theme?: 'light' | 'dark';
  targetTranslationLang?: 'ml' | 'en';
  selection: LineSelection | null;
  onSelectionChange: (sel: LineSelection | null) => void;
  loopGapSec: number;
  onChangeGap: (sec: number) => void;
  slowRepeatRate: number | null;
  onChangeSlow: (rate: number | null) => void;
  onStartLoop: (start: number, end: number, count: number) => void;
  onSaveSelection: (start: number, end: number) => void;
  onExportSelection: () => void;
  onWordClick: (word: string, context: SubtitleItem) => void;
  availableLangs: string[];
  shownLangs: string[];
  onToggleLang: (code: string) => void;
  onAddLang?: (code: string) => void;
  showPhonetics: boolean;
  onTogglePhonetics: () => void;
  onPrepareVideo: () => void;
  prepareProgress: { done: number; total: number } | null;
  captionInfo: CaptionInfo | null;
  onReloadCaptions?: () => void;
  showTashkeel: boolean;
  onToggleTashkeel: () => void;
  historyVideos: CuratedVideo[];
  onOpenHistory: (youtubeId: string) => void;
  onDeleteHistory: (id: string) => void;
  currentYoutubeId: string;
}

export const ArabicLinguisticPanel: React.FC<ArabicLinguisticPanelProps> = ({
  subtitles,
  currentIndex,
  currentSubtitle,
  onSeekToSubtitle,
  onStartSingleLoop,
  loopConfig,
  onStopLoop,
  savedWords,
  onSaveWord,
  onRemoveWord,
  savedSentences,
  onPinSentence,
  onRemoveSentence,
  videoTitle,
  videoInfo,
  theme = 'light',
  targetTranslationLang = 'ml',
  selection,
  onSelectionChange,
  loopGapSec,
  onChangeGap,
  slowRepeatRate,
  onChangeSlow,
  onStartLoop,
  onSaveSelection,
  onExportSelection,
  onWordClick,
  availableLangs,
  shownLangs,
  onToggleLang,
  onAddLang,
  showPhonetics,
  onTogglePhonetics,
  onPrepareVideo,
  prepareProgress,
  captionInfo,
  onReloadCaptions,
  showTashkeel,
  onToggleTashkeel,
  historyVideos,
  onOpenHistory,
  onDeleteHistory,
  currentYoutubeId,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [openWordId, setOpenWordId] = useState<string | null>(null);
  const [copiedWordId, setCopiedWordId] = useState<string | null>(null);
  const isLight = theme === 'light';
  // First line of the current selection; later clicks extend the range from here
  const selectionAnchorRef = useRef<number | null>(null);

  const extendSelection = (idx: number) => {
    const anchor = selectionAnchorRef.current ?? idx;
    selectionAnchorRef.current = anchor;
    onSelectionChange({ start: Math.min(anchor, idx), end: Math.max(anchor, idx) });
  };

  const toggleLine = (idx: number) => {
    if (selection && selection.start === idx && selection.end === idx) {
      selectionAnchorRef.current = null;
      onSelectionChange(null);
    } else if (!selection) {
      selectionAnchorRef.current = idx;
      onSelectionChange({ start: idx, end: idx });
    } else {
      extendSelection(idx);
    }
  };
  const [activeTab, setActiveTab] = useState<'transcript' | 'history' | 'deck'>('transcript');
  
  // Selected word for linguistic root inspection
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [fontSize, setFontSize] = useState<'md' | 'lg' | 'xl'>('lg');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Scroll active subtitle into view in transcript - centered vertically
  const hasSourceTashkeel = React.useMemo(() => {
    return subtitles.some(s => hasTashkeel(s.vocalizedText || s.text || ''));
  }, [subtitles]);

  const activeLineRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (activeTab === 'transcript' && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentIndex, activeTab]);

  // Export handlers
  const handleExportMarkdown = () => {
    const md = exportToMarkdown(savedSentences, savedWords, videoTitle, videoInfo);
    downloadFile(md, `Arabic-Study-Session-${Date.now()}.md`, 'text/markdown;charset=utf-8');
    setExportNotice('✓ Downloaded Markdown Study Notes!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExportHtml = () => {
    exportToHtmlFile(savedSentences, savedWords, videoTitle, videoInfo);
    setExportNotice('✓ Downloaded Interactive HTML Study Deck!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExportAnki = () => {
    const csv = exportToAnkiCsv(savedSentences, savedWords);
    downloadFile(csv, `Arabic-Anki-Decks-${Date.now()}.csv`, 'text/csv;charset=utf-8');
    setExportNotice('✓ Downloaded Anki Flashcard CSV!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExportPrintable = () => {
    exportToPrintableHtml(savedSentences, savedWords, videoTitle, videoInfo);
  };

  return (
    <div className={`h-full flex flex-col rounded-2xl border shadow-sm overflow-hidden select-none ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
    }`}>
      {/* 1. Header Tabs: Transcript vs Linguistics vs Session Deck */}
      <div className={`p-2 border-b flex items-center justify-between gap-1 shrink-0 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
      }`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'transcript'
                ? isLight
                  ? 'bg-white text-rose-600 shadow-xs border border-slate-200'
                  : 'bg-slate-800 text-rose-400 shadow-xs border border-slate-700'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-500" />
            <span>Transcript</span>
            <span className="text-[10px] opacity-75 font-mono">({subtitles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? isLight
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                  : 'bg-slate-800 text-indigo-400 shadow-xs border border-slate-700'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>History</span>
            {historyVideos.length > 0 && <span className="text-[10px] opacity-75 font-mono">({historyVideos.length})</span>}
          </button>

          <button
            onClick={() => setActiveTab('deck')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'deck'
                ? isLight
                  ? 'bg-white text-amber-600 shadow-xs border border-slate-200'
                  : 'bg-slate-800 text-amber-400 shadow-xs border border-slate-700'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>Study Deck</span>
            {(savedSentences.length > 0 || savedWords.length > 0) && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {savedSentences.length + savedWords.length}
              </span>
            )}
          </button>
        </div>

        {/* Quick controls: Font Size & Tashkeel Toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleTashkeel}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
              showTashkeel
                ? isLight ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-rose-950/50 text-rose-300 border-rose-800'
                : isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={hasSourceTashkeel ? "Toggle Arabic Tashkeel / Harakat vowels" : "Tashkeel: Smart core particles enabled (Raw source has no Harakat)"}
          >
            {showTashkeel ? (hasSourceTashkeel ? 'Vowel marks ON' : 'Vowel marks: partial') : 'Vowel marks OFF'}
          </button>
        </div>
      </div>

      {/* Export notification toast */}
      {exportNotice && (
        <div className="bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-1.5 shrink-0">
          <Check className="w-4 h-4" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Language chips + phonetics */}
      {activeTab === 'transcript' && (
        <div className={`px-2.5 py-1.5 border-b flex items-center gap-1.5 flex-wrap shrink-0 ${
          isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'
        }`}>
          {Array.from(new Set([...availableLangs, ...shownLangs])).map(code => {
            const on = shownLangs.includes(code);
            return (
              <button
                key={code}
                onClick={() => onToggleLang(code)}
                title={on ? 'Hide this translation' : 'Show this translation'}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-colors ${
                  on
                    ? isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40'
                    : isLight ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {LANG_LABELS[code] ?? code}
              </button>
            );
          })}
          {onAddLang && (
            <select
              value=""
              onChange={e => {
                if (e.target.value) onAddLang(e.target.value);
              }}
              className={`text-[11px] font-bold rounded-full border px-2 py-1 cursor-pointer ${
                isLight ? 'bg-white border-slate-300 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Add another translation language"
            >
              <option value="">+ Language</option>
              {Object.keys(LANG_LABELS)
                .filter(code => !availableLangs.includes(code))
                .map(code => (
                  <option key={code} value={code}>{LANG_LABELS[code]}</option>
                ))}
            </select>
          )}
          <div className="relative">
            <button
              onClick={() => setShowInfo(v => !v)}
              title="Captions info: what was loaded and from where"
              className={`px-2 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${
                isLight ? 'bg-white text-slate-600 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              i
            </button>
            {showInfo && (
              <div
                className={`absolute left-0 top-full mt-1.5 w-80 max-w-[85vw] rounded-xl border shadow-xl p-3 z-40 text-[11px] space-y-1.5 ${
                  isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-700 text-slate-200'
                }`}
              >
                <div className="font-bold text-xs">Captions info</div>
                {!captionInfo ? (
                  <p>Nothing fetched through the extension in this session. Videos opened from the library or file upload do not use it.</p>
                ) : (
                  <>
                    <div>Extension: {captionInfo.version ? `v${captionInfo.version}` : 'not responding'}</div>
                    <div>
                      Captions: {captionInfo.ok ? (captionInfo.kind === 'asr' ? 'auto-generated Arabic' : 'manual Arabic') : 'not loaded'}
                      {captionInfo.via ? ` (via ${captionInfo.via} client)` : ''}
                    </div>
                    <div>Asked for: {captionInfo.requested.join(', ') || 'none'}</div>
                    <div>Received: {captionInfo.got.length ? captionInfo.got.join(', ') : 'no translations'}</div>
                    {captionInfo.attempts.length > 0 && (
                      <ul className="list-disc ml-4 opacity-80">
                        {captionInfo.attempts.map((a, i) => (
                          <li key={i}>{a.lang} · {a.how} · {a.via} · {a.lines} lines</li>
                        ))}
                      </ul>
                    )}
                    {captionInfo.error && <div className="text-rose-500">Problem: {captionInfo.error}</div>}
                  </>
                )}
                <div className="flex gap-2 pt-1">
                  {onReloadCaptions && (
                    <button
                      onClick={() => { setShowInfo(false); onReloadCaptions(); }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer"
                    >
                      Reload captions
                    </button>
                  )}
                  <button
                    onClick={() => navigator.clipboard?.writeText(JSON.stringify(captionInfo ?? {}, null, 2))}
                    className={`px-2.5 py-1 rounded-lg border font-bold cursor-pointer ${isLight ? 'border-slate-300' : 'border-slate-600'}`}
                  >
                    Copy debug info
                  </button>
                </div>
              </div>
            )}
          </div>
          <span className="flex-1" />
          <button
            onClick={onPrepareVideo}
            disabled={prepareProgress !== null}
            title="Optional AI: add vowel marks and accurate phonetics to every line (needs a key in Settings)"
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-colors disabled:opacity-60 ${
              isLight ? 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50' : 'bg-slate-800 text-indigo-300 border-indigo-500/40 hover:bg-slate-700'
            }`}
          >
            {prepareProgress ? `Preparing ${prepareProgress.done}/${prepareProgress.total}` : '✨ Prepare video'}
          </button>
          <button
            onClick={onTogglePhonetics}
            title="Show or hide phonetic spelling. Approximate when the captions have no vowel marks."
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-colors ${
              showPhonetics
                ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : isLight ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Phonetics {showPhonetics ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      {/* 2. Main Content Viewport */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        {/* TAB 1: INTERACTIVE TRANSCRIPT */}
        {activeTab === 'transcript' && (
          <div className="space-y-2">
            {subtitles.map((sub, idx) => {
              const isActive = idx === currentIndex;
              const isPinned = savedSentences.some(s => s.subtitleId === sub.id);
              let displayText = '';
              if (!showTashkeel) {
                displayText = removeTashkeel(sub.text || sub.vocalizedText || '');
              } else if (sub.vocalizedText && hasTashkeel(sub.vocalizedText)) {
                displayText = sub.vocalizedText;
              } else if (hasTashkeel(sub.text)) {
                displayText = sub.text;
              } else {
                displayText = smartVocalizeParticles(sub.text || sub.vocalizedText || '');
              }
              const words = displayText.split(/\s+/);

              return (
                <div
                  key={sub.id}
                  ref={isActive ? activeLineRef : null}
                  onClick={(e) => {
                    if (e.shiftKey) {
                      extendSelection(idx);
                    } else {
                      selectionAnchorRef.current = null;
                      onSeekToSubtitle(sub);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selection && idx >= selection.start && idx <= selection.end
                      ? isLight
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/60'
                        : 'bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/30'
                      : isActive
                      ? isLight
                        ? 'bg-rose-50/80 border-rose-400 shadow-md ring-2 ring-rose-400/40'
                        : 'bg-rose-950/30 border-rose-500/60 shadow-lg ring-2 ring-rose-500/40'
                      : isLight
                      ? 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-slate-300 shadow-xs'
                      : 'bg-slate-850 hover:bg-slate-800 border-slate-750 hover:border-slate-700'
                  }`}
                  title={`Click to seek video to ${Math.floor(sub.start / 60)}:${(sub.start % 60 < 10 ? '0' : '') + Math.floor(sub.start % 60)}`}
                >
                  {/* Top Bar: Timestamp & Actions */}
                  <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeekToSubtitle(sub);
                      }}
                      className={`font-mono text-[11px] px-2 py-0.5 rounded cursor-pointer font-bold ${
                        isActive 
                          ? 'bg-rose-600 text-white' 
                          : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Seek video to timestamp"
                    >
                      {Math.floor(sub.start / 60)}:{(sub.start % 60 < 10 ? '0' : '') + Math.floor(sub.start % 60)}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Audio speak */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(sub.text, 'ar-SA');
                        }}
                        className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Select for practice */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLine(idx);
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          selection && idx >= selection.start && idx <= selection.end
                            ? 'text-amber-500'
                            : 'text-slate-400 hover:text-amber-500'
                        }`}
                        title="Select this line for practice (click more lines to extend)"
                      >
                        {selection && idx >= selection.start && idx <= selection.end ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      {/* Pin to phrasebook */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPinSentence(sub);
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isPinned ? 'text-amber-500 fill-amber-500' : 'text-slate-400 hover:text-amber-500'
                        }`}
                        title={isPinned ? 'Saved to Bookmarks' : 'Bookmark sentence'}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Arabic Clickable Words */}
                  <div 
                    className={`font-arabic text-right leading-loose select-text ${
                      fontSize === 'xl' ? 'text-2xl' : fontSize === 'lg' ? 'text-xl' : 'text-lg'
                    } ${isLight ? 'text-slate-900' : 'text-slate-100'}`}
                    dir="rtl"
                  >
                    {words.map((w, wIdx) => {
                      const clean = cleanArabicWord(w);
                      const isWordActive = clean === selectedWord;
                      return (
                        <span
                          key={wIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (clean) {
                              setSelectedWord(clean);
                              onWordClick(w, sub);
                            }
                          }}
                          className={`inline-block mx-0.5 px-1 py-0.5 rounded transition-all cursor-pointer ${
                            isWordActive
                              ? 'bg-indigo-600 text-white font-bold shadow-xs'
                              : isLight
                              ? 'hover:bg-indigo-50 hover:text-indigo-600'
                              : 'hover:bg-indigo-950/60 hover:text-indigo-300'
                          }`}
                          title={`Look up "${clean}"`}
                        >
                          {w}
                        </span>
                      );
                    })}
                  </div>

                  {/* Phonetic Transliteration */}
                  {showPhonetics && sub.transliteration && (
                    <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 mt-1 select-text">
                      /{sub.transliteration}/
                    </div>
                  )}

                  {/* Translation (Malayalam / English) */}
                  <div className={`text-xs font-semibold mt-1 select-text whitespace-pre-line ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    {sub.translation}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: HISTORY (videos already fetched and ready to play) */}
        {activeTab === 'history' && (
          <HistoryList
            videos={historyVideos}
            currentYoutubeId={currentYoutubeId}
            onOpen={id => {
              setActiveTab('transcript');
              onOpenHistory(id);
            }}
            onDelete={onDeleteHistory}
            theme={theme}
          />
        )}

        {/* TAB 3: SESSION DECK & EXPORT */}
        {activeTab === 'deck' && (
          <div className="space-y-4">
            {/* ONE-CLICK EXPORT SECTION */}
            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-gradient-to-r from-rose-50/50 via-amber-50/40 to-indigo-50/50 border-rose-200' : 'bg-slate-850 border-slate-750'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Export Study Session
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Export all bookmarked sentences and vocabulary from this session as Markdown notes, Anki flashcard CSV, or a printable study sheet.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={handleExportMarkdown}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform hover:scale-102 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>Markdown (.md)</span>
                </button>

                <button
                  onClick={handleExportHtml}
                  className="px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform hover:scale-102 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-white" />
                  <span>HTML (.html)</span>
                </button>

                <button
                  onClick={handleExportAnki}
                  className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform hover:scale-102 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Anki Cards (.csv)</span>
                </button>

                <button
                  onClick={handleExportPrintable}
                  className="px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform hover:scale-102 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-white" />
                  <span>Printable / PDF</span>
                </button>
              </div>
            </div>

            {/* Saved Sentences List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Saved Sentences ({savedSentences.length})
                </span>
              </div>
              {savedSentences.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed rounded-xl">
                  No sentences saved yet. Click the bookmark icon beside any subtitle line to save.
                </div>
              ) : (
                <div className="space-y-2">
                  {savedSentences.map(s => (
                    <div key={s.id} className="p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2 shadow-2xs">
                      <div className="flex-1 min-w-0">
                        <div className="font-arabic font-bold text-base text-slate-900 dark:text-white" dir="rtl">
                          {s.vocalizedText || s.text}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          {s.translation}
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveSentence(s.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Remove sentence"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Vocabulary Words List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Saved Vocabulary & Roots ({savedWords.length})
                </span>
              </div>
              {savedWords.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed rounded-xl">
                  No words saved yet. Click any word in the transcript or subtitles to inspect and save.
                </div>
              ) : (
                <div className="space-y-2">
                  {savedWords.map(w => (
                    <div key={w.id} className="rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <div
                        className="p-2.5 flex items-center justify-between gap-2 cursor-pointer"
                        onClick={() => setOpenWordId(openWordId === w.id ? null : w.id)}
                      >
                        <div className="min-w-0">
                          <span className="font-arabic font-bold text-xl text-indigo-600 dark:text-indigo-400 block" dir="rtl">
                            {w.vocalized || w.word}
                          </span>
                          <span className="text-xs text-slate-700 dark:text-slate-300 truncate block">{w.translation}</span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {w.card ? 'Full card' : 'Light card'}
                            {w.root ? ` · Root ${w.root}` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={async () => {
                              const ok = await copyCardToClipboard(w);
                              setCopiedWordId(ok ? w.id : null);
                              setTimeout(() => setCopiedWordId(null), 1800);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-500 cursor-pointer"
                            title="Copy with WhatsApp formatting"
                          >
                            {copiedWordId === w.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button onClick={() => onRemoveWord(w.id)} className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer" title="Remove word">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openWordId === w.id ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      {openWordId === w.id && (
                        <div className="px-3 pb-3 border-t border-slate-200 dark:border-slate-700">
                          <WordCardView
                            w={w}
                            theme={theme}
                            onOpenLookup={() =>
                              onWordClick(w.vocalized || w.word, {
                                id: 0,
                                start: w.timestamp,
                                end: w.timestamp + 3,
                                text: w.contextSentence,
                                vocalizedText: w.contextSentence,
                                translation: w.contextTranslation,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {activeTab === 'transcript' && (
        <div className="shrink-0">
          <PracticeBar
            subtitles={subtitles}
            selection={selection}
            loopConfig={loopConfig}
            loopGapSec={loopGapSec}
            onChangeGap={onChangeGap}
            slowRepeatRate={slowRepeatRate}
            onChangeSlow={onChangeSlow}
            onStartLoop={onStartLoop}
            onStopLoop={onStopLoop}
            onSaveSelection={onSaveSelection}
            onExportSelection={onExportSelection}
            onClear={() => {
              selectionAnchorRef.current = null;
              onSelectionChange(null);
            }}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
};
