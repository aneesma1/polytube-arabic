/**
 * A saved "word card" is a snapshot of everything the word pop-up showed.
 * These helpers turn one card into WhatsApp text, rich HTML, Markdown,
 * Anki back-side HTML, and plain fields for spreadsheets.
 */
import { SavedWord } from '../types';

const clock = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const esc = (s: string) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const oneLine = (s: string) => String(s ?? '').replace(/\s*\n\s*/g, ' / ').trim();

export function hasFullCard(w: SavedWord): boolean {
  return !!w.card;
}

/** WhatsApp markup: *bold*, _italic_, bullets. Arabic lines sit on their own lines. */
export function cardWhatsApp(w: SavedWord): string {
  const c = w.card;
  const out: string[] = [];
  out.push(`📖 *${w.vocalized || w.word}*${w.transliteration ? `  _(${w.transliteration})_` : ''}`);
  if (w.root) out.push(`🧩 Root: ${w.root}`);
  if (w.partOfSpeech) out.push(`🏷️ ${w.partOfSpeech}`);

  const meaning = c?.meaning || w.translation;
  if (meaning) out.push('', `💡 *Meaning*`, meaning);

  if (c?.dictionary?.length) {
    out.push('', '📚 *Dictionary*');
    for (const e of c.dictionary) {
      out.push(`_${e.pos}_`);
      for (const d of e.definitions) out.push(`• ${d}`);
    }
  }

  if (c?.examples?.length) {
    out.push('', '✍️ *Examples*');
    c.examples.forEach((ex, i) => {
      out.push(ex.arabic, `🔤 _${ex.translation}_`);
      if (i < c.examples!.length - 1) out.push('');
    });
  }

  if (c?.ai) {
    const notes: string[] = [];
    if (c.ai.pattern) notes.push(`Pattern: ${c.ai.pattern}`);
    if (c.ai.meaning) notes.push(c.ai.meaning);
    if (c.ai.contextExplanation) notes.push(c.ai.contextExplanation);
    if (notes.length) out.push('', '🤖 *Notes (AI)*', ...notes);
    if (c.ai.collocations?.length) out.push('', '🔗 *Common phrases*', ...c.ai.collocations.map(p => `• ${p}`));
  }

  if (w.contextSentence) {
    out.push('', `🎬 *In the video*  _(${w.videoTitle}, ${clock(w.timestamp)})_`, w.contextSentence);
    if (w.contextTranslation && w.contextTranslation !== '—') out.push(`🔤 _${oneLine(w.contextTranslation)}_`);
  }

  if (c?.examples?.length) out.push('', '_Examples: Tatoeba (CC BY 2.0 FR)_');
  out.push('_via PolyTube Arabic_ 🌙');
  return out.join('\n');
}

/** Rich HTML fragment: pasted into Word, Gmail or Google Docs it keeps its formatting. */
export function cardHtml(w: SavedWord): string {
  const c = w.card;
  const parts: string[] = [];
  parts.push(
    `<h3 style="margin:0 0 4px"><span dir="rtl" style="font-size:24px">${esc(w.vocalized || w.word)}</span>` +
      `${w.transliteration ? ` <span style="font-weight:normal;color:#4338ca;font-family:monospace;font-size:13px">/${esc(w.transliteration)}/</span>` : ''}</h3>`
  );
  const meta = [w.root ? `Root: <b dir="rtl">${esc(w.root)}</b>` : '', w.partOfSpeech ? esc(w.partOfSpeech) : ''].filter(Boolean).join(' &middot; ');
  if (meta) parts.push(`<div style="color:#555;margin-bottom:6px">${meta}</div>`);

  const meaning = c?.meaning || w.translation;
  if (meaning) parts.push(`<p><b>Meaning:</b> ${esc(meaning)}</p>`);

  if (c?.dictionary?.length) {
    parts.push('<p style="margin-bottom:2px"><b>Dictionary</b> (Wiktionary)</p>');
    for (const e of c.dictionary) {
      parts.push(`<div style="color:#666;font-size:12px;text-transform:uppercase">${esc(e.pos)}</div><ul style="margin:2px 0 6px">${e.definitions.map(d => `<li>${esc(d)}</li>`).join('')}</ul>`);
    }
  }

  if (c?.examples?.length) {
    parts.push('<p style="margin-bottom:2px"><b>Examples</b> (Tatoeba, CC BY 2.0 FR)</p>');
    for (const ex of c.examples) {
      parts.push(`<div dir="rtl" style="font-size:20px;text-align:right">${esc(ex.arabic)}</div><div style="color:#555;margin-bottom:6px">${esc(ex.translation)}</div>`);
    }
  }

  if (c?.ai) {
    const rows: string[] = [];
    if (c.ai.pattern) rows.push(`<div><b>Pattern:</b> <span dir="rtl" style="font-size:20px">${esc(c.ai.pattern)}</span></div>`);
    if (c.ai.meaning) rows.push(`<div>${esc(c.ai.meaning)}</div>`);
    if (c.ai.contextExplanation) rows.push(`<div>${esc(c.ai.contextExplanation)}</div>`);
    if (c.ai.collocations?.length) rows.push(`<div dir="rtl" style="font-size:20px;text-align:right">${c.ai.collocations.map(esc).join(' &middot; ')}</div>`);
    if (rows.length) parts.push(`<p style="margin-bottom:2px"><b>Notes</b> (AI, may contain errors)</p>${rows.join('')}`);
  }

  if (w.contextSentence) {
    parts.push(
      `<p style="margin-bottom:2px"><b>In the video</b> <span style="color:#666">${esc(w.videoTitle)}, ${clock(w.timestamp)}</span></p>` +
        `<div dir="rtl" style="font-size:20px;text-align:right">${esc(w.contextSentence)}</div>` +
        (w.contextTranslation && w.contextTranslation !== '—' ? `<div style="color:#555">${esc(w.contextTranslation).replace(/\n/g, '<br>')}</div>` : '')
    );
  }
  return `<div class="card" style="border:1px solid #ddd;border-radius:8px;padding:12px;margin:12px 0;font-family:Segoe UI,Arial,sans-serif">${parts.join('')}</div>`;
}

