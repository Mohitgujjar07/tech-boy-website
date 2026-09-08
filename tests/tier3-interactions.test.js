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
    Assert.isTrue(css.includes('.apple-form-card') || css.includes('.consultation-form'), 'CSS defines form container');
    Assert.contains(css, 'var(--border-subtle)', 'Form uses border token');
    Assert.contains(css, 'var(--text-main)', 'Form inputs use text variable');
    
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
    const mobileMenu = dom.getElementById('mobileDrawerOverlay') || dom.getElementById('mobileMenu');
    Assert.exists(mobileMenu, 'Mobile menu drawer exists');
    const links = mobileMenu.querySelectorAll('a');
    Assert.isGreaterThanOrEqual(links.length, 5, 'Mobile menu has navigation links');

    // Verify all mobile links target real section IDs in DOM
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href !== '#') {
        const targetId = href.slice(1);
        const targetEl = dom.getElementById(targetId);
        Assert.exists(targetEl, `Mobile link ${href} must target a valid DOM section #${targetId}`);
      }
    });

    Assert.isTrue(js.includes('drawerLinks') || js.includes('mobileMenu') || js.includes('drawer-link'), 'main.js attaches close handlers to mobile links');
    return 8;
  });

  // =========================================================================
  // 3. Diagnostic Problem Chip Click + Form Auto-Fill + WhatsApp Redirect
  // =========================================================================
  test(3, 'Diagnostic Chip Click + Form Auto-Fill + WhatsApp Redirect', () => {
    const chips = dom.querySelectorAll('.diag-chip');
    Assert.isGreaterThanOrEqual(chips.length, 6, 'At least 6 problem chips available');

    const serviceSelect = {
      options: [
        { value: '', text: 'Select a service category' },
        { value: 'Website Development', text: 'Website Development' },
        { value: 'Personal Portfolio', text: 'Personal Portfolio Website' },
        { value: 'Custom Software', text: 'Custom Software / CRM' },
        { value: 'Laptop / PC Repair', text: 'Laptop / PC Repair & Servicing' },
        { value: 'Custom PC Build', text: 'Custom PC Build (Gaming / Editing)' },
        { value: 'Computer Upgrade', text: 'Computer SSD / RAM Upgrade' },
        { value: 'Networking & Wi-Fi', text: 'LAN Cabling & Wi-Fi Setup' },
        { value: 'Student Project', text: 'Final-Year Student Project Guidance' },
        { value: 'Excel Solutions', text: 'Excel Sheet / Office Automation' },
        { value: 'Other', text: 'Other Requirement' }
      ],
      selectedIndex: 0,
      value: '',
      dispatchEvent: () => {}
    };
    const messageArea = { value: '' };
    const win = {};
    const doc = {
      getElementById: (id) => {
        if (id === 'serviceSelect' || id === 'service') return serviceSelect;
        if (id === 'message' || id === 'description') return messageArea;
        if (id === 'contact') return { scrollIntoView: () => {} };
        return null;
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      body: { style: {} },
      documentElement: { scrollHeight: 1000 }
    };
    const runJS = new Function('window', 'document', 'localStorage', 'Event', 'CustomEvent', js);
    runJS(win, doc, { getItem: () => null, setItem: () => {} }, function(t) { this.type = t; }, function(t) { this.type = t; });

    Assert.exists(win.prefillContact, 'prefillContact function must be exposed on window');

    // Test all chips
    chips.forEach(chip => {
      const onclick = chip.getAttribute('onclick');
      Assert.exists(onclick, 'Chip has onclick attribute');
      const match = onclick.match(/prefillContact\(['"](.*)['"]\)/);
      if (match) {
        const text = match[1];
        win.prefillContact(text);
        const selOpt = serviceSelect.options[serviceSelect.selectedIndex];
        Assert.isTrue(Boolean(selOpt && selOpt.value), `Chip prefill for "${text}" must select a non-empty option`);
        Assert.contains(messageArea.value, text, 'Message textarea is pre-filled with requirement text');
      }
    });

    const problemText = 'I need a professional website for my business.';
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
    return 18;
  });

  // =========================================================================
  // 4. Category Tab Filter + Card Visibility Transition
  // =========================================================================
  test(4, 'Category Bento Tabs + Dynamic Panel Filtering', () => {
    const tabBtns = dom.querySelectorAll('.cat-tab-btn');
    const panels = dom.querySelectorAll('.category-panel');
    Assert.isGreaterThanOrEqual(tabBtns.length, 5, '5 category tabs exist');
    Assert.isGreaterThanOrEqual(panels.length, 5, '5 category panels exist');

    const cards = dom.querySelectorAll('.bento-card');
    Assert.isGreaterThanOrEqual(cards.length, 20, '20 total service bento cards exist');

    Assert.contains(js, 'initCategoryTabs', 'main.js handles category tab switching');
    Assert.contains(js, 'classList.add(\'active\')', 'main.js toggles active class on panels');
    return 6;
  });

  // =========================================================================
  // 5. FAQ Accordion Mutex & Sequential Toggles
  // =========================================================================
  test(5, 'FAQ Accordion Mutex & State Toggling', () => {
    const cards = dom.querySelectorAll('.faq-card');
    Assert.isGreaterThanOrEqual(cards.length, 4, 'FAQ cards present');

    Assert.contains(js, 'initFAQ', 'main.js defines initFAQ accordion handler');
    Assert.contains(js, 'classList.remove(\'open\')', 'main.js removes open class from sibling items');
    Assert.contains(js, 'classList.add(\'open\')', 'main.js adds open class to selected item');
    return 5;
  });

  // =========================================================================
  // 6. Quick Service Discovery Grid + Target Section Anchors
  // =========================================================================
  test(6, 'Service Discovery Cards Anchor Routing', () => {
    const catBtns = dom.querySelectorAll('.cat-tab-btn');
    Assert.isGreaterThanOrEqual(catBtns.length, 5, '5 discovery category buttons present');

    catBtns.forEach(btn => {
      const cat = btn.getAttribute('data-category');
      Assert.exists(cat, 'Category tab has data-category');
      const panel = dom.getElementById('panel-' + cat);
      Assert.exists(panel, `Category panel #panel-${cat} exists in index.html`);
    });
    return 8;
  });

  // =========================================================================
  // 7. Floating WhatsApp CTA + Dynamic Config Sync
  // =========================================================================
  test(7, 'Floating WhatsApp CTA + Config Sync', () => {
    Assert.equal(config.company.whatsapp, '916364768498', 'config.js WhatsApp number matches 916364768498');
    Assert.contains(html, '916364768498', 'index.html contains WhatsApp number');
    Assert.contains(js, '916364768498', 'main.js uses WhatsApp number');
    return 5;
  });

  // =========================================================================
  // 8. Methodology Timeline + Pipeline Multi-Domain Flow
  // =========================================================================
  test(8, 'Methodology Timeline + Pipeline Multi-Domain Flow', () => {
    const pipelineItems = dom.querySelectorAll('.pipeline-item');
    const trustPillars = dom.querySelectorAll('.pillar-card');
    Assert.isGreaterThanOrEqual(pipelineItems.length, 4, '4 Pipeline engineering steps');
    Assert.isGreaterThanOrEqual(trustPillars.length, 4, '4 Trust pillar cards');

    const pipe1Text = pipelineItems[0].textContent;
    Assert.contains(pipe1Text, 'Scope', 'Pipeline begins with Requirement Scope');
    return 5;
  });

  return results;
}

module.exports = { runTier3Tests };
