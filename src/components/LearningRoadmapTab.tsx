import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Lock, 
  Play, 
  Star, 
  Sparkles, 
  Volume2, 
  Mic, 
  MicOff, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown,
  HelpCircle, 
  Award, 
  RotateCcw, 
  BookOpen, 
  ArrowRight, 
  X,
  AlertTriangle,
  Lightbulb,
  Check,
  Flame,
  Globe,
  FolderTree,
  Compass,
  Search,
  Layers,
  Bot,
  Youtube
} from 'lucide-react';
import { RoadmapTrack, RoadmapLessonNode, RoadmapStage } from '../types';
import { ROADMAP_TRACKS } from '../data/roadmapData';
import { SUPPORTED_LANGUAGE_PAIRS } from '../data/languagePairs';

interface LearningRoadmapTabProps {
  activePairKey: string;
  onChangePairKey: (key: string) => void;
  theme?: 'light' | 'dark';
  onNavigateToPlayer?: (videoId?: string) => void;
  onNavigateToNativeStudio?: (query?: string) => void;
}

const LOCAL_STORAGE_MASTERED_KEY = 'polytube_roadmap_mastered_lessons_v1';
const LOCAL_STORAGE_XP_KEY = 'polytube_roadmap_xp_v1';
const LOCAL_STORAGE_CUSTOM_STAGES_KEY = 'polytube_roadmap_custom_stages_v1';

