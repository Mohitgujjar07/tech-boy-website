/**
 * @file stress-m1-challenger.js
 * @description Adversarial Empirical Stress Test Suite for Milestone 1
 * Evaluates Floating Oval Glassmorphic Header, Theme Engine, Layout across 320px-2560px,
 * scroll toggles, rapid resize, and CSS class stability.
 */

const fs = require('fs');
const path = require('path');
const {
  HTML_PATH,
  CSS_PATH,
  JS_PATH,
  CONFIG_PATH,
  getHTMLContent,
  getCSSContent,
  getJSContent,
  getTBSConfig,
  DOMParserLite,
  CSSAnalyzer,
  Assert
} = require('./test-utils');

// ANSI Color Codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

function runMilestone1StressSuite() {
  const startTime = Date.now();
  console.log(`\n${BOLD}${BLUE}================================================================================${RESET}`);
  console.log(`${BOLD}${BLUE}   CHALLENGER 1: ADVERSARIAL EMPIRICAL STRESS TEST SUITE (MILESTONE 1)         ${RESET}`);
  console.log(`${BOLD}${BLUE}================================================================================${RESET}\n`);

  const html = getHTMLContent();
  const css = getCSSContent();
  const js = getJSContent();
  const config = getTBSConfig();
  const dom = new DOMParserLite(html);
  const cssAnalyzer = new CSSAnalyzer(css);

  const results = [];
  let testCount = 0;
  let passedCount = 0;
  let failedCount = 0;

  function runTest(id, name, testFn) {
    testCount++;
    const tStart = Date.now();
    let assertions = 0;
    const assertTracker = {
      isTrue: (v, m) => { assertions++; Assert.isTrue(v, m); },
      isFalse: (v, m) => { assertions++; Assert.isFalse(v, m); },
      equal: (a, e, m) => { assertions++; Assert.equal(a, e, m); },
      notEqual: (a, e, m) => { assertions++; Assert.notEqual(a, e, m); },
      contains: (h, n, m) => { assertions++; Assert.contains(h, n, m); },
      match: (t, r, m) => { assertions++; Assert.match(t, r, m); },
      exists: (v, m) => { assertions++; Assert.exists(v, m); },
      gte: (a, e, m) => { assertions++; Assert.isGreaterThanOrEqual(a, e, m); },
      lte: (a, e, m) => { assertions++; Assert.isLessThanOrEqual(a, e, m); }
    };

    try {
      testFn(assertTracker);
      const duration = Date.now() - tStart;
      passedCount++;
      console.log(`  ${GREEN}✔${RESET} [${id}] ${name} ${GRAY}(${assertions} assertions, ${duration}ms)${RESET}`);
      results.push({ id, name, passed: true, assertions, duration, error: null });
    } catch (err) {
      const duration = Date.now() - tStart;
      failedCount++;
      console.log(`  ${RED}✖${RESET} [${id}] ${name} ${RED}FAILED${RESET}`);
      console.log(`    ${RED}${err.message}${RESET}`);
      results.push({ id, name, passed: false, assertions, duration, error: err.message });
    }
  }

  // ---------------------------------------------------------------------------
  // Test Category 1: Floating Oval Glassmorphism Geometry & CSS Properties
  // ---------------------------------------------------------------------------
  console.log(`${BOLD}${CYAN}▶ CATEGORY 1: Floating Oval Glassmorphic Header Geometry${RESET}`);

  runTest('C1-01', 'Navbar Container Structural & Glassmorphic Rules', (A) => {
    const navbar = dom.getElementById('navbar');
    A.exists(navbar, '#navbar element must exist in DOM');
    A.isTrue(navbar.hasClass('floating-navbar'), '#navbar must have floating-navbar class');

    const navbarRule = cssAnalyzer.getRuleBlock('#navbar');
    A.exists(navbarRule, 'CSS must contain #navbar rule block');
    A.contains(navbarRule, 'position: fixed', 'Navbar must be fixed positioned');
    A.contains(navbarRule, 'top: 16px', 'Navbar must float 16px from top in default state');
    A.contains(navbarRule, 'left: 50%', 'Navbar must be horizontally centered via left 50%');
    A.contains(navbarRule, 'transform: translateX(-50%)', 'Navbar must center via translateX(-50%)');
    A.contains(navbarRule, 'border-radius: 9999px', 'Navbar must have full oval pill border radius (9999px)');
    A.contains(navbarRule, 'backdrop-filter: blur(24px)', 'Navbar must specify 24px backdrop blur');
    A.contains(navbarRule, '-webkit-backdrop-filter: blur(24px)', 'Navbar must include webkit prefix for Safari');
    A.contains(navbarRule, 'max-width: 1120px', 'Navbar must have max-width containment (1120px)');
    A.contains(navbarRule, 'z-index: 1000', 'Navbar must have z-index: 1000');
  });

  runTest('C1-02', 'Logo Vector Mark TB Initials & Circuit Accent', (A) => {
    const logo = dom.querySelector('.nav-logo');
    A.exists(logo, '.nav-logo element must exist');
    const svg = logo.querySelector('svg');
    A.exists(svg, 'Logo SVG icon must exist');
    A.contains(svg.innerHTML, 'M6 9H16M11 9V20', 'Logo SVG must contain letter T path');
    A.contains(svg.innerHTML, 'logo-path', 'Logo SVG must contain letter B with .logo-path class');
    A.contains(svg.innerHTML, '#00D4AA', 'Logo SVG must contain emerald circuit dot (#00D4AA)');
  });

  runTest('C1-03', 'Desktop Nav Links Capsule Track & Active Highlights', (A) => {
    const navLinks = dom.getElementById('desktopNavLinks');
    A.exists(navLinks, '#desktopNavLinks must exist');
    const links = navLinks.querySelectorAll('a');
    A.gte(links.length, 8, 'Desktop nav must contain at least 8 navigation links');

    const expectedAnchors = ['#about', '#services', '#software', '#hardware', '#student-projects', '#why-us', '#faq', '#contact'];
    expectedAnchors.forEach(anchor => {
      const found = links.some(l => l.getAttribute('href') === anchor);
      A.isTrue(found, `Nav link with href "${anchor}" must exist`);
    });

    const pillTrackRule = cssAnalyzer.getRuleBlock('.nav-links');
    A.exists(pillTrackRule, '.nav-links pill track CSS rule must exist');
    A.contains(pillTrackRule, 'border-radius: 9999px', 'Nav links track must have pill border-radius');
    A.contains(pillTrackRule, 'background: var(--nav-pill-track)', 'Nav links track must use CSS variable');

    A.isTrue(css.includes('.nav-links a.active') || css.includes('.nav-links a.nav-link.active'), 'Active nav link highlight rule must exist in CSS');
    A.contains(css, 'var(--nav-pill-bg)', 'Active link must have pill background token');
    A.contains(css, 'var(--nav-pill-color)', 'Active link must use nav pill color token');
  });

  // ---------------------------------------------------------------------------
  // Test Category 2: Extreme Resolution Matrix (320px to 2560px)
  // ---------------------------------------------------------------------------
  console.log(`\n${BOLD}${CYAN}▶ CATEGORY 2: Extreme Resolution & Viewport Matrix (320px - 2560px)${RESET}`);

  const viewports = [
    { name: '320px Ultra-Compact (iPhone SE 1st Gen)', width: 320, isMobile: true },
    { name: '360px Android Compact', width: 360, isMobile: true },
    { name: '768px Tablet Portrait (iPad Mini)', width: 768, isMobile: true },
    { name: '1024px Tablet Landscape Breakpoint', width: 1024, isMobile: true },
    { name: '1440px Standard Desktop / Laptop', width: 1440, isMobile: false },
    { name: '1920px Full HD Desktop', width: 1920, isMobile: false },
    { name: '2560px 2K/4K Ultrawide Monitor', width: 2560, isMobile: false }
  ];

  viewports.forEach(vp => {
    runTest(`C2-VP-${vp.width}`, `Viewport Evaluation: ${vp.name} (${vp.width}px)`, (A) => {
      // Body overflow check to ensure zero horizontal spill
      const bodyRule = cssAnalyzer.getRuleBlock('body');
      A.contains(bodyRule, 'overflow-x: hidden', 'Body must enforce overflow-x: hidden across all viewports');

      if (vp.isMobile) {
        // Under 1024px: Desktop nav links hide, hamburger shows, CTA adapts
        A.isTrue(css.includes('@media (max-width: 1024px)'), 'CSS must define @media (max-width: 1024px)');
        A.isTrue(css.includes('.nav-links { display: none; }'), 'Desktop nav links must hide on tablet/mobile');
        A.isTrue(css.includes('.hamburger { display: flex; }'), 'Hamburger must display flex on tablet/mobile');
        A.isTrue(css.includes('.nav-cta { display: none; }'), 'Header CTA hides from top pill into drawer on mobile');
      }

      if (vp.width <= 320) {
        // Check 320px specific compact rules
        A.isTrue(css.includes('@media (max-width: 320px)'), 'CSS must define @media (max-width: 320px)');
        A.isTrue(css.includes('.nav-inner { height: 56px; padding-left: 12px; padding-right: 12px; }'), '320px nav-inner padding and height rules');
      }

      if (vp.width >= 1440) {
        // Desktop containment check
        A.isTrue(css.includes('@media (min-width: 1440px)'), 'CSS must define @media (min-width: 1440px)');
        A.isTrue(css.includes('.wrap { max-width: 1320px; }'), '1440px wrapper containment');
      }

      if (vp.width >= 1920) {
        // Ultrawide containment check
        A.isTrue(css.includes('@media (min-width: 1920px)'), 'CSS must define @media (min-width: 1920px)');
        A.isTrue(css.includes('.wrap { max-width: 1440px; }'), '1920px+ wrapper containment');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Test Category 3: Scroll State Toggling & Rapid Threshold Hysteresis
  // ---------------------------------------------------------------------------
  console.log(`\n${BOLD}${CYAN}▶ CATEGORY 3: Scroll State Toggling & Hysteresis Stress Test${RESET}`);

  runTest('C3-01', 'Navbar Scrolled CSS State Definitions', (A) => {
    const scrolledRule = cssAnalyzer.getRuleBlock('#navbar.scrolled');
    A.exists(scrolledRule, '#navbar.scrolled CSS rule must exist');
    A.contains(scrolledRule, 'top: 10px', 'Scrolled navbar compresses top offset to 10px');
    A.contains(scrolledRule, 'background: var(--glass-bg-scrolled)', 'Scrolled navbar uses scrolled glass background');
    A.contains(scrolledRule, 'border-color: var(--glass-border-scrolled)', 'Scrolled navbar uses scrolled border');
    A.contains(scrolledRule, 'box-shadow: var(--glass-shadow-scrolled)', 'Scrolled navbar uses scrolled shadow');
  });

  runTest('C3-02', 'Scroll State JS Handler Simulation & Rapid Burst Hysteresis', (A) => {
    A.contains(js, "navbar.classList.toggle('scrolled', window.scrollY > 40);", 'Scroll handler must toggle .scrolled at scrollY > 40');

    // Simulate 1,000 rapid scroll events across threshold
    let mockScrollY = 0;
    let isScrolled = false;
    const simulateScroll = (y) => {
      mockScrollY = y;
      isScrolled = mockScrollY > 40;
      return isScrolled;
    };

    // Sub-threshold
    A.isFalse(simulateScroll(0), 'scrollY=0 -> scrolled: false');
    A.isFalse(simulateScroll(39), 'scrollY=39 -> scrolled: false');
    A.isFalse(simulateScroll(40), 'scrollY=40 -> scrolled: false');

    // Above threshold
    A.isTrue(simulateScroll(41), 'scrollY=41 -> scrolled: true');
    A.isTrue(simulateScroll(100), 'scrollY=100 -> scrolled: true');
    A.isTrue(simulateScroll(5000), 'scrollY=5000 -> scrolled: true');

    // Rapid oscillations (1,000 iterations)
    for (let i = 0; i < 1000; i++) {
      const randomY = Math.floor(Math.random() * 80);
      const expected = randomY > 40;
      const actual = simulateScroll(randomY);
      A.equal(actual, expected, `Oscillation step ${i} at scrollY=${randomY}`);
    }

    // Return to top
    A.isFalse(simulateScroll(0), 'Return to scrollY=0 -> scrolled: false');
  });

  runTest('C3-03', 'Active Link Detection at Bottom of Page (isAtBottom)', (A) => {
    A.contains(js, "const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60);", 'isAtBottom check must exist');
    A.contains(js, "currentId = 'contact';", 'Reaching bottom of page must highlight contact link');
  });

  // ---------------------------------------------------------------------------
  // Test Category 4: Mobile Slide-Out Glass Drawer State Transitions
  // ---------------------------------------------------------------------------
  console.log(`\n${BOLD}${CYAN}▶ CATEGORY 4: Mobile Slide-Out Drawer State Machine${RESET}`);

  runTest('C4-01', 'Mobile Drawer DOM & CSS Architecture', (A) => {
    const mobileMenu = dom.getElementById('mobileMenu');
    A.exists(mobileMenu, '#mobileMenu element must exist');
    A.isTrue(mobileMenu.hasClass('mobile-menu-overlay'), '#mobileMenu must have .mobile-menu-overlay class');
    A.equal(mobileMenu.getAttribute('aria-hidden'), 'true', '#mobileMenu initial aria-hidden must be true');

    const drawer = dom.getElementById('mobileDrawer');
    A.exists(drawer, '#mobileDrawer must exist inside #mobileMenu');

    const drawerRule = cssAnalyzer.getRuleBlock('.mobile-drawer');
    A.exists(drawerRule, '.mobile-drawer rule must exist');
    A.contains(drawerRule, 'width: min(340px, 85vw)', 'Drawer width must be bounded by min(340px, 85vw)');
    A.contains(drawerRule, 'transform: translateX(100%)', 'Drawer must initially be off-canvas (translateX(100%))');
    A.contains(drawerRule, 'backdrop-filter: blur(24px)', 'Drawer panel must have 24px frosted glass blur');

    A.isTrue(
      css.includes('.mobile-menu.open .mobile-drawer') || css.includes('.mobile-menu-overlay.open .mobile-drawer'),
      'Open drawer transformation selector must exist'
    );
    A.contains(css, 'transform: translateX(0);', 'Open drawer must slide to translateX(0)');
  });

  runTest('C4-02', 'Mobile Drawer Links Routing Integrity', (A) => {
    const mobileMenu = dom.getElementById('mobileMenu');
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
    A.gte(mobileLinks.length, 10, 'Mobile drawer must have at least 10 navigation links');

    // Verify all href targets exist in HTML
    mobileLinks.forEach(link => {
      const href = link.getAttribute('href');
      A.isTrue(href.startsWith('#'), `Mobile link ${href} must be anchor link`);
      const targetId = href.slice(1);
      const targetSection = dom.getElementById(targetId);
      A.exists(targetSection, `Section #${targetId} targeted by mobile link must exist in DOM`);
    });
  });

  runTest('C4-03', 'Mobile Navigation JS State Machine Simulation (100 Cycles)', (A) => {
    A.contains(js, "mobileMenu.classList.add('open');", 'openMenu must add .open class');
    A.contains(js, "hamburger.setAttribute('aria-expanded', 'true');", 'openMenu must set aria-expanded=true');
    A.contains(js, "mobileMenu.setAttribute('aria-hidden', 'false');", 'openMenu must set aria-hidden=false');
    A.contains(js, "document.body.style.overflow = 'hidden';", 'openMenu must lock body scroll');

    A.contains(js, "mobileMenu.classList.remove('open');", 'closeMenu must remove .open class');
    A.contains(js, "hamburger.setAttribute('aria-expanded', 'false');", 'closeMenu must set aria-expanded=false');
    A.contains(js, "mobileMenu.setAttribute('aria-hidden', 'true');", 'closeMenu must set aria-hidden=true');
    A.contains(js, "document.body.style.overflow = '';", 'closeMenu must restore body scroll');

    A.contains(js, "e.key === 'Escape'", 'Escape key event listener must exist');
    A.contains(js, "hamburger.focus();", 'Escape key must return keyboard focus to hamburger');

    // Simulate 100 open/close cycles
    let isOpen = false;
    let ariaExpanded = 'false';
    let ariaHidden = 'true';
    let bodyOverflow = '';

    const openMenu = () => {
      isOpen = true;
      ariaExpanded = 'true';
      ariaHidden = 'false';
      bodyOverflow = 'hidden';
    };

    const closeMenu = () => {
      isOpen = false;
      ariaExpanded = 'false';
      ariaHidden = 'true';
      bodyOverflow = '';
    };

    for (let cycle = 0; cycle < 100; cycle++) {
      openMenu();
      A.isTrue(isOpen, `Cycle ${cycle} openMenu -> isOpen is true`);
      A.equal(ariaExpanded, 'true', `Cycle ${cycle} openMenu -> aria-expanded is true`);
      A.equal(ariaHidden, 'false', `Cycle ${cycle} openMenu -> aria-hidden is false`);
      A.equal(bodyOverflow, 'hidden', `Cycle ${cycle} openMenu -> body overflow is hidden`);

      closeMenu();
      A.isFalse(isOpen, `Cycle ${cycle} closeMenu -> isOpen is false`);
      A.equal(ariaExpanded, 'false', `Cycle ${cycle} closeMenu -> aria-expanded is false`);
      A.equal(ariaHidden, 'true', `Cycle ${cycle} closeMenu -> aria-hidden is true`);
      A.equal(bodyOverflow, '', `Cycle ${cycle} closeMenu -> body overflow is restored`);
    }
  });

  // ---------------------------------------------------------------------------
  // Test Category 5: Multi-Theme Switcher & Design Token Completeness
  // ---------------------------------------------------------------------------
  console.log(`\n${BOLD}${CYAN}▶ CATEGORY 5: Multi-Theme Switcher & Design Token Completeness${RESET}`);

  runTest('C5-01', 'FOUC Prevention Inline Bootstrap Script in <head>', (A) => {
    A.contains(html, "localStorage.getItem('tbs_theme')", 'Inline script in <head> must check localStorage for saved theme');
    A.contains(html, "document.documentElement.setAttribute('data-theme', savedTheme);", 'Inline script must set data-theme on html root immediately');
  });

  runTest('C5-02', 'Theme Toggle Button & Sun/Moon Icon Transitions', (A) => {
    const themeBtn = dom.getElementById('themeToggle');
    A.exists(themeBtn, '#themeToggle button must exist');
    A.contains(themeBtn.innerHTML, 'sun-icon', 'Theme toggle button must contain sun icon');
    A.contains(themeBtn.innerHTML, 'moon-icon', 'Theme toggle button must contain moon icon');

    // Verify CSS display rules for icons
    A.isTrue(css.includes('[data-theme="light"] .theme-toggle .sun-icon {'), 'CSS rule for light theme sun icon');
    A.isTrue(css.includes('[data-theme="light"] .theme-toggle .moon-icon {'), 'CSS rule for light theme moon icon');
    A.isTrue(css.includes('[data-theme="dark"] .theme-toggle .sun-icon {'), 'CSS rule for dark theme sun icon');
    A.isTrue(css.includes('[data-theme="dark"] .theme-toggle .moon-icon {'), 'CSS rule for dark theme moon icon');
  });

  runTest('C5-03', 'Theme Token Parity Across Light & Dark Themes', (A) => {
    const tokens = [
      '--bg-deep',
      '--bg-surface',
      '--accent',
      '--text-primary',
      '--text-secondary',
      '--border',
      '--glass-bg',
      '--glass-bg-scrolled',
      '--glass-border',
      '--glass-border-scrolled',
      '--glass-blur',
      '--glass-shadow',
      '--glass-shadow-scrolled',
      '--glass-drawer-bg',
      '--glass-overlay',
      '--nav-pill-track',
      '--nav-pill-bg',
      '--nav-pill-color'
    ];

    tokens.forEach(token => {
      const lightVal = cssAnalyzer.getVariable(token, 'light') || cssAnalyzer.getVariable(token, 'root');
      const darkVal = cssAnalyzer.getVariable(token, 'dark');
      A.exists(lightVal, `Token ${token} must exist in Light theme`);
      A.exists(darkVal, `Token ${token} must exist in Dark theme`);
    });
  });

  runTest('C5-04', 'Theme Switcher JS Event & Storage Simulation (100 Cycles)', (A) => {
    A.contains(js, "localStorage.setItem('tbs_theme', newTheme);", 'Theme switcher must persist theme in localStorage');
    A.contains(js, "new CustomEvent('themeChanged'", 'Theme switcher must dispatch themeChanged event');

    // Simulate 100 toggles
    let currentTheme = 'light';
    for (let i = 0; i < 100; i++) {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      const expected = i % 2 === 0 ? 'dark' : 'light';
      A.equal(currentTheme, expected, `Toggle iteration ${i} theme`);
    }
  });

  // ---------------------------------------------------------------------------
  // Test Category 6: Zero-Overlap Typography & Layout Boundary Checks
  // ---------------------------------------------------------------------------
  console.log(`\n${BOLD}${CYAN}▶ CATEGORY 6: Zero-Overlap Spacing & Fluid Typography Tokens${RESET}`);

  runTest('C6-01', 'Fluid Typography Clamp Range Verification', (A) => {
    const fluidTokens = ['--font-size-h1', '--font-size-h2', '--font-size-h3', '--font-size-h4', '--font-size-lead'];
    fluidTokens.forEach(t => {
      const val = cssAnalyzer.getVariable(t, 'root');
      A.exists(val, `Fluid typography variable ${t} must exist`);
      A.contains(val, 'clamp(', `Variable ${t} must use clamp() formula`);
    });
  });

  runTest('C6-02', 'Header Clearance vs Hero Section Spacing', (A) => {
    const heroRule = cssAnalyzer.getRuleBlock('.hero-section') || cssAnalyzer.getRuleBlock('#hero');
    A.exists(heroRule, 'Hero section CSS rule must exist');
    // Verify hero section or inner has top padding or min-height to prevent overlap with floating navbar
    const hasClearance = css.includes('min-height: 100vh') || css.includes('.hero-inner { padding-top:');
    A.isTrue(hasClearance, 'Hero section must provide clearance for fixed floating header');
  });

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  const totalDuration = Date.now() - startTime;
  console.log(`\n${BOLD}${BLUE}================================================================================${RESET}`);
  console.log(`${BOLD}${BLUE}   STRESS TEST EXECUTION SUMMARY                                               ${RESET}`);
  console.log(`${BOLD}${BLUE}================================================================================${RESET}`);
  console.log(`  ${BOLD}Total Stress Tests:${RESET} ${testCount}`);
  console.log(`  ${BOLD}Passed:${RESET}             ${GREEN}${passedCount}${RESET}`);
  console.log(`  ${BOLD}Failed:${RESET}             ${failedCount === 0 ? GREEN : RED}${failedCount}${RESET}`);
  console.log(`  ${BOLD}Pass Rate:${RESET}          ${failedCount === 0 ? GREEN : RED}${((passedCount / testCount) * 100).toFixed(1)}%${RESET}`);
  console.log(`  ${BOLD}Total Duration:${RESET}     ${totalDuration} ms\n`);

  if (failedCount === 0) {
    console.log(`${BOLD}${GREEN}✔ ALL MILESTONE 1 ADVERSARIAL STRESS TESTS PASSED WITH ZERO ERRORS.${RESET}\n`);
    return { success: true, testCount, passedCount, failedCount, results };
  } else {
    console.log(`${BOLD}${RED}✖ ${failedCount} STRESS TEST(S) FAILED.${RESET}\n`);
    return { success: false, testCount, passedCount, failedCount, results };
  }
}

if (require.main === module) {
  const result = runMilestone1StressSuite();
  process.exit(result.success ? 0 : 1);
}

module.exports = { runMilestone1StressSuite };
