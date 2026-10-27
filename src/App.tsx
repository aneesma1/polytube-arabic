/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  extractYouTubeId, 
  createShareUrl 
} from './utils/youtube';
import { parseSrtFile } from './utils/subtitles';
import { CURATED_VIDEOS } from './data/curatedVideos';
import { getAllCuratedVideos, saveDynamicVideo } from './utils/dynamicVideoLibrary';
import { fetchUniversalSubtitles } from './utils/youtubeCaptionFetcher';
import { MULTILINGUAL_TRANSLATIONS } from './data/multilingualTranslations';
import { 
  SubtitleItem, 
  CuratedVideo,
  LoopConfig, 
  SavedWord, 
  SavedSentence,
  WorkspaceSettings, 
  BackupPayload 
} from './types';
import { Navbar } from './components/Navbar';
import { YouTubePlayer, PlayerController } from './components/YouTubePlayer';
import { SubtitleWindow } from './components/SubtitleWindow';
import { ArabicLinguisticPanel } from './components/ArabicLinguisticPanel';
import { Splitter } from './components/Splitter';
import { ExportModal } from './components/ExportModal';
import { WordLookupModal } from './components/WordLookupModal';
import { SettingsModal } from './components/SettingsModal';
import { SubtitleEditorModal } from './components/SubtitleEditorModal';
import { CuratedLibraryModal } from './components/CuratedLibraryModal';
import { FloatingPlayController } from './components/FloatingPlayController';
import { PwaUpdateToast } from './components/PwaUpdateToast';
import { initPwaAutoUpdate } from './utils/pwaUpdate';
import { CheckCircle2, Bookmark, Repeat } from 'lucide-react';

const LOCAL_STORAGE_VOCAB_KEY = 'polytube_arabic_vocabulary_v1';
const LOCAL_STORAGE_PHRASEBOOK_KEY = 'polytube_arabic_sentences_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'polytube_arabic_settings_v1';

const DEFAULT_SETTINGS: WorkspaceSettings = {
  splitRatio: 58,
  sidebarFontSize: 'lg',
  showSidebarArabic: true,
  showSidebarTransliteration: true,
  showSidebarTranslation: true,
  dualSubtitles: true,
  autoPause: false,
  playbackRate: 1.0,
  showPinyin: false,
  showTashkeel: true,
};

