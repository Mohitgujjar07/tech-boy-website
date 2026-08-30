/**
 * Tech Boy Solutions — Main JavaScript
 * Compact Apple iOS Glassmorphic SaaS Platform
 */

'use strict';

// 1. Apple Glass Navbar Scroll Effect
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// 2. Mobile Drawer Navigation
function initMobileDrawer() {
  const hamburger = document.getElementById('hamburgerBtn');
  const drawerOverlay = document.getElementById('mobileDrawerOverlay');
  const closeBtn = document.getElementById('drawerCloseBtn');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (!hamburger || !drawerOverlay) return;

  const openDrawer = () => {
    drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) closeDrawer();
  });
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));
}

// 3. Hero Word Rotator
function initHeroRotator() {
  const rotator = document.getElementById('heroRotator');
  if (!rotator) return;

  const phrases = [
    'Your Business.',
    'Your Needs.',
    'Your Growth.',
    'Any Challenge.',
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

// 4. Hero Live Command Hub Tabs
function initHeroHubTabs() {
  const tabBtns = document.querySelectorAll('.hub-tab-btn');
  const bodies = document.querySelectorAll('.hub-body');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const hub = btn.getAttribute('data-hub');
      tabBtns.forEach(b => b.classList.remove('active'));
      bodies.forEach(b => b.classList.remove('active'));

      btn.classList.add('active');
      const activeBody = document.getElementById('hub-' + hub);
      if (activeBody) activeBody.classList.add('active');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  });
}

// 5. Category Bento Tabs Switcher
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

// 6. 1-Click Problem Chip Pre-fill & Scroll
window.prefillContact = function(serviceText) {
  const serviceSelect = document.getElementById('serviceSelect');
  const messageArea = document.getElementById('message');
  const contactSection = document.getElementById('contact');

  if (serviceSelect && serviceText) {
    let matched = false;
    for (let i = 0; i < serviceSelect.options.length; i++) {
      if (serviceSelect.options[i].text.toLowerCase().includes(serviceText.toLowerCase().split(' ')[0])) {
        serviceSelect.selectedIndex = i;
        matched = true;
        break;
      }
    }
    if (!matched) serviceSelect.value = 'Other';
  }

  if (messageArea && serviceText) {
    messageArea.value = 'Hello Tech Boy Solutions, I am inquiring about: ' + serviceText;
  }

  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// 7. FAQ Accordion
function initFAQ() {
  const faqCards = document.querySelectorAll('.faq-card');

  faqCards.forEach(card => {
    const head = card.querySelector('.faq-head');
    if (head) {
      head.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');
        faqCards.forEach(c => c.classList.remove('open'));
        if (!isOpen) card.classList.add('open');
      });
    }
  });
}

// 8. Project Details Modal
const projectData = {
  'iot-station': {
    title: 'Cloud-Connected Smart Sensor Station',
    category: 'IoT & Embedded Systems',
    desc: 'An end-to-end telemetry station leveraging ESP32 microcontroller with BME280 temperature/humidity sensor and MQ-135 air quality module. Sends real-time JSON packets over MQTT to an AWS IoT Core / Node.js web dashboard.',
    bom: ['ESP32 DevKit V1', 'BME280 Sensor', 'MQ-135 Gas Sensor', '0.96 OLED Display', '5V Relay Module'],
    viva: [
      'Why MQTT over HTTP? MQTT has minimal payload overhead and supports bidirectional publish-subscribe.',
      'How is power regulated? Using an onboard AMS1117 3.3V LDO regulator.'
    ]
  },
  'web-billing': {
    title: 'Inventory & Billing Management Portal',
    category: 'Full-Stack Web Application',
    desc: 'A full-stack React and Node.js application managing product SKU catalogues, GST invoice generation, client ledgers, and low-stock SMS/WhatsApp alert dispatch.',
    bom: ['React.js Frontend', 'Node.js / Express API', 'PostgreSQL / MongoDB', 'PDFKit Invoice Engine', 'JWT Authentication'],
    viva: [
      'How are concurrent invoice numbers locked? Using atomic SQL sequences to prevent collisions.',
      'How is sensitive user data secured? Bcrypt password hashing and HTTP-only JWT cookies.'
    ]
  },
  'custom-pc': {
    title: 'Creator & 4K Video Editing Workstation',
    category: 'Custom PC Hardware Architecture',
    desc: 'A thermally optimized workstation configured specifically for Adobe Premiere Pro, DaVinci Resolve, and Unreal Engine rendering workloads with Gen4 NVMe scratch disks.',
    bom: ['Multi-Core High-IPC CPU', '32GB/64GB Dual-Channel DDR5', 'Gen4 NVMe 7000MB/s SSD', 'High Airflow Mesh Chassis', '80+ Gold Modular PSU'],
    viva: [
      'Why Dual Channel RAM? Doubles memory bandwidth, crucial for video timeline scrubbing.',
      'Why Gen4 NVMe over SATA? 7000MB/s transfer allows uncompressed 4K timeline rendering without dropped frames.'
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

    <a href="#contact" class="apple-btn-primary" onclick="document.getElementById('projectModal').classList.remove('open'); prefillContact('Guidance for ' + '${data.title}');" style="display: inline-flex; width: 100%; justify-content: center;">
      Request Student Project Guidance
    </a>
  `;

  modal.classList.add('open');
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

function initModalClose() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

// 9. Consultation Form & WhatsApp Quote Generator
function initConsultationForm() {
  const form = document.getElementById('consultationForm');
  const successBanner = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const service = document.getElementById('serviceSelect').value;
    const message = document.getElementById('message').value.trim();

    let valid = true;

    if (!name) {
      document.getElementById('fullNameError').textContent = 'Please enter your name.';
      valid = false;
    } else {
      document.getElementById('fullNameError').textContent = '';
    }

    if (!phone || phone.length < 9) {
      document.getElementById('phoneError').textContent = 'Please enter a valid phone number.';
      valid = false;
    } else {
      document.getElementById('phoneError').textContent = '';
    }

    if (!service) {
      document.getElementById('serviceError').textContent = 'Please select a service.';
      valid = false;
    } else {
      document.getElementById('serviceError').textContent = '';
    }

    if (!message) {
      document.getElementById('messageError').textContent = 'Please describe your requirement.';
      valid = false;
    } else {
      document.getElementById('messageError').textContent = '';
    }

    if (!valid) return;

    if (successBanner) {
      successBanner.style.display = 'flex';
    }

    const whatsappPayload = encodeURIComponent(
      `Hello Tech Boy Solutions!\n\n*New Consultation Inquiry*\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email || 'N/A'}\n*Service:* ${service}\n*Requirement:* ${message}\n\nLocation: Tumakuru, Karnataka, India`
    );

    setTimeout(() => {
      window.open(`https://wa.me/916364768498?text=${whatsappPayload}`, '_blank');
      form.reset();
    }, 1000);
  });
}

// 10. DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileDrawer();
  initHeroRotator();
  initHeroHubTabs();
  initCategoryTabs();
  initFAQ();
  initModalClose();
  initConsultationForm();

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
