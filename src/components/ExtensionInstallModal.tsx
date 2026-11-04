import React, { useEffect, useState } from 'react';
import { X, Download, Puzzle, Check, Copy, RefreshCw } from 'lucide-react';
import { getExtensionVersion } from '../utils/extensionBridge';
import extensionManifest from '../../extension/manifest.json';

interface ExtensionInstallModalProps {
  onClose: () => void;
  theme?: 'light' | 'dark';
}

const EXT_VERSION: string = extensionManifest.version;
const ZIP_URL = `./polytube-caption-bridge.zip?v=${EXT_VERSION}`;

/** Download and install guide for the caption extension (Chrome and other Chromium browsers, desktop only). */
export const ExtensionInstallModal: React.FC<ExtensionInstallModalProps> = ({ onClose, theme = 'light' }) => {
  const isLight = theme === 'light';
  const [status, setStatus] = useState<'checking' | 'found' | 'missing'>('checking');
  const [foundVersion, setFoundVersion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const check = async () => {
    setStatus('checking');
    const v = await getExtensionVersion();
    setFoundVersion(v);
    setStatus(v ? 'found' : 'missing');
  };

  useEffect(() => {
    check();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText('chrome://extensions');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const panel = isLight ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-900 text-slate-100 border-slate-700';
  const soft = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700';
  const num = 'w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center';
  const code = `px-1.5 py-0.5 rounded font-mono text-[12px] ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`;
  const outdated = status === 'found' && foundVersion && foundVersion !== EXT_VERSION;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-3" onClick={onClose}>
      <div className={`w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl ${panel}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-inherit shrink-0">
          <Puzzle className="w-5 h-5 text-indigo-500" />
          <h2 className="font-bold text-sm flex-1">Caption extension (Chrome, Edge, Brave and other Chromium browsers)</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-500/10 cursor-pointer" title="Close (Esc)">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3 space-y-3 text-sm">
          <p className="text-xs opacity-80">
            YouTube blocks websites from reading its captions, so a small extension fetches them for this app. It only talks to
            youtube.com and this page, shows nothing on YouTube, and is not in the Chrome Web Store, so you install it once by hand.
            Desktop browsers only; phones can't run it.
          </p>

          <div className={`rounded-xl border px-3 py-2 text-xs flex items-center gap-2 ${soft}`}>
            {status === 'checking' && <span className="opacity-70">Checking for the extension…</span>}
            {status === 'found' && !outdated && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Installed and working (version {foundVersion})
              </span>
            )}
            {outdated && (
              <span className="text-amber-600 font-semibold">
                Installed version {foundVersion}, newest is {EXT_VERSION}. Download below, replace the folder, then press the refresh icon on its card.
              </span>
            )}
            {status === 'missing' && <span className="text-rose-600 font-semibold">Not detected yet. Follow the steps below.</span>}
            <button onClick={check} className="ml-auto p-1.5 rounded-lg hover:bg-slate-500/10 cursor-pointer" title="Check again">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className={num}>1</span>
              <div className="min-w-0">
                <div className="font-semibold">Download the extension</div>
                <a
                  href={ZIP_URL}
                  download="polytube-caption-bridge.zip"
                  className="mt-1 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  <Download className="w-4 h-4" /> polytube-caption-bridge.zip (v{EXT_VERSION})
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <span className={num}>2</span>
              <div>
                <div className="font-semibold">Unzip it somewhere permanent</div>
                <div className="text-xs opacity-80">Right-click the zip, Extract all. You get a folder named <span className={code}>polytube-caption-bridge</span>. Don't delete or move it later; the browser loads the extension from there.</div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className={num}>3</span>
              <div className="min-w-0">
                <div className="font-semibold">Open the extensions page and turn on Developer mode</div>
                <div className="text-xs opacity-80">
                  Type <span className={code}>chrome://extensions</span> in a new tab (Edge: <span className={code}>edge://extensions</span>, Brave: <span className={code}>brave://extensions</span>). Browsers don't allow links to this page, so copy it:
                </div>
                <button onClick={copyAddress} className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${soft}`}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy chrome://extensions'}
                </button>
                <div className="text-xs opacity-80 mt-1">Switch <b>Developer mode</b> on (top right, or left menu in Edge).</div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className={num}>4</span>
              <div>
                <div className="font-semibold">Click "Load unpacked" and choose the folder</div>
                <div className="text-xs opacity-80">Pick the unzipped <span className={code}>polytube-caption-bridge</span> folder (the one that contains <span className={code}>manifest.json</span>). "PolyTube Caption Bridge" appears in the list.</div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className={num}>5</span>
              <div>
                <div className="font-semibold">Reload this page</div>
                <div className="text-xs opacity-80">Press Ctrl+Shift+R here, then paste a YouTube link. The first load of a video opens it in a muted background tab for a few seconds, reads the captions, and closes it. After that the video works without the extension.</div>
              </div>
            </li>
          </ol>

          <div className={`rounded-xl border px-3 py-2 text-xs ${soft}`}>
            <b>Updating:</b> download again, unzip over the old folder, then press the circular refresh icon on the extension's card and reload this page. Browser may show a "disable developer mode extensions" notice on startup; just dismiss it.
          </div>
        </div>
      </div>
    </div>
  );
};
