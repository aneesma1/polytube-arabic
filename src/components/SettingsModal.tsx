import React, { useRef, useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  Share2, 
  Trash2, 
  Check, 
  X, 
  HardDrive, 
  Sliders, 
  ShieldCheck, 
  RefreshCw,
  FileJson,
  Copy
} from 'lucide-react';
import { 
  BackupPayload, 
  WorkspaceSettings, 
  SubtitleItem, 
  SavedWord, 
  VideoCollection 
} from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WorkspaceSettings;
  onUpdateSettings: (newSettings: WorkspaceSettings) => void;
  currentVideo: {
    id: string;
    title: string;
    timestamp: number;
    targetLangCode: string;
    nativeLangCode: string;
  };
  subtitles: SubtitleItem[];
  vocabulary: SavedWord[];
  collections: VideoCollection[];
  onRestoreBackup: (payload: BackupPayload) => void;
  onResetLayout: () => void;
  onClearCache: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentVideo,
  subtitles,
  vocabulary,
  collections,
  onRestoreBackup,
  onResetLayout,
  onClearCache,
}) => {
  const [copyNotice, setCopyNotice] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Export Backup File (.json)
  const handleExportBackup = () => {
    const backup: BackupPayload = {
      version: '1.2.0',
      appName: 'LingoTube AI Studio',
      exportedAt: new Date().toISOString(),
      currentVideo: {
        id: currentVideo.id,
        title: currentVideo.title,
        timestamp: parseFloat(currentVideo.timestamp.toFixed(1)),
        targetLangCode: currentVideo.targetLangCode,
        nativeLangCode: currentVideo.nativeLangCode,
      },
      subtitles,
      vocabulary,
      collections,
      settings,
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `lingotube-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 2. Restore Backup File (.json)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setImportError(null);
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as BackupPayload;

        if (!parsed || !parsed.currentVideo) {
          throw new Error('Invalid backup file: missing required session metadata.');
        }

        onRestoreBackup(parsed);
        setImportNotice(`Successfully restored session, ${parsed.collections?.length || 0} collections, and ${parsed.vocabulary?.length || 0} vocabulary words!`);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse backup file. Please ensure it is a valid LingoTube .json backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  // 3. Copy Shareable URL
  const handleCopyShareableUrl = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('v', currentVideo.id);
    url.searchParams.set('t', Math.floor(currentVideo.timestamp).toString());
    url.searchParams.set('l1', currentVideo.targetLangCode);
    url.searchParams.set('l2', currentVideo.nativeLangCode);

    navigator.clipboard.writeText(url.toString());
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Workstation Settings & Session Backup
              </h2>
              <p className="text-xs text-slate-400">
                Preserve your video, subtitles, custom collections, and settings across browser sessions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notices */}
        {importNotice && (
          <div className="p-3 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              {importNotice}
            </span>
            <button onClick={() => setImportNotice(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {importError && (
          <div className="p-3 bg-rose-500/15 border-b border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{importError}</span>
            <button onClick={() => setImportError(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Section 1: Backup & Restore File */}
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Session Backup & Restore (.json)
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export your entire workstation state into a single file. You can restore this file on any computer or after clearing your browser cache to immediately recover all video progress, collections, subtitles, and saved vocabulary.
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                onClick={handleExportBackup}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Backup File</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Restore Backup File</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Section 2: Shareable Instant URL */}
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Shareable Video Session Link
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate a direct URL with the current video and exact timestamp to resume on your phone or share with study partners.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyShareableUrl}
                className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
              >
                {copyNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copyNotice ? 'Link Copied to Clipboard!' : 'Copy Shareable Link'}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Workspace Layout & Display Defaults */}
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Layout & Sizing Defaults
              </h3>
            </div>

            {/* Splitter Ratio Preset */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Default Layout Ratio:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { ratio: 75, label: '75% Video (Cinema / Wide Subtitles)' },
                  { ratio: 65, label: '65% Balanced (Default)' },
                  { ratio: 50, label: '50% Equal (Transcript Focus)' },
                ].map((item) => (
                  <button
                    key={item.ratio}
                    onClick={() => onUpdateSettings({ ...settings, splitRatio: item.ratio })}
                    className={`p-2.5 rounded-xl border text-xs text-left cursor-pointer transition-all ${
                      Math.round(settings.splitRatio) === item.ratio
                        ? 'bg-rose-500/15 border-rose-500/50 text-rose-200 font-semibold ring-1 ring-rose-500/30'
                        : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar Font Scale */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Sidebar Default Font Size:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => onUpdateSettings({ ...settings, sidebarFontSize: sz })}
                    className={`py-2 rounded-xl border text-xs uppercase font-mono font-bold cursor-pointer transition-all text-center ${
                      settings.sidebarFontSize === sz
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sz === 'sm' ? 'Small' : sz === 'md' ? 'Medium' : sz === 'lg' ? 'Large' : 'XL'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Reset & Cache Management */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
            <button
              onClick={onResetLayout}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Layout to Default (65/35)</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Clear local storage cache? (Saved vocabulary and subtitles will be reset to curated defaults)')) {
                  onClearCache();
                  onClose();
                }
              }}
              className="text-rose-400/80 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Stored Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
