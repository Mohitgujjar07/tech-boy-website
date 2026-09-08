/**
 * ScrollExpand Component Spec & Integration Test Suite
 * Validates the React Bits <ScrollExpand /> component implementation:
 * - ScrollExpand.jsx React Component
 * - ScrollExpand.css Stylesheet & Tokens
 * - scroll-expand.js Vanilla Controller & Math
 * - index.html Live Integration & Data Mount
 */

const fs = require('fs');
const path = require('path');
const { DOMParserLite, Assert } = require('./test-utils');

function runScrollExpandTests() {
  console.log('\n================================================================================');
  console.log('   REACT BITS <ScrollExpand /> SPEC SUITE (scroll-expand.test.js)             ');
  console.log('================================================================================\n');

  const jsxPath = path.resolve(__dirname, '../ScrollExpand.jsx');
  const cssPath = path.resolve(__dirname, '../ScrollExpand.css');
  const jsPath = path.resolve(__dirname, '../scroll-expand.js');
  const htmlPath = path.resolve(__dirname, '../index.html');

  Assert.isTrue(fs.existsSync(jsxPath), 'ScrollExpand.jsx exists');
  Assert.isTrue(fs.existsSync(cssPath), 'ScrollExpand.css exists');
  Assert.isTrue(fs.existsSync(jsPath), 'scroll-expand.js exists');
  Assert.isTrue(fs.existsSync(htmlPath), 'index.html exists');

  const jsx = fs.readFileSync(jsxPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const js = fs.readFileSync(jsPath, 'utf8');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new DOMParserLite(html);

  let passed = 0;
  let assertions = 0;

  function test(name, fn) {
    try {
      const count = fn();
      assertions += count;
      passed++;
      console.log(`  ✔ [SCROLL-EXPAND] ${name} (${count} assertions)`);
    } catch (err) {
      console.error(`  ✘ [SCROLL-EXPAND] ${name} FAILED: ${err.message}`);
      throw err;
    }
  }

  // 1. React Component Source Contract
  test('React Component Props & Hooks Integrity', () => {
    Assert.contains(jsx, 'export default ScrollExpand', 'Default export ScrollExpand exists');
    Assert.contains(jsx, 'useCallback', 'Uses useCallback for memoized progress');
    Assert.contains(jsx, 'useEffect', 'Uses useEffect for lifecycle listeners');
    Assert.contains(jsx, 'useRef', 'Uses useRef for DOM nodes and props cache');
    Assert.contains(jsx, 'smoothstep', 'Defines smoothstep cubic Hermite interpolation');
    Assert.contains(jsx, 'startWidth = 42', 'Default startWidth is 42');
    Assert.contains(jsx, 'startHeight = 58', 'Default startHeight is 58');
    Assert.contains(jsx, 'mediaZoom = 1.35', 'Default mediaZoom is 1.35');
    Assert.contains(jsx, 'useWindowScroll', 'Accepts useWindowScroll prop');
    return 9;
  });

  // 2. CSS Class Rules & Layout Architecture
  test('Component CSS Class Hierarchy', () => {
    Assert.contains(css, '.scroll-expand', 'Defines root .scroll-expand');
    Assert.contains(css, '.scroll-expand__track', 'Defines .scroll-expand__track');
    Assert.contains(css, '.scroll-expand__stage', 'Defines .scroll-expand__stage');
    Assert.contains(css, 'position: sticky', 'Stage has sticky positioning');
    Assert.contains(css, '.scroll-expand__frame', 'Defines .scroll-expand__frame');
    Assert.contains(css, 'will-change: clip-path', 'Frame optimizes clip-path with will-change');
    Assert.contains(css, '.scroll-expand__media', 'Defines .scroll-expand__media');
    Assert.contains(css, 'object-fit: cover', 'Media uses object-fit cover');
    Assert.contains(css, '.scroll-expand__scrim', 'Defines .scroll-expand__scrim');
    Assert.contains(css, '.scroll-expand__title', 'Defines .scroll-expand__title');
    Assert.contains(css, '.scroll-expand__hint', 'Defines .scroll-expand__hint');
    Assert.contains(css, '.scroll-expand__overlay', 'Defines .scroll-expand__overlay');
    return 12;
  });

  // 3. Live Website Integration in index.html
  test('index.html Mount Point & Attributes', () => {
    Assert.contains(html, 'href="ScrollExpand.css"', 'ScrollExpand.css linked in head');
    Assert.contains(html, 'src="scroll-expand.js"', 'scroll-expand.js script included');
    
    const section = dom.querySelector('.scroll-expand-section');
    Assert.exists(section, '.scroll-expand-section exists in index.html');
    
    const mount = dom.querySelector('[data-scroll-expand="true"]');
    Assert.exists(mount, 'data-scroll-expand="true" mount element exists');
    Assert.contains(html, 'data-src="/hero.jpg"', 'Points to /hero.jpg media');
    Assert.contains(html, 'data-title="Built to scale"', 'Includes "Built to scale" title');
    Assert.contains(html, 'data-use-window-scroll="true"', 'Enables window scroll driving');
    return 7;
  });

  // 4. Overlay Content & Messaging
  test('Overlay Children & CTA Architecture', () => {
    const headline = dom.querySelector('.scroll-expand-headline');
    Assert.exists(headline, '.scroll-expand-headline exists');
    Assert.contains(headline.textContent, 'Every pixel, everywhere', 'Headline matches React Bits copy');

    const lead = dom.querySelector('.scroll-expand-lead');
    Assert.exists(lead, '.scroll-expand-lead exists');
    Assert.contains(lead.textContent, 'The frame opens up as you scroll', 'Lead matches React Bits narrative');

    const actions = dom.querySelector('.scroll-expand-actions');
    Assert.exists(actions, 'Action buttons container exists');
    Assert.contains(html, 'developer.html', 'Includes link to Developer Platform');
    return 6;
  });

  // 5. Vanilla Controller Math & Physics (scroll-expand.js)
  test('Controller Smoothstep & Clip-Path Geometry', () => {
    Assert.contains(js, 'function smoothstep', 'Implements smoothstep formula');
    Assert.contains(js, 't * t * (3 - 2 * t)', 'Uses Hermite polynomial curve');
    Assert.contains(js, 'function clamp', 'Implements clamp boundary helper');
    Assert.contains(js, 'clipPath', 'Computes clipPath insets dynamically');
    Assert.contains(js, 'inset(', 'Uses CSS inset() rectangle notation');
    Assert.contains(js, 'round', 'Calculates corner radius easing');
    Assert.contains(js, 'media.style.transform = `scale(', 'Eases media zoom from mediaZoom to 1.0');
    Assert.contains(js, 'scrim.style.opacity', 'Controls scrim gradient opacity');
    return 8;
  });

  // 6. Title Lift-Away & Scroll Hint Fade Timing
  test('Title & Hint Progression Curves', () => {
    Assert.contains(js, 'smoothstep(0.4, 0.88, p)', 'Title lifts away between p=0.4 and p=0.88');
    Assert.contains(js, 'translate3d(0, ${-28 * out}px, 0)', 'Title translates -28px on lift');
    Assert.contains(js, 'smoothstep(0, 0.12, p)', 'Hint fades away in early scroll (p <= 0.12)');
    Assert.contains(js, 'smoothstep(0.68, 1, p)', 'Overlay fades in at late scroll (p >= 0.68)');
    return 4;
  });

  // 7. Window Scroll & Stage Height Calculation
  test('Window Scroll & Stage Measurements', () => {
    Assert.contains(js, 'useWindowScroll', 'Supports useWindowScroll option');
    Assert.contains(js, 'window.innerHeight', 'Measures window.innerHeight for stage height');
    Assert.contains(js, 'track.getBoundingClientRect().top', 'Uses getBoundingClientRect for window scroll offset');
    Assert.contains(js, 'scrollDistance', 'Incorporates scrollDistance multiplier');
    Assert.contains(js, 'holdDistance', 'Incorporates holdDistance pin duration');
    return 5;
  });

  // 8. Resilience: Reduced Motion & Auto-Discovery
  test('Reduced Motion & Auto-Initialization', () => {
    Assert.contains(js, 'prefers-reduced-motion', 'Checks prefers-reduced-motion media query');
    Assert.contains(js, 'initAutoScrollExpand', 'Provides initAutoScrollExpand DOM auto-discovery');
    Assert.contains(js, 'global.ScrollExpand', 'Exports ScrollExpand to window / global scope');
    Assert.contains(js, 'DOMContentLoaded', 'Binds to DOMContentLoaded event');
    return 4;
  });

  console.log(`\n✔ ALL ${passed} SCROLL-EXPAND TESTS PASSED (${assertions} assertions)\n`);
  return { passed, assertions };
}

if (require.main === module) {
  runScrollExpandTests();
}

module.exports = { runScrollExpandTests };
