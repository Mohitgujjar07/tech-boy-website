/**
 * AarambhX Technology — Highlights & Social Media Controller
 * Handles category filtering, lazy iframe loading, and theme synchronization.
 */

(function() {
  'use strict';

  // Category Filtering
  function setupFilters() {
    const filterBtns = document.querySelectorAll('.hl-filter-btn');
    const cards = document.querySelectorAll('.hl-card[data-category]');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filter = this.dataset.filter;
        cards.forEach(card => {
          const cat = card.dataset.category || '';
          const matches = filter === 'all' || cat === 'all' || cat === filter || cat.split(/\s+/).includes(filter);
          if (matches) {
            card.style.display = 'flex';
            // slight fade in
            card.style.opacity = '0';
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.25s ease';
              card.style.opacity = '1';
            });
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Lazy-load Instagram Iframes
  function setupLazyIframes() {
    if (!('IntersectionObserver' in window)) return;

    const embedWraps = document.querySelectorAll('.hl-embed-wrap[data-src]');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const wrap = entry.target;
          const src = wrap.dataset.src;
          if (src && !wrap.querySelector('iframe')) {
            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.className = 'hl-embed-iframe';
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('loading', 'lazy');
            iframe.setAttribute('scrolling', 'no');
            iframe.setAttribute('title', wrap.dataset.title || 'Instagram Reel');
            wrap.appendChild(iframe);
          }
          obs.unobserve(wrap);
        }
      });
    }, { rootMargin: '100px 0px' });

    embedWraps.forEach(wrap => observer.observe(wrap));
  }

  // Theme Switcher Sync
  function setupTheme() {
    const themeBtn = document.getElementById('hlThemeToggle');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', function() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      document.documentElement.classList.toggle('dark-theme', next === 'dark');
      document.documentElement.classList.toggle('light-theme', next === 'light');
      localStorage.setItem('tbs_theme', next);
      localStorage.setItem('tb_theme', next);

      // Icon update
      const icon = themeBtn.querySelector('i');
      if (icon && window.lucide) {
        icon.setAttribute('data-lucide', next === 'dark' ? 'moon' : 'sun');
        window.lucide.createIcons();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    setupFilters();
    setupLazyIframes();
    setupTheme();

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  });

})();
