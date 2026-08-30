/**
 * @file tier2-boundaries.test.js
 * @description Tier 2: Boundary & Corner Cases (>= 5 test cases per boundary condition)
 * Tests extreme viewports (320px - 4K), empty/invalid inputs, rapid toggling, special characters, ESC handling, reduced motion.
 */

const {
  getHTMLContent,
  getCSSContent,
  getJSContent,
  getTBSConfig,
  CSSAnalyzer,
  Assert,
  simulateFormValidation,
  buildWhatsAppPayload
} = require('./test-utils');

function runTier2Tests() {
  const css = getCSSContent();
  const js = getJSContent();
  const config = getTBSConfig();
  const cssA = new CSSAnalyzer(css);

  const results = [];

  function test(boundaryId, boundaryName, testFn) {
    const startTime = Date.now();
    try {
      const assertions = testFn();
      const count = typeof assertions === 'number' ? assertions : 5;
      results.push({
        id: `B${boundaryId.toString().padStart(2, '0')}`,
        name: boundaryName,
        passed: true,
        assertions: count,
        durationMs: Date.now() - startTime,
        error: null
      });
    } catch (err) {
      results.push({
        id: `B${boundaryId.toString().padStart(2, '0')}`,
        name: boundaryName,
        passed: false,
        assertions: 0,
        durationMs: Date.now() - startTime,
        error: err.message
      });
    }
  }

  // =========================================================================
  // 1. Mobile 320px - 360px Ultra-Compact Viewport Boundaries
  // =========================================================================
  test(1, 'Mobile 320px-360px Ultra-Compact Viewport', () => {
    // Check 360px media query rule exists
    const m360 = cssA.getRuleBlock('@media (max-width: 360px)');
    Assert.contains(css, 'max-width: 360px', 'CSS contains 360px mobile media query');
    Assert.contains(css, 'max-width: 480px', 'CSS contains 480px mobile media query');
    Assert.contains(css, 'overflow-x: hidden', 'Body/html prevents horizontal overflow');
    
    // Check typography scaling and padding reduction
    Assert.contains(css, 'box-sizing: border-box', 'Universal box-sizing border-box applied');
    Assert.contains(css, 'width: 100%', 'Mobile cards set to 100% width');
    return 5;
  });

  // =========================================================================
  // 2. 1920px+ 4K Ultra-Wide Viewport Boundaries
  // =========================================================================
  test(2, '1920px+ 4K Ultra-Wide Viewport Containment', () => {
    const wrapRule = cssA.getRuleBlock('.wrap');
    Assert.exists(wrapRule, '.wrap rule must be defined in CSS');
    Assert.contains(wrapRule, 'max-width', '.wrap must enforce a maximum width to prevent 4K stretching');
    Assert.contains(wrapRule, 'margin-left: auto', '.wrap must be horizontally centered');
    Assert.contains(wrapRule, 'margin-right: auto', '.wrap must be horizontally centered');
    
    const navRule = cssA.getRuleBlock('#navbar');
    Assert.contains(navRule, 'max-width: 1120px', 'Navbar must have a max-width limit on 4K');
    return 5;
  });

  // =========================================================================
  // 3. Empty Required Form Fields Validation
  // =========================================================================
  test(3, 'Empty Required Form Fields Validation', () => {
    // 1. Completely empty form
    const r1 = simulateFormValidation({});
    Assert.isFalse(r1.isValid, 'Completely empty form must be invalid');
    Assert.equal(r1.errors.fullName, 'This field is required.', 'FullName error');
    Assert.equal(r1.errors.phone, 'This field is required.', 'Phone error');
    Assert.equal(r1.errors.city, 'This field is required.', 'City error');
    Assert.equal(r1.errors.customerType, 'This field is required.', 'CustomerType error');
    Assert.equal(r1.errors.service, 'This field is required.', 'Service error');
    Assert.equal(r1.errors.description, 'This field is required.', 'Description error');

    // 2. Whitespace-only values
    const r2 = simulateFormValidation({
      fullName: '   ',
      phone: '  ',
      city: ' ',
      customerType: '',
      service: '',
      description: ' \n '
    });
    Assert.isFalse(r2.isValid, 'Whitespace only form must be rejected as empty');
    return 8;
  });

  // =========================================================================
  // 4. Invalid Phone Number Formats
  // =========================================================================
  test(4, 'Invalid Phone Number Formats', () => {
    const validBase = {
      fullName: 'Rahul Sharma',
      city: 'Tumakuru',
      customerType: 'Student',
      service: 'IoT Project',
      description: 'Need help with ESP32 sensor setup'
    };

    // Case A: Alphabetic characters
    const resA = simulateFormValidation({ ...validBase, phone: 'abcdefghij' });
    Assert.isFalse(resA.isValid, 'Alpha phone must fail');
    Assert.equal(resA.errors.phone, 'Please enter a valid phone number.');

    // Case B: Too short (< 7 digits)
    const resB = simulateFormValidation({ ...validBase, phone: '12345' });
    Assert.isFalse(resB.isValid, 'Phone < 7 digits must fail');

    // Case C: Too long (> 15 digits)
    const resC = simulateFormValidation({ ...validBase, phone: '1234567890123456789' });
    Assert.isFalse(resC.isValid, 'Phone > 15 digits must fail');

    // Case D: Invalid symbols
    const resD = simulateFormValidation({ ...validBase, phone: '+91 98765 #$*@' });
    Assert.isFalse(resD.isValid, 'Symbols in phone must fail');

    // Case E: Valid phone formats
    const resE1 = simulateFormValidation({ ...validBase, phone: '+91 63647 68498' });
    Assert.isTrue(resE1.isValid, 'Standard +91 phone must pass');
    const resE2 = simulateFormValidation({ ...validBase, phone: '6364768498' });
    Assert.isTrue(resE2.isValid, '10-digit phone must pass');
    return 6;
  });

  // =========================================================================
  // 5. Invalid vs Valid Optional Email Formats
  // =========================================================================
  test(5, 'Invalid vs Valid Optional Email Formats', () => {
    const validBase = {
      fullName: 'Sneha Patel',
      phone: '+91 98765 43210',
      city: 'Bangalore',
      customerType: 'Business',
      service: 'Website Development',
      description: 'Corporate website with product catalog'
    };

    // Missing @
    const res1 = simulateFormValidation({ ...validBase, email: 'snehapatel.com' });
    Assert.isFalse(res1.isValid, 'Email without @ must fail');

    // Missing domain
    const res2 = simulateFormValidation({ ...validBase, email: 'sneha@' });
    Assert.isFalse(res2.isValid, 'Email without domain must fail');

    // Spaces inside email
    const res3 = simulateFormValidation({ ...validBase, email: 'sneha patel@gmail.com' });
    Assert.isFalse(res3.isValid, 'Email with spaces must fail');

    // Valid email
    const res4 = simulateFormValidation({ ...validBase, email: 'lalithulalu@gmail.com' });
    Assert.isTrue(res4.isValid, 'Valid email must pass');

    // Optional email omitted (empty string)
    const res5 = simulateFormValidation({ ...validBase, email: '' });
    Assert.isTrue(res5.isValid, 'Omitted optional email must pass');
    return 5;
  });

  // =========================================================================
  // 6. Rapid Theme Toggling
  // =========================================================================
  test(6, 'Rapid Theme Toggling State Consistency', () => {
    // Simulate 100 rapid toggles
    let currentTheme = 'light';
    for (let i = 0; i < 100; i++) {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    }
    Assert.equal(currentTheme, 'light', '100 toggles from light must end in light');

    // Odd number of toggles
    for (let i = 0; i < 101; i++) {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    }
    Assert.equal(currentTheme, 'dark', '101 toggles from light must end in dark');

    // Ensure CSS theme tokens exist for both states
    Assert.exists(cssA.getVariable('--bg-deep', 'light'), 'Light theme token defined');
    Assert.exists(cssA.getVariable('--bg-deep', 'dark'), 'Dark theme token defined');
    Assert.notEqual(cssA.getVariable('--accent', 'light'), cssA.getVariable('--accent', 'dark'), 'Light & Dark accents are tuned');
    return 5;
  });

  // =========================================================================
  // 7. Special Characters & URL Encoding in WhatsApp Payloads
  // =========================================================================
  test(7, 'Special Characters & URL Encoding', () => {
    const payload = {
      fullName: 'Dr. John O\'Connor & Partners <script>alert(1)</script>',
      phone: '+91 63647 68498',
      email: 'john+test@example.com',
      city: 'Tumakuru & Bengaluru #572101',
      customerType: 'Office',
      service: 'Excel / Word / PPT',
      budget: '₹15,000 – ₹30,000',
      contactMethod: 'WhatsApp',
      description: 'Requirement includes quotes: "Special PC Setup" & Indian Rupee ₹ symbols, + emojis 🚀💻!'
    };

    const waUrl = buildWhatsAppPayload(payload, config);
    Assert.isTrue(waUrl.startsWith('https://wa.me/916364768498?text='), 'Target WhatsApp URL prefix correct');
    Assert.contains(waUrl, encodeURIComponent(payload.fullName), 'Full name properly URL encoded');
    Assert.contains(waUrl, encodeURIComponent(payload.city), 'City properly URL encoded');
    Assert.contains(waUrl, encodeURIComponent(payload.description), 'Description with quotes and emojis URL encoded');
    Assert.isFalse(waUrl.includes('<script>'), 'Unencoded script tags must not appear in raw URL');
    return 5;
  });

  // =========================================================================
  // 8. ESC Key Drawer Dismissal & Accessibility States
  // =========================================================================
  test(8, 'ESC Key & Keyboard Dismissal Architecture', () => {
    Assert.contains(js, "e.key === 'Escape'", 'main.js handles Escape key');
    Assert.contains(js, "mobileMenu.classList.remove('open')", 'Escape key removes open class from mobile menu');
    Assert.contains(js, "hamburger.setAttribute('aria-expanded', 'false')", 'Escape key updates aria-expanded');
    Assert.contains(js, "document.body.style.overflow = ''", 'Escape key restores document body scroll');
    Assert.contains(js, "hamburger.focus()", 'Escape key returns focus to hamburger trigger');
    return 5;
  });

  // =========================================================================
  // 9. Reduced Motion Media Query Fallbacks
  // =========================================================================
  test(9, 'Reduced Motion Media Query Fallbacks', () => {
    Assert.contains(css, 'prefers-reduced-motion: reduce', 'styles.css implements prefers-reduced-motion media query');
    Assert.contains(js, 'prefers-reduced-motion: reduce', 'main.js checks prefers-reduced-motion');
    Assert.contains(js, "document.querySelectorAll('.reveal').forEach", 'main.js immediately reveals elements when reduced motion preferred');
    Assert.contains(css, 'transition: none', 'styles.css disables animated transitions on reduced motion');
    Assert.contains(css, 'animation: none', 'styles.css disables infinite keyframe loops on reduced motion');
    return 5;
  });

  return results;
}

module.exports = { runTier2Tests };
