import React from 'react';
import { 
  TrendingUp, 
  Flame, 
  Clock, 
  BookMarked, 
  Calendar, 
  Award, 
  CheckCircle2, 
  X,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';
import { SavedWord } from '../types';

interface LearningProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedWords: SavedWord[];
  totalWatchSeconds: number;
}

export const LearningProgressModal: React.FC<LearningProgressModalProps> = ({
  isOpen,
  onClose,
  savedWords,
  totalWatchSeconds,
}) => {
  if (!isOpen) return null;

  const totalMinutes = Math.floor(totalWatchSeconds / 60);
  const hours = (totalWatchSeconds / 3600).toFixed(1);

  // Daily Streak calculation (stored or realistic mock for display)
  const currentStreak = 7;
  const longestStreak = 14;

  // Last 14 days activity mock data (minutes studied)
  const daysActivity = [
    { day: 'Mon', date: 'Sep 16', minutes: 25 },
    { day: 'Tue', date: 'Sep 17', minutes: 40 },
    { day: 'Wed', date: 'Sep 18', minutes: 15 },
    { day: 'Thu', date: 'Sep 19', minutes: 30 },
    { day: 'Fri', date: 'Sep 20', minutes: 50 },
    { day: 'Sat', date: 'Sep 21', minutes: 45 },
    { day: 'Sun', date: 'Sep 22', minutes: 60 },
    { day: 'Mon', date: 'Sep 23', minutes: 35 },
    { day: 'Tue', date: 'Sep 24', minutes: 20 },
    { day: 'Wed', date: 'Sep 25', minutes: 45 },
    { day: 'Thu', date: 'Sep 26', minutes: 55 },
    { day: 'Fri', date: 'Sep 27', minutes: 30 },
    { day: 'Sat', date: 'Sep 28', minutes: 65 },
    { day: 'Today', date: 'Sep 29', minutes: Math.max(15, totalMinutes) },
  ];

  const maxMinutes = Math.max(...daysActivity.map((d) => d.minutes), 60);

  // 30 days grid
  const monthDays = Array.from({ length: 30 }, (_, i) => {
    const active = i >= 12; // last 18 days active
    const intensity = active ? ((i % 3) + 1) : 0;
    return { day: i + 1, active, intensity };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Learning Progress Dashboard
              </h2>
              <p className="text-xs text-slate-400">
                Visualize your watch time, vocabulary retention, and daily study streaks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* 1. Core Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Streak */}
            <div className="bg-slate-850/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Daily Streak</span>
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-amber-400">{currentStreak}</span>
                <span className="text-xs text-slate-400 ml-1">Days</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Best: {longestStreak} days</span>
            </div>

            {/* Total Watch Time */}
            <div className="bg-slate-850/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Time Watched</span>
                <Clock className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-rose-400">{hours}</span>
                <span className="text-xs text-slate-400 ml-1">Hours</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">{totalMinutes} active minutes</span>
            </div>

            {/* Saved Words */}
            <div className="bg-slate-850/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Saved Words</span>
                <BookMarked className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-indigo-400">{savedWords.length}</span>
                <span className="text-xs text-slate-400 ml-1">Words</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Notebook & Flashcards</span>
            </div>

            {/* Daily Goal */}
            <div className="bg-slate-850/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Today&apos;s Goal</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-400">85%</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 mt-1">25 / 30 mins goal</span>
            </div>
          </div>

          {/* 2. Visual Interactive Bar Chart: Daily Study Minutes (Last 14 Days) */}
          <div className="bg-slate-850/80 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Daily Study Activity (Last 14 Days)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Minutes per day</span>
            </div>

            {/* Chart Area */}
            <div className="h-44 pt-4 flex items-end justify-between gap-1.5 border-b border-slate-800 pb-2">
              {daysActivity.map((d, idx) => {
                const heightPct = Math.round((d.minutes / maxMinutes) * 100);
                const isToday = idx === daysActivity.length - 1;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[10px] font-mono text-slate-200 px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap mb-1">
                      {d.minutes} mins
                    </div>
                    {/* Bar */}
                    <div className="w-full max-w-[28px] bg-slate-800 rounded-t-lg relative overflow-hidden flex items-end h-full">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isToday
                            ? 'bg-gradient-to-t from-rose-600 to-amber-500 shadow-md shadow-rose-500/20'
                            : 'bg-gradient-to-t from-indigo-700 to-indigo-500 group-hover:from-rose-500 group-hover:to-amber-400'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    {/* Day label */}
                    <span className={`text-[10px] truncate ${isToday ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. 30-Day Study Consistency Grid / Heatmap */}
          <div className="bg-slate-850/80 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  30-Day Attendance Heatmap
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded bg-slate-800 inline-block" />
                <span className="w-2.5 h-2.5 rounded bg-emerald-950 border border-emerald-800 inline-block" />
                <span className="w-2.5 h-2.5 rounded bg-emerald-700 inline-block" />
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                <span>More</span>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5 pt-1">
              {monthDays.map((m) => {
                let colorClass = 'bg-slate-800/80 border border-slate-700/60';
                if (m.intensity === 1) colorClass = 'bg-emerald-950 border border-emerald-800 text-emerald-300';
                if (m.intensity === 2) colorClass = 'bg-emerald-700 text-white';
                if (m.intensity === 3) colorClass = 'bg-emerald-500 text-slate-950 font-bold';

                return (
                  <div
                    key={m.day}
                    className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-mono cursor-pointer transition-transform hover:scale-110 ${colorClass}`}
                    title={`Day ${m.day}: ${m.active ? 'Study session completed' : 'No activity'}`}
                  >
                    {m.day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
