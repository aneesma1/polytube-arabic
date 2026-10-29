import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Repeat, 
  Volume2, 
  Check, 
  Sliders, 
  Mic, 
  Sparkles,
  PauseCircle,
  PlayCircle,
  Clock,
  BookOpen,
  Info,
  Bookmark
} from 'lucide-react';
import { SubtitleItem, LoopConfig } from '../types';
import { speakWord, cleanArabicWord } from '../utils/arabic';
import { formatTime } from '../utils/youtube';

interface SubtitleWindowProps {
  currentSubtitle: SubtitleItem | null;
  previousSubtitle: SubtitleItem | null;
  nextSubtitle: SubtitleItem | null;
  allSubtitles: SubtitleItem[];
  currentIndex: number;
  loopConfig: LoopConfig;
  onStartSingleLoop: (subtitle: SubtitleItem, count: number) => void;
  onStartMultiLoop: (startIndex: number, endIndex: number, count: number) => void;
  onStopLoop: () => void;
  onSeekToSubtitle: (subtitle: SubtitleItem) => void;
  onNextSubtitle: () => void;
  onPrevSubtitle: () => void;
  autoPause: boolean;
  onToggleAutoPause: () => void;
  onWordClick: (word: string, context: SubtitleItem) => void;
  onOpenShadowing: (subtitle: SubtitleItem) => void;
  onOpenEditor?: () => void;
  targetLangCode: string;
  theme?: 'light' | 'dark';
  onPinSentence?: (subtitle: SubtitleItem) => void;
  isCurrentPinned?: boolean;
  onCheckNativeStyle?: (text: string) => void;
}