export const LearningRoadmapTab: React.FC<LearningRoadmapTabProps> = ({
  activePairKey,
  onChangePairKey,
  theme = 'light',
  onNavigateToPlayer,
  onNavigateToNativeStudio,
}) => {
  const isLight = theme === 'light';

  // View Mode: 'tree' (Full Curriculum Tree View) vs 'path' (Duolingo style)
  const [viewMode, setViewMode] = useState<'tree' | 'path'>('tree');

  // Mastered lessons set
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MASTERED_KEY);
      return stored ? JSON.parse(stored) : ['ml-node-1']; // default 1 mastered for warm start
    } catch {
      return ['ml-node-1'];
    }
  });

  // User XP points
  const [userXP, setUserXP] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_XP_KEY);
      return stored ? parseInt(stored, 10) : 60;
    } catch {
      return 60;
    }
  });

  // Custom AI Generated Stages stored in localStorage
  const [customStagesByTrack, setCustomStagesByTrack] = useState<Record<string, RoadmapStage[]>>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CUSTOM_STAGES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Active track combined with any custom AI stages
  const baseTrack: RoadmapTrack = ROADMAP_TRACKS[activePairKey] || ROADMAP_TRACKS['ml-en'];
  const customStagesForTrack = customStagesByTrack[activePairKey] || [];
  const currentTrack: RoadmapTrack = {
    ...baseTrack,
    stages: [...baseTrack.stages, ...customStagesForTrack]
  };

  // Tree View State: Search, Filter, Expand/Collapse
  const [treeSearch, setTreeSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'mastered' | 'pending'>('all');
  const [expandedStageIds, setExpandedStageIds] = useState<string[]>(() => currentTrack.stages.map(s => s.id));
  const [expandedLessonIds, setExpandedLessonIds] = useState<string[]>([]);

  // AI Discover Branch Modal State
  const [isAiBranchModalOpen, setIsAiBranchModalOpen] = useState<boolean>(false);
  const [branchTopicInput, setBranchTopicInput] = useState<string>('');
  const [isGeneratingBranch, setIsGeneratingBranch] = useState<boolean>(false);
  const [aiRoadmapAlert, setAiRoadmapAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Synchronize expanded stages when track changes
  useEffect(() => {
    setExpandedStageIds(currentTrack.stages.map(s => s.id));
  }, [activePairKey]);

  // Save custom stages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_STAGES_KEY, JSON.stringify(customStagesByTrack));
    } catch (e) {
      console.warn('Failed to save custom stages:', e);
    }
  }, [customStagesByTrack]);

  // Flattened lessons list to calculate next active lesson
  const allLessons: RoadmapLessonNode[] = currentTrack.stages.flatMap((s) => s.lessons);
  const totalLessons = allLessons.length;
  const masteredCountInTrack = allLessons.filter((l) => masteredIds.includes(l.id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((masteredCountInTrack / totalLessons) * 100) : 0;

  // Selected lesson modal
  const [selectedLesson, setSelectedLesson] = useState<RoadmapLessonNode | null>(null);
  const [modalTab, setModalTab] = useState<'study' | 'quiz'>('study');

  // Quiz state inside modal
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Speech synthesis and recognition
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const recognitionRef = React.useRef<any>(null);

  // Save mastered lessons to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_MASTERED_KEY, JSON.stringify(masteredIds));
    } catch (e) {
      console.warn('Failed to save roadmap mastered lessons:', e);
    }
  }, [masteredIds]);

  // Save XP to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_XP_KEY, userXP.toString());
    } catch (e) {
      console.warn('Failed to save XP:', e);
    }
  }, [userXP]);

  // Reset quiz state when modal changes
  useEffect(() => {
    if (selectedLesson) {
      setSelectedQuizOption(null);
      setQuizSubmitted(false);
      setShowCelebration(false);
      setSpeechTranscript('');
    }
  }, [selectedLesson]);

  // Pronounce phrase via Web Speech Synthesis
  const handleSpeak = (text: string, lang = 'en-US') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle voice repetition practice
  const handleToggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript('Listening to your pronunciation...');
      };

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setSpeechTranscript(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn(err);
      setIsListening(false);
    }
  };

  // Handle quiz option selection
  const handleSelectQuizOption = (optionId: string) => {
    if (quizSubmitted) return;
    setSelectedQuizOption(optionId);
    setQuizSubmitted(true);

    const chosen = selectedLesson?.quiz.options.find((o) => o.id === optionId);
    if (chosen?.isCorrect && selectedLesson) {
      setShowCelebration(true);
      if (!masteredIds.includes(selectedLesson.id)) {
        setMasteredIds((prev) => [...prev, selectedLesson.id]);
        setUserXP((prev) => prev + selectedLesson.xpReward);
      }
    }
  };

  // Mark lesson manually as mastered
  const handleToggleMastered = (lessonId: string, xpReward: number) => {
    if (masteredIds.includes(lessonId)) {
      setMasteredIds((prev) => prev.filter((id) => id !== lessonId));
    } else {
      setMasteredIds((prev) => [...prev, lessonId]);
      setUserXP((prev) => prev + xpReward);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  // Find first non-mastered lesson for "Jump to Next"
  const nextLesson = allLessons.find((l) => !masteredIds.includes(l.id)) || allLessons[0];

  // Generate customized syllabus branch using Gemini AI
  const handleGenerateBranch = async (topicToUse?: string) => {
    const targetTopic = (topicToUse || branchTopicInput).trim();
    if (!targetTopic) return;

    setIsGeneratingBranch(true);
    setAiRoadmapAlert({
      type: 'info',
      message: `🤖 Gemini 3.1 Flash Lite generating custom syllabus branch for "${targetTopic}" (${currentTrack.sourceLang} ➔ ${currentTrack.targetLang})...`
    });

    try {
      const res = await fetch('/api/ai/expand-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairKey: activePairKey,
          sourceLang: currentTrack.sourceLang,
          targetLang: currentTrack.targetLang,
          branchTopic: targetTopic
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.branch && data.branch.units) {
          const stageId = `custom-stage-${Date.now()}`;
          const newStage: RoadmapStage = {
            id: stageId,
            title: data.branch.stageTitle || `${targetTopic} Mastery`,
            description: data.branch.stageDescription || `Custom interactive learning branch generated via Gemini SLA analysis.`,
            badge: `✨ ${targetTopic}`,
            lessons: data.branch.units.map((u: any, idx: number) => ({
              id: u.id || `node-${stageId}-${idx}`,
              stageId,
              order: (currentTrack.stages.length * 4) + idx + 1,
              xpReward: u.xpReward || 40,
              title: u.title || `Unit ${idx + 1}`,
              subtitle: u.subtitle || targetTopic,
              sourcePhrase: u.sourcePhrase || targetTopic,
              transliteration: u.transliteration || '',
              literalTrap: u.literalTrap || `Literal translation trap`,
              literalExplanation: u.literalExplanation || 'Mother-tongue calque to unlearn.',
              naturalAlternatives: u.naturalAlternatives || [{ phrase: targetTopic, style: 'Everyday', explanation: 'Natural phrasing' }],
              culturalNote: u.culturalNote || 'Verified in authentic conversation.',
              grammarTip: u.grammarTip || 'Follow native communicative conventions.',
              youglishQuery: u.youglishQuery || targetTopic.split(' ')[0],
              quiz: u.quiz || {
                question: `How do you naturally express this in ${currentTrack.targetLang}?`,
                options: [
                  { id: 'opt-1', text: u.naturalAlternatives?.[0]?.phrase || targetTopic, isCorrect: true, explanation: '✅ Natural native phrasing.' },
                  { id: 'opt-2', text: u.literalTrap || 'Literal translation', isCorrect: false, explanation: '❌ Calque trap to avoid.' }
                ]
              }
            }))
          };

          setCustomStagesByTrack(prev => ({
            ...prev,
            [activePairKey]: [...(prev[activePairKey] || []), newStage]
          }));
          setExpandedStageIds(prev => [...prev, stageId]);
          setIsAiBranchModalOpen(false);
          setBranchTopicInput('');
          setAiRoadmapAlert({
            type: 'success',
            message: `✨ Added new curriculum branch "${newStage.title}" with ${newStage.lessons.length} interactive units via Gemini!`
          });
          setTimeout(() => setAiRoadmapAlert(null), 5000);
          return;
        }
      }

      // Offline linguistic heuristics fallback
      const stageId = `custom-stage-${Date.now()}`;
      const fallbackStage: RoadmapStage = {
        id: stageId,
        title: `${targetTopic} Communication`,
        description: `Targeted practice for ${currentTrack.sourceLang} speakers mastering ${targetTopic}.`,
        badge: `🎯 ${targetTopic}`,
        lessons: [
          {
            id: `node-${stageId}-1`,
            stageId,
            order: (currentTrack.stages.length * 4) + 1,
            xpReward: 35,
            title: `${targetTopic}: Core Conversational Phrasing`,
            subtitle: 'Natural idioms vs literal translation',
            sourcePhrase: `Essential phrase for ${targetTopic}`,
            transliteration: '',
            literalTrap: `Direct mother-tongue translation for ${targetTopic}`,
            literalExplanation: 'Literal word-for-word transfer causes awkward non-native phrasing.',
            naturalAlternatives: [
              { phrase: `Natural expression in ${targetTopic}`, style: 'Everyday', explanation: 'Standard native conversational phrase' },
              { phrase: `Professional phrasing for ${targetTopic}`, style: 'Professional', explanation: 'Courteous workplace phrasing' }
            ],
            culturalNote: 'Context and social tone are critical in authentic native communication.',
            grammarTip: 'Use natural collocations instead of translating individual words.',
            youglishQuery: targetTopic.split(' ')[0],
            quiz: {
              question: `Which option sounds natural in ${targetTopic}?`,
              options: [
                { id: 'opt-1', text: `Natural expression in ${targetTopic}`, isCorrect: true, explanation: '✅ Natural native expression.' },
                { id: 'opt-2', text: `Direct literal transfer of words`, isCorrect: false, explanation: '❌ Mother-tongue calque trap.' }
              ]
            }
          }
        ]
      };

      setCustomStagesByTrack(prev => ({
        ...prev,
        [activePairKey]: [...(prev[activePairKey] || []), fallbackStage]
      }));
      setExpandedStageIds(prev => [...prev, stageId]);
      setIsAiBranchModalOpen(false);
      setAiRoadmapAlert({
        type: 'info',
        message: `Added custom curriculum unit "${fallbackStage.title}" via SLA heuristics.`
      });
      setTimeout(() => setAiRoadmapAlert(null), 4000);
    } catch (err: any) {
      setAiRoadmapAlert({
        type: 'error',
        message: `Failed to generate branch: ${err.message}. Offline heuristics used.`
      });
    } finally {
      setIsGeneratingBranch(false);
    }
  };

  return (
    <div className={`min-h-[85vh] py-6 px-3 sm:px-6 transition-colors ${
      isLight ? 'bg-slate-50/70 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">🗺️</span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-600 bg-clip-text text-transparent">
                Milestone Learning Roadmap
              </h1>
              
              {/* View Mode Toggle: Tree View vs Path */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'tree'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Complete hierarchical curriculum tree"
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>Full Tree View</span>
                </button>
                <button
                  onClick={() => setViewMode('path')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'path'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Winding Duolingo-style milestone map"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Milestone Path</span>
                </button>
              </div>
            </div>
            
            <p className={`text-xs sm:text-sm max-w-xl ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {currentTrack.subtitle}
            </p>

            {/* Language Track Selector & AI Discover Branch Button */}
            <div className="pt-2 flex items-center gap-2.5 flex-wrap">
              <span className={`text-xs font-semibold flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <Globe className="w-3.5 h-3.5 text-rose-500" />
                <span>Language Track:</span>
              </span>
              <select
                value={activePairKey}
                onChange={(e) => onChangePairKey(e.target.value)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer outline-none transition-all shadow-sm ${
                  isLight 
                    ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 focus:border-rose-500' 
                    : 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-750 focus:border-rose-400'
                }`}
              >
                {SUPPORTED_LANGUAGE_PAIRS.map((pair) => (
                  <option key={pair.key} value={pair.key}>
                    {pair.flag} {pair.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsAiBranchModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Generate custom curriculum branches with Gemini AI"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Discover Branch</span>
              </button>
            </div>
          </div>

          {/* User Progress Stats Card */}
          <div className={`flex items-center gap-4 sm:gap-6 p-4 rounded-2xl border self-stretch md:self-auto justify-between md:justify-start ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-750'
          }`}>
            {/* XP Points */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
              </div>
              <div>
                <div className="text-base font-black text-amber-500">{userXP} XP</div>
                <div className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Streak XP
                </div>
              </div>
            </div>

            {/* Mastered Fraction & Progress Bar */}
            <div className="flex flex-col gap-1.5 min-w-[130px]">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                  {masteredCountInTrack} / {totalLessons} Units
                </span>
                <span className="text-rose-500 font-extrabold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Jump to Next Lesson Button */}
            {nextLesson && (
              <button
                onClick={() => {
                  setSelectedLesson(nextLesson);
                  setModalTab('study');
                }}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-md shadow-rose-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* AI Roadmap Alert Notification */}
        {aiRoadmapAlert && (
          <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-xs ${
            aiRoadmapAlert.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-700 dark:text-emerald-300'
              : aiRoadmapAlert.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/35 text-rose-700 dark:text-rose-300'
              : 'bg-indigo-500/15 border-indigo-500/35 text-indigo-700 dark:text-indigo-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {aiRoadmapAlert.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              ) : aiRoadmapAlert.type === 'info' ? (
                <Bot className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <span className="font-semibold">{aiRoadmapAlert.message}</span>
            </div>
            <button
              onClick={() => setAiRoadmapAlert(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: FULL TREE VIEW (Comprehensive Hierarchical Syllabus)              */}
        {/* ========================================================================= */}
        {viewMode === 'tree' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Tree Controls Toolbar (Search, Filter, Expand/Collapse) */}
            <div className={`p-4 rounded-3xl border shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              {/* Search in Curriculum */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 text-slate-400 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={treeSearch}
                  onChange={(e) => setTreeSearch(e.target.value)}
                  placeholder="Search units, calques, native Malayalam phrases, or idioms..."
                  className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500' 
                      : 'bg-slate-800 border-slate-700 text-slate-100 focus:border-indigo-400'
                  }`}
                />
                {treeSearch && (
                  <button 
                    onClick={() => setTreeSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {[
                  { id: 'all', label: `All (${totalLessons})` },
                  { id: 'mastered', label: `Mastered (${masteredCountInTrack})` },
                  { id: 'pending', label: `To Learn (${totalLessons - masteredCountInTrack})` }
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setStatusFilter(pill.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition-all cursor-pointer ${
                      statusFilter === pill.id
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Expand / Collapse All Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setExpandedStageIds(currentTrack.stages.map(s => s.id))}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                  }`}
                  title="Expand all curriculum modules"
                >
                  Expand All
                </button>
                <button
                  onClick={() => setExpandedStageIds([])}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                  }`}
                  title="Collapse all modules"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Tree Structure Root & Branches */}
            <div className="space-y-4">
              {currentTrack.stages.map((stage: RoadmapStage, sIdx: number) => {
                const isStageExpanded = expandedStageIds.includes(stage.id);
                const stageMasteredCount = stage.lessons.filter(l => masteredIds.includes(l.id)).length;
                const stageTotal = stage.lessons.length;
                const stagePercent = stageTotal > 0 ? Math.round((stageMasteredCount / stageTotal) * 100) : 0;

                // Filter lessons based on search and status
                const filteredLessons = stage.lessons.filter(lesson => {
                  if (statusFilter === 'mastered' && !masteredIds.includes(lesson.id)) return false;
                  if (statusFilter === 'pending' && masteredIds.includes(lesson.id)) return false;
                  if (treeSearch.trim()) {
                    const q = treeSearch.toLowerCase();
                    return (
                      lesson.title.toLowerCase().includes(q) ||
                      lesson.subtitle.toLowerCase().includes(q) ||
                      lesson.sourcePhrase.toLowerCase().includes(q) ||
                      (lesson.transliteration && lesson.transliteration.toLowerCase().includes(q)) ||
                      lesson.literalTrap.toLowerCase().includes(q) ||
                      lesson.naturalAlternatives.some(a => a.phrase.toLowerCase().includes(q))
                    );
                  }
                  return true;
                });

                if (treeSearch.trim() && filteredLessons.length === 0) {
                  return null; // hide stage if search doesn't match
                }

                return (
                  <div 
                    key={stage.id}
                    className={`rounded-3xl border transition-all overflow-hidden shadow-xs ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {/* Stage Branch Header */}
                    <div 
                      onClick={() => {
                        setExpandedStageIds(prev => 
                          prev.includes(stage.id) ? prev.filter(id => id !== stage.id) : [...prev, stage.id]
                        );
                      }}
                      className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform ${
                          isStageExpanded ? 'rotate-90 text-indigo-500' : 'text-slate-400'
                        }`}>
                          <ChevronRight className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs">
                              {stage.badge}
                            </span>
                            <span className={`text-xs font-semibold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                              Stage #{sIdx + 1}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-black truncate text-slate-900 dark:text-slate-100">
                            {stage.title}
                          </h3>
                        </div>
                      </div>

                      {/* Stage Progress & Fraction */}
                      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                              {stageMasteredCount}/{stageTotal} Done
                            </span>
                            <span className="text-rose-500 font-extrabold">{stagePercent}%</span>
                          </div>
                          <div className="w-20 sm:w-28 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-rose-500 to-indigo-600 rounded-full"
                              style={{ width: `${stagePercent}%` }}
                            />
                          </div>
                        </div>

                        <div className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                          isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-950/40 border-amber-800 text-amber-400'
                        }`}>
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>+{stage.lessons.reduce((acc, l) => acc + l.xpReward, 0)} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage Lessons Tree Children */}
                    {isStageExpanded && (
                      <div className={`p-4 sm:p-5 pt-0 border-t space-y-3 ${
                        isLight ? 'border-slate-100 bg-slate-50/40' : 'border-slate-800/80 bg-slate-950/40'
                      }`}>
                        <p className={`text-xs pt-3 pb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {stage.description}
                        </p>

                        <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-indigo-400/30 dark:border-indigo-600/30">
                          {filteredLessons.map((lesson: RoadmapLessonNode) => {
                            const isMastered = masteredIds.includes(lesson.id);
                            const isInlineExpanded = expandedLessonIds.includes(lesson.id);

                            return (
                              <div
                                key={lesson.id}
                                className={`p-4 rounded-2xl border transition-all relative ${
                                  isMastered
                                    ? isLight 
                                      ? 'bg-emerald-50/50 border-emerald-200/80 shadow-xs' 
                                      : 'bg-emerald-950/20 border-emerald-800/50 shadow-xs'
                                    : isLight
                                    ? 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
                                    : 'bg-slate-900 border-slate-800 hover:border-indigo-600/60 shadow-xs'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                  {/* Left: Mastered Checkbox + Title + Calque Summary */}
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    {/* Toggle Mastered Checkbox */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleMastered(lesson.id, lesson.xpReward);
                                      }}
                                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                                        isMastered
                                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                                          : isLight
                                          ? 'border-slate-300 hover:border-emerald-500 text-transparent'
                                          : 'border-slate-700 hover:border-emerald-400 text-transparent'
                                      }`}
                                      title={isMastered ? 'Marked as Mastered (Click to undo)' : 'Click to mark as Mastered'}
                                    >
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </button>

                                    <div 
                                      onClick={() => {
                                        setSelectedLesson(lesson);
                                        setModalTab('study');
                                      }}
                                      className="space-y-1 min-w-0 cursor-pointer group/title"
                                    >
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                                          Unit #{lesson.order}
                                        </span>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                                          {lesson.title}
                                        </h4>
                                        <span className="text-xs font-semibold text-amber-500 flex items-center gap-0.5">
                                          <Star className="w-3 h-3 fill-amber-500" />
                                          +{lesson.xpReward} XP
                                        </span>
                                      </div>

                                      <div className="text-xs flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                          {lesson.sourcePhrase}
                                        </span>
                                        {lesson.transliteration && (
                                          <span className={`text-[11px] italic ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                            ({lesson.transliteration})
                                          </span>
                                        )}
                                      </div>

                                      {/* Literal Trap vs Natural Native Summary */}
                                      <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium line-through">
                                          🚫 {lesson.literalTrap}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                                          ✨ {lesson.naturalAlternatives[0]?.phrase}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Action Buttons */}
                                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                    {/* Web Speech TTS */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSpeak(lesson.naturalAlternatives[0]?.phrase || lesson.sourcePhrase);
                                      }}
                                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                        isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-600' : 'hover:bg-slate-800 border-slate-700 text-slate-300'
                                      }`}
                                      title="Listen to native pronunciation"
                                    >
                                      <Volume2 className="w-4 h-4 text-indigo-500" />
                                    </button>

                                    {/* Analyze Trap in NativeStyle Studio */}
                                    {lesson.sourcePhrase && onNavigateToNativeStudio && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onNavigateToNativeStudio(lesson.sourcePhrase);
                                        }}
                                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                                          isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                                        }`}
                                        title="Open in NativeStyle Studio to unlearn this calque trap"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Analyze</span>
                                      </button>
                                    )}

                                    {/* Launch Study/Quiz Modal */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLesson(lesson);
                                        setModalTab('quiz');
                                      }}
                                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 shadow-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                    >
                                      <Play className="w-3 h-3 fill-white" />
                                      <span>Practice</span>
                                    </button>

                                    {/* Toggle Inline Peek */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedLessonIds(prev => 
                                          prev.includes(lesson.id) ? prev.filter(id => id !== lesson.id) : [...prev, lesson.id]
                                        );
                                      }}
                                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                        isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-500' : 'hover:bg-slate-800 border-slate-700 text-slate-400'
                                      }`}
                                      title={isInlineExpanded ? 'Collapse notes' : 'Expand full lesson notes'}
                                    >
                                      <ChevronDown className={`w-4 h-4 transition-transform ${isInlineExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                  </div>
                                </div>

                                {/* Inline Expandable Lesson Details */}
                                {isInlineExpanded && (
                                  <div className={`mt-3 pt-3 border-t space-y-2.5 text-xs animate-in fade-in duration-150 ${
                                    isLight ? 'border-slate-200/60' : 'border-slate-800'
                                  }`}>
                                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                      <strong className="text-rose-500">Why to avoid:</strong> {lesson.literalExplanation}
                                    </p>

                                    <div className="space-y-1">
                                      <span className="font-bold text-slate-800 dark:text-slate-200">Natural Alternatives:</span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {lesson.naturalAlternatives.map((alt, idx) => (
                                          <div 
                                            key={idx} 
                                            className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                                              isLight ? 'bg-white border-slate-200' : 'bg-slate-850 border-slate-750'
                                            }`}
                                          >
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                              &ldquo;{alt.phrase}&rdquo;
                                            </span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                              {alt.style}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {lesson.culturalNote && (
                                      <div className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                                        isLight ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-900/50 text-amber-300'
                                      }`}>
                                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                        <span><strong>Cultural Insight:</strong> {lesson.culturalNote}</span>
                                      </div>
                                    )}

                                    {lesson.grammarTip && (
                                      <div className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                                        isLight ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900' : 'bg-indigo-950/20 border-indigo-900/50 text-indigo-300'
                                      }`}>
                                        <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                        <span><strong>Grammar Norm:</strong> {lesson.grammarTip}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: WINDING DUOLINGO-STYLE MILESTONE TRAIL                           */}
        {/* ========================================================================= */}
        {viewMode === 'path' && (
          <div className="relative py-8 flex flex-col items-center gap-12 animate-in fade-in duration-200">
            {currentTrack.stages.map((stage: RoadmapStage, stageIndex: number) => (
              <div key={stage.id} className="w-full flex flex-col items-center gap-8">
                
                {/* Stage Banner / Header */}
                <div className={`w-full max-w-2xl p-4 sm:p-5 rounded-2xl border text-center shadow-sm relative overflow-hidden transition-all ${
                  isLight ? 'bg-gradient-to-r from-rose-50/80 via-white to-amber-50/80 border-rose-200/80' : 'bg-gradient-to-r from-rose-950/30 via-slate-900 to-indigo-950/30 border-rose-500/30'
                }`}>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm mb-2">
                    {stage.badge}
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    {stage.title}
                  </h3>
                  <p className={`text-xs max-w-lg mx-auto mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {stage.description}
                  </p>
                </div>

                {/* Lesson Nodes on a Winding Path */}
                <div className="w-full max-w-md flex flex-col items-center gap-10 relative">
                  
                  {stage.lessons.map((lesson: RoadmapLessonNode, lessonIndex: number) => {
                    const isMastered = masteredIds.includes(lesson.id);
                    const isCurrent = !isMastered && (lessonIndex === 0 || masteredIds.includes(stage.lessons[lessonIndex - 1]?.id));

                    // Winding horizontal offset pattern (-40px, 0px, 40px, 0px)
                    const offsets = ['translate-x-0', 'translate-x-8 sm:translate-x-12', 'translate-x-0', '-translate-x-8 sm:-translate-x-12'];
                    const offsetClass = offsets[lessonIndex % offsets.length];

                    return (
                      <div 
                        key={lesson.id} 
                        className={`flex flex-col items-center group transition-transform ${offsetClass}`}
                      >
                        {/* Floating Prompt above active lesson */}
                        {isCurrent && (
                          <div className="mb-2 px-3 py-1 rounded-full bg-rose-500 text-white font-black text-[11px] uppercase tracking-wider shadow-lg animate-bounce flex items-center gap-1">
                            <Play className="w-3 h-3 fill-white" />
                            <span>START HERE</span>
                          </div>
                        )}

                        {/* Circular Milestone Node Button */}
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setModalTab('study');
                          }}
                          className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center relative transition-all duration-300 shadow-xl cursor-pointer ${
                            isMastered
                              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white hover:scale-110 shadow-emerald-500/25 ring-4 ring-emerald-400/40'
                              : isCurrent
                              ? 'bg-gradient-to-tr from-rose-500 via-rose-600 to-indigo-600 text-white hover:scale-115 shadow-rose-500/35 ring-4 ring-rose-400 animate-pulse'
                              : isLight
                              ? 'bg-slate-200 text-slate-500 border-2 border-slate-300 hover:bg-slate-300'
                              : 'bg-slate-800 text-slate-400 border-2 border-slate-700 hover:bg-slate-750'
                          }`}
                          title={lesson.title}
                        >
                          {isMastered ? (
                            <div className="flex flex-col items-center">
                              <CheckCircle2 className="w-7 h-7 text-white stroke-[2.5]" />
                              <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">Done</span>
                            </div>
                          ) : isCurrent ? (
                            <div className="flex flex-col items-center">
                              <Star className="w-7 h-7 text-amber-300 fill-amber-300 animate-spin-slow" />
                              <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">Play</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Lock className="w-6 h-6 opacity-70" />
                              <span className="text-[10px] font-bold mt-0.5">#{lesson.order}</span>
                            </div>
                          )}

                          {/* Star Badge for reward */}
                          <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black border flex items-center gap-0.5 ${
                            isMastered 
                              ? 'bg-emerald-600 text-white border-emerald-400' 
                              : 'bg-amber-500 text-white border-amber-300'
                          }`}>
                            <span>+{lesson.xpReward}</span>
                          </div>
                        </button>

                        {/* Node Text Label & Subtitle */}
                        <div className="mt-2.5 text-center max-w-[210px] space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-500 transition-colors">
                            {lesson.title}
                          </h4>
                          <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {lesson.sourcePhrase}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* Interactive Micro-Study & Quiz Modal                                      */}
      {/* ========================================================================= */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div 
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl flex flex-col transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md ${
              isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/95 border-slate-800'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                    Unit #{selectedLesson.order}
                  </span>
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    +{selectedLesson.xpReward} XP
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {selectedLesson.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedLesson(null)}
                className={`p-2 rounded-xl transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Switcher: Study vs Quiz */}
            <div className="p-3 px-5 border-b flex items-center gap-2 border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setModalTab('study')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  modalTab === 'study'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>1. Deep Study & Contrast</span>
              </button>

              <button
                onClick={() => setModalTab('quiz')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  modalTab === 'quiz'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>2. Mastery Quiz & Challenge</span>
                {masteredIds.includes(selectedLesson.id) && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-6">

              {modalTab === 'study' ? (
                <>
                  {/* Mother Tongue Original Phrase */}
                  <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-750'
                  }`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Mother Tongue Phrase ({currentTrack.sourceLang})
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-rose-500 tracking-wide font-sans">
                      {selectedLesson.sourcePhrase}
                    </div>
                    {selectedLesson.transliteration && (
                      <div className="text-xs text-slate-400 italic">
                        "{selectedLesson.transliteration}"
                      </div>
                    )}
                  </div>

                  {/* Contrast Box 1: The Literal Calque Trap */}
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>The Literal Translation Trap (What Learners Say)</span>
                    </div>
                    <div className="text-base font-bold text-rose-600 dark:text-rose-300 font-mono">
                      ❌ "{selectedLesson.literalTrap}"
                    </div>
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {selectedLesson.literalExplanation}
                    </p>
                  </div>

                  {/* Contrast Box 2: How Native Speakers Actually Say It */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>How Native Speakers Actually Say It</span>
                    </div>

                    <div className="space-y-2.5">
                      {selectedLesson.naturalAlternatives.map((alt, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                            isLight ? 'bg-white border-emerald-200' : 'bg-slate-800/80 border-emerald-500/30'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                                "{alt.phrase}"
                              </span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                {alt.style}
                              </span>
                            </div>
                            {alt.explanation && (
                              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                {alt.explanation}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleSpeak(alt.phrase)}
                            className="p-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 transition-colors shrink-0"
                            title="Listen to natural pronunciation"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cultural & Linguistic Tip */}
                  {(selectedLesson.culturalNote || selectedLesson.grammarTip) && (
                    <div className={`p-4 rounded-2xl border space-y-2 ${
                      isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-500/10 border-amber-500/30'
                    }`}>
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4" />
                        <span>Linguistic & Cultural Insight</span>
                      </div>
                      {selectedLesson.culturalNote && (
                        <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          {selectedLesson.culturalNote}
                        </p>
                      )}
                      {selectedLesson.grammarTip && (
                        <div className={`text-xs font-semibold ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                          💡 Rule of Thumb: {selectedLesson.grammarTip}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Spoken Repetition / Shadowing Practice */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-750'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-500">
                        <Mic className="w-4 h-4" />
                        <span>Voice Shadowing Practice</span>
                      </span>

                      <button
                        onClick={handleToggleListening}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isListening
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        <span>{isListening ? 'Stop Speaking' : 'Record My Voice'}</span>
                      </button>
                    </div>

                    {speechTranscript && (
                      <div className={`p-2.5 rounded-xl border text-xs italic ${
                        isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-200'
                      }`}>
                        You said: "{speechTranscript}"
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                        `"${selectedLesson.naturalAlternatives[0]?.phrase || selectedLesson.sourcePhrase}" native conversation pronunciation`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isLight ? 'text-slate-600 hover:text-indigo-600' : 'text-slate-400 hover:text-indigo-400'
                      }`}
                      title="Watch authentic native speakers use this phrase on YouTube"
                    >
                      <Youtube className="w-3.5 h-3.5 text-rose-500" />
                      <span>Watch Real Native Examples (YouTube)</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>

                    <button
                      onClick={() => setModalTab('quiz')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer ml-auto"
                    >
                      <span>Take Mastery Quiz</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                /* ================================================================= */
                /* Interactive Mastery Quiz Tab                                      */
                /* ================================================================= */
                <div className="space-y-6 animate-fade-in">
                  
                  <div className={`p-4 rounded-2xl border space-y-2 ${
                    isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-850 border-slate-750'
                  }`}>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Conversational Scenario Challenge</span>
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                      {selectedLesson.quiz.question}
                    </h4>
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="space-y-3">
                    {selectedLesson.quiz.options.map((opt) => {
                      const isSelected = selectedQuizOption === opt.id;
                      const showResult = quizSubmitted;
                      
                      let cardStyle = isLight 
                        ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-800' 
                        : 'bg-slate-850 border-slate-750 hover:border-slate-650 text-slate-100';

                      if (showResult) {
                        if (opt.isCorrect) {
                          cardStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200';
                        } else if (isSelected) {
                          cardStyle = 'bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-200';
                        }
                      }

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectQuizOption(opt.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${cardStyle} ${
                            !quizSubmitted ? 'hover:scale-[1.01] active:scale-[0.99]' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">
                              {opt.text}
                            </span>
                            {showResult && opt.isCorrect && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            )}
                            {showResult && isSelected && !opt.isCorrect && (
                              <X className="w-5 h-5 text-rose-500 shrink-0" />
                            )}
                          </div>

                          {showResult && (isSelected || opt.isCorrect) && (
                            <p className="text-xs pt-1 border-t border-current/20 opacity-90 leading-relaxed">
                              {opt.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Celebration & Completion Banner */}
                  {showCelebration && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-center space-y-1 animate-scale-up">
                      <div className="text-2xl">🎉 🏆 ⭐</div>
                      <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-300">
                        Lesson Mastered! +{selectedLesson.xpReward} XP Earned!
                      </h4>
                      <p className="text-xs text-slate-400">
                        Progress recorded in your roadmap. Keep up the momentum!
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 flex items-center justify-between flex-wrap gap-3">
                    <button
                      onClick={() => setModalTab('study')}
                      className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Review Study Notes</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleMastered(selectedLesson.id, selectedLesson.xpReward)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          masteredIds.includes(selectedLesson.id)
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>{masteredIds.includes(selectedLesson.id) ? 'Mastered ✓' : 'Mark as Mastered'}</span>
                      </button>

                      <button
                        onClick={() => setSelectedLesson(null)}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI Discover Branch Modal Dialog                                           */}
      {/* ========================================================================= */}
      {isAiBranchModalOpen && (
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
                  <h3 className="text-base font-black">AI Syllabus Branch Discovery</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Generate customized curriculum modules for {currentTrack.sourceLang} ➔ {currentTrack.targetLang}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiBranchModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input for branch topic */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                What communicative situation or skill do you want to master?
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={branchTopicInput}
                  onChange={(e) => setBranchTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateBranch()}
                  placeholder="e.g. Workplace Email Etiquette, Job Interview Prep, Travel & Hotel..."
                  className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-rose-500' : 'bg-slate-800 border-slate-700 text-slate-100 focus:border-rose-400'
                  }`}
                />
                <button
                  onClick={() => handleGenerateBranch()}
                  disabled={isGeneratingBranch || !branchTopicInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {isGeneratingBranch ? <Bot className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isGeneratingBranch ? 'Generating...' : 'Generate'}</span>
                </button>
              </div>
            </div>

            {/* Popular Topics to Explore */}
            <div className="space-y-1.5">
              <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Quick Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Workplace Email Etiquette',
                  'Job Interview Fluency',
                  'Airport & Immigration',
                  'Doctor Consultation & Symptoms',
                  'Hotel Check-in & Dining',
                  'Polite Negotiation & Disagreements',
                  'Casual Slang & Idioms',
                  'IT Sprint Standup Meeting'
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      setBranchTopicInput(topic);
                      handleGenerateBranch(topic);
                    }}
                    disabled={isGeneratingBranch}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all cursor-pointer ${
                      isLight 
                        ? 'bg-slate-100 hover:bg-rose-50 border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-700' 
                        : 'bg-slate-800 hover:bg-rose-950/40 border-slate-700 text-slate-300 hover:border-rose-500/50 hover:text-rose-300'
                    }`}
                  >
                    + {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
              isLight ? 'bg-indigo-50/60 border-indigo-100 text-indigo-800' : 'bg-indigo-950/30 border-indigo-900/50 text-indigo-300'
            }`}>
              <Bot className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Gemini will construct a full multi-unit syllabus branch with contrastive linguistics, pronunciation practice, and interactive quizzes.</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
