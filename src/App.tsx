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
import { composeInfo } from './utils/videoInfo';
import { StudyPauseConfig, loadStudyPause, saveStudyPause, SPEECH_EVENT } from './utils/studyPause';
import { LANG_LABELS } from './utils/languages';
import { getAllCuratedVideos, saveDynamicVideo, removeDynamicVideo, touchVideo } from './utils/dynamicVideoLibrary';
import { getStoredVideos, getStoredWords, getStoredSentences, saveWordsSnapshot, saveSentencesSnapshot } from './utils/videoStore';
import { saveProgress, getProgress, getLastVideoId, rememberVideo, videoIdFromAddress } from './utils/resume';
import { buildBackup, isBackup, restoreBackup, notesCsv, linesCsv, reportHtml } from './utils/backup';
import { downloadFile } from './utils/subtitles';
import { fetchUniversalSubtitles } from './utils/youtubeCaptionFetcher';
import { ExtensionCuesResult, getExtensionVersion, requestCuesFromExtension, versionAtLeast } from './utils/extensionBridge';
import { AI_NOT_CONFIGURED_MESSAGE, PreparedLine, isAiConfigured, loadPreparedFromCache, prepareLines } from './utils/aiProvider';
import { attachTranslation, buildSubtitleItems, mergeIntoSentences } from './utils/sentenceMerge';
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
import { CaptionStrip } from './components/CaptionStrip';
import { LineSelection } from './components/PracticeBar';
import { ArabicLinguisticPanel } from './components/ArabicLinguisticPanel';
import { Splitter } from './components/Splitter';
import { ExportModal } from './components/ExportModal';
import { WordLookupModal } from './components/WordLookupModal';
import { SettingsModal } from './components/SettingsModal';
import { ExtensionInstallModal } from './components/ExtensionInstallModal';
import { SubtitleEditorModal } from './components/SubtitleEditorModal';
import { CuratedLibraryModal } from './components/CuratedLibraryModal';
import { PwaUpdateToast } from './components/PwaUpdateToast';
import { initPwaAutoUpdate } from './utils/pwaUpdate';
import { CheckCircle2, Bookmark, Repeat } from 'lucide-react';

const LOCAL_STORAGE_VOCAB_KEY = 'polytube_arabic_vocabulary_v1';
const LOCAL_STORAGE_PHRASEBOOK_KEY = 'polytube_arabic_sentences_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'polytube_arabic_settings_v1';
const EXTENSION_CATEGORY = 'Extension Captions';
export interface CaptionInfo {
  at: number;
  version: string | null;
  requested: string[];
  ok: boolean;
  error?: string;
  kind?: string;
  via?: string;
  got: string[];
  attempts: { lang: string; via: string; how: string; lines: number }[];
}

