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
 * Attempts to fetch subtitles via server API or localhost, with proper error handling.
 */
export async function fetchUniversalSubtitles(
  videoId: string,
  targetLang: string = 'ar',
  transLang: string = 'en'
): Promise<FetchSubtitlesResult> {
  const endpoints = [
    `/api/youtube/subtitles?videoId=${encodeURIComponent(videoId)}&targetLang=${encodeURIComponent(targetLang)}&transLang=${encodeURIComponent(transLang)}`,
    `http://localhost:3000/api/youtube/subtitles?videoId=${encodeURIComponent(videoId)}&targetLang=${encodeURIComponent(targetLang)}&transLang=${encodeURIComponent(transLang)}`
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.subtitles) && data.subtitles.length > 0) {
          return data;
        } else if (data && data.error) {
          return {
            success: false,
            videoId,
            title: data.title || `YouTube Video (${videoId})`,
            channel: data.channel || '',
            subtitles: [],
            error: data.error
          };
        }
      }
    } catch {
      // Try next endpoint candidate
    }
  }

  return {
    success: false,
    videoId,
    title: `YouTube Video (${videoId})`,
    channel: '',
    subtitles: [],
    error: 'Could not connect to YouTube subtitle server. Please ensure the app is running with start-app.bat, or upload an SRT file.'
  };
}
