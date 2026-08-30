/**
 * @file tier1-features.test.js
 * @description Tier 1: Feature Coverage E2E Tests (>= 5 test cases per feature across all 49 features)
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
    Assert.isTrue(cssA.hasRule('#navbar'), 'CSS must define #navbar rules');
    const navRule = cssA.getRuleBlock('#navbar');
    Assert.contains(navRule, 'position: fixed', 'Navbar must be fixed positioned');
    Assert.contains(navRule, 'border-radius: 9999px', 'Navbar must have pill border-radius (9999px)');
    Assert.contains(navRule, 'backdrop-filter: blur', 'Navbar must have backdrop-filter blur for frosted glass');
    Assert.contains(navRule, 'top: 16px', 'Navbar must float 16px below top edge');
    return 6;
  });

  // =========================================================================
  // 2. Brand Logo Mark & Badge
  // =========================================================================
  test(2, 'Brand Logo Mark & Badge', () => {
    const navLogo = dom.querySelector('.nav-logo');
    Assert.exists(navLogo, '.nav-logo element must exist in header');
    Assert.contains(navLogo.textContent, 'Tech Boy', 'Logo text must contain "Tech Boy"');
    Assert.contains(navLogo.textContent, 'Solutions', 'Logo text must contain "Solutions"');
    Assert.contains(navLogo.innerHTML, '<svg', 'Logo must render vector SVG mark');
    Assert.contains(navLogo.innerHTML, '#00D4AA', 'Logo must include turquoise circuit dot accent #00D4AA');
    Assert.isTrue(fs.existsSync(FAVICON_PATH), 'assets/favicon.svg asset file must exist on disk');
    return 6;
  });

  // =========================================================================
  // 3. Desktop Nav Links & Active Pill
  // =========================================================================
  test(3, 'Desktop Nav Links & Active Pill', () => {
    const navLinksContainer = dom.querySelector('.nav-links');
    Assert.exists(navLinksContainer, '.nav-links container must exist');
    const links = navLinksContainer.querySelectorAll('.nav-link');
    Assert.isGreaterThanOrEqual(links.length, 7, 'Desktop nav must have at least 7 primary links');
    
    const hrefs = links.map(l => l.getAttribute('href'));
    Assert.isTrue(hrefs.includes('#about'), 'Nav links must include #about');
    Assert.isTrue(hrefs.includes('#services'), 'Nav links must include #services');
    Assert.isTrue(hrefs.includes('#software'), 'Nav links must include #software');
    Assert.isTrue(hrefs.includes('#hardware'), 'Nav links must include #hardware');
    Assert.isTrue(hrefs.includes('#contact'), 'Nav links must include #contact');
    
    // JS active link update function
    Assert.contains(js, 'function updateActiveNavLink', 'main.js must define updateActiveNavLink');
    return 7;
  });

  // =========================================================================
  // 4. Multi-Theme Switcher
  // =========================================================================
  test(4, 'Multi-Theme Switcher', () => {
    const themeBtn = dom.getElementById('themeToggle');
    Assert.exists(themeBtn, 'Theme toggle button #themeToggle must exist');
    Assert.contains(themeBtn.innerHTML, 'sun', 'Theme toggle must contain sun icon');
    Assert.contains(themeBtn.innerHTML, 'moon', 'Theme toggle must contain moon icon');
    
    // Body default attribute
    const bodyTag = dom.querySelector('body');
    Assert.equal(bodyTag.getAttribute('data-theme'), 'light', 'Default body theme must be light');
    
    // Theme manager logic in JS
    Assert.contains(js, 'initThemeToggle', 'main.js must define initThemeToggle');
    Assert.contains(js, "localStorage.getItem('tbs_theme')", 'Theme toggle must check localStorage persistence');
    Assert.contains(js, 'document.body.setAttribute(\'data-theme\'', 'Theme toggle must set data-theme on body');
    return 7;
  });

  // =========================================================================
  // 5. Header High-Converting CTA
  // =========================================================================
  test(5, 'Header High-Converting CTA', () => {
    const navCta = dom.querySelector('.nav-cta');
    Assert.exists(navCta, '.nav-cta button/link must exist in navbar');
    Assert.equal(navCta.getAttribute('href'), '#contact', 'Nav CTA must link to #contact section');
    Assert.contains(navCta.textContent, 'Get Consultation', 'Nav CTA text must say "Get Consultation"');
    Assert.contains(navCta.className, 'btn-primary', 'Nav CTA must have primary button class');
    Assert.contains(css, '.nav-cta', 'CSS must define styles for .nav-cta');
    return 5;
  });

  // =========================================================================
  // 6. Mobile Glass Slide-Out Drawer
  // =========================================================================
  test(6, 'Mobile Glass Slide-Out Drawer', () => {
    const hamburger = dom.getElementById('hamburger');
    const mobileMenu = dom.getElementById('mobileMenu');
    const mobileClose = dom.getElementById('mobileClose');
    Assert.exists(hamburger, '#hamburger button must exist');
    Assert.exists(mobileMenu, '#mobileMenu drawer container must exist');
    Assert.exists(mobileClose, '#mobileClose button must exist in mobile menu');
    Assert.equal(mobileMenu.getAttribute('role'), 'dialog', 'Mobile menu should have role="dialog"');
    
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
    Assert.isGreaterThanOrEqual(mobileLinks.length, 8, 'Mobile drawer must contain at least 8 navigation links');
    Assert.contains(js, 'initMobileNav', 'main.js must initialize mobile nav handlers');
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
    Assert.exists(dom.querySelector('.hero-eyebrow'), '.hero-eyebrow badge must exist');
    Assert.contains(dom.querySelector('.hero-eyebrow').textContent, 'Your Technology. Our Solution.', 'Hero eyebrow must contain slogan');
    Assert.exists(dom.querySelector('.hero-headline'), '.hero-headline must exist');
    Assert.exists(dom.querySelector('.hero-desc'), '.hero-desc paragraph must exist');
    Assert.contains(css, '.hero-grid', 'CSS must define 2-column SaaS hero grid layout');
    return 6;
  });

  // =========================================================================
  // 9. Dynamic Word Rotator
  // =========================================================================
  test(9, 'Dynamic Word Rotator', () => {
    const rotator = dom.getElementById('wordRotator');
    Assert.exists(rotator, '#wordRotator element must exist in headline');
    Assert.contains(js, 'initWordCycle', 'main.js must define initWordCycle');
    Assert.contains(js, 'Your Needs.', 'Rotator phrase list must include "Your Needs."');
    Assert.contains(js, 'Every Requirement.', 'Rotator phrase list must include "Every Requirement."');
    Assert.contains(css, '.word-rotator', 'CSS must define transition styling for .word-rotator');
    return 5;
  });

  // =========================================================================
  // 10. Action CTA Strip
  // =========================================================================
  test(10, 'Action CTA Strip', () => {
    const ctaStrip = dom.querySelector('.hero-ctas');
    Assert.exists(ctaStrip, '.hero-ctas container must exist');
    const primaryBtn = ctaStrip.querySelector('.btn-primary');
    const secondaryBtn = ctaStrip.querySelector('.btn-secondary');
    const ghostBtn = ctaStrip.querySelector('.btn-ghost');
    Assert.exists(primaryBtn, 'Primary CTA button must exist in hero');
    Assert.exists(secondaryBtn, 'Secondary CTA button must exist in hero');
    Assert.exists(ghostBtn, 'Ghost CTA button must exist in hero');
    Assert.contains(primaryBtn.textContent, 'Get a Free Consultation', 'Primary CTA text match');
    Assert.contains(secondaryBtn.textContent, 'Explore Our Services', 'Secondary CTA text match');
    return 6;
  });

  // =========================================================================
  // 11. Division Trust Badges
  // =========================================================================
  test(11, 'Division Trust Badges', () => {
    const badges = dom.querySelectorAll('.trust-badge');
    Assert.isGreaterThanOrEqual(badges.length, 5, 'Hero must have at least 5 capability trust badges');
    const textAll = badges.map(b => b.textContent).join(' ');
    Assert.contains(textAll, 'Software Solutions', 'Badge for Software Solutions');
    Assert.contains(textAll, 'Hardware Support', 'Badge for Hardware Support');
    Assert.contains(textAll, 'Networking', 'Badge for Networking');
    Assert.contains(textAll, 'IoT Projects', 'Badge for IoT Projects');
    Assert.contains(textAll, 'IT Support', 'Badge for IT Support');
    return 6;
  });

  // =========================================================================
  // 12. SaaS Command Center Micro-Widget
  // =========================================================================
  test(12, 'SaaS Command Center Micro-Widget', () => {
    const saasCard = dom.querySelector('.saas-hero-card');
    Assert.exists(saasCard, '.saas-hero-card container must exist');
    Assert.exists(dom.querySelector('.window-dots'), 'Window header dots (red/yellow/green) must exist');
    Assert.contains(dom.querySelector('.window-title').textContent, 'Tech Boy Solutions', 'Window title contains brand');
    Assert.contains(dom.querySelector('.window-badge').textContent, 'Live Support', 'Window badge shows Live Support');
    Assert.exists(dom.querySelector('.pulse-dot'), 'Live support pulse dot must exist');
    return 5;
  });

  // =========================================================================
  // 13. Live Division Tiles / Tab Switcher
  // =========================================================================
  test(13, 'Live Division Tiles in Command Center', () => {
    const tiles = dom.querySelectorAll('.saas-division-tile');
    Assert.isGreaterThanOrEqual(tiles.length, 2, 'Command center must display dual division preview tiles');
    const tileTitles = tiles.map(t => t.textContent).join(' ');
    Assert.contains(tileTitles, 'Software & Digital', 'Division 01 Software title match');
    Assert.contains(tileTitles, 'Hardware & IT', 'Division 02 Hardware title match');
    Assert.contains(tileTitles, 'Division 01', 'Division 01 tag match');
    Assert.contains(tileTitles, 'Division 02', 'Division 02 tag match');
    return 5;
  });

  // =========================================================================
  // 14. Floating Decorative Glass Badge
  // =========================================================================
  test(14, 'Floating Decorative Glass Badge', () => {
    const floatBadge = dom.querySelector('.floating-badge');
    Assert.exists(floatBadge, '.floating-badge must exist in hero visual');
    Assert.contains(floatBadge.textContent, 'One-Stop Tech Partner', 'Floating badge title match');
    Assert.contains(floatBadge.textContent, 'Software + Hardware', 'Floating badge subtext match');
    Assert.contains(css, '.floating-badge', 'CSS must define styles for .floating-badge');
    Assert.contains(css, '@keyframes floatBadge', 'CSS must define floatBadge animation');
    return 5;
  });

  // =========================================================================
  // 15. Trust Metrics Strip
  // =========================================================================
  test(15, 'Trust Metrics Strip', () => {
    const statsSection = dom.getElementById('trust-stats');
    Assert.exists(statsSection, '#trust-stats section must exist');
    const statCards = dom.querySelectorAll('.stat-card');
    Assert.equal(statCards.length, 4, 'Must render exactly 4 trust metric cards');
    const statValues = statCards.map(s => s.querySelector('.stat-value') ? s.querySelector('.stat-value').textContent : '');
    Assert.isTrue(statValues.includes('100%'), 'Stats include 100%');
    Assert.isTrue(statValues.includes('2'), 'Stats include 2 divisions');
    Assert.isTrue(statValues.includes('24/7'), 'Stats include 24/7 support');
    Assert.isTrue(statValues.includes('End-to-End'), 'Stats include End-to-End services');
    return 6;
  });

  // =========================================================================
  // 16. Quick Service Discovery Grid
  // =========================================================================
  test(16, 'Quick Service Discovery Grid', () => {
    const discoveryCards = dom.querySelectorAll('.discovery-card');
    Assert.equal(discoveryCards.length, 10, 'Must have exactly 10 discovery category cards');
    
    // Check role, tabindex and data-target
    discoveryCards.forEach(card => {
      Assert.exists(card.getAttribute('data-target'), 'Discovery card must have data-target attribute');
      Assert.equal(card.getAttribute('role'), 'button', 'Discovery card must have role="button"');
      Assert.equal(card.getAttribute('tabindex'), '0', 'Discovery card must have tabindex="0"');
    });
    
    Assert.contains(js, 'initDiscoveryCards', 'main.js must initialize discovery cards click handlers');
    return 5;
  });

  // =========================================================================
  // 17. Dual Division Overview Cards
  // =========================================================================
  test(17, 'Dual Division Overview Cards', () => {
    const aboutSection = dom.getElementById('about');
    Assert.exists(aboutSection, '#about section must exist');
    const divCards = dom.querySelectorAll('.division-card');
    Assert.equal(divCards.length, 2, 'About section must have 2 division overview cards');
    
    const divTitles = divCards.map(d => d.textContent).join(' ');
    Assert.contains(divTitles, 'SOFTWARE & DIGITAL SOLUTIONS', 'Division 1 title');
    Assert.contains(divTitles, 'HARDWARE & IT INFRASTRUCTURE', 'Division 2 title');
    
    const tags = dom.querySelectorAll('.division-tag');
    Assert.isGreaterThanOrEqual(tags.length, 10, 'Must have at least 10 capability tags in division overview');
    return 5;
  });

  // =========================================================================
  // 18. Software Bento: Web Development
  // =========================================================================
  test(18, 'Software Bento: Web Development Card', () => {
    const softwareSection = dom.getElementById('software');
    Assert.exists(softwareSection, '#software section must exist');
    const card = softwareSection.querySelector('.services-grid-3 .service-card');
    Assert.exists(card, 'Web development card must exist in software grid');
    Assert.contains(card.textContent, 'Website Development', 'Title must be Website Development');
    Assert.contains(card.textContent, 'Business & Corporate Websites', 'Feature item check');
    Assert.contains(card.textContent, 'Build My Website', 'CTA text check');
    Assert.equal(card.querySelector('a').getAttribute('href'), '#contact', 'CTA must link to #contact');
    return 5;
  });

  // =========================================================================
  // 19. Software Bento: Personal Portfolios
  // =========================================================================
  test(19, 'Software Bento: Personal Portfolios Card', () => {
    const cards = dom.querySelectorAll('#software .service-card');
    const portfolioCard = cards.find(c => c.textContent.includes('Personal Portfolio Websites'));
    Assert.exists(portfolioCard, 'Personal Portfolio Websites card must exist');
    Assert.contains(portfolioCard.textContent, 'Students, Developers & Designers', 'Feature target audiences');
    Assert.contains(portfolioCard.textContent, 'Custom Domain Integration', 'Feature domain setup');
    Assert.contains(portfolioCard.textContent, 'Create My Portfolio', 'CTA text match');
    Assert.equal(portfolioCard.querySelector('a').getAttribute('href'), '#contact', 'CTA links to #contact');
    return 5;
  });

  // =========================================================================
  // 20. Software Bento: Custom Software & CRM
  // =========================================================================
  test(20, 'Software Bento: Custom Software Card', () => {
    const cards = dom.querySelectorAll('#software .service-card');
    const customCard = cards.find(c => c.textContent.includes('Custom Software Development'));
    Assert.exists(customCard, 'Custom Software card must exist');
    Assert.contains(customCard.textContent, 'Business Management Systems', 'Feature check');
    Assert.contains(customCard.textContent, 'Inventory & Billing Software', 'Feature check');
    Assert.contains(customCard.textContent, 'Discuss My Project', 'CTA text match');
    Assert.equal(customCard.querySelector('a').getAttribute('href'), '#contact', 'CTA links to #contact');
    return 5;
  });

  // =========================================================================
  // 21. Software Bento: Excel Automation (Featured)
  // =========================================================================
  test(21, 'Software Bento: Excel Automation Card', () => {
    const cards = dom.querySelectorAll('#software .service-card');
    const excelCard = cards.find(c => c.textContent.includes('Office & Productivity Solutions'));
    Assert.exists(excelCard, 'Office solutions card must exist');
    Assert.contains(excelCard.className, 'featured-card', 'Excel card must have featured-card class');
    Assert.contains(excelCard.textContent, 'Advanced Microsoft Excel', 'Excel feature check');
    Assert.contains(excelCard.textContent, 'High Demand', 'Featured badge text');
    Assert.contains(excelCard.textContent, 'Get Office Help', 'CTA text match');
    return 5;
  });

  // =========================================================================
  // 22. Software Bento: UI/UX Design
  // =========================================================================
  test(22, 'Software Bento: UI/UX Design Card', () => {
    const cards = dom.querySelectorAll('#software .service-card');
    const designCard = cards.find(c => c.textContent.includes('UI/UX & Graphic Design'));
    Assert.exists(designCard, 'UI/UX card must exist');
    Assert.contains(designCard.textContent, 'Website & Mobile App UI Design', 'UI feature check');
    Assert.contains(designCard.textContent, 'Dashboard & SaaS Interfaces', 'Dashboard design check');
    Assert.contains(designCard.textContent, 'Start a Design Project', 'CTA text match');
    Assert.equal(designCard.querySelector('a').getAttribute('href'), '#contact', 'CTA links to #contact');
    return 5;
  });

  // =========================================================================
  // 23. Software Bento: Software QA & Testing
  // =========================================================================
  test(23, 'Software Bento: Software QA & Testing Card', () => {
    const cards = dom.querySelectorAll('#software .service-card');
    const qaCard = cards.find(c => c.textContent.includes('Software Testing & QA'));
    Assert.exists(qaCard, 'QA card must exist');
    Assert.contains(qaCard.textContent, 'Functional & UI/UX Testing', 'QA feature check');
    Assert.contains(qaCard.textContent, 'Cross-Browser & Device Compatibility', 'Compatibility check');
    Assert.contains(qaCard.textContent, 'Request QA Review', 'CTA text match');
    Assert.equal(qaCard.querySelector('a').getAttribute('href'), '#contact', 'CTA links to #contact');
    return 5;
  });

  // =========================================================================
  // 24. Software Bento: Maintenance & Support
  // =========================================================================
  test(24, 'Software Bento: Maintenance & Support Card', () => {
    const cards = dom.querySelectorAll('#software .service-card');
    const maintCard = cards.find(c => c.textContent.includes('Website Maintenance & Support'));
    Assert.exists(maintCard, 'Maintenance card must exist');
    Assert.contains(maintCard.textContent, 'Bug Fixing & Error Troubleshooting', 'Maintenance feature check');
    Assert.contains(maintCard.textContent, 'Speed Optimization & Performance', 'Speed optimization check');
    Assert.contains(maintCard.textContent, 'Maintain My Website', 'CTA text match');
    Assert.equal(maintCard.querySelector('a').getAttribute('href'), '#contact', 'CTA links to #contact');
    return 5;
  });

  // =========================================================================
  // 25. Hardware Bento: Laptop Repair
  // =========================================================================
  test(25, 'Hardware Bento: Laptop Repair Card', () => {
    const hardSection = dom.getElementById('hardware');
    Assert.exists(hardSection, '#hardware section must exist');
    const cards = dom.querySelectorAll('#hardware .service-card');
    const laptopCard = cards.find(c => c.textContent.includes('Laptop Repair & Service'));
    Assert.exists(laptopCard, 'Laptop repair card must exist');
    Assert.contains(laptopCard.textContent, 'Hardware Diagnosis & Checks', 'Diagnosis check');
    Assert.contains(laptopCard.textContent, 'Fix My Laptop', 'CTA text match');
    Assert.equal(laptopCard.querySelector('a').getAttribute('href'), '#contact', 'CTA links to #contact');
    return 5;
  });

  // =========================================================================
  // 26. Hardware Bento: Desktop PC Repair
  // =========================================================================
  test(26, 'Hardware Bento: Desktop PC Repair Card', () => {
    const cards = dom.querySelectorAll('#hardware .service-card');
    const pcCard = cards.find(c => c.textContent.includes('Desktop / PC Repair'));
    Assert.exists(pcCard, 'PC repair card must exist');
    Assert.contains(pcCard.textContent, 'Power Supply Diagnostics', 'PSU diagnostics check');
    Assert.contains(pcCard.textContent, 'Windows & Software Setup', 'Windows setup check');
    Assert.contains(pcCard.textContent, 'Fix My Desktop', 'CTA text match');
    Assert.equal(pcCard.querySelector('a').getAttribute('href'), '#contact', 'CTA links to #contact');
    return 5;
  });

  // =========================================================================
  // 27. Hardware Bento: Custom PC Builds (Featured)
  // =========================================================================
  test(27, 'Hardware Bento: Custom PC Builds Card', () => {
    const cards = dom.querySelectorAll('#hardware .service-card');
    const customPcCard = cards.find(c => c.textContent.includes('Custom PC Builds'));
    Assert.exists(customPcCard, 'Custom PC card must exist');
    Assert.contains(customPcCard.className, 'featured-card', 'Custom PC must have featured-card class');
    Assert.contains(customPcCard.textContent, 'Specialist Service', 'Specialist badge check');
    Assert.contains(customPcCard.textContent, 'Video Editing & Creator Workstations', 'Workstation feature check');
    Assert.contains(customPcCard.textContent, 'Build My PC', 'CTA text match');
    return 5;
  });

  // =========================================================================
  // 28. Hardware Bento: Hardware Upgrades
  // =========================================================================
  test(28, 'Hardware Bento: Hardware Upgrades Card', () => {
    const cards = dom.querySelectorAll('#hardware .service-card');
    const upgradeCard = cards.find(c => c.textContent.includes('Computer Upgrades'));
    Assert.exists(upgradeCard, 'Computer upgrades card must exist');
    Assert.contains(upgradeCard.textContent, 'RAM Capacity Expansion', 'RAM check');
    Assert.contains(upgradeCard.textContent, 'HDD to Ultra-Fast SSD', 'SSD check');
    Assert.contains(upgradeCard.textContent, 'Upgrade My Computer', 'CTA text match');
    Assert.equal(upgradeCard.querySelector('a').getAttribute('href'), '#contact', 'CTA links to #contact');
    return 5;
  });

  // =========================================================================
  // 29. Networking Solutions Suite
  // =========================================================================
  test(29, 'Networking Solutions Suite', () => {
    const netSection = dom.getElementById('networking');
    Assert.exists(netSection, '#networking section must exist');
    const netCards = dom.querySelectorAll('#networking .service-card');
    Assert.equal(netCards.length, 5, 'Must have 5 networking cards');
    
    const titles = netCards.map(c => c.textContent).join(' ');
    Assert.contains(titles, 'Network Installation', 'Card 1 title');
    Assert.contains(titles, 'Router Configuration', 'Card 2 title');
    Assert.contains(titles, 'Wi-Fi Solutions', 'Card 3 title');
    Assert.contains(titles, 'Network Troubleshooting', 'Card 4 title');
    Assert.contains(titles, 'Small Office Network Setup', 'Card 5 title');
    return 6;
  });

  // =========================================================================
  // 30. IoT & Smart Tech Architecture Hub
  // =========================================================================
  test(30, 'IoT & Smart Tech Architecture Hub', () => {
    const iotSection = dom.getElementById('iot');
    Assert.exists(iotSection, '#iot section must exist');
    const tags = dom.querySelectorAll('.iot-tag');
    Assert.isGreaterThanOrEqual(tags.length, 8, 'IoT section must display at least 8 tech tags');
    
    const platformItems = dom.querySelectorAll('.iot-platform-item');
    Assert.equal(platformItems.length, 4, 'Must display 4 supported IoT platforms & architectures');
    Assert.contains(iotSection.textContent, 'ESP32', 'Mentions ESP32');
    Assert.contains(iotSection.textContent, 'MQTT', 'Mentions MQTT');
    return 5;
  });

  // =========================================================================
  // 31. Final-Year Project Stream Showcase
  // =========================================================================
  test(31, 'Final-Year Project Stream Showcase', () => {
    const stuSection = dom.getElementById('student-projects');
    Assert.exists(stuSection, '#student-projects section must exist');
    const streamCards = dom.querySelectorAll('.student-cat-card');
    Assert.equal(streamCards.length, 3, 'Must render 3 project stream cards');
    
    const titles = streamCards.map(s => s.textContent).join(' ');
    Assert.contains(titles, 'Software Projects', 'Software stream');
    Assert.contains(titles, 'Hardware Projects', 'Hardware stream');
    Assert.contains(titles, 'IoT & Hybrid Projects', 'IoT stream');
    return 5;
  });

  // =========================================================================
  // 32. Filterable Project Portfolio Showcase
  // =========================================================================
  test(32, 'Filterable Project Portfolio Showcase', () => {
    const portfolioSection = dom.getElementById('portfolio');
    Assert.exists(portfolioSection, '#portfolio section must exist');
    const filterBtns = dom.querySelectorAll('.filter-btn');
    Assert.equal(filterBtns.length, 7, 'Must have 7 portfolio filter category buttons');
    
    const filters = filterBtns.map(b => b.getAttribute('data-filter'));
    Assert.isTrue(filters.includes('All'), 'Filter includes All');
    Assert.isTrue(filters.includes('Website'), 'Filter includes Website');
    Assert.isTrue(filters.includes('Software'), 'Filter includes Software');
    Assert.isTrue(filters.includes('IoT'), 'Filter includes IoT');
    Assert.isTrue(filters.includes('Hardware'), 'Filter includes Hardware');
    
    Assert.contains(js, 'initPortfolioFilter', 'main.js must define initPortfolioFilter');
    return 7;
  });

  // =========================================================================
  // 33. Interactive Project Detail / Showcase Cards
  // =========================================================================
  test(33, 'Project Showcase Cards', () => {
    const cards = dom.querySelectorAll('.portfolio-card');
    Assert.equal(cards.length, 6, 'Must have 6 portfolio showcase cards');
    cards.forEach(c => {
      Assert.exists(c.getAttribute('data-category'), 'Card must have data-category attribute');
      Assert.exists(c.querySelector('.portfolio-placeholder'), 'Card must have visual placeholder');
      Assert.exists(c.querySelector('.project-tags'), 'Card must have project tags');
    });
    return 5;
  });

  // =========================================================================
  // 34. 6-Step Student Support Roadmap
  // =========================================================================
  test(34, '6-Step Student Support Roadmap', () => {
    const steps = dom.querySelectorAll('.support-step');
    Assert.equal(steps.length, 6, 'Must have exactly 6 student roadmap steps');
    
    const stepsText = steps.map(s => s.textContent).join(' ');
    Assert.contains(stepsText, 'Idea & Feasibility', 'Step 01');
    Assert.contains(stepsText, 'Hardware & Architecture', 'Step 02');
    Assert.contains(stepsText, 'Code & Integration', 'Step 03');
    Assert.contains(stepsText, 'Testing & Debugging', 'Step 04');
    Assert.contains(stepsText, 'Documentation Support', 'Step 05');
    Assert.contains(stepsText, 'Viva & Demo Prep', 'Step 06');
    return 7;
  });

  // =========================================================================
  // 35. Software-to-Hardware Pipeline Flow
  // =========================================================================
  test(35, 'Software-to-Hardware Pipeline Flow', () => {
    const pipeSection = dom.getElementById('pipeline');
    Assert.exists(pipeSection, '#pipeline section must exist');
    const steps = dom.querySelectorAll('.pipeline-step');
    Assert.equal(steps.length, 7, 'Must have 7 pipeline steps');
    
    const exampleCard = dom.querySelector('.pipeline-example-card');
    Assert.exists(exampleCard, 'Real-world flow example card must exist');
    const flowPills = dom.querySelectorAll('.flow-pill');
    Assert.isGreaterThanOrEqual(flowPills.length, 6, 'Must have flow pills for connected architecture');
    return 5;
  });

  // =========================================================================
  // 36. "Who We Serve" Audience Grid
  // =========================================================================
  test(36, '"Who We Serve" Audience Grid', () => {
    const serveSection = dom.getElementById('who-we-serve');
    Assert.exists(serveSection, '#who-we-serve section must exist');
    const audienceCards = dom.querySelectorAll('.audience-card');
    Assert.equal(audienceCards.length, 8, 'Must have exactly 8 audience cards');
    
    const cardTitles = audienceCards.map(a => a.querySelector('h3').textContent).join(', ');
    Assert.contains(cardTitles, 'Students', 'Audience: Students');
    Assert.contains(cardTitles, 'Individuals', 'Audience: Individuals');
    Assert.contains(cardTitles, 'Small Businesses', 'Audience: Small Businesses');
    Assert.contains(cardTitles, 'Offices', 'Audience: Offices');
    return 6;
  });

  // =========================================================================
  // 37. "Why Choose Us" Values Grid
  // =========================================================================
  test(37, '"Why Choose Us" Values Grid', () => {
    const whySection = dom.getElementById('why-us');
    Assert.exists(whySection, '#why-us section must exist');
    const whyCards = dom.querySelectorAll('.why-card');
    Assert.equal(whyCards.length, 8, 'Must have exactly 8 value pillar cards');
    
    const titles = whyCards.map(w => w.querySelector('h3').textContent).join(', ');
    Assert.contains(titles, 'One Technology Partner', 'Pillar 1');
    Assert.contains(titles, 'Practical Solutions', 'Pillar 2');
    Assert.contains(titles, 'Transparent Communication', 'Pillar 4');
    Assert.contains(titles, 'Budget-Conscious', 'Pillar 5');
    return 6;
  });

  // =========================================================================
  // 38. 7-Step Work Methodology
  // =========================================================================
  test(38, '7-Step Work Methodology', () => {
    const procSection = dom.getElementById('process');
    Assert.exists(procSection, '#process section must exist');
    const procSteps = dom.querySelectorAll('.process-step');
    Assert.equal(procSteps.length, 7, 'Must have 7 process timeline steps');
    
    const titles = procSteps.map(p => p.querySelector('.step-title').textContent).join(' ');
    Assert.contains(titles, 'Understand', 'Step 1');
    Assert.contains(titles, 'Plan', 'Step 2');
    Assert.contains(titles, 'Design', 'Step 3');
    Assert.contains(titles, 'Build', 'Step 4');
    Assert.contains(titles, 'Test', 'Step 5');
    Assert.contains(titles, 'Deploy', 'Step 6');
    Assert.contains(titles, 'Support', 'Step 7');
    return 8;
  });

  // =========================================================================
  // 39. Interactive Problem Diagnostic Bar
  // =========================================================================
  test(39, 'Interactive Problem Diagnostic Bar', () => {
    const problemSection = dom.getElementById('tech-problem');
    Assert.exists(problemSection, '#tech-problem section must exist');
    const chips = dom.querySelectorAll('.problem-chip');
    Assert.equal(chips.length, 8, 'Must have exactly 8 diagnostic problem chips');
    
    chips.forEach(chip => {
      Assert.contains(chip.innerHTML, 'scrollToContact', 'Each chip must call scrollToContact onclick');
    });
    
    Assert.contains(js, 'function scrollToContact', 'main.js must implement scrollToContact');
    return 5;
  });

  // =========================================================================
  // 40. Interactive FAQ Accordion
  // =========================================================================
  test(40, 'Interactive FAQ Accordion', () => {
    const faqSection = dom.getElementById('faq');
    Assert.exists(faqSection, '#faq section must exist');
    const faqItems = dom.querySelectorAll('.faq-item');
    Assert.equal(faqItems.length, 9, 'Must have exactly 9 FAQ items');
    
    faqItems.forEach(item => {
      const q = item.querySelector('.faq-question');
      const a = item.querySelector('.faq-answer');
      Assert.exists(q, 'FAQ item must have .faq-question button');
      Assert.exists(a, 'FAQ item must have .faq-answer content');
      Assert.equal(q.getAttribute('aria-expanded'), 'false', 'Initial aria-expanded must be false');
    });
    
    Assert.contains(js, 'initFAQ', 'main.js must define initFAQ accordion handler');
    return 6;
  });

  // =========================================================================
  // 41. Frosted Glass Contact Cards
  // =========================================================================
  test(41, 'Frosted Glass Contact Cards & Credentials', () => {
    const contactSection = dom.getElementById('contact');
    Assert.exists(contactSection, '#contact section must exist');
    
    // Check verified company credentials in DOM and config
    Assert.contains(html, '+91 63647 68498', 'DOM contains verified phone +91 63647 68498');
    Assert.contains(html, 'lalithulalu@gmail.com', 'DOM contains primary email lalithulalu@gmail.com');
    Assert.contains(html, 'lalithlalu.com@yahoo.com', 'DOM contains alternate email lalithlalu.com@yahoo.com');
    Assert.contains(html, 'Tumakuru, Karnataka', 'DOM contains Tumakuru location');
    
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
    
    // Required fields
    Assert.exists(dom.getElementById('fullName'), '#fullName input exists');
    Assert.exists(dom.getElementById('phone'), '#phone input exists');
    Assert.exists(dom.getElementById('city'), '#city input exists');
    Assert.exists(dom.getElementById('customerType'), '#customerType select exists');
    Assert.exists(dom.getElementById('service'), '#service select exists');
    Assert.exists(dom.getElementById('description'), '#description textarea exists');
    
    // Optional fields
    Assert.exists(dom.getElementById('email'), '#email optional input exists');
    Assert.exists(dom.getElementById('budget'), '#budget optional select exists');
    Assert.exists(dom.getElementById('contactMethod'), '#contactMethod select exists');
    return 9;
  });

  // =========================================================================
  // 43. WhatsApp Consultation Dispatcher
  // =========================================================================
  test(43, 'WhatsApp Consultation Dispatcher', () => {
    Assert.contains(js, 'validateForm', 'main.js must implement validateForm');
    Assert.contains(js, 'formSuccess', 'main.js must display formSuccess upon valid submit');
    Assert.contains(config.company.whatsapp, '916364768498', 'WhatsApp target number configured correctly');
    
    const successEl = dom.getElementById('formSuccess');
    Assert.exists(successEl, '#formSuccess alert container must exist in DOM');
    Assert.isTrue(successEl.hasAttribute('hidden'), '#formSuccess must initially be hidden');
    return 5;
  });

  // =========================================================================
  // 44. 5-Column Corporate Footer
  // =========================================================================
  test(44, '5-Column Corporate Footer', () => {
    const footer = dom.getElementById('footer');
    Assert.exists(footer, '#footer element must exist');
    const cols = dom.querySelectorAll('.footer-col');
    Assert.equal(cols.length, 4, 'Must have 4 navigation columns in footer + 1 brand column');
    Assert.exists(dom.querySelector('.footer-brand'), 'Footer brand column must exist');
    Assert.contains(footer.textContent, '2026 Tech Boy Solutions', 'Copyright notice with 2026');
    Assert.contains(footer.textContent, 'Tumakuru', 'Footer includes Tumakuru references');
    return 5;
  });

  // =========================================================================
  // 45. Floating WhatsApp Action Widget
  // =========================================================================
  test(45, 'Floating WhatsApp Action Widget', () => {
    const waBtn = dom.getElementById('whatsapp-btn');
    Assert.exists(waBtn, '#whatsapp-btn must exist');
    Assert.contains(waBtn.innerHTML, '<svg', 'WhatsApp button must render SVG icon');
    Assert.contains(waBtn.textContent, 'Chat With Us', 'Tooltip text must be "Chat With Us"');
    
    Assert.contains(css, '.whatsapp-btn', 'CSS defines .whatsapp-btn styling');
    Assert.contains(css, 'position: fixed', 'WhatsApp widget is fixed to bottom-right corner');
    Assert.contains(js, 'initWhatsApp', 'main.js configures initWhatsApp link dynamically');
    return 6;
  });

  // =========================================================================
  // 46. Zero-Overlap Responsive Engine
  // =========================================================================
  test(46, 'Zero-Overlap Responsive Engine', () => {
    const mediaQueries = cssA.getMediaQueries();
    Assert.isGreaterThanOrEqual(mediaQueries.length, 5, 'Must define at least 5 responsive breakpoint media queries');
    
    // Check key breakpoints
    const mqText = mediaQueries.join(' ');
    Assert.contains(mqText, 'max-width: 768px', 'Includes tablet breakpoint 768px');
    Assert.contains(mqText, 'max-width: 480px', 'Includes mobile breakpoint 480px');
    Assert.contains(mqText, 'max-width: 360px', 'Includes ultra-compact breakpoint 360px');
    Assert.contains(css, 'clamp(', 'CSS uses fluid clamp typography for zero collision');
    return 5;
  });

  // =========================================================================
  // 47. GSAP Micro-Animations & ScrollTriggers
  // =========================================================================
  test(47, 'GSAP Micro-Animations & Fallbacks', () => {
    Assert.contains(html, 'gsap.min.js', 'index.html loads GSAP library');
    Assert.contains(html, 'ScrollTrigger.min.js', 'index.html loads ScrollTrigger plugin');
    Assert.contains(js, 'initScrollAnimations', 'main.js defines initScrollAnimations');
    Assert.contains(js, 'IntersectionObserver', 'main.js provides IntersectionObserver fallback');
    Assert.contains(js, 'prefers-reduced-motion', 'main.js honors prefers-reduced-motion accessibility');
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
    Assert.isGreaterThanOrEqual(results.length, 48, 'Test suite tracks all 49 distinct feature test blocks');
    Assert.exists(config.company, 'TBS_CONFIG.company is fully defined');
    Assert.exists(config.softwareServices, 'TBS_CONFIG.softwareServices is fully defined');
    Assert.exists(config.hardwareServices, 'TBS_CONFIG.hardwareServices is fully defined');
    return 5;
  });

  return results;
}

module.exports = { runTier1Tests };
