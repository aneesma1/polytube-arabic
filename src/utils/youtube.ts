/**
 * Universal YouTube URL Parser and Link Utilities
 */

export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const clean = input.trim();

  // If user passed direct 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Common YouTube URL regex patterns
  const patterns = [
    // Standard watch URL: youtube.com/watch?v=ID
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    // Shortened URL: youtu.be/ID
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // Embed URL: youtube.com/embed/ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // Shorts URL: youtube.com/shorts/ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    // Live or v URL: youtube.com/v/ID or youtube.com/live/ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:v|live)\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function extractTimestamp(url: string): number {
  try {
    const tParam = url.match(/[?&]t=([0-9a-zA-Z]+)/);
    if (!tParam) return 0;
    const val = tParam[1];
    if (/^\d+$/.test(val)) {
      return parseInt(val, 10);
    }
    // format like 1h2m30s or 2m10s
    let totalSeconds = 0;
    const hours = val.match(/(\d+)h/);
    const mins = val.match(/(\d+)m/);
    const secs = val.match(/(\d+)s/);
    if (hours) totalSeconds += parseInt(hours[1], 10) * 3600;
    if (mins) totalSeconds += parseInt(mins[1], 10) * 60;
    if (secs) totalSeconds += parseInt(secs[1], 10);
    return totalSeconds;
  } catch {
    return 0;
  }
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function createShareUrl(videoId: string, targetLang: string = 'ar', nativeLang: string = 'en', timestamp: number = 0): string {
  const url = new URL(window.location.href);
  url.searchParams.set('v', videoId);
  url.searchParams.set('l1', targetLang);
  url.searchParams.set('l2', nativeLang);
  if (timestamp > 0) {
    url.searchParams.set('t', Math.floor(timestamp).toString());
  }
  return url.toString();
}

export function getEmbedCode(videoId: string): string {
  return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
}
