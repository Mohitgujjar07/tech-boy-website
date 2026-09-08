/**
 * Tech Boy Solutions — Main JavaScript
 * High-Performance SaaS Platform Engine
 * Complete Animations, Micro-interactions, Accessibility & Diagnostics
 */

'use strict';

// =========================================================================
// 1. Navigation Scroll & Active Section Spy
// =========================================================================
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    // Toggle scrolled styling
    if (scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active Section Detection
    updateActiveNavLink();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function updateActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-menu .nav-item, .nav-links .nav-link, #desktopNavLinks a');
  if (!navLinks.length) return;

  const sections = ['about', 'services', 'software', 'hardware', 'student-projects', 'projects', 'why-us', 'faq', 'contact'];
  let currentId = '';

  const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60);

  if (isAtBottom) {
    currentId = 'contact';
  } else {
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 180 && rect.bottom >= 120) {
          currentId = id;
          break;
        }
      }
    }
  }

  if (!currentId && window.scrollY < 200) {
    currentId = 'hero';
  }

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === `#${currentId}` || (currentId === 'projects' && href === '#projects') || (currentId === 'services' && href === '#services'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// =========================================================================
// 2. Mobile Glass Slide-Out Drawer & State Machine
// =========================================================================
function initMobileDrawer() {
  const hamburger = document.getElementById('hamburgerBtn') || document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileDrawerOverlay') || document.getElementById('mobileMenu');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn') || document.getElementById('mobileClose');
  const drawerLinks = document.querySelectorAll('.drawer-link, .mobile-link');

  if (!hamburger || !mobileMenu) return;

  const openMenu = () => {
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (document.activeElement && mobileMenu.contains(document.activeElement)) {
      hamburger.focus();
    }
  };

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeMenu);
  }

  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      closeMenu();
    }
  });

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  window.closeMobileDrawer = closeMenu;
}

// Aliases for compatibility
function initMobileNav() {
  initMobileDrawer();
}

// =========================================================================
// 3. Scroll-Triggered Reveal Animations
// =========================================================================
function initScrollReveal() {
  const revealSelectors = [
    '.reveal',
    '.reveal-left',
    '.reveal-right',
    '.reveal-scale',
    '.bento-card',
    '.project-bento-card',
    '.pipeline-step',
    '.faq-card',
    '.section-header-center',
    '.hero-text-block',
    '.hero-showcase-block'
  ];

  const elements = document.querySelectorAll(revealSelectors.join(', '));
  if (!elements.length) return;

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Immediate Fallback if IntersectionObserver unavailable or prefers-reduced-motion
  if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion) {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .bento-card, .project-bento-card, .pipeline-step, .faq-card').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  });

  elements.forEach(el => observer.observe(el));
}

