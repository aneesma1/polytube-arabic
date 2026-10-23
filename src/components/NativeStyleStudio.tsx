import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Search, 
  Volume2, 
  Bookmark, 
  ExternalLink, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  BookOpen, 
  Youtube, 
  Share2, 
  Copy, 
  ChevronRight, 
  Flame, 
  RotateCcw,
  Bot,
  X
} from 'lucide-react';
import { NativeRephraseEntry, SavedSentence } from '../types';
import { PRESET_REPHRASE_ENTRIES, LANGUAGE_PAIRS } from '../data/nativeRephraseData';
import { ErrorBoundary } from './ErrorBoundary';

interface NativeStyleStudioProps {
  theme?: 'light' | 'dark';
  onSaveToPhrasebook?: (entry: SavedSentence) => void;
  initialQuery?: string;
  onNavigateToPlayer?: () => void;
  activePairKey?: string;
  onChangePairKey?: (pairKey: string) => void;
}

export const NativeStyleStudio: React.FC<NativeStyleStudioProps> = ({
  theme = 'light',
  onSaveToPhrasebook,
  initialQuery = '',
  onNavigateToPlayer,
  activePairKey = 'ml-en',
  onChangePairKey,
}) => {
  const isLight = theme === 'light';

  // Selected Language Pair synced with global activePairKey
  const [selectedPairId, setSelectedPairId] = useState<string>(activePairKey || 'ml-en');
  const currentPair = LANGUAGE_PAIRS.find(p => p.id === selectedPairId) || LANGUAGE_PAIRS[0];

  // Input & Query State
  const [inputText, setInputText] = useState(initialQuery || '');
  const [activeAnalysis, setActiveAnalysis] = useState<NativeRephraseEntry | null>(
    PRESET_REPHRASE_ENTRIES.find(e => e.sourceLangCode === currentPair.sourceCode && e.targetLangCode === currentPair.targetCode) || PRESET_REPHRASE_ENTRIES[0]
  );
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activeTabSub, setActiveTabSub] = useState<'analysis' | 'catalog'>('analysis');

  // AI Generation & Alert State
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [aiAlert, setAiAlert] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

  // Preloaded Topics State & AI Topic Discovery
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [isDiscoverModalOpen, setIsDiscoverModalOpen] = useState<boolean>(false);
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [isDiscoveringTopics, setIsDiscoveringTopics] = useState<boolean>(false);
  const [customAiTraps, setCustomAiTraps] = useState<NativeRephraseEntry[]>(() => {
    try {
      const stored = localStorage.getItem('polytube_custom_ai_traps_v1');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      // Clean up contaminated traps (purge English traps mistakenly saved in Arabic tracks)
      const cleaned = parsed.filter((entry: any) => {
        const isAr = entry.sourceLangCode === 'ar' || entry.targetLangCode === 'ar';
        if (isAr) {
          const hasEnglishDoubt = entry.literalTrap?.includes('I am having a doubt') || 
                                  entry.literalTrap?.includes('I did not catch him') ||
                                  entry.naturalAlternatives?.some((a: any) => a.phrase?.includes('I have a quick question'));
          return !hasEnglishDoubt;
        }
        return true;
      });
      localStorage.setItem('polytube_custom_ai_traps_v1', JSON.stringify(cleaned));
      return cleaned;
    } catch {
      return [];
    }
  });

  // Live LLM Health Status
  const [llmHealth, setLlmHealth] = useState<{
    status: 'online' | 'checking' | 'offline';
    model: string;
    message: string;
  }>({
    status: 'online',
    model: 'gemini-3.1-flash-lite',
    message: 'Gemini AI Ready'
  });

  // Verify LLM connection via live health ping
  const checkLlmStatus = async () => {
    setLlmHealth(prev => ({ ...prev, status: 'checking', message: 'Testing Gemini live...' }));
    try {
      const res = await fetch('/api/health?test=true');
      const data = await res.json();
      if (data.llmAvailable) {
        setLlmHealth({
          status: 'online',
          model: data.activeModel || 'gemini-3.1-flash-lite',
          message: data.liveStatus === 'verified' ? 'Gemini 3.1 Flash Lite Online' : 'Gemini Connected'
        });
        setAiAlert({
          type: 'success',
          message: `🟢 LLM Verified: Gemini (${data.activeModel || 'flash-lite'}) is active and responding.`
        });
        setTimeout(() => setAiAlert(null), 4000);
      } else {
        setLlmHealth({
          status: 'offline',
          model: 'local-fallback',
          message: 'Offline SLA Rules Active'
        });
      }
    } catch (err: any) {
      setLlmHealth({
        status: 'offline',
        model: 'local-fallback',
        message: 'Network offline, local SLA active'
      });
    }
  };

  // Run initial health check once
  useEffect(() => {
    checkLlmStatus();
  }, []);

  // Save custom AI traps to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('polytube_custom_ai_traps_v1', JSON.stringify(customAiTraps));
    } catch (e) {
      console.warn('Could not save custom AI traps:', e);
    }
  }, [customAiTraps]);

  // Synchronize language pair with top navbar when activePairKey changes
  useEffect(() => {
    if (activePairKey && activePairKey !== selectedPairId) {
      setSelectedPairId(activePairKey);
      const pair = LANGUAGE_PAIRS.find(p => p.id === activePairKey);
      if (pair) {
        const match = PRESET_REPHRASE_ENTRIES.find(
          e => e.sourceLangCode === pair.sourceCode && e.targetLangCode === pair.targetCode
        );
        if (match) {
          setActiveAnalysis(match);
        }
      }
    }
  }, [activePairKey]);

  // Handle local pair change and synchronize back to parent navbar
  const handlePairChange = (newPairId: string) => {
    setSelectedPairId(newPairId);
    onChangePairKey?.(newPairId);
    const pair = LANGUAGE_PAIRS.find(p => p.id === newPairId);
    if (pair) {
      const match = PRESET_REPHRASE_ENTRIES.find(
        e => e.sourceLangCode === pair.sourceCode && e.targetLangCode === pair.targetCode
      );
      if (match) {
        setActiveAnalysis(match);
      }
    }
  };

  // Speech Recognition Reference
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Set recognition lang based on pair
      if (currentPair.sourceCode === 'ml') recognition.lang = 'ml-IN';
      else if (currentPair.sourceCode === 'hi') recognition.lang = 'hi-IN';
      else if (currentPair.sourceCode === 'ur') recognition.lang = 'ur-PK';
      else if (currentPair.sourceCode === 'ar') recognition.lang = 'ar-SA';
      else recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentPair]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your sentence directly!');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  // Perform Analysis (With Multilingual Gemini SLA & Live Answer Check)
  const handleAnalyze = async (queryToUse?: string) => {
    const text = (queryToUse !== undefined ? queryToUse : inputText).trim();
    if (!text) return;

    // 1. Immediately match against curated Second Language Acquisition (SLA) entries with Arabic diacritic normalization
    const norm = (s: string) => s
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .trim();

    const qNorm = norm(text);

    const isArabicTrack = currentPair.sourceCode === 'ar' || currentPair.targetCode === 'ar';

    // Prioritize match within current language pair first, then across all presets
    const matchedPreset = PRESET_REPHRASE_ENTRIES.find((e) => {
      const isPairMatch = e.sourceLangCode === currentPair.sourceCode && e.targetLangCode === currentPair.targetCode;
      if (!isPairMatch) return false;
      const sNorm = norm(e.sourceText);
      const lNorm = norm(e.literalTrap);
      const sCore = sNorm.split('/')[0].trim();
      const qCore = qNorm.split('/')[0].trim();
      return (
        sNorm === qNorm ||
        (sCore.length > 2 && qNorm.includes(sCore)) ||
        (qCore.length > 2 && sCore.includes(qCore)) ||
        lNorm.includes(qNorm) ||
        e.naturalAlternatives.some(a => norm(a.phrase).includes(qNorm) || qNorm.includes(norm(a.phrase)))
      );
    }) || (isArabicTrack ? PRESET_REPHRASE_ENTRIES.find((e) => {
      // In Arabic track, ONLY match Arabic entries (ml-ar or ar-ml), NEVER English (ml-en)!
      const isArabicEntry = e.sourceLangCode === 'ar' || e.targetLangCode === 'ar';
      if (!isArabicEntry) return false;
      const sNorm = norm(e.sourceText);
      const lNorm = norm(e.literalTrap);
      const sCore = sNorm.split('/')[0].trim();
      const qCore = qNorm.split('/')[0].trim();
      return (
        sNorm === qNorm ||
        (sCore.length > 2 && qNorm.includes(sCore)) ||
        (qCore.length > 2 && sCore.includes(qCore)) ||
        lNorm.includes(qNorm) ||
        e.naturalAlternatives.some(a => norm(a.phrase).includes(qNorm) || qNorm.includes(norm(a.phrase)))
      );
    }) : PRESET_REPHRASE_ENTRIES.find((e) => {
      const sNorm = norm(e.sourceText);
      const lNorm = norm(e.literalTrap);
      const sCore = sNorm.split('/')[0].trim();
      const qCore = qNorm.split('/')[0].trim();
      return (
        sNorm === qNorm ||
        (sCore.length > 2 && qNorm.includes(sCore)) ||
        (qCore.length > 2 && sCore.includes(qCore)) ||
        lNorm.includes(qNorm) ||
        e.naturalAlternatives.some(a => norm(a.phrase).includes(qNorm) || qNorm.includes(norm(a.phrase)))
      );
    }));

    if (matchedPreset) {
      setActiveAnalysis(matchedPreset);
      setAiStatus('success');
      setAiAlert({
        type: 'success',
        message: `✨ Loaded curated SLA contrastive analysis for "${text}"`
      });
      setTimeout(() => setAiAlert(null), 4000);
      setActiveTabSub('analysis');
      return;
    }

    // Call Google Gemini SLA Multilingual Engine directly for every input
    setAiStatus('analyzing');
    setAiAlert({
      type: 'info',
      message: `🤖 Gemini AI evaluating "${text}" for ${currentPair.source} ➔ ${currentPair.target}...`
    });

    try {
      const response = await fetch('/api/ai/analyze-calque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang: currentPair.source,
          targetLang: currentPair.target
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.analysis) {
          const aiEntry: NativeRephraseEntry = {
            id: 'ai-' + Date.now(),
            sourceText: text,
            sourceLang: currentPair.source,
            sourceLangCode: currentPair.sourceCode,
            targetLang: currentPair.target,
            targetLangCode: currentPair.targetCode,
            literalTrap: data.analysis.literalTrap || `Literal transfer of "${text}"`,
            literalExplanation: data.analysis.literalExplanation || 'Analyzed via Gemini SLA engine.',
            naturalAlternatives: data.analysis.naturalAlternatives?.length 
              ? data.analysis.naturalAlternatives 
              : [{ phrase: text, style: 'Conversational', explanation: 'Refined native expression.' }],
            cultureTip: data.analysis.cultureTip || `Verified against native ${currentPair.target} conversational usage.`,
            grammarTip: data.analysis.grammarTip || 'Check native collocations and verb particles.',
            youglishQuery: data.analysis.youglishQuery || text.replace(/[^\w\s]/gi, '').trim(),
            category: data.analysis.category || 'AI Contrastive Analysis',
            evaluation: data.analysis.evaluation || {
              naturalnessScore: 45,
              verdict: 'AI Evaluated',
              directFeedback: `AI analyzed "${text}" for contrastive transfer from ${currentPair.source} into ${currentPair.target}.`
            }
          };

          setActiveAnalysis(aiEntry);
          setAiStatus('success');
          setAiAlert({
            type: 'success',
            message: `✨ AI Answer Check complete for "${text}" (${currentPair.source} ➔ ${currentPair.target})`
          });
          setTimeout(() => setAiAlert(null), 5000);
          setActiveTabSub('analysis');
          return;
        }
      }

      // If response not ok:
      const errData = await response.json().catch(() => ({}));
      const errMessage = errData.error || `HTTP ${response.status} failed`;
      setAiStatus('error');
      setAiAlert({
        type: 'error',
        message: `⚠️ AI Service Alert: Gemini API failed (${errMessage}). Falling back to local SLA linguistic rules.`
      });
    } catch (err: any) {
      setAiStatus('error');
      setAiAlert({
        type: 'error',
        message: `⚠️ AI Service Alert: Gemini API failed (${err.message || 'Network disconnected'}). Falling back to local SLA linguistic rules.`
      });
    }

    // 3. Fallback to offline SLA linguistic rules
    const isArabicTarget = currentPair.targetCode === 'ar' || /[\u0600-\u06FF]/.test(text);
    const isArabicSource = currentPair.sourceCode === 'ar' || /[\u0600-\u06FF]/.test(text);
    const isMalayalamTarget = currentPair.targetCode === 'ml';

    let fallbackAlternatives = [
      {
        phrase: `Natural conversational way to express "${text}"`,
        style: 'Casual',
        explanation: 'Standard everyday phrasing in real dialogue.'
      },
      {
        phrase: `Polite professional equivalent for "${text}"`,
        style: 'Workplace',
        explanation: 'Contextual polite phrasing for work or public settings.'
      }
    ];

    let fallbackTrap = `Literal word-for-word transfer of "${text}"`;
    let fallbackExplanation = `Learners translating from ${currentPair.source} to ${currentPair.target} often transfer syntactic structures directly. Native speakers rely on conventionalized phrasal verbs and collocations.`;

    if (isArabicSource && isMalayalamTarget) {
      fallbackTrap = `അക്ഷരാർത്ഥത്തിലുള്ള വിവർത്തനം ഒഴിവാക്കുക`;
      fallbackExplanation = `ഗൾഫ് അറബിക് ശൈലികൾ അക്ഷരാർത്ഥത്തിൽ എടുക്കാതെ സംഭാഷണത്തിൽ ഉദ്ദേശിക്കുന്ന സ്വാഭാവിക മലയാള അർത്ഥം മനസ്സിലാക്കുക.`;
      fallbackAlternatives = [
        {
          phrase: `സ്വാഭാവിക മലയാളം: ഇതിന്റെ അർത്ഥം സന്ദർഭത്തിനനുസരിച്ച് മനസ്സിലാക്കുക`,
          style: 'Everyday',
          explanation: 'ഗൾഫിലെ സംഭാഷണങ്ങളിൽ സാധാരണയായി അർത്ഥമാക്കുന്നത്.'
        },
        {
          phrase: `മര്യാദാപൂർവ്വമായ സംഭാഷണം (Polite Register)`,
          style: 'Workplace',
          explanation: 'സൗഹൃദത്തോടെ സംസാരിക്കാൻ.'
        }
      ];
    } else if (isArabicTarget) {
      fallbackTrap = `تَرْجَمَة حَرْفِيَّة غَيْر طَبِيعِيَّة`;
      fallbackExplanation = `Avoid literal word-for-word translation. Native Arabic speakers use set colloquial formulas and situational pleasantries.`;
      fallbackAlternatives = [
        {
          phrase: `بِطَرِيقَة طَبِيعِيَّة فِي المَحَادَثَة (Bi-tareeqah tabee'iyyah)`,
          style: 'Everyday',
          explanation: 'Natural spoken Arabic formula.'
        },
        {
          phrase: `أُسْلُوب مُهَذَّب وَرَسْمِي (Usloob muhaddhab wa rasmi)`,
          style: 'Workplace',
          explanation: 'Polite, courteous Arabic phrasing.'
        }
      ];
    }

    const dynamicEntry: NativeRephraseEntry = {
      id: 'dyn-' + Date.now(),
      sourceText: text,
      sourceLang: currentPair.source,
      sourceLangCode: currentPair.sourceCode,
      targetLang: currentPair.target,
      targetLangCode: currentPair.targetCode,
      literalTrap: fallbackTrap,
      literalExplanation: fallbackExplanation,
      naturalAlternatives: fallbackAlternatives,
      cultureTip: `Native ${currentPair.target} speakers favor contextual phrasal expressions rather than direct syntactic calques.`,
      grammarTip: `Avoid direct word-for-word mapping of postpositions and clitics.`,
      youglishQuery: text.replace(/[^\w\s]/gi, '').trim() || 'natural expression',
      category: 'Learner Query',
      evaluation: {
        naturalnessScore: 40,
        verdict: 'Literal Calque Trap',
        directFeedback: `Literal transfer from ${currentPair.source} into ${currentPair.target} detected. Compare with native alternatives below.`
      }
    };
    setActiveAnalysis(dynamicEntry);
    setActiveTabSub('analysis');
  };

  // TTS Voice Output with rate control
  const handleSpeak = (phrase: string, langCode: string = 'en', rate: number = 0.95) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = langCode === 'ml' ? 'ml-IN' : langCode === 'hi' ? 'hi-IN' : langCode === 'ar' ? 'ar-SA' : langCode === 'es' ? 'es-ES' : langCode === 'ja' ? 'ja-JP' : 'en-US';
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Save to Phrasebook
  const handleSaveToDeck = () => {
    if (!activeAnalysis || !onSaveToPhrasebook) return;
    const bestAlt = activeAnalysis.naturalAlternatives[0]?.phrase || activeAnalysis.sourceText;
    const newSentence: SavedSentence = {
      id: 'phrase-' + Date.now(),
      videoId: 'native-studio',
      youtubeId: '',
      videoTitle: `NativeStyle: ${activeAnalysis.sourceLang} ➔ ${activeAnalysis.targetLang}`,
      subtitleId: 0,
      start: 0,
      end: 0,
      text: activeAnalysis.sourceText,
      translation: bestAlt,
      transliteration: activeAnalysis.literalTrap,
      targetLangCode: activeAnalysis.targetLangCode,
      nativeLangCode: activeAnalysis.sourceLangCode,
      notes: `${activeAnalysis.literalExplanation} (Tip: ${activeAnalysis.cultureTip || ''})`,
      userNotes: `Learned in NativeStyle Studio. Avoid: "${activeAnalysis.literalTrap}"`,
      tags: ['NativeStyle', activeAnalysis.category || 'Idiom', activeAnalysis.sourceLang],
      savedAt: Date.now(),
      masteryLevel: 'learning'
    };
    onSaveToPhrasebook(newSentence);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter preset catalog for current language pair
  const currentPairPresets = PRESET_REPHRASE_ENTRIES.filter(
    e => e.sourceLangCode === currentPair.sourceCode && e.targetLangCode === currentPair.targetCode
  );

  // Generate fresh topic traps on the fly using Gemini AI
  const handleGenerateCustomTopics = async (topicToUse?: string) => {
    const targetTopic = (topicToUse || customTopicInput).trim();
    if (!targetTopic) return;

    setIsDiscoveringTopics(true);
    setAiAlert({
      type: 'info',
      message: `🤖 Gemini 3.1 Flash Lite discovering SLA calque traps for "${targetTopic}" (${currentPair.source} ➔ ${currentPair.target})...`
    });

    try {
      const res = await fetch('/api/ai/discover-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLang: currentPair.source,
          targetLang: currentPair.target,
          customTopic: targetTopic
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.topics && Array.isArray(data.topics)) {
          const newEntries: NativeRephraseEntry[] = [];
          data.topics.forEach((catObj: any, cIdx: number) => {
            (catObj.traps || []).forEach((trap: any, tIdx: number) => {
              newEntries.push({
                id: `custom-${Date.now()}-${cIdx}-${tIdx}`,
                sourceText: trap.sourceText || targetTopic,
                sourceLang: currentPair.source,
                sourceLangCode: currentPair.sourceCode,
                targetLang: currentPair.target,
                targetLangCode: currentPair.targetCode,
                literalTrap: trap.literalTrap || `Literal translation trap`,
                literalExplanation: trap.literalExplanation || `Subconscious mother-tongue calque in ${targetTopic}.`,
                naturalAlternatives: trap.naturalAlternatives?.length 
                  ? trap.naturalAlternatives 
                  : [{ phrase: targetTopic, style: 'Conversational', explanation: 'Refined native expression' }],
                cultureTip: trap.cultureTip || 'Verified against conversational corpora.',
                grammarTip: trap.grammarTip || 'Check target collocations and register.',
                youglishQuery: trap.youglishQuery || targetTopic.split(' ')[0],
                category: catObj.category || targetTopic
              });
            });
          });

          if (newEntries.length > 0) {
            setCustomAiTraps(prev => [...newEntries, ...prev]);
            setActiveAnalysis(newEntries[0]);
            setIsDiscoverModalOpen(false);
            setCustomTopicInput('');
            setSelectedTopic(newEntries[0].category || 'all');
            setAiAlert({
              type: 'success',
              message: `✨ Discovered ${newEntries.length} new subconscious traps for "${targetTopic}" via Gemini!`
            });
            setTimeout(() => setAiAlert(null), 5000);
            return;
          }
        }
      }

      // Offline linguistic heuristics fallback
      const fallbackEntry: NativeRephraseEntry = {
        id: `custom-fb-${Date.now()}`,
        sourceText: targetTopic,
        sourceLang: currentPair.source,
        sourceLangCode: currentPair.sourceCode,
        targetLang: currentPair.target,
        targetLangCode: currentPair.targetCode,
        literalTrap: `Direct transfer of "${targetTopic}"`,
        literalExplanation: `Learners often use direct mother-tongue word order for "${targetTopic}". Native speakers use idiomatic phrasal expressions.`,
        naturalAlternatives: [
          { phrase: `Natural expression for ${targetTopic}`, style: 'Everyday', explanation: 'Conversational phrasing' },
          { phrase: `Polite way to say ${targetTopic}`, style: 'Polite', explanation: 'Courteous register' }
        ],
        cultureTip: 'Native speakers emphasize clarity and tone softening.',
        grammarTip: 'Avoid direct mother-tongue syntax.',
        youglishQuery: targetTopic.split(' ')[0] || targetTopic,
        category: targetTopic
      };

      setCustomAiTraps(prev => [fallbackEntry, ...prev]);
      setActiveAnalysis(fallbackEntry);
      setIsDiscoverModalOpen(false);
      setAiAlert({
        type: 'info',
        message: `Generated custom practice traps for "${targetTopic}" via SLA heuristics.`
      });
      setTimeout(() => setAiAlert(null), 4000);
    } catch (err: any) {
      setAiAlert({
        type: 'error',
        message: `⚠️ AI Discovery alert: ${err.message}. Using built-in SLA rules.`
      });
    } finally {
      setIsDiscoveringTopics(false);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-3 sm:p-6 transition-colors ${
      isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 1. Header Banner */}
        <div className={`rounded-3xl p-5 sm:p-7 border relative overflow-hidden shadow-sm ${
          isLight 
            ? 'bg-gradient-to-br from-indigo-50 via-white to-rose-50 border-indigo-100' 
            : 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-rose-950/20 border-slate-800'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500 text-white flex items-center gap-1 shadow-sm">
                  <Flame className="w-3.5 h-3.5" />
                  SLA Scientific Retention
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                  isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/50 text-indigo-300'
                }`}>
                  Unlearn Calques & Speak Naturally
                </span>

                {/* Live LLM Health Indicator & Ping Test */}
                <button
                  onClick={checkLlmStatus}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    llmHealth.status === 'online'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
                      : llmHealth.status === 'checking'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25'
                  }`}
                  title="Click to verify live Gemini AI status"
                >
                  <span className={`w-2 h-2 rounded-full ${
                    llmHealth.status === 'online' ? 'bg-emerald-500 animate-pulse' : llmHealth.status === 'checking' ? 'bg-amber-500 animate-spin' : 'bg-rose-500'
                  }`} />
                  <span>{llmHealth.message}</span>
                  <span className="text-[10px] underline opacity-75">Ping</span>
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                NativeStyle Studio
              </h1>
              <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Stop translating literally from your mother tongue. Detect subconscious <span className="font-semibold text-rose-500">L1 Calque Traps</span> (like <em>&ldquo;You only told&rdquo;</em> or <em>&ldquo;Open the light&rdquo;</em>) and master authentic conversational expressions with voice audio and real-world video dialogues.
              </p>
            </div>

            {/* Language Pair Selector & Quick Swap */}
            <div className={`p-2 rounded-2xl border flex items-center gap-2 self-stretch md:self-auto justify-between ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-700'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentPair.flag}</span>
                <select
                  value={selectedPairId}
                  onChange={(e) => handlePairChange(e.target.value)}
                  className={`text-xs sm:text-sm font-bold bg-transparent outline-none cursor-pointer ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}
                >
                  {LANGUAGE_PAIRS.map(pair => (
                    <option key={pair.id} value={pair.id} className={isLight ? 'text-slate-800 bg-white' : 'text-slate-100 bg-slate-900'}>
                      {pair.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Swap Button */}
              <button
                onClick={() => {
                  const inverted = LANGUAGE_PAIRS.find(p => p.sourceCode === currentPair.targetCode && p.targetCode === currentPair.sourceCode);
                  if (inverted) handlePairChange(inverted.id);
                }}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-600' : 'hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title="Swap Language Direction"
              >
                <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Status Alert Notification (Direct Feedback if LLM is running or fails) */}
        {aiAlert && (
          <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-xs ${
            aiAlert.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-700 dark:text-emerald-300'
              : aiAlert.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/35 text-rose-700 dark:text-rose-300'
              : 'bg-indigo-500/15 border-indigo-500/35 text-indigo-700 dark:text-indigo-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {aiAlert.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              ) : aiAlert.type === 'info' ? (
                <Bot className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <span className="font-semibold">{aiAlert.message}</span>
            </div>
            <button
              onClick={() => setAiAlert(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2. Interactive Input Box (Voice + Text + Instant Analyze) */}
        <div className={`rounded-3xl p-4 sm:p-5 border transition-all shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Input Native Sentence or Literal {currentPair.target} Draft:</span>
              </label>
              <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                isLight ? 'text-indigo-600' : 'text-indigo-400'
              }`}>
                <Bot className="w-3.5 h-3.5" />
                <span>AI Answer & Calque Evaluator (All Languages)</span>
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder={
                  currentPair.sourceCode === 'ml'
                    ? 'Type Malayalam "നീ തന്നെയല്ലേ പറഞ്ഞത്", Manglish, or "you only told that"...'
                    : currentPair.sourceCode === 'hi'
                    ? 'Type Hindi "मैंने ही तो कहा था", Hinglish, or "I only told that"...'
                    : currentPair.sourceCode === 'ar'
                    ? 'Type Arabic "افتح النور", Arabizi, or "open the light"...'
                    : currentPair.sourceCode === 'es'
                    ? 'Type Spanish "Tengo hambre", or "I have hunger"...'
                    : currentPair.sourceCode === 'ja'
                    ? 'Type Japanese "よろしくお願いします", or literal draft...'
                    : `Enter sentence in ${currentPair.source} or draft in ${currentPair.target} to check with AI...`
                }
                className={`w-full pl-4 pr-36 py-3.5 rounded-2xl text-sm font-medium border outline-none transition-all ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100' 
                    : 'bg-slate-850 border-slate-750 text-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50'
                }`}
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                {/* Voice Input Button */}
                <button
                  onClick={toggleRecording}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                    isRecording
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md shadow-rose-500/40'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                  }`}
                  title={isRecording ? 'Listening... click to stop' : 'Record your voice'}
                >
                  {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-rose-500" />}
                  <span className="hidden sm:inline">{isRecording ? 'Listening' : 'Speak'}</span>
                </button>

                {/* AI Check Button */}
                <button
                  onClick={() => handleAnalyze()}
                  disabled={aiStatus === 'analyzing' || !inputText.trim()}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {aiStatus === 'analyzing' ? (
                    <Bot className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{aiStatus === 'analyzing' ? 'Checking...' : 'AI Check'}</span>
                </button>
              </div>
            </div>

            {/* Preloaded Topics Category Filter & AI Topic Discovery */}
            <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>📁 Preloaded Topics:</span>
                </span>
                
                {/* AI Topic Discovery Button */}
                <button
                  onClick={() => setIsDiscoverModalOpen(true)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white shadow-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Generate custom translation traps with Gemini AI"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Discover Topics</span>
                </button>
              </div>

              {/* Topic Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                {[
                  { id: 'all', label: 'All Topics', icon: '✨' },
                  { id: 'Workplace & Business', label: 'Workplace', icon: '🏢' },
                  { id: 'Daily Life & Casual', label: 'Everyday', icon: '☕' },
                  { id: 'Emphatic Particles & Tags', label: 'Calque Traps', icon: '⚡' },
                  { id: 'Politeness & Etiquette', label: 'Etiquette', icon: '🤝' },
                  { id: 'Travel & Directions', label: 'Travel', icon: '🚕' },
                  { id: 'Sensations & Health', label: 'Sensations', icon: '❤️' },
                ].map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 border transition-all cursor-pointer flex items-center gap-1 ${
                      selectedTopic === topic.id
                        ? isLight
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                          : 'bg-indigo-500 text-white border-indigo-600 shadow-sm'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span>{topic.icon}</span>
                    <span>{topic.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                {(() => {
                  const combined = [
                    ...currentPairPresets,
                    ...customAiTraps.filter(t => t.sourceLangCode === currentPair.sourceCode && t.targetLangCode === currentPair.targetCode)
                  ];
                  const filtered = selectedTopic === 'all' 
                    ? combined 
                    : combined.filter(p => p.category?.toLowerCase().includes(selectedTopic.toLowerCase()) || p.category === selectedTopic);
                  
                  if (filtered.length === 0) {
                    return (
                      <span className={`text-xs italic py-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        No presets in this topic yet. Click &ldquo;AI Discover Topics&rdquo; to generate fresh traps!
                      </span>
                    );
                  }

                  return filtered.map(preset => {
                    const isAr = /[\u0600-\u06FF]/.test(preset.sourceText);
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setInputText(preset.sourceText);
                          handleAnalyze(preset.sourceText);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeAnalysis?.id === preset.id
                            ? isLight
                              ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm ring-1 ring-rose-400'
                              : 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold ring-1 ring-rose-500'
                            : isLight
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                            : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300 hover:text-slate-100'
                        }`}
                      >
                        <span className={`font-semibold ${isAr ? 'font-serif text-sm' : ''}`}>
                          {preset.sourceText}
                        </span>
                        <span className="text-[10px] opacity-75 border-l pl-1.5 border-slate-300 dark:border-slate-600">
                          {preset.literalTrap.split('/')[0].trim()}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Sub-tabs Navigation: Analysis Card vs Catalog */}
        <div className="flex items-center gap-2 border-b pb-2 border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTabSub('analysis')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTabSub === 'analysis'
                ? isLight
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-500 text-white shadow-sm'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contrastive Analysis</span>
          </button>

          <button
            onClick={() => setActiveTabSub('catalog')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTabSub === 'catalog'
                ? isLight
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-700 text-white shadow-sm'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Preloaded Topics & Traps ({currentPairPresets.length + customAiTraps.length})</span>
          </button>
        </div>

        {/* 4. Tab 1: Contrastive Analysis View */}
        {activeTabSub === 'analysis' && activeAnalysis && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* AI Answer Evaluation & Naturalness Score Banner */}
            {activeAnalysis.evaluation && (
              <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                (activeAnalysis.evaluation.naturalnessScore ?? 50) >= 80
                  ? isLight
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-xs'
                    : 'bg-emerald-950/20 border-emerald-900/60 text-emerald-100 shadow-xs'
                  : (activeAnalysis.evaluation.naturalnessScore ?? 50) >= 60
                  ? isLight
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950 shadow-xs'
                    : 'bg-amber-950/20 border-amber-900/60 text-amber-100 shadow-xs'
                  : isLight
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950 shadow-xs'
                  : 'bg-rose-950/25 border-rose-900/60 text-rose-100 shadow-xs'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-current/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          AI Answer Evaluation
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          (activeAnalysis.evaluation.naturalnessScore ?? 50) >= 80
                            ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                            : (activeAnalysis.evaluation.naturalnessScore ?? 50) >= 60
                            ? 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                            : 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200'
                        }`}>
                          {activeAnalysis.evaluation.verdict || 'AI Contrastive Analysis'}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-75">
                        Linguistically evaluated for {activeAnalysis.sourceLang} ➔ {activeAnalysis.targetLang}
                      </p>
                    </div>
                  </div>

                  {/* Naturalness Score Gauge */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase opacity-70">Naturalness Score</div>
                      <div className="text-lg font-black leading-none">
                        {activeAnalysis.evaluation.naturalnessScore ?? 45}%
                      </div>
                    </div>
                    <div className="w-16 sm:w-28 h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden relative p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          (activeAnalysis.evaluation.naturalnessScore ?? 50) >= 80
                            ? 'bg-emerald-500'
                            : (activeAnalysis.evaluation.naturalnessScore ?? 50) >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(5, Math.min(100, activeAnalysis.evaluation.naturalnessScore ?? 45))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Feedback Sentence */}
                {activeAnalysis.evaluation.directFeedback && (
                  <div className="pt-3 text-xs leading-relaxed">
                    <strong className="font-bold">AI Diagnosis: </strong>
                    <span>{activeAnalysis.evaluation.directFeedback}</span>
                  </div>
                )}
              </div>
            )}

            {/* Top Trap vs Native Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Card 1: ⚠️ The Literal Trap (What to Avoid) */}
              <div className={`rounded-3xl p-5 border relative overflow-hidden ${
                isLight 
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
                  : 'bg-rose-950/20 border-rose-900/50 text-rose-100'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>The Literal Trap (Calque)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                    Avoid
                  </span>
                </div>

                <div className="space-y-2">
                  <div className={`text-xl font-bold text-rose-600 dark:text-rose-400 line-through decoration-rose-500/70 ${
                    /[\u0600-\u06FF]/.test(activeAnalysis.literalTrap) ? 'font-serif text-2xl leading-relaxed' : ''
                  }`}>
                    &ldquo;{activeAnalysis.literalTrap}&rdquo;
                  </div>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-rose-800/80' : 'text-rose-200/80'}`}>
                    {activeAnalysis.literalExplanation}
                  </p>
                </div>

                <div className={`mt-4 pt-3 border-t text-[11px] flex items-center justify-between ${
                  isLight ? 'border-rose-200 text-rose-700' : 'border-rose-900/40 text-rose-300'
                }`}>
                  <span>Input: <strong className={`font-semibold ${/[\u0600-\u06FF]/.test(activeAnalysis.sourceText) ? 'font-serif text-base' : ''}`}>{activeAnalysis.sourceText}</strong></span>
                  <span>({activeAnalysis.sourceLang})</span>
                </div>
              </div>

              {/* Card 2: ✨ The Native Way (Recommended Alternatives) */}
              <div className={`rounded-3xl p-5 border relative overflow-hidden ${
                isLight 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                  : 'bg-emerald-950/20 border-emerald-900/50 text-emerald-100'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Natural Native Phrasing</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                    Native Model
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeAnalysis.naturalAlternatives.map((alt, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isLight ? 'bg-white border-emerald-200/80 shadow-xs' : 'bg-slate-900/80 border-emerald-900/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold text-emerald-700 dark:text-emerald-300 ${
                            /[\u0600-\u06FF]/.test(alt.phrase) ? 'font-serif text-xl leading-relaxed' : 'text-sm'
                          }`}>
                            &ldquo;{alt.phrase}&rdquo;
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            alt.style === 'Casual'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                              : alt.style === 'Idiomatic'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                          }`}>
                            {alt.style}
                          </span>
                        </div>
                        {alt.explanation && (
                          <p className={`text-[11px] leading-tight ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            {alt.explanation}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Audio Listen (Normal) */}
                        <button
                          onClick={() => handleSpeak(alt.phrase, activeAnalysis.targetLangCode, 0.95)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-600' : 'hover:bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                          title="Listen to native pronunciation (Normal 1.0x)"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                        </button>

                        {/* Audio Listen (Slow) */}
                        <button
                          onClick={() => handleSpeak(alt.phrase, activeAnalysis.targetLangCode, 0.72)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-600' : 'hover:bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                          title="Listen slowly (Slow 0.75x)"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                        </button>

                        {/* Watch Conversational Examples on YouTube */}
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                            `"${alt.phrase}" native conversation pronunciation`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-600' : 'hover:bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                          title="Watch native speakers say this in real videos on YouTube"
                        >
                          <Youtube className="w-3.5 h-3.5 text-rose-500" />
                        </a>

                        {/* Copy */}
                        <button
                          onClick={() => handleCopy(alt.phrase, `alt-${idx}`)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-600' : 'hover:bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                          title="Copy text"
                        >
                          {copiedId === `alt-${idx}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cultural & Grammatical Insights */}
            <div className={`rounded-3xl p-5 border space-y-4 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold tracking-tight">
                  Linguistic Retention & Cultural Insight
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {activeAnalysis.cultureTip && (
                  <div className={`p-3.5 rounded-2xl border ${
                    isLight ? 'bg-amber-50/50 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                  }`}>
                    <strong className="block mb-1 font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <span>Cultural Rule of Thumb:</span>
                    </strong>
                    <p className="leading-relaxed">{activeAnalysis.cultureTip}</p>
                  </div>
                )}

                {activeAnalysis.grammarTip && (
                  <div className={`p-3.5 rounded-2xl border ${
                    isLight ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900' : 'bg-indigo-950/20 border-indigo-900/40 text-indigo-200'
                  }`}>
                    <strong className="block mb-1 font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                      <span>Grammar Mechanics:</span>
                    </strong>
                    <p className="leading-relaxed">{activeAnalysis.grammarTip}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons: Save to SRS Deck & Launch Video Clips */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleSaveToDeck}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                      savedSuccess
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : isLight
                        ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                        : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/40'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{savedSuccess ? 'Saved to Phrasebook & SRS Deck!' : 'Pin to Saved Phrasebook'}</span>
                  </button>

                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      `"${activeAnalysis.naturalAlternatives[0]?.phrase || activeAnalysis.sourceText}" conversation pronunciation`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Watch real-world conversation clips on YouTube"
                  >
                    <Youtube className="w-3.5 h-3.5 text-rose-500" />
                    <span>Watch Real Conversation Clips (YouTube)</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>

                {onNavigateToPlayer && (
                  <button
                    onClick={onNavigateToPlayer}
                    className={`text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Back to Video Player</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* 5. Tab 2: Traps Catalog / Knowledge Base */}
        {activeTabSub === 'catalog' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPairPresets.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => {
                    setActiveAnalysis(preset);
                    setActiveTabSub('analysis');
                  }}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-sm hover:scale-[1.01] ${
                    isLight 
                      ? 'bg-white hover:bg-slate-50 border-slate-200' 
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        {preset.category}
                      </span>
                      <span className="text-xs font-semibold text-rose-500">Calque Trap</span>
                    </div>

                    <div className="text-base font-bold">
                      {preset.sourceText}
                    </div>

                    <div className="text-xs text-rose-600 dark:text-rose-400 line-through font-medium">
                      &ldquo;{preset.literalTrap}&rdquo;
                    </div>

                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ➔ &ldquo;{preset.naturalAlternatives[0]?.phrase}&rdquo;
                    </div>
                  </div>

                  <div className={`pt-2 border-t text-[11px] flex items-center justify-between ${
                    isLight ? 'border-slate-100 text-slate-400' : 'border-slate-800 text-slate-500'
                  }`}>
                    <span>Click to view contrast analysis & audio practice</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. AI Discover Topics Modal */}
        {isDiscoverModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div 
              className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-5 transition-all ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">AI Topic Discovery</h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Generate custom SLA calque traps for {currentPair.source} ➔ {currentPair.target}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDiscoverModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Input for custom topic */}
              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Enter any topic, situation, or workplace scenario:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateCustomTopics()}
                    placeholder="e.g. Software sprint standup, Airport boarding, Doctor consultation..."
                    className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-rose-500' : 'bg-slate-800 border-slate-700 text-slate-100 focus:border-rose-400'
                    }`}
                  />
                  <button
                    onClick={() => handleGenerateCustomTopics()}
                    disabled={isDiscoveringTopics || !customTopicInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {isDiscoveringTopics ? <Bot className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isDiscoveringTopics ? 'Discovering...' : 'Discover'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="space-y-1.5">
                <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Popular Scenarios to Discover:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Workplace Sprint & Emails',
                    'Airport & Immigration',
                    'Doctor Visit & Illness',
                    'Dining Out & Restaurants',
                    'Grocery & Street Markets',
                    'Polite Disagreements & Debates',
                    'Phone Calls & Network Issues',
                    'Job Interview & Resumes'
                  ].map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        setCustomTopicInput(s);
                        handleGenerateCustomTopics(s);
                      }}
                      disabled={isDiscoveringTopics}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all cursor-pointer ${
                        isLight 
                          ? 'bg-slate-100 hover:bg-rose-50 border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-700' 
                          : 'bg-slate-800 hover:bg-rose-950/40 border-slate-700 text-slate-300 hover:border-rose-500/50 hover:text-rose-300'
                      }`}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                isLight ? 'bg-indigo-50/60 border-indigo-100 text-indigo-800' : 'bg-indigo-950/30 border-indigo-900/50 text-indigo-300'
              }`}>
                <Bot className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Powered by Gemini 3.1 Flash Lite with contrastive SLA linguistics and real-world audio synthesis.</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
