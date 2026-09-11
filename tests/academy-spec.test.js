/**
 * AarambhX Academy Educational Spec Suite (academy.html)
 * Validates academy.html, academy.css, and academy.js against all specifications:
 * - Brand integrity and 3D metallic logo
 * - 4 core tech tracks (AI/ML, IoT Hardware, Cybersecurity, Excel Automation)
 * - Institutional campus delivery models (Colleges, FDP, Schools, Automation)
 * - Curriculum explorer tabs & progression
 * - Resource download hub
 * - Fast-track consultation booking form with WhatsApp dispatch
 * - Educational FAQ accordion
 * - Responsive layout & theme styling
 */

const fs = require('fs');
const path = require('path');
const { DOMParserLite, Assert } = require('./test-utils');

function runAcademySpecTests() {
  console.log('\n================================================================================');
  console.log('   AARAMBHX ACADEMY EDUCATIONAL SPEC SUITE (academy.html)                      ');
  console.log('================================================================================\n');

  const htmlPath = path.resolve(__dirname, '../academy.html');
  const cssPath = path.resolve(__dirname, '../academy.css');
  const jsPath = path.resolve(__dirname, '../academy.js');

  Assert.isTrue(fs.existsSync(htmlPath), 'academy.html exists');
  Assert.isTrue(fs.existsSync(cssPath), 'academy.css exists');
  Assert.isTrue(fs.existsSync(jsPath), 'academy.js exists');

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
      console.log(`  ✔ [ACADEMY] ${name} (${count} assertions)`);
    } catch (err) {
      console.error(`  ✘ [ACADEMY] ${name} FAILED: ${err.message}`);
      throw err;
    }
  }

  // 1. Brand Identity & Header
  test('Brand Architecture & Navigation Bar', () => {
    Assert.contains(html, 'AarambhX Academy', 'Page title/heading contains AarambhX Academy');
    Assert.contains(html, 'assets/aarambhx-logo.jpg', 'Navbar references 3D metallic logo');
    const nav = dom.querySelector('.apple-glass-nav');
    Assert.exists(nav, 'Glassmorphic navbar exists');
    Assert.contains(html, 'agency-nav-back', 'Back link to agency exists');
    Assert.isTrue(html.includes('themeToggleBtn') || html.includes('themeToggle'), 'Theme toggle button exists');
    return 5;
  });

  // 2. Hero Section & Metrics
  test('Hero Section & Impact Metrics', () => {
    const hero = dom.getElementById('overview');
    Assert.exists(hero, 'Overview hero section exists');
    Assert.contains(html, '500+', 'Contains 500+ students metric');
    Assert.contains(html, '12+', 'Contains 12+ campus workshops metric');
    Assert.contains(html, 'Tumakuru', 'Contains Tumakuru location narrative');
    Assert.contains(html, 'Hands-On Labs', 'Contains 100% Hands-On Labs');
    return 5;
  });

  // 3. 4 Core Technology Tracks (Compact Category Selector + Dynamic Panels)
  test('4 Core Technology Tracks & Compact Category Selector', () => {
    const tracksSection = dom.getElementById('tracks');
    Assert.exists(tracksSection, 'Tracks section exists');
    
    // Category Tabs & Panels
    const categoryTabs = dom.querySelectorAll('.track-category-tab');
    Assert.isGreaterThanOrEqual(categoryTabs.length, 4, 'Has at least 4 compact category selector tabs');
    const detailPanels = dom.querySelectorAll('.track-detail-panel');
    Assert.isGreaterThanOrEqual(detailPanels.length, 4, 'Has at least 4 track detail panels');
    Assert.contains(js, 'initTrackCategories', 'JS initializes track category switcher');

    // Track 1: AI & ML
    Assert.contains(html, 'AI &amp; Machine Learning (From Scratch)', 'Track 1 AI/ML exists');
    Assert.contains(html, 'Gemini', 'AI track includes Gemini reference');
    
    // Track 2: IoT
    Assert.contains(html, 'IoT, Robotics &amp; Embedded Hardware', 'Track 2 IoT exists');
    Assert.contains(html, 'ESP32', 'IoT track includes ESP32 reference');

    // Track 3: Cybersecurity
    Assert.contains(html, 'Cybersecurity &amp; Ethical Hacking', 'Track 3 Cyber exists');
    Assert.contains(html, 'Wireshark', 'Cyber track includes Wireshark reference');

    // Track 4: Excel & Automation
    Assert.contains(html, 'Enterprise Automation &amp; Advanced Excel', 'Track 4 Excel exists');
    Assert.contains(html, 'Power Query', 'Excel track includes Power Query reference');
    return 12;
  });

  // 4. Institutional Partnerships & Campus Delivery
  test('Institutional Campus Delivery Models', () => {
    const workshops = dom.getElementById('workshops');
    Assert.exists(workshops, 'Workshops delivery section exists');
    Assert.contains(html, 'Departmental Bootcamps', 'Includes college bootcamps');
    Assert.contains(html, 'Faculty Development Programs', 'Includes FDP programs');
    Assert.contains(html, 'School STEAM', 'Includes school STEAM programs');
    Assert.contains(html, 'Institutional Workflow Automation', 'Includes office automation');
    return 5;
  });

  // 5. Interactive Curriculum Explorer
  test('Interactive Curriculum Explorer Tabs', () => {
    const curriculum = dom.getElementById('curriculum');
    Assert.exists(curriculum, 'Curriculum section exists');
    const tabs = dom.querySelectorAll('.curriculum-tab-btn');
    Assert.isGreaterThanOrEqual(tabs.length, 4, 'Has at least 4 curriculum track tabs');
    const panels = dom.querySelectorAll('.curriculum-panel');
    Assert.isGreaterThanOrEqual(panels.length, 4, 'Has at least 4 curriculum panels');
    return 3;
  });

  // 6. Section Cleanliness & Core Navigation Integrity
  test('Section Cleanliness & Core Navigation Integrity', () => {
    const resources = dom.getElementById('resources');
    Assert.isTrue(!resources, 'Resources section is completely removed');
    const tracks = dom.getElementById('tracks');
    Assert.exists(tracks, 'Core Tracks section exists');
    const booking = dom.getElementById('booking');
    Assert.exists(booking, 'Booking section exists');
    return 3;
  });

  // 7. Consultation & WhatsApp Booking Form
  test('Consultation & Booking Engine', () => {
    const bookingForm = dom.getElementById('academyBookingForm');
    Assert.exists(bookingForm, 'Booking form exists');
    Assert.contains(html, 'bookingTrack', 'Has track selector');
    Assert.contains(html, 'bookingRole', 'Has role selector');
    Assert.contains(html, 'handleAcademyBooking', 'Form dispatches to handleAcademyBooking');
    Assert.contains(js, 'https://wa.me/919481261244', 'JS includes WhatsApp dispatch endpoint');
    return 5;
  });

  // 8. Educational FAQ Accordion
  test('Educational FAQ Accordion', () => {
    const faq = dom.getElementById('faq');
    Assert.exists(faq, 'FAQ section exists');
    const faqItems = dom.querySelectorAll('.faq-item');
    Assert.isGreaterThanOrEqual(faqItems.length, 5, 'Has at least 5 FAQ items');
    Assert.contains(js, 'initFaqAccordion', 'JS initializes FAQ accordion');
    return 3;
  });

  // 9. CSS Styling & Parity
  test('CSS Styling & Dark/Light Theme Parity', () => {
    Assert.contains(css, '.academy-hero-section', 'CSS defines hero styles');
    Assert.contains(css, '.academy-tracks-grid', 'CSS defines tracks grid');
    Assert.contains(css, '[data-theme="dark"]', 'CSS includes dark theme tokens');
    Assert.contains(css, '@media (max-width: 768px)', 'CSS includes responsive mobile media queries');
    return 4;
  });

  console.log(`\n✔ ALL ${passed} AARAMBHX ACADEMY SPEC TESTS PASSED (${assertions} assertions)\n`);
  return { passed, assertions };
}

if (require.main === module) {
  runAcademySpecTests();
}

module.exports = { runAcademySpecTests };
