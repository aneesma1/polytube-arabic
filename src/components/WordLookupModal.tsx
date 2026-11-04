import React, { useEffect, useState } from 'react';
import { X, Volume2, BookMarked, Check, Sparkles, ExternalLink, Loader2, Info, ChevronDown, Copy, Layers, Play } from 'lucide-react';
import { SubtitleItem, SavedWord, WordCard } from '../types';
import { cleanArabicWord, lookupArabicWord, speakWord, hasTashkeel, removeTashkeel } from '../utils/arabic';
import { lookupDictionary, DictResult } from '../utils/dictionaryLookup';
import { fetchExamples, Example } from '../utils/tatoebaLookup';
import { explainWord, isAiConfigured, vocalizeSentences, WordExplanation, AI_NOT_CONFIGURED_MESSAGE } from '../utils/aiProvider';
import { copyCardToClipboard } from '../utils/wordCard';

interface WordLookupModalProps {
  word: string;
  contextSubtitle: SubtitleItem | null;
  videoId: string;
  videoTitle: string;
  onClose: () => void;
  /** Pause the video while this pop-up is open (switch shown in the pop-up) */
  studyPauseOn?: boolean;
  onToggleStudyPause?: () => void;
  onPlayVideo?: () => void;
  onSaveWord: (saved: SavedWord) => void;
  isSaved: boolean;
  targetLangCode: string;
  nativeLangCode?: 'ml' | 'en';
  theme?: 'light' | 'dark';
}

