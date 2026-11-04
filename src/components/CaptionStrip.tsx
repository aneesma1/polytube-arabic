import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, Bookmark, Minus, Plus, Languages } from 'lucide-react';
import { SubtitleItem } from '../types';
import { speakWord, cleanArabicWord, removeTashkeel, hasTashkeel, smartVocalizeParticles } from '../utils/arabic';

interface CaptionStripProps {
  currentSubtitle: SubtitleItem | null;
  currentIndex: number;
  total: number;
  onReplay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onWordClick: (word: string, context: SubtitleItem) => void;
  onPinSentence: (subtitle: SubtitleItem) => void;
  isCurrentPinned: boolean;
  showTashkeel: boolean;
  showPhonetics: boolean;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  /** 0 (smallest) to 4 (largest) */
  fontStep: number;
  onFontStep: (delta: number) => void;
  theme?: 'light' | 'dark';
}

// Largest Arabic size per step (px). Long lines shrink to fit, they never scroll.
const ARABIC_PX = [20, 24, 30, 36, 44];
const TRANS_PX = [12, 14, 16, 18, 20];
// Fixed text-area height per step, so changing lines never makes the page jump
const HEIGHT_STACKED = [96, 118, 148, 184, 220];
const HEIGHT_SIDE = [80, 100, 124, 156, 190];
const HEIGHT_ARABIC_ONLY = [64, 80, 100, 128, 156];
const MIN_SCALE = 0.55;
// Above this box width, Arabic and the translation sit side by side
const SIDE_BY_SIDE_MIN = 760;

