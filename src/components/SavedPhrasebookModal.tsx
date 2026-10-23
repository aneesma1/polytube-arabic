import React, { useState } from 'react';
import { 
  X, 
  Bookmark, 
  BookMarked, 
  Play, 
  Repeat, 
  Volume2, 
  Trash2, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  RotateCw, 
  ExternalLink, 
  Filter, 
  Search, 
  Printer, 
  Flame,
  Tag,
  Clock
} from 'lucide-react';
import { SavedSentence, SavedWord } from '../types';
import { downloadFile } from '../utils/subtitles';

interface SavedPhrasebookModalProps {
  sentences: SavedSentence[];
  words: SavedWord[];
  onRemoveSentence: (id: string) => void;
  onRemoveWord: (id: string) => void;
  onUpdateSentenceMastery: (id: string, level: 'learning' | 'reviewing' | 'mastered') => void;
  onSeekAndPlaySentence?: (sentence: SavedSentence) => void;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const SavedPhrasebookModal: React.FC<SavedPhrasebookModalProps> = ({
  sentences,
  words,
  onRemoveSentence,
  onRemoveWord,
  onUpdateSentenceMastery,
  onSeekAndPlaySentence,
  onClose,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  // Mode: 'sentences' | 'words' | 'flashcards'
  const [activeView, setActiveView] = useState<'sentences' | 'words' | 'flashcards'>('sentences');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMastery, setFilterMastery] = useState<'all' | 'learning' | 'reviewing' | 'mastered'>('all');

  // Flashcard Mode State
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Filtered Sentences
  const filteredSentences = sentences.filter(s => {
    const matchesSearch = 
      s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.transliteration && s.transliteration.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.userNotes && s.userNotes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMastery = filterMastery === 'all' || s.masteryLevel === filterMastery;
    return matchesSearch && matchesMastery;
  });

  // Filtered Words
  const filteredWords = words.filter(w => 
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.root && w.root.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Flashcards deck is based on sentences (or words)
  const currentCard = filteredSentences[flashcardIdx] || filteredSentences[0];

  const handleNextCard = (level?: 'learning' | 'reviewing' | 'mastered') => {
    if (level && currentCard) {
      onUpdateSentenceMastery(currentCard.id, level);
    }
    setIsFlipped(false);
    setFlashcardIdx(prev => (prev + 1) % (filteredSentences.length || 1));
  };

  // Export to Anki / TSV
  const handleExportAnki = () => {
    if (filteredSentences.length === 0) return;
    const header = ['Front (Target Phrase)', 'Phonetic (Manglish/Tashkeel)', 'Back (Native Translation)', 'Context & Notes', 'Timestamp'];
    const rows = filteredSentences.map(s => {
      const escape = (val?: string) => `"${(val || '').replace(/"/g, '""')}"`;
      return [
        escape(s.vocalizedText || s.text),
        escape(s.transliteration || ''),
        escape(s.translation),
        escape(s.notes || s.userNotes || ''),
        escape(`${Math.floor(s.start)}s-${Math.floor(s.end)}s`)
      ].join('\t');
    });
    const tsv = [header.join('\t'), ...rows].join('\n');
    downloadFile(tsv, 'polytube_saved_phrasebook_anki.tsv', 'text/tab-separated-values;charset=utf-8');
  };

  // Export Printable Cheat Sheet
  const handlePrintSheet = () => {
    window.print();
  };

  // TTS audio playback
  const handleSpeak = (text: string, langCode: string = 'en') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode === 'ml' ? 'ml-IN' : langCode === 'hi' ? 'hi-IN' : langCode === 'ar' ? 'ar-SA' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-4xl rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-850'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Bookmark className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Saved References & Phrasebook</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  SRS Study Hub
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {sentences.length} pinned sentences &bull; {words.length} saved vocabulary entries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Anki Button */}
            <button
              onClick={handleExportAnki}
              disabled={filteredSentences.length === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50 ${
                isLight 
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300' 
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
              }`}
              title="Export to Anki TSV format"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Export Anki</span>
            </button>

            {/* Print Sheet */}
            <button
              onClick={handlePrintSheet}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-600' : 'hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Printable Study Sheet"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-600' : 'hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs & Search Filter */}
        <div className={`p-3 sm:px-5 border-b flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isLight ? 'border-slate-100 bg-white' : 'border-slate-800 bg-slate-900'
        }`}>
          {/* View Mode Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveView('sentences')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'sentences'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Pinned Sentences ({sentences.length})</span>
            </button>

            <button
              onClick={() => setActiveView('words')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'words'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Vocabulary ({words.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveView('flashcards');
                setIsFlipped(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'flashcards'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>SRS Flashcards</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phrases or notes..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-medium border outline-none ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-850 border-slate-750 text-slate-100'
              }`}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* 1. SENTENCES LIST VIEW */}
          {activeView === 'sentences' && (
            <div className="space-y-3">
              {filteredSentences.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Bookmark className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-semibold">No pinned sentences found</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    While watching a video, click the &ldquo;Pin / Star&rdquo; icon on any subtitle card to save phrases to this permanent reference list.
                  </p>
                </div>
              ) : (
                filteredSentences.map((sentence) => (
                  <div
                    key={sentence.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs ${
                      isLight ? 'bg-slate-50/70 border-slate-200 hover:bg-white' : 'bg-slate-850 border-slate-750 hover:bg-slate-800'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {sentence.videoTitle && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20 max-w-xs truncate">
                            {sentence.videoTitle}
                          </span>
                        )}
                        <span className={`text-[11px] font-mono flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Clock className="w-3 h-3" />
                          <span>{Math.floor(sentence.start)}s – {Math.floor(sentence.end)}s</span>
                        </span>
                        {sentence.masteryLevel && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            sentence.masteryLevel === 'mastered'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                              : sentence.masteryLevel === 'reviewing'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          }`}>
                            {sentence.masteryLevel}
                          </span>
                        )}
                      </div>

                      {/* Target Dialogue Text */}
                      <div className="text-base font-bold tracking-wide">
                        {sentence.vocalizedText || sentence.text}
                      </div>

                      {/* Transliteration */}
                      {sentence.transliteration && (
                        <div className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">
                          {sentence.transliteration}
                        </div>
                      )}

                      {/* Native Translation */}
                      <div className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {sentence.translation}
                      </div>

                      {/* Learner Notes */}
                      {(sentence.notes || sentence.userNotes) && (
                        <div className={`text-[11px] p-2 rounded-xl border ${
                          isLight ? 'bg-amber-50/50 border-amber-200/80 text-amber-800' : 'bg-amber-950/20 border-amber-900/30 text-amber-300'
                        }`}>
                          💡 {sentence.userNotes || sentence.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions: Jump to Player, Audio, Delete */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {onSeekAndPlaySentence && sentence.youtubeId && (
                        <button
                          onClick={() => {
                            onSeekAndPlaySentence(sentence);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          title="Seek and replay this sentence in video player"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Replay Clip</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleSpeak(sentence.text, sentence.targetLangCode)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-600' : 'hover:bg-slate-750 border-slate-700 text-slate-300'
                        }`}
                        title="Listen to phrase"
                      >
                        <Volume2 className="w-4 h-4 text-indigo-500" />
                      </button>

                      <button
                        onClick={() => onRemoveSentence(sentence.id)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          isLight ? 'hover:bg-rose-50 border-slate-200 text-slate-400 hover:text-rose-600' : 'hover:bg-rose-950/30 border-slate-700 text-slate-400 hover:text-rose-400'
                        }`}
                        title="Remove from saved sentences"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. VOCABULARY LIST VIEW */}
          {activeView === 'words' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredWords.length === 0 ? (
                <div className="col-span-2 py-12 text-center space-y-3">
                  <BookMarked className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-semibold">No saved vocabulary words found</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Click on any word inside the video subtitles to look up its definition and save it here.
                  </p>
                </div>
              ) : (
                filteredWords.map((w) => (
                  <div
                    key={w.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      isLight ? 'bg-slate-50/70 border-slate-200 hover:bg-white' : 'bg-slate-850 border-slate-750 hover:bg-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold">{w.vocalized || w.word}</span>
                        {w.root && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-mono">
                            {w.root}
                          </span>
                        )}
                      </div>
                      {w.transliteration && (
                        <div className="text-xs text-indigo-500 dark:text-indigo-400">
                          {w.transliteration}
                        </div>
                      )}
                      <div className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {w.translation}
                      </div>
                      {w.contextSentence && (
                        <p className={`text-[11px] italic truncate max-w-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          &ldquo;{w.contextSentence}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSpeak(w.word)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                          isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-600' : 'hover:bg-slate-750 border-slate-700 text-slate-300'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                      </button>

                      <button
                        onClick={() => onRemoveWord(w.id)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                          isLight ? 'hover:bg-rose-50 border-slate-200 text-slate-400 hover:text-rose-600' : 'hover:bg-rose-950/30 border-slate-700 text-slate-400 hover:text-rose-400'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. SRS FLASHCARD MODE */}
          {activeView === 'flashcards' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-6">
              {filteredSentences.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-semibold">No sentences available for flashcard review.</p>
                  <p className="text-xs text-slate-400 mt-1">Pin some sentences from the video or NativeStyle Studio first!</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between w-full max-w-lg text-xs font-semibold px-2">
                    <span className="text-slate-400">Card {flashcardIdx + 1} of {filteredSentences.length}</span>
                    <span className="text-indigo-500 uppercase font-bold tracking-wider">{currentCard?.masteryLevel || 'Learning'}</span>
                  </div>

                  {/* Flip Card Container */}
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={`w-full max-w-lg min-h-[260px] p-6 rounded-3xl border shadow-xl flex flex-col justify-between items-center text-center cursor-pointer transition-all hover:scale-[1.01] select-none ${
                      isLight 
                        ? 'bg-gradient-to-b from-white to-slate-50 border-slate-200 text-slate-800' 
                        : 'bg-gradient-to-b from-slate-850 to-slate-900 border-slate-750 text-slate-100'
                    }`}
                  >
                    <div className="w-full flex justify-between items-center text-xs text-slate-400">
                      <span className="font-mono">{currentCard.videoTitle || 'Dialogue Practice'}</span>
                      <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    <div className="space-y-3 my-auto py-4">
                      {/* Front: Target Language */}
                      <div className="text-2xl font-bold tracking-wide">
                        {currentCard.vocalizedText || currentCard.text}
                      </div>

                      {/* Transliteration */}
                      {currentCard.transliteration && (
                        <div className="text-sm text-indigo-500 dark:text-indigo-400 font-medium">
                          {currentCard.transliteration}
                        </div>
                      )}

                      {/* Back: Revealed Translation */}
                      {isFlipped ? (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in duration-200">
                          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {currentCard.translation}
                          </div>
                          {(currentCard.notes || currentCard.userNotes) && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                              💡 {currentCard.userNotes || currentCard.notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-slate-400 pt-3">
                          (Click card to flip & reveal native translation)
                        </div>
                      )}
                    </div>

                    <div className="w-full flex justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(currentCard.text, currentCard.targetLangCode);
                        }}
                        className={`p-2 rounded-xl border transition-all ${
                          isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-800 hover:bg-slate-750 border-slate-700'
                        }`}
                        title="Listen to audio"
                      >
                        <Volume2 className="w-4 h-4 text-indigo-500" />
                      </button>
                    </div>
                  </div>

                  {/* SRS Review Grading Buttons */}
                  <div className="flex items-center gap-3 w-full max-w-lg justify-center">
                    <button
                      onClick={() => handleNextCard('learning')}
                      className="flex-1 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer"
                    >
                      Needs Review
                    </button>
                    <button
                      onClick={() => handleNextCard('reviewing')}
                      className="flex-1 py-2.5 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer"
                    >
                      Good
                    </button>
                    <button
                      onClick={() => handleNextCard('mastered')}
                      className="flex-1 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer"
                    >
                      Mastered!
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
