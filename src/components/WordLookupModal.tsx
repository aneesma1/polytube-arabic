import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  BookMarked, 
  Check, 
  Sparkles, 
  Bot,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { SubtitleItem, SavedWord } from '../types';
import { 
  cleanArabicWord, 
  lookupArabicWord,
  transliterateArabic, 
  speakWord 
} from '../utils/arabic';

interface WordLookupModalProps {
  word: string;
  contextSubtitle: SubtitleItem | null;
  videoId: string;
  videoTitle: string;
  onClose: () => void;
  onSaveWord: (saved: SavedWord) => void;
  isSaved: boolean;
  targetLangCode: string;
  theme?: 'light' | 'dark';
}

export const WordLookupModal: React.FC<WordLookupModalProps> = ({
  word,
  contextSubtitle,
  videoId,
  videoTitle,
  onClose,
  onSaveWord,
  isSaved,
  targetLangCode,
  theme = 'light',
}) => {
  const [justSaved, setJustSaved] = useState(false);
  const isArabic = targetLangCode === 'ar';
  const clean = cleanArabicWord(word);
  const isLight = theme === 'light';

  // AI Deep Word Discovery State
  const [aiDiscovery, setAiDiscovery] = useState<any | null>(null);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Trigger Gemini Deep Word Discovery
  const handleDiscoverWord = async () => {
    setIsDiscovering(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/deep-word-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: clean,
          contextSentence: contextSubtitle?.text || '',
          targetLang: isArabic ? 'Arabic' : 'English',
          nativeLang: 'Malayalam'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.discovery) {
          setAiDiscovery(data.discovery);
          return;
        }
      }
      setAiError('Could not fetch AI nuances right now. Local dictionary is active.');
    } catch (err: any) {
      setAiError('Gemini offline. Using dictionary definitions.');
    } finally {
      setIsDiscovering(false);
    }
  };

  // Perform intelligent dictionary & morphological lookup
  const analysis = isArabic ? lookupArabicWord(word, contextSubtitle?.rootWords) : null;

  const translation = analysis?.translation || (contextSubtitle ? `Context meaning: ${contextSubtitle.translation}` : `Word: "${word}"`);
  const translit = analysis?.transliteration || (isArabic ? transliterateArabic(word) : '');
  const root = analysis?.root || (isArabic ? 'ن-ط-ق' : undefined);
  const pattern = analysis?.pattern || (isArabic ? 'مَفْعَلَة' : undefined);
  const partOfSpeech = analysis?.partOfSpeech || 'Noun';

  const handleSave = () => {
    if (!contextSubtitle) return;
    const item: SavedWord = {
      id: `${clean}-${Date.now()}`,
      word: clean,
      vocalized: word,
      transliteration: translit,
      translation,
      root,
      partOfSpeech,
      contextSentence: contextSubtitle.vocalizedText || contextSubtitle.text,
      contextTranslation: contextSubtitle.translation,
      videoId,
      videoTitle,
      timestamp: contextSubtitle.start,
      savedAt: Date.now(),
      reviewedCount: 0,
    };
    onSaveWord(item);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className={`${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
        } border w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Word Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
              Word Analysis
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <h2 
                className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-slate-100'} ${isArabic ? 'font-arabic' : ''}`}
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                {word}
              </h2>
              {translit && (
                <span className="text-sm font-mono text-indigo-600 dark:text-indigo-300">
                  /{translit}/
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 pr-8">
            <button
              onClick={() => speakWord(word, targetLangCode)}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 transition-colors cursor-pointer"
              title="Listen to audio pronunciation"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* AI Deep Word Discovery Trigger */}
            <button
              onClick={handleDiscoverWord}
              disabled={isDiscovering}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
              title="Discover real-world collocations and translation traps with Gemini AI"
            >
              {isDiscovering ? <Bot className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isDiscovering ? 'Analyzing...' : 'AI Nuances'}</span>
            </button>
          </div>
        </div>

        {/* Error notification if AI failed */}
        {aiError && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {/* Meaning Card */}
        <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'} p-4 rounded-xl border flex flex-col gap-1.5`}>
          <span className={`text-[11px] uppercase tracking-wider font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Definition & Role
          </span>
          <p className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            {aiDiscovery?.translation || translation}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-rose-500 font-semibold">
              {partOfSpeech}
            </span>
            {aiDiscovery?.register && (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                {aiDiscovery.register}
              </span>
            )}
          </div>
        </div>

        {/* AI Deep Discovery Box (Collocations, Calque Warnings, Nuances) */}
        {aiDiscovery && (
          <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini Contrastive Linguistic Discovery</span>
            </div>

            {/* Mother-Tongue Calque Warning */}
            {aiDiscovery.commonCalqueTrap && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-0.5">
                <span className="font-bold text-rose-600 dark:text-rose-400">⚠️ Calque Trap to Avoid:</span>
                <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                  {aiDiscovery.commonCalqueTrap}
                </p>
              </div>
            )}

            {/* Real Collocations */}
            {aiDiscovery.collocations?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Real Conversational Collocations:
                </span>
                <div className="space-y-1.5">
                  {aiDiscovery.collocations.map((c: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{c.phrase}</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5">&ldquo;{c.example}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural Nuance */}
            {aiDiscovery.culturalNuance && (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] flex items-start gap-1.5 text-amber-800 dark:text-amber-300">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{aiDiscovery.culturalNuance}</span>
              </div>
            )}
          </div>
        )}

        {/* Specialized Arabic Root & Morphology breakdown */}
        {isArabic && (
          <div className="grid grid-cols-2 gap-2">
            <div className={`${isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-850 border-slate-800'} p-3 rounded-xl border`}>
              <span className={`text-[10px] uppercase tracking-wider block font-medium ${isLight ? 'text-amber-800' : 'text-slate-400'}`}>
                Root (الجذر)
              </span>
              <span className={`text-lg font-bold font-arabic ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                {root}
              </span>
            </div>
            <div className={`${isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-850 border-slate-800'} p-3 rounded-xl border`}>
              <span className={`text-[10px] uppercase tracking-wider block font-medium ${isLight ? 'text-emerald-800' : 'text-slate-400'}`}>
                Pattern (الوزن)
              </span>
              <span className={`text-lg font-bold font-arabic ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                {pattern}
              </span>
            </div>
          </div>
        )}

        {/* Sentence Context */}
        {contextSubtitle && (
          <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} p-3.5 rounded-xl border flex flex-col gap-1`}>
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              In this Video:
            </span>
            <p 
              className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-slate-300'} ${isArabic ? 'font-arabic' : ''}`}
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              &ldquo;{contextSubtitle.vocalizedText || contextSubtitle.text}&rdquo;
            </p>
            <p className={`text-xs italic ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              &ldquo;{contextSubtitle.translation}&rdquo;
            </p>
          </div>
        )}

        {/* Action Button: Save to Notebook */}
        <button
          onClick={handleSave}
          disabled={isSaved || justSaved}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isSaved || justSaved
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-600/30 dark:text-emerald-300 dark:border-emerald-500/40 cursor-default'
              : 'bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white shadow-lg shadow-rose-500/20'
          }`}
        >
          {isSaved || justSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Saved in Vocabulary Notebook</span>
            </>
          ) : (
            <>
              <BookMarked className="w-4 h-4" />
              <span>Save Word to Flashcards</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
