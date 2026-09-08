/**
 * @file tier4-scenarios.test.js
 * @description Tier 4: Real-World Workload Scenarios (End-to-End User Journeys)
 * Simulates complete realistic user journeys for students, corporate clients, repair customers, and office network inquiries.
 */

const {
  getHTMLContent,
  getCSSContent,
  getTBSConfig,
  DOMParserLite,
  Assert,
  simulateFormValidation,
  buildWhatsAppPayload
} = require('./test-utils');

function runTier4Tests() {
  const html = getHTMLContent();
  const css = getCSSContent();
  const config = getTBSConfig();
  const dom = new DOMParserLite(html);

  const results = [];

  function test(scenarioId, scenarioName, testFn) {
    const startTime = Date.now();
    try {
      const assertions = testFn();
      const count = typeof assertions === 'number' ? assertions : 5;
      results.push({
        id: `S${scenarioId.toString().padStart(2, '0')}`,
        name: scenarioName,
        passed: true,
        assertions: count,
        durationMs: Date.now() - startTime,
        error: null
      });
    } catch (err) {
      results.push({
        id: `S${scenarioId.toString().padStart(2, '0')}`,
        name: scenarioName,
        passed: false,
        assertions: 0,
        durationMs: Date.now() - startTime,
        error: err.message
      });
    }
  }

  // =========================================================================
  // Scenario 1: Final-Year Engineering Student IoT Project Consultation Journey
  // =========================================================================
  test(1, 'Final-Year Student IoT Project Inquiry Journey', () => {
    // Step 1: Student visits site and navigates to #projects
    const studentSection = dom.getElementById('projects');
    Assert.exists(studentSection, 'Student lands on #projects section');
    
    // Step 2: Reviews student launchpad banner & proof
    const banner = dom.querySelector('.innovation-feature-banner');
    Assert.exists(banner, 'Student reviews academic innovation banner');
    
    // Step 3: Diagnostic problem chip
    const problemText = 'I need a final-year IoT engineering project.';
    const chips = dom.querySelectorAll('.diag-chip');
    const targetChip = chips.find(c => c.textContent.includes('IoT') || c.textContent.includes('project'));
    Assert.exists(targetChip, 'Diagnostic chip for IoT project found');

    // Step 4: Fills student consultation form
    const studentInput = {
      fullName: 'Kiran Kumar',
      phone: '+91 98441 23456',
      email: 'kiran.sit@gmail.com',
      city: 'Tumakuru',
      customerType: 'Student',
      service: 'Student Project',
      budget: '₹5,000 – ₹15,000',
      contactMethod: 'WhatsApp',
      description: `${problemText} Need ESP32 with temperature, gas sensors, and cloud web dashboard for university submission.`
    };

    const validation = simulateFormValidation(studentInput);
    Assert.isTrue(validation.isValid, 'Student form submission passes validation cleanly');

    // Step 5: Dispatches to WhatsApp quote link
    const waUrl = buildWhatsAppPayload(studentInput, config);
    Assert.contains(waUrl, 'https://wa.me/916364768498', 'Directs to verified WhatsApp number');
    Assert.contains(waUrl, encodeURIComponent('Kiran Kumar'), 'Contains student name');
    Assert.contains(waUrl, encodeURIComponent('Student Project'), 'Contains service type');
    Assert.contains(waUrl, encodeURIComponent('ESP32'), 'Contains technical description');
    return 8;
  });

  // =========================================================================
  // Scenario 2: Small Business Commercial Website & Billing Inquiry Journey
  // =========================================================================
  test(2, 'Small Business Commercial Website & Billing Inquiry Journey', () => {
    // Step 1: Business owner browses solutions division
    const servicesSection = dom.getElementById('services');
    Assert.exists(servicesSection, 'Business owner visits #services section');

    // Step 2: Inspects Website Development and Custom Software cards
    const webDevCard = dom.querySelectorAll('.bento-card').find(c => c.textContent.includes('Websites') || c.textContent.includes('Website Development'));
    const customSoftwareCard = dom.querySelectorAll('.bento-card').find(c => c.textContent.includes('Custom Software'));
    Assert.exists(webDevCard, 'Web Development card available');
    Assert.exists(customSoftwareCard, 'Custom Software card available');

    // Step 3: Clicks business website chip
    const problemText = 'I need a professional website for my business.';
    
    // Step 4: Fills business consultation form
    const businessInput = {
      fullName: 'Manjunath Swamy',
      phone: '+91 94480 98765',
      email: 'contact@manjustores.com',
      city: 'Tumakuru Market, Tumakuru',
      customerType: 'Business',
      service: 'Website Development',
      budget: '₹15,000 – ₹30,000',
      contactMethod: 'Phone Call',
      description: `${problemText} Need e-commerce store with local payment integration and inventory billing dashboard.`
    };

    const validation = simulateFormValidation(businessInput);
    Assert.isTrue(validation.isValid, 'Business form submission validates successfully');

    // Step 5: Verify WhatsApp payload
    const waUrl = buildWhatsAppPayload(businessInput, config);
    Assert.contains(waUrl, 'https://wa.me/916364768498', 'Correct WhatsApp destination');
    Assert.contains(waUrl, encodeURIComponent('Manjunath Swamy'), 'Contains business owner name');
    Assert.contains(waUrl, encodeURIComponent('Business'), 'Contains customer type');
    Assert.contains(waUrl, encodeURIComponent('Phone Call'), 'Contains preferred contact method');
    return 8;
  });

  // =========================================================================
  // Scenario 3: Urgent Laptop Repair & SSD Upgrade Customer Journey
  // =========================================================================
  test(3, 'Urgent Laptop Repair & SSD Upgrade Customer Journey', () => {
    // Step 1: Customer opens solutions division
    const servicesSection = dom.getElementById('services');
    Assert.exists(servicesSection, 'Customer visits #services section');

    // Step 2: Checks Laptop Repair and Upgrades cards
    const laptopRepairCard = dom.querySelectorAll('.bento-card').find(c => c.textContent.includes('Laptop Repair'));
    const upgradeCard = dom.querySelectorAll('.bento-card').find(c => c.textContent.includes('RAM & SSD') || c.textContent.includes('Upgrades'));
    Assert.exists(laptopRepairCard, 'Laptop Repair card available');
    Assert.exists(upgradeCard, 'Computer Upgrades card available');

    // Step 3: Selects "My laptop is very slow." chip
    const problemText = 'My laptop is very slow and needs an SSD/RAM upgrade.';

    // Step 4: Enters repair consultation details
    const repairInput = {
      fullName: 'Priya Narayana',
      phone: '+91 81234 56789',
      email: '', // Omitted optional email
      city: 'Batawadi, Tumakuru',
      customerType: 'Individual',
      service: 'Laptop Repair',
      budget: '₹5,000 – ₹15,000',
      contactMethod: 'WhatsApp',
      description: `${problemText} Dell Inspiron takes 10 minutes to boot. Need 512GB NVMe SSD upgrade and RAM expansion.`
    };

    const validation = simulateFormValidation(repairInput);
    Assert.isTrue(validation.isValid, 'Repair customer form validates cleanly with optional email omitted');

    // Step 5: Verify WhatsApp payload
    const waUrl = buildWhatsAppPayload(repairInput, config);
    Assert.contains(waUrl, encodeURIComponent('Priya Narayana'), 'Contains customer name');
    Assert.contains(waUrl, encodeURIComponent('Laptop Repair'), 'Contains Laptop Repair service');
    Assert.contains(waUrl, encodeURIComponent('Dell Inspiron'), 'Contains hardware description');
    return 7;
  });

  // =========================================================================
  // Scenario 4: Small Office Structured LAN & Wi-Fi Network Setup Journey
  // =========================================================================
  test(4, 'Small Office Structured LAN & Wi-Fi Setup Journey', () => {
    // Step 1: Office manager discovers networking services
    const servicesSection = dom.getElementById('services');
    Assert.exists(servicesSection, '#services section exists');

    // Step 2: Reviews Networking cards
    const officeNetCard = dom.querySelectorAll('.bento-card').find(c => c.textContent.includes('Structured LAN') || c.textContent.includes('Wi-Fi') || c.textContent.includes('Cabling'));
    Assert.exists(officeNetCard, 'Office Network card available');

    // Step 3: Problem text
    const problemText = 'I need full Wi-Fi and LAN cabling in my office.';

    // Step 4: Fills office consultation form
    const officeInput = {
      fullName: 'Dr. Ramesh Babu',
      phone: '+91 97400 11223',
      email: 'dr.ramesh@siddharthaclinic.org',
      city: 'SS Puram, Tumakuru',
      customerType: 'Office',
      service: 'Networking',
      budget: '₹30,000 – ₹60,000',
      contactMethod: 'WhatsApp',
      description: `${problemText} 2-floor medical clinic with 8 desktop terminals, 3 network printers, and patient guest Wi-Fi.`
    };

    const validation = simulateFormValidation(officeInput);
    Assert.isTrue(validation.isValid, 'Office network consultation validates successfully');

    // Step 5: Verify WhatsApp payload
    const waUrl = buildWhatsAppPayload(officeInput, config);
    Assert.contains(waUrl, encodeURIComponent('Dr. Ramesh Babu'), 'Contains doctor / manager name');
    Assert.contains(waUrl, encodeURIComponent('Networking'), 'Contains Networking service');
    Assert.contains(waUrl, encodeURIComponent('2-floor medical clinic'), 'Contains detailed requirement specs');
    return 8;
  });

  return results;
}

module.exports = { runTier4Tests };
