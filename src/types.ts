export interface SubtitleItem {
  id: number;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;  // target language text (e.g. Arabic with or without Tashkeel)
  vocalizedText?: string; // Arabic with full Harakat / Tashkeel
  transliteration?: string; // Romanized phonetic script (e.g. Al-salāmu 'alaykum)
  translation: string; // Native language translation (e.g. English)
  notes?: string;
  rootWords?: { word: string; root: string; meaning: string }[];
}

export interface CuratedVideo {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  targetLang: string;
  targetLangCode: string;
  nativeLang: string;
  nativeLangCode: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  thumbnail: string;
  description: string;
  subtitles: SubtitleItem[];
}

export interface LoopConfig {
  active: boolean;
  type: 'single' | 'range' | 'ab';
  startIndex: number;
  endIndex: number;
  startTime: number;
  endTime: number;
  mode: 'infinite' | 'finite';
  targetCount: number; // e.g. 3, 5, 10
  currentCount: number;
}

export interface SavedWord {
  id: string;
  word: string;
  vocalized?: string;
  transliteration?: string;
  translation: string;
  root?: string;
  partOfSpeech?: string;
  contextSentence: string;
  contextTranslation: string;
  videoId: string;
  videoTitle: string;
  timestamp: number;
  savedAt: number;
  reviewedCount: number;
  targetLangCode?: string;
  nativeLangCode?: string;
}

export interface SavedSentence {
  id: string;
  videoId: string;
  youtubeId: string;
  videoTitle: string;
  subtitleId: number;
  start: number;
  end: number;
  text: string;
  vocalizedText?: string;
  transliteration?: string;
  translation: string;
  targetLangCode: string;
  nativeLangCode: string;
  notes?: string;
  userNotes?: string;
  tags?: string[];
  savedAt: number;
  reviewedCount?: number;
  masteryLevel?: 'learning' | 'reviewing' | 'mastered';
}

export interface NativeAlternative {
  phrase: string;
  style: 'Casual' | 'Professional' | 'Idiomatic' | 'Everyday' | 'Emphatic' | 'Polite' | 'Workplace' | 'Travel' | string;
  explanation?: string;
}

export interface InputEvaluation {
  detectedInputType?: 'L1_NATIVE' | 'L2_LITERAL_CALQUE' | 'L2_NATURAL' | 'MIXED_COLLOQUIAL' | string;
  naturalnessScore?: number; // 0 to 100
  verdict?: string; // e.g. "Literal Calque Trap", "Understandable but Unnatural", "Good Native Phrasing"
  directFeedback?: string; // Direct feedback assessing the user's specific sentence
}

export interface NativeRephraseEntry {
  id: string;
  sourceText: string;
  sourceLang: string;
  sourceLangCode: string;
  targetLang: string;
  targetLangCode: string;
  literalTrap: string;
  literalExplanation: string;
  naturalAlternatives: NativeAlternative[];
  cultureTip?: string;
  grammarTip?: string;
  youglishQuery: string;
  savedAt?: number;
  category?: string;
  evaluation?: InputEvaluation;
}

export interface WordAnalysis {
  word: string;
  cleanWord: string;
  vocalized?: string;
  transliteration?: string;
  translation: string;
  root?: string;
  pattern?: string;
  partOfSpeech?: string;
  examples?: string[];
}

export interface SavedVideoItem {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  thumbnail: string;
  lastTimestamp: number;
  duration: number;
  targetLang: string;
  targetLangCode: string;
  nativeLang: string;
  nativeLangCode: string;
  subtitlesCount?: number;
  subtitles?: SubtitleItem[];
  addedAt: number;
  lastWatchedAt: number;
  completed?: boolean;
}

export interface VideoCollection {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean; // e.g. "Watch Later"
  icon?: string;
  createdAt: number;
  updatedAt: number;
  videos: SavedVideoItem[];
}

export interface WorkspaceSettings {
  splitRatio: number; // percentage for left video column (e.g. 65)
  sidebarFontSize: 'sm' | 'md' | 'lg' | 'xl';
  showSidebarArabic: boolean;
  showSidebarTransliteration: boolean;
  showSidebarTranslation: boolean;
  dualSubtitles: boolean;
  autoPause: boolean;
  playbackRate: number;
  showPinyin: boolean;
  showTashkeel: boolean;
  theme?: 'light' | 'dark';
}

export interface BackupPayload {
  version: string;
  exportedAt: string;
  appName: string;
  currentVideo: {
    id: string;
    title: string;
    timestamp: number;
    targetLangCode: string;
    nativeLangCode: string;
  };
  subtitles: SubtitleItem[];
  vocabulary: SavedWord[];
  collections: VideoCollection[];
  settings: WorkspaceSettings;
}

export interface AppLanguagePair {
  key: string; // e.g. 'ml-en'
  label: string;
  sourceLang: string;
  sourceLangCode: string;
  targetLang: string;
  targetLangCode: string;
  flag: string;
  defaultVideoId: string;
  description: string;
}

export interface CourseQuizQuestion {
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface RoadmapLessonNode {
  id: string;
  title: string;
  subtitle: string;
  sourcePhrase: string;
  sourceScript?: string;
  transliteration?: string;
  literalTrap: string;
  literalExplanation: string;
  naturalAlternatives: Array<{
    phrase: string;
    style: string;
    explanation?: string;
  }>;
  culturalNote?: string;
  grammarTip?: string;
  youglishQuery: string;
  quiz: CourseQuizQuestion;
  stageId: string;
  order: number;
  xpReward: number;
}

export interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  badge: string;
  lessons: RoadmapLessonNode[];
}

export interface RoadmapTrack {
  pairKey: string;
  title: string;
  subtitle: string;
  flag: string;
  sourceLang: string;
  targetLang: string;
  stages: RoadmapStage[];
}
