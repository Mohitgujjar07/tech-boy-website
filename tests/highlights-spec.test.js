/**
 * Instagram Reels & Work Highlights Spec Suite
 * Validates highlights.html, highlights.css, highlights.js, home glimpse section, and cross-site links.
 */

const fs = require('fs');
const path = require('path');
const { Assert } = require('./test-utils');

function runHighlightsSpecTests() {
  console.log('\n================================================================================');
  console.log('   AARAMBHX REELS & HIGHLIGHTS SPEC SUITE (highlights.html)                     ');
  console.log('================================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const htmlPath = path.join(rootDir, 'highlights.html');
  const cssPath = path.join(rootDir, 'highlights.css');
  const minCssPath = path.join(rootDir, 'highlights.min.css');
  const jsPath = path.join(rootDir, 'highlights.js');
  const minJsPath = path.join(rootDir, 'highlights.min.js');
  const indexHtmlPath = path.join(rootDir, 'index.html');
  const academyHtmlPath = path.join(rootDir, 'academy.html');
  const workHtmlPath = path.join(rootDir, 'work.html');

  let passed = 0;
  let assertions = 0;

  function test(name, fn) {
    try {
      const count = fn();
      assertions += count;
      passed++;
      console.log(`  ✔ [HIGHLIGHTS] ${name} (${count} assertions)`);
    } catch (err) {
      console.error(`  ✘ [HIGHLIGHTS] ${name} FAILED: ${err.message}`);
      throw err;
    }
  }

  // 1. File Existence & Asset Integrity
  test('Core Highlights Files & Assets Exist', () => {
    Assert.isTrue(fs.existsSync(htmlPath), 'highlights.html exists');
    Assert.isTrue(fs.existsSync(cssPath), 'highlights.css exists');
    Assert.isTrue(fs.existsSync(minCssPath), 'highlights.min.css exists');
    Assert.isTrue(fs.existsSync(jsPath), 'highlights.js exists');
    Assert.isTrue(fs.existsSync(minJsPath), 'highlights.min.js exists');
    return 5;
  });

  // 2. Highlights HTML Architecture & Instagram Reels
  test('Instagram Reels Integration & Profile Links', () => {
    const html = fs.readFileSync(htmlPath, 'utf8');
    Assert.contains(html, '<!DOCTYPE html>', 'Valid DOCTYPE');
    Assert.contains(html, 'DdZJtHavGHu', 'Reel 1 ID DdZJtHavGHu present');
    Assert.contains(html, 'Ddatp9hvGxd', 'Reel 2 ID Ddatp9hvGxd present');
    Assert.contains(html, 'https://www.instagram.com/aarambhx_technology', 'Profile link present');
    Assert.contains(html, 'data-filter="workshops"', 'Workshops filter present');
    Assert.contains(html, 'data-filter="hardware"', 'Hardware filter present');
    Assert.contains(html, 'data-filter="software"', 'Software filter present');
    Assert.contains(html, 'id="hlThemeToggle"', 'Theme toggle button present');
    return 8;
  });

  // 3. Home Page Glimpse Integration (index.html)
  test('Home Page Glimpse Section Architecture', () => {
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    Assert.contains(indexHtml, 'id="highlights"', 'Highlights section exists on home page');
    Assert.contains(indexHtml, 'highlights.html', 'Home page links to highlights.html');
    Assert.contains(indexHtml, 'home-reels-section', 'home-reels-section class present');
    Assert.contains(indexHtml, 'home-reels-row', '3-card reel row present');
    Assert.contains(indexHtml, '@aarambhx_technology', 'Instagram handle present in home glimpse');
    return 5;
  });

  // 4. Cross-Site Navigation Integration
  test('Cross-Site Navigation Links in Academy, Index, and Work', () => {
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    const academyHtml = fs.readFileSync(academyHtmlPath, 'utf8');
    const workHtml = fs.readFileSync(workHtmlPath, 'utf8');

    Assert.contains(indexHtml, 'href="highlights.html"', 'index.html links to highlights.html');
    Assert.contains(academyHtml, 'href="highlights.html"', 'academy.html links to highlights.html');
    Assert.contains(workHtml, 'href="highlights.html"', 'work.html links to highlights.html');
    return 3;
  });

  return { passed, assertions };
}

if (require.main === module) {
  runHighlightsSpecTests();
}

module.exports = { runHighlightsSpecTests };
