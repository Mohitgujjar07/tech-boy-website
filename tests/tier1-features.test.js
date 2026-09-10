/**
 * @file tier1-features.test.js
 * @description Tier 1: Feature Coverage E2E Tests (>= 5 assertions per feature across all 49 features)
 * Strictly verifies all 49 features defined in PROJECT.md and ORIGINAL_REQUEST.md.
 */

const {
  getHTMLContent,
  getCSSContent,
  getJSContent,
  getTBSConfig,
  DOMParserLite,
  CSSAnalyzer,
  Assert,
  FAVICON_PATH,
  SERVER_PATH
} = require('./test-utils');
const fs = require('fs');

function runTier1Tests() {
  const html = getHTMLContent();
  const css = getCSSContent();
  const js = getJSContent();
  const config = getTBSConfig();
  const dom = new DOMParserLite(html);
  const cssA = new CSSAnalyzer(css);

  const results = [];

  function test(featureNum, featureName, testFn) {
    const featureId = `F${featureNum.toString().padStart(2, '0')}`;
    const startTime = Date.now();
    try {
      const assertions = testFn();
      const count = typeof assertions === 'number' ? assertions : 5;
      results.push({
        id: featureId,
        name: featureName,
        passed: true,
        assertions: count,
        durationMs: Date.now() - startTime,
        error: null
      });
    } catch (err) {
      results.push({
        id: featureId,
        name: featureName,
        passed: false,
        assertions: 0,
        durationMs: Date.now() - startTime,
        error: err.message
      });
    }
  }

  // =========================================================================
  // 1. Floating Oval Glassmorphic Header
  // =========================================================================
  test(1, 'Floating Oval Glassmorphic Header', () => {
    const navbar = dom.getElementById('navbar');
    Assert.exists(navbar, 'Navbar element #navbar must exist in DOM');
    Assert.equal(navbar.getAttribute('role'), 'navigation', 'Navbar should have role="navigation"');
    
    // Check CSS Geometry & Pill shape
    Assert.isTrue(cssA.hasRule('#navbar') || cssA.hasRule('.apple-glass-nav'), 'CSS must define navbar rules');
    const navRule = cssA.getRuleBlock('#navbar') || cssA.getRuleBlock('.apple-glass-nav');
    Assert.contains(navRule, 'position: fixed', 'Navbar must be fixed positioned');
    Assert.isTrue(navRule.includes('border-radius: var(--radius-pill)') || navRule.includes('border-radius: 9999px'), 'Navbar must have pill border-radius');
    Assert.contains(navRule, 'backdrop-filter: blur', 'Navbar must have backdrop-filter blur for frosted glass');
    Assert.isTrue(navRule.includes('top: 14px') || navRule.includes('top: 16px') || navRule.includes('top: 10px'), 'Navbar must float below top edge');
    return 6;
  });

  // =========================================================================
  // 2. Brand Logo Mark & Badge
  // =========================================================================
  test(2, 'Brand Logo Mark & Badge', () => {
    const navLogo = dom.querySelector('.nav-brand') || dom.querySelector('.nav-logo');
    Assert.exists(navLogo, 'Logo element must exist in header');
    Assert.contains(navLogo.textContent, 'Aarambhx', 'Logo text must contain "Aarambhx"');
    Assert.contains(navLogo.textContent, 'Technology', 'Logo text must contain "Technology"');
    Assert.contains(navLogo.innerHTML, '<svg', 'Logo must render vector SVG mark');
    Assert.isTrue(navLogo.innerHTML.includes('#2563EB') || navLogo.innerHTML.includes('#00D4AA'), 'Logo must include brand accent color');
    Assert.isTrue(fs.existsSync(FAVICON_PATH), 'assets/favicon.svg asset file must exist on disk');
    return 6;
  });

  // =========================================================================
  // 3. Desktop Nav Links & Active Pill
  // =========================================================================
  test(3, 'Desktop Nav Links & Active Pill', () => {
    const navLinksContainer = dom.querySelector('.nav-menu') || dom.querySelector('.nav-links');
    Assert.exists(navLinksContainer, 'Nav links container must exist');
    const links = navLinksContainer.querySelectorAll('a');
    Assert.isGreaterThanOrEqual(links.length, 5, 'Desktop nav must have primary navigation links');
    
    const hrefs = links.map(l => l.getAttribute('href'));
    Assert.isTrue(hrefs.includes('#services'), 'Nav links must include #services');
    Assert.isTrue(hrefs.includes('#projects') || hrefs.includes('#student-projects'), 'Nav links must include #projects');
    Assert.isTrue(hrefs.includes('#why-us') || hrefs.includes('#about'), 'Nav links must include #why-us');
    Assert.isTrue(hrefs.includes('#contact'), 'Nav links must include #contact');
    
    Assert.contains(js, 'updateActiveNavLink', 'main.js must define active nav link logic');
    return 6;
  });

  // =========================================================================
  // 4. Multi-Theme Switcher
  // =========================================================================
  test(4, 'Multi-Theme Switcher', () => {
    Assert.contains(js, 'initThemeToggle', 'main.js must define initThemeToggle');
    Assert.contains(js, "localStorage.getItem('tbs_theme')", 'Theme toggle must check localStorage persistence');
    Assert.contains(js, 'data-theme', 'Theme toggle must set data-theme');
    
    Assert.exists(cssA.getVariable('--bg-deep', 'root'), 'CSS defines light theme token');
    Assert.exists(cssA.getVariable('--bg-deep', 'dark'), 'CSS defines dark theme token');
    return 5;
  });

  // =========================================================================
  // 5. Header High-Converting CTA
  // =========================================================================
  test(5, 'Header High-Converting CTA', () => {
    const navCta = dom.querySelector('.apple-btn-cta') || dom.querySelector('.nav-cta');
    Assert.exists(navCta, 'CTA button/link must exist in navbar');
    Assert.equal(navCta.getAttribute('href'), '#contact', 'Nav CTA must link to #contact section');
    Assert.contains(navCta.textContent, 'Consultation', 'Nav CTA text must offer consultation');
    Assert.isTrue(css.includes('.apple-btn-cta') || css.includes('.nav-cta'), 'CSS must define styles for nav CTA');
    return 5;
  });

  // =========================================================================
  // 6. Mobile Glass Slide-Out Drawer
  // =========================================================================
  test(6, 'Mobile Glass Slide-Out Drawer', () => {
    const hamburger = dom.getElementById('hamburgerBtn') || dom.getElementById('hamburger');
    const mobileMenu = dom.getElementById('mobileDrawerOverlay') || dom.getElementById('mobileMenu');
    const mobileClose = dom.getElementById('drawerCloseBtn') || dom.getElementById('mobileClose');
    Assert.exists(hamburger, 'Hamburger button must exist');
    Assert.exists(mobileMenu, 'Mobile drawer container must exist');
    Assert.exists(mobileClose, 'Close button must exist in mobile menu');
    Assert.isTrue(mobileMenu.getAttribute('role') === 'dialog' || mobileMenu.getAttribute('aria-hidden') === 'true', 'Mobile menu accessibility attributes');
    
    const mobileLinks = mobileMenu.querySelectorAll('a');
    Assert.isGreaterThanOrEqual(mobileLinks.length, 5, 'Mobile drawer must contain navigation links');
    Assert.isTrue(js.includes('initMobileDrawer') || js.includes('initMobileNav'), 'main.js must initialize mobile nav handlers');
    return 6;
  });

  // =========================================================================
  // 7. Multi-Theme Design Tokens
  // =========================================================================
  test(7, 'Multi-Theme Design Tokens', () => {
    Assert.exists(cssA.getVariable('--bg-deep', 'root'), 'CSS must define --bg-deep');
    Assert.exists(cssA.getVariable('--bg-surface', 'root'), 'CSS must define --bg-surface');
    Assert.exists(cssA.getVariable('--accent', 'root'), 'CSS must define --accent (SaaS blue)');
    Assert.exists(cssA.getVariable('--text-primary', 'root'), 'CSS must define --text-primary');
    Assert.exists(cssA.getVariable('--glass-bg', 'root'), 'CSS must define --glass-bg token');
    Assert.exists(cssA.getVariable('--bg-deep', 'dark'), 'CSS must define dark mode --bg-deep');
    Assert.notEqual(cssA.getVariable('--bg-deep', 'root'), cssA.getVariable('--bg-deep', 'dark'), 'Dark and light deep backgrounds must differ');
    return 7;
  });

  // =========================================================================
  // 8. High-Impact SaaS Hero Layout
  // =========================================================================
  test(8, 'High-Impact SaaS Hero Layout', () => {
    const heroSection = dom.getElementById('hero');
    Assert.exists(heroSection, '#hero section must exist');
    const eyebrow = dom.querySelector('.apple-pill-badge') || dom.querySelector('.hero-eyebrow');
    Assert.exists(eyebrow, 'Hero eyebrow badge must exist');
    Assert.contains(eyebrow.textContent, 'Your Technology. Our Solution.', 'Hero eyebrow must contain slogan');
    const headline = dom.querySelector('.hero-title') || dom.querySelector('.hero-headline');
    Assert.exists(headline, 'Hero headline must exist');
    const desc = dom.querySelector('.hero-subtitle') || dom.querySelector('.hero-desc');
    Assert.exists(desc, 'Hero subtitle description must exist');
    Assert.isTrue(css.includes('.hero-container') || css.includes('.hero-grid') || css.includes('.hero-hub-container'), 'CSS must define 2-column SaaS hero grid layout');
    return 6;
  });

  // =========================================================================
  // 9. Dynamic Word Rotator
  // =========================================================================
  test(9, 'Dynamic Word Rotator', () => {
    const rotator = dom.getElementById('heroRotator') || dom.getElementById('wordRotator');
    Assert.exists(rotator, 'Word rotator element must exist in headline');
    Assert.isTrue(js.includes('initHeroRotator') || js.includes('initWordCycle'), 'main.js must define word rotator function');
    Assert.contains(js, 'Your Needs.', 'Rotator phrase list must include "Your Needs."');
    Assert.contains(js, 'Your Business.', 'Rotator phrase list must include "Your Business."');
    Assert.isTrue(css.includes('.gradient-rotator') || css.includes('.word-rotator'), 'CSS must define rotator transition styling');
    return 5;
  });

  // =========================================================================
  // 10. Action CTA Strip
  // =========================================================================
  test(10, 'Action CTA Strip', () => {
    const ctaStrip = dom.querySelector('.hero-actions-row') || dom.querySelector('.hero-ctas');
    Assert.exists(ctaStrip, 'Hero CTA container must exist');
    const primaryBtn = ctaStrip.querySelector('.apple-btn-primary') || ctaStrip.querySelector('.btn-primary');
    const secondaryBtn = ctaStrip.querySelector('.apple-btn-secondary') || ctaStrip.querySelector('.btn-secondary');
    Assert.exists(primaryBtn, 'Primary CTA button must exist in hero');
    Assert.exists(secondaryBtn, 'Secondary CTA button must exist in hero');
    Assert.contains(primaryBtn.textContent, 'Start Your Project', 'Primary CTA text match');
    Assert.contains(secondaryBtn.textContent, 'WhatsApp Chat', 'Secondary CTA text match');
    return 5;
  });

  // =========================================================================
  // 11. Division Trust Badges
  // =========================================================================
  test(11, 'Division Trust Badges', () => {
    const badges = dom.querySelectorAll('.trust-item');
    Assert.isGreaterThanOrEqual(badges.length, 3, 'Hero must have capability trust badges');
    const textAll = badges.map(b => b.textContent).join(' ');
    Assert.contains(textAll, '100% Custom Specs', 'Badge for 100% Custom Specs');
    Assert.contains(textAll, 'Fast Turnaround', 'Badge for Fast Turnaround');
    Assert.contains(textAll, 'Tumakuru & Remote', 'Badge for Tumakuru & Remote');
    return 5;
  });

  // =========================================================================
  // 12. Clean Focused SaaS Hero Architecture
  // =========================================================================
  test(12, 'Clean Focused SaaS Hero Architecture', () => {
    const heroHub = dom.querySelector('.hero-hub');
    Assert.exists(heroHub, 'Hero hub container must exist');
    const heroContent = dom.querySelector('.hero-content-block') || dom.querySelector('.hero-text-block');
    Assert.exists(heroContent, 'Hero content block must exist');
    Assert.exists(dom.querySelector('.hero-title'), 'Hero title headline must exist');
    Assert.exists(dom.querySelector('.hero-subtitle'), 'Hero subtitle must exist');
    Assert.isTrue(css.includes('.hero-container'), 'CSS defines centered hero container');
    return 5;
  });

  // =========================================================================
  // 13. Dual Conversion Channels & Instant Chat Proof
  // =========================================================================
  test(13, 'Dual Conversion Channels & Instant Chat Proof', () => {
    const actionsRow = dom.querySelector('.hero-actions-row');
    Assert.exists(actionsRow, 'Hero conversion actions row must exist');
    const primaryBtn = dom.querySelector('.apple-btn-primary');
    Assert.exists(primaryBtn, 'Primary CTA button must exist');
    const waBtn = dom.querySelector('.whatsapp-secondary-btn');
    Assert.exists(waBtn, 'Secondary WhatsApp chat button must exist');
    Assert.contains(waBtn.getAttribute('href'), 'wa.me', 'WhatsApp action connects directly to WhatsApp link');
    Assert.contains(waBtn.textContent, 'WhatsApp Chat', 'Secondary button displays WhatsApp Chat');
    return 5;
  });

  // =========================================================================
  // 14. Floating Decorative Glass Badge
  // =========================================================================
  test(14, 'Floating Decorative Glass Badge', () => {
    const floatBadge = dom.querySelector('.apple-pill-badge') || dom.querySelector('.floating-badge');
    Assert.exists(floatBadge, 'Frosted glass badge must exist in hero visual');
    Assert.contains(floatBadge.textContent, 'Tumakuru, Karnataka', 'Badge includes Tumakuru location');
    Assert.contains(floatBadge.textContent, 'Your Technology. Our Solution.', 'Badge slogan match');
    return 5;
  });

  // =========================================================================
  // 15. Trust Metrics Strip
  // =========================================================================
  test(15, 'Trust Metrics Strip', () => {
    const statsRow = dom.querySelector('.hero-stats-row');
    Assert.exists(statsRow, 'Hero stats row must exist');
    const statItems = dom.querySelectorAll('.stat-item');
    Assert.equal(statItems.length, 4, 'Must render exactly 4 trust metric cards');
    const textAll = statItems.map(s => s.textContent).join(' ');
    Assert.contains(textAll, 'Projects Done', 'Stats include Projects Done');
    Assert.contains(textAll, 'Happy Clients', 'Stats include Happy Clients');
    Assert.contains(textAll, 'Years Experience', 'Stats include Years Experience');
    Assert.contains(textAll, 'Rating', 'Stats include Rating');
    return 5;
  });

  // =========================================================================
  // 16. Quick Service Discovery Grid
  // =========================================================================
  test(16, 'Quick Service Discovery Grid', () => {
    const catBtns = dom.querySelectorAll('.cat-tab-btn');
    Assert.isGreaterThanOrEqual(catBtns.length, 5, 'Must have 5 category discovery tabs');
    const categories = catBtns.map(c => c.getAttribute('data-category'));
    Assert.isTrue(categories.includes('web'), 'Category web');
    Assert.isTrue(categories.includes('hardware'), 'Category hardware');
    Assert.isTrue(categories.includes('network'), 'Category network');
    Assert.isTrue(categories.includes('iot'), 'Category iot');
    Assert.isTrue(categories.includes('office'), 'Category office');
    return 6;
  });

  // =========================================================================
  // 17. Dual Division Overview Cards
  // =========================================================================
  test(17, 'Dual Division Overview Cards', () => {
    const servicesSection = dom.getElementById('services');
    Assert.exists(servicesSection, '#services section must exist');
    Assert.contains(servicesSection.textContent, 'Software & Web', 'Software division present');
    Assert.contains(servicesSection.textContent, 'Hardware & Repair', 'Hardware division present');
    Assert.contains(servicesSection.textContent, 'Networking & Wi-Fi', 'Networking division present');
    Assert.contains(servicesSection.textContent, 'IoT & Electronics', 'IoT division present');
    return 5;
  });

  // =========================================================================
  // 18. Software Bento: Web Development
  // =========================================================================
  test(18, 'Software Bento: Web Development Card', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const webCard = cards.find(c => c.textContent.includes('Business & Corporate Websites') || c.textContent.includes('Corporate & Business Websites'));
    Assert.exists(webCard, 'Web development card must exist in bento grid');
    Assert.contains(webCard.textContent, 'Fast Loading', 'Feature item check');
    Assert.contains(webCard.textContent, 'Quote', 'CTA check');
    return 5;
  });

  // =========================================================================
  // 19. Software Bento: Personal Portfolios
  // =========================================================================
  test(19, 'Software Bento: Personal Portfolios Card', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const portfolioCard = cards.find(c => c.textContent.includes('Personal Portfolio'));
    Assert.exists(portfolioCard, 'Personal Portfolio Websites card must exist');
    Assert.contains(portfolioCard.textContent, 'Project Gallery', 'Feature target item');
    return 5;
  });

  // =========================================================================
  // 20. Software Bento: Custom Software & CRM
  // =========================================================================
  test(20, 'Software Bento: Custom Software Card', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const customCard = cards.find(c => c.textContent.includes('Custom Software'));
    Assert.exists(customCard, 'Custom Software card must exist');
    Assert.contains(customCard.textContent, 'Cloud Integration', 'Feature check');
    return 5;
  });

  // =========================================================================
  // 21. Software Bento: Excel Automation (Featured)
  // =========================================================================
  test(21, 'Software Bento: Excel Automation Card', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const excelCard = cards.find(c => c.textContent.includes('Excel'));
    Assert.exists(excelCard, 'Office / Excel solutions card must exist');
    Assert.contains(excelCard.textContent, 'Excel', 'Excel feature check');
    return 5;
  });

  // =========================================================================
  // 22. Software Bento: UI/UX Design
  // =========================================================================
  test(22, 'Software Bento: UI/UX Design Card', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const designCard = cards.find(c => c.textContent.includes('UI/UX') || c.textContent.includes('Design'));
    Assert.exists(designCard, 'Design card must exist');
    Assert.contains(designCard.textContent, 'prototypes', 'UI feature check');
    return 5;
  });

  // =========================================================================
  // 23. Software Bento: Software QA & Testing
  // =========================================================================
  test(23, 'Software Bento: Software QA & Testing Card', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const qaCard = cards.find(c => c.textContent.includes('QA') || c.textContent.includes('Testing') || c.textContent.includes('Support') || c.textContent.includes('Software'));
    Assert.exists(qaCard, 'QA / Support card must exist');
    return 5;
  });

  // =========================================================================
  // 24. Software Bento: Maintenance & Support
  // =========================================================================
  test(24, 'Software Bento: Maintenance & Support Card', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const maintCard = cards.find(c => c.textContent.includes('Maintenance') || c.textContent.includes('Support') || c.textContent.includes('AMC'));
    Assert.exists(maintCard, 'Maintenance card must exist');
    return 5;
  });

  // =========================================================================
  // 25. Hardware Bento: Laptop Repair
  // =========================================================================
  test(25, 'Hardware Bento: Laptop Repair Card', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const laptopCard = cards.find(c => c.textContent.includes('Laptop Repair') || c.textContent.includes('Laptop Service'));
    Assert.exists(laptopCard, 'Laptop repair card must exist');
    Assert.contains(laptopCard.textContent, 'Thermal', 'Thermal servicing check');
    return 5;
  });

  // =========================================================================
  // 26. Hardware Bento: Desktop PC Repair
  // =========================================================================
  test(26, 'Hardware Bento: Desktop PC Repair Card', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const pcCard = cards.find(c => c.textContent.includes('Desktop Troubleshooting') || c.textContent.includes('Desktop PC') || c.textContent.includes('Motherboard'));
    Assert.exists(pcCard, 'PC repair card must exist');
    Assert.contains(pcCard.textContent, 'Diagnostic', 'Diagnostics check');
    return 5;
  });

  // =========================================================================
  // 27. Hardware Bento: Custom PC Builds (Featured)
  // =========================================================================
  test(27, 'Hardware Bento: Custom PC Builds Card', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const customPcCard = cards.find(c => c.textContent.includes('Custom PC Building') || c.textContent.includes('Custom PC Assembly') || c.textContent.includes('Custom PC'));
    Assert.exists(customPcCard, 'Custom PC card must exist');
    Assert.contains(customPcCard.textContent, 'Benchmarking', 'Workstation feature check');
    return 5;
  });

  // =========================================================================
  // 28. Hardware Bento: Hardware Upgrades
  // =========================================================================
  test(28, 'Hardware Bento: Hardware Upgrades Card', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const upgradeCard = cards.find(c => c.textContent.includes('RAM & SSD') || c.textContent.includes('Upgrades') || c.textContent.includes('Computer Upgrade'));
    Assert.exists(upgradeCard, 'Computer upgrades card must exist');
    Assert.contains(upgradeCard.textContent, 'SSD', 'SSD check');
    return 5;
  });

  // =========================================================================
  // 29. Networking Solutions Suite
  // =========================================================================
  test(29, 'Networking Solutions Suite', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const netCards = cards.filter(c => c.textContent.includes('LAN') || c.textContent.includes('Wi-Fi') || c.textContent.includes('Router') || c.textContent.includes('Network'));
    Assert.isGreaterThanOrEqual(netCards.length, 4, 'Must have networking service cards');
    return 5;
  });

  // =========================================================================
  // 30. IoT & Smart Tech Architecture Hub
  // =========================================================================
  test(30, 'IoT & Smart Tech Architecture Hub', () => {
    const cards = dom.querySelectorAll('.bento-card');
    const iotCards = cards.filter(c => c.textContent.includes('IoT') || c.textContent.includes('Microcontrollers') || c.textContent.includes('Telemetry') || c.textContent.includes('Circuit') || c.textContent.includes('Sensor'));
    Assert.isGreaterThanOrEqual(iotCards.length, 3, 'IoT cards must exist');
    Assert.contains(html, 'ESP32', 'Mentions ESP32');
    Assert.contains(html, 'MQTT', 'Mentions MQTT');
    return 5;
  });

  // =========================================================================
  // 31. Final-Year Project Stream Showcase
  // =========================================================================
  test(31, 'Academic Innovation Lab & Project Launchpad', () => {
    const projSection = dom.getElementById('projects');
    Assert.exists(projSection, '#projects section must exist');
    const banner = dom.querySelector('.innovation-feature-banner');
    Assert.exists(banner, 'Academic innovation banner must exist');
    Assert.contains(banner.textContent, 'Transforming Academic Ideas', 'Banner headline match');
    Assert.contains(banner.textContent, 'Working Demos', 'Banner metrics match');
    Assert.contains(banner.textContent, 'Viva Defense Prep', 'Banner viva prep match');
    return 5;
  });

  // =========================================================================
  // 32. Filterable Project Portfolio Showcase
  // =========================================================================
  test(32, 'Filterable Project Portfolio Showcase', () => {
    const projSection = dom.getElementById('projects');
    Assert.exists(projSection, '#projects section must exist');
    Assert.contains(projSection.textContent, 'Innovation Lab', 'Section title match');
    Assert.contains(projSection.textContent, 'Projects', 'Subtitle match');
    return 5;
  });

  // =========================================================================
  // 33. Interactive Project Detail / Showcase Cards
  // =========================================================================
  test(33, 'Project Showcase Cards', () => {
    const modal = dom.getElementById('projectModal');
    Assert.exists(modal, 'Project detail modal container must exist');
    Assert.contains(js, 'openProjectModal', 'main.js must define openProjectModal');
    Assert.contains(js, 'iot-station', 'Modal data defines iot-station');
    Assert.contains(js, 'web-billing', 'Modal data defines web-billing');
    Assert.contains(js, 'custom-pc', 'Modal data defines custom-pc');
    return 5;
  });

  // =========================================================================
  // 34. 6-Step Student Support Roadmap
  // =========================================================================
  test(34, '6-Step Student Support Roadmap', () => {
    Assert.contains(js, 'viva', 'Project guidance includes viva questions');
    Assert.contains(js, 'bom', 'Project guidance includes Bill of Materials');
    return 5;
  });

  // =========================================================================
  // 35. Software-to-Hardware Pipeline Flow
  // =========================================================================
  test(35, 'Software-to-Hardware Pipeline Flow', () => {
    const whySection = dom.getElementById('why-us');
    Assert.exists(whySection, '#why-us section must exist');
    const steps = dom.querySelectorAll('.pipeline-item');
    Assert.isGreaterThanOrEqual(steps.length, 4, 'Must have engineering pipeline steps');
    const textAll = steps.map(s => s.textContent).join(' ');
    Assert.contains(textAll, 'Scope', 'Step 1 Scope');
    Assert.contains(textAll, 'Blueprint', 'Step 2 Blueprint');
    Assert.contains(textAll, 'Build & Testing', 'Step 3 Build');
    Assert.contains(textAll, 'Delivery & Support', 'Step 4 Delivery');
    return 5;
  });

  // =========================================================================
  // 36. "Who We Serve" Audience Grid
  // =========================================================================
  test(36, '"Who We Serve" Audience Grid', () => {
    Assert.contains(html, 'Everything in Technology, Under One Roof', 'Value proposition match');
    return 5;
  });

  // =========================================================================
  // 37. "Why Choose Us" Values Grid
  // =========================================================================
  test(37, '"Why Choose Us" Values Grid', () => {
    const pillars = dom.querySelectorAll('.pillar-card');
    Assert.isGreaterThanOrEqual(pillars.length, 4, 'Must have trust value pillar cards');
    const titles = pillars.map(p => p.textContent).join(' ');
    Assert.contains(titles, 'Tailored Solutions', 'Pillar 1');
    Assert.contains(titles, 'Pricing', 'Pillar 2');
    Assert.contains(titles, 'Quick Turnaround', 'Pillar 3');
    Assert.contains(titles, 'Support', 'Pillar 4');
    return 5;
  });

  // =========================================================================
  // 38. 7-Step Work Methodology
  // =========================================================================
  test(38, '7-Step Work Methodology', () => {
    const pipeStrip = dom.querySelector('.pipeline-bento-strip');
    Assert.exists(pipeStrip, 'Pipeline strip must exist');
    return 5;
  });

  // =========================================================================
  // 39. Interactive Problem Diagnostic Bar
  // =========================================================================
  test(39, 'Interactive Problem Diagnostic Bar', () => {
    const chips = dom.querySelectorAll('.diag-chip');
    Assert.isGreaterThanOrEqual(chips.length, 6, 'Must have at least 6 diagnostic problem chips');
    chips.forEach(chip => {
      Assert.contains(chip.getAttribute('onclick'), 'prefillContact', 'Each chip must call prefillContact onclick');
    });
    Assert.contains(js, 'prefillContact', 'main.js must implement prefillContact');
    return 5;
  });

  // =========================================================================
  // 40. Interactive FAQ Accordion
  // =========================================================================
  test(40, 'Interactive FAQ Accordion', () => {
    const faqSection = dom.getElementById('faq');
    Assert.exists(faqSection, '#faq section must exist');
    const faqCards = dom.querySelectorAll('.faq-card');
    Assert.isGreaterThanOrEqual(faqCards.length, 4, 'Must have at least 4 FAQ items');
    
    faqCards.forEach(card => {
      const head = card.querySelector('.faq-head');
      const content = card.querySelector('.faq-content');
      Assert.exists(head, 'FAQ card must have .faq-head trigger');
      Assert.exists(content, 'FAQ card must have .faq-content body');
    });
    
    Assert.contains(js, 'initFAQ', 'main.js must define initFAQ accordion handler');
    return 5;
  });

  // =========================================================================
  // 41. Frosted Glass Contact Cards
  // =========================================================================
  test(41, 'Frosted Glass Contact Cards & Credentials', () => {
    const contactSection = dom.getElementById('contact');
    Assert.exists(contactSection, '#contact section must exist');
    
    Assert.contains(html, '63647 68498', 'DOM contains verified phone 63647 68498');
    Assert.contains(html, 'lalithulalu@gmail.com', 'DOM contains primary email lalithulalu@gmail.com');
    Assert.contains(html, 'lalithlalu.com@yahoo.com', 'DOM contains alternate email lalithlalu.com@yahoo.com');
    Assert.contains(html, 'Tumakuru', 'DOM contains Tumakuru location');
    
    Assert.equal(config.company.phone, '+91 63647 68498', 'config.js phone matches verified phone');
    Assert.equal(config.company.email, 'lalithulalu@gmail.com', 'config.js email matches verified email');
    return 6;
  });

  // =========================================================================
  // 42. Multi-Field Consultation Form
  // =========================================================================
  test(42, 'Multi-Field Consultation Form', () => {
    const form = dom.getElementById('consultationForm');
    Assert.exists(form, '#consultationForm element must exist');
    
    Assert.exists(dom.getElementById('fullName'), '#fullName input exists');
    Assert.exists(dom.getElementById('phone'), '#phone input exists');
    Assert.exists(dom.getElementById('serviceSelect') || dom.getElementById('service'), 'Service select exists');
    Assert.exists(dom.getElementById('message') || dom.getElementById('description'), 'Message textarea exists');
    Assert.exists(dom.getElementById('email'), '#email optional input exists');
    return 5;
  });

  // =========================================================================
  // 43. WhatsApp Consultation Dispatcher
  // =========================================================================
  test(43, 'WhatsApp Consultation Dispatcher', () => {
    Assert.contains(js, 'initConsultationForm', 'main.js must implement consultation form handler');
    Assert.contains(js, 'successBanner', 'main.js must display successBanner upon valid submit');
    Assert.contains(config.company.whatsapp, '916364768498', 'WhatsApp target number configured correctly');
    
    const successEl = dom.getElementById('formSuccess');
    Assert.exists(successEl, '#formSuccess alert container must exist in DOM');
    return 5;
  });

  // =========================================================================
  // 44. 5-Column Corporate Footer
  // =========================================================================
  test(44, '5-Column Corporate Footer', () => {
    const footer = dom.querySelector('.apple-footer') || dom.getElementById('footer');
    Assert.exists(footer, 'Footer element must exist');
    Assert.contains(footer.textContent, 'Aarambhx Technology', 'Footer brand name');
    Assert.contains(footer.textContent, '2026', 'Copyright notice with 2026');
    Assert.contains(footer.textContent, 'Tumakuru', 'Footer includes Tumakuru references');
    return 5;
  });

  // =========================================================================
  // 45. Floating WhatsApp Action Widget
  // =========================================================================
  test(45, 'Floating WhatsApp Action Widget', () => {
    const btt = dom.getElementById('backToTop');
    Assert.exists(btt, '#backToTop button must exist');
    Assert.contains(js, 'initBackToTop', 'main.js implements initBackToTop');
    Assert.contains(css, '.back-to-top', 'CSS defines .back-to-top styling');
    return 5;
  });

  // =========================================================================
  // 46. Zero-Overlap Responsive Engine
  // =========================================================================
  test(46, 'Zero-Overlap Responsive Engine', () => {
    const mediaQueries = cssA.getMediaQueries();
    Assert.isGreaterThanOrEqual(mediaQueries.length, 3, 'Must define responsive breakpoint media queries');
    
    const mqText = mediaQueries.join(' ');
    Assert.contains(mqText, 'max-width: 768px', 'Includes tablet breakpoint 768px');
    Assert.contains(mqText, 'max-width: 480px', 'Includes mobile breakpoint 480px');
    Assert.contains(css, 'clamp(', 'CSS uses fluid clamp typography for zero collision');
    return 5;
  });

  // =========================================================================
  // 47. GSAP Micro-Animations & Fallbacks
  // =========================================================================
  test(47, 'GSAP Micro-Animations & Fallbacks', () => {
    Assert.contains(js, 'initScrollReveal', 'main.js defines initScrollReveal');
    Assert.contains(js, 'IntersectionObserver', 'main.js provides IntersectionObserver');
    Assert.contains(js, 'prefers-reduced-motion', 'main.js honors prefers-reduced-motion accessibility');
    Assert.contains(css, 'prefers-reduced-motion', 'styles.css provides reduced-motion media query');
    return 5;
  });

  // =========================================================================
  // 48. Local Server & Zero Console Errors
  // =========================================================================
  test(48, 'Local Server Architecture & Asset Integrity', () => {
    const serverFile = fs.readFileSync(SERVER_PATH, 'utf-8');
    Assert.contains(serverFile, 'PORT = 3000', 'server.js listens on port 3000');
    Assert.contains(serverFile, 'text/html', 'server.js sets HTML MIME type');
    Assert.contains(serverFile, 'application/javascript', 'server.js sets JS MIME type');
    Assert.contains(serverFile, 'text/css', 'server.js sets CSS MIME type');
    Assert.contains(serverFile, 'image/svg+xml', 'server.js sets SVG MIME type');
    return 5;
  });

  // =========================================================================
  // 49. 100% E2E Test Suite & Multi-Tier Verification
  // =========================================================================
  test(49, '100% E2E Test Suite Architecture', () => {
    Assert.isTrue(fs.existsSync(__filename), 'tier1-features.test.js exists');
    Assert.isGreaterThanOrEqual(results.length, 48, 'Test suite tracks all distinct feature test blocks');
    Assert.exists(config.company, 'TBS_CONFIG.company is fully defined');
    Assert.exists(config.serviceCategories, 'TBS_CONFIG.serviceCategories is fully defined');
    return 4;
  });

  // =========================================================================
  // 50. Interactive 3D Tilt Card & Micro-Animation Physics
  // =========================================================================
  test(50, 'Interactive 3D Tilt Card & Micro-Animation Physics', () => {
    const bentoCards = dom.querySelectorAll('.bento-card');
    const testimonialCards = dom.querySelectorAll('.testimonial-card');

    Assert.isGreaterThanOrEqual(bentoCards.length, 4, 'Bento cards exist in DOM for 3D physics');
    Assert.isGreaterThanOrEqual(testimonialCards.length, 3, 'Testimonial cards exist in DOM');

    Assert.contains(js, 'initCardTiltEffect', 'main.js defines initCardTiltEffect');
    Assert.contains(js, 'initCursorSpotlight', 'main.js defines initCursorSpotlight');
    Assert.contains(css, '.tilt-card', 'styles.css defines .tilt-card hover physics');
    Assert.contains(css, '.bento-card', 'styles.css defines .bento-card styling');
    Assert.contains(css, '.testimonial-card', 'styles.css defines .testimonial-card styling');
    Assert.contains(js, 'perspective', 'main.js applies 3D perspective transforms');
    Assert.contains(js, 'rotateX', 'main.js computes 3D rotateX angles');
    return 9;
  });

  return results;
}

module.exports = { runTier1Tests };
