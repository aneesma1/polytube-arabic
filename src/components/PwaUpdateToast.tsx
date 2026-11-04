import React from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';

interface PwaUpdateToastProps {
  isOpen: boolean;
  onApply: () => void;
  onDefer: () => void;
  theme?: 'light' | 'dark';
}

export const PwaUpdateToast: React.FC<PwaUpdateToastProps> = ({
  isOpen,
  onApply,
  onDefer,
  theme = 'light',
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className={`p-3 sm:px-4 sm:py-3 rounded-2xl border shadow-2xl flex items-center justify-between gap-3 ${
        isLight 
          ? 'bg-slate-900 text-white border-slate-700 shadow-slate-900/30' 
          : 'bg-slate-850 text-white border-slate-700 shadow-black/50'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold truncate">
              تحديث جديد متوفر (New Update Ready!)
            </span>
            <span className="text-[11px] text-slate-300 truncate">
              سيتم التحديث تلقائياً عند التشغيل القادم
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onDefer}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="تأجيل لفتح التطبيق القادم (Defer to next launch)"
          >
            لاحقاً (Later)
          </button>

          <button
            onClick={onApply}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="تحديث التطبيق الآن"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث الآن (Update)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
