/**
 * @file tier3-interactions.test.js
 * @description Tier 3: Cross-Feature Interactions & Pairwise Integration Tests
 * Tests cross-module state transitions, event cascades, pairwise synergies, and synchronous interactions.
 */

const {
  getHTMLContent,
  getCSSContent,
  getJSContent,
  getTBSConfig,
  DOMParserLite,
  CSSAnalyzer,
  Assert,
  simulateFormValidation,
  buildWhatsAppPayload
} = require('./test-utils');

function runTier3Tests() {
  const html = getHTMLContent();
  const css = getCSSContent();
  const js = getJSContent();
  const config = getTBSConfig();
  const dom = new DOMParserLite(html);
  const cssA = new CSSAnalyzer(css);

  const results = [];

  function test(interactionId, interactionName, testFn) {
    const startTime = Date.now();
    try {
      const assertions = testFn();
      const count = typeof assertions === 'number' ? assertions : 5;
      results.push({
        id: `I${interactionId.toString().padStart(2, '0')}`,
        name: interactionName,
        passed: true,
        assertions: count,
        durationMs: Date.now() - startTime,
        error: null
      });
    } catch (err) {
      results.push({
        id: `I${interactionId.toString().padStart(2, '0')}`,
        name: interactionName,
        passed: false,
        assertions: 0,
        durationMs: Date.now() - startTime,
        error: err.message
      });
    }
  }

  // =========================================================================
  // 1. Theme Toggle + Consultation Form Styling Integration
  // =========================================================================
  test(1, 'Theme Toggle + Consultation Form Styling Integration', () => {
    // Check form background tokens in light and dark
    Assert.contains(css, '.consultation-form', 'CSS defines form container');
    Assert.contains(css, 'var(--bg-surface)', 'Form uses --bg-surface variable for surface background');
    Assert.contains(css, 'var(--glass-border)', 'Form uses --glass-border variable for border');
    Assert.contains(css, 'var(--text-primary)', 'Form inputs use --text-primary variable');
    
    // Check dark mode override tokens
    const darkSurface = cssA.getVariable('--bg-surface', 'dark');
    const lightSurface = cssA.getVariable('--bg-surface', 'light') || cssA.getVariable('--bg-surface', 'root');
    Assert.exists(darkSurface, 'Dark mode defines --bg-surface');
    Assert.exists(lightSurface, 'Light mode defines --bg-surface');
    Assert.notEqual(darkSurface, lightSurface, 'Form surface adapts cleanly to dark theme');
    return 6;
  });

  // =========================================================================
  // 2. Mobile Drawer Open + Anchor Navigation Cascade
  // =========================================================================
  test(2, 'Mobile Drawer Open + Anchor Navigation Cascade', () => {
    const mobileMenu = dom.getElementById('mobileMenu');
    const links = mobileMenu.querySelectorAll('.mobile-link');
    Assert.isGreaterThanOrEqual(links.length, 8, 'Mobile menu has navigation links');

    // Verify all mobile links target real section IDs in DOM
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href !== '#') {
        const targetId = href.slice(1);
        const targetEl = dom.getElementById(targetId);
        Assert.exists(targetEl, `Mobile link ${href} must target a valid DOM section #${targetId}`);
      }
    });

    // Verify JS close drawer on link click
    Assert.contains(js, "mobileMenu.querySelectorAll('.mobile-link')", 'main.js attaches close handlers to mobile links');
    Assert.contains(js, "link.addEventListener('click', closeMenu)", 'Mobile link click triggers closeMenu');
    return 10;
  });

  // =========================================================================
  // 3. Diagnostic Problem Chip Click + Form Auto-Fill + WhatsApp Redirect
  // =========================================================================
  test(3, 'Diagnostic Chip Click + Form Auto-Fill + WhatsApp Redirect', () => {
    const chips = dom.querySelectorAll('.problem-chip');
    Assert.isGreaterThanOrEqual(chips.length, 8, 'At least 8 problem chips available');

    // Simulate clicking chip 1: "I need a website for my business."
    const problemText = 'I need a website for my business.';
    const formData = {
      fullName: 'Vikram Joshi',
      phone: '+91 98450 12345',
      email: 'vikram@mybusiness.in',
      city: 'Tumakuru',
      customerType: 'Business',
      service: 'Website Development',
      budget: '₹30,000 – ₹60,000',
      contactMethod: 'WhatsApp',
      description: problemText
    };

    const validation = simulateFormValidation(formData);
    Assert.isTrue(validation.isValid, 'Auto-filled problem form must pass validation');

    const waUrl = buildWhatsAppPayload(formData, config);
    Assert.contains(waUrl, 'https://wa.me/916364768498', 'Target WhatsApp endpoint correct');
    Assert.contains(waUrl, encodeURIComponent(problemText), 'WhatsApp payload contains auto-filled problem text');
    Assert.contains(waUrl, encodeURIComponent('Vikram Joshi'), 'WhatsApp payload contains applicant name');
    return 6;
  });

  // =========================================================================
  // 4. Portfolio Category Tab Filter + Card Visibility Transition
  // =========================================================================
  test(4, 'Portfolio Filter Tabs + Dynamic Card Filtering', () => {
    const filterBtns = dom.querySelectorAll('.filter-btn');
    const cards = dom.querySelectorAll('.portfolio-card');
    Assert.isGreaterThanOrEqual(filterBtns.length, 7, '7 filter category tabs exist');
    Assert.isGreaterThanOrEqual(cards.length, 6, '6 portfolio showcase cards exist');

    const categories = ['All', 'Website', 'Software', 'IoT', 'Hardware', 'Networking', 'Design'];
    categories.forEach(cat => {
      if (cat === 'All') {
        const matchCount = cards.length;
        Assert.isGreaterThanOrEqual(matchCount, 6, 'All category shows all cards');
      } else {
        const matched = cards.filter(c => c.getAttribute('data-category') === cat);
        Assert.isGreaterThanOrEqual(matched.length, 1, `Category ${cat} matches at least 1 showcase card`);
      }
    });

    // Check JS filter transition implementation
    Assert.contains(js, "card.style.display = 'block'", 'main.js enables matching cards');
    Assert.contains(js, "card.style.display = 'none'", 'main.js hides non-matching cards');
    return 9;
  });

  // =========================================================================
  // 5. FAQ Accordion Mutex & Sequential Toggles
  // =========================================================================
  test(5, 'FAQ Accordion Mutex & State Toggling', () => {
    const items = dom.querySelectorAll('.faq-item');
    Assert.equal(items.length, 9, '9 FAQ items present');

    // Check accordion JS logic closes other items when one is opened
    Assert.contains(js, "faqItems.forEach(i => {", 'main.js iterates over all items to close inactive');
    Assert.contains(js, "i.classList.remove('open')", 'main.js removes open class from sibling items');
    Assert.contains(js, "item.classList.add('open')", 'main.js adds open class to selected item');
    Assert.contains(js, "question.setAttribute('aria-expanded', 'true')", 'main.js flips aria-expanded on active item');
    return 5;
  });

  // =========================================================================
  // 6. Quick Service Discovery Grid + Target Section Anchors
  // =========================================================================
  test(6, 'Service Discovery Cards Anchor Routing', () => {
    const discoveryCards = dom.querySelectorAll('.discovery-card');
    Assert.equal(discoveryCards.length, 10, '10 discovery cards present');

    discoveryCards.forEach(card => {
      const targetSelector = card.getAttribute('data-target');
      Assert.exists(targetSelector, 'Discovery card has data-target');
      Assert.isTrue(targetSelector.startsWith('#'), 'data-target is an ID selector');
      
      const targetId = targetSelector.slice(1);
      const targetEl = dom.getElementById(targetId);
      Assert.exists(targetEl, `Target element ${targetSelector} must exist in index.html`);
    });
    return 10;
  });

  // =========================================================================
  // 7. Floating WhatsApp CTA + Dynamic Config Sync
  // =========================================================================
  test(7, 'Floating WhatsApp CTA + Config Sync', () => {
    const waBtn = dom.getElementById('whatsapp-btn');
    Assert.exists(waBtn, '#whatsapp-btn exists in DOM');
    
    Assert.equal(config.company.whatsapp, '916364768498', 'config.js WhatsApp number matches 916364768498');
    Assert.exists(config.company.whatsappMessage, 'config.js defines whatsappMessage');
    
    Assert.contains(js, 'TBS_CONFIG.company.whatsapp', 'main.js reads whatsapp from TBS_CONFIG');
    Assert.contains(js, 'encodeURIComponent(message)', 'main.js URL encodes default WhatsApp message');
    return 5;
  });

  // =========================================================================
  // 8. Methodology Timeline + Pipeline Multi-Domain Flow
  // =========================================================================
  test(8, 'Methodology Timeline + Pipeline Multi-Domain Flow', () => {
    const processSteps = dom.querySelectorAll('.process-step');
    const pipelineSteps = dom.querySelectorAll('.pipeline-step');
    Assert.equal(processSteps.length, 7, '7 Methodology process steps');
    Assert.equal(pipelineSteps.length, 7, '7 Pipeline integration stages');

    // Compare step names for synergy
    const p1Title = processSteps[0].querySelector('.step-title').textContent;
    const pipe1Label = pipelineSteps[0].querySelector('.pipeline-label').textContent;
    Assert.equal(p1Title, 'Understand', 'Process begins with Understand');
    Assert.equal(pipe1Label, 'Idea', 'Pipeline begins with Idea');
    return 5;
  });

  return results;
}

module.exports = { runTier3Tests };
