/**
 * AarambhX Technology — Interactive 3D Brochure Controller
 * Responsive StPageFlip engine with sound effects, thumbnails, zoom & direct download.
 */

(function() {
  'use strict';

  const TOTAL_PAGES = 12;
  let pageFlip = null;
  let soundEnabled = true;
  let isZoomed = false;

  // DOM Elements
  const bookElement = document.getElementById('flipbook');
  const bookWrapper = document.getElementById('book-canvas-wrap');
  const loaderElement = document.getElementById('reader-loader');
  const currentPageEl = document.getElementById('current-page');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const sidePrevBtn = document.getElementById('sidePrevBtn');
  const sideNextBtn = document.getElementById('sideNextBtn');
  const firstPageBtn = document.getElementById('firstPageBtn');
  const lastPageBtn = document.getElementById('lastPageBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const fullscreenToggleBtn = document.getElementById('fullscreenToggleBtn');
  const thumbsToggleBtn = document.getElementById('thumbsToggleBtn');
  const thumbsDrawer = document.getElementById('thumbnailsDrawer');
  const thumbsTrack = document.getElementById('thumbnailsTrack');
  const zoomToggleBtn = document.getElementById('zoomToggleBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // ============================================================
  // 1. WEB AUDIO API SYNTHESIZED PAGE FLIP SOUND EFFECT
  // ============================================================
  let audioCtx = null;
  function playFlipSound() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Generate soft paper whoosh sound using filtered white noise
      const bufferSize = audioCtx.sampleRate * 0.18; // ~180ms
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // pink-ish noise decay
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.18);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  // ============================================================
  // 2. RESPONSIVE DIMENSIONS CALCULATION
  // ============================================================
  function computeBookDimensions() {
    const wrapWidth = bookWrapper.clientWidth;
    const wrapHeight = bookWrapper.clientHeight;
    const aspectRatio = 1.414; // A4 standard

    let pageHeight = Math.min(wrapHeight * 0.82, 920);
    let pageWidth = pageHeight / aspectRatio;

    if (wrapWidth < 800) {
      // Mobile single page
      pageWidth = Math.min(wrapWidth * 0.88, 520);
      pageHeight = pageWidth * aspectRatio;
      if (pageHeight > wrapHeight * 0.85) {
        pageHeight = wrapHeight * 0.85;
        pageWidth = pageHeight / aspectRatio;
      }
    } else {
      // Desktop double page spread
      if (pageWidth * 2 > wrapWidth * 0.9) {
        pageWidth = (wrapWidth * 0.9) / 2;
        pageHeight = pageWidth * aspectRatio;
      }
    }

    return {
      width: Math.round(pageWidth),
      height: Math.round(pageHeight)
    };
  }

  // ============================================================
  // 3. INITIALIZE STPAGEFLIP
  // ============================================================
  function initFlipbook() {
    if (typeof St === 'undefined' || !St.PageFlip) {
      console.error('StPageFlip library not loaded');
      return;
    }

    const dims = computeBookDimensions();

    pageFlip = new St.PageFlip(bookElement, {
      width: dims.width,
      height: dims.height,
      size: 'stretch',
      minWidth: 260,
      maxWidth: 900,
      minHeight: 360,
      maxHeight: 1000,
      maxShadowOpacity: 0.5,
      showCover: true,
      mobileScrollSupport: false,
      usePortrait: true,
      startPage: 0,
      flippingTime: 700,
      drawShadow: true,
      showPageCorners: true
    });

    const pages = document.querySelectorAll('.flip-book .page');
    pageFlip.loadFromHTML(pages);

    // Flip event handler
    pageFlip.on('flip', function(e) {
      playFlipSound();
      updateNavigation(e.data);
    });

    pageFlip.on('changeOrientation', function(e) {
      updateNavigation(pageFlip.getCurrentPageIndex());
    });

    // Dismiss loader once initialized
    setTimeout(function() {
      if (loaderElement) {
        loaderElement.classList.add('hidden');
      }
      updateNavigation(0);
    }, 400);
  }

  // ============================================================
  // 4. NAVIGATION & THUMBNAIL UPDATES
  // ============================================================
  function updateNavigation(pageIndex) {
    const displayPage = pageIndex + 1;
    if (currentPageEl) {
      currentPageEl.textContent = displayPage;
    }

    // Disable / enable navigation buttons
    const isFirst = pageIndex === 0;
    const isLast = pageIndex >= TOTAL_PAGES - 1;

    if (prevBtn) prevBtn.disabled = isFirst;
    if (sidePrevBtn) {
      sidePrevBtn.disabled = isFirst;
      sidePrevBtn.style.opacity = isFirst ? '0.2' : '1';
    }
    if (firstPageBtn) firstPageBtn.disabled = isFirst;

    if (nextBtn) nextBtn.disabled = isLast;
    if (sideNextBtn) {
      sideNextBtn.disabled = isLast;
      sideNextBtn.style.opacity = isLast ? '0.2' : '1';
    }
    if (lastPageBtn) lastPageBtn.disabled = isLast;

    // Highlight thumbnail
    const thumbItems = document.querySelectorAll('.thumbnail-item');
    thumbItems.forEach(function(item, idx) {
      if (idx === pageIndex) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  // ============================================================
  // 5. BUILD THUMBNAIL STRIP
  // ============================================================
  function buildThumbnails() {
    if (!thumbsTrack) return;
    thumbsTrack.innerHTML = '';

    for (let i = 1; i <= TOTAL_PAGES; i++) {
      const item = document.createElement('div');
      item.className = 'thumbnail-item' + (i === 1 ? ' active' : '');
      item.dataset.page = (i - 1).toString();

      const img = document.createElement('img');
      img.src = `assets/brochure/pages/thumb-${i}.webp`;
      img.alt = `Page ${i}`;
      img.loading = 'lazy';

      const label = document.createElement('span');
      label.textContent = `P. ${i}`;

      item.appendChild(img);
      item.appendChild(label);

      item.addEventListener('click', function() {
        const target = parseInt(this.dataset.page, 10);
        if (pageFlip) {
          pageFlip.flip(target);
        }
      });

      thumbsTrack.appendChild(item);
    }
  }

  // ============================================================
  // 6. EVENT BINDINGS
  // ============================================================
  function setupEventListeners() {
    // Prev / Next
    if (prevBtn) prevBtn.addEventListener('click', () => pageFlip && pageFlip.flipPrev());
    if (nextBtn) nextBtn.addEventListener('click', () => pageFlip && pageFlip.flipNext());
    if (sidePrevBtn) sidePrevBtn.addEventListener('click', () => pageFlip && pageFlip.flipPrev());
    if (sideNextBtn) sideNextBtn.addEventListener('click', () => pageFlip && pageFlip.flipNext());

    // First / Last
    if (firstPageBtn) firstPageBtn.addEventListener('click', () => pageFlip && pageFlip.flip(0));
    if (lastPageBtn) lastPageBtn.addEventListener('click', () => pageFlip && pageFlip.flip(TOTAL_PAGES - 1));

    // Thumbnails toggle
    if (thumbsToggleBtn && thumbsDrawer) {
      thumbsToggleBtn.addEventListener('click', function() {
        const isOpen = thumbsDrawer.classList.toggle('open');
        thumbsToggleBtn.classList.toggle('active', isOpen);
      });
    }

    // Close drawer when clicking outside
    document.addEventListener('click', function(e) {
      if (thumbsDrawer && thumbsDrawer.classList.contains('open')) {
        if (!thumbsDrawer.contains(e.target) && e.target !== thumbsToggleBtn && !thumbsToggleBtn.contains(e.target)) {
          thumbsDrawer.classList.remove('open');
          if (thumbsToggleBtn) thumbsToggleBtn.classList.remove('active');
        }
      }
    });

    // Sound toggle
    if (soundToggleBtn) {
      const savedSound = localStorage.getItem('tbs_sound');
      if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
      }
      soundToggleBtn.classList.toggle('active', soundEnabled);
      soundToggleBtn.title = soundEnabled ? 'Mute Page Flip Sound' : 'Enable Page Flip Sound';

      soundToggleBtn.addEventListener('click', function() {
        soundEnabled = !soundEnabled;
        localStorage.setItem('tbs_sound', soundEnabled.toString());
        soundToggleBtn.classList.toggle('active', soundEnabled);
        soundToggleBtn.title = soundEnabled ? 'Mute Page Flip Sound' : 'Enable Page Flip Sound';
        if (soundEnabled) playFlipSound();
      });
    }

    // Fullscreen toggle
    if (fullscreenToggleBtn) {
      fullscreenToggleBtn.addEventListener('click', function() {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          fullscreenToggleBtn.classList.add('active');
        } else {
          document.exitFullscreen().catch(() => {});
          fullscreenToggleBtn.classList.remove('active');
        }
      });

      document.addEventListener('fullscreenchange', function() {
        const isFS = !!document.fullscreenElement;
        fullscreenToggleBtn.classList.toggle('active', isFS);
      });
    }

    // Zoom toggle
    if (zoomToggleBtn && bookElement) {
      zoomToggleBtn.addEventListener('click', function() {
        isZoomed = !isZoomed;
        zoomToggleBtn.classList.toggle('active', isZoomed);
        if (isZoomed) {
          bookElement.style.transform = 'scale(1.25)';
          zoomToggleBtn.title = 'Reset Zoom';
        } else {
          bookElement.style.transform = 'scale(1)';
          zoomToggleBtn.title = 'Zoom In';
        }
      });
    }

    // Theme toggle
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        document.documentElement.classList.toggle('dark-theme', nextTheme === 'dark');
        document.documentElement.classList.toggle('light-theme', nextTheme === 'light');
        localStorage.setItem('tbs_theme', nextTheme);
        localStorage.setItem('tb_theme', nextTheme);
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', function(e) {
      if (!pageFlip) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        pageFlip.flipNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        pageFlip.flipPrev();
      } else if (e.key === 'Home') {
        pageFlip.flip(0);
      } else if (e.key === 'End') {
        pageFlip.flip(TOTAL_PAGES - 1);
      } else if (e.key === 'Escape') {
        if (thumbsDrawer) thumbsDrawer.classList.remove('open');
        if (thumbsToggleBtn) thumbsToggleBtn.classList.remove('active');
      }
    });

    // Window resize handler (debounced)
    let resizeTimer = null;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (pageFlip) {
          const dims = computeBookDimensions();
          pageFlip.update();
        }
      }, 250);
    });
  }

  // ============================================================
  // 7. INITIALIZE EVERYTHING
  // ============================================================
  document.addEventListener('DOMContentLoaded', function() {
    buildThumbnails();
    setupEventListeners();
    initFlipbook();

    // Re-trigger Lucide icons if present
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  });

})();