export const WordLookupModal: React.FC<WordLookupModalProps> = ({
  word,
  contextSubtitle,
  videoId,
  videoTitle,
  onClose,
  studyPauseOn,
  onToggleStudyPause,
  onPlayVideo,
  onSaveWord,
  isSaved,
  nativeLangCode = 'en',
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const clean = cleanArabicWord(word);
  const local = lookupArabicWord(word, contextSubtitle?.rootWords);

  const [dict, setDict] = useState<DictResult | null>(null);
  const [dictError, setDictError] = useState<string | null>(null);
  const [dictLoading, setDictLoading] = useState(true);

  const [ai, setAi] = useState<WordExplanation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const [saved, setSaved] = useState<'card' | 'word' | null>(null);
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null);
  const [pendingCard, setPendingCard] = useState(false);

  const [examples, setExamples] = useState<Example[]>([]);
  const [examplesLoading, setExamplesLoading] = useState(false);
  const [examplesError, setExamplesError] = useState<string | null>(null);
  const [showAllExamples, setShowAllExamples] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [copiedNote, setCopiedNote] = useState<string | null>(null);
  const [voxMap, setVoxMap] = useState<Record<number, string>>({});
  const [voxBusy, setVoxBusy] = useState(false);
  const [voxMsg, setVoxMsg] = useState<string | null>(null);

  // Esc closes the pop-up
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setDictLoading(true);
    setDictError(null);
    setDict(null);
    setAi(null);
    setAiMessage(null);
    lookupDictionary(clean)
      .then(r => !cancelled && setDict(r))
      .catch(e => !cancelled && setDictError(e.message || 'Dictionary unavailable.'))
      .finally(() => !cancelled && setDictLoading(false));
    return () => {
      cancelled = true;
    };
  }, [clean]);

  // Example sentences: look up the base form once the dictionary has answered
  useEffect(() => {
    if (dictLoading) return;
    let cancelled = false;
    setExamples([]);
    setExamplesError(null);
    setShowAllExamples(false);
    setVoxMap({});
    setExamplesLoading(true);
    fetchExamples(dict?.matched || clean, 5)
      .then(r => !cancelled && setExamples(r))
      .catch(e => !cancelled && setExamplesError(e.message || 'Examples are unavailable right now.'))
      .finally(() => !cancelled && setExamplesLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dictLoading, dict?.matched, clean]);

  const handleVocalizeExamples = async () => {
    if (!isAiConfigured()) {
      setVoxMsg(AI_NOT_CONFIGURED_MESSAGE);
      return;
    }
    setVoxBusy(true);
    setVoxMsg(null);
    const res = await vocalizeSentences(examples.map(e => ({ id: e.id, text: e.arabic })));
    setVoxBusy(false);
    if (res.data && Object.keys(res.data).length > 0) setVoxMap(prev => ({ ...prev, ...res.data }));
    if (!res.ok) setVoxMsg(res.error || 'Could not add vowel marks.');
  };

  const lookupWord = removeTashkeel(dict?.matched || clean);
  const enc = encodeURIComponent(lookupWord);
  const otherDictionaries: { label: string; note: string; url: string; copy?: boolean }[] = [
    { label: 'KSAA Riyadh Dictionary', note: 'Arabic explained in Arabic', url: `https://dictionary.ksaa.gov.sa/result/${enc}` },
    { label: 'Arabdict', note: 'English, German, French and more, with conjugation', url: `https://www.arabdict.com/en/english-arabic/${enc}` },
    { label: 'Living Arabic', note: 'Dialects (paste the word)', url: 'https://www.livingarabic.com/', copy: true },
    { label: 'Hans Wehr', note: 'Roots, formal Arabic (paste the word)', url: 'https://hanswehr.app/', copy: true },
    { label: 'Almaany', note: 'Arabic and English', url: `https://www.almaany.com/ar/dict/ar-en/${enc}/` },
    { label: 'Wiktionary page', note: 'Full entry', url: `https://en.wiktionary.org/wiki/${enc}#Arabic` },
    { label: 'Google Translate', note: 'Quick translation', url: `https://translate.google.com/?sl=ar&tl=en&text=${enc}&op=translate` },
  ];
  const openDictionary = (d: { label: string; url: string; copy?: boolean }) => {
    if (d.copy) {
      navigator.clipboard?.writeText(lookupWord).catch(() => {});
      setCopiedNote(`"${lookupWord}" copied. Paste it into the search box on ${d.label}.`);
      setTimeout(() => setCopiedNote(null), 5000);
    }
    window.open(d.url, 'polytube-dictionary', 'popup,width=980,height=820');
    setShowMore(false);
  };

  const root = ai?.root || dict?.root || local?.root || '';
  const meaningLocal = local ? (nativeLangCode === 'ml' ? local.translationMl || local.translation : local.translation) : '';
  const firstDef = dict?.entries[0]?.definitions[0] ?? '';
  const pos = ai?.partOfSpeech || dict?.entries[0]?.pos || local?.partOfSpeech || '';
  const phonetic = hasTashkeel(word) ? '' : local?.transliteration || '';

  const handleExplain = async () => {
    if (!isAiConfigured()) {
      setAiMessage(AI_NOT_CONFIGURED_MESSAGE);
      return;
    }
    setAiLoading(true);
    setAiMessage(null);
    const res = await explainWord(clean, contextSubtitle?.text || clean, nativeLangCode === 'ml' ? 'Malayalam' : 'English');
    setAiLoading(false);
    if (res.ok && res.data) setAi(res.data);
    else setAiMessage(res.error || 'AI could not explain this word.');
  };

  /** The word as it will be stored. With a card, everything on screen is kept with it. */
  const makeWord = (withCard: boolean): SavedWord => {
    const item: SavedWord = {
      id: `${clean}-${Date.now()}`,
      word: clean,
      vocalized: word,
      transliteration: phonetic,
      translation: ai?.meaning || meaningLocal || firstDef || '',
      root: root || undefined,
      partOfSpeech: pos || undefined,
      contextSentence: contextSubtitle ? contextSubtitle.vocalizedText || contextSubtitle.text : '',
      contextTranslation: contextSubtitle?.translation ?? '',
      videoId,
      videoTitle,
      timestamp: contextSubtitle?.start ?? 0,
      savedAt: Date.now(),
      reviewedCount: 0,
    };
    if (!withCard) return item;
    const card: WordCard = {
      v: 1,
      meaning: meaningLocal || undefined,
      matched: dict?.matched,
      dictionary: dict?.found ? dict.entries : undefined,
      examples: examples.length
        ? examples.map(ex => ({ id: ex.id, arabic: voxMap[ex.id] ?? ex.arabic, translation: ex.translation }))
        : undefined,
      ai: ai
        ? { pattern: ai.pattern, meaning: ai.meaning, contextExplanation: ai.contextExplanation, collocations: ai.collocations }
        : undefined,
    };
    return { ...item, card };
  };

  const flash = (kind: 'card' | 'word') => {
    setSaved(kind);
    setTimeout(() => setSaved(null), 2200);
  };

  const loadingCard = dictLoading || examplesLoading;

  const handleSaveCard = () => {
    if (!contextSubtitle) return;
    // Still loading: remember the click and save the moment everything has arrived
    if (loadingCard) {
      setPendingCard(true);
      return;
    }
    onSaveWord(makeWord(true));
    flash('card');
  };

  useEffect(() => {
    if (pendingCard && !loadingCard && contextSubtitle) {
      setPendingCard(false);
      onSaveWord(makeWord(true));
      flash('card');
    }
  }, [pendingCard, loadingCard]);

  const handleSaveWord = () => {
    if (!contextSubtitle) return;
    onSaveWord(makeWord(false));
    flash('word');
  };

  const handleCopy = async () => {
    const ok = await copyCardToClipboard(makeWord(true));
    setCopied(ok ? 'ok' : 'fail');
    setTimeout(() => setCopied(null), 2200);
  };

  const card = `rounded-2xl border p-3.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'}`;
  const label = 'text-[10px] uppercase tracking-wider font-bold opacity-60 mb-1.5';
  const footBtn = `py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
    isLight ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-100'
  }`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3" onClick={onClose}>
      <div
        className={`${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
        } border w-full max-w-lg max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Fixed header: the word and the close button never scroll away */}
        <div className={`shrink-0 px-5 pt-4 pb-3 border-b ${isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl font-black font-arabic leading-tight" dir="rtl">{word}</h2>
                <button
                  onClick={() => speakWord(word, 'ar')}
                  className={`p-2 rounded-xl border cursor-pointer ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'}`}
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4 text-amber-500" />
                </button>
                {phonetic && <span className="font-mono text-sm text-indigo-500">/{phonetic}/</span>}
              </div>
              {(root || pos) && (
                <div className="flex flex-wrap gap-2 text-xs font-bold mt-2">
                  {root && (
                    <span className={`px-2.5 py-1 rounded-lg border ${isLight ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-500/10 border-amber-500/40 text-amber-300'}`}>
                      Root <span className="font-arabic text-sm ml-1">{root}</span>
                    </span>
                  )}
                  {pos && (
                    <span className={`px-2.5 py-1 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>{pos}</span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className={`shrink-0 p-2 rounded-xl border cursor-pointer ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'}`}
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {onToggleStudyPause && (
          <div className={`shrink-0 px-5 py-1.5 border-b flex items-center gap-3 text-[11px] ${isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-800 bg-slate-900/60 text-slate-400'}`}>
            <button
              onClick={onToggleStudyPause}
              role="switch"
              aria-checked={!!studyPauseOn}
              className="flex items-center gap-2 cursor-pointer font-semibold"
              title="Pause the video while this pop-up is open, and resume when you close it"
            >
              <span className={`relative inline-block w-8 h-4 rounded-full transition-colors ${studyPauseOn ? 'bg-emerald-500' : isLight ? 'bg-slate-300' : 'bg-slate-600'}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${studyPauseOn ? 'left-4.5' : 'left-0.5'}`} style={{ left: studyPauseOn ? 18 : 2 }} />
              </span>
              Pause video while I study
            </button>
            {onPlayVideo && (
              <button onClick={onPlayVideo} className="ml-auto flex items-center gap-1 font-semibold cursor-pointer hover:underline" title="Play the video now, with this pop-up still open">
                <Play className="w-3 h-3" /> Play video
              </button>
            )}
          </div>
        )}

        {/* Scrolling body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-3.5">
          {meaningLocal && (
            <div className={card}>
              <div className={label}>Meaning</div>
              <div className="text-base font-semibold">{meaningLocal}</div>
            </div>
          )}

          {/* Dictionary */}
          <div className={card}>
            <div className={label}>Dictionary (Wiktionary)</div>
            {dictLoading && (
              <div className="flex items-center gap-2 text-sm opacity-70">
                <Loader2 className="w-4 h-4 animate-spin" /> Looking up…
              </div>
            )}
            {dictError && <p className="text-sm text-rose-500">{dictError}</p>}
            {dict && !dict.found && !dictLoading && <p className="text-sm opacity-80">No dictionary entry found for this form. Try the dictionaries menu below.</p>}
            {dict?.found && (
              <div className="space-y-2">
                {dict.matched && dict.matched !== clean && (
                  <p className="text-[11px] opacity-60">
                    Showing the base form <span className="font-arabic text-sm">{dict.matched}</span>
                  </p>
                )}
                {dict.entries.map((e, i) => (
                  <div key={i}>
                    <div className="text-[11px] font-bold uppercase opacity-60">{e.pos}</div>
                    <ul className="list-disc ml-5 text-sm space-y-0.5">
                      {e.definitions.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <div className="relative mt-3">
              <button
                onClick={() => setShowMore(v => !v)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 cursor-pointer ${
                  isLight ? 'bg-white border-slate-300 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                }`}
              >
                More dictionaries <ChevronDown className="w-3 h-3" />
              </button>
              {showMore && (
                <div className={`absolute left-0 top-full mt-1 w-72 rounded-xl border shadow-xl p-1 z-10 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                  {otherDictionaries.map(d => (
                    <button key={d.label} onClick={() => openDictionary(d)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-500/10 cursor-pointer">
                      <div className="text-xs font-bold flex items-center gap-1">
                        {d.label} <ExternalLink className="w-3 h-3 opacity-60" />
                      </div>
                      <div className="text-[11px] opacity-60">{d.note}</div>
                    </button>
                  ))}
                </div>
              )}
              {copiedNote && <p className="text-[11px] mt-2 opacity-80">{copiedNote}</p>}
            </div>
          </div>

          {/* Example sentences (Tatoeba) */}
          <div className={card}>
            <div className={label}>Example sentences</div>
            {examplesLoading && (
              <div className="flex items-center gap-2 text-sm opacity-70">
                <Loader2 className="w-4 h-4 animate-spin" /> Finding examples…
              </div>
            )}
            {examplesError && <p className="text-sm opacity-70">{examplesError}</p>}
            {!examplesLoading && !examplesError && examples.length === 0 && <p className="text-sm opacity-70">No example sentences found for this form.</p>}
            <div className="space-y-2.5">
              {(showAllExamples ? examples : examples.slice(0, 3)).map(ex => (
                <div key={ex.id}>
                  <div className="font-arabic text-2xl text-right leading-loose" dir="rtl">{voxMap[ex.id] ?? ex.arabic}</div>
                  <div className="text-sm opacity-80">{ex.translation}</div>
                </div>
              ))}
            </div>
            {examples.length > 3 && !showAllExamples && (
              <button onClick={() => setShowAllExamples(true)} className="text-[11px] font-bold mt-2 underline cursor-pointer">
                Show {examples.length - 3} more
              </button>
            )}
            {examples.length > 0 && (
              <div className="mt-2.5">
                <button
                  onClick={handleVocalizeExamples}
                  disabled={voxBusy || Object.keys(voxMap).length > 0}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 cursor-pointer disabled:opacity-60 ${
                    isLight ? 'bg-white border-slate-300 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Optional AI: adds vowel marks to these sentences"
                >
                  {voxBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {Object.keys(voxMap).length > 0 ? 'Vowel marks added' : 'Add vowel marks (AI)'}
                </button>
                {voxMsg && <p className="text-[11px] mt-1.5 opacity-80">{voxMsg}</p>}
              </div>
            )}
            {examples.length > 0 && (
              <p className="text-[10px] opacity-50 mt-2">
                From <a href="https://tatoeba.org" target="_blank" rel="noreferrer" className="underline">Tatoeba</a>, CC BY 2.0 FR
              </p>
            )}
          </div>

          {/* In this video */}
          {contextSubtitle && (
            <div className={card}>
              <div className={label}>In this video</div>
              <div className="font-arabic text-xl text-right leading-loose" dir="rtl">{contextSubtitle.vocalizedText || contextSubtitle.text}</div>
              {contextSubtitle.translation && contextSubtitle.translation !== '—' && (
                <div className="text-sm italic opacity-80 mt-1 whitespace-pre-line">{contextSubtitle.translation}</div>
              )}
            </div>
          )}

          {/* Optional AI */}
          <div className={card}>
            <div className="flex items-center justify-between gap-2">
              <div className={label + ' mb-0'}>Explain with AI (optional)</div>
              <button
                onClick={handleExplain}
                disabled={aiLoading}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Explain
              </button>
            </div>
            {aiMessage && (
              <p className="text-xs mt-2 flex items-start gap-1.5 opacity-80">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {aiMessage}
              </p>
            )}
            {ai && (
              <div className="mt-2 space-y-1.5 text-sm">
                {ai.pattern && <div><b>Pattern:</b> <span className="font-arabic text-2xl align-middle">{ai.pattern}</span></div>}
                {ai.meaning && <div><b>Meaning:</b> {ai.meaning}</div>}
                {ai.contextExplanation && <div><b>In this sentence:</b> {ai.contextExplanation}</div>}
                {ai.collocations && ai.collocations.length > 0 && (
                  <div>
                    <b>Common phrases:</b>
                    <ul className="mt-1 space-y-0.5">
                      {ai.collocations.map((c, i) => (
                        <li key={i} className="font-arabic text-2xl leading-loose text-right" dir="rtl">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-[10px] opacity-50">AI answers can be wrong. Check roots against the dictionary.</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed footer: three equal buttons */}
        <div className={`shrink-0 px-4 py-3 border-t grid grid-cols-3 gap-2 ${isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
          <button
            onClick={handleSaveCard}
            disabled={!contextSubtitle || pendingCard}
            className={footBtn}
            title="Saves the meaning, dictionary entries, examples, AI notes and the video sentence. If it is still loading, it saves when ready."
          >
            {saved === 'card' ? <Check className="w-4 h-4 text-emerald-500" /> : pendingCard ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            {saved === 'card' ? 'Card saved' : pendingCard ? 'Saving when ready…' : 'Save card'}
          </button>
          <button onClick={handleSaveWord} disabled={!contextSubtitle} className={footBtn} title="Saves only the word, its meaning and the video sentence">
            {saved === 'word' ? <Check className="w-4 h-4 text-emerald-500" /> : <BookMarked className="w-4 h-4" />}
            {saved === 'word' ? 'Word saved' : isSaved ? 'Save word again' : 'Save word'}
          </button>
          <button onClick={handleCopy} className={footBtn} title="Copies the card with WhatsApp formatting (bold, italics, bullets)">
            {copied === 'ok' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied === 'ok' ? 'Copied' : copied === 'fail' ? 'Copy failed' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
