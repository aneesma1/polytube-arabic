/**
 * Optional AI helper. The app works without it; when a key is saved, it adds
 * "explain this word" and "prepare this video" (vowel marks + phonetics).
 *
 * Keys live only in this browser's localStorage and are sent only to the
 * chosen provider. Supported: Gemini, plus any OpenAI-compatible chat API.
 */

export type ProviderId = 'gemini' | 'groq' | 'openrouter' | 'mistral' | 'cerebras' | 'custom';

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  baseUrl: string; // OpenAI-compatible base URL (unused for gemini)
  defaultModel: string;
  keyUrl: string;
  note: string;
}

export const PROVIDERS: ProviderInfo[] = [
  { id: 'gemini', label: 'Google Gemini', baseUrl: '', defaultModel: 'gemini-3.8-flash', keyUrl: 'https://aistudio.google.com/apikey', note: 'Free tier with daily limits. Best Arabic quality of the free options.' },
  { id: 'groq', label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile', keyUrl: 'https://console.groq.com/keys', note: 'Free tier, very fast. Arabic grammar may be weaker.' },
  { id: 'openrouter', label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'meta-llama/llama-3.3-70b-instruct:free', keyUrl: 'https://openrouter.ai/keys', note: 'One key, many models. Free models have a small daily cap.' },
  { id: 'mistral', label: 'Mistral', baseUrl: 'https://api.mistral.ai/v1', defaultModel: 'mistral-small-latest', keyUrl: 'https://console.mistral.ai/api-keys', note: 'Free tier available.' },
  { id: 'cerebras', label: 'Cerebras', baseUrl: 'https://api.cerebras.ai/v1', defaultModel: 'llama-3.3-70b', keyUrl: 'https://cloud.cerebras.ai', note: 'Free tier; small context window.' },
  { id: 'custom', label: 'Custom (OpenAI-compatible)', baseUrl: '', defaultModel: '', keyUrl: '', note: 'Any service with a /chat/completions endpoint.' },
];

export interface AiSettings {
  provider: ProviderId;
  keys: Partial<Record<ProviderId, string>>;
  models: Partial<Record<ProviderId, string>>;
  customBaseUrl: string;
}

const SETTINGS_KEY = 'polytube_ai_settings_v1';
const LEGACY_GEMINI_KEY = 'polytube_gemini_api_key';
const CACHE_KEY = 'polytube_ai_cache_v1';
const CACHE_MAX_ENTRIES = 600;

const DEFAULT_SETTINGS: AiSettings = { provider: 'gemini', keys: {}, models: {}, customBaseUrl: '' };

export function loadAiSettings(): AiSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    const legacy = localStorage.getItem(LEGACY_GEMINI_KEY);
    if (legacy) return { ...DEFAULT_SETTINGS, keys: { gemini: legacy } };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveAiSettings(settings: AiSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export function isAiConfigured(): boolean {
  const s = loadAiSettings();
  return Boolean((s.keys[s.provider] || '').trim());
}

export const AI_NOT_CONFIGURED_MESSAGE =
  'AI is optional and not set up. Add a free key in Settings > AI to enable this. Everything else works without it.';

export interface AiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  notConfigured?: boolean;
}

/** Pull the first JSON object/array out of a model reply, tolerating code fences. */
function parseJsonLoose(text: string): any {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.search(/[\[{]/);
    const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('The model did not return valid JSON.');
  }
}

export class AiTimeoutError extends Error {}

/** Errors that mean the provider is busy right now, not that the key or request is wrong. */
const TEMPORARY_ERROR = /high demand|overloaded|currently unavailable|try again later|\b503\b|capacity/i;

/** fetch that gives up after ms milliseconds instead of waiting forever. */
async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new AiTimeoutError(
        `The provider did not answer within ${Math.round(ms / 1000)} seconds. Try a faster model (a "flash" or "lite" one), or check your connection.`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(apiKey: string, model: string, prompt: string, timeoutMs: number): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const send = (thinkingOff: boolean) =>
    fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            // These are short, simple tasks: skip slow reasoning where the model allows it
            ...(thinkingOff ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
          },
        }),
      },
      timeoutMs
    );

  let res = await send(true);
  if (res.status === 400) res = await send(false); // this model does not accept the thinking setting
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini returned status ${res.status}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini.');
  return text;
}

