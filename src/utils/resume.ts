/** Remembers the last video and where you stopped in each one. */

const LAST_KEY = 'polytube_last_video_v1';
const PROGRESS_KEY = 'polytube_progress_v1';
const MAX_ENTRIES = 300;

export interface Progress {
  t: number; // seconds
  dur: number; // total seconds, 0 if unknown
  at: number; // when saved
}

function readProgress(): Record<string, Progress> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveProgress(videoId: string, t: number, dur: number): void {
  if (!videoId || !Number.isFinite(t)) return;
  try {
    const all = readProgress();
    delete all[videoId];
    all[videoId] = { t: Math.max(0, Math.floor(t)), dur: Math.floor(dur || 0), at: Date.now() };
    const keys = Object.keys(all);
    if (keys.length > MAX_ENTRIES) for (const k of keys.slice(0, keys.length - MAX_ENTRIES)) delete all[k];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
    localStorage.setItem(LAST_KEY, videoId);
  } catch {}
}

export function getProgress(videoId: string): Progress | null {
  return readProgress()[videoId] ?? null;
}

export function getAllProgress(): Record<string, Progress> {
  return readProgress();
}

export function mergeProgress(incoming: Record<string, Progress>): void {
  try {
    const all = readProgress();
    for (const [id, p] of Object.entries(incoming)) {
      if (!all[id] || all[id].at < p.at) all[id] = p;
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {}
}

/** Remember which video is open right now, even before any playback time is recorded. */
export function rememberVideo(videoId: string): void {
  try {
    localStorage.setItem(LAST_KEY, videoId);
  } catch {}
}

export function getLastVideoId(): string | null {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
}

/** A video id in the page address wins over the remembered one: #v=ID or ?v=ID */
export function videoIdFromAddress(): { id: string; t: number } | null {
  try {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const query = new URLSearchParams(window.location.search);
    const id = hash.get('v') || query.get('v');
    if (id && /^[\w-]{11}$/.test(id)) {
      return { id, t: Number(hash.get('t') || query.get('t')) || 0 };
    }
  } catch {}
  return null;
}
