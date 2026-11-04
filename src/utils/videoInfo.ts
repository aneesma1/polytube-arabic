/**
 * Reference details about a video (title, channel, date, length, link, description)
 * and the helpers every export uses to print them.
 */
import { VideoInfo } from '../types';

export type DescriptionMode = 'brief' | 'full' | 'none';

export const BRIEF_MAX = 300;

/** Link to the video, optionally at a given second. */
export function watchUrl(videoId: string, startSec?: number): string {
  const base = `https://www.youtube.com/watch?v=${videoId}`;
  return startSec && startSec > 0 ? `${base}&t=${Math.floor(startSec)}s` : base;
}

export function formatDuration(sec?: number): string {
  if (!sec || sec <= 0) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

/** 2024-03-12 -> 12 March 2024 */
export function formatUploadDate(iso?: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return '';
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

const URL_RE = /https?:\/\/\S+/gi;
const SENTENCE_END = /[.!?؟۔]/;

/** First readable paragraph of the description, links and hashtags removed, cut at a sentence end. */
export function briefDescription(description?: string, max = BRIEF_MAX): string {
  if (!description) return '';
  const paragraphs = description
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map(p =>
      p
        .replace(URL_RE, '')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !/^(#\S+\s*)+$/.test(l))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    // a paragraph with no letters in it is only symbols or emoji
    .filter(p => /[\p{L}]/u.test(p));
  const first = paragraphs[0] ?? '';
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  let end = -1;
  for (let i = cut.length - 1; i > max * 0.5; i--) {
    if (SENTENCE_END.test(cut[i])) {
      end = i;
      break;
    }
  }
  if (end > 0) return cut.slice(0, end + 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.5 ? cut.slice(0, space) : cut).trim()}…`;
}

/** Description as it should appear under the chosen mode ('' when none or empty). */
export function descriptionFor(info: VideoInfo, mode: DescriptionMode): string {
  if (mode === 'none') return '';
  if (mode === 'brief') return briefDescription(info.description);
  return (info.description ?? '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

export interface InfoRow {
  label: string;
  value: string;
  /** Set when the value is a link */
  href?: string;
}

/** The reference lines in a fixed order; empty ones are left out. */
export function infoRows(info: VideoInfo): InfoRow[] {
  const link = watchUrl(info.videoId);
  const rows: InfoRow[] = [];
  if (info.channel) rows.push({ label: 'Channel', value: info.channel, href: info.channelUrl || undefined });
  const date = formatUploadDate(info.uploadDate);
  if (date) rows.push({ label: 'Uploaded', value: date });
  const dur = formatDuration(info.durationSec);
  if (dur) rows.push({ label: 'Duration', value: dur });
  rows.push({ label: 'Video link', value: link, href: link });
  return rows;
}

/** Details a saved video holds, merged with what the app already knows about the open video. */
export function composeInfo(
  videoId: string,
  title: string,
  stored?: { title?: string; channel?: string; info?: Omit<VideoInfo, 'videoId' | 'title' | 'channel'> } | null
): VideoInfo {
  return {
    videoId,
    title: title || stored?.title || `Video ${videoId}`,
    channel: stored?.channel && !/^(YouTube Captions|Uploaded Subtitles)$/.test(stored.channel) ? stored.channel : undefined,
    ...(stored?.info ?? {}),
  };
}

const escHtml = (s: string) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Reference block as Markdown lines (bullets, then the description as a quote). */
export function infoMarkdown(info: VideoInfo, mode: DescriptionMode = 'brief'): string {
  const refs = infoRows(info).map(r => `- **${r.label}:** ${r.href ? `[${r.value}](${r.href})` : r.value}`);
  const d = descriptionFor(info, mode);
  const quote = d ? `\n${d.split('\n').map(l => `> ${l}`.trimEnd()).join('\n')}\n` : '';
  return `${refs.join('\n')}\n${quote}`;
}

/** Reference block as small inline-styled HTML, safe to drop into any page. */
export function infoHtml(info: VideoInfo, mode: DescriptionMode = 'brief'): string {
  const rows = infoRows(info)
    .map(r => `<div><b>${escHtml(r.label)}:</b> ${r.href ? `<a href="${escHtml(r.href)}">${escHtml(r.value)}</a>` : escHtml(r.value)}</div>`)
    .join('');
  const d = descriptionFor(info, mode);
  return `<div style="font-size:13px;margin:6px 0 10px">${rows}${d ? `<div dir="auto" style="margin-top:6px;padding:4px 10px;border-left:3px solid #c7d2fe;color:#555;white-space:pre-line">${escHtml(d)}</div>` : ''}</div>`;
}
