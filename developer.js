/**
 * Aarambhx DEVSTREAM — Developer-Centric Light Tech UI Controller
 * Manages Event Stream Table interactions, timeline bar state, and mobile drawer.
 */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initEventStreamSelector();
    initMobileDrawer();
    initSmoothAnchors();
    initUrlFocus();
  });

  function initUrlFocus() {
    try {
      const params = new URLSearchParams(window.location.search);
      const focusId = params.get('focus');
      if (focusId) {
        const el = document.getElementById(focusId);
        if (el) {
          window.scrollTo(0, el.offsetTop);
        }
      }
    } catch (e) {}
  }

  // ============================================================
  // 1. Event Stream Table Click-to-Highlight
  // ============================================================
  function initEventStreamSelector() {
    const eventItems = document.querySelectorAll('.event-item');
    const tableRows = document.querySelectorAll('#streamTableBody tr');

    if (!eventItems.length || !tableRows.length) return;

    eventItems.forEach(item => {
      item.addEventListener('click', () => {
        const spanKey = item.getAttribute('data-span');

        // Update active sidebar item
        eventItems.forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        // Highlight matching table row
        tableRows.forEach(row => {
          const rowKey = row.getAttribute('data-span-row');
          const bar = row.querySelector('.timeline-bar-inner');

          if (rowKey === spanKey) {
            row.classList.add('highlighted');
            if (bar) bar.classList.add('active');
            row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            row.classList.remove('highlighted');
            if (bar) bar.classList.remove('active');
          }
        });
      });
    });

    // Also allow clicking rows directly
    tableRows.forEach(row => {
      row.addEventListener('click', () => {
        const rowKey = row.getAttribute('data-span-row');
        const targetItem = document.querySelector(`.event-item[data-span="${rowKey}"]`);
        if (targetItem) {
          targetItem.click();
        }
      });
    });
  }

  // ============================================================
  // 2. Mobile Menu Drawer
  // ============================================================
  function initMobileDrawer() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('devDrawer');
    const closeBtn = document.getElementById('drawerCloseBtn');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    if (!toggleBtn || !drawer) return;

    const openDrawer = () => {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    toggleBtn.addEventListener('click', openDrawer);

    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }

    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) {
        closeDrawer();
      }
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  // ============================================================
  // 3. Smooth Anchor Scroll
  // ============================================================
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

})();
