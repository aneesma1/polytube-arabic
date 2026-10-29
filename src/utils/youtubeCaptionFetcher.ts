/**
 * Universal YouTube Subtitle & Caption Fetcher
 * Extracts authentic synchronized subtitles and translations for ANY YouTube video.
 */
import { SubtitleItem, CuratedVideo } from '../types';

const CHAR_MAP: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'ā', 'ء': '’', 'ؤ': '’', 'ئ': '’',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': '‘', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'ā', 'ة': 'ah',
  'َ': 'a', 'ُ': 'u', 'ِ': 'i', 'ً': 'an', 'ٌ': 'un', 'ٍ': 'in',
  'ّ': '', 'ْ': ''
};

export function transliterateArabicText(text: string): string {
  let res = '';
  for (const ch of text) {
    res += CHAR_MAP[ch] !== undefined ? CHAR_MAP[ch] : ch;
  }
  return res.replace(/\s+/g, ' ').trim();
}

export function parseXmlCues(xml: string): { start: number; end: number; text: string }[] {
  const cues: { start: number; end: number; text: string }[] = [];
  
  // Format 1: srv3 format (<p t="ms" d="ms">...)
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  while ((match = pRegex.exec(xml)) !== null) {
    const startMs = parseInt(match[1], 10);
    const durMs = parseInt(match[2], 10);
    const rawText = match[3]
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rlm;/g, '')
      .replace(/&lrm;/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (rawText && rawText !== '[موسيقى]' && rawText !== '[Music]') {
      cues.push({
        start: Math.round(startMs / 100) / 10,
        end: Math.round((startMs + durMs) / 100) / 10,
        text: rawText
      });
    }
  }

  // Format 2: Classic format (<text start="sec" dur="sec">...)
  if (cues.length === 0) {
    const textRegex = /<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
    while ((match = textRegex.exec(xml)) !== null) {
      const start = parseFloat(match[1]);
      const dur = parseFloat(match[2]);
      const rawText = match[3]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&rlm;/g, '')
        .replace(/&lrm;/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (rawText && rawText !== '[موسيقى]' && rawText !== '[Music]') {
        cues.push({
          start: Math.round(start * 10) / 10,
          end: Math.round((start + dur) * 10) / 10,
          text: rawText
        });
      }
    }
  }

  return cues;
}

export interface FetchSubtitlesResult {
  success: boolean;
  videoId: string;
  title: string;
  channel: string;
  subtitles: SubtitleItem[];
  error?: string;
}

/**
 * Universal Subtitle Fetcher for Client
 * Attempts to fetch subtitles via server API, direct timedtext, or CORS proxies with seamless error handling.
 */
export async function fetchUniversalSubtitles(
  videoId: string,
  targetLang: string = 'ar',
  transLang: string = 'en'
): Promise<FetchSubtitlesResult> {
  // 1. Try local server endpoint if running in hybrid mode
  const localEndpoints = [
    `/api/youtube/subtitles?videoId=${encodeURIComponent(videoId)}&targetLang=${encodeURIComponent(targetLang)}&transLang=${encodeURIComponent(transLang)}`,
    `http://localhost:3000/api/youtube/subtitles?videoId=${encodeURIComponent(videoId)}&targetLang=${encodeURIComponent(targetLang)}&transLang=${encodeURIComponent(transLang)}`
  ];

  for (const url of localEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.subtitles) && data.subtitles.length > 0) {
          return data;
        }
      }
    } catch {
      // Local server not running, continue to client-side fetching
    }
  }

  // 2. Client-side fetching on GitHub Pages via direct YouTube timedtext & CORS proxies
  const timedTextUrls = [
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${targetLang}&fmt=srv3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${targetLang}`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=a.${targetLang}&fmt=srv3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=a.${targetLang}`
  ];

  for (const directUrl of timedTextUrls) {
    const candidateUrls = [
      directUrl,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`
    ];

    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const xml = await res.text();
          if (xml && (xml.includes('<p ') || xml.includes('<text '))) {
            const cues = parseXmlCues(xml);
            if (cues.length > 0) {
              // Try fetching translated cues
              let transCues: { start: number; end: number; text: string }[] = [];
              if (transLang && transLang !== targetLang) {
                try {
                  const transUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${directUrl}&tlang=${transLang}`)}`;
                  const transRes = await fetch(transUrl, { signal: AbortSignal.timeout(4000) });
                  if (transRes.ok) {
                    const transXml = await transRes.text();
                    transCues = parseXmlCues(transXml);
                  }
                } catch {
                  // Translation optional
                }
              }

              const subtitles: SubtitleItem[] = cues.map((cue, idx) => {
                let translation = '—';
                if (transCues.length > 0) {
                  const match = transCues.find(tc => (tc.start < cue.end && tc.end > cue.start) || Math.abs(tc.start - cue.start) < 1.0);
                  if (match) translation = match.text;
                }
                return {
                  id: idx + 1,
                  start: cue.start,
                  end: cue.end,
                  text: cue.text,
                  vocalizedText: cue.text,
                  transliteration: transliterateArabicText(cue.text),
                  translation: translation,
                  notes: ''
                };
              });

              return {
                success: true,
                videoId,
                title: `YouTube Video (${videoId})`,
                channel: 'YouTube Captions',
                subtitles
              };
            }
          }
        }
      } catch {
        // Try next candidate
      }
    }
  }

  // 3. Fallback: Friendly guide for GitHub Pages with 1-click DownSub or transcript copy
  return {
    success: false,
    videoId,
    title: `YouTube Video (${videoId})`,
    channel: '',
    subtitles: [],
    error: 'YouTube requires client transcript paste or SRT upload. Please use the 1-Click DownSub button or paste the YouTube transcript.'
  };
}
