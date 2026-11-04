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
  Copy,
  Key,
  Sparkles,
  ExternalLink,
  Save,
  Pause,
} from 'lucide-react';
import { StudyPauseConfig } from '../utils/studyPause';
import { 
  BackupPayload, 
  WorkspaceSettings, 
  SubtitleItem, 
  SavedWord, 
  VideoCollection 
} from '../types';
import { PROVIDERS, AiSettings, loadAiSettings, saveAiSettings, testAiConnection, listAiModels } from '../utils/aiProvider';

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
  onRestoreBackup: (payload: unknown) => string;
  onExportData: (kind: 'backup' | 'notes-csv' | 'lines-csv' | 'report') => void;
  studyPause: StudyPauseConfig;
  onChangeStudyPause: (cfg: StudyPauseConfig) => void;
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
  onExportData,
  studyPause,
  onChangeStudyPause,
  onResetLayout,
  onClearCache,
}) => {
  const [copyNotice, setCopyNotice] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [ai, setAi] = useState<AiSettings>(loadAiSettings);
  const [aiTest, setAiTest] = useState<{ busy: boolean; ok?: boolean; message?: string }>({ busy: false });
  const [aiModels, setAiModels] = useState<string[]>([]);
  const [keySavedNotice, setKeySavedNotice] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProvider = PROVIDERS.find(p => p.id === ai.provider) ?? PROVIDERS[0];

  const handleTestKey = async () => {
    setAiTest({ busy: true, message: 'Checking your key...' });
    const models = await listAiModels(ai);
    setAiModels(models);
    const result = await testAiConnection(ai, models, text => setAiTest({ busy: true, message: text }));
    if (result.workingModel) {
      setAi(prev => ({ ...prev, models: { ...prev.models, [prev.provider]: result.workingModel as string } }));
    }
    setAiTest({ busy: false, ok: result.ok, message: result.message });
  };

  const handleSaveGeminiKey = () => {
    saveAiSettings(ai);
    setKeySavedNotice(true);
    setTimeout(() => setKeySavedNotice(false), 3000);
  };

  if (!isOpen) return null;

  // 1. Back up everything (.json)
  const handleExportBackup = () => onExportData('backup');

  // 2. Restore Backup File (.json)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setImportError(null);
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        setImportNotice(onRestoreBackup(parsed));
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
          {/* While studying: pause the video automatically */}
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Pause className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">While studying</h3>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
              <input type="checkbox" checked={studyPause.on} onChange={e => onChangeStudyPause({ ...studyPause, on: e.target.checked })} />
              Pause the video while I study
            </label>
            <div className={`pl-6 space-y-1.5 text-xs text-slate-300 ${studyPause.on ? '' : 'opacity-40 pointer-events-none'}`}>
              {([
                ['word', 'When a word pop-up is open'],
                ['speech', 'While pronunciation audio plays (word or line)'],
                ['dialogs', 'When Export, Settings, Library or other dialogs are open'],
                ['tab', 'When I switch to another tab or window'],
              ] as const).map(([key, text]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={studyPause[key]} onChange={e => onChangeStudyPause({ ...studyPause, [key]: e.target.checked })} />
                  {text}
                </label>
              ))}
              <div className="pt-2 text-slate-400 font-semibold">When I close the pop-up</div>
              {([
                ['earlier', 'Resume 2 seconds earlier (catches the start of the sentence)'],
                ['same', 'Resume exactly where it stopped'],
                ['stay', 'Stay paused'],
              ] as const).map(([val, text]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="study-resume" checked={studyPause.resume === val} onChange={() => onChangeStudyPause({ ...studyPause, resume: val })} />
                  {text}
                </label>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">A video you had paused yourself stays paused. This is separate from Auto-pause under the video, which stops at the end of each line.</p>
          </div>

          {/* Section 1: Backup & Restore File */}
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Backup, restore & export
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Back up your saved videos (captions and translations), words, sentences and settings into one file, and restore it on any computer. Restoring adds to what you already have and deletes nothing. AI keys are never included. The spreadsheet and web-page exports below can be opened in Excel or any browser.
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                onClick={handleExportBackup}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Back up everything (.json)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Restore from backup</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] uppercase font-bold text-slate-500">For Excel and other apps</span>
              <button onClick={() => onExportData('notes-csv')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer">
                Words and sentences (.csv)
              </button>
              <button onClick={() => onExportData('lines-csv')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer">
                All video lines (.csv)
              </button>
              <button onClick={() => onExportData('report')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer">
                Readable report (.html)
              </button>
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

          {/* Section 2.5: Optional AI provider */}
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">AI (optional)</h3>
              </div>
              {activeProvider.keyUrl && (
                <a
                  href={activeProvider.keyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
                >
                  <span>Get a key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adds <strong>Explain with AI</strong> on words and <strong>Prepare video</strong> (vowel marks and phonetics).
              The app works fully without it. Your key stays in this browser and is sent only to the provider you pick.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={ai.provider}
                onChange={(e) => setAi(prev => ({ ...prev, provider: e.target.value as AiSettings['provider'] }))}
                className="px-2.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200"
              >
                {PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={ai.models[ai.provider] ?? ''}
                onChange={(e) => setAi(prev => ({ ...prev, models: { ...prev.models, [prev.provider]: e.target.value } }))}
                list="ai-model-options"
                placeholder={activeProvider.defaultModel || 'model name'}
                className="px-2.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 font-mono"
              />
            </div>

            <datalist id="ai-model-options">
              {aiModels.map(m => (
                <option key={m} value={m} />
              ))}
            </datalist>

            {ai.provider === 'custom' && (
              <input
                type="text"
                value={ai.customBaseUrl}
                onChange={(e) => setAi(prev => ({ ...prev, customBaseUrl: e.target.value }))}
                placeholder="https://your-provider.example/v1"
                className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 font-mono"
              />
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={ai.keys[ai.provider] ?? ''}
                  onChange={(e) => setAi(prev => ({ ...prev, keys: { ...prev.keys, [prev.provider]: e.target.value } }))}
                  placeholder="Paste API key"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <button
                onClick={handleSaveGeminiKey}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm shrink-0"
              >
                {keySavedNotice ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
                <span>{keySavedNotice ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleTestKey}
                disabled={aiTest.busy}
                className="px-3 py-1.5 rounded-xl border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 text-xs font-semibold cursor-pointer disabled:opacity-60"
              >
                {aiTest.busy ? 'Testing...' : 'Test key'}
              </button>
              {aiTest.message && (
                <span className={`text-xs ${aiTest.busy ? 'text-slate-400' : aiTest.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {aiTest.busy ? '' : aiTest.ok ? 'OK: ' : 'Failed: '}
                  {aiTest.message}
                </span>
              )}
            </div>
            {aiModels.length > 0 && (
              <p className="text-[11px] text-slate-500">
                {aiModels.length} models available for this key. Click the model box to pick one.
              </p>
            )}
            <p className="text-[11px] text-slate-500">{activeProvider.note}</p>
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
