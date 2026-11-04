import React, { useState, useRef } from 'react';
import { 
  X, 
  FileText, 
  Upload, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { SubtitleItem } from '../types';
import { parseSrtFile } from '../utils/subtitles';
import { transliterateArabic } from '../utils/arabic';

interface SubtitleEditorModalProps {
  currentSubtitles: SubtitleItem[];
  videoId: string;
  videoTitle: string;
  onSaveSubtitles: (subtitles: SubtitleItem[]) => void;
  onClose: () => void;
  targetLangCode: string;
}

export const SubtitleEditorModal: React.FC<SubtitleEditorModalProps> = ({
  currentSubtitles,
  videoId,
  videoTitle,
  onSaveSubtitles,
  onClose,
  targetLangCode,
}) => {
  const [tab, setTab] = useState<'paste' | 'edit'>('paste');
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editableSubtitles, setEditableSubtitles] = useState<SubtitleItem[]>(
    currentSubtitles.length > 0 ? JSON.parse(JSON.stringify(currentSubtitles)) : []
  );
  const [notice, setNotice] = useState<string | null>(null);

  const isArabic = targetLangCode === 'ar';

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      const parsed = parseSrtFile(content);
      if (parsed.length > 0) {
        setEditableSubtitles(parsed);
        setTab('edit');
        setNotice(`Successfully loaded ${parsed.length} subtitles from ${file.name}!`);
      } else {
        setPastedText(content);
        handleParsePastedText();
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;

    // Check if pasted content is SRT format
    if (pastedText.includes('-->')) {
      const parsed = parseSrtFile(pastedText);
      if (parsed.length > 0) {
        setEditableSubtitles(parsed);
        setTab('edit');
        setNotice(`Successfully parsed ${parsed.length} subtitles from SRT/VTT!`);
        return;
      }
    }

    const rawLines = pastedText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLines.length === 0) return;

    // Check if pasted from YouTube Transcript panel (e.g. "0:01 \n text" or "0:01 text")
    const parseTimeStr = (str: string) => {
      const parts = str.split(':').map((p) => parseFloat(p));
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return 0;
    };

    const isTimestampOnly = (str: string) => /^(\d{1,2}:)?[0-5]?\d:[0-5]\d$/.test(str.trim());
    const inlineMatch = /^((\d{1,2}:)?[0-5]?\d:[0-5]\d)\s+(.+)$/;

    const ytSegments: { start: number; text: string }[] = [];

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (isTimestampOnly(line)) {
        // Next line is dialogue
        const next = rawLines[i + 1];
        if (next && !isTimestampOnly(next)) {
          ytSegments.push({
            start: parseTimeStr(line),
            text: next,
          });
          i++; // skip next line
        }
      } else {
        const match = line.match(inlineMatch);
        if (match) {
          ytSegments.push({
            start: parseTimeStr(match[1]),
            text: match[3],
          });
        }
      }
    }

    if (ytSegments.length > 0) {
      // Build items with proper end times
      const items: SubtitleItem[] = ytSegments.map((seg, idx) => {
        const nextSeg = ytSegments[idx + 1];
        const end = nextSeg ? Math.max(seg.start + 1.5, nextSeg.start - 0.2) : seg.start + 5;
        return {
          id: idx + 1,
          start: parseFloat(seg.start.toFixed(1)),
          end: parseFloat(end.toFixed(1)),
          text: seg.text,
          vocalizedText: seg.text,
          transliteration: isArabic ? transliterateArabic(seg.text) : undefined,
          translation: seg.text,
        };
      });

      setEditableSubtitles(items);
      setTab('edit');
      setNotice(`Parsed ${items.length} YouTube transcript segments with exact timestamps!`);
      return;
    }

    // Fallback: standard plain text lines (spaced 4-6s apart)
    let currentTime = 0;
    const items: SubtitleItem[] = rawLines.map((line, idx) => {
      const start = currentTime;
      const duration = Math.max(3, Math.min(8, line.length * 0.1));
      const end = start + duration;
      currentTime = end + 0.3;

      return {
        id: idx + 1,
        start: parseFloat(start.toFixed(1)),
        end: parseFloat(end.toFixed(1)),
        text: line,
        vocalizedText: line,
        transliteration: isArabic ? transliterateArabic(line) : undefined,
        translation: `Line ${idx + 1}: ${line}`,
      };
    });

    setEditableSubtitles(items);
    setTab('edit');
    setNotice(`Generated ${items.length} synchronized lines from text!`);
  };

  const handleSaveAndApply = () => {
    if (editableSubtitles.length === 0) return;
    onSaveSubtitles(editableSubtitles);
    onClose();
  };

  const handleUpdateLine = (index: number, field: keyof SubtitleItem, value: any) => {
    setEditableSubtitles((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveLine = (index: number) => {
    setEditableSubtitles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddNewLine = () => {
    const last = editableSubtitles[editableSubtitles.length - 1];
    const start = last ? last.end + 0.5 : 0;
    const end = start + 4;
    setEditableSubtitles((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        start,
        end,
        text: 'نص جديد',
        vocalizedText: 'نَصٌّ جَدِيدٌ',
        translation: 'New line',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Load & Edit Subtitles for this Video
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-md">
                Video: {videoTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setTab('paste')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  tab === 'paste' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Paste Transcript / SRT
              </button>
              <button
                onClick={() => setTab('edit')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  tab === 'edit' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Line-by-Line Editor ({editableSubtitles.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {notice && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 p-2.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{notice}</span>
          </div>
        )}

        {/* Tab 1: Paste Raw Transcript or SRT */}
        {tab === 'paste' ? (
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-850 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".srt,.vtt,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .SRT / .VTT File</span>
                </button>
              </div>

              {videoId && (
                <a
                  href={`https://downsub.com/?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open DownSub in a new tab to download Arabic/English captions in 1 click"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Download .SRT via DownSub (1-Click) ↗</span>
                </a>
              )}
            </div>

            <div className="bg-slate-850/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong>How to load subtitles for ANY YouTube video on GitHub Pages:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1 text-slate-400 text-[11px]">
                  <li>Click <strong>&ldquo;Download .SRT via DownSub&rdquo;</strong> to grab the official or auto-generated subtitle in 1 click, then upload it.</li>
                  <li><strong>OR</strong> on YouTube, click <em>&ldquo;Show transcript&rdquo;</em>, copy all lines, and paste them below.</li>
                  <li>PolyTube will automatically sync timestamps, apply Arabic Tashkeel, romanize transliteration, and save to your Library!</li>
                </ol>
              </div>
            </div>

            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste SRT captions or transcript here...&#10;&#10;Example SRT:&#10;1&#10;00:00:00,000 --> 00:00:06,000&#10;بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ&#10;In the name of God, the Most Gracious...&#10;&#10;Or plain text lines:&#10;First line of dialogue&#10;Second line of dialogue..."
              className="w-full h-64 p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                {pastedText.length} characters
              </span>
              <button
                onClick={handleParsePastedText}
                disabled={!pastedText.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Process & Load Subtitles</span>
              </button>
            </div>
          </div>
        ) : (
          /* Tab 2: Line-by-Line Editor */
          <div className="flex flex-col gap-3 flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {editableSubtitles.map((sub, idx) => (
                <div
                  key={idx}
                  className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Line #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <span>Start:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={sub.start}
                          onChange={(e) => handleUpdateLine(idx, 'start', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-slate-200"
                        />
                        <span>s</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <span>End:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={sub.end}
                          onChange={(e) => handleUpdateLine(idx, 'end', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-slate-200"
                        />
                        <span>s</span>
                      </div>
                      <button
                        onClick={() => handleRemoveLine(idx)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Target language text */}
                  <div>
                    <input
                      type="text"
                      value={sub.vocalizedText || sub.text}
                      onChange={(e) => {
                        handleUpdateLine(idx, 'vocalizedText', e.target.value);
                        handleUpdateLine(idx, 'text', e.target.value);
                      }}
                      placeholder="Target language text (e.g. Arabic with Tashkeel)"
                      className={`w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500 ${isArabic ? 'font-arabic text-right' : ''}`}
                      dir={isArabic ? 'rtl' : 'ltr'}
                    />
                  </div>

                  {/* Translation */}
                  <div>
                    <input
                      type="text"
                      value={sub.translation}
                      onChange={(e) => handleUpdateLine(idx, 'translation', e.target.value)}
                      placeholder="Native translation (English)"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleAddNewLine}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add New Line</span>
              </button>

              <button
                onClick={handleSaveAndApply}
                disabled={editableSubtitles.length === 0}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply Subtitles to Video</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
