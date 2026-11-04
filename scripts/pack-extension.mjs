// Zips extension/ into public/polytube-caption-bridge.zip so the app can offer it as a download.
// Runs before every build. The zip holds one folder, polytube-caption-bridge/, ready for "Load unpacked".
import { cpSync, mkdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'polytube-caption-bridge.zip');
const stage = mkdtempSync(join(tmpdir(), 'polytube-ext-'));
const folder = join(stage, 'polytube-caption-bridge');

try {
  mkdirSync(folder, { recursive: true });
  cpSync(join(root, 'extension'), folder, { recursive: true });
  if (existsSync(out)) rmSync(out);
  if (process.platform === 'win32') {
    // Windows 10+ ships bsdtar, which writes a zip when the name ends in .zip.
    // Use the system copy by full path: Git Bash puts GNU tar first, which cannot write zips.
    const bsdtar = join(process.env.SystemRoot || 'C:/Windows', 'System32', 'tar.exe');
    execFileSync(bsdtar, ['-a', '-c', '-f', out, '-C', stage, 'polytube-caption-bridge']);
  } else {
    execFileSync('zip', ['-r', '-q', out, 'polytube-caption-bridge'], { cwd: stage });
  }
  console.log('Packed extension ->', out);
} finally {
  rmSync(stage, { recursive: true, force: true });
}
