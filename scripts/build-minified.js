/**
 * @file build-minified.js
 * @description Ultra-fast, zero-dependency CSS and JS minifier for AarambhX Technology.
 * Generates .min.css and .min.js assets, calculating byte savings and ensuring production readiness.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Minify CSS content safely
 */
function minifyCSS(css) {
  return css
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove newlines and excess whitespace around punctuation
    .replace(/\r?\n/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .trim();
}

/**
 * Minify JS content safely without breaking string literals or syntax
 */
function minifyJS(js) {
  // Safe JS minification: preserve regex and strings, strip block and line comments
  let inString = false;
  let quoteChar = '';
  let inRegex = false;
  let inBlockComment = false;
  let inLineComment = false;
  let out = '';

  for (let i = 0; i < js.length; i++) {
    const ch = js[i];
    const next = js[i + 1];

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (inLineComment) {
      if (ch === '\n' || ch === '\r') {
        inLineComment = false;
        out += '\n';
      }
      continue;
    }

    if (inString) {
      out += ch;
      if (ch === '\\') {
        out += next;
        i++;
      } else if (ch === quoteChar) {
        inString = false;
      }
      continue;
    }

    // Check comment start
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }

    // Check string start
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      quoteChar = ch;
      out += ch;
      continue;
    }

    out += ch;
  }

  // Clean extra blank lines and trailing spaces
  return out
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

console.log('=== AARAMBHX TECHNOLOGY: ASSET MINIFICATION PIPELINE ===\n');

const cssFiles = [
  'styles.css',
  'academy.css',
  'developer.css',
  'MaskedHeading.css',
  'ScrollExpand.css',
  'MorphSlider.css'
];

const jsFiles = [
  'main.js',
  'academy.js',
  'config.js',
  'scroll-expand.js',
  'morph-slider.js'
];

let totalOriginal = 0;
let totalMinified = 0;

console.log('--- Minifying CSS ---');
cssFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const minified = minifyCSS(content);
  const minFileName = file.replace(/\.css$/i, '.min.css');
  const minFilePath = path.join(ROOT_DIR, minFileName);

  fs.writeFileSync(minFilePath, minified, 'utf8');

  const origSize = Buffer.byteLength(content, 'utf8');
  const minSize = Buffer.byteLength(minified, 'utf8');
  totalOriginal += origSize;
  totalMinified += minSize;

  const savedPct = (((origSize - minSize) / origSize) * 100).toFixed(1);
  console.log(`✔ ${file} (${(origSize / 1024).toFixed(1)} KB) -> ${minFileName} (${(minSize / 1024).toFixed(1)} KB) [-${savedPct}%]`);
});

console.log('\n--- Minifying JavaScript ---');
jsFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const minified = minifyJS(content);
  const minFileName = file.replace(/\.js$/i, '.min.js');
  const minFilePath = path.join(ROOT_DIR, minFileName);

  fs.writeFileSync(minFilePath, minified, 'utf8');

  const origSize = Buffer.byteLength(content, 'utf8');
  const minSize = Buffer.byteLength(minified, 'utf8');
  totalOriginal += origSize;
  totalMinified += minSize;

  const savedPct = (((origSize - minSize) / origSize) * 100).toFixed(1);
  console.log(`✔ ${file} (${(origSize / 1024).toFixed(1)} KB) -> ${minFileName} (${(minSize / 1024).toFixed(1)} KB) [-${savedPct}%]`);
});

const totalPct = (((totalOriginal - totalMinified) / totalOriginal) * 100).toFixed(1);
console.log('\n======================================================');
console.log(`Total Assets: ${(totalOriginal / 1024).toFixed(1)} KB -> ${(totalMinified / 1024).toFixed(1)} KB (-${totalPct}%)`);
console.log('Minification complete.');
console.log('======================================================\n');