export default function App() {
  // Always Arabic Target
  const targetLangName = 'Arabic';
  const targetLangCode = 'ar';

  // Native Translation Language: Malayalam (ml) or English (en)
  const [nativeLangCode, setNativeLangCode] = useState<'ml' | 'en'>(() => {
    try {
      const saved = localStorage.getItem('polytube_native_lang');
      if (saved === 'en' || saved === 'ml') return saved;
    } catch {}
    return 'ml';
  });

  const toggleTranslationLang = () => {
    const next = nativeLangCode === 'ml' ? 'en' : 'ml';
    setNativeLangCode(next);
    try {
      localStorage.setItem('polytube_native_lang', next);
    } catch {}
  };

  // Video State (Default: Ahmad AlShugairi Seen 3 Hajj Episode)
  const [currentVideoId, setCurrentVideoId] = useState<string>('9thMVV4yM3Y');
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>(
    'برنامج سين ٣ | الحج - الحلقه ١ كاملة (أحمد الشقيري)'
  );

  // User Theme Preference
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('lingotube_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    try {
      localStorage.setItem('lingotube_theme', theme);
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Subtitles: Base Curated Arabic Subtitles
  const baseCuratedSubtitles = useMemo(() => {
    const all = getAllCuratedVideos();
    const matched = all.find(cv => cv.youtubeId === currentVideoId) || CURATED_VIDEOS.find(cv => cv.youtubeId === currentVideoId);
    return matched ? matched.subtitles : [];
  }, [currentVideoId]);

  const [customSubtitles, setCustomSubtitles] = useState<SubtitleItem[] | null>(null);

  // Dynamic Subtitles adapted to Malayalam / English translations
  const subtitles: SubtitleItem[] = useMemo(() => {
    if (customSubtitles !== null) {
      return customSubtitles;
    }

    return baseCuratedSubtitles.map(item => {
      let translation = item.translation;
      const multi = MULTILINGUAL_TRANSLATIONS[item.id as number] as unknown as Record<string, string> | undefined;
      if (multi && multi[nativeLangCode]) {
        translation = multi[nativeLangCode];
      }
      return {
        ...item,
        translation,
      };
    });
  }, [baseCuratedSubtitles, customSubtitles, nativeLangCode]);

  // Playback & Timing
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [initialSeekTime, setInitialSeekTime] = useState<number>(0);
  const playerControllerRef = useRef<PlayerController | null>(null);

  // Repeat & Looping Configuration
  const [loopConfig, setLoopConfig] = useState<LoopConfig>({
    active: false,
    type: 'single',
    startIndex: 0,
    endIndex: 0,
    startTime: 0,
    endTime: 0,
    mode: 'infinite',
    targetCount: 3,
    currentCount: 0,
  });

  const [autoPause, setAutoPause] = useState<boolean>(false);

  // Settings (Persistent)
  const [settings, setSettings] = useState<WorkspaceSettings>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Vocabulary & Saved Sentences (Persistent)
  const [savedWords, setSavedWords] = useState<SavedWord[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_VOCAB_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_VOCAB_KEY, JSON.stringify(savedWords));
    } catch {}
  }, [savedWords]);

  const [savedSentences, setSavedSentences] = useState<SavedSentence[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PHRASEBOOK_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PHRASEBOOK_KEY, JSON.stringify(savedSentences));
    } catch {}
  }, [savedSentences]);

  // Modals & Notifications
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showSubtitleEditor, setShowSubtitleEditor] = useState<boolean>(false);
  const [showLibraryModal, setShowLibraryModal] = useState<boolean>(false);
  const [activeWordLookup, setActiveWordLookup] = useState<{
    word: string;
    context: SubtitleItem;
  } | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // PWA Auto-Update Notification State
  const [updateToast, setUpdateToast] = useState<{
    isOpen: boolean;
    onApply: () => void;
    onDefer: () => void;
  }>({
    isOpen: false,
    onApply: () => {},
    onDefer: () => {},
  });

  useEffect(() => {
    initPwaAutoUpdate({
      onUpdateAvailable: (applyFn, deferFn) => {
        setUpdateToast({
          isOpen: true,
          onApply: applyFn,
          onDefer: () => {
            deferFn();
            setUpdateToast(prev => ({ ...prev, isOpen: false }));
          },
        });
      },
    });
  }, []);

  // Desktop check
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute active subtitle
  const { currentIndex, currentSubtitle, previousSubtitle, nextSubtitle } = useMemo(() => {
    if (!subtitles || subtitles.length === 0) {
      return { currentIndex: -1, currentSubtitle: null, previousSubtitle: null, nextSubtitle: null };
    }

    let activeIdx = subtitles.findIndex(s => currentTime >= s.start && currentTime <= s.end);

    if (activeIdx === -1) {
      if (currentTime < subtitles[0].start) {
        activeIdx = 0;
      } else {
        for (let i = subtitles.length - 1; i >= 0; i--) {
          if (currentTime >= subtitles[i].start) {
            activeIdx = i;
            break;
          }
        }
      }
    }

    if (activeIdx === -1) activeIdx = 0;

    return {
      currentIndex: activeIdx,
      currentSubtitle: subtitles[activeIdx],
      previousSubtitle: activeIdx > 0 ? subtitles[activeIdx - 1] : null,
      nextSubtitle: activeIdx < subtitles.length - 1 ? subtitles[activeIdx + 1] : null,
    };
  }, [subtitles, currentTime]);

  // Keyboard Shortcuts (Space: play/pause, R: repeat, [: prev, ]: next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (currentSubtitle) handleSeekToSubtitle(currentSubtitle);
      } else if (e.key === '[') {
        e.preventDefault();
        handlePrevSubtitle();
      } else if (e.key === ']') {
        e.preventDefault();
        handleNextSubtitle();
      } else if (e.code === 'Space') {
        e.preventDefault();
        playerControllerRef.current?.togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSubtitle, currentIndex, subtitles]);

  // Universal Video & Subtitle Loader
  const handleLoadVideo = (urlOrId: string) => {
    const extractedId = extractYouTubeId(urlOrId);
    if (!extractedId) return;

    setCurrentVideoId(extractedId);
    setInitialSeekTime(0);
    playerControllerRef.current?.seekTo(0);

    // 1. Check if video already exists in curated catalog or user's saved library
    const allVideos = getAllCuratedVideos();
    const existing = allVideos.find(v => v.youtubeId === extractedId) || CURATED_VIDEOS.find(v => v.youtubeId === extractedId);

    if (existing && existing.subtitles && existing.subtitles.length > 0) {
      setCurrentVideoTitle(existing.title);
      setCustomSubtitles(null);
      setShareToast(`✓ Loaded ${existing.subtitles.length} synchronized subtitles`);
      setTimeout(() => setShareToast(null), 3000);
      return;
    }

    // 2. New video without cached subtitles on GitHub Pages:
    setCurrentVideoTitle(`Arabic Video (${extractedId})`);
    setCustomSubtitles([]);
    setShowSubtitleEditor(true);
    setShareToast(`Drop an SRT/VTT file or paste transcript to sync subtitles.`);
    setTimeout(() => setShareToast(null), 4000);
  };

  // Upload SRT
  const handleUploadSrtFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      if (!content) return;
      const parsed = parseSrtFile(content);
      if (parsed.length === 0) {
        setShareToast('Could not parse subtitles from file.');
        setTimeout(() => setShareToast(null), 3000);
        return;
      }
      setCustomSubtitles(parsed);
      const dynamicVideo: CuratedVideo = {
        id: `yt-${currentVideoId}`,
        youtubeId: currentVideoId,
        title: currentVideoTitle,
        channel: 'Uploaded Subtitles',
        targetLang: 'Arabic',
        targetLangCode: 'ar',
        nativeLang: nativeLangCode === 'ml' ? 'Malayalam' : 'English',
        nativeLangCode: nativeLangCode,
        level: 'Intermediate',
        category: 'Uploaded Subtitles',
        thumbnail: `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`,
        description: `Uploaded from ${file.name}`,
        subtitles: parsed
      };
      saveDynamicVideo(dynamicVideo);
      setShareToast(`✓ Loaded and saved ${parsed.length} Arabic lines from ${file.name}`);
      setTimeout(() => setShareToast(null), 3500);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Playback Navigation
  const handleSeekToSubtitle = (sub: SubtitleItem) => {
    if (playerControllerRef.current) {
      playerControllerRef.current.seekTo(sub.start);
      playerControllerRef.current.play();
    }
  };

  const handlePrevSubtitle = () => {
    if (currentIndex > 0) {
      handleSeekToSubtitle(subtitles[currentIndex - 1]);
    }
  };

  const handleNextSubtitle = () => {
    if (currentIndex < subtitles.length - 1) {
      handleSeekToSubtitle(subtitles[currentIndex + 1]);
    }
  };

  // Repeat & Looping
  const handleStartSingleLoop = (sub: SubtitleItem, count: number) => {
    const isInf = count === Infinity;
    setLoopConfig({
      active: true,
      type: 'single',
      startIndex: subtitles.findIndex(s => s.id === sub.id),
      endIndex: subtitles.findIndex(s => s.id === sub.id),
      startTime: sub.start,
      endTime: sub.end,
      mode: isInf ? 'infinite' : 'finite',
      targetCount: isInf ? 999999 : count,
      currentCount: 0,
    });
    playerControllerRef.current?.seekTo(sub.start);
    playerControllerRef.current?.play();
  };

  const handleStartMultiLoop = (startIndex: number, endIndex: number, count: number) => {
    const startSub = subtitles[startIndex];
    const endSub = subtitles[endIndex];
    if (!startSub || !endSub) return;

    const isInf = count === Infinity;
    setLoopConfig({
      active: true,
      type: 'range',
      startIndex,
      endIndex,
      startTime: startSub.start,
      endTime: endSub.end,
      mode: isInf ? 'infinite' : 'finite',
      targetCount: isInf ? 999999 : count,
      currentCount: 0,
    });
    playerControllerRef.current?.seekTo(startSub.start);
    playerControllerRef.current?.play();
  };

  const handleStopLoop = () => {
    setLoopConfig(prev => ({ ...prev, active: false }));
  };

  const handleIncrementLoopCount = () => {
    setLoopConfig(prev => ({ ...prev, currentCount: prev.currentCount + 1 }));
  };

  // Save/Remove Word
  const handleSaveWord = (item: SavedWord) => {
    setSavedWords(prev => {
      if (prev.some(w => w.word === item.word)) return prev;
      return [item, ...prev];
    });
    setShareToast(`⭐ Saved word "${item.word}" to Vocabulary Flashcards!`);
    setTimeout(() => setShareToast(null), 2500);
  };

  const handleRemoveWord = (id: string) => {
    setSavedWords(prev => prev.filter(w => w.id !== id));
  };

  // Pin/Remove Sentence
  const handlePinSentence = (sub: SubtitleItem) => {
    const existing = savedSentences.find(s => s.subtitleId === sub.id);
    if (existing) {
      setSavedSentences(prev => prev.filter(s => s.id !== existing.id));
      setShareToast(`Removed sentence #${sub.id} from session deck`);
    } else {
      const item: SavedSentence = {
        id: `sentence-${Date.now()}-${sub.id}`,
        videoId: currentVideoId,
        youtubeId: currentVideoId,
        videoTitle: currentVideoTitle,
        subtitleId: sub.id,
        start: sub.start,
        end: sub.end,
        text: sub.text,
        vocalizedText: sub.vocalizedText,
        transliteration: sub.transliteration,
        translation: sub.translation,
        targetLangCode: 'ar',
        nativeLangCode,
        notes: sub.notes,
        savedAt: Date.now(),
        masteryLevel: 'learning',
      };
      setSavedSentences(prev => [item, ...prev]);
      setShareToast(`⭐ Pinned sentence #${sub.id} to Arabic study deck!`);
    }
    setTimeout(() => setShareToast(null), 2500);
  };

  const handleRemoveSentence = (id: string) => {
    setSavedSentences(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className={`h-screen max-h-screen overflow-hidden flex flex-col font-sans transition-colors ${
      theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* 1. Header Navigation Bar */}
      <Navbar
        onLoadVideo={handleLoadVideo}
        onOpenExport={() => setShowExportModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenLibrary={() => setShowLibraryModal(true)}
        onUploadSrtFile={handleUploadSrtFile}
        pinnedSentencesCount={savedSentences.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        targetTranslationLang={nativeLangCode}
        onToggleTranslationLang={toggleTranslationLang}
      />

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* 2. Main Immersion Workstation */}
      <main className="flex-1 min-h-0 w-full max-w-[1700px] mx-auto p-2 sm:p-3 flex flex-col lg:flex-row gap-2 overflow-hidden">
        {/* Left Column: YouTube Player & Subtitle Window */}
        <div
          className="flex flex-col gap-2 h-full min-h-0 overflow-y-auto pr-1"
          style={{ width: isDesktop ? `${settings.splitRatio}%` : '100%' }}
        >
          {/* Subtitle & Loop Status Indicator */}
          <div className="flex items-center justify-between gap-2 shrink-0 py-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg border shrink-0 ${
                theme === 'light'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}>
                العربية ⇄ {nativeLangCode === 'ml' ? 'മലയാളം' : 'English'}
              </span>

              {loopConfig.active && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/40 animate-pulse flex items-center gap-1 shrink-0">
                  <Repeat className="w-2.5 h-2.5 animate-spin" />
                  <span>Loop ({loopConfig.currentCount + 1}/{loopConfig.targetCount === 999999 ? '∞' : loopConfig.targetCount})</span>
                </span>
              )}

              <h1 className={`text-xs sm:text-sm font-bold truncate ${
                theme === 'light' ? 'text-slate-900' : 'text-slate-100'
              }`} title={currentVideoTitle}>
                {currentVideoTitle}
              </h1>
            </div>
          </div>

          {/* Video Player */}
          <div className="shrink-0">
            <YouTubePlayer
              videoId={currentVideoId}
              initialTime={initialSeekTime}
              onTimeUpdate={setCurrentTime}
              onDurationChange={setDuration}
              loopConfig={loopConfig}
              onIncrementLoopCount={handleIncrementLoopCount}
              onStopLoop={handleStopLoop}
              autoPause={autoPause}
              activeSubtitle={currentSubtitle}
              onPlayStateChange={setIsPlaying}
              playerRefCallback={ctrl => {
                playerControllerRef.current = ctrl;
              }}
              theme={theme}
            />
          </div>

          {/* Subtitle Window */}
          <div className="shrink-0">
            <SubtitleWindow
              currentSubtitle={currentSubtitle}
              previousSubtitle={previousSubtitle}
              nextSubtitle={nextSubtitle}
              allSubtitles={subtitles}
              currentIndex={currentIndex}
              loopConfig={loopConfig}
              onStartSingleLoop={handleStartSingleLoop}
              onStartMultiLoop={handleStartMultiLoop}
              onStopLoop={handleStopLoop}
              onSeekToSubtitle={handleSeekToSubtitle}
              onNextSubtitle={handleNextSubtitle}
              onPrevSubtitle={handlePrevSubtitle}
              autoPause={autoPause}
              onToggleAutoPause={() => setAutoPause(!autoPause)}
              onWordClick={(word, context) => {
                setActiveWordLookup({ word, context });
              }}
              onOpenShadowing={() => {}}
              targetLangCode="ar"
              theme={theme}
              onPinSentence={handlePinSentence}
              isCurrentPinned={currentSubtitle ? savedSentences.some(s => s.subtitleId === currentSubtitle.id) : false}
              onOpenEditor={() => setShowSubtitleEditor(true)}
            />
          </div>
        </div>

        {/* Resizer Splitter (Desktop) */}
        {isDesktop && (
          <Splitter
            splitRatio={settings.splitRatio}
            onRatioChange={newRatio => setSettings(prev => ({ ...prev, splitRatio: newRatio }))}
            onReset={() => setSettings(prev => ({ ...prev, splitRatio: 58 }))}
          />
        )}

        {/* Right Column: Arabic Linguistic Workstation */}
        <div
          className="flex flex-col gap-2 h-full min-h-0 overflow-hidden"
          style={{ width: isDesktop ? `${100 - settings.splitRatio}%` : '100%' }}
        >
          <ArabicLinguisticPanel
            subtitles={subtitles}
            currentIndex={currentIndex}
            currentSubtitle={currentSubtitle}
            onSeekToSubtitle={handleSeekToSubtitle}
            onStartSingleLoop={handleStartSingleLoop}
            loopConfig={loopConfig}
            onStopLoop={handleStopLoop}
            savedWords={savedWords}
            onSaveWord={handleSaveWord}
            onRemoveWord={handleRemoveWord}
            savedSentences={savedSentences}
            onPinSentence={handlePinSentence}
            onRemoveSentence={handleRemoveSentence}
            videoTitle={currentVideoTitle}
            theme={theme}
            targetTranslationLang={nativeLangCode}
          />
        </div>
      </main>

      {/* Floating Controller */}
      <FloatingPlayController
        isPlaying={isPlaying}
        onTogglePlay={() => playerControllerRef.current?.togglePlay()}
        loopConfig={loopConfig}
        onStopLoop={handleStopLoop}
        currentSubtitle={currentSubtitle}
        onReplayCurrent={() => {
          if (currentSubtitle) handleSeekToSubtitle(currentSubtitle);
        }}
        onPrevSubtitle={handlePrevSubtitle}
        onNextSubtitle={handleNextSubtitle}
        currentTime={currentTime}
        theme={theme}
      />

      {/* Modals */}
      {showExportModal && (
        <ExportModal
          subtitles={subtitles}
          videoTitle={currentVideoTitle}
          targetLangName="Arabic"
          nativeLangName={nativeLangCode === 'ml' ? 'Malayalam' : 'English'}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={settings}
          onUpdateSettings={setSettings}
          currentVideo={{
            id: currentVideoId,
            title: currentVideoTitle,
            timestamp: currentTime,
            targetLangCode: 'ar',
            nativeLangCode,
          }}
          subtitles={subtitles}
          vocabulary={savedWords}
          collections={[]}
          onRestoreBackup={() => {}}
          onResetLayout={() => setSettings(prev => ({ ...prev, splitRatio: 58 }))}
          onClearCache={() => {
            localStorage.clear();
            setSavedWords([]);
            setSavedSentences([]);
            setShareToast('Cache cleared.');
            setTimeout(() => setShareToast(null), 2500);
          }}
        />
      )}

      {showSubtitleEditor && (
        <SubtitleEditorModal
          currentSubtitles={subtitles}
          videoId={currentVideoId}
          videoTitle={currentVideoTitle}
          targetLangCode="ar"
          onClose={() => setShowSubtitleEditor(false)}
          onSaveSubtitles={(newSubs) => {
            setCustomSubtitles(newSubs);
            const dynamicVideo: CuratedVideo = {
              id: `yt-${currentVideoId}`,
              youtubeId: currentVideoId,
              title: currentVideoTitle,
              channel: 'Imported Video',
              targetLang: 'Arabic',
              targetLangCode: 'ar',
              nativeLang: nativeLangCode === 'ml' ? 'Malayalam' : 'English',
              nativeLangCode: nativeLangCode,
              level: 'Intermediate',
              category: 'User Import',
              thumbnail: `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`,
              description: `Subtitles for ${currentVideoTitle}`,
              subtitles: newSubs
            };
            saveDynamicVideo(dynamicVideo);
            setShareToast(`✓ Saved ${newSubs.length} synchronized subtitles to your Library!`);
            setTimeout(() => setShareToast(null), 3000);
          }}
        />
      )}

      {showLibraryModal && (
        <CuratedLibraryModal
          onSelectVideo={(video) => {
            setCurrentVideoId(video.youtubeId);
            setCurrentVideoTitle(video.title);
            setCustomSubtitles(video.subtitles);
            setShowLibraryModal(false);
            setShareToast(`✓ Loaded "${video.title.slice(0, 35)}..." (${video.subtitles.length} lines)`);
            setTimeout(() => setShareToast(null), 3000);
          }}
          onImportCustomSubtitles={(importedSubs) => {
            setCustomSubtitles(importedSubs);
            setShowLibraryModal(false);
          }}
          onClose={() => setShowLibraryModal(false)}
        />
      )}

      {activeWordLookup && (
        <WordLookupModal
          word={activeWordLookup.word}
          contextSubtitle={activeWordLookup.context}
          videoId={currentVideoId}
          videoTitle={currentVideoTitle}
          onClose={() => setActiveWordLookup(null)}
          onSaveWord={handleSaveWord}
          isSaved={savedWords.some(w => w.word === activeWordLookup.word)}
          targetLangCode="ar"
          theme={theme}
        />
      )}

      {/* PWA Auto-Update Toast */}
      <PwaUpdateToast
        isOpen={updateToast.isOpen}
        onApply={updateToast.onApply}
        onDefer={updateToast.onDefer}
        theme={theme}
      />
    </div>
  );
}