export const SubtitleWindow: React.FC<SubtitleWindowProps> = ({
  currentSubtitle,
  previousSubtitle,
  nextSubtitle,
  allSubtitles,
  currentIndex,
  loopConfig,
  onStartSingleLoop,
  onStartMultiLoop,
  onStopLoop,
  onSeekToSubtitle,
  onNextSubtitle,
  onPrevSubtitle,
  autoPause,
  onToggleAutoPause,
  onWordClick,
  onOpenShadowing,
  onOpenEditor,
  targetLangCode,
  theme = 'light',
  onPinSentence,
  isCurrentPinned = false,
  onCheckNativeStyle,
}) => {
  const isLight = theme === 'light';

  // UI Display toggles
  const [showTashkeel, setShowTashkeel] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [showLoopMenu, setShowLoopMenu] = useState(false);
  const [customLoopCount, setCustomLoopCount] = useState<number>(3);
  const [adjacentSpan, setAdjacentSpan] = useState<number>(2);

  const isArabic = targetLangCode === 'ar';

  // Fallback to closest available subtitle so the card NEVER loses its rich information
  const activeSub: SubtitleItem | null =
    currentSubtitle ||
    allSubtitles[currentIndex] ||
    (allSubtitles.length > 0 ? allSubtitles[0] : null);

  // Check if currently active subtitle is in a repeat loop
  const isCurrentlyLooping = Boolean(
    loopConfig?.active &&
      activeSub &&
      (loopConfig.type === 'single'
        ? allSubtitles.findIndex((s) => s.id === activeSub.id) === loopConfig.startIndex
        : allSubtitles.findIndex((s) => s.id === activeSub.id) >= loopConfig.startIndex &&
          allSubtitles.findIndex((s) => s.id === activeSub.id) <= loopConfig.endIndex)
  );

  const getTargetText = (item: SubtitleItem) => {
    if (isArabic) {
      if (!showTashkeel) {
        return (item.text || item.vocalizedText || '').replace(/[\u064B-\u065F\u0670]/g, '');
      }
      return item.vocalizedText || item.text;
    }
    return item.text;
  };

  const handleStartLoop = (count: number) => {
    if (!activeSub) return;
    onStartSingleLoop(activeSub, count);
    setShowLoopMenu(false);
  };

  const handleStartAdjacentLoop = (count: number) => {
    if (!activeSub) return;
    const currentIdx = allSubtitles.findIndex((s) => s.id === activeSub.id);
    const startIndex = Math.max(0, currentIdx >= 0 ? currentIdx : 0);
    const endIndex = Math.min(allSubtitles.length - 1, startIndex + adjacentSpan - 1);
    onStartMultiLoop(startIndex, endIndex, count);
    setShowLoopMenu(false);
  };

  // Font size classes
  const targetFontSizeClass =
    fontSize === 'huge'
      ? 'text-2xl sm:text-3xl'
      : fontSize === 'large'
      ? 'text-xl sm:text-2xl'
      : 'text-lg sm:text-xl';

  return (
    <div
      className={`w-full rounded-2xl p-4 sm:p-5 border transition-colors flex flex-col gap-3.5 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800 shadow-md'
          : 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl'
      }`}
    >
      {/* Top Bar of Subtitle Window: Context & Preferences */}
      <div
        className={`flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800/80'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            Interactive Subtitle Studio
          </span>
          {activeSub && (
            <span
              className={`text-xs font-mono font-medium flex items-center gap-1 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <Clock className="w-3 h-3 text-rose-500" />
              <span>
                {formatTime(activeSub.start)} – {formatTime(activeSub.end)}
              </span>
              <span className="text-[10px] text-slate-400">
                ({(activeSub.end - activeSub.start).toFixed(1)}s)
              </span>
            </span>
          )}
        </div>

        {/* Feature Switches */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Tashkeel diacritics toggle (for Arabic) */}
          {isArabic && (
            <button
              onClick={() => setShowTashkeel(!showTashkeel)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                showTashkeel
                  ? isLight
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : isLight
                  ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle Arabic Harakat (Tashkeel / Short Vowels)"
            >
              <span>حركات Tashkeel</span>
              {showTashkeel && <Check className="w-3 h-3" />}
            </button>
          )}

          {/* Transliteration toggle */}
          <button
            onClick={() => setShowTransliteration(!showTransliteration)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
              showTransliteration
                ? isLight
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : isLight
                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle phonetic Romanization"
          >
            <span>Phonetics</span>
            {showTransliteration && <Check className="w-3 h-3" />}
          </button>

          {/* Auto-Pause Toggle */}
          <button
            onClick={onToggleAutoPause}
            className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
              autoPause
                ? isLight
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : isLight
                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title="Automatically pause after each sentence for shadowing / dictation"
          >
            <span>Auto-Pause</span>
            {autoPause ? <PauseCircle className="w-3 h-3 text-rose-600" /> : <PlayCircle className="w-3 h-3 text-slate-400" />}
          </button>

          {/* Font Size Selector */}
          <div
            className={`flex items-center rounded-lg p-0.5 border text-xs ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
            }`}
          >
            {(['normal', 'large', 'huge'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                  fontSize === size
                    ? isLight
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'bg-slate-700 text-white font-bold'
                    : isLight
                    ? 'text-slate-500 hover:text-slate-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {size[0].toUpperCase()}
              </button>
            ))}
          </div>

          {/* Edit / Paste Subtitles Button */}
          {onOpenEditor && (
            <button
              onClick={onOpenEditor}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                isLight
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border-rose-500/40'
              }`}
              title="Add or Edit Subtitles for this video"
            >
              <span>+ Subtitles</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. PREVIOUS SUBTITLE (Context Cue) */}
      {previousSubtitle ? (
        <div
          onClick={() => onSeekToSubtitle(previousSubtitle)}
          className={`group rounded-xl px-3 py-2 transition-all cursor-pointer flex items-center justify-between border ${
            isLight
              ? 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200 text-slate-700'
              : 'bg-slate-950/40 hover:bg-slate-800/40 border-slate-800/50 text-slate-300'
          }`}
          title="Click to replay previous subtitle"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Previous ({formatTime(previousSubtitle.start)})
            </span>
            <p
              className={`text-xs truncate ${
                isArabic ? 'font-arabic text-right' : ''
              } ${isLight ? 'text-slate-600' : 'text-slate-400'}`}
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              {previousSubtitle.vocalizedText || previousSubtitle.text}
            </p>
          </div>
          <span
            className={`text-xs italic shrink-0 hidden sm:inline ml-2 truncate max-w-xs ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {previousSubtitle.translation}
          </span>
        </div>
      ) : null}

      {/* 2. CURRENT ACTIVE SUBTITLE (HERO CARD WITH RICH INFO) */}
      <div
        className={`relative rounded-2xl p-4 sm:p-5 transition-all border-2 ${
          isCurrentlyLooping
            ? isLight
              ? 'bg-amber-50/90 border-amber-400 ring-4 ring-amber-400/20 shadow-lg'
              : 'bg-amber-950/30 border-amber-400 ring-4 ring-amber-500/20 shadow-xl'
            : isLight
            ? 'bg-white border-slate-200/90 shadow-md'
            : 'bg-gradient-to-b from-slate-850 to-slate-950 border-rose-500/30 shadow-2xl'
        }`}
      >
        {/* STANDOUT REPEAT / LOOP ACTIVE BANNER (Unmistakable Visual Clue) */}
        {isCurrentlyLooping && loopConfig && (
          <div className="mb-3.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between text-xs font-extrabold shadow-md shadow-amber-500/30 animate-pulse">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 animate-spin" style={{ animationDuration: '2.5s' }} />
              <span>
                REPEAT LOOP ACTIVE • Repeating Sentence #{activeSub?.id || currentIndex + 1} (Cycle {loopConfig.currentCount + 1} of {loopConfig.targetCount === 999999 ? '∞' : loopConfig.targetCount})
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStopLoop();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 text-amber-300 hover:bg-slate-900 text-xs font-black tracking-wide shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95"
              title="Stop repeating this sentence"
            >
              STOP LOOP ⏹
            </button>
          </div>
        )}

        {activeSub ? (
          <div className="flex flex-col gap-3">
            {/* Card Metadata Header (Carries sentence number, timestamps, and badges) */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs pb-1.5 border-b border-dashed border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md font-bold font-mono text-[11px] ${
                    isCurrentlyLooping
                      ? 'bg-amber-500 text-slate-950'
                      : isLight
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  Sentence #{activeSub.id || currentIndex + 1} of {allSubtitles.length}
                </span>

                <span
                  className={`font-mono text-[11px] font-medium ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {formatTime(activeSub.start)} – {formatTime(activeSub.end)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span
                  className={`font-medium ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {activeSub.text.trim().split(/\s+/).length} words
                </span>
                {isCurrentlyLooping && (
                  <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Repeat className="w-3 h-3 animate-spin" />
                    Looping
                  </span>
                )}
              </div>
            </div>

            {/* Target Language with Clickable Interactive Word Tokens */}
            <div
              className={`leading-relaxed font-semibold tracking-wide ${targetFontSizeClass} ${
                isArabic ? 'font-arabic text-right' : ''
              }`}
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              {getTargetText(activeSub)
                .split(/\s+/)
                .map((word, wIdx) => {
                  const clean = cleanArabicWord(word);
                  return (
                    <button
                      key={wIdx}
                      onClick={() => onWordClick(word, activeSub)}
                      className={`inline-block px-1.5 py-0.5 m-0.5 rounded-lg font-bold transition-all cursor-pointer select-none ${
                        isLight
                          ? 'text-slate-900 hover:text-amber-800 hover:bg-amber-100 active:scale-95'
                          : 'text-slate-100 hover:text-amber-200 hover:bg-amber-500/20 active:scale-95'
                      }`}
                      title={`Click to analyze word "${clean}" (meanings, audio, roots)`}
                    >
                      {word}
                    </button>
                  );
                })}
            </div>

            {/* Phonetic Romanization (Transliteration) */}
            {showTransliteration && activeSub.transliteration && (
              <p
                className={`text-sm font-mono tracking-wide ${
                  isLight ? 'text-indigo-700 font-medium' : 'text-indigo-300/90'
                }`}
              >
                /{activeSub.transliteration}/
              </p>
            )}

            {/* Native Translation in Target Language (English, Malayalam, Hindi, Tamil, Arabic, Urdu) */}
            <div
              className={`pt-2.5 border-t flex items-start justify-between gap-3 ${
                isLight ? 'border-slate-200' : 'border-slate-800'
              }`}
            >
              <div className="flex-1">
                <p
                  className={`text-base sm:text-lg font-medium leading-relaxed ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}
                >
                  {activeSub.translation}
                </p>
              </div>

              {/* Fast Pronunciation Audio Button */}
              <button
                onClick={() =>
                  speakWord(activeSub.vocalizedText || activeSub.text, targetLangCode)
                }
                className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-rose-600 border border-slate-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Hear sentence spoken slowly with native pronunciation"
              >
                <Volume2 className="w-4 h-4 text-amber-500" />
              </button>
            </div>

            {/* Card Information Enrichment: Root Words & Vocabulary Tokens */}
            {activeSub.rootWords && activeSub.rootWords.length > 0 && (
              <div
                className={`pt-2 mt-1 border-t flex flex-wrap items-center gap-1.5 text-xs ${
                  isLight ? 'border-slate-100' : 'border-slate-800/60'
                }`}
              >
                <span
                  className={`font-semibold flex items-center gap-1 mr-1 text-[11px] ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Key Roots & Words:
                </span>
                {activeSub.rootWords.map((rw, rwIdx) => (
                  <button
                    key={rwIdx}
                    onClick={() => onWordClick(rw.word, activeSub)}
                    className={`px-2 py-0.5 rounded-md font-mono text-[11px] border transition-colors cursor-pointer flex items-center gap-1 ${
                      isLight
                        ? 'bg-slate-50 hover:bg-indigo-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-800'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                    title={`Click to analyze root word "${rw.word}"`}
                  >
                    <span className="font-bold">{rw.word}</span>
                    <span className="opacity-60 text-[10px]">({rw.root})</span>
                    <span className="text-slate-500">→ {rw.meaning}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Card Information Enrichment: Notes & Cultural/Grammar Context */}
            {activeSub.notes && (
              <div
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ${
                  isLight ? 'bg-amber-50/70 text-amber-900 border border-amber-200/80' : 'bg-slate-800/60 text-slate-300 border border-slate-700/60'
                }`}
              >
                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-medium">{activeSub.notes}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
              No subtitles loaded for this video yet.
            </p>
            {onOpenEditor && (
              <button
                onClick={onOpenEditor}
                className="mt-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Load or Edit Subtitles</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. REPEAT & LOOP CONTROL BAR WITH PROMINENT VISIBLE CLUE */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        {/* Navigation between sentences */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrevSubtitle}
            disabled={!previousSubtitle}
            className={`p-2 rounded-xl transition-colors cursor-pointer disabled:opacity-30 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Jump to Previous Sentence ([ key)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Quick Repeat / Replay Current Sentence Button */}
          <button
            onClick={() => activeSub && onSeekToSubtitle(activeSub)}
            disabled={!activeSub}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Replay Current Sentence (R key)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>Replay [R]</span>
          </button>

          <button
            onClick={onNextSubtitle}
            disabled={!nextSubtitle}
            className={`p-2 rounded-xl transition-colors cursor-pointer disabled:opacity-30 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Jump to Next Sentence (] key)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* PRIMARY REPEAT & LOOP CONTROLLER (Prominent Standout Clue When Pressed!) */}
        <div className="flex items-center gap-2">
          {loopConfig.active ? (
            /* Standout active button showing clearly that loop is pressed */
            <div className="flex items-center gap-2">
              <button
                onClick={onStopLoop}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/40 ring-4 ring-amber-400/30 flex items-center gap-2 animate-pulse cursor-pointer"
                title="Click to stop repeat loop"
              >
                <Repeat className="w-4 h-4 animate-spin" style={{ animationDuration: '2s' }} />
                <span>
                  LOOPING ACTIVE: {loopConfig.currentCount + 1} / {loopConfig.targetCount === 999999 ? '∞' : loopConfig.targetCount} [STOP ⏹]
                </span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <div
                className={`flex items-center p-1 rounded-xl border gap-1 ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                }`}
              >
                {/* Standout Primary "Repeat this sentence" Button */}
                <button
                  onClick={() => handleStartLoop(5)}
                  disabled={!activeSub}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                  title="Repeat this sentence 5 times"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Repeat (5x)</span>
                </button>

                {/* Quick Loop Presets */}
                <button
                  onClick={() => handleStartLoop(2)}
                  disabled={!activeSub}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title="Loop this sentence 2 times"
                >
                  2x
                </button>
                <button
                  onClick={() => handleStartLoop(3)}
                  disabled={!activeSub}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title="Loop this sentence 3 times"
                >
                  3x
                </button>
                {/* Infinite Loop */}
                <button
                  onClick={() => handleStartLoop(Infinity)}
                  disabled={!activeSub}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-0.5 ${
                    isLight
                      ? 'text-amber-800 hover:bg-amber-100'
                      : 'text-amber-400 hover:text-amber-300 hover:bg-slate-700'
                  }`}
                  title="Loop indefinitely until stopped"
                >
                  <span>Loop ∞</span>
                </button>

                {/* More Loop options (Multi-adjacent subtitles & custom numbers) */}
                <button
                  onClick={() => setShowLoopMenu(!showLoopMenu)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLight
                      ? 'text-slate-500 hover:text-slate-800 hover:bg-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Custom Loop Settings & Adjacent Subtitles"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dropdown for Custom and Multi-Adjacent Loop */}
              {showLoopMenu && (
                <div
                  className={`absolute right-0 bottom-full mb-2 w-72 rounded-xl p-3 shadow-2xl z-30 flex flex-col gap-3 border ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-slate-850 border-slate-700 text-slate-100'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between pb-1.5 border-b ${
                      isLight ? 'border-slate-200' : 'border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-amber-500" />
                      Loop Playback Settings
                    </span>
                    <button
                      onClick={() => setShowLoopMenu(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Multi-adjacent subtitles looping */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Loop Multiple Adjacent Subtitles:
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={adjacentSpan}
                        onChange={(e) => setAdjacentSpan(Number(e.target.value))}
                        className={`text-xs rounded-lg px-2 py-1 border ${
                          isLight
                            ? 'bg-slate-100 border-slate-200 text-slate-800'
                            : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      >
                        <option value={2}>2 adjacent lines</option>
                        <option value={3}>3 adjacent lines</option>
                        <option value={4}>4 adjacent lines</option>
                      </select>
                      <button
                        onClick={() => handleStartAdjacentLoop(customLoopCount)}
                        className="flex-1 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Loop {adjacentSpan} Lines ({customLoopCount}x)
                      </button>
                    </div>
                  </div>

                  {/* Custom loop count */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Custom Repetition Count:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={customLoopCount}
                        onChange={(e) => setCustomLoopCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className={`w-16 text-xs text-center rounded-lg px-2 py-1 border ${
                          isLight
                            ? 'bg-slate-100 border-slate-200 text-slate-800'
                            : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      />
                      <button
                        onClick={() => handleStartLoop(customLoopCount)}
                        className="flex-1 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                      >
                        Play Line {customLoopCount} Times
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shadowing Microphone Practice */}
          {activeSub && (
            <button
              onClick={() => onOpenShadowing(activeSub)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              title="Practice speaking this sentence into microphone"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Mic Shadow</span>
            </button>
          )}

          {/* Pin Sentence to Phrasebook */}
          {activeSub && onPinSentence && (
            <button
              onClick={() => onPinSentence(activeSub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                isCurrentPinned
                  ? 'bg-rose-500 text-white border-rose-600 shadow-rose-500/30'
                  : isLight
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border-rose-800'
              }`}
              title={isCurrentPinned ? 'Pinned in your Phrasebook' : 'Pin this sentence to your Saved Phrasebook'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isCurrentPinned ? 'fill-white' : 'text-rose-500'}`} />
              <span>{isCurrentPinned ? 'Pinned' : 'Pin Phrase'}</span>
            </button>
          )}

          {/* Check NativeStyle Calque Trap */}
          {activeSub && onCheckNativeStyle && (
            <button
              onClick={() => onCheckNativeStyle(activeSub.translation || activeSub.text)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              title="Check this phrase in NativeStyle Studio to learn idiomatic alternatives"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>NativeStyle</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
