/**
 * Interactive 3D Institutional Brochure Test Suite
 * Validates brochure.html, brochure.css, brochure.js, assets, and navigation integration.
 */

const fs = require('fs');
const path = require('path');
const { Assert } = require('./test-utils');

function runBrochureSpecTests() {
  console.log('\n================================================================================');
  console.log('   AARAMBHX BROCHURE 3D FLIPBOOK SPEC SUITE (brochure.html)                    ');
  console.log('================================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const htmlPath = path.join(rootDir, 'brochure.html');
  const cssPath = path.join(rootDir, 'brochure.css');
  const minCssPath = path.join(rootDir, 'brochure.min.css');
  const jsPath = path.join(rootDir, 'brochure.js');
  const minJsPath = path.join(rootDir, 'brochure.min.js');
  const pdfPath = path.join(rootDir, 'assets', 'brochure', 'aarambhx-institutional-brochure.pdf');
  const libPath = path.join(rootDir, 'assets', 'brochure', 'page-flip.browser.js');

  let passed = 0;
  let assertions = 0;

  function test(name, fn) {
    try {
      const count = fn();
      assertions += count;
      passed++;
      console.log(`  ✔ [BROCHURE] ${name} (${count} assertions)`);
    } catch (err) {
      console.error(`  ✘ [BROCHURE] ${name} FAILED: ${err.message}`);
      throw err;
    }
  }

  // 1. File Existence & Integrity
  test('Core Brochure Files & PDF Document Integrity', () => {
    Assert.isTrue(fs.existsSync(htmlPath), 'brochure.html exists');
    Assert.isTrue(fs.existsSync(cssPath), 'brochure.css exists');
    Assert.isTrue(fs.existsSync(minCssPath), 'brochure.min.css exists');
    Assert.isTrue(fs.existsSync(jsPath), 'brochure.js exists');
    Assert.isTrue(fs.existsSync(minJsPath), 'brochure.min.js exists');
    Assert.isTrue(fs.existsSync(pdfPath), 'aarambhx-institutional-brochure.pdf exists');
    Assert.isTrue(fs.existsSync(libPath), 'page-flip.browser.js library exists');
    
    const pdfStat = fs.statSync(pdfPath);
    Assert.isTrue(pdfStat.size > 800000, 'PDF size is valid (> 800 KB)');
    return 8;
  });

  // 2. 12 Pages and Thumbnails Verification
  test('All 12 High-Res Pages and Thumbnails Generated', () => {
    let checked = 0;
    for (let i = 1; i <= 12; i++) {
      const webpPath = path.join(rootDir, 'assets', 'brochure', 'pages', `page-${i}.webp`);
      const thumbPath = path.join(rootDir, 'assets', 'brochure', 'pages', `thumb-${i}.webp`);
      Assert.isTrue(fs.existsSync(webpPath), `Page ${i} WebP exists`);
      Assert.isTrue(fs.existsSync(thumbPath), `Thumb ${i} WebP exists`);
      Assert.isTrue(fs.statSync(webpPath).size > 50000, `Page ${i} WebP has sufficient data`);
      Assert.isTrue(fs.statSync(thumbPath).size > 4000, `Thumb ${i} WebP has sufficient data`);
      checked += 4;
    }
    return checked;
  });

  // 3. HTML Markup & Architecture
  test('HTML Structure, Semantic Elements & Accessibility', () => {
    const html = fs.readFileSync(htmlPath, 'utf8');
    Assert.contains(html, '<!DOCTYPE html>', 'Valid DOCTYPE');
    Assert.contains(html, 'id="flipbook"', 'Flipbook container exists');
    Assert.contains(html, 'download="aarambhx-institutional-brochure.pdf"', 'Direct PDF download attribute present');
    Assert.contains(html, 'id="downloadPdfBtn"', 'Download button id present');
    Assert.contains(html, 'id="current-page"', 'Current page indicator element present');
    Assert.contains(html, 'id="thumbnailsDrawer"', 'Thumbnails drawer element present');
    Assert.contains(html, 'id="soundToggleBtn"', 'Sound toggle button present');
    Assert.contains(html, 'id="fullscreenToggleBtn"', 'Fullscreen toggle button present');
    Assert.contains(html, 'data-density="hard"', 'Hardcover density present for cover pages');
    Assert.contains(html, 'assets/brochure/page-flip.browser.js', 'PageFlip library script included');
    return 10;
  });

  // 4. Cross-Site Navigation Integration
  test('Cross-Site Navigation Entry Points in Academy, Index, and Work', () => {
    const academyHtml = fs.readFileSync(path.join(rootDir, 'academy.html'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    const workHtml = fs.readFileSync(path.join(rootDir, 'work.html'), 'utf8');

    Assert.contains(academyHtml, 'href="brochure.html"', 'academy.html links to brochure.html');
    Assert.contains(indexHtml, 'href="brochure.html"', 'index.html links to brochure.html');
    Assert.contains(workHtml, 'href="brochure.html"', 'work.html links to brochure.html');
    Assert.contains(academyHtml, 'Institutional Brochure', 'academy.html mentions Institutional Brochure');
    return 4;
  });

  return { passed, assertions };
}

if (require.main === module) {
  runBrochureSpecTests();
}

module.exports = { runBrochureSpecTests };