/** One slim live-caption strip under the video. Everything else lives in the right panel. */
export const CaptionStrip: React.FC<CaptionStripProps> = ({
  currentSubtitle,
  currentIndex,
  total,
  onReplay,
  onPrev,
  onNext,
  onWordClick,
  onPinSentence,
  isCurrentPinned,
  showTashkeel,
  showPhonetics,
  showTranslation,
  onToggleTranslation,
  fontStep,
  onFontStep,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const sub = currentSubtitle;
  const step = Math.min(4, Math.max(0, fontStep));

  const boxRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);

  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => setBoxWidth(Math.round(entries[0].contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const arabic = (item: SubtitleItem) => {
    if (!showTashkeel) return removeTashkeel(item.text || item.vocalizedText || '');
    if (item.vocalizedText && hasTashkeel(item.vocalizedText)) return item.vocalizedText;
    if (hasTashkeel(item.text)) return item.text;
    return smartVocalizeParticles(item.text || item.vocalizedText || '');
  };

  const btn = `p-1.5 rounded-lg border cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
  }`;

  const translation = sub && sub.translation && sub.translation !== '—' ? sub.translation.split('\n').join('  ·  ') : '';
  const phonetic = showPhonetics && sub?.transliteration ? sub.transliteration : '';
  const hasSecondary = showTranslation && !!translation;
  const sideBySide = (hasSecondary || !!phonetic) && boxWidth >= SIDE_BY_SIDE_MIN;

  // Height follows the toggles, not the current line, so lines without a translation do not make the page jump
  const wantsSecondLine = showTranslation || showPhonetics;
  const wide = boxWidth >= SIDE_BY_SIDE_MIN;
  const boxHeight = !wantsSecondLine ? HEIGHT_ARABIC_ONLY[step] : wide ? HEIGHT_SIDE[step] : HEIGHT_STACKED[step];

  // Shrink the text until it fits the box, never below MIN_SCALE; the box itself never scrolls
  useLayoutEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    if (!box || !content) return;
    let scale = 1;
    content.style.fontSize = `${ARABIC_PX[step]}px`;
    while (box.scrollHeight > box.clientHeight + 1 && scale > MIN_SCALE) {
      scale = Math.max(MIN_SCALE, scale - 0.05);
      content.style.fontSize = `${(ARABIC_PX[step] * scale).toFixed(1)}px`;
    }
  }, [sub?.id, step, showTashkeel, showTranslation, showPhonetics, sideBySide, boxWidth, boxHeight, translation, phonetic]);

  const transEm = `${(TRANS_PX[step] / ARABIC_PX[step]).toFixed(3)}em`;

  const arabicBlock = sub && (
    <div dir="rtl" className={`font-arabic text-right font-semibold leading-[2] ${isLight ? 'text-slate-900' : 'text-slate-100'}`} style={{ fontSize: '1em' }}>
      {arabic(sub)
        .split(/\s+/)
        .map((word, i) => (
          <button
            key={i}
            onClick={() => onWordClick(word, sub)}
            title={`Look up "${cleanArabicWord(word)}"`}
            className={`inline-block px-0.5 mx-0.5 rounded cursor-pointer ${isLight ? 'hover:bg-amber-100' : 'hover:bg-amber-500/20'}`}
          >
            {word}
          </button>
        ))}
    </div>
  );

  const secondaryBlock = sub && (phonetic || hasSecondary) && (
    <div>
      {phonetic && (
        <div className={`leading-snug font-mono ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`} style={{ fontSize: transEm }}>
          /{phonetic}/
        </div>
      )}
      {hasSecondary && (
        <div className={`leading-snug ${isLight ? 'text-slate-700' : 'text-slate-300'}`} style={{ fontSize: transEm }}>
          {translation}
        </div>
      )}
    </div>
  );

  return (
    <div className={`w-full rounded-2xl border px-3 pt-2 pb-2.5 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center gap-1 shrink-0">
          <button className={btn} onClick={onPrev} disabled={currentIndex <= 0} title="Previous line ( [ )">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className={btn} onClick={onReplay} disabled={!sub} title="Replay this line ( R )">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button className={btn} onClick={onNext} disabled={currentIndex >= total - 1} title="Next line ( ] )">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <span className="text-[10px] font-mono opacity-60">{total > 0 ? `${currentIndex + 1}/${total}` : ''}</span>

        <div className="flex items-center gap-1 ml-auto shrink-0">
          <button
            className={`${btn} flex items-center gap-1 text-xs font-semibold ${showTranslation ? (isLight ? '!bg-indigo-50 !border-indigo-300 !text-indigo-700' : '!bg-indigo-500/20 !border-indigo-500/50 !text-indigo-300') : ''}`}
            onClick={onToggleTranslation}
            aria-pressed={showTranslation}
            title={showTranslation ? 'Hide translation under the video' : 'Show translation under the video'}
          >
            <Languages className="w-4 h-4" />
            <span className="hidden sm:inline">{showTranslation ? 'Translation' : 'Translation off'}</span>
          </button>
          <button className={btn} onClick={() => onFontStep(-1)} disabled={step <= 0} title="Smaller text">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>A</span>
          <button className={btn} onClick={() => onFontStep(1)} disabled={step >= 4} title="Larger text">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className={btn} disabled={!sub} onClick={() => sub && speakWord(sub.vocalizedText || sub.text, 'ar')} title="Hear this line">
            <Volume2 className="w-4 h-4" />
          </button>
          <button className={`${btn} ${isCurrentPinned ? 'text-amber-500' : ''}`} disabled={!sub} onClick={() => sub && onPinSentence(sub)} title={isCurrentPinned ? 'Saved' : 'Save this line'}>
            <Bookmark className={`w-4 h-4 ${isCurrentPinned ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Text: fixed height, auto-shrinks, never scrolls */}
      <div ref={boxRef} className="overflow-hidden flex items-center" style={{ height: boxHeight }}>
        <div ref={contentRef} className="w-full" style={{ fontSize: ARABIC_PX[step] }}>
          {sub ? (
            sideBySide ? (
              <div dir="rtl" className="flex items-center gap-4">
                <div className="basis-[60%] min-w-0">{arabicBlock}</div>
                <div dir="ltr" className={`basis-[40%] min-w-0 border-l pl-4 ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                  {secondaryBlock}
                </div>
              </div>
            ) : (
              <>
                {arabicBlock}
                {secondaryBlock}
              </>
            )
          ) : (
            <div className="text-sm opacity-70">No captions yet. Paste a YouTube link above.</div>
          )}
        </div>
      </div>
    </div>
  );
};