// =========================================================================
// 4. Hero Stat Counter Animations
// =========================================================================
function initStatCounters() {
  const statElements = document.querySelectorAll('[data-count]');
  if (!statElements.length) return;

  const animateCounter = (el) => {
    if (el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';

    const rawTarget = el.getAttribute('data-count') || el.textContent;
    const target = parseFloat(rawTarget);
    if (isNaN(target)) return;

    const isDecimal = rawTarget.includes('.') || el.getAttribute('data-decimals') === '1';
    const decimals = isDecimal ? 1 : 0;
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = ease * target;

      el.textContent = isDecimal ? currentVal.toFixed(decimals) : Math.floor(currentVal).toString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = isDecimal ? target.toFixed(decimals) : target.toString();
      }
    }
    requestAnimationFrame(update);
  };

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion) {
    statElements.forEach(el => {
      const rawTarget = el.getAttribute('data-count');
      if (rawTarget) el.textContent = rawTarget;
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  statElements.forEach(el => observer.observe(el));
}

// =========================================================================
// 5. Back-to-Top Floating Button Handler
// =========================================================================
function initBackToTop() {
  const btn = document.getElementById('backToTop') || document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    if (scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// =========================================================================
// 6. Dynamic Hero Headline Word Rotator
// =========================================================================
function initHeroRotator() {
  const rotator = document.getElementById('heroRotator') || document.getElementById('wordRotator');
  if (!rotator) return;

  const phrases = [
    'Your Business.',
    'Your Needs.',
    'Your Growth.',
    'Any Challenge.',
    'Every Requirement.',
    'Modern Technology.'
  ];

  let index = 0;

  setInterval(() => {
    rotator.classList.add('fade-out');
    setTimeout(() => {
      index = (index + 1) % phrases.length;
      rotator.textContent = phrases[index];
      rotator.classList.remove('fade-out');
    }, 250);
  }, 3200);
}

function initWordCycle() {
  initHeroRotator();
}

// =========================================================================
// 7. Interactive Command Center Tabs (Software vs Hardware)
// =========================================================================
function initHeroHubTabs() {
  const tabBtns = document.querySelectorAll('.hub-tab-btn, .dashboard-tab');
  const bodies = document.querySelectorAll('.hub-body, .software-pane, .hardware-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const hub = btn.getAttribute('data-hub');
      tabBtns.forEach(b => b.classList.remove('active'));
      bodies.forEach(b => b.classList.remove('active'));

      btn.classList.add('active');
      const activeBody = document.getElementById('hub-' + hub) || document.querySelector(`.${hub}-pane`);
      if (activeBody) activeBody.classList.add('active');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  });
}

// =========================================================================
// 8. Category Bento Tabs Switcher
// =========================================================================
function initCategoryTabs() {
  const tabBtns = document.querySelectorAll('.cat-tab-btn');
  const panels = document.querySelectorAll('.category-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById('panel-' + cat);
      if (activePanel) activePanel.classList.add('active');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  });
}

// =========================================================================
// 9. 1-Click Problem Chip Pre-fill & Smooth Scroll
// =========================================================================
window.prefillContact = function(serviceText) {
  const serviceSelect = document.getElementById('serviceSelect') || document.getElementById('service');
  const messageArea = document.getElementById('message') || document.getElementById('description');
  const contactSection = document.getElementById('contact');

  if (serviceSelect && serviceText) {
    const textLower = serviceText.toLowerCase();

    // Priority-ordered keyword mapping rules
    const keywordRules = [
      // 1. Personal Portfolio
      {
        keywords: ['portfolio', 'personal site'],
        patterns: ['portfolio']
      },
      // 2. Custom PC Build
      {
        keywords: ['custom pc', 'pc built', 'pc build', 'gaming pc', 'editing pc', 'workstation'],
        patterns: ['custom pc', 'build']
      },
      // 3. Hardware Upgrades
      {
        keywords: ['upgrade', 'ssd', 'ram', 'storage upgrade', 'memory upgrade'],
        patterns: ['upgrade', 'ssd', 'ram']
      },
      // 4. Laptop & Hardware Repair
      {
        keywords: ['laptop', 'repair', 'hardware', 'screen', 'keyboard', 'servicing', 'troubleshoot', 'pc repair', 'pc troubleshooting', 'pc servicing'],
        patterns: ['repair', 'laptop']
      },
      // 5. Networking & Wi-Fi Setup
      {
        keywords: ['network', 'wi-fi', 'wifi', 'lan', 'cctv', 'cabling', 'router', 'switch', 'nas', 'ethernet', 'networking'],
        patterns: ['networking', 'wi-fi', 'wifi', 'lan']
      },
      // 6. IoT & Student Academic Projects
      {
        keywords: ['student', 'project', 'viva', 'academic', 'iot', 'smart', 'arduino', 'esp32', 'sensor', 'telemetry', 'final-year', 'final year', 'embedded', 'circuit', 'lab'],
        patterns: ['student', 'project', 'academic', 'iot']
      },
      // 7. Excel & Office Automation
      {
        keywords: ['excel', 'office', 'vba', 'formula', 'macro', 'sheet', 'spreadsheet', 'template', 'powerpoint', 'word template', 'deck', 'billing sheet', 'inventory sheet'],
        patterns: ['excel', 'office']
      },
      // 8. Custom Software & CRM
      {
        keywords: ['custom software', 'software', 'crm', 'erp', 'portal', 'api', 'backend', 'full-stack', 'full stack'],
        patterns: ['custom software', 'software', 'crm']
      },
      // 9. Website & Web Development
      {
        keywords: ['website', 'web app', 'web application', 'web development', 'web', 'app', 'ui/ux', 'frontend', 'site', 'design', 'html', 'react'],
        patterns: ['website', 'web', 'software']
      },
      // 10. Other / General
      {
        keywords: ['other', 'general', 'consultation'],
        patterns: ['other']
      }
    ];

    let matchedIndex = -1;

    // Step A: Check keyword rules against options with non-empty values
    for (const rule of keywordRules) {
      const keywordHit = rule.keywords.some(kw => textLower.includes(kw));
      if (keywordHit) {
        for (let i = 0; i < serviceSelect.options.length; i++) {
          const opt = serviceSelect.options[i];
          if (!opt.value || opt.value.trim() === '') continue;
          const optVal = opt.value.toLowerCase();
          const optTxt = opt.text.toLowerCase();
          const matchPattern = rule.patterns.some(p => optVal.includes(p) || optTxt.includes(p));
          if (matchPattern) {
            matchedIndex = i;
            break;
          }
        }
        if (matchedIndex !== -1) break;
      }
    }

    // Step B: Direct inclusion match against option values and texts (non-empty options only)
    if (matchedIndex === -1) {
      for (let i = 0; i < serviceSelect.options.length; i++) {
        const opt = serviceSelect.options[i];
        if (!opt.value || opt.value.trim() === '') continue;
        const optVal = opt.value.toLowerCase();
        const optTxt = opt.text.toLowerCase();
        const isMatch = textLower.includes(optVal) ||
                        textLower.includes(optTxt) ||
                        (textLower.length >= 3 && (optVal.includes(textLower) || optTxt.includes(textLower)));
        if (isMatch) {
          matchedIndex = i;
          break;
        }
      }
    }

    // Step C: Fallback to "Other" option if available
    if (matchedIndex === -1) {
      for (let i = 0; i < serviceSelect.options.length; i++) {
        const opt = serviceSelect.options[i];
        if (!opt.value || opt.value.trim() === '') continue;
        if (opt.value.toLowerCase().includes('other') || opt.text.toLowerCase().includes('other')) {
          matchedIndex = i;
          break;
        }
      }
    }

    // Step D: Fallback to first valid non-empty option (never select empty option with value="")
    if (matchedIndex === -1) {
      for (let i = 0; i < serviceSelect.options.length; i++) {
        const opt = serviceSelect.options[i];
        if (opt.value && opt.value.trim() !== '') {
          matchedIndex = i;
          break;
        }
      }
    }

    // Apply selection and trigger change event
    if (matchedIndex !== -1 && matchedIndex < serviceSelect.options.length) {
      serviceSelect.selectedIndex = matchedIndex;
      serviceSelect.value = serviceSelect.options[matchedIndex].value;
      try {
        const changeEvt = typeof Event === 'function' ? new Event('change', { bubbles: true }) : new CustomEvent('change', { bubbles: true });
        serviceSelect.dispatchEvent(changeEvt);
      } catch (err) {
        // Event constructor fallback for simulated environments
      }
    }
  }

  if (messageArea && serviceText) {
    messageArea.value = 'Hello Tech Boy Solutions, I am inquiring about: ' + serviceText;
  }

  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.handleDiagnosticSelection = function(problemText, targetService, targetCustomerType) {
  const serviceSelect = document.getElementById('serviceSelect') || document.getElementById('service');
  const messageArea = document.getElementById('message') || document.getElementById('description');
  const customerTypeSelect = document.getElementById('customerType');
  const contactSection = document.getElementById('contact');

  if (targetService && serviceSelect) {
    for (let i = 0; i < serviceSelect.options.length; i++) {
      if (serviceSelect.options[i].value === targetService || serviceSelect.options[i].text.includes(targetService)) {
        serviceSelect.selectedIndex = i;
        break;
      }
    }
  }

  if (targetCustomerType && customerTypeSelect) {
    for (let i = 0; i < customerTypeSelect.options.length; i++) {
      if (customerTypeSelect.options[i].value === targetCustomerType || customerTypeSelect.options[i].text.includes(targetCustomerType)) {
        customerTypeSelect.selectedIndex = i;
        break;
      }
    }
  }

  if (messageArea && problemText) {
    messageArea.value = problemText;
  }

  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// =========================================================================
// 10. Accessible FAQ Accordion & ARIA Toggling
// =========================================================================
function initFAQ() {
  const faqCards = document.querySelectorAll('.faq-card, .faq-item');

  faqCards.forEach(card => {
    const head = card.querySelector('.faq-head, .faq-question');
    const content = card.querySelector('.faq-content, .faq-answer');

    if (head) {
      head.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');

        // Mutex accordion: close all others
        faqCards.forEach(c => {
          c.classList.remove('open');
          const h = c.querySelector('.faq-head, .faq-question');
          const ct = c.querySelector('.faq-content, .faq-answer');
          if (h) h.setAttribute('aria-expanded', 'false');
          if (ct) ct.setAttribute('aria-hidden', 'true');
        });

        if (!isOpen) {
          card.classList.add('open');
          head.setAttribute('aria-expanded', 'true');
          if (content) content.setAttribute('aria-hidden', 'false');
        }
      });
    }
  });
}

// =========================================================================
// 11. Student Project Detail Modal & Bill of Materials
// =========================================================================
const projectData = {
  'iot-station': {
    title: 'Cloud-Connected Smart Sensor Station',
    category: 'IoT & Embedded Systems',
    desc: 'An end-to-end telemetry station leveraging ESP32 microcontroller with BME280 temperature/humidity sensor and MQ-135 air quality module. Sends real-time JSON packets over MQTT to an AWS IoT Core / Node.js web dashboard.',
    bom: ['ESP32 DevKit V1', 'BME280 Sensor', 'MQ-135 Gas Sensor', '0.96 OLED Display', '5V Relay Module', 'Solar PMIC Circuit'],
    viva: [
      'Why MQTT over HTTP? MQTT has minimal payload overhead and supports bidirectional publish-subscribe.',
      'How is power regulated? Using an onboard AMS1117 3.3V LDO regulator and MPPT solar charging.'
    ]
  },
  'web-billing': {
    title: 'Inventory & Billing Management Portal',
    category: 'Full-Stack Web Application',
    desc: 'A full-stack React and Node.js application managing product SKU catalogues, GST invoice generation, client ledgers, and low-stock SMS/WhatsApp alert dispatch.',
    bom: ['React.js Frontend', 'Node.js / Express API', 'PostgreSQL / MongoDB', 'PDFKit Invoice Engine', 'JWT Authentication', 'Tailwind CSS'],
    viva: [
      'How are concurrent invoice numbers locked? Using atomic SQL sequences to prevent collisions.',
      'How is sensitive user data secured? Bcrypt password hashing and HTTP-only JWT cookies.'
    ]
  },
  'custom-pc': {
    title: 'Creator & 4K Video Editing Workstation',
    category: 'Custom PC Hardware Architecture',
    desc: 'A thermally optimized workstation configured specifically for Adobe Premiere Pro, DaVinci Resolve, and Unreal Engine rendering workloads with Gen4 NVMe scratch disks.',
    bom: ['AMD Ryzen 9 7950X', 'NVIDIA GeForce RTX 4080', '64GB Dual-Channel DDR5', '2TB Gen4 NVMe 7000MB/s SSD', '360mm AIO Liquid Cooler', '850W 80+ Gold Modular PSU'],
    viva: [
      'Why Dual Channel RAM? Doubles memory bandwidth, crucial for video timeline scrubbing.',
      'Why Gen4 NVMe over SATA? 7000MB/s transfer allows uncompressed 4K timeline rendering without dropped frames.'
    ]
  },
  'autonomous-rover': {
    title: 'Autonomous Obstacle-Navigating Vision Rover',
    category: 'Robotics & Computer Vision',
    desc: 'An embedded robotics system using Raspberry Pi 4 paired with Arduino Nano for motor telemetry, OpenCV computer vision for line following, and ultrasonic radar array for obstacle bypass.',
    bom: ['Raspberry Pi 4 (4GB)', 'Arduino Nano', 'Raspberry Pi Camera V2', 'L298N Dual H-Bridge Motor Driver', 'HC-SR04 Ultrasonic Array', '3S Li-Po Battery Pack'],
    viva: [
      'How does OpenCV handle frame latency? Frames are downsampled to 320x240 and processed in a dedicated POSIX background thread.',
      'How is serial communication between Pi and Arduino protected? Checksum bytes are attached to every motor speed command packet.'
    ]
  },
  'excel-cockpit': {
    title: 'Automated Financial & Inventory KPI Cockpit',
    category: 'Business & Office Automation',
    desc: 'A high-yield corporate Excel financial dashboard integrating Power Query automated data pipelines, dynamic XLOOKUP formulas, automated tax ledger generation, and automated PDF statement output.',
    bom: ['Excel Power Query ETL Engine', 'VBA Dynamic Macro Modules', 'Dynamic Array Formulas', 'Conditional Formatting Rules', 'Automated One-Click PDF Dispatch'],
    viva: [
      'Why use Power Query over manual copy-paste? Power Query enables idempotent, refreshable ETL transformations directly from CSV or SQL sources.',
      'How are formula recalculation slowdowns prevented? Dynamic Named Ranges and non-volatile index lookup techniques.'
    ]
  },
  'enterprise-lan': {
    title: 'Enterprise Structured LAN & Dual-WAN Wi-Fi Mesh',
    category: 'Networking & Infrastructure',
    desc: 'A business network deployment featuring Cat6 gigabit structural cabling, Cisco managed switches, VLAN department segregation, and seamless roaming dual-band Wi-Fi 6 access points.',
    bom: ['Cisco Managed Gigabit Switch', 'Cat6 Pure Copper UTP Cabling', 'Dual-WAN Gigabit Load Balancing Router', 'Wi-Fi 6 Mesh Access Points', 'Wall-Mounted 9U Server Rack'],
    viva: [
      'Why implement VLANs? To logically isolate accounting and guest traffic from internal server data for security and broadcast suppression.',
      'What is the benefit of Dual-WAN failover? Automatic failover ensures zero internet downtime if the primary ISP link drops.'
    ]
  }
};

window.openProjectModal = function(projectId) {
  const modal = document.getElementById('projectModal');
  const content = document.getElementById('modalContent');
  const data = projectData[projectId];
  if (!modal || !content || !data) return;

  content.innerHTML = `
    <span class="apple-eyebrow" style="margin-bottom: 8px;">${data.category}</span>
    <h3 style="font-family: var(--font-ui); font-size: 1.35rem; font-weight: 700; margin-bottom: 12px;">${data.title}</h3>
    <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px;">${data.desc}</p>
    
    <h4 style="font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; margin-bottom: 8px;">Key Components / Stack:</h4>
    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;">
      ${data.bom.map(item => `<span style="background: #F1F5F9; border: 1px solid #E2E8F0; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">${item}</span>`).join('')}
    </div>

    <h4 style="font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; margin-bottom: 8px;">Viva Exam Questions & Insights:</h4>
    <ul style="display: flex; flex-direction: column; gap: 8px; font-size: 0.825rem; color: var(--text-muted); margin-bottom: 24px;">
      ${data.viva.map(q => `<li style="background: #F8FAFC; border-left: 3px solid #2563EB; padding: 8px 12px; border-radius: 4px;">${q}</li>`).join('')}
    </ul>

    <a href="#contact" class="apple-btn-primary" onclick="closeProjectModal(); prefillContact('Guidance for ' + '${data.title}');" style="display: inline-flex; width: 100%; justify-content: center;">
      Request Student Project Guidance
    </a>
  `;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.closeProjectModal = function() {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
};

function initModalClose() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeProjectModal);
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal) window.closeProjectModal();
  });
}

