import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, 'dist');
const htmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error('dist/index.html not found! Run npm run build first.');
  process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Replace all <link rel="stylesheet" ... href="..."> with inlined <style>
html = html.replace(/<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gi, (match, href) => {
  const cleanHref = href.replace(/^\.\//, '').replace(/^\//, '');
  const cssPath = path.join(distDir, cleanHref);
  if (fs.existsSync(cssPath)) {
    console.log(`✓ Inlining CSS: ${cleanHref}`);
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    return `<style>\n${cssContent}\n</style>`;
  }
  return match;
});

// 2. Replace all <script type="module" ... src="..."> with inlined <script type="module">
html = html.replace(/<script\s+type="module"[^>]*src="([^"]+)"[^>]*><\/script>/gi, (match, src) => {
  const cleanSrc = src.replace(/^\.\//, '').replace(/^\//, '');
  const jsPath = path.join(distDir, cleanSrc);
  if (fs.existsSync(jsPath)) {
    console.log(`✓ Inlining JS: ${cleanSrc}`);
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    // Escape any </script> sequences inside JS string literals
    const safeJs = jsContent.replace(/<\/script/gi, '<\\/script');
    return `<script type="module">\n${safeJs}\n</script>`;
  }
  return match;
});

// Output targets
const outTargets = [
  path.join(distDir, 'lingotube-standalone.html'),
  path.join(__dirname, 'lingotube-standalone.html'),
  path.resolve(__dirname, '..', 'LingoTube-Standalone.html')
];

for (const target of outTargets) {
  fs.writeFileSync(target, html, 'utf8');
  console.log(`🎉 Generated self-contained HTML at: ${target}`);
}
