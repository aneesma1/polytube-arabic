import { SubtitleItem } from '../types';
import { ExtensionCue } from './extensionBridge';
import { transliterateArabicText } from './youtubeCaptionFetcher';

const SENTENCE_END = /[.!?؟۔…]["'”»)\]]*$/;

interface MergeOptions {
  maxGapSec: number;     // a pause longer than this always starts a new sentence
  maxDurationSec: number; // force a break when a chunk gets this long
  maxChars: number;       // ...or this many characters
}

const DEFAULTS: MergeOptions = { maxGapSec: 1.2, maxDurationSec: 9, maxChars: 130 };

/**
 * Joins caption fragments into sentence-sized lines. Auto captions often split
 * mid-sentence and carry no punctuation, so breaks also come from long pauses
 * and a length cap. Translation text is joined the same way.
 */
export function mergeIntoSentences(
  items: SubtitleItem[],
  opts: Partial<MergeOptions> = {}
): SubtitleItem[] {
  const o = { ...DEFAULTS, ...opts };
  const out: SubtitleItem[] = [];
  let cur: SubtitleItem | null = null;

  const flush = () => {
    if (cur) out.push(cur);
    cur = null;
  };

  for (const item of items) {
    if (!cur) {
      cur = { ...item };
    } else {
      const gap = item.start - cur.end;
      const wouldBeLong =
        item.end - cur.start > o.maxDurationSec || (cur.text + ' ' + item.text).length > o.maxChars;
      if (gap > o.maxGapSec || wouldBeLong) {
        flush();
        cur = { ...item };
      } else {
        cur.end = item.end;
        cur.text = `${cur.text} ${item.text}`;
        cur.vocalizedText = `${cur.vocalizedText ?? cur.text} ${item.vocalizedText ?? item.text}`;
        cur.transliteration = `${cur.transliteration ?? ''} ${item.transliteration ?? ''}`.trim();
        if (item.translations) {
          const merged = { ...(cur.translations ?? {}) };
          for (const [code, text] of Object.entries(item.translations)) {
            const have = merged[code] ?? '';
            merged[code] = !have ? text : have.includes(text) ? have : `${have} ${text}`;
          }
          cur.translations = merged;
        }
        if (item.translation && item.translation !== '—') {
          const have = cur.translation && cur.translation !== '—' ? cur.translation : '';
          if (!have) cur.translation = item.translation;
          else if (!have.includes(item.translation)) cur.translation = `${have} ${item.translation}`;
        }
      }
    }
    if (cur && SENTENCE_END.test(cur.text)) flush();
  }
  flush();

  return out.map((s, i) => ({ ...s, id: i + 1 }));
}

/** Translation cues whose midpoint falls inside this caption cue. */
function matchTranslation(cue: ExtensionCue, transCues: ExtensionCue[]): string {
  const matches = transCues.filter(t => {
    const mid = (t.start + t.end) / 2;
    return mid >= cue.start && mid < cue.end;
  });
  const near = matches.length ? matches : transCues.filter(t => Math.abs(t.start - cue.start) < 0.8).slice(0, 1);
  return near.map(t => t.text).join(' ');
}

/** Pairs each caption cue with its translations (one entry per language). */
export function buildSubtitleItems(
  cues: ExtensionCue[],
  translations: Record<string, ExtensionCue[]>
): SubtitleItem[] {
  return cues.map((cue, idx) => {
    const perLang: Record<string, string> = {};
    for (const [code, tc] of Object.entries(translations)) {
      const text = matchTranslation(cue, tc);
      if (text) perLang[code] = text;
    }
    const first = Object.values(perLang)[0];
    return {
      id: idx + 1,
      start: Math.round(cue.start * 100) / 100,
      end: Math.round(cue.end * 100) / 100,
      text: cue.text,
      vocalizedText: cue.text,
      transliteration: transliterateArabicText(cue.text),
      translation: first ?? '—',
      translations: perLang,
      notes: '',
    };
  });
}

/** Adds one more language to already-built items (used when a chip is added later). */
export function attachTranslation(items: SubtitleItem[], code: string, transCues: ExtensionCue[]): SubtitleItem[] {
  return items.map(item => {
    const text = matchTranslation(item, transCues);
    return text ? { ...item, translations: { ...(item.translations ?? {}), [code]: text } } : item;
  });
}
