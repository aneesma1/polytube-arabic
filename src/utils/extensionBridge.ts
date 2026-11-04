/**
 * Bridge to the PolyTube Caption Bridge Chrome extension.
 * The extension's content script listens for window messages from this page
 * and answers with the caption cues it fetched from YouTube.
 */

export interface ExtensionCue {
  start: number;
  end: number;
  text: string;
}

export interface ExtensionCuesResult {
  ok: boolean;
  error?: string;
  videoId?: string;
  title?: string;
  channel?: string;
  /** Reference details read from the player data (extension 0.3.0 and newer) */
  info?: { uploadDate?: string; durationSec?: number; description?: string; channelUrl?: string };
  lang?: string;
  kind?: string;
  available?: { languageCode: string; name: string; kind: string }[];
  cues?: ExtensionCue[];
  debug?: { via: string; attempts: { lang: string; via: string; how: string; lines: number }[] };
  /** Translations by language code; source tells manual captions from YouTube machine translation */
  translations?: Record<string, { cues: ExtensionCue[]; source: 'manual' | 'youtube-machine' }>;
}

let nextReqId = 1;

function request<T>(type: string, payload: object, timeoutMs: number): Promise<T | null> {
  return new Promise(resolve => {
    const reqId = nextReqId++;
    const timer = window.setTimeout(() => {
      window.removeEventListener('message', onMessage);
      resolve(null);
    }, timeoutMs);

    function onMessage(event: MessageEvent) {
      if (event.source !== window) return;
      const msg = event.data;
      if (!msg || msg.source !== 'polytube-ext' || msg.reqId !== reqId) return;
      window.clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      resolve(msg as T);
    }

    window.addEventListener('message', onMessage);
    window.postMessage({ source: 'polytube-app', type, reqId, ...payload }, window.location.origin);
  });
}

/** True if the extension answers within a short window. */
export async function isExtensionAvailable(): Promise<boolean> {
  const pong = await request<{ type: string }>('PING', {}, 700);
  return !!pong && pong.type === 'PONG';
}

/** Version of the installed extension, or null if it is not installed or not responding. */
export async function getExtensionVersion(): Promise<string | null> {
  const pong = await request<{ type: string; version?: string }>('PING', {}, 700);
  return pong && pong.type === 'PONG' ? pong.version ?? '0.0.0' : null;
}

/** True when version a is at least version b (simple dotted numbers). */
export function versionAtLeast(a: string, b: string): boolean {
  const pa = a.split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) > (pb[i] ?? 0);
  }
  return true;
}

/** Ask the extension for captions. Returns null if it is not installed or times out. */
export async function requestCuesFromExtension(
  videoId: string,
  lang: string,
  transLangs: string[]
): Promise<ExtensionCuesResult | null> {
  if (!(await isExtensionAvailable())) return null;
  const res = await request<ExtensionCuesResult & { type: string }>(
    'GET_CUES',
    { videoId, lang, transLangs },
    60000
  );
  return res ?? { ok: false, error: 'The extension did not respond in time.' };
}
