/**
 * Free dictionary lookup via Wiktionary (no key needed, CORS-enabled).
 * Gives real definitions and, when the entry has one, the real root.
 * Inflected forms (ال, و, ب, pronoun suffixes ...) are tried by stripping
 * affixes until an entry is found. Results are cached in localStorage.
 */
import { removeTashkeel } from './arabic';

export interface DictEntry {
  pos: string;
  definitions: string[];
}

export interface DictResult {
  found: boolean;
  /** The form that matched on Wiktionary (may differ from the clicked word) */
  matched?: string;
  root?: string; // e.g. ن-ق-ل
  entries: DictEntry[];
}

const CACHE_KEY = 'polytube_dict_cache_v1';
const CACHE_MAX = 800;
const NEGATIVE_TTL_MS = 7 * 24 * 3600 * 1000;

type CacheRecord = { at: number; result: DictResult };

function readCache(): Record<string, CacheRecord> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeCache(key: string, result: DictResult) {
  try {
    const cache = readCache();
    delete cache[key];
    cache[key] = { at: Date.now(), result };
    const keys = Object.keys(cache);
    if (keys.length > CACHE_MAX) for (const k of keys.slice(0, keys.length - CACHE_MAX)) delete cache[k];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

/** Likely base forms of an inflected word, most specific first. */
export function candidateForms(raw: string): string[] {
  const w = removeTashkeel(raw).replace(/[^ء-ي]/g, '');
  const out: string[] = [];
  const add = (x: string) => {
    if (x.length >= 2 && !out.includes(x)) out.push(x);
  };
  // Captions often write ة as ه: try the ة spelling first, then the original
  const spellings = (x: string) => (x.endsWith('ه') ? [x.slice(0, -1) + 'ة', x] : [x]);

  const prefixes = ['وال', 'فال', 'بال', 'كال', 'لل', 'ال', 'و', 'ف', 'ب', 'ل', 'ك'];
  const suffixes = ['ها', 'هم', 'هن', 'كم', 'نا', 'ني', 'ك', 'ي', 'ه'];

  // 1. The word and prefix-stripped stems, with spelling variants, before any suffix stripping
  const stems = [w];
  for (const p of prefixes) {
    if (w.startsWith(p) && w.length - p.length >= 2) stems.push(w.slice(p.length));
  }
  for (const stem of stems) spellings(stem).forEach(add);

  // 2. Plural and pronoun-suffix forms, last because they are the least certain
  for (const stem of stems) {
    if (stem.endsWith('ات') && stem.length > 4) add(stem.slice(0, -2) + 'ة');
    if (stem.endsWith('ون') || stem.endsWith('ين')) add(stem.slice(0, -2));
    for (const suf of suffixes) {
      if (stem.endsWith(suf) && stem.length - suf.length >= 2) spellings(stem.slice(0, -suf.length)).forEach(add);
    }
  }
  return out.slice(0, 6);
}

// All lookups of one word share a 10 second limit, so the pop-up can never wait forever
let activeSignal: AbortSignal | undefined;
const wfetch = (url: string) => fetch(url, { signal: activeSignal });

function stripHtml(html: string): string {
  return html
    // drop <style> blocks entirely, including their CSS text
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    // safety net: any CSS rule that still leaked through as text
    .replace(/\.mw-parser-output[^{}]*\{[^{}]*\}/g, '')
    .replace(/\.[\w-]+(?:\s+\.[\w-]+)*\s*\{[^{}]*\}/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchDefinition(form: string): Promise<DictEntry[]> {
  const res = await wfetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(form)}`);
  if (res.status === 429) throw new Error('The dictionary is busy (too many requests). Wait a minute and try again.');
  if (res.status >= 500) throw new Error('The dictionary service is having trouble. Try again shortly.');
  if (!res.ok) return [];
  const data = await res.json();
  const arabic: any[] = data?.ar ?? [];
  const entries: DictEntry[] = arabic
    .map(e => ({
      pos: String(e.partOfSpeech || ''),
      definitions: (e.definitions || [])
        .map((d: any) => stripHtml(String(d.definition || '')))
        .filter((d: string) => d.length > 0)
        .slice(0, 4),
    }))
    .filter(e => e.definitions.length > 0)
    .map((e: DictEntry) => {
      const real = e.definitions.filter((d: string) => !/(first|second|third)-person|inflection of/i.test(d) && !/^(inflection|plural|feminine|masculine|dual|singular|first-person|second-person|third-person)\b.*\bof\b/i.test(d));
      return real.length > 0 ? { ...e, definitions: real } : e;
    })
    .slice(0, 4);

  // Entries made only of conjugation forms ("third-person dual past active ...") are noise
  const isForm = (d: string) =>
    /(first|second|third)-person|\binflection of\b|\b(non-)?past (active|passive)\b|\bimperative\b|\bdual\b.*\b(active|passive)\b/i.test(d);
  const useful = entries.filter(e => !e.definitions.every(isForm));
  return useful.length > 0 ? useful : entries;
}

async function fetchRoot(form: string): Promise<string | undefined> {
  try {
    const res = await wfetch(
      `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(form)}&prop=wikitext&format=json&origin=*`
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    const text: string = data?.parse?.wikitext?.['*'] ?? '';
    const arabicPart = text.split('==Arabic==')[1] ?? '';
    const m = arabicPart.match(/\{\{ar-rootbox\|([^}|]+)/);
    if (!m) return undefined;
    const letters = m[1].trim().split(/\s+/).filter(Boolean);
    return letters.length >= 3 ? letters.join('-') : undefined;
  } catch {
    return undefined;
  }
}

export async function lookupDictionary(word: string): Promise<DictResult> {
  const forms = candidateForms(word);
  const key = forms[0];
  if (!key) return { found: false, entries: [] };

  const hit = readCache()[key];
  if (hit && (hit.result.found || Date.now() - hit.at < NEGATIVE_TTL_MS)) return hit.result;

  const controller = new AbortController();
  activeSignal = controller.signal;
  const timer = window.setTimeout(() => controller.abort(), 10000);
  try {
    for (const form of forms) {
      const known = readCache()[`form|${form}`];
      if (known && !known.result.found && Date.now() - known.at < NEGATIVE_TTL_MS) continue;
      const entries = await fetchDefinition(form);
      if (entries.length === 0) writeCache(`form|${form}`, { found: false, entries: [] });
      if (entries.length > 0) {
        const root = await fetchRoot(form);
        const result: DictResult = { found: true, matched: form, root, entries };
        writeCache(key, result);
        return result;
      }
    }
    const miss: DictResult = { found: false, entries: [] };
    writeCache(key, miss);
    return miss;
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new Error('The dictionary did not answer in time. Try again, or use the dictionaries menu.');
    // Rate-limited, offline or blocked: never cache this as not found
    const msg = String(err?.message || '');
    throw new Error(msg.startsWith('The dictionary') ? msg : 'Could not reach the dictionary. Check your connection.');
  } finally {
    window.clearTimeout(timer);
  }
}

export function dictionaryLinks(word: string, matched?: string) {
  const w = encodeURIComponent(removeTashkeel(matched || word));
  return [
    { label: 'Wiktionary', url: `https://en.wiktionary.org/wiki/${w}#Arabic` },
    { label: 'Almaany', url: `https://www.almaany.com/ar/dict/ar-en/${w}/` },
    { label: 'Google Translate', url: `https://translate.google.com/?sl=ar&tl=en&text=${w}&op=translate` },
  ];
}
