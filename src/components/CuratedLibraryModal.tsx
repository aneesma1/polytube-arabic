import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Play, 
  Upload, 
  Check, 
  Layers, 
  ExternalLink,
  BookOpen,
  RotateCcw,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { CuratedVideo, SubtitleItem } from '../types';
import { parseSrtFile } from '../utils/subtitles';
import { getAllCuratedVideos, fetchAiVideoRecommendations } from '../utils/dynamicVideoLibrary';

interface CuratedLibraryModalProps {
  onSelectVideo: (video: CuratedVideo) => void;
  onImportCustomSubtitles: (subtitles: SubtitleItem[]) => void;
  onClose: () => void;
}

export const CuratedLibraryModal: React.FC<CuratedLibraryModalProps> = ({
  onSelectVideo,
  onImportCustomSubtitles,
  onClose,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [allVideos, setAllVideos] = useState<CuratedVideo[]>(() => getAllCuratedVideos());
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAlert, setAiAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const filteredVideos = allVideos.filter((v) => {
    if (selectedLang !== 'all' && v.targetLangCode !== selectedLang) return false;
    if (selectedLevel !== 'all' && v.level !== selectedLevel) return false;
    return true;
  });

  const handleFetchAiVideos = async () => {
    const targetCode = selectedLang === 'all' ? 'ml' : selectedLang;
    const langNames: Record<string, string> = {
      ml: 'Malayalam',
      hi: 'Hindi',
      ur: 'Urdu',
      ar: 'Arabic',
      en: 'English',
      es: 'Spanish'
    };
    const targetName = langNames[targetCode] || 'Malayalam';

    setAiLoading(true);
    setAiAlert({ type: 'info', message: `Contacting Gemini AI for curated ${targetName} conversational videos...` });

    const result = await fetchAiVideoRecommendations(targetCode, targetName);
    setAiLoading(false);

    if (result.success && result.videos) {
      setAllVideos(getAllCuratedVideos());
      setAiAlert({
        type: 'success',
        message: `✨ Successfully added ${result.videos.length} AI-recommended ${targetName} videos!`
      });
      setTimeout(() => setAiAlert(null), 5000);
    } else {
      setAiAlert({
        type: 'error',
        message: `⚠️ AI Service Alert: ${result.error || 'Gemini API call failed'}. Displaying built-in video library.`
      });
      setTimeout(() => setAiAlert(null), 7000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseSrtFile(content);
        if (parsed.length > 0) {
          onImportCustomSubtitles(parsed);
          setImportedCount(parsed.length);
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl p-6 shadow-2xl flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Curated Video Library & Subtitle Upload
              </h2>
              <p className="text-xs text-slate-400">
                Choose a pre-aligned video with rich dual subtitles or upload your own .SRT/.VTT file.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Custom Subtitle File Card */}
        <div className="bg-slate-850 border border-dashed border-slate-700 hover:border-slate-500 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                Have custom subtitles for your YouTube video?
              </h4>
              <p className="text-xs text-slate-400">
                Upload any `.srt` or `.vtt` file to load custom synchronized dual captions.
              </p>
            </div>
          </div>

          <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl cursor-pointer transition-colors shrink-0 shadow-md">
            <span>Browse Subtitle File</span>
            <input 
              type="file" 
              accept=".srt,.vtt,.txt" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>

        {importedCount !== null && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Successfully imported {importedCount} subtitles! Loading video...</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Language filter */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs flex-wrap">
            {[
              { id: 'all', label: 'All Languages' },
              { id: 'ml', label: 'Malayalam (മലയാളം)' },
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'Hindi (हिन्दी)' },
              { id: 'ur', label: 'Urdu (اردو)' },
              { id: 'ar', label: 'Arabic (العربية)' },
              { id: 'es', label: 'Spanish' },
              { id: 'ja', label: 'Japanese' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedLang === lang.id
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Level filter & AI Recommendation Trigger */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              {['all', 'Beginner', 'Intermediate'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    selectedLevel === lvl
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={handleFetchAiVideos}
              disabled={aiLoading}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 transition-all"
              title="Use Gemini AI to dynamically find more authentic videos for this language"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{aiLoading ? 'Gemini finding...' : 'Find More Videos with AI'}</span>
            </button>
          </div>
        </div>

        {/* AI Status Alert Notification */}
        {aiAlert && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
            aiAlert.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : aiAlert.type === 'error'
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
          }`}>
            {aiAlert.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{aiAlert.message}</span>
          </div>
        )}

        {/* Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col group transition-all"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-black/70 text-amber-300 backdrop-blur-sm">
                    {video.targetLang}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-600/90 text-white">
                    {video.level}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                  {video.subtitles.length} lines
                </div>
              </div>

              {/* Info */}
              <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-100 line-clamp-2 leading-snug group-hover:text-rose-300 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {video.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {video.channel}
                  </span>
                  <button
                    onClick={() => {
                      onSelectVideo(video);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Study Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
