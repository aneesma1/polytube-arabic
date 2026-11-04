/**
 * Example sentences from Tatoeba (free, CC BY 2.0 FR). The service is marked
 * "unstable" by its authors, so every failure is handled quietly.
 */
import { removeTashkeel } from './arabic';

export interface Example {
  id: number;
  arabic: string;
  translation: string;
}

const CACHE_KEY = 'polytube_tatoeba_v1';
const CACHE_MAX = 150;

function readCache(): Record<string, Example[]> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeCache(key: string, value: Example[]) {
  try {
    const cache = readCache();
    delete cache[key];
    cache[key] = value;
    const keys = Object.keys(cache);
    if (keys.length > CACHE_MAX) for (const k of keys.slice(0, keys.length - CACHE_MAX)) delete cache[k];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

/** Returns up to `limit` short Arabic sentences using the word, with English translations. */
export async function fetchExamples(word: string, limit = 5): Promise<Example[]> {
  const q = removeTashkeel(word).replace(/[^ء-ي]/g, '');
  if (q.length < 2) return [];

  const cached = readCache()[q];
  if (cached) return cached.slice(0, limit);

  const url =
    `https://api.tatoeba.org/unstable/sentences?lang=ara&q=${encodeURIComponent(q)}` +
    `&trans:lang=eng&showtrans:lang=eng&sort=relevance&limit=${Math.max(limit, 5)}`;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 10000);
  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('Examples did not load in time.');
    throw e;
  } finally {
    window.clearTimeout(timer);
  }
  if (res.status === 429) throw new Error('Examples are busy right now. Try again in a minute.');
  if (!res.ok) throw new Error('Examples are unavailable right now.');
  const data = await res.json();

  const out: Example[] = (data?.data ?? [])
    .map((s: any) => ({
      id: Number(s.id),
      arabic: String(s.text || ''),
      translation: String((s.translations ?? []).find((t: any) => t.lang === 'eng')?.text || ''),
    }))
    .filter((e: Example) => e.arabic && e.translation);

  writeCache(q, out);
  return out.slice(0, limit);
}
