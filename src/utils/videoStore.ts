/**
 * Saved videos, words and sentences live in IndexedDB, which has a far larger
 * quota than localStorage. Everything is loaded into memory once at startup so
 * the rest of the app can keep reading it synchronously.
 */
import { CuratedVideo, SavedSentence, SavedWord } from '../types';

const DB_NAME = 'polytube';
const DB_VERSION = 2;
const VIDEOS = 'videos';
const WORDS = 'words';
const SENTENCES = 'sentences';
const LEGACY_VIDEOS_KEY = 'polytube_dynamic_curated_videos';
const LEGACY_WORDS_KEY = 'polytube_arabic_vocabulary_v1';
const LEGACY_SENTENCES_KEY = 'polytube_arabic_sentences_v1';

let videos: CuratedVideo[] = [];
let words: SavedWord[] = [];
let sentences: SavedSentence[] = [];
let db: IDBDatabase | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      for (const name of [VIDEOS, WORDS, SENTENCES]) {
        if (!req.result.objectStoreNames.contains(name)) req.result.createObjectStore(name, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function readAll<T>(database: IDBDatabase, store: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const req = database.transaction(store, 'readonly').objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

function putOne(store: string, item: object) {
  if (!db) return;
  try {
    db.transaction(store, 'readwrite').objectStore(store).put(item);
  } catch (err) {
    console.warn(`Could not save to ${store}:`, err);
  }
}

function replaceAll(store: string, items: object[]) {
  if (!db) return;
  try {
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    os.clear();
    items.forEach(i => os.put(i));
  } catch (err) {
    console.warn(`Could not save ${store}:`, err);
  }
}

function readLegacy<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

/** Call once before the app renders. Never throws: falls back to memory only. */
export async function initVideoStore(): Promise<void> {
  try {
    db = await openDb();
    videos = await readAll<CuratedVideo>(db, VIDEOS);
    words = await readAll<SavedWord>(db, WORDS);
    sentences = await readAll<SavedSentence>(db, SENTENCES);

    // Move data saved by older versions out of localStorage
    for (const v of readLegacy<CuratedVideo>(LEGACY_VIDEOS_KEY)) {
      if (!videos.some(m => m.id === v.id)) {
        videos.push(v);
        putOne(VIDEOS, v);
      }
    }
    if (words.length === 0) {
      words = readLegacy<SavedWord>(LEGACY_WORDS_KEY);
      words.forEach(w => putOne(WORDS, w));
    }
    if (sentences.length === 0) {
      sentences = readLegacy<SavedSentence>(LEGACY_SENTENCES_KEY);
      sentences.forEach(s => putOne(SENTENCES, s));
    }
    for (const k of [LEGACY_VIDEOS_KEY, LEGACY_WORDS_KEY, LEGACY_SENTENCES_KEY]) {
      try {
        localStorage.removeItem(k);
      } catch {}
    }
  } catch (err) {
    console.warn('IndexedDB unavailable, data will not persist:', err);
    db = null;
  }
}

// ---------- videos ----------

export function getStoredVideos(): CuratedVideo[] {
  return videos;
}

export function putStoredVideo(video: CuratedVideo): void {
  videos = [video, ...videos.filter(v => v.id !== video.id)];
  putOne(VIDEOS, video);
}

export function deleteStoredVideo(id: string): void {
  videos = videos.filter(v => v.id !== id);
  if (!db) return;
  try {
    db.transaction(VIDEOS, 'readwrite').objectStore(VIDEOS).delete(id);
  } catch (err) {
    console.warn('Could not delete video:', err);
  }
}

export function clearStoredVideos(): void {
  videos = [];
  if (!db) return;
  try {
    db.transaction(VIDEOS, 'readwrite').objectStore(VIDEOS).clear();
  } catch (err) {
    console.warn('Could not clear videos:', err);
  }
}

// ---------- saved words and sentences ----------

export function getStoredWords(): SavedWord[] {
  return words;
}

export function getStoredSentences(): SavedSentence[] {
  return sentences;
}

let wordTimer: number | undefined;
let sentenceTimer: number | undefined;

/** Stores the whole list (debounced): lists are small and this keeps writes simple. */
export function saveWordsSnapshot(list: SavedWord[]): void {
  words = list;
  window.clearTimeout(wordTimer);
  wordTimer = window.setTimeout(() => replaceAll(WORDS, list), 300);
}

export function saveSentencesSnapshot(list: SavedSentence[]): void {
  sentences = list;
  window.clearTimeout(sentenceTimer);
  sentenceTimer = window.setTimeout(() => replaceAll(SENTENCES, list), 300);
}
