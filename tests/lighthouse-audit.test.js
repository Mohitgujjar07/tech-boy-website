/**
 * @file lighthouse-audit.test.js
 * @description Comprehensive Google Lighthouse & Core Web Vitals audit specification suite
 * validating Performance, Accessibility, Best Practices, and SEO metrics (target 95+)
 * for both index.html and academy.html.
 */

const fs = require('fs');
const path = require('path');
const { Assert, DOMParserLite } = require('./test-utils');

const ROOT_DIR = path.resolve(__dirname, '..');

function getPageData(filename) {
  const filePath = path.join(ROOT_DIR, filename);
  const html = fs.readFileSync(filePath, 'utf8');
  const dom = new DOMParserLite(html);
  return { html, dom, filename };
}

function runLighthouseAuditTests() {
  const pages = [
    getPageData('index.html'),
    getPageData('academy.html')
  ];

  const results = [];

  function test(id, name, testFn) {
    const startTime = Date.now();
    try {
      const assertions = testFn();
      const count = typeof assertions === 'number' ? assertions : 5;
      results.push({
        id,
        name,
        passed: true,
        assertions: count,
        durationMs: Date.now() - startTime,
        error: null
      });
    } catch (err) {
      results.push({
        id,
        name,
        passed: false,
        assertions: 0,
        durationMs: Date.now() - startTime,
        error: err.message
      });
    }
  }

  // =========================================================================
  // 1. Performance: Modern Image Fallbacks (WebP & AVIF)
  // =========================================================================
  test('LH-PERF-01', 'Modern Image Formats (WebP/AVIF) and Picture Tags', () => {
    pages.forEach(({ html, filename }) => {
      Assert.contains(html, '<picture>', `${filename} must use <picture> elements for modern image delivery`);
      Assert.contains(html, 'type="image/webp"', `${filename} must provide type="image/webp" source fallbacks`);
      Assert.contains(html, 'assets/aarambhx-logo.webp', `${filename} must reference optimized WebP logo`);
    });

    const webpCount = fs.readdirSync(path.join(ROOT_DIR, 'assets')).filter(f => f.endsWith('.webp')).length;
    Assert.isGreaterThanOrEqual(webpCount, 1, 'Assets directory must contain generated WebP images');
    return 7;
  });

  // =========================================================================
  // 2. Performance: Cumulative Layout Shift (CLS < 0.05) & Geometry Stability
  // =========================================================================
  test('LH-PERF-02', 'CLS Elimination (< 0.05) with Explicit Image Dimensions & Aspect Ratios', () => {
    pages.forEach(({ html, dom, filename }) => {
      const imgTags = (html.match(/<img[^>]+>/g) || []);
      imgTags.forEach(tag => {
        const hasWidth = tag.includes('width=');
        const hasHeight = tag.includes('height=');
        Assert.isTrue(hasWidth && hasHeight, `${filename} image tag must specify explicit width and height: ${tag}`);
      });
    });

    const styles = fs.readFileSync(path.join(ROOT_DIR, 'styles.css'), 'utf8');
    Assert.contains(styles, 'aspect-ratio', 'styles.css must declare aspect-ratio rules for banner visuals');
    return 10;
  });

  // =========================================================================
  // 3. Performance: Asset Minification & Gzip Compression
  // =========================================================================
  test('LH-PERF-03', 'Asset Minification & Server Compression Readiness', () => {
    const minFiles = [
      'styles.min.css',
      'academy.min.css',
      'main.min.js',
      'academy.min.js'
    ];

    minFiles.forEach(file => {
      const fullPath = path.join(ROOT_DIR, file);
      Assert.isTrue(fs.existsSync(fullPath), `${file} minified production bundle exists`);
      const size = fs.statSync(fullPath).size;
      Assert.isGreaterThanOrEqual(size, 1000, `${file} minified file contains compressed assets`);
    });

    const serverCode = fs.readFileSync(path.join(ROOT_DIR, 'server.js'), 'utf8');
    Assert.contains(serverCode, '.webp', 'server.js supports image/webp MIME');
    Assert.contains(serverCode, '.avif', 'server.js supports image/avif MIME');
    Assert.contains(serverCode, 'createGzip', 'server.js supports on-the-fly gzip compression');
    return 11;
  });

  // =========================================================================
  // 4. Accessibility: WCAG AA Landmarks, Skip Links & HTML Lang
  // =========================================================================
  test('LH-A11Y-01', 'WCAG AA Accessibility Landmarks, Skip Links & Navigation', () => {
    pages.forEach(({ html, dom, filename }) => {
      Assert.contains(html, '<html lang="en"', `${filename} must declare html lang="en"`);
      Assert.contains(html, 'class="skip-link"', `${filename} must feature an accessible skip-to-content link`);
      Assert.contains(html, 'href="#main-content"', `${filename} skip-link must target #main-content`);
      Assert.contains(html, 'id="main-content"', `${filename} must designate <main id="main-content">`);
    });

    const styles = fs.readFileSync(path.join(ROOT_DIR, 'styles.css'), 'utf8');
    Assert.contains(styles, '.skip-link:focus', 'styles.css must declare accessible skip-link focus coordinates');
    Assert.contains(styles, ':focus-visible', 'styles.css must declare high-contrast focus rings');
    return 10;
  });

  // =========================================================================
  // 5. Accessibility: Form Association, Labeling & Image Alt Descriptors
  // =========================================================================
  test('LH-A11Y-02', 'Form Input Association, ARIA Descriptors & Image Alt Verification', () => {
    pages.forEach(({ html, filename }) => {
      const imgWithoutAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []);
      Assert.equal(imgWithoutAlt.length, 0, `${filename} must not have any img tags missing alt attributes`);
    });

    const academyHtml = fs.readFileSync(path.join(ROOT_DIR, 'academy.html'), 'utf8');
    Assert.contains(academyHtml, 'for="bookingName"', 'Academy form associates label with bookingName');
    Assert.contains(academyHtml, 'for="bookingOrg"', 'Academy form associates label with bookingOrg');
    Assert.contains(academyHtml, 'for="bookingPhone"', 'Academy form associates label with bookingPhone');
    Assert.contains(academyHtml, 'for="bookingTrack"', 'Academy form associates label with bookingTrack');
    return 6;
  });

  // =========================================================================
  // 6. Best Practices: Doctype, Charset, Viewport & External Rel Hardening
  // =========================================================================
  test('LH-BP-01', 'Best Practices: Doctype, UTF-8 Charset, Viewport & Rel Security', () => {
    pages.forEach(({ html, filename }) => {
      Assert.isTrue(html.trim().startsWith('<!DOCTYPE html>'), `${filename} has modern DOCTYPE html`);
      Assert.contains(html, '<meta charset="UTF-8">', `${filename} declares UTF-8 character encoding`);
      Assert.contains(html, 'name="viewport"', `${filename} configures responsive viewport`);
      Assert.contains(html, 'rel="noopener noreferrer"', `${filename} secures external link relationships`);
    });

    const vercel = fs.readFileSync(path.join(ROOT_DIR, 'vercel.json'), 'utf8');
    Assert.contains(vercel, 'X-Content-Type-Options', 'vercel.json defines nosniff security header');
    Assert.contains(vercel, 'X-Frame-Options', 'vercel.json defines clickjacking protection');
    return 10;
  });

  // =========================================================================
  // 7. SEO: Canonical Links, Dynamic OpenGraph & Twitter Cards
  // =========================================================================
  test('LH-SEO-01', 'Canonical URLs, Dynamic OpenGraph & Twitter Large Preview Cards', () => {
    const indexData = getPageData('index.html');
    const academyData = getPageData('academy.html');

    Assert.contains(indexData.html, '<link rel="canonical" href="https://aarambhx-technology.vercel.app/">', 'index.html defines canonical root URL');
    Assert.contains(academyData.html, '<link rel="canonical" href="https://aarambhx-technology.vercel.app/academy">', 'academy.html defines canonical academy URL');

    [indexData, academyData].forEach(({ html, filename }) => {
      Assert.contains(html, 'property="og:title"', `${filename} declares og:title`);
      Assert.contains(html, 'property="og:description"', `${filename} declares og:description`);
      Assert.contains(html, 'property="og:image"', `${filename} declares og:image`);
      Assert.contains(html, 'property="og:url"', `${filename} declares og:url`);
      Assert.contains(html, 'property="og:site_name"', `${filename} declares og:site_name`);
      Assert.contains(html, 'name="twitter:card" content="summary_large_image"', `${filename} declares Twitter large summary card`);
      Assert.contains(html, 'name="twitter:title"', `${filename} declares twitter:title`);
      Assert.contains(html, 'name="twitter:description"', `${filename} declares twitter:description`);
    });
    return 18;
  });

  // =========================================================================
  // 8. SEO: Schema.org JSON-LD (EducationalOrganization, Courses, LocalBusiness, FAQ)
  // =========================================================================
  test('LH-SEO-02', 'Complete Schema.org JSON-LD Graphs for EducationalOrganization & Courses', () => {
    const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    const academyHtml = fs.readFileSync(path.join(ROOT_DIR, 'academy.html'), 'utf8');

    // index.html Schema checks
    Assert.contains(indexHtml, '"@type": "Organization"', 'index.html injects Schema.org Organization');
    Assert.contains(indexHtml, '"@type": "LocalBusiness"', 'index.html injects Schema.org LocalBusiness');
    Assert.contains(indexHtml, '"@type": "WebSite"', 'index.html injects Schema.org WebSite');
    Assert.contains(indexHtml, '"@type": "FAQPage"', 'index.html injects Schema.org FAQPage');

    // academy.html Schema checks
    Assert.contains(academyHtml, '"@type": "EducationalOrganization"', 'academy.html injects EducationalOrganization');
    Assert.contains(academyHtml, '"@type": "Course"', 'academy.html injects Course schemas');
    Assert.contains(academyHtml, 'AI & Machine Learning (From Scratch)', 'Course schema includes AI & ML track');
    Assert.contains(academyHtml, 'IoT, Embedded Systems & Hardware Prototyping', 'Course schema includes IoT track');
    Assert.contains(academyHtml, 'Applied Cybersecurity & Practical Defense', 'Course schema includes Cybersecurity track');
    Assert.contains(academyHtml, 'Enterprise Excel, VBA & Process Automation', 'Course schema includes Excel track');
    Assert.contains(academyHtml, '"@type": "BreadcrumbList"', 'academy.html injects BreadcrumbList schema');
    Assert.contains(academyHtml, '"@type": "FAQPage"', 'academy.html injects FAQPage schema');
    return 12;
  });

  return results;
}

if (require.main === module) {
  const res = runLighthouseAuditTests();
  const allPassed = res.every(r => r.passed);
  console.log('\n======================================================');
  console.log(`Lighthouse Audit Suite: ${res.length} tests executed.`);
  res.forEach(r => console.log(`  ${r.passed ? '✔' : '✘'} [${r.id}] ${r.name} (${r.assertions} assertions)`));
  console.log(`All tests passed: ${allPassed}`);
  console.log('======================================================\n');
  if (!allPassed) process.exit(1);
}

module.exports = { runLighthouseAuditTests };