async function callOpenAiCompatible(baseUrl: string, apiKey: string, model: string, prompt: string, timeoutMs: number): Promise<string> {
  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
  const send = (withJsonMode: boolean) =>
    fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are an expert Arabic linguist. Reply with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        ...(withJsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    }, timeoutMs);

  let res = await send(true);
  if (res.status === 400) res = await send(false); // some models reject json mode
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Provider returned status ${res.status}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from provider.');
  return text;
}

/** Send a prompt to the configured provider and parse the JSON reply. */
export async function aiJson<T>(prompt: string, override?: AiSettings, timeoutMs = 90000): Promise<AiResult<T>> {
  const s = override ?? loadAiSettings();
  const info = PROVIDERS.find(p => p.id === s.provider) ?? PROVIDERS[0];
  const apiKey = (s.keys[s.provider] || '').trim();
  if (!apiKey) return { ok: false, notConfigured: true, error: AI_NOT_CONFIGURED_MESSAGE };

  const model = (s.models[s.provider] || info.defaultModel).trim();
  const baseUrl = s.provider === 'custom' ? s.customBaseUrl : info.baseUrl;
  if (s.provider !== 'gemini' && !baseUrl) return { ok: false, error: 'Set the provider URL in Settings > AI.' };
  if (!model) return { ok: false, error: 'Set a model name in Settings > AI.' };

  try {
    const call = () =>
      s.provider === 'gemini'
        ? callGemini(apiKey, model, prompt, timeoutMs)
        : callOpenAiCompatible(baseUrl, apiKey, model, prompt, timeoutMs);
    let text: string;
    try {
      text = await call();
    } catch (e: any) {
      // Busy providers usually recover within seconds: try once more before giving up
      if (TEMPORARY_ERROR.test(String(e?.message))) {
        await new Promise(r => setTimeout(r, 1500));
        text = await call();
      } else {
        throw e;
      }
    }
    return { ok: true, data: parseJsonLoose(text) as T };
  } catch (err: any) {
    let msg = String(err?.message || err);
    if (/no longer available|not found|is not supported|deprecated/i.test(msg)) {
      msg += ' Pick another model in Settings > AI (use Test key to list the models your key can use).';
    }
    const network = /Failed to fetch|NetworkError|Load failed/i.test(msg);
    return {
      ok: false,
      error: network
        ? 'Could not reach the AI provider (network or browser restriction). Check your connection, or try another provider.'
        : msg,
    };
  }
}

// ---- small persistent cache so repeated questions cost nothing ----

type CacheMap = Record<string, unknown>;

