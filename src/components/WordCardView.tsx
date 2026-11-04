import React from 'react';
import { SavedWord } from '../types';

interface WordCardViewProps {
  w: SavedWord;
  onOpenLookup: () => void;
  theme?: 'light' | 'dark';
}

const clock = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

/** Read-only view of a saved word: the full card if there is one, otherwise a light summary. */
export const WordCardView: React.FC<WordCardViewProps> = ({ w, onOpenLookup, theme = 'light' }) => {
  const isLight = theme === 'light';
  const c = w.card;
  const head = 'text-[10px] uppercase tracking-wider font-bold opacity-60 mb-1';
  const meaning = c?.meaning || w.translation;

  return (
    <div className={`space-y-3 pt-3 text-sm ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
      <div className="flex flex-wrap gap-2 text-xs font-bold items-center">
        {w.transliteration && <span className="font-mono text-indigo-500">/{w.transliteration}/</span>}
        {w.root && <span className={`px-2 py-0.5 rounded-lg border ${isLight ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-500/10 border-amber-500/40 text-amber-300'}`}>Root <span className="font-arabic text-sm">{w.root}</span></span>}
        {w.partOfSpeech && <span className={`px-2 py-0.5 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-700 border-slate-600'}`}>{w.partOfSpeech}</span>}
      </div>

      {meaning && (
        <div>
          <div className={head}>Meaning</div>
          <div className="font-semibold">{meaning}</div>
        </div>
      )}

      {c?.dictionary && c.dictionary.length > 0 && (
        <div>
          <div className={head}>Dictionary (Wiktionary)</div>
          {c.dictionary.map((e, i) => (
            <div key={i} className="mb-1.5">
              <div className="text-[11px] font-bold uppercase opacity-60">{e.pos}</div>
              <ul className="list-disc ml-5 space-y-0.5">
                {e.definitions.map((d, j) => (
                  <li key={j}>{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {c?.examples && c.examples.length > 0 && (
        <div>
          <div className={head}>Example sentences</div>
          <div className="space-y-2">
            {c.examples.map(ex => (
              <div key={ex.id}>
                <div className="font-arabic text-2xl text-right leading-loose" dir="rtl">{ex.arabic}</div>
                <div className="opacity-80">{ex.translation}</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] opacity-50 mt-1">Tatoeba, CC BY 2.0 FR</p>
        </div>
      )}

      {c?.ai && (c.ai.pattern || c.ai.meaning || c.ai.contextExplanation || c.ai.collocations?.length) && (
        <div>
          <div className={head}>Notes (AI, may contain errors)</div>
          {c.ai.pattern && <div><b>Pattern:</b> <span className="font-arabic text-2xl align-middle">{c.ai.pattern}</span></div>}
          {c.ai.meaning && <div>{c.ai.meaning}</div>}
          {c.ai.contextExplanation && <div>{c.ai.contextExplanation}</div>}
          {c.ai.collocations && c.ai.collocations.length > 0 && (
            <ul className="mt-1">
              {c.ai.collocations.map((p, i) => (
                <li key={i} className="font-arabic text-2xl leading-loose text-right" dir="rtl">{p}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {w.contextSentence && (
        <div>
          <div className={head}>In the video: {w.videoTitle} · {clock(w.timestamp)}</div>
          <div className="font-arabic text-xl text-right leading-loose" dir="rtl">{w.contextSentence}</div>
          {w.contextTranslation && w.contextTranslation !== '—' && <div className="italic opacity-80 whitespace-pre-line">{w.contextTranslation}</div>}
        </div>
      )}

      {!c && (
        <div className={`rounded-xl border p-2.5 text-xs flex items-center justify-between gap-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-700'}`}>
          <span className="opacity-80">Saved as a light card (word, meaning, sentence). Open the lookup to see the dictionary and examples, and save the full card.</span>
          <button onClick={onOpenLookup} className="shrink-0 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer">
            Open lookup
          </button>
        </div>
      )}
    </div>
  );
};
