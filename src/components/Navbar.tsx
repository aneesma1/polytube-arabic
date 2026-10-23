import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  ClipboardPaste, 
  Download, 
  Bookmark, 
  Settings, 
  Upload, 
  Sun, 
  Moon,
  Smartphone,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { extractYouTubeId } from '../utils/youtube';

interface NavbarProps {
  onLoadVideo: (urlOrId: string) => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onUploadSrtFile?: (file: File) => void;
  pinnedSentencesCount?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  targetTranslationLang: 'ml' | 'en';
  onToggleTranslationLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadVideo,
  onOpenExport,
  onOpenSettings,
  onUploadSrtFile,
  pinnedSentencesCount = 0,
  theme = 'light',
  onToggleTheme,
  targetTranslationLang,
  onToggleTranslationLang,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const navFileInputRef = useRef<HTMLInputElement | null>(null);
  const isLight = theme === 'light';

  // Listen for PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    const videoId = extractYouTubeId(inputUrl);
    if (!videoId) {
      setErrorMsg('Invalid YouTube URL or ID');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    setErrorMsg('');
    onLoadVideo(videoId);
    setInputUrl('');
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text);
          const videoId = extractYouTubeId(text);
          if (videoId) {
            onLoadVideo(videoId);
            setInputUrl('');
          }
        }
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all h-12 flex items-center shadow-xs select-none ${
      isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-900/95 border-slate-800 text-white'
    }`}>
      <div className="max-w-[1700px] w-full mx-auto px-3 flex items-center justify-between gap-3">
        {/* Left: Brand & Arabic Immersion Tag */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-rose-600 to-indigo-600 flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-sm tracking-tight leading-none ${
              isLight ? 'text-slate-900' : 'bg-gradient-to-r from-amber-200 via-rose-200 to-indigo-200 bg-clip-text text-transparent'
            }`}>
              PolyTube <span className="text-rose-500 font-arabic">العربية</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Arabic Immersion Player
            </span>
          </div>

          {/* Translation Direction Toggle: Malayalam ⇄ English */}
          <button
            onClick={onToggleTranslationLang}
            className={`px-2 py-1 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-1 ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' 
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
            }`}
            title="Toggle between Malayalam and English dual translation"
          >
            <span className="text-rose-500">🇸🇦 العربية</span>
            <ArrowRightLeft className="w-3 h-3 text-slate-400" />
            <span>{targetTranslationLang === 'ml' ? '🌴 മലയാളം' : '🇬🇧 English'}</span>
          </button>
        </div>

        {/* Center: YouTube URL Input */}
        <div className="flex-1 max-w-md mx-2 min-w-0 relative">
          <form onSubmit={handleSubmit} className="flex items-center w-full">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste Arabic YouTube URL or ID..."
                className={`w-full pl-3 pr-14 py-1 text-xs rounded-l-xl border focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400' 
                    : 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder-slate-400'
                }`}
              />
              <button
                type="button"
                onClick={handlePaste}
                className={`absolute right-1 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] rounded flex items-center gap-0.5 transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">Paste</span>
              </button>
            </div>
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 text-xs font-bold rounded-r-xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
            >
              <span>Load</span>
            </button>
          </form>
          {errorMsg && (
            <p className="absolute -bottom-4 text-[10px] text-rose-500 font-bold">{errorMsg}</p>
          )}
        </div>

        {/* Right: PWA Install, Upload SRT, Export Study, Theme, Settings */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* PWA Install Button (Always visible or highlighted when install prompt is ready) */}
          {isInstallable && (
            <button
              onClick={handleInstallPwa}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-all cursor-pointer animate-pulse"
              title="Install PolyTube Arabic as Desktop or Mobile PWA"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Install App</span>
            </button>
          )}

          {/* Upload Custom SRT */}
          {onUploadSrtFile && (
            <button
              onClick={() => navFileInputRef.current?.click()}
              className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
              title="Upload Arabic SRT Subtitle File"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
            </button>
          )}

          <input
            ref={navFileInputRef}
            type="file"
            accept=".srt,.vtt,.txt"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && onUploadSrtFile) onUploadSrtFile(f);
              if (navFileInputRef.current) navFileInputRef.current.value = '';
            }}
            className="hidden"
          />

          {/* Export Study Notes & Anki Cards */}
          <button
            onClick={onOpenExport}
            className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              isLight 
                ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700' 
                : 'bg-indigo-950/40 hover:bg-indigo-900/50 border-indigo-800 text-indigo-300'
            }`}
            title="Export Study Notes, Anki Cards & Printable PDF"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Export Study</span>
            {pinnedSentencesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white font-bold text-[10px]">
                {pinnedSentencesCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-1.5 rounded-lg border text-xs flex items-center transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-amber-400'
              }`}
              title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            >
              {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className={`p-1.5 rounded-lg border text-xs flex items-center transition-colors cursor-pointer ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
            }`}
            title="Settings & Reset"
          >
            <Settings className="w-3.5 h-3.5 text-rose-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
