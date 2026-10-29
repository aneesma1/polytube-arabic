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
  Key
} from 'lucide-react';
import { SubtitleItem, LoopConfig, SavedWord, SavedSentence } from '../types';
import { 
  cleanArabicWord, 
  lookupArabicWord, 
  transliterateArabic, 
  speakWord,
  removeTashkeel,
  hasTashkeel,
  smartVocalizeParticles
} from '../utils/arabic';
import { analyzeWordWithAI, getSavedGeminiKey } from '../utils/aiClientService';
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
  theme?: 'light' | 'dark';
  targetTranslationLang?: 'ml' | 'en';
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
  theme = 'light',
  targetTranslationLang = 'ml',
}) => {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'transcript' | 'linguistics' | 'deck'>('transcript');
  
  // Selected word for linguistic root inspection
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [showTashkeel, setShowTashkeel] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<'md' | 'lg' | 'xl'>('lg');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Gemini AI deep discovery state
  const [aiDiscovery, setAiDiscovery] = useState<any | null>(null);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Auto-select first word when active subtitle changes if no word was manually selected
  useEffect(() => {
    if (currentSubtitle && !selectedWord) {
      const words = currentSubtitle.text.split(/\s+/).map(cleanArabicWord).filter(w => w.length > 2);
      if (words.length > 0) {
        setSelectedWord(words[0]);
      }
    }
  }, [currentSubtitle, selectedWord]);

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

  // Handle word selection from subtitle or transcript
  const handleSelectWord = (word: string) => {
    const clean = cleanArabicWord(word);
    setSelectedWord(clean);
    setAiDiscovery(null);
    setAiError(null);
    setActiveTab('linguistics');
    handleDiscoverWord(clean);
  };

  // Trigger Gemini Deep Discovery for the selected word directly client-side
  const handleDiscoverWord = async (wordToDiscover?: string) => {
    const targetWord = wordToDiscover || selectedWord;
    if (!targetWord) return;
    setIsDiscovering(true);
    setAiError(null);

    const hasKey = Boolean(getSavedGeminiKey());
    if (!hasKey) {
      setIsDiscovering(false);
      setAiError('need_key');
      return;
    }

    try {
      const res = await analyzeWordWithAI(
        targetWord,
        currentSubtitle?.text || '',
        'Arabic',
        targetTranslationLang === 'en' ? 'English' : 'Malayalam'
      );

      if (res.success && res.discovery) {
        setAiDiscovery(res.discovery);
      } else {
        setAiError(res.error || 'Could not complete AI analysis');
      }
    } catch (err: any) {
      setAiError(err.message || 'AI service error');
    } finally {
      setIsDiscovering(false);
    }
  };

  // Perform client morphological analysis
  const currentAnalysis = selectedWord ? lookupArabicWord(selectedWord, currentSubtitle?.rootWords) : null;
  const isSelectedWordSaved = selectedWord ? savedWords.some(w => w.word === selectedWord) : false;

  const handleSaveCurrentWord = () => {
    if (!selectedWord || !currentSubtitle) return;
    const item: SavedWord = {
      id: `${selectedWord}-${Date.now()}`,
      word: selectedWord,
      vocalized: selectedWord,
      transliteration: currentAnalysis?.transliteration || transliterateArabic(selectedWord),
      translation: currentAnalysis?.translation || currentSubtitle.translation,
      root: currentAnalysis?.root,
      partOfSpeech: currentAnalysis?.partOfSpeech,
      contextSentence: currentSubtitle.vocalizedText || currentSubtitle.text,
      contextTranslation: currentSubtitle.translation,
      videoId: '',
      videoTitle: videoTitle || 'Arabic Session',
      timestamp: currentSubtitle.start,
      savedAt: Date.now(),
      reviewedCount: 0,
    };
    onSaveWord(item);
  };

  // Export handlers
  const handleExportMarkdown = () => {
    const md = exportToMarkdown(savedSentences, savedWords, videoTitle);
    downloadFile(md, `Arabic-Study-Session-${Date.now()}.md`, 'text/markdown;charset=utf-8');
    setExportNotice('✓ Downloaded Markdown Study Notes!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExportHtml = () => {
    exportToHtmlFile(savedSentences, savedWords, videoTitle);
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
    exportToPrintableHtml(savedSentences, savedWords, videoTitle);
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
            onClick={() => setActiveTab('linguistics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'linguistics'
                ? isLight
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                  : 'bg-slate-800 text-indigo-400 shadow-xs border border-slate-700'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Word Anatomy</span>
            {selectedWord && (
              <span className="px-1.5 py-0.2 rounded bg-indigo-500/15 text-[10px] font-arabic font-bold text-indigo-700 dark:text-indigo-300">
                {selectedWord}
              </span>
            )}
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
            onClick={() => setShowTashkeel(!showTashkeel)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
              showTashkeel
                ? isLight ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-rose-950/50 text-rose-300 border-rose-800'
                : isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={hasSourceTashkeel ? "Toggle Arabic Tashkeel / Harakat vowels" : "Tashkeel: Smart core particles enabled (Raw source has no Harakat)"}
          >
            {showTashkeel ? (hasSourceTashkeel ? 'Vowels ON ✓' : 'Vowels ON (Core) ✓') : 'Vowels OFF'}
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

      {/* 2. Main Content Viewport */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 pb-36">
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
                  onClick={() => onSeekToSubtitle(sub)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isActive
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

                      {/* Loop line */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (loopConfig.active && loopConfig.startIndex === idx) {
                            onStopLoop();
                          } else {
                            onStartSingleLoop(sub, 3);
                          }
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          loopConfig.active && loopConfig.startIndex === idx
                            ? 'text-amber-500 animate-spin'
                            : 'text-slate-400 hover:text-rose-500'
                        }`}
                        title="Loop sentence (3x)"
                      >
                        <Repeat className="w-3.5 h-3.5" />
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
                            // Reverse navigation: click seeks the video to this subtitle!
                            onSeekToSubtitle(sub);
                            if (clean) {
                              setSelectedWord(clean);
                              handleDiscoverWord(clean);
                            }
                          }}
                          className={`inline-block mx-0.5 px-1 py-0.5 rounded transition-all cursor-pointer ${
                            isWordActive
                              ? 'bg-indigo-600 text-white font-bold shadow-xs'
                              : isLight
                              ? 'hover:bg-indigo-50 hover:text-indigo-600'
                              : 'hover:bg-indigo-950/60 hover:text-indigo-300'
                          }`}
                          title={`Click to seek to this subtitle & analyze: "${clean}"`}
                        >
                          {w}
                        </span>
                      );
                    })}
                  </div>

                  {/* Phonetic Transliteration */}
                  {sub.transliteration && (
                    <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 mt-1 select-text">
                      /{sub.transliteration}/
                    </div>
                  )}

                  {/* Translation (Malayalam / English) */}
                  <div className={`text-xs font-semibold mt-1 select-text ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    {sub.translation}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: LINGUISTIC DEEP STUDY (ROOTS & MORPHOLOGY) */}
        {activeTab === 'linguistics' && (
          <div className="space-y-4">
            {selectedWord ? (
              <>
                {/* Word Inspector Card */}
                <div className={`p-4 rounded-2xl border-2 shadow-xs ${
                  isLight ? 'bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 border-indigo-200' : 'bg-slate-850 border-slate-750'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                      Arabic Word Anatomy
                    </span>
                    <button
                      onClick={() => speakWord(selectedWord, 'ar-SA')}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                      title="Listen to pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-center my-3">
                    <h2 
                      className="text-4xl sm:text-5xl font-black font-arabic tracking-wide my-2" 
                      style={{ color: isLight ? '#0f172a' : '#ffffff' }}
                      dir="rtl"
                    >
                      {selectedWord}
                    </h2>
                    <span className="text-sm font-mono text-indigo-600 dark:text-indigo-300 mt-1 block font-bold">
                      /{currentAnalysis?.transliteration || transliterateArabic(selectedWord)}/
                    </span>
                  </div>

                  {/* AI Root & Pattern (Dynamic across ANY video) */}
                  {aiDiscovery?.root && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className={`p-3 rounded-2xl border-2 text-center shadow-xs ${
                        isLight ? 'bg-amber-50 border-amber-300' : 'bg-amber-950/40 border-amber-700'
                      }`}>
                        <span className="text-[11px] uppercase font-black tracking-wider block mb-1 text-amber-900 dark:text-amber-300">
                          AI ROOT (الجذر)
                        </span>
                        <span className="text-2xl font-black font-arabic tracking-widest block" style={{ color: isLight ? '#78350f' : '#fef3c7' }}>
                          {aiDiscovery.root}
                        </span>
                      </div>

                      <div className={`p-3 rounded-2xl border-2 text-center shadow-xs ${
                        isLight ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-950/40 border-emerald-700'
                      }`}>
                        <span className="text-[11px] uppercase font-black tracking-wider block mb-1 text-emerald-900 dark:text-emerald-300">
                          AI PATTERN (الوزن)
                        </span>
                        <span className="text-2xl font-black font-arabic tracking-wide block" style={{ color: isLight ? '#064e3b' : '#d1fae5' }}>
                          {aiDiscovery.pattern || '—'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Meaning & Context Card */}
                  <div className={`mt-3 p-4 rounded-2xl border-2 shadow-xs ${
                    isLight 
                      ? 'bg-white border-slate-200' 
                      : 'bg-slate-800/95 border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                        MEANING & CONTEXT ({targetTranslationLang === 'en' ? 'ENGLISH' : 'MALAYALAM'})
                      </span>
                      {currentAnalysis?.partOfSpeech && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                          {currentAnalysis.partOfSpeech}
                        </span>
                      )}
                    </div>

                    {/* Word Meaning adapted to targetTranslationLang */}
                    {targetTranslationLang === 'en' ? (
                      <div 
                        className="text-lg sm:text-xl font-black leading-snug"
                        style={{ color: isLight ? '#0f172a' : '#ffffff' }}
                      >
                        {currentAnalysis?.translation || aiDiscovery?.translation || 'Authentic Arabic vocabulary entry'}
                      </div>
                    ) : (
                      <div>
                        <div 
                          className="text-lg sm:text-xl font-black leading-snug"
                          style={{ color: isLight ? '#0f172a' : '#ffffff' }}
                        >
                          {currentAnalysis?.translationMl || aiDiscovery?.translationMl || currentAnalysis?.translation}
                        </div>
                        {currentAnalysis?.translation && (
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                            English: {currentAnalysis.translation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Context in Current Line */}
                    {currentSubtitle && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <span className="font-bold block text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Context in Sentence:
                        </span>
                        
                        {/* Arabic Sentence - Big, Bold, Crystal Clear with Full Contrast */}
                        <div 
                          className="font-arabic font-bold text-xl sm:text-2xl text-right leading-loose my-2 select-text" 
                          style={{ color: isLight ? '#0f172a' : '#ffffff' }}
                          dir="rtl"
                        >
                          {currentSubtitle.vocalizedText || currentSubtitle.text}
                        </div>

                        {/* Full Sentence Translation in Selected Language - Bulletproof Contrast */}
                        <div 
                          className="mt-2.5 p-3.5 rounded-xl border-2 shadow-xs transition-colors"
                          style={{
                            backgroundColor: isLight ? '#f8fafc' : '#0f172a',
                            borderColor: isLight ? '#cbd5e1' : '#334155'
                          }}
                        >
                          <span 
                            className="text-[11px] uppercase font-black block mb-1 tracking-wider"
                            style={{ color: isLight ? '#475569' : '#94a3b8' }}
                          >
                            {targetTranslationLang === 'en' ? 'SENTENCE TRANSLATION (ENGLISH):' : 'വാക്യത്തിന്റെ പൂർണ്ണ അർത്ഥം (MALAYALAM):'}
                          </span>
                          <p 
                            className="text-sm sm:text-base font-extrabold leading-relaxed"
                            style={{ color: isLight ? '#0f172a' : '#f8fafc' }}
                          >
                            {currentSubtitle.translation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action: Save Word */}
                  <div className="mt-3">
                    <button
                      onClick={handleSaveCurrentWord}
                      disabled={isSelectedWordSaved}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelectedWordSaved
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 cursor-default'
                          : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-md active:scale-98'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{isSelectedWordSaved ? 'Saved to Flashcards ✓' : 'Save Word to Flashcards'}</span>
                    </button>
                  </div>
                </div>

                {/* Gemini AI Deep Discovery Box */}
                <div className={`p-4 rounded-2xl border-2 shadow-xs ${
                  isLight ? 'bg-indigo-50/60 border-indigo-200' : 'bg-indigo-950/40 border-indigo-900/70'
                }`}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-indigo-700 dark:text-indigo-300">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Linguistic Nuances & SLA Insights</span>
                    </div>
                    <button
                      onClick={() => handleDiscoverWord()}
                      disabled={isDiscovering}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {isDiscovering ? <Bot className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>{isDiscovering ? 'Analyzing...' : 'Deep Analysis'}</span>
                    </button>
                  </div>

                  {aiError === 'need_key' ? (
                    <div className="p-3 rounded-xl bg-indigo-500/10 border-2 border-indigo-500/30 text-indigo-950 dark:text-indigo-200 text-xs mb-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Key className="w-4 h-4 text-indigo-500" />
                        <span>Google Gemini API Key Required</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                        To enable real-time AI word analysis and cultural insights for <strong>any YouTube video</strong> on GitHub Pages, add your free key in <strong>Settings (⚙)</strong>.
                      </p>
                    </div>
                  ) : aiError ? (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-1.5 mb-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>{aiError}</span>
                    </div>
                  ) : null}

                  {aiDiscovery ? (
                    <div className="space-y-3 mt-2">
                      {aiDiscovery.commonCalqueTrap && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 text-xs shadow-2xs">
                          <span className="font-extrabold text-rose-900 dark:text-rose-200 block mb-1 text-xs">
                            ⚠️ Common Learner Trap to Avoid:
                          </span>
                          <p 
                            className="leading-relaxed font-medium"
                            style={{ color: isLight ? '#0f172a' : '#f8fafc' }}
                          >
                            {aiDiscovery.commonCalqueTrap}
                          </p>
                        </div>
                      )}

                      {aiDiscovery.collocations?.length > 0 && (
                        <div className="space-y-2.5">
                          <span 
                            className="text-xs font-black block tracking-wide uppercase"
                            style={{ color: isLight ? '#0f172a' : '#f8fafc' }}
                          >
                            Authentic Arabic Collocations & Phrases:
                          </span>
                          {aiDiscovery.collocations.map((c: any, idx: number) => (
                            <div 
                              key={idx} 
                              className="p-3.5 rounded-xl border-2 text-xs shadow-xs transition-colors"
                              style={{
                                backgroundColor: isLight ? '#ffffff' : '#1e293b',
                                borderColor: isLight ? '#e2e8f0' : '#334155'
                              }}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <button
                                  onClick={() => speakWord(c.phrase.split('(')[0].trim(), 'ar-SA')}
                                  className="p-1 rounded text-slate-400 hover:text-amber-500 cursor-pointer"
                                  title="Listen to phrase"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                                <span 
                                  className="font-black font-arabic text-xl sm:text-2xl text-right leading-loose" 
                                  style={{ color: isLight ? '#4338ca' : '#a5b4fc' }}
                                  dir="rtl"
                                >
                                  {c.phrase}
                                </span>
                              </div>
                              <p 
                                className="text-xs font-semibold italic mt-1 font-arabic text-right leading-relaxed" 
                                style={{ color: isLight ? '#334155' : '#cbd5e1' }}
                                dir="rtl"
                              >
                                &ldquo;{c.example}&rdquo;
                              </p>
                              {c.meaning && (
                                <p 
                                  className="text-xs font-bold mt-2 pt-2 border-t" 
                                  style={{ 
                                    borderColor: isLight ? '#f1f5f9' : '#334155',
                                    color: isLight ? '#0f172a' : '#f8fafc' 
                                  }}
                                >
                                  {c.meaning}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <span>Click &ldquo;Deep Analysis&rdquo; to explore authentic collocations, nuance distinctions, and common learner traps.</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Click any Arabic word in the transcript or video subtitles to inspect its trilateral root and pattern.</p>
              </div>
            )}
          </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedWords.map(w => (
                    <div key={w.id} className="p-2.5 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="min-w-0">
                        <span className="font-arabic font-bold text-base text-indigo-600 dark:text-indigo-400 block" dir="rtl">
                          {w.vocalized || w.word}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 truncate block">
                          {w.translation}
                        </span>
                        {w.root && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-arabic font-semibold">
                            Root: {w.root}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onRemoveWord(w.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer shrink-0"
                        title="Remove word"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