export { LANG_LABELS };

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

  // Translation languages shown under the Arabic (chips in the transcript header)
  const [shownLangs, setShownLangs] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('polytube_shown_langs') || 'null');
      if (Array.isArray(saved) && saved.length > 0) return saved.map(String);
      const legacy = localStorage.getItem('polytube_native_lang');
      if (legacy === 'en' || legacy === 'ml') return [legacy];
    } catch {}
    return ['ml'];
  });
  useEffect(() => {
    try {
      localStorage.setItem('polytube_shown_langs', JSON.stringify(shownLangs));
    } catch {}
  }, [shownLangs]);

  // Primary language used for curated videos and word meanings
  const nativeLangCode: 'ml' | 'en' = shownLangs.includes('ml') ? 'ml' : 'en';

  const [showPhonetics, setShowPhonetics] = useState<boolean>(() => {
    try {
      return localStorage.getItem('polytube_show_phonetics') === 'on';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('polytube_show_phonetics', showPhonetics ? 'on' : 'off');
    } catch {}
  }, [showPhonetics]);

  const [showTashkeel, setShowTashkeel] = useState<boolean>(() => {
    try {
      return localStorage.getItem('polytube_show_tashkeel') !== 'off';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('polytube_show_tashkeel', showTashkeel ? 'on' : 'off');
    } catch {}
  }, [showTashkeel]);

  // Video size: a percentage of the left column, or "fit" to fill the screen without scrolling
  const [videoScale, setVideoScale] = useState<number>(() => {
    try {
      return Math.min(100, Math.max(35, Number(localStorage.getItem('polytube_video_scale')) || 100));
    } catch {
      return 100;
    }
  });
  const [videoFit, setVideoFit] = useState<boolean>(() => {
    try {
      return localStorage.getItem('polytube_video_fit') !== 'off';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('polytube_video_scale', String(videoScale));
      localStorage.setItem('polytube_video_fit', videoFit ? 'on' : 'off');
    } catch {}
  }, [videoScale, videoFit]);

  const leftColRef = useRef<HTMLDivElement | null>(null);
  const videoScaleRef = useRef(videoScale);
  videoScaleRef.current = videoScale;

  const [stripFont, setStripFont] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('polytube_strip_font');
      const n = Number(raw);
      return raw !== null && Number.isFinite(n) && n >= 0 && n <= 4 ? n : 2;
    } catch {
      return 2;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('polytube_strip_font', String(stripFont));
    } catch {}
  }, [stripFont]);

  const [showTranslation, setShowTranslation] = useState<boolean>(() => {
    try {
      return localStorage.getItem('polytube_show_translation') !== 'off';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('polytube_show_translation', showTranslation ? 'on' : 'off');
    } catch {}
  }, [showTranslation]);

  const toggleLang = (code: string) =>
    setShownLangs(prev => (prev.includes(code) ? (prev.length > 1 ? prev.filter(c => c !== code) : prev) : [...prev, code]));

  // Video State (Default: Ahmad AlShugairi Seen 3 Hajj Episode)
  const DEFAULT_VIDEO_ID = '9thMVV4yM3Y';
  // Which video to open at start: link in the address bar, else the last one watched, else the sample
  const [startup] = useState(() => {
    const fromAddress = videoIdFromAddress();
    const wanted = fromAddress?.id || getLastVideoId() || DEFAULT_VIDEO_ID;
    const known =
      wanted === DEFAULT_VIDEO_ID ||
      getAllCuratedVideos().some(v => v.youtubeId === wanted) ||
      CURATED_VIDEOS.some(v => v.youtubeId === wanted);
    return {
      id: known ? wanted : DEFAULT_VIDEO_ID,
      t: fromAddress?.t || getProgress(known ? wanted : DEFAULT_VIDEO_ID)?.t || 0,
      fetchId: !known ? wanted : null, // a shared link to a video not saved here yet
    };
  });
  const [currentVideoId, setCurrentVideoId] = useState<string>(startup.id);
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
    const matched = CURATED_VIDEOS.find(cv => cv.youtubeId === currentVideoId || cv.id === currentVideoId) || all.find(cv => cv.youtubeId === currentVideoId);
    return matched ? matched.subtitles : [];
  }, [currentVideoId]);

  const [customSubtitles, setCustomSubtitles] = useState<SubtitleItem[] | null>(null);

  // Raw caption cues from the extension; merged into sentences when sentenceMode is on
  const [extensionRaw, setExtensionRaw] = useState<SubtitleItem[] | null>(null);
  const [sentenceMode, setSentenceMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('polytube_sentence_mode') !== 'off';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('polytube_sentence_mode', sentenceMode ? 'on' : 'off');
    } catch {}
  }, [sentenceMode]);

  // Dynamic Subtitles adapted to Malayalam / English translations
  const baseSubtitles: SubtitleItem[] = useMemo(() => {
    if (extensionRaw !== null) {
      const base = sentenceMode ? mergeIntoSentences(extensionRaw) : extensionRaw;
      return base.map(item => {
        const parts = shownLangs.map(code => item.translations?.[code]).filter(Boolean) as string[];
        return { ...item, translation: parts.length > 0 ? parts.join('\n') : '—' };
      });
    }
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
  }, [baseCuratedSubtitles, customSubtitles, extensionRaw, sentenceMode, nativeLangCode, shownLangs]);

  // Optional AI preparation: vowel marks and phonetics per line, cached per video
  const [prepared, setPrepared] = useState<Record<number, PreparedLine>>({});
  const [prepareProgress, setPrepareProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    setPrepared(loadPreparedFromCache(currentVideoId, baseSubtitles.map(s => ({ id: s.id, text: s.text }))));
  }, [currentVideoId, baseSubtitles]);

  // Strip stray control characters some sources leave at line ends (they render as empty boxes)
  const stripControl = (t?: string) => (t ? t.replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '') : t);

  const subtitles: SubtitleItem[] = useMemo(() => {
    return baseSubtitles.map(item => {
      const p = prepared[item.id];
      return {
        ...item,
        text: stripControl(item.text) as string,
        vocalizedText: stripControl(p ? p.vocalized : item.vocalizedText),
        transliteration: p ? p.phonetic : item.transliteration,
      };
    });
  }, [baseSubtitles, prepared]);

  const handlePrepareVideo = async () => {
    if (!isAiConfigured()) {
      setShareToast(AI_NOT_CONFIGURED_MESSAGE);
      setTimeout(() => setShareToast(null), 5000);
      return;
    }
    const lines = baseSubtitles.map(s => ({ id: s.id, text: s.text }));
    setPrepareProgress({ done: 0, total: lines.length });
    const res = await prepareLines(currentVideoId, lines, (done, total) => setPrepareProgress({ done, total }));
    setPrepareProgress(null);
    if (res.data) setPrepared(prev => ({ ...prev, ...res.data }));
    setShareToast(res.ok ? '✓ Vowel marks and phonetics added' : res.error || 'Preparation stopped early. Progress is saved; run it again to continue.');
    setTimeout(() => setShareToast(null), 5000);
  };

  // Playback & Timing
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [initialSeekTime, setInitialSeekTime] = useState<number>(startup.t);
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
  const [selection, setSelection] = useState<LineSelection | null>(null);
  const [exportScopeHint, setExportScopeHint] = useState<'all' | 'loop'>('all');
  const [loopGapSec, setLoopGapSec] = useState<number>(() => {
    try { return Number(localStorage.getItem('polytube_loop_gap')) || 0; } catch { return 0; }
  });
  const [slowRepeatRate, setSlowRepeatRate] = useState<number | null>(() => {
    try { return Number(localStorage.getItem('polytube_slow_repeat')) || null; } catch { return null; }
  });
  useEffect(() => {
    try {
      localStorage.setItem('polytube_loop_gap', String(loopGapSec));
      localStorage.setItem('polytube_slow_repeat', slowRepeatRate ? String(slowRepeatRate) : '');
    } catch {}
  }, [loopGapSec, slowRepeatRate]);

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
  const [savedWords, setSavedWords] = useState<SavedWord[]>(() => getStoredWords());
  useEffect(() => {
    saveWordsSnapshot(savedWords);
  }, [savedWords]);

  const [savedSentences, setSavedSentences] = useState<SavedSentence[]>(() => getStoredSentences());
  useEffect(() => {
    saveSentencesSnapshot(savedSentences);
  }, [savedSentences]);

  // Modals & Notifications
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showExtensionHelp, setShowExtensionHelp] = useState<boolean>(false);
  const [showSubtitleEditor, setShowSubtitleEditor] = useState<boolean>(false);
  const [showLibraryModal, setShowLibraryModal] = useState<boolean>(false);
  const [activeWordLookup, setActiveWordLookup] = useState<{
    word: string;
    context: SubtitleItem;
  } | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Pause the video while studying (word pop-up, pronunciation audio, optional dialogs and hidden tab)
  const [studyPause, setStudyPause] = useState<StudyPauseConfig>(loadStudyPause);
  useEffect(() => saveStudyPause(studyPause), [studyPause]);
  const studyCfgRef = useRef(studyPause);
  studyCfgRef.current = studyPause;
  const holdsRef = useRef<Set<string>>(new Set());
  const resumeAfterRef = useRef(false);
  const rewindRef = useRef(false);

  const holdVideo = (reason: string) => {
    const ctrl = playerControllerRef.current;
    if (holdsRef.current.size === 0) {
      resumeAfterRef.current = !!ctrl?.isPlaying?.();
      rewindRef.current = false;
      if (resumeAfterRef.current) ctrl?.pause();
    }
    holdsRef.current.add(reason);
    if (reason !== 'speech') rewindRef.current = true;
  };

  const releaseVideo = (reason: string) => {
    if (!holdsRef.current.delete(reason) || holdsRef.current.size > 0) return;
    const ctrl = playerControllerRef.current;
    const cfg = studyCfgRef.current;
    // Short pronunciation audio always resumes; "stay paused" only applies to pop-ups and dialogs
    const speechOnly = !rewindRef.current;
    const shouldPlay = resumeAfterRef.current && (cfg.resume !== 'stay' || speechOnly);
    resumeAfterRef.current = false;
    if (!shouldPlay || !ctrl) return;
    if (cfg.resume === 'earlier' && !speechOnly) ctrl.seekTo(Math.max(0, ctrl.getCurrentTime() - cfg.rewindSec));
    ctrl.play();
  };

  const wordPopupOpen = !!activeWordLookup;
  useEffect(() => {
    if (!(studyPause.on && studyPause.word && wordPopupOpen)) return;
    holdVideo('word');
    return () => releaseVideo('word');
  }, [studyPause.on, studyPause.word, wordPopupOpen]);

  const dialogOpen = showExportModal || showSettingsModal || showExtensionHelp || showSubtitleEditor || showLibraryModal;
  useEffect(() => {
    if (!(studyPause.on && studyPause.dialogs && dialogOpen)) return;
    holdVideo('dialog');
    return () => releaseVideo('dialog');
  }, [studyPause.on, studyPause.dialogs, dialogOpen]);

  useEffect(() => {
    if (!(studyPause.on && studyPause.speech)) return;
    let timer: number | undefined;
    const onSpeech = (e: Event) => {
      const speaking = !!(e as CustomEvent).detail?.speaking;
      window.clearTimeout(timer);
      if (speaking) holdVideo('speech');
      // a new utterance cancels the old one: wait a moment so the video does not blip back on
      else timer = window.setTimeout(() => releaseVideo('speech'), 300);
    };
    window.addEventListener(SPEECH_EVENT, onSpeech);
    return () => {
      window.removeEventListener(SPEECH_EVENT, onSpeech);
      window.clearTimeout(timer);
      releaseVideo('speech');
    };
  }, [studyPause.on, studyPause.speech]);

  useEffect(() => {
    if (!(studyPause.on && studyPause.tab)) return;
    const onVisibility = () => (document.hidden ? holdVideo('tab') : releaseVideo('tab'));
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      releaseVideo('tab');
    };
  }, [studyPause.on, studyPause.tab]);

  // Turning the switch off or pressing Play inside the pop-up leaves the video as it is for this visit
  const keepVideoAsIs = () => {
    resumeAfterRef.current = false;
  };

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

  useEffect(() => {
    setSelection(null);
  }, [currentVideoId, subtitles.length, sentenceMode]);

  const handleAddLang = async (code: string) => {
    if (!extensionRaw) return;
    setShareToast('Fetching translation…');
    const version = await getExtensionVersion();
    if (!version) {
      setShareToast('The extension is not responding. Enable it, then refresh this page.');
      setTimeout(() => setShareToast(null), 5000);
      return;
    }
    if (!versionAtLeast(version, '0.2.0')) {
      setShareToast('Your extension is out of date. Open chrome://extensions, click the refresh icon on PolyTube Caption Bridge, then reload this page.');
      setTimeout(() => setShareToast(null), 8000);
      return;
    }
    const res = await requestCuesFromExtension(currentVideoId, targetLangCode, [code]);
    recordCaptionInfo(res, [code]);
    const got = res?.ok ? res.translations?.[code]?.cues : undefined;
    if (!got || got.length === 0) {
      setShareToast(res?.error || `YouTube does not offer ${LANG_LABELS[code] ?? code} for this video.`);
      setTimeout(() => setShareToast(null), 3500);
      return;
    }
    const updated = attachTranslation(extensionRaw, code, got);
    setExtensionRaw(updated);
    setShownLangs(prev => (prev.includes(code) ? prev : [...prev, code]));
    const existing = getAllCuratedVideos().find(v => v.youtubeId === currentVideoId);
    if (existing) saveDynamicVideo({ ...existing, subtitles: updated });
    setShareToast('✓ Translation added');
    setTimeout(() => setShareToast(null), 2500);
  };

  // Videos cached by an older extension have no translations: fetch the shown languages once, quietly
  const healedVideoRef = useRef<string>('');
  useEffect(() => {
    if (!extensionRaw || healedVideoRef.current === currentVideoId) return;
    const missing = shownLangs.filter(c => !extensionRaw.some(i => i.translations?.[c]));
    if (missing.length === 0) return;
    healedVideoRef.current = currentVideoId;
    (async () => {
      const version = await getExtensionVersion();
      if (!version || !versionAtLeast(version, '0.2.0')) {
        recordCaptionInfo(null, missing);
        return;
      }
      const res = await requestCuesFromExtension(currentVideoId, targetLangCode, missing);
      recordCaptionInfo(res, missing);
      if (!res?.ok || !res.translations) return;
      let updated = extensionRaw;
      for (const [code, t] of Object.entries(res.translations)) updated = attachTranslation(updated, code, t.cues);
      setExtensionRaw(updated);
      const existing = getAllCuratedVideos().find(v => v.youtubeId === currentVideoId);
      if (existing) saveDynamicVideo({ ...existing, subtitles: updated });
    })();
  }, [extensionRaw, currentVideoId]);

  // Fit mode: shrink the video until the whole left column fits the window height
  const fitVideo = () => {
    const col = leftColRef.current;
    const frame = col?.querySelector('iframe') as HTMLElement | null;
    if (!col || !frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.width < 50) return;
    // Real content height: the children added up. (scrollHeight cannot be used: it never goes below the container height.)
    const kids = Array.from(col.children) as HTMLElement[];
    const content = kids.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0) + 8 * Math.max(0, kids.length - 1);
    const overhead = content - rect.height; // everything in the column except the video
    const targetHeight = col.clientHeight - overhead - 6;
    const baseWidth = rect.width / (videoScaleRef.current / 100);
    const next = Math.max(35, Math.min(100, Math.floor(((targetHeight * 16) / 9 / baseWidth) * 100)));
    if (Math.abs(next - videoScaleRef.current) >= 2) setVideoScale(next);
  };

  useEffect(() => {
    if (!videoFit || !isDesktop) return;
    const timers = [60, 350, 1000].map(ms => window.setTimeout(fitVideo, ms));
    window.addEventListener('resize', fitVideo);
    return () => {
      timers.forEach(t => window.clearTimeout(t));
      window.removeEventListener('resize', fitVideo);
    };
  }, [videoFit, isDesktop, settings.splitRatio, currentVideoId, subtitles.length, showPhonetics, showTranslation, videoScale, stripFont]);

  // ---- History data, resume, address ----
  const [libraryTick, setLibraryTick] = useState(0);
  const historyVideos = useMemo(() => getStoredVideos().slice(), [libraryTick, currentVideoId, extensionRaw]);

  // Reference details for exports: title, channel, upload date, length, description, link
  const videoInfo = useMemo(
    () => composeInfo(currentVideoId, currentVideoTitle, getAllCuratedVideos().find(v => v.youtubeId === currentVideoId)),
    [currentVideoId, currentVideoTitle, libraryTick, extensionRaw]
  );

  // Videos saved before extension 0.3.0 have no date, length or description: read them once, quietly
  const infoTriedRef = useRef<string>('');
  useEffect(() => {
    if (!extensionRaw || infoTriedRef.current === currentVideoId) return;
    const existing = getAllCuratedVideos().find(v => v.youtubeId === currentVideoId);
    if (!existing || existing.info) return;
    infoTriedRef.current = currentVideoId;
    (async () => {
      const version = await getExtensionVersion();
      if (!version || !versionAtLeast(version, '0.3.0')) return;
      const res = await requestCuesFromExtension(currentVideoId, targetLangCode, []);
      if (!res?.ok || !res.info) return;
      saveDynamicVideo({
        ...existing,
        channel: res.channel || existing.channel,
        info: {
          uploadDate: res.info.uploadDate || undefined,
          durationSec: res.info.durationSec || undefined,
          description: res.info.description || undefined,
          channelUrl: res.info.channelUrl || undefined,
        },
      });
      setLibraryTick(t => t + 1);
    })();
  }, [extensionRaw, currentVideoId]);

  const timeRef = useRef(0);
  timeRef.current = currentTime;
  const durationRef = useRef(0);
  durationRef.current = duration;

  useEffect(() => {
    const save = () => {
      if (timeRef.current > 1) saveProgress(currentVideoId, timeRef.current, durationRef.current);
    };
    const timer = window.setInterval(save, 5000);
    const onHide = () => {
      if (document.visibilityState === 'hidden') save();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', save);
    return () => {
      save();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', save);
    };
  }, [currentVideoId]);

  useEffect(() => {
    try {
      window.history.replaceState(null, '', `#v=${currentVideoId}`);
    } catch {}
    rememberVideo(currentVideoId);
  }, [currentVideoId]);

  // On first load, reopen the remembered video with its saved captions
  useEffect(() => {
    if (startup.fetchId) {
      handleLoadVideo(startup.fetchId, false, startup.t);
      return;
    }
    const saved = getAllCuratedVideos().find(v => v.youtubeId === startup.id);
    if (saved && startup.id !== DEFAULT_VIDEO_ID) {
      setCurrentVideoTitle(saved.title);
      if (saved.category === EXTENSION_CATEGORY) setExtensionRaw(saved.subtitles);
      touchVideo(startup.id);
    }
  }, []);

  const handleExportData = (kind: 'backup' | 'notes-csv' | 'lines-csv' | 'report') => {
    const stamp = new Date().toISOString().slice(0, 10);
    const videos = getStoredVideos();
    if (kind === 'backup') {
      downloadFile(JSON.stringify(buildBackup(savedWords, savedSentences, settings), null, 2), `polytube-backup-${stamp}.json`, 'application/json;charset=utf-8');
    } else if (kind === 'notes-csv') {
      downloadFile(notesCsv(savedWords, savedSentences), `polytube-notes-${stamp}.csv`, 'text/csv;charset=utf-8');
    } else if (kind === 'lines-csv') {
      downloadFile(linesCsv(videos), `polytube-lines-${stamp}.csv`, 'text/csv;charset=utf-8');
    } else {
      downloadFile(reportHtml(videos, savedWords, savedSentences), `polytube-report-${stamp}.html`, 'text/html;charset=utf-8');
    }
  };

  const handleRestoreBackup = (payload: unknown): string => {
    if (!isBackup(payload)) throw new Error('This is not a PolyTube backup file (.json made by "Back up everything").');
    const r = restoreBackup(payload, { words: savedWords, sentences: savedSentences });
    setSavedWords(r.words);
    setSavedSentences(r.sentences);
    if (r.settings) setSettings(r.settings);
    setLibraryTick(t => t + 1);
    return `Restored ${r.summary.videos} videos, ${r.summary.words} new words and ${r.summary.sentences} new sentences. Reload the page to apply display preferences.`;
  };

  const handleSaveSelection = (start: number, end: number) => {
    const fresh = subtitles
      .slice(start, end + 1)
      .filter(sub => !savedSentences.some(s => s.subtitleId === sub.id && s.youtubeId === currentVideoId));
    if (fresh.length === 0) {
      setShareToast('Those lines are already in your study deck');
    } else {
      const items: SavedSentence[] = fresh.map(sub => ({
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
      }));
      setSavedSentences(prev => [...items, ...prev]);
      setShareToast(`⭐ Saved ${items.length} line${items.length > 1 ? 's' : ''} to your study deck`);
    }
    setTimeout(() => setShareToast(null), 2500);
  };

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

  const [captionInfo, setCaptionInfo] = useState<CaptionInfo | null>(null);

  const recordCaptionInfo = async (result: ExtensionCuesResult | null, requested: string[]) => {
    const version = await getExtensionVersion();
    setCaptionInfo({
      at: Date.now(),
      version,
      requested,
      ok: !!result?.ok,
      error: result ? result.error : 'No answer from the extension (not installed, disabled, or this page was not refreshed after installing it).',
      kind: result?.kind,
      via: result?.debug?.via,
      got: Object.keys(result?.translations ?? {}),
      attempts: result?.debug?.attempts ?? [],
    });
  };

  // Universal Video & Subtitle Loader
  const handleLoadVideo = async (urlOrId: string, fresh = false, startAt = 0) => {
    const extractedId = extractYouTubeId(urlOrId);
    if (!extractedId) return;

    setCurrentVideoId(extractedId);
    setInitialSeekTime(startAt);
    setExtensionRaw(null);
    playerControllerRef.current?.seekTo(startAt);

    // 1. Check if video already exists in curated catalog or user's saved library
    const allVideos = getAllCuratedVideos();
    const existing = allVideos.find(v => v.youtubeId === extractedId) || CURATED_VIDEOS.find(v => v.youtubeId === extractedId);

    if (!fresh && existing && existing.subtitles && existing.subtitles.length > 0) {
      setCurrentVideoTitle(existing.title);
      if (existing.category === EXTENSION_CATEGORY) {
        setExtensionRaw(existing.subtitles);
        setCustomSubtitles(null);
      } else {
        setCustomSubtitles(null);
      }
      touchVideo(extractedId);
      setLibraryTick(t => t + 1);
      setShareToast(`✓ Loaded ${existing.subtitles.length} synchronized subtitles`);
      setTimeout(() => setShareToast(null), 3000);
      return;
    }

    // 2. New video: ask the PolyTube Caption Bridge extension for the live captions
    setCurrentVideoTitle(`Arabic Video (${extractedId})`);
    setShareToast('Fetching captions from YouTube…');
    const wantLangs = Array.from(new Set([...shownLangs, 'ml', 'en']));
    const result = await requestCuesFromExtension(extractedId, targetLangCode, wantLangs);
    recordCaptionInfo(result, wantLangs);

    if (result && result.ok && result.cues && result.cues.length > 0) {
      const byLang: Record<string, { start: number; end: number; text: string }[]> = {};
      for (const [code, t] of Object.entries(result.translations ?? {})) byLang[code] = t.cues;
      const items = buildSubtitleItems(result.cues, byLang);
      const title = result.title || `Arabic Video (${extractedId})`;
      setCurrentVideoTitle(title);
      setCustomSubtitles(null);
      setExtensionRaw(items);
      saveDynamicVideo({
        id: `yt-${extractedId}`,
        youtubeId: extractedId,
        title,
        channel: result.channel || 'YouTube Captions',
        targetLang: 'Arabic',
        targetLangCode: 'ar',
        nativeLang: nativeLangCode === 'ml' ? 'Malayalam' : 'English',
        nativeLangCode,
        level: 'Intermediate',
        category: EXTENSION_CATEGORY,
        thumbnail: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
        description: `Captions via extension (${result.kind === 'asr' ? 'auto-generated' : 'manual'})`,
        subtitles: items,
        lastOpened: Date.now(),
        info: {
          uploadDate: result.info?.uploadDate || undefined,
          durationSec: result.info?.durationSec || undefined,
          description: result.info?.description || undefined,
          channelUrl: result.info?.channelUrl || undefined,
        },
      });
      setLibraryTick(t => t + 1);
      const note = result.kind === 'asr' ? ' (auto-generated captions)' : '';
      setShareToast(`✓ Loaded ${items.length} caption lines${note}`);
      setTimeout(() => setShareToast(null), 3500);
      return;
    }

    // 3. Extension missing or failed: server/proxy fetch, then manual subtitle editor
    const fallback = await fetchUniversalSubtitles(extractedId, targetLangCode, nativeLangCode);
    if (fallback.success && fallback.subtitles.length > 0) {
      setExtensionRaw(null);
      setCustomSubtitles(fallback.subtitles);
      setShareToast(`✓ Loaded ${fallback.subtitles.length} caption lines`);
      setTimeout(() => setShareToast(null), 3500);
      return;
    }

    setCustomSubtitles([]);
    // No answer at all means the extension is not installed (or not enabled): show the install guide
    if (!result) setShowExtensionHelp(true);
    else setShowSubtitleEditor(true);
    const why = result
      ? result.error || 'Captions unavailable.'
      : 'Install the PolyTube Caption Bridge extension to fetch captions automatically.';
    setShareToast(`${why} You can also drop an SRT/VTT file or paste a transcript.`);
    setTimeout(() => setShareToast(null), 6000);
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
      setExtensionRaw(null);
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
    const same = (a: SavedWord, b: SavedWord) =>
      a.word === b.word && a.videoId === b.videoId && Math.round(a.timestamp) === Math.round(b.timestamp);
    setSavedWords(prev => {
      const idx = prev.findIndex(w => same(w, item));
      if (item.card) {
        // A full card replaces an earlier save of the same word from the same line
        if (idx >= 0) {
          const copy = prev.slice();
          copy[idx] = { ...item, id: prev[idx].id, savedAt: prev[idx].savedAt };
          return copy;
        }
        return [item, ...prev];
      }
      // Word only: never replace a full card with a lighter one
      if (prev.some(w => w.word === item.word)) return prev;
      return [item, ...prev];
    });
    setShareToast(item.card ? `Saved card for "${item.word}"` : `Saved word "${item.word}"`);
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
        onOpenExtension={() => setShowExtensionHelp(true)}
        onOpenLibrary={() => setShowLibraryModal(true)}
        onUploadSrtFile={handleUploadSrtFile}
        pinnedSentencesCount={savedSentences.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
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
          ref={leftColRef}
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
                العربية ⇄ {shownLangs.map(c => LANG_LABELS[c] ?? c).join(' + ')}
              </span>

              {extensionRaw !== null && (
                <button
                  onClick={() => setSentenceMode(v => !v)}
                  title="Merge caption fragments into whole sentences"
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 transition-colors ${
                    sentenceMode
                      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                  }`}
                >
                  Sentences {sentenceMode ? 'ON' : 'OFF'}
                </button>
              )}

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

            <div className="hidden lg:flex items-center gap-2 shrink-0 text-[11px]">
              <span className="opacity-60">Video size</span>
              <input
                type="range"
                min={35}
                max={100}
                value={videoScale}
                onChange={e => {
                  setVideoFit(false);
                  setVideoScale(Number(e.target.value));
                }}
                className="w-24 accent-rose-500"
                title="Make the video smaller or larger"
              />
              <button
                onClick={() => setVideoFit(v => !v)}
                title="Fit the video and captions to the window so nothing needs scrolling"
                className={`px-2 py-0.5 rounded-full border font-bold cursor-pointer ${
                  videoFit ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40' : 'border-slate-500/40 opacity-70'
                }`}
              >
                Fit {videoFit ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Video Player */}
          <div className="shrink-0" style={isDesktop ? { width: `${videoScale}%`, marginInline: 'auto' } : undefined}>
            <YouTubePlayer
              videoId={currentVideoId}
              initialTime={initialSeekTime}
              onTimeUpdate={setCurrentTime}
              onDurationChange={setDuration}
              loopConfig={loopConfig}
              onIncrementLoopCount={handleIncrementLoopCount}
              onStopLoop={handleStopLoop}
              autoPause={autoPause}
              onToggleAutoPause={() => setAutoPause(v => !v)}
              loopGapSec={loopGapSec}
              slowRepeatRate={slowRepeatRate}
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
            <CaptionStrip
              currentSubtitle={currentSubtitle}
              currentIndex={currentIndex}
              total={subtitles.length}
              onReplay={() => {
                if (currentSubtitle) handleSeekToSubtitle(currentSubtitle);
              }}
              onPrev={handlePrevSubtitle}
              onNext={handleNextSubtitle}
              onWordClick={(word, context) => {
                setActiveWordLookup({ word, context });
              }}
              onPinSentence={handlePinSentence}
              isCurrentPinned={currentSubtitle ? savedSentences.some(s => s.subtitleId === currentSubtitle.id) : false}
              showTashkeel={showTashkeel}
              showPhonetics={showPhonetics}
              showTranslation={showTranslation}
              onToggleTranslation={() => setShowTranslation(v => !v)}
              fontStep={stripFont}
              onFontStep={d => setStripFont(v => Math.min(4, Math.max(0, v + d)))}
              theme={theme}
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
            videoInfo={videoInfo}
            theme={theme}
            targetTranslationLang={nativeLangCode}
            selection={selection}
            onSelectionChange={setSelection}
            loopGapSec={loopGapSec}
            onChangeGap={setLoopGapSec}
            slowRepeatRate={slowRepeatRate}
            onChangeSlow={setSlowRepeatRate}
            onStartLoop={handleStartMultiLoop}
            onSaveSelection={handleSaveSelection}
            onWordClick={(word, context) => setActiveWordLookup({ word, context })}
            availableLangs={extensionRaw ? Array.from(new Set(extensionRaw.flatMap(i => Object.keys(i.translations ?? {})))) : ['ml', 'en']}
            shownLangs={shownLangs}
            onToggleLang={toggleLang}
            onAddLang={extensionRaw ? handleAddLang : undefined}
            showPhonetics={showPhonetics}
            onTogglePhonetics={() => setShowPhonetics(v => !v)}
            onPrepareVideo={handlePrepareVideo}
            captionInfo={captionInfo}
            onReloadCaptions={extensionRaw ? () => handleLoadVideo(currentVideoId, true) : undefined}
            showTashkeel={showTashkeel}
            onToggleTashkeel={() => setShowTashkeel(v => !v)}
            historyVideos={historyVideos}
            onOpenHistory={(youtubeId: string) => handleLoadVideo(youtubeId, false, getProgress(youtubeId)?.t ?? 0)}
            onDeleteHistory={(id: string) => {
              removeDynamicVideo(id);
              setLibraryTick(t => t + 1);
            }}
            currentYoutubeId={currentVideoId}
            prepareProgress={prepareProgress}
            onExportSelection={() => {
              setExportScopeHint('loop');
              setShowExportModal(true);
            }}
          />
        </div>
      </main>

      {/* Modals */}
      {showExportModal && (
        <ExportModal
          subtitles={subtitles}
          loopRange={
            selection
              ? { startIndex: selection.start, endIndex: selection.end }
              : loopConfig.endTime > loopConfig.startTime
              ? { startIndex: loopConfig.startIndex, endIndex: loopConfig.endIndex }
              : null
          }
          initialScope={exportScopeHint}
          defaultPhonetics={showPhonetics}
          pinnedRanges={savedSentences.filter(x => x.youtubeId === currentVideoId).map(x => ({ start: x.start, end: x.end }))}
          videoInfo={videoInfo}
          shownLangs={shownLangs}
          onAddLang={extensionRaw ? handleAddLang : undefined}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showExtensionHelp && <ExtensionInstallModal theme={theme} onClose={() => setShowExtensionHelp(false)} />}

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
          onRestoreBackup={handleRestoreBackup}
          onExportData={handleExportData}
          studyPause={studyPause}
          onChangeStudyPause={setStudyPause}
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
            setExtensionRaw(null);
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
            if (video.category === EXTENSION_CATEGORY) {
              setCustomSubtitles(null);
              setExtensionRaw(video.subtitles);
            } else {
              setExtensionRaw(null);
              setCustomSubtitles(video.subtitles);
            }
            setShowLibraryModal(false);
            setShareToast(`✓ Loaded "${video.title.slice(0, 35)}..." (${video.subtitles.length} lines)`);
            setTimeout(() => setShareToast(null), 3000);
          }}
          onImportCustomSubtitles={(importedSubs) => {
            setExtensionRaw(null);
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
          studyPauseOn={studyPause.on && studyPause.word}
          onToggleStudyPause={() => {
            keepVideoAsIs();
            setStudyPause(c => (c.on && c.word ? { ...c, word: false } : { ...c, on: true, word: true }));
          }}
          onPlayVideo={() => {
            keepVideoAsIs();
            playerControllerRef.current?.play();
          }}
          onSaveWord={handleSaveWord}
          isSaved={savedWords.some(w => w.word === activeWordLookup.word)}
          targetLangCode="ar"
          nativeLangCode={nativeLangCode}
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
