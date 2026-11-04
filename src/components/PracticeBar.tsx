import React, { useEffect, useState } from 'react';
import { Play, Square, X, Bookmark, Download, Repeat, MousePointerClick } from 'lucide-react';
import { LoopConfig, SubtitleItem } from '../types';
import { formatTime } from '../utils/youtube';

export interface LineSelection {
  start: number; // first selected line index
  end: number;   // last selected line index (inclusive)
}

interface PracticeBarProps {
  subtitles: SubtitleItem[];
  selection: LineSelection | null;
  loopConfig: LoopConfig;
  loopGapSec: number;
  onChangeGap: (sec: number) => void;
  slowRepeatRate: number | null;
  onChangeSlow: (rate: number | null) => void;
  onStartLoop: (start: number, end: number, count: number) => void;
  onStopLoop: () => void;
  onSaveSelection: (start: number, end: number) => void;
  onExportSelection: () => void;
  onClear: () => void;
  theme?: 'light' | 'dark';
}

const COUNT_KEY = 'polytube_loop_count';
const COUNTS: { label: string; value: number }[] = [
  { label: '×2', value: 2 },
  { label: '×3', value: 3 },
  { label: '×5', value: 5 },
  { label: '∞', value: Infinity },
];

export const PracticeBar: React.FC<PracticeBarProps> = ({
  subtitles,
  selection,
  loopConfig,
  loopGapSec,
  onChangeGap,
  slowRepeatRate,
  onChangeSlow,
  onStartLoop,
  onStopLoop,
  onSaveSelection,
  onExportSelection,
  onClear,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [count, setCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(COUNT_KEY);
      return raw === 'inf' ? Infinity : Number(raw) || 3;
    } catch {
      return 3;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(COUNT_KEY, count === Infinity ? 'inf' : String(count));
    } catch {}
  }, [count]);

  if (!selection) {
    return (
      <div
        className={`mx-3 mb-3 px-3 py-2 rounded-xl border text-[11px] flex items-center gap-2 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}
      >
        <MousePointerClick className="w-3.5 h-3.5 shrink-0" />
        <span>
          Click a line to play it. Click the circle (or Shift-click) on another line to select several lines and practice them.
        </span>
      </div>
    );
  }

  const first = subtitles[selection.start];
  const last = subtitles[selection.end];
  if (!first || !last) return null;

  const total = selection.end - selection.start + 1;
  const loopingThis =
    loopConfig.active && loopConfig.startIndex === selection.start && loopConfig.endIndex === selection.end;

  const applyPreset = (preset: 'shadowing' | 'listening') => {
    if (preset === 'shadowing') {
      setCount(3);
      onChangeGap(-1);
      onChangeSlow(0.75);
    } else {
      setCount(5);
      onChangeGap(0);
      onChangeSlow(null);
    }
  };

  const select = `text-[11px] font-bold rounded-lg border px-1.5 py-1 cursor-pointer ${
    isLight ? 'bg-white border-slate-300 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-200'
  }`;
  const ghost = `px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
    isLight
      ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
  }`;

  return (
    <div
      className={`mx-3 mb-3 p-3 rounded-2xl border shadow-lg flex flex-col gap-2.5 ${
        isLight ? 'bg-white border-rose-300' : 'bg-slate-900 border-rose-500/50'
      }`}
    >
      {/* Selection summary */}
      <div className="flex items-center justify-between gap-2">
        <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
          {total === 1 ? `Line ${selection.start + 1}` : `Lines ${selection.start + 1}–${selection.end + 1}`}
          <span className="ml-2 font-mono font-medium opacity-70">
            {formatTime(first.start)}–{formatTime(last.end)}
          </span>
          {loopingThis && (
            <span className="ml-2 text-amber-500 animate-pulse">
              looping {loopConfig.currentCount + 1}/{loopConfig.targetCount === 999999 ? '∞' : loopConfig.targetCount}
            </span>
          )}
        </div>
        <button onClick={onClear} className="p-1 rounded-md opacity-60 hover:opacity-100 cursor-pointer" title="Clear selection">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Loop controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {loopingThis ? (
          <button
            onClick={onStopLoop}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" /> Stop
          </button>
        ) : (
          <button
            onClick={() => onStartLoop(selection.start, selection.end, count)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Loop
          </button>
        )}

        <div className="flex rounded-lg overflow-hidden border border-slate-400/40">
          {COUNTS.map(c => (
            <button
              key={c.label}
              onClick={() => setCount(c.value)}
              className={`px-2 py-1 text-[11px] font-bold cursor-pointer ${
                count === c.value
                  ? 'bg-rose-600 text-white'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <select
          value={loopGapSec}
          onChange={e => onChangeGap(Number(e.target.value))}
          title="Pause between repeats so you can say the line aloud"
          className={select}
        >
          <option value={0}>No gap</option>
          <option value={1}>Gap 1s</option>
          <option value={2}>Gap 2s</option>
          <option value={-1}>Gap = line</option>
        </select>

        <select
          value={slowRepeatRate ?? 0}
          onChange={e => onChangeSlow(Number(e.target.value) || null)}
          title="Speed from the 2nd repeat on"
          className={select}
        >
          <option value={0}>Same speed</option>
          <option value={0.75}>Repeats 0.75×</option>
          <option value={0.5}>Repeats 0.5×</option>
        </select>
      </div>

      {/* Presets and actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold opacity-50 flex items-center gap-1">
            <Repeat className="w-3 h-3" /> Preset
          </span>
          <button className={ghost} onClick={() => applyPreset('shadowing')} title="×3, gap = line length, slower repeats">
            Shadowing
          </button>
          <button className={ghost} onClick={() => applyPreset('listening')} title="×5, no gap, same speed">
            Listening
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button className={ghost} onClick={() => onSaveSelection(selection.start, selection.end)}>
            <Bookmark className="w-3.5 h-3.5" /> Save
          </button>
          <button className={ghost} onClick={onExportSelection}>
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>
    </div>
  );
};