function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-bento-card');
  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter') || 'all';

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        if (filter === 'all' || category.includes(filter)) {
          card.style.display = 'flex';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(() => {
            if (card.style.opacity === '0') {
              card.style.display = 'none';
            }
          }, 240);
        }
      });
    });
  });
}

// =========================================================================
// 12. Global Keyboard Accessibility (Escape Key Handler)
// =========================================================================
function initKeyboardAccessibility() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close project modal
      const modal = document.getElementById('projectModal');
      if (modal && (modal.classList.contains('open') || modal.getAttribute('aria-hidden') === 'false')) {
        window.closeProjectModal();
      }

      // Close mobile drawer
      const hamburger = document.getElementById('hamburgerBtn') || document.getElementById('hamburger');
      const mobileMenu = document.getElementById('mobileDrawerOverlay') || document.getElementById('mobileMenu');
      if (mobileMenu && (mobileMenu.classList.contains('open') || mobileMenu.getAttribute('aria-hidden') === 'false')) {
        mobileMenu.classList.remove('open');
        if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (hamburger) hamburger.focus();
      }
    }
  });
}

// =========================================================================
// 13. Consultation Form Validation & WhatsApp Dispatcher
// =========================================================================
function initConsultationForm() {
  const form = document.getElementById('consultationForm');
  const successBanner = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const serviceInput = document.getElementById('serviceSelect') || document.getElementById('service');
    const messageInput = document.getElementById('message') || document.getElementById('description');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const service = serviceInput ? serviceInput.value : '';
    const message = messageInput ? messageInput.value.trim() : '';

    let valid = true;

    // Name Validation
    const nameErr = document.getElementById('fullNameError');
    if (!name) {
      if (nameErr) nameErr.textContent = 'Please enter your name.';
      valid = false;
    } else if (nameErr) {
      nameErr.textContent = '';
    }

    // Phone Validation
    const phoneErr = document.getElementById('phoneError');
    const phoneRegex = /^[\d\s+\-()]{7,15}$/;
    if (!phone || !phoneRegex.test(phone)) {
      if (phoneErr) phoneErr.textContent = 'Please enter a valid phone number.';
      valid = false;
    } else if (phoneErr) {
      phoneErr.textContent = '';
    }

    // Email Validation (Optional)
    const emailErr = document.getElementById('emailError');
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (emailErr) emailErr.textContent = 'Please enter a valid email address.';
        valid = false;
      } else if (emailErr) {
        emailErr.textContent = '';
      }
    } else if (emailErr) {
      emailErr.textContent = '';
    }

    // Service Validation
    const serviceErr = document.getElementById('serviceError');
    if (!service) {
      if (serviceErr) serviceErr.textContent = 'Please select a service.';
      valid = false;
    } else if (serviceErr) {
      serviceErr.textContent = '';
    }

    // Message Validation
    const messageErr = document.getElementById('messageError');
    if (!message) {
      if (messageErr) messageErr.textContent = 'Please describe your requirement.';
      valid = false;
    } else if (messageErr) {
      messageErr.textContent = '';
    }

    if (!valid) return;

    if (successBanner) {
      successBanner.style.display = 'flex';
      successBanner.removeAttribute('hidden');
    }

    const whatsappPayload = encodeURIComponent(
      `Hello Tech Boy Solutions!\n\n*New Consultation Inquiry*\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email || 'N/A'}\n*Service:* ${service}\n*Requirement:* ${message}\n\nLocation: Tumakuru, Karnataka, India`
    );

    setTimeout(() => {
      window.open(`https://wa.me/916364768498?text=${whatsappPayload}`, '_blank');
      form.reset();
    }, 800);
  });
}