export function cardMarkdown(w: SavedWord): string {
  const c = w.card;
  const out: string[] = [`### ${w.vocalized || w.word}${w.transliteration ? `  \`/${w.transliteration}/\`` : ''}`];
  const meta = [w.root ? `Root: **${w.root}**` : '', w.partOfSpeech || ''].filter(Boolean).join(' · ');
  if (meta) out.push(meta);
  const meaning = c?.meaning || w.translation;
  if (meaning) out.push('', `**Meaning:** ${meaning}`);
  if (c?.dictionary?.length) {
    out.push('', '**Dictionary** (Wiktionary)');
    for (const e of c.dictionary) {
      out.push(`- *${e.pos}*`);
      for (const d of e.definitions) out.push(`  - ${d}`);
    }
  }
  if (c?.examples?.length) {
    out.push('', '**Examples** (Tatoeba, CC BY 2.0 FR)');
    for (const ex of c.examples) out.push(`- ${ex.arabic}  \n  *${ex.translation}*`);
  }
  if (c?.ai) {
    const notes = [c.ai.pattern ? `Pattern: ${c.ai.pattern}` : '', c.ai.meaning || '', c.ai.contextExplanation || ''].filter(Boolean);
    if (notes.length) out.push('', '**Notes** (AI, may contain errors)', ...notes.map(n => `- ${n}`));
    if (c.ai.collocations?.length) out.push('', `**Common phrases:** ${c.ai.collocations.join(' · ')}`);
  }
  if (w.contextSentence) {
    out.push('', `**In the video** (${w.videoTitle}, ${clock(w.timestamp)})`, `> ${w.contextSentence}`);
    if (w.contextTranslation && w.contextTranslation !== '—') out.push(`> *${oneLine(w.contextTranslation)}*`);
  }
  return out.join('\n');
}

/** Back of an Anki card: one line of HTML (no tabs or newlines). */
export function cardAnkiBack(w: SavedWord): string {
  const c = w.card;
  const bits: string[] = [];
  if (w.transliteration) bits.push(`<i>/${esc(w.transliteration)}/</i>`);
  const meta = [w.root ? `Root: ${esc(w.root)}` : '', w.partOfSpeech ? esc(w.partOfSpeech) : ''].filter(Boolean).join(' &middot; ');
  if (meta) bits.push(meta);
  const meaning = c?.meaning || w.translation;
  if (meaning) bits.push(`<b>${esc(meaning)}</b>`);
  if (c?.dictionary?.length) {
    bits.push(c.dictionary.map(e => `<i>${esc(e.pos)}</i>: ${e.definitions.map(esc).join('; ')}`).join('<br>'));
  }
  if (c?.examples?.length) {
    bits.push(c.examples.map(ex => `<span dir="rtl">${esc(ex.arabic)}</span><br>${esc(ex.translation)}`).join('<br><br>'));
  }
  if (c?.ai) {
    const notes = [c.ai.pattern ? `Pattern: ${esc(c.ai.pattern)}` : '', c.ai.meaning ? esc(c.ai.meaning) : '', c.ai.contextExplanation ? esc(c.ai.contextExplanation) : ''].filter(Boolean);
    if (notes.length) bits.push(notes.join('<br>'));
    if (c.ai.collocations?.length) bits.push(`<span dir="rtl">${c.ai.collocations.map(esc).join(' &middot; ')}</span>`);
  }
  if (w.contextSentence) {
    bits.push(`<span dir="rtl">${esc(w.contextSentence)}</span>` + (w.contextTranslation && w.contextTranslation !== '—' ? `<br>${esc(oneLine(w.contextTranslation))}` : ''));
  }
  return bits.join('<br><br>').replace(/[\t\r\n]+/g, ' ');
}

/** Plain fields for spreadsheets. */
export function cardFields(w: SavedWord): { dictionary: string; examples: string; notes: string } {
  const c = w.card;
  return {
    dictionary: c?.dictionary?.map(e => `${e.pos}: ${e.definitions.join('; ')}`).join(' | ') ?? '',
    examples: c?.examples?.map(ex => `${ex.arabic} = ${ex.translation}`).join(' | ') ?? '',
    notes: c?.ai
      ? [c.ai.pattern ? `Pattern ${c.ai.pattern}` : '', c.ai.meaning || '', c.ai.contextExplanation || '', c.ai.collocations?.join(', ') || ''].filter(Boolean).join(' | ')
      : '',
  };
}

/** Copies WhatsApp-style text and rich HTML together; pasting picks whichever the target understands. */
export async function copyCardToClipboard(w: SavedWord): Promise<boolean> {
  const text = cardWhatsApp(w);
  const html = cardHtml(w);
  try {
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([text], { type: 'text/plain' }),
          'text/html': new Blob([html], { type: 'text/html' }),
        }),
      ]);
      return true;
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}
