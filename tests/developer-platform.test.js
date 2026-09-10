/**
 * Developer Platform Light Tech UI Test Suite
 * Validates developer.html against all exact prompt specifications:
 * - 0px brutalist buttons (btn-square)
 * - 100px status chips (v-chip)
 * - Event Stream Table (240px sidebar + SPAN, START, DURATION with timeline bars)
 * - 3-Column Bento Feature Grid (Regression, Failure Clustering, Version Replay)
 * - 4-Column Metrics Grid (56px Geist Mono with -3.36px tracking)
 * - Strict Light Theme palette and token integrity
 */

const fs = require('fs');
const path = require('path');
const { DOMParserLite, Assert } = require('./test-utils');

function runDeveloperPlatformTests() {
  console.log('\n================================================================================');
  console.log('   DEVELOPER PLATFORM LIGHT TECH SPEC SUITE (developer.html)                   ');
  console.log('================================================================================\n');

  const htmlPath = path.resolve(__dirname, '../developer.html');
  const cssPath = path.resolve(__dirname, '../developer.css');
  const jsPath = path.resolve(__dirname, '../developer.js');

  Assert.isTrue(fs.existsSync(htmlPath), 'developer.html exists');
  Assert.isTrue(fs.existsSync(cssPath), 'developer.css exists');
  Assert.isTrue(fs.existsSync(jsPath), 'developer.js exists');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const js = fs.readFileSync(jsPath, 'utf8');
  const dom = new DOMParserLite(html);

  let passed = 0;
  let assertions = 0;

  function test(name, fn) {
    try {
      const count = fn();
      assertions += count;
      passed++;
      console.log(`  ✔ [DEV] ${name} (${count} assertions)`);
    } catch (err) {
      console.error(`  ✘ [DEV] ${name} FAILED: ${err.message}`);
      throw err;
    }
  }

  // 1. Light Theme & Canvas Architecture
  test('Light Theme & Canvas Tokens', () => {
    Assert.contains(html, 'light-tech-body', 'Body has light-tech-body class');
    Assert.contains(css, '--bg-canvas: #FAFAFA', 'Canvas background is light #FAFAFA');
    Assert.contains(css, '--text-primary: #121212', 'Primary text is high-contrast #121212');
    Assert.contains(css, '--accent-blue: #52a8ff', 'Accent blue is #52a8ff');
    Assert.contains(css, '--accent-green: #62c073', 'Success green is #62c073');
    return 5;
  });

  // 2. Brutalist Buttons (0px border-radius)
  test('Brutalist 0px Button Architecture', () => {
    const squareBtns = dom.querySelectorAll('.btn-square');
    Assert.isGreaterThanOrEqual(squareBtns.length, 3, 'Multiple btn-square elements exist');
    Assert.contains(css, 'border-radius: 0px !important', 'btn-square has strict 0px radius');
    Assert.contains(css, 'background-color: #121212', 'btn-square background is #121212');
    Assert.contains(html, '&nearr;', 'btn-square includes diagonal arrow icon');
    return 4;
  });

  // 3. Status Chips (100px pill radius)
  test('Pill Status Chips (v-chip)', () => {
    const chips = dom.querySelectorAll('.v-chip');
    Assert.isGreaterThanOrEqual(chips.length, 6, 'v-chip status indicators exist across views');
    Assert.contains(css, 'border-radius: 100px !important', 'v-chip has 100px pill radius');
    Assert.contains(css, '.v-chip-dot.dot-pass', 'CSS defines green pass dot');
    Assert.contains(css, '.v-chip-dot.dot-fail', 'CSS defines fail dot');
    Assert.contains(css, '.v-chip-dot.dot-active', 'CSS defines active blue dot');
    return 5;
  });

  // 4. Absolute Header Architecture
  test('Absolute Header Specification', () => {
    const header = dom.querySelector('.dev-header');
    Assert.exists(header, 'dev-header exists in DOM');
    Assert.contains(css, 'top: 38px', 'Header top offset is 38px');
    Assert.contains(css, 'padding: 0 56px', 'Header horizontal padding is 56px');
    Assert.contains(html, 'Aarambhx', 'Brand logo contains Aarambhx');
    Assert.contains(html, 'DEVSTREAM', 'Brand contains DEVSTREAM');
    Assert.contains(html, 'Book a demo', 'Header contains Book a demo CTA');
    return 6;
  });

  // 5. Hero Section (100svh, Light Scrim, Headline-Fluid)
  test('Hero Section Architecture', () => {
    const hero = dom.getElementById('hero');
    Assert.exists(hero, '#hero section exists');
    Assert.contains(css, 'min-height: 100svh', 'Hero is 100svh canvas frame');
    Assert.contains(css, 'linear-gradient(to top, rgba(250, 250, 250', 'Hero uses light scrim gradient');
    const headline = dom.querySelector('.headline-fluid');
    Assert.exists(headline, 'Headline uses .headline-fluid class');
    Assert.contains(css, 'clamp(32px, 5.5vw, 60px)', 'Fluid typography scales 32px to 60px');
    Assert.contains(headline.textContent, 'Real-Time Distributed Tracing', 'Headline content match');
    return 6;
  });

  // 6. Event Stream Table (Split View, 240px Sidebar, Progress Bars)
  test('Event Stream Table & 240px Sidebar', () => {
    const stream = dom.getElementById('stream');
    Assert.exists(stream, '#stream section exists');
    Assert.contains(html, 'trace_992f8a1c', 'Header contains trace ID');
    
    const sidebar = dom.querySelector('.event-sidebar');
    Assert.exists(sidebar, 'Left event sidebar exists');
    Assert.contains(css, 'width: 240px', 'Sidebar width is 240px');

    const eventItems = dom.querySelectorAll('.event-item');
    Assert.isGreaterThanOrEqual(eventItems.length, 5, 'Event list has multiple scrollable event IDs');

    const table = dom.querySelector('.stream-table');
    Assert.exists(table, 'Stream table exists');
    Assert.contains(html, 'SPAN', 'Table has SPAN column');
    Assert.contains(html, 'START', 'Table has START column');
    Assert.contains(html, 'DURATION', 'Table has DURATION column');

    const bars = dom.querySelectorAll('.timeline-bar-inner');
    Assert.isGreaterThanOrEqual(bars.length, 5, 'Timeline relative progress bars exist');
    return 10;
  });

  // 7. 3-Column Bento Feature Grid
  test('3-Column Bento Grid Features', () => {
    const bento = dom.getElementById('bento');
    Assert.exists(bento, '#bento section exists');
    
    const cards = dom.querySelectorAll('.dev-bento-card');
    Assert.equal(cards.length, 3, 'Bento grid has exactly 3 feature cards');

    // Card 1: Regression
    Assert.contains(cards[0].textContent, 'Regression Detection', 'Card 1 is Regression');
    Assert.contains(cards[0].textContent, 'PASS', 'Card 1 contains PASS status');
    Assert.contains(cards[0].textContent, '%', 'Card 1 contains percentage deltas');

    // Card 2: Failure Clustering
    Assert.contains(cards[1].textContent, 'Failure Clustering', 'Card 2 is Failure Clustering');
    const chartBars = cards[1].querySelectorAll('.cluster-stacked-bar');
    Assert.isGreaterThanOrEqual(chartBars.length, 2, 'Card 2 has stacked horizontal bar charts');

    // Card 3: Version Replay
    Assert.contains(cards[2].textContent, 'Version Replay', 'Card 3 is Version Replay');
    const diffLines = cards[2].querySelectorAll('.diff-line');
    Assert.isGreaterThanOrEqual(diffLines.length, 4, 'Card 3 has code-diff lines');
    Assert.contains(css, 'border-left: 3px solid var(--accent-green)', 'Added lines have green left border');
    Assert.contains(css, 'border-left: 3px solid var(--accent-blue)', 'Modified lines have blue left border');
    return 10;
  });

  // 8. 4-Column Metrics Grid (56px Geist Mono, -3.36px Tracking)
  test('4-Column Metrics Grid Specifications', () => {
    const metrics = dom.getElementById('metrics');
    Assert.exists(metrics, '#metrics section exists');

    const cells = dom.querySelectorAll('.metric-cell');
    Assert.equal(cells.length, 4, 'Metrics grid has exactly 4 border-connected cells');

    Assert.contains(css, 'font-size: 56px', 'Metric value font-size is 56px');
    Assert.contains(css, 'letter-spacing: -3.36px', 'Metric value tracking is -3.36px');
    Assert.contains(html, '1.24', 'Cell 1 has 1.24 latency');
    Assert.contains(html, 'ms', 'Cell 1 has ms unit');
    Assert.contains(html, '840', 'Cell 2 has 840M traces');
    Assert.contains(html, '99.99', 'Cell 3 has 99.99% availability');
    Assert.contains(html, '12.8', 'Cell 4 has 12.8k spans');
    return 9;
  });

  // 9. Interactive JavaScript Engine (developer.js)
  test('Interactive Event Selection & Mobile Drawer JS', () => {
    Assert.contains(js, 'initEventStreamSelector', 'developer.js defines event selector');
    Assert.contains(js, 'initMobileDrawer', 'developer.js defines mobile drawer');
    Assert.contains(js, 'highlighted', 'JS manages row highlight state');
    Assert.contains(js, 'Escape', 'JS handles ESC key dismissal');
    return 4;
  });

  console.log(`\n✔ ALL ${passed} DEVELOPER PLATFORM TESTS PASSED (${assertions} assertions)\n`);
  return { passed, assertions };
}

if (require.main === module) {
  runDeveloperPlatformTests();
}

module.exports = { runDeveloperPlatformTests };