// =========================================================================
// 14. Theme Manager (Light SaaS Default & Dark Mode Persistence)
// =========================================================================
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('tbs_theme') || 'light';

  document.documentElement.setAttribute('data-theme', savedTheme);
  document.body.setAttribute('data-theme', savedTheme);

  if (!themeToggle) return;

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('tbs_theme', newTheme);

    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
  });
}
// =========================================================================
// 15. 3D Card Hover Tilt Physics
// =========================================================================
function initCardTiltEffect() {
  const cards = document.querySelectorAll('.bento-card, .project-bento-card, .apple-window-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.classList.add('tilt-card');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotX = ((y - centerY) / centerY) * -6;
      const rotY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

// =========================================================================
// 16. Cursor Spotlight on Cards
// =========================================================================
function initCursorSpotlight() {
  const cards = document.querySelectorAll('.bento-card, .project-bento-card, .apple-window-card, .contact-glass-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--spot-x', x + 'px');
      card.style.setProperty('--spot-y', y + 'px');
      card.style.background = `radial-gradient(circle 200px at ${x}px ${y}px, rgba(0, 210, 255, 0.06), transparent 70%), var(--bg-card)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}

// =========================================================================
// 17. DOM Content Loaded Bootstrap
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Cosmic ASCII Background
  if (typeof initCosmicAsciiShader === 'function') {
    initCosmicAsciiShader('cosmicAsciiCanvas');
  }

  initThemeToggle();
  initNavbarScroll();
  initMobileDrawer();
  initScrollReveal();
  initStatCounters();
  initBackToTop();
  initHeroRotator();
  initHeroHubTabs();
  initCategoryTabs();
  initProjectFilter();
  initFAQ();
  initModalClose();
  initKeyboardAccessibility();
  initConsultationForm();
  initCardTiltEffect();
  initCursorSpotlight();

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
