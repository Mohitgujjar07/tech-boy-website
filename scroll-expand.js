/**
 * ScrollExpand Component Vanilla Controller (Adapted from React Bits)
 * Delivers physics-driven scroll-expanding media canvas with smoothstep clipPath,
 * zoom easing, title lift-away, scroll hint fade, and content overlay reveal.
 */

(function(global) {
  'use strict';

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
    return t * t * (3 - 2 * t);
  }

  class ScrollExpandInstance {
    constructor(element, options = {}) {
      this.root = element;
      this.options = Object.assign({
        src: element.getAttribute('data-src') || '',
        mediaType: element.getAttribute('data-media-type') || 'image',
        poster: element.getAttribute('data-poster') || '',
        alt: element.getAttribute('data-alt') || 'Expanded Media',
        title: element.getAttribute('data-title') || '',
        scrollHint: element.getAttribute('data-scroll-hint') || '',
        startWidth: parseFloat(element.getAttribute('data-start-width') || '42'),
        startHeight: parseFloat(element.getAttribute('data-start-height') || '58'),
        startRadius: parseFloat(element.getAttribute('data-start-radius') || '24'),
        endRadius: parseFloat(element.getAttribute('data-end-radius') || '0'),
        mediaZoom: parseFloat(element.getAttribute('data-media-zoom') || '1.35'),
        scrollDistance: parseFloat(element.getAttribute('data-scroll-distance') || '1.2'),
        holdDistance: parseFloat(element.getAttribute('data-hold-distance') || '0.35'),
        smoothing: parseFloat(element.getAttribute('data-smoothing') || '0.1'),
        overlayScrim: parseFloat(element.getAttribute('data-overlay-scrim') || '0.45'),
        useWindowScroll: element.getAttribute('data-use-window-scroll') === 'true' || options.useWindowScroll || false,
        enabled: element.getAttribute('data-enabled') !== 'false'
      }, options);

      this.raf = 0;
      this.current = 0;
      this.target = 0;
      this.stageH = 0;
      this.running = false;

      this.initDOM();
      this.initAnimation();
    }

    initDOM() {
      const c = this.options;
      this.root.classList.add('scroll-expand');
      if (!c.useWindowScroll) {
        this.root.classList.add('scroll-expand--scroller');
      }

      // Preserve existing children to place inside overlay
      const existingChildren = Array.from(this.root.children);

      // Create Track
      this.track = document.createElement('div');
      this.track.className = 'scroll-expand__track';

      // Create Stage
      this.stage = document.createElement('div');
      this.stage.className = 'scroll-expand__stage';

      // Create Frame
      this.frame = document.createElement('div');
      this.frame.className = 'scroll-expand__frame';

      // Create Media
      if (c.mediaType === 'video') {
        this.media = document.createElement('video');
        this.media.className = 'scroll-expand__media';
        this.media.src = c.src;
        if (c.poster) this.media.poster = c.poster;
        this.media.autoplay = true;
        this.media.muted = true;
        this.media.loop = true;
        this.media.playsInline = true;
      } else {
        this.media = document.createElement('img');
        this.media.className = 'scroll-expand__media';
        this.media.src = c.src;
        this.media.alt = c.alt;
        this.media.draggable = false;
      }
      this.frame.appendChild(this.media);

      // Create Scrim
      this.scrim = document.createElement('div');
      this.scrim.className = 'scroll-expand__scrim';
      this.frame.appendChild(this.scrim);

      // Create Overlay for Children
      if (existingChildren.length > 0) {
        this.overlay = document.createElement('div');
        this.overlay.className = 'scroll-expand__overlay';
        existingChildren.forEach(child => this.overlay.appendChild(child));
        this.frame.appendChild(this.overlay);
      }

      this.stage.appendChild(this.frame);

      // Create Title
      if (c.title) {
        this.titleEl = document.createElement('div');
        this.titleEl.className = 'scroll-expand__title';
        this.titleEl.textContent = c.title;
        this.stage.appendChild(this.titleEl);
      }

      // Create Scroll Hint
      if (c.scrollHint) {
        this.hintEl = document.createElement('div');
        this.hintEl.className = 'scroll-expand__hint';
        this.hintEl.textContent = c.scrollHint;
        this.stage.appendChild(this.hintEl);
      }

      this.track.appendChild(this.stage);
      this.root.appendChild(this.track);
    }

    applyProgress(p) {
      const c = this.options;
      const e = smoothstep(0, 1, p);

      const w = c.startWidth + (100 - c.startWidth) * e;
      const h = c.startHeight + (100 - c.startHeight) * e;
      const ix = Math.max(0, (100 - w) / 2);
      const iy = Math.max(0, (100 - h) / 2);
      const r = c.startRadius + (c.endRadius - c.startRadius) * e;

      this.frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;
      this.media.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`;

      if (this.scrim) {
        this.scrim.style.opacity = `${c.overlayScrim * e}`;
      }

      if (this.titleEl) {
        const out = smoothstep(0.4, 0.88, p);
        this.titleEl.style.opacity = `${1 - out}`;
        this.titleEl.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
        this.titleEl.style.visibility = (1 - out) < 0.02 ? 'hidden' : 'visible';
      }

      if (this.hintEl) {
        const gone = smoothstep(0, 0.12, p);
        this.hintEl.style.opacity = `${1 - gone}`;
        this.hintEl.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
      }

      if (this.overlay) {
        const inn = smoothstep(0.68, 1, p);
        this.overlay.style.opacity = `${inn}`;
        this.overlay.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
      }
    }

    measure() {
      const c = this.options;
      this.stageH = c.useWindowScroll ? window.innerHeight : this.root.clientHeight;
      if (this.stageH <= 0) return;

      this.stage.style.height = `${this.stageH}px`;
      const mult = 1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance);
      this.track.style.height = `${this.stageH * mult}px`;

      const w = this.root.clientWidth || this.stageH;
      this.stage.style.setProperty('--se-title-size', `${clamp(w * 0.075, 24, 84)}px`);
    }

    readProgress() {
      const c = this.options;
      if (!c.enabled) return 1;

      const span = this.stageH * Math.max(0.01, c.scrollDistance);
      if (c.useWindowScroll) {
        const top = this.track.getBoundingClientRect().top;
        return clamp(-top / span, 0, 1);
      }
      return clamp(this.root.scrollTop / span, 0, 1);
    }

    tick() {
      const c = this.options;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      this.current += (this.target - this.current) * k;

      if (Math.abs(this.target - this.current) < 0.0004) {
        this.current = this.target;
        this.running = false;
      }

      this.applyProgress(this.current);
      this.raf = this.running ? requestAnimationFrame(() => this.tick()) : 0;
    }

    kick() {
      if (this.running) return;
      this.running = true;
      if (!this.raf) this.raf = requestAnimationFrame(() => this.tick());
    }

    initAnimation() {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const onScroll = () => {
        this.target = this.readProgress();
        if (this.options.smoothing <= 0 || reduceMotion) {
          this.current = this.target;
          this.applyProgress(this.current);
          return;
        }
        this.kick();
      };

      const onResize = () => {
        this.measure();
        this.target = this.readProgress();
        this.current = this.target;
        this.applyProgress(this.current);
      };

      this.measure();
      this.target = this.readProgress();
      this.current = this.target;
      this.applyProgress(this.current);

      const scroller = this.options.useWindowScroll ? window : this.root;
      scroller.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);

      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(onResize);
        this.resizeObserver.observe(this.root);
      }
    }
  }

  // Auto-initialize elements with data-scroll-expand="true"
  function initAutoScrollExpand() {
    const targets = document.querySelectorAll('[data-scroll-expand="true"]');
    targets.forEach(el => {
      if (!el.__scrollExpandInstance) {
        el.__scrollExpandInstance = new ScrollExpandInstance(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoScrollExpand);
  } else {
    initAutoScrollExpand();
  }

  // Export to global scope for module / manual usage
  global.ScrollExpand = ScrollExpandInstance;
  global.initAutoScrollExpand = initAutoScrollExpand;

})(typeof window !== 'undefined' ? window : this);
