import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Play, 
  Repeat, 
  Volume2, 
  CheckSquare, 
  Square, 
  X, 
  Layers, 
  Sparkles,
  Eye,
  EyeOff,
  SquareX,
  Bookmark
} from 'lucide-react';
import { SubtitleItem, LoopConfig } from '../types';
import { formatTime } from '../utils/youtube';
import { speakWord } from '../utils/arabic';

export type TranscriptFontSize = 'sm' | 'md' | 'lg' | 'xl';

interface TranscriptPanelProps {
  subtitles: SubtitleItem[];
  currentIndex: number;
  onSeekToSubtitle: (subtitle: SubtitleItem) => void;
  onStartSingleLoop: (subtitle: SubtitleItem, count: number) => void;
  onStartMultiLoop: (startIndex: number, endIndex: number, count: number) => void;
  loopConfig?: LoopConfig;
  onStopLoop?: () => void;
  targetLangCode: string;
  fontSize?: TranscriptFontSize;
  onChangeFontSize?: (size: TranscriptFontSize) => void;
  showArabic?: boolean;
  onToggleArabic?: () => void;
  showTransliteration?: boolean;
  onToggleTransliteration?: () => void;
  showTranslation?: boolean;
  onToggleTranslation?: () => void;
  theme?: 'light' | 'dark';
  onPinSentence?: (subtitle: SubtitleItem) => void;
  pinnedSentenceIds?: Set<number>;
  onCheckNativeStyle?: (text: string) => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  subtitles,
  currentIndex,
  onSeekToSubtitle,
  onStartSingleLoop,
  onStartMultiLoop,
  loopConfig,
  onStopLoop,
  targetLangCode,
  fontSize: propFontSize,
  onChangeFontSize,
  showArabic: propShowArabic,
  onToggleArabic,
  showTransliteration: propShowTransliteration,
  onToggleTransliteration,
  showTranslation: propShowTranslation,
  onToggleTranslation,
  theme = 'light',
  onPinSentence,
  pinnedSentenceIds,
  onCheckNativeStyle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [localFontSize, setLocalFontSize] = useState<TranscriptFontSize>('md');
  const [localShowArabic, setLocalShowArabic] = useState(true);
  const [localShowTransliteration, setLocalShowTransliteration] = useState(true);
  const [localShowTranslation, setLocalShowTranslation] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  const isLight = theme === 'light';
  const fontSize = propFontSize ?? localFontSize;
  const showArabic = propShowArabic ?? localShowArabic;
  const showTransliteration = propShowTransliteration ?? localShowTransliteration;
  const showTranslation = propShowTranslation ?? localShowTranslation;

  const handleSetFontSize = (size: TranscriptFontSize) => {
    if (onChangeFontSize) onChangeFontSize(size);
    else setLocalFontSize(size);
  };

  const handleToggleArabic = () => {
    if (onToggleArabic) onToggleArabic();
    else setLocalShowArabic(!localShowArabic);
  };

  const handleToggleTransliteration = () => {
    if (onToggleTransliteration) onToggleTransliteration();
    else setLocalShowTransliteration(!localShowTransliteration);
  };

  const handleToggleTranslation = () => {
    if (onToggleTranslation) onToggleTranslation();
    else setLocalShowTranslation(!localShowTranslation);
  };

  const activeItemRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isArabic = targetLangCode === 'ar';

  const fontSizes: TranscriptFontSize[] = ['sm', 'md', 'lg', 'xl'];
  const currentSizeIndex = fontSizes.indexOf(fontSize);

  const decreaseFontSize = () => {
    if (currentSizeIndex > 0) {
      handleSetFontSize(fontSizes[currentSizeIndex - 1]);
    }
  };

  const increaseFontSize = () => {
    if (currentSizeIndex < fontSizes.length - 1) {
      handleSetFontSize(fontSizes[currentSizeIndex + 1]);
    }
  };

