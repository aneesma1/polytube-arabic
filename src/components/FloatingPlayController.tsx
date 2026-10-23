import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Repeat, 
  ChevronLeft, 
  ChevronRight, 
  Square,
  Clock
} from 'lucide-react';
import { LoopConfig, SubtitleItem } from '../types';
import { formatTime } from '../utils/youtube';

interface FloatingPlayControllerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  loopConfig: LoopConfig;
  onStopLoop: () => void;
  currentSubtitle: SubtitleItem | null;
  onReplayCurrent: () => void;
  onPrevSubtitle: () => void;
  onNextSubtitle: () => void;
  currentTime: number;
  theme?: 'light' | 'dark';
}

export const FloatingPlayController: React.FC<FloatingPlayControllerProps> = ({
  isPlaying,
  onTogglePlay,
  loopConfig,
  onStopLoop,
  currentSubtitle,
  onReplayCurrent,
  onPrevSubtitle,
  onNextSubtitle,
  currentTime,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 p-2 rounded-2xl border shadow-2xl backdrop-blur-md transition-all ${
        isLight
          ? 'bg-white/95 border-slate-300 text-slate-800 shadow-slate-400/30'
          : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-black/60'
      }`}
      style={{
        boxShadow: isLight
          ? '0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05)'
          : '0 10px 35px -5px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.1)',
      }}
    >
      {/* 1. Active Sentence & Timestamp Badge */}
      <div className="flex flex-col px-2 text-[11px] leading-tight border-r border-slate-200 dark:border-slate-800 pr-3">
        <span className="font-bold flex items-center gap-1 text-rose-600 dark:text-rose-400">
          <Clock className="w-3 h-3" />
          <span>{formatTime(currentTime)}</span>
        </span>
        <span className={`text-[10px] truncate max-w-[90px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {currentSubtitle ? `Sentence #${currentSubtitle.id}` : 'LingoTube'}
        </span>
      </div>

      {/* 2. Jump Prev Sentence */}
      <button
        onClick={onPrevSubtitle}
        className={`p-2 rounded-xl transition-colors cursor-pointer ${
          isLight
            ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            : 'hover:bg-slate-800 text-slate-400 hover:text-white'
        }`}
        title="Previous sentence ([ key)"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* 3. Replay Current Sentence [R] */}
      <button
        onClick={onReplayCurrent}
        className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
          isLight
            ? 'hover:bg-rose-50 text-slate-700 hover:text-rose-600'
            : 'hover:bg-slate-800 text-slate-300 hover:text-rose-400'
        }`}
        title="Replay this sentence from start (R key)"
      >
        <RotateCcw className="w-4 h-4 text-rose-500" />
        <span className="hidden sm:inline text-[11px]">Replay</span>
      </button>

      {/* 4. PRIMARY PLAY / PAUSE BUTTON (Always Accessible in Corner!) */}
      <button
        onClick={onTogglePlay}
        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer select-none active:scale-95 ${
          isPlaying
            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400/40'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/40'
        }`}
        title={isPlaying ? 'Pause video (Space)' : 'Play video (Space)'}
      >
        {isPlaying ? (
          <>
            <Pause className="w-4 h-4 fill-white" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-white ml-0.5" />
            <span>Play</span>
          </>
        )}
      </button>

      {/* 5. Jump Next Sentence */}
      <button
        onClick={onNextSubtitle}
        className={`p-2 rounded-xl transition-colors cursor-pointer ${
          isLight
            ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            : 'hover:bg-slate-800 text-slate-400 hover:text-white'
        }`}
        title="Next sentence (] key)"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* 6. Active Loop Pill & STOP Button (Shows up whenever ANY loop is active) */}
      {loopConfig.active && (
        <button
          onClick={onStopLoop}
          className="ml-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/40 ring-2 ring-amber-400 flex items-center gap-1.5 animate-pulse cursor-pointer transition-transform active:scale-95"
          title="Stop sentence repeat loop"
        >
          <Repeat className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '2s' }} />
          <span>
            Stop Loop ({loopConfig.currentCount + 1}/{loopConfig.targetCount === 999999 ? '∞' : loopConfig.targetCount})
          </span>
          <Square className="w-3 h-3 fill-slate-950" />
        </button>
      )}
    </div>
  );
};
