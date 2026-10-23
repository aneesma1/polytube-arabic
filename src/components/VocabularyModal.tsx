import React, { useState } from 'react';
import { 
  X, 
  BookMarked, 
  Volume2, 
  Trash2, 
  Download, 
  RotateCw, 
  Sparkles, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { SavedWord } from '../types';
import { speakWord } from '../utils/arabic';
import { downloadFile } from '../utils/subtitles';

interface VocabularyModalProps {
  words: SavedWord[];
  onRemoveWord: (id: string) => void;
  onClose: () => void;
  targetLangCode: string;
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({
  words,
  onRemoveWord,
  onClose,
  targetLangCode,
}) => {
  const [mode, setMode] = useState<'list' | 'flashcard'>('list');
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleExportCsv = () => {
    if (words.length === 0) return;
    const header = ['Word', 'Transliteration', 'Translation', 'Root', 'PartOfSpeech', 'ContextSentence', 'ContextTranslation'];
    const rows = words.map(w => {
      const escape = (val?: string) => `"${(val || '').replace(/"/g, '""')}"`;
      return [
        escape(w.vocalized || w.word),
        escape(w.transliteration),
        escape(w.translation),
        escape(w.root),
        escape(w.partOfSpeech),
        escape(w.contextSentence),
        escape(w.contextTranslation),
      ].join(',');
    });
    const csv = [header.join(','), ...rows].join('\n');
    downloadFile(csv, 'lingotube_vocabulary.csv', 'text/csv;charset=utf-8');
  };

  const currentFlashcard = words[flashcardIdx];

  const handleNextCard = () => {
    setIsFlipped(false);
    setFlashcardIdx((prev) => (prev + 1) % words.length);
  };

  const isArabic = targetLangCode === 'ar';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Vocabulary Flashcards
              </h2>
              <p className="text-xs text-slate-400">
                {words.length} saved words & phrases from your study sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {words.length > 0 && (
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
                <button
                  onClick={() => setMode('list')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    mode === 'list' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => {
                    setMode('flashcard');
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    mode === 'flashcard' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Practice Deck
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {words.length === 0 ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <BookMarked className="w-10 h-10 text-slate-600" />
            <p className="text-sm font-medium">Your vocabulary notebook is empty.</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Click any word inside the subtitle window below the video player to view its definition, root word, and bookmark it!
            </p>
          </div>
        ) : mode === 'flashcard' ? (
          /* Flashcard View */
          <div className="flex flex-col items-center justify-center py-6 gap-6">
            <span className="text-xs font-mono text-slate-400">
              Card {flashcardIdx + 1} of {words.length}
            </span>

            {/* Flashcard Body */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-md h-64 bg-gradient-to-br from-slate-800 to-slate-850 border-2 border-indigo-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl relative transition-transform hover:scale-[1.01]"
            >
              {!isFlipped ? (
                /* Card Front (Target Word) */
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-semibold">
                    Question • Click to reveal meaning
                  </span>
                  <h3 className={`text-4xl font-bold text-slate-100 ${isArabic ? 'font-arabic' : ''}`}>
                    {currentFlashcard.vocalized || currentFlashcard.word}
                  </h3>
                  {currentFlashcard.transliteration && (
                    <span className="text-sm font-mono text-slate-400">
                      /{currentFlashcard.transliteration}/
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentFlashcard.vocalized || currentFlashcard.word, targetLangCode);
                    }}
                    className="p-2 rounded-full bg-slate-700/80 hover:bg-slate-600 text-amber-400 transition-colors mt-2"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                /* Card Back (Translation & Context) */
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                    Answer
                  </span>
                  <h4 className="text-2xl font-bold text-slate-100">
                    {currentFlashcard.translation}
                  </h4>
                  {currentFlashcard.root && (
                    <span className="text-xs text-amber-300 font-medium font-arabic">
                      Root (الجذر): {currentFlashcard.root}
                    </span>
                  )}
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 max-w-xs mt-1">
                    <p className={`text-xs text-slate-300 ${isArabic ? 'font-arabic' : ''}`}>
                      "{currentFlashcard.contextSentence}"
                    </p>
                    <p className="text-[11px] text-slate-400 italic">
                      "{currentFlashcard.contextTranslation}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Next Card Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleNextCard}
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Next Card</span>
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* List View */
          <>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {words.map((w) => (
                <div
                  key={w.id}
                  className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => speakWord(w.vocalized || w.word, targetLangCode)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-lg font-bold text-slate-100 ${isArabic ? 'font-arabic' : ''}`}>
                          {w.vocalized || w.word}
                        </span>
                        {w.transliteration && (
                          <span className="text-xs font-mono text-indigo-300">
                            /{w.transliteration}/
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">
                        {w.translation}
                      </p>
                      {w.root && (
                        <span className="text-[10px] text-amber-400 font-arabic">
                          Root: {w.root}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveWord(w.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove word"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom toolbar */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {words.length} words in notebook
              </span>
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export to CSV</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
