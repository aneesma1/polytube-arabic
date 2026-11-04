import React, { useMemo, useState } from 'react';
import { Play, Trash2, Search } from 'lucide-react';
import { CuratedVideo } from '../types';
import { getAllProgress } from '../utils/resume';
import { LANG_LABELS } from '../App';

interface HistoryListProps {
  videos: CuratedVideo[];
  currentYoutubeId: string;
  onOpen: (youtubeId: string) => void;
  onDelete: (id: string) => void;
  theme?: 'light' | 'dark';
}

function ago(ts?: number): string {
  if (!ts) return 'never opened';
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

function languagesOf(v: CuratedVideo): string[] {
  const set = new Set<string>();
  for (const item of v.subtitles.slice(0, 60)) Object.keys(item.translations ?? {}).forEach(k => set.add(k));
  return Array.from(set);
}

export const HistoryList: React.FC<HistoryListProps> = ({ videos, currentYoutubeId, onOpen, onDelete, theme = 'light' }) => {
  const isLight = theme === 'light';
  const [query, setQuery] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const progress = useMemo(getAllProgress, [videos, currentYoutubeId]);

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos
      .filter(v => !q || v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q))
      .sort((a, b) => (b.lastOpened ?? b.fetchedAt ?? 0) - (a.lastOpened ?? a.fetchedAt ?? 0));
  }, [videos, query]);

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
        <Search className="w-4 h-4 opacity-50" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${videos.length} saved videos`}
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      {videos.length === 0 && (
        <p className="text-sm opacity-70 px-1">
          Videos you load through the extension are saved here and open instantly later, with their captions and translations.
        </p>
      )}

      {sorted.map(v => {
        const p = progress[v.youtubeId];
        const pct = p && p.dur > 0 ? Math.min(100, Math.round((p.t / p.dur) * 100)) : 0;
        const langs = languagesOf(v);
        return (
          <div
            key={v.id}
            className={`flex gap-3 p-2.5 rounded-2xl border ${
              v.youtubeId === currentYoutubeId
                ? isLight ? 'bg-rose-50 border-rose-300' : 'bg-rose-950/30 border-rose-500/50'
                : isLight ? 'bg-white border-slate-200' : 'bg-slate-850 border-slate-700'
            }`}
          >
            <button onClick={() => onOpen(v.youtubeId)} className="relative shrink-0 w-28 h-16 rounded-lg overflow-hidden bg-slate-800 cursor-pointer">
              <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" loading="lazy" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 text-white fill-white" />
              </span>
              {pct > 0 && (
                <span className="absolute bottom-0 left-0 h-1 bg-rose-500" style={{ width: `${pct}%` }} />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <button onClick={() => onOpen(v.youtubeId)} className="block text-left w-full cursor-pointer">
                <div className="text-sm font-bold truncate" dir="auto">{v.title}</div>
              </button>
              <div className="text-[11px] opacity-70 truncate">{v.channel}</div>
              <div className="text-[11px] opacity-70 mt-0.5">
                {v.subtitles.length} lines
                {langs.length > 0 && ` · ${langs.map(l => LANG_LABELS[l] ?? l).join(', ')}`}
                {` · ${ago(v.lastOpened ?? v.fetchedAt)}`}
                {pct > 0 && ` · ${pct}% watched`}
              </div>
            </div>

            <div className="flex flex-col items-end justify-between shrink-0">
              {confirmId === v.id ? (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { onDelete(v.id); setConfirmId(null); }}
                    className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                  <button onClick={() => setConfirmId(null)} className="px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer">
                    Keep
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmId(v.id)} className="p-1.5 rounded-lg opacity-50 hover:opacity-100 cursor-pointer" title="Remove from history">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onOpen(v.youtubeId)}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" /> Play
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