  // Center active line in sidebar when playback progresses
  useEffect(() => {
    if (autoScroll && activeItemRef.current && scrollContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentIndex, autoScroll]);

  // Multi-select helpers
  const lastSelectedIdxRef = useRef<number | null>(null);

  const toggleSelectIndex = (idx: number, isShiftKey = false) => {
    if (isShiftKey && lastSelectedIdxRef.current !== null) {
      const start = Math.min(lastSelectedIdxRef.current, idx);
      const end = Math.max(lastSelectedIdxRef.current, idx);
      const range: number[] = [];
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      setSelectedIndices((prev) => Array.from(new Set([...prev, ...range])).sort((a, b) => a - b));
    } else {
      setSelectedIndices((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx].sort((a, b) => a - b)
      );
      lastSelectedIdxRef.current = idx;
    }
  };

  const handleStartLoopForSelected = (repeatTimes: number) => {
    if (selectedIndices.length === 0) return;
    const startIdx = Math.min(...selectedIndices);
    const endIdx = Math.max(...selectedIndices);
    onStartMultiLoop(startIdx, endIdx, repeatTimes);
  };

  // Filter items by search
  const filteredSubtitles = subtitles.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const t1 = item.text.toLowerCase();
    const t2 = (item.vocalizedText || '').toLowerCase();
    const t3 = (item.transliteration || '').toLowerCase();
    const t4 = (item.translation || '').toLowerCase();
    return t1.includes(q) || t2.includes(q) || t3.includes(q) || t4.includes(q);
  });

  // Typography sizing classes
  const arabicFontClass = {
    sm: 'text-sm leading-relaxed',
    md: 'text-base leading-relaxed',
    lg: 'text-xl leading-relaxed',
    xl: 'text-2xl leading-relaxed',
  }[fontSize];

  const transliterationFontClass = {
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  }[fontSize];

  const translationFontClass = {
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  }[fontSize];

  return (
    <aside className={`h-full flex flex-col rounded-2xl overflow-hidden border shadow-sm transition-colors ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100 shadow-xl'
    }`}>
      {/* Header Toolbar */}
      <div className={`p-3 border-b flex items-center justify-between gap-2 flex-wrap ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className={`font-bold text-sm tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Transcript
            </span>
            <span className={`text-[10px] ml-1.5 font-mono px-1.5 py-0.5 rounded ${
              isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
            }`}>
              {subtitles.length} lines
            </span>
          </div>
        </div>

        {/* Action icons & Auto-scroll */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Auto-scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              autoScroll
                ? isLight
                  ? 'bg-rose-50 text-rose-600 border-rose-300 shadow-sm'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                : isLight
                ? 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title={autoScroll ? 'Auto-scroll is ON: automatically centers active line' : 'Auto-scroll is paused'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoScroll ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>Auto-Scroll</span>
          </button>

          {/* Font Size Scaler */}
          <div className={`flex items-center rounded-lg p-0.5 border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
          }`}>
            <button
              onClick={decreaseFontSize}
              disabled={currentSizeIndex === 0}
              className={`px-1.5 py-0.5 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                isLight ? 'text-slate-700 hover:text-black' : 'text-slate-300 hover:text-white'
              }`}
              title="Decrease transcript font size"
            >
              A-
            </button>
            <span className={`px-1.5 text-[10px] uppercase font-mono font-semibold ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              {fontSize}
            </span>
            <button
              onClick={increaseFontSize}
              disabled={currentSizeIndex === fontSizes.length - 1}
              className={`px-1.5 py-0.5 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                isLight ? 'text-slate-700 hover:text-black' : 'text-slate-300 hover:text-white'
              }`}
              title="Increase transcript font size"
            >
              A+
            </button>
          </div>

          {/* Multi-select toggle */}
          <button
            onClick={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              setSelectedIndices([]);
            }}
            className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
              isMultiSelectMode
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                : isLight
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Select multiple adjacent subtitles to loop them together"
          >
            {isMultiSelectMode ? <CheckSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> : <Square className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Multi-Loop</span>
          </button>
        </div>
      </div>

      {/* Layer Visibility Pills Toolbar */}
      <div className={`px-3 py-1.5 border-b flex items-center justify-between text-xs gap-1.5 flex-wrap ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900 border-slate-800/80'
      }`}>
        <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Show / Hide:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleArabic}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
              showArabic
                ? isLight
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : isLight
                ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                : 'bg-slate-800/60 text-slate-500 border-slate-700/60 line-through'
            }`}
            title="Toggle Arabic / Vocalized target text in sidebar"
          >
            {isArabic ? 'عربية' : 'Target'}
          </button>

          <button
            onClick={handleToggleTransliteration}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
              showTransliteration
                ? isLight
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : isLight
                ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                : 'bg-slate-800/60 text-slate-500 border-slate-700/60 line-through'
            }`}
            title="Toggle Romanized phonetics in sidebar"
          >
            abc
          </button>

          <button
            onClick={handleToggleTranslation}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
              showTranslation
                ? isLight
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : isLight
                ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                : 'bg-slate-800/60 text-slate-500 border-slate-700/60 line-through'
            }`}
            title="Toggle English / Native translation in sidebar"
          >
            EN
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`p-2.5 border-b ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800/80'
      }`}>
        <div className="relative">
          <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dialogue, keywords, translations..."
            className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                : 'bg-slate-800 text-slate-200 border-slate-700 placeholder-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 hover:text-rose-500 ${isLight ? 'text-slate-400' : 'text-slate-400 hover:text-white'}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Subtitle Rows */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredSubtitles.map((item, originalIdx) => {
          const actualIndex = subtitles.findIndex((s) => s.id === item.id);
          const idxToUse = actualIndex !== -1 ? actualIndex : originalIdx;
          const isActive = idxToUse === currentIndex;
          const isSelected = selectedIndices.includes(idxToUse);
          const hasAnyLayerVisible = showArabic || showTransliteration || showTranslation;

          // Check if this card is currently looping (single or multi-sentence range)
          const isItemLooping = Boolean(loopConfig?.active && (
            loopConfig.type === 'single'
              ? loopConfig.startIndex === idxToUse
              : (idxToUse >= loopConfig.startIndex && idxToUse <= loopConfig.endIndex)
          ));

          return (
            <div
              key={item.id}
              ref={isActive ? activeItemRef : null}
              className={`group p-3 rounded-xl transition-all border ${
                isItemLooping
                  ? isLight
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-md'
                    : 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/20'
                  : isSelected
                  ? isLight
                    ? 'bg-amber-100/70 border-amber-400 ring-2 ring-amber-300'
                    : 'bg-amber-500/20 border-amber-500/60 ring-1 ring-amber-400'
                  : isActive
                  ? isLight
                    ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-400/50 shadow-sm'
                    : 'bg-rose-500/10 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
                  : isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                  : 'bg-slate-850/60 hover:bg-slate-800/60 border-slate-800/60'
              }`}
            >
              {/* Visible Clue: Prominent Banner when this sentence is actively looping */}
              {isItemLooping && loopConfig && (
                <div className="mb-2 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-between text-xs font-bold shadow-md shadow-amber-500/25 animate-pulse">
                  <div className="flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                    <span>
                      {loopConfig.type === 'range'
                        ? `MULTI-SENTENCE LOOP (${loopConfig.currentCount + 1} of ${loopConfig.targetCount === 999999 ? '∞' : loopConfig.targetCount})`
                        : `LOOPING ACTIVE (${loopConfig.currentCount + 1} of ${loopConfig.targetCount === 999999 ? '∞' : loopConfig.targetCount})`}
                    </span>
                  </div>
                  {onStopLoop && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStopLoop();
                      }}
                      className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 hover:bg-slate-900 text-[10px] font-extrabold cursor-pointer"
                      title="Stop loop repetition"
                    >
                      STOP LOOP ⏹
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                {/* Checkbox if in multi-select mode */}
                {isMultiSelectMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectIndex(idxToUse, e.shiftKey);
                    }}
                    className="mt-1 text-slate-400 hover:text-amber-500 cursor-pointer p-0.5"
                    title={isSelected ? 'Deselect this sentence' : 'Select this sentence (Shift-click for range)'}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 hover:text-amber-400" />
                    )}
                  </button>
                )}

                {/* Subtitle Dialogue & Rich Information */}
                <div 
                  className="flex-1 cursor-pointer min-w-0"
                  onClick={(e) => {
                    if (isMultiSelectMode) {
                      toggleSelectIndex(idxToUse, e.shiftKey);
                    } else {
                      onSeekToSubtitle(item);
                    }
                  }}
                >
                  {/* Card Header Info Bar (Sentence #, Timestamp, Duration, Status) */}
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                      isActive 
                        ? 'bg-rose-500 text-white' 
                        : isLight 
                        ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{item.id || idxToUse + 1}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeekToSubtitle(item);
                      }}
                      className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        isLight 
                          ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200' 
                          : 'bg-slate-800 text-slate-400 hover:text-rose-400'
                      }`}
                      title={`Play from ${formatTime(item.start)}`}
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>{formatTime(item.start)} - {formatTime(item.end)}</span>
                      <span className="opacity-60">({(item.end - item.start).toFixed(1)}s)</span>
                    </button>

                    {isActive && (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        ▶ Active
                      </span>
                    )}

                    {isItemLooping && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <Repeat className="w-3 h-3 animate-spin" />
                        Looping
                      </span>
                    )}
                  </div>

                  {/* Arabic / Target Text */}
                  {showArabic && (
                    <p 
                      className={`font-semibold ${arabicFontClass} ${isArabic ? 'font-arabic text-right' : ''} ${
                        isLight ? 'text-slate-900' : 'text-slate-200'
                      }`}
                      dir={isArabic ? 'rtl' : 'ltr'}
                    >
                      {item.vocalizedText || item.text}
                    </p>
                  )}

                  {/* Transliteration */}
                  {showTransliteration && item.transliteration && (
                    <p className={`font-mono mt-0.5 ${transliterationFontClass} ${
                      isLight ? 'text-indigo-600 font-medium' : 'text-indigo-300/85'
                    }`}>
                      {item.transliteration}
                    </p>
                  )}

                  {/* Translation */}
                  {showTranslation && (
                    <p className={`mt-1 font-normal ${translationFontClass} ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      {item.translation}
                    </p>
                  )}

                  {/* Card Information: Root Words & Key Vocabulary Chips */}
                  {item.rootWords && item.rootWords.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                      <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Roots:</span>
                      {item.rootWords.map((rw, rwIdx) => (
                        <span
                          key={rwIdx}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-700'
                              : 'bg-slate-800/80 border-slate-700 text-slate-300'
                          }`}
                        >
                          <span className="font-semibold">{rw.word}</span> <span className="opacity-60">({rw.root})</span> → {rw.meaning}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Information: Notes / Context Tag */}
                  {item.notes && (
                    <p className={`mt-1 text-[11px] italic flex items-center gap-1 ${
                      isLight ? 'text-amber-800' : 'text-amber-300/80'
                    }`}>
                      <span>💡</span>
                      <span>{item.notes}</span>
                    </p>
                  )}

                  {!hasAnyLayerVisible && (
                    <p className="text-[11px] text-slate-400 italic py-1">
                      [Dialogue line at {formatTime(item.start)} - click to play]
                    </p>
                  )}
                </div>

                {/* Action buttons (Listen, Pin, NativeStyle & Repeat Loop) */}
                <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity shrink-0">
                  {/* Pin to Phrasebook */}
                  {onPinSentence && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPinSentence(item);
                      }}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                        pinnedSentenceIds?.has(item.id)
                          ? 'bg-rose-500 text-white shadow-xs'
                          : isLight
                          ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-slate-700/60'
                      }`}
                      title={pinnedSentenceIds?.has(item.id) ? 'Pinned in your Phrasebook' : 'Pin to Phrasebook'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${pinnedSentenceIds?.has(item.id) ? 'fill-white' : ''}`} />
                    </button>
                  )}

                  {/* NativeStyle Quick Check */}
                  {onCheckNativeStyle && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCheckNativeStyle(item.translation || item.text);
                      }}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isLight
                          ? 'text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
                          : 'text-indigo-400 hover:bg-indigo-950/40 border border-indigo-800'
                      }`}
                      title="Check idiom in NativeStyle Studio"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(item.vocalizedText || item.text, targetLangCode);
                    }}
                    className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                      isLight 
                        ? 'text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-slate-200' 
                        : 'text-slate-400 hover:text-rose-400 hover:bg-slate-700/60'
                    }`}
                    title="Listen to sentence pronunciation"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Repeat Loop Button with Standout Active Visual Clue */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isItemLooping && onStopLoop) {
                        onStopLoop();
                      } else {
                        onStartSingleLoop(item, 5);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 font-bold text-xs ${
                      isItemLooping
                        ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400 shadow-md shadow-amber-500/40 animate-pulse'
                        : isLight
                        ? 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300'
                    }`}
                    title={isItemLooping ? 'Click to stop repeating this sentence' : 'Repeat this sentence 5 times'}
                  >
                    <Repeat className={`w-3.5 h-3.5 ${isItemLooping ? 'animate-spin' : 'text-amber-500'}`} style={isItemLooping ? { animationDuration: '2s' } : undefined} />
                    {isItemLooping && loopConfig ? (
                      <span className="font-mono font-black">
                        STOP ({loopConfig.currentCount + 1}/{loopConfig.targetCount === 999999 ? '∞' : loopConfig.targetCount})
                      </span>
                    ) : (
                      <span>Repeat (5x)</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredSubtitles.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            {searchQuery ? (
              <span>No subtitles match &ldquo;{searchQuery}&rdquo;</span>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p className="font-medium text-slate-600 dark:text-slate-300">No subtitles loaded for this video yet.</p>
                <p className="text-[11px] text-slate-500">Upload a .srt/.vtt file with the ⬆ button or select a video from the Library.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Multi-Select Floating Footer Bar */}
      {isMultiSelectMode && selectedIndices.length > 0 && (() => {
        const minIdx = Math.min(...selectedIndices);
        const maxIdx = Math.max(...selectedIndices);
        const startSub = subtitles[minIdx];
        const endSub = subtitles[maxIdx];
        const isMultiLoopingActive = loopConfig?.active && loopConfig.type === 'range';

        return (
          <div className={`p-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg transition-colors ${
            isLight ? 'bg-amber-50/95 border-amber-300' : 'bg-slate-900 border-amber-500/40'
          }`}>
            <div className="flex flex-col">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
                <Repeat className="w-3.5 h-3.5" />
                <span>Range Selected: Sentence #{startSub?.id || minIdx + 1} to #{endSub?.id || maxIdx + 1} ({selectedIndices.length} lines)</span>
              </span>
              <span className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {formatTime(startSub?.start || 0)} – {formatTime(endSub?.end || 0)} (Total: {((endSub?.end || 0) - (startSub?.start || 0)).toFixed(1)}s)
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {isMultiLoopingActive && onStopLoop ? (
                <button
                  onClick={onStopLoop}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-sm animate-pulse cursor-pointer"
                >
                  STOP LOOP ⏹
                </button>
              ) : null}

              <button
                onClick={() => handleStartLoopForSelected(2)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                title="Loop selected sentence range 2 times"
              >
                Loop 2x
              </button>
              <button
                onClick={() => handleStartLoopForSelected(3)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                title="Loop selected sentence range 3 times"
              >
                Loop 3x
              </button>
              <button
                onClick={() => handleStartLoopForSelected(5)}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer"
                title="Loop selected sentence range 5 times"
              >
                Loop 5x
              </button>
              <button
                onClick={() => handleStartLoopForSelected(Infinity)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 hover:bg-black text-xs font-bold cursor-pointer border border-amber-400"
                title="Loop selected sentence range indefinitely"
              >
                Loop ∞
              </button>
              <button
                onClick={() => handleStartLoopForSelected(1)}
                className={`px-2 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                  isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
                title="Play selected sentence range once"
              >
                Play Once
              </button>
              <button
                onClick={() => {
                  setSelectedIndices([]);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer ml-1"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}
    </aside>
  );
};