function readCache(): CacheMap {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getCached<T>(key: string): T | undefined {
  return readCache()[key] as T | undefined;
}

export function setCached(key: string, value: unknown): void {
  try {
    const cache = readCache();
    delete cache[key];
    cache[key] = value;
    const keys = Object.keys(cache);
    if (keys.length > CACHE_MAX_ENTRIES) {
      for (const k of keys.slice(0, keys.length - CACHE_MAX_ENTRIES)) delete cache[k];
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

// ---- feature 1: explain a word in context ----

export interface WordExplanation {
  root?: string | null;
  pattern?: string | null;
  partOfSpeech?: string | null;
  meaning?: string | null;
  contextExplanation?: string | null;
  collocations?: string[];
}

export async function explainWord(
  word: string,
  sentence: string,
  nativeLang: string
): Promise<AiResult<WordExplanation>> {
  const cacheKey = `word2|${nativeLang}|${word}|${sentence.slice(0, 80)}`;
  const hit = getCached<WordExplanation>(cacheKey);
  if (hit) return { ok: true, data: hit };

  const prompt = `Analyze this Arabic word for a learner whose native language is ${nativeLang}.
LANGUAGE RULE: write every explanation in ${nativeLang}. The only other language allowed is English, and only where a field says so. Never use Hindi or any other language unless it is ${nativeLang}.
Word: "${word}"
Sentence: "${sentence}"

Reply with JSON only:
{"root":"3 or 4 letters separated by hyphens, e.g. ن-ق-ل (the root of the base word, ignoring prefixes like ال, و, ب, ل)",
 "pattern":"the morphological pattern (wazn) of the base word, or null",
 "partOfSpeech":"noun, verb, adjective, particle, ...",
 "meaning":"short meaning in ${nativeLang}, then the English meaning in brackets, as used in this sentence",
 "contextExplanation":"one or two sentences in ${nativeLang} on how the word works in this sentence",
 "collocations":["up to 3 common phrases using it"]}
If you are not sure about a field, use null. Never invent a root.`;

  const res = await aiJson<WordExplanation>(prompt);
  if (res.ok && res.data) setCached(cacheKey, res.data);
  return res;
}

// ---- feature 2: prepare a whole video (vowel marks + phonetics) ----

export interface PreparedLine {
  id: number;
  vocalized: string;
  phonetic: string;
}

const PREPARE_CHUNK = 30;

export async function prepareLines(
  videoId: string,
  lines: { id: number; text: string }[],
  onProgress?: (done: number, total: number) => void
): Promise<AiResult<Record<number, PreparedLine>>> {
  const out: Record<number, PreparedLine> = {};
  const todo: { id: number; text: string }[] = [];

  for (const line of lines) {
    const hit = getCached<PreparedLine>(`line|${videoId}|${line.id}|${line.text.slice(0, 40)}`);
    if (hit) out[line.id] = hit;
    else todo.push(line);
  }
  onProgress?.(lines.length - todo.length, lines.length);

  for (let i = 0; i < todo.length; i += PREPARE_CHUNK) {
    const chunk = todo.slice(i, i + PREPARE_CHUNK);
    const prompt = `Add full Arabic vowel marks (tashkeel) and a Latin phonetic transliteration to each line.
Keep the words exactly as given; only add diacritics. Transliteration should be readable (e.g. "mintaqatun sifriyyah").
Lines (JSON): ${JSON.stringify(chunk)}

Reply with JSON only: {"lines":[{"id":<same id>,"vocalized":"...","phonetic":"..."}]}`;

    const res = await aiJson<{ lines: PreparedLine[] }>(prompt);
    if (!res.ok || !res.data?.lines) {
      return { ok: false, notConfigured: res.notConfigured, error: res.error || 'Preparation failed.', data: out };
    }
    for (const p of res.data.lines) {
      const src = chunk.find(c => c.id === p.id);
      if (!src || !p.vocalized) continue;
      out[p.id] = p;
      setCached(`line|${videoId}|${p.id}|${src.text.slice(0, 40)}`, p);
    }
    onProgress?.(Math.min(lines.length, lines.length - todo.length + i + chunk.length), lines.length);
  }
  return { ok: true, data: out };
}

/** Reads prepared lines for a video from the cache in one pass. */
export function loadPreparedFromCache(
  videoId: string,
  lines: { id: number; text: string }[]
): Record<number, PreparedLine> {
  const cache = readCache();
  const out: Record<number, PreparedLine> = {};
  for (const line of lines) {
    const hit = cache[`line|${videoId}|${line.id}|${line.text.slice(0, 40)}`] as PreparedLine | undefined;
    if (hit) out[line.id] = hit;
  }
  return out;
}

// ---- key test + model list (used by Settings, works on unsaved values) ----

/** Fast, cheap models first: these suit the short requests this app makes. */
function rankModels(models: string[]): string[] {
  const bad = /image|tts|live|audio|embed|robotics|computer|vision-exp|learnlm|thinking/i;
  const ok = models.filter(m => !bad.test(m));
  const lite = ok.filter(m => /lite/i.test(m));
  const flash = ok.filter(m => /flash/i.test(m) && !/lite/i.test(m));
  return [...lite, ...flash];
}

export interface AiTestResult {
  ok: boolean;
  message: string;
  /** The model that answered, when it differs from the one chosen */
  workingModel?: string;
}

export async function testAiConnection(
  settings: AiSettings,
  availableModels: string[] = [],
  onProgress?: (text: string) => void
): Promise<AiTestResult> {
  const info = PROVIDERS.find(p => p.id === settings.provider) ?? PROVIDERS[0];
  const chosen = (settings.models[settings.provider] || info.defaultModel).trim();
  const label = info.label;

  const tryModel = async (model: string, timeoutMs: number) => {
    onProgress?.(`Trying ${model}...`);
    return aiJson<{ ok?: boolean }>(
      'Reply with exactly this JSON and nothing else: {"ok": true}',
      { ...settings, models: { ...settings.models, [settings.provider]: model } },
      timeoutMs
    );
  };

  const first = await tryModel(chosen, 20000);
  if (first.ok) return { ok: true, message: `Key works (${label}, ${chosen}).` };
  if (first.notConfigured) return { ok: false, message: 'Paste a key first.' };

  // The key may be fine while this one model is slow, retired, or not allowed: try faster ones
  const timedOut = /did not answer/i.test(first.error || '');
  const modelProblem =
    timedOut ||
    TEMPORARY_ERROR.test(first.error || '') ||
    /no longer available|not found|not supported|permission|deprecated/i.test(first.error || '');
  if (modelProblem && availableModels.length > 0) {
    for (const m of rankModels(availableModels).filter(x => x !== chosen).slice(0, 3)) {
      const r = await tryModel(m, 15000);
      if (r.ok) {
        return {
          ok: true,
          workingModel: m,
          message: `Your key works. "${chosen}" did not respond, so the model was switched to "${m}". Press Save to keep it.`,
        };
      }
    }
    return {
      ok: false,
      message: `Your key is valid (${availableModels.length} models found), but none of the models I tried could answer right now. ${first.error ?? ''} Wait a few minutes and press Test key again.`,
    };
  }
  return { ok: false, message: first.error || 'The test failed.' };
}

/** Model ids this key can use, so the user can pick one that exists. */
export async function listAiModels(settings: AiSettings): Promise<string[]> {
  const info = PROVIDERS.find(p => p.id === settings.provider) ?? PROVIDERS[0];
  const apiKey = (settings.keys[settings.provider] || '').trim();
  if (!apiKey) return [];
  try {
    if (settings.provider === 'gemini') {
      const res = await fetchWithTimeout('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', {
        headers: { 'x-goog-api-key': apiKey },
      }, 15000);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.models ?? [])
        .filter((m: any) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
        .map((m: any) => String(m.name).replace(/^models\//, ''))
        .filter((n: string) => n.startsWith('gemini'));
    }
    const base = settings.provider === 'custom' ? settings.customBaseUrl : info.baseUrl;
    if (!base) return [];
    const res = await fetchWithTimeout(`${base.replace(/\/+$/, '')}/models`, { headers: { Authorization: `Bearer ${apiKey}` } }, 15000);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).map((m: any) => String(m.id)).slice(0, 200);
  } catch {
    return [];
  }
}

// ---- vowel marks for short example sentences ----

export async function vocalizeSentences(items: { id: number; text: string }[]): Promise<AiResult<Record<number, string>>> {
  const out: Record<number, string> = {};
  const todo: { id: number; text: string }[] = [];
  for (const it of items) {
    const hit = getCached<string>(`vox|${it.text}`);
    if (hit) out[it.id] = hit;
    else todo.push(it);
  }
  if (todo.length === 0) return { ok: true, data: out };

  const prompt = `Add full Arabic vowel marks (tashkeel) to each sentence. Keep every word exactly as written; only add diacritics.
Sentences (JSON): ${JSON.stringify(todo)}

Reply with JSON only: {"items":[{"id":<same id>,"text":"<sentence with vowel marks>"}]}`;

  const res = await aiJson<{ items: { id: number; text: string }[] }>(prompt);
  if (!res.ok || !res.data?.items) {
    return { ok: false, notConfigured: res.notConfigured, error: res.error || 'Could not add vowel marks.', data: out };
  }
  for (const r of res.data.items) {
    const src = todo.find(t => t.id === r.id);
    if (!src || !r.text) continue;
    out[r.id] = r.text;
    setCached(`vox|${src.text}`, r.text);
  }
  return { ok: true, data: out };
}
