/**
 * MaskedHeading Component Vanilla Controller (Adapted from React Bits)
 * Renders an image or video masked inside large responsive typography
 * with pointer parallax, idle drift animation, and GSAP entrance reveal.
 */

(function(global) {
  'use strict';

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  class MaskedHeadingInstance {
    constructor(element, options = {}) {
      this.root = element;
      this.text = options.text || element.getAttribute('data-text') || 'TECHBOY SOLUTIONS';
      this.src = options.src || element.getAttribute('data-src') || '/hero.jpg';
      this.mediaType = options.mediaType || element.getAttribute('data-media-type') || 'image';
      this.poster = options.poster || element.getAttribute('data-poster') || '';
      this.fillScale = options.fillScale !== undefined ? options.fillScale : parseFloat(element.getAttribute('data-fill-scale') || '1.25');
      this.parallax = options.parallax !== undefined ? options.parallax : parseFloat(element.getAttribute('data-parallax') || '26');
      this.drift = options.drift !== undefined ? options.drift : parseFloat(element.getAttribute('data-drift') || '18');
      this.brightness = options.brightness !== undefined ? options.brightness : parseFloat(element.getAttribute('data-brightness') || '1');
      this.saturation = options.saturation !== undefined ? options.saturation : parseFloat(element.getAttribute('data-saturation') || '1');
      this.grayscale = options.grayscale !== undefined ? options.grayscale : (element.getAttribute('data-grayscale') === 'true');
      this.reveal = options.reveal || element.getAttribute('data-reveal') || 'rise';
      this.duration = options.duration !== undefined ? options.duration : parseFloat(element.getAttribute('data-duration') || '1.1');
      this.stagger = options.stagger !== undefined ? options.stagger : parseFloat(element.getAttribute('data-stagger') || '0.09');
      this.trigger = options.trigger || element.getAttribute('data-trigger') || 'view';
      this.align = options.align || element.getAttribute('data-align') || 'center';
      this.weight = options.weight || element.getAttribute('data-weight') || 800;
      this.tracking = options.tracking !== undefined ? options.tracking : parseFloat(element.getAttribute('data-tracking') || '-0.03');
      this.lineHeight = options.lineHeight !== undefined ? options.lineHeight : parseFloat(element.getAttribute('data-line-height') || '1.06');
      this.textScale = options.textScale !== undefined ? options.textScale : parseFloat(element.getAttribute('data-text-scale') || '0.115');

      this.offset = { x: 0, y: 0, tx: 0, ty: 0 };
      this.words = String(this.text).split(/\s+/).filter(Boolean);
      this.clipId = 'mh-' + Math.random().toString(36).substring(2, 9);

      this.wordRefs = [];
      this.baseRefs = [];
      this.glyphRefs = [];
      this.rafId = 0;
      this.tween = null;

      this.initDOM();
      this.bindEvents();
      this.initReveal();
    }

    initDOM() {
      this.root.classList.add('masked-heading');
      this.root.style.textAlign = this.align;
      this.root.style.fontWeight = this.weight;
      this.root.style.letterSpacing = this.tracking + 'em';
      this.root.style.lineHeight = this.lineHeight;

      // 1. Measure layer
      const measure = document.createElement('span');
      measure.className = 'masked-heading__measure';

      this.words.forEach((word, i) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'masked-heading__word';
        wordSpan.appendChild(document.createTextNode(word));

        const base = document.createElement('i');
        base.className = 'masked-heading__baseline';
        wordSpan.appendChild(base);

        measure.appendChild(wordSpan);
        this.wordRefs[i] = wordSpan;
        this.baseRefs[i] = base;
      });

      // 2. SVG Defs layer
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'masked-heading__defs');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clipPath.setAttribute('id', this.clipId);
      clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');

      this.words.forEach((word, i) => {
        const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textNode.textContent = word;
        clipPath.appendChild(textNode);
        this.glyphRefs[i] = textNode;
      });

      defs.appendChild(clipPath);
      svg.appendChild(defs);

      // 3. Reveal and Media layer
      const revealLayer = document.createElement('span');
      revealLayer.className = 'masked-heading__reveal';

      const clipSpan = document.createElement('span');
      clipSpan.className = 'masked-heading__clip';
      clipSpan.style.clipPath = `url(#${this.clipId})`;

      const mediaSpan = document.createElement('span');
      mediaSpan.className = 'masked-heading__media';

      let sourceEl;
      if (this.mediaType === 'video') {
        sourceEl = document.createElement('video');
        sourceEl.className = 'masked-heading__source';
        sourceEl.src = this.src;
        if (this.poster) sourceEl.poster = this.poster;
        sourceEl.autoplay = true;
        sourceEl.muted = true;
        sourceEl.loop = true;
        sourceEl.playsInline = true;
      } else {
        sourceEl = document.createElement('img');
        sourceEl.className = 'masked-heading__source';
        sourceEl.src = this.src;
        sourceEl.alt = '';
        sourceEl.draggable = false;
      }

      mediaSpan.appendChild(sourceEl);
      clipSpan.appendChild(mediaSpan);
      revealLayer.appendChild(clipSpan);

      this.measureRef = measure;
      this.revealRef = revealLayer;
      this.mediaRef = mediaSpan;

      this.root.innerHTML = '';
      this.root.appendChild(measure);
      this.root.appendChild(svg);
      this.root.appendChild(revealLayer);
    }

    place() {
      if (!this.root || !this.mediaRef) return;
      const W = this.root.clientWidth;
      const H = this.root.clientHeight;
      const maxX = Math.max(0, ((this.fillScale - 1) / 2) * W);
      const maxY = Math.max(0, ((this.fillScale - 1) / 2) * H);

      const px = clamp(this.offset.x, -maxX, maxX).toFixed(2);
      const py = clamp(this.offset.y, -maxY, maxY).toFixed(2);

      this.mediaRef.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${this.fillScale})`;
      this.mediaRef.style.filter = `brightness(${this.brightness}) saturate(${this.saturation})${this.grayscale ? ' grayscale(1)' : ''}`;
    }

    sync() {
      if (!this.root || !this.measureRef) return;
      const fontSize = clamp(this.root.clientWidth * this.textScale, 20, 200).toFixed(1);
      this.root.style.fontSize = fontSize + 'px';

      const cs = window.getComputedStyle(this.measureRef);
      for (let i = 0; i < this.wordRefs.length; i++) {
        const box = this.wordRefs[i];
        const base = this.baseRefs[i];
        const glyph = this.glyphRefs[i];
        if (!box || !base || !glyph) continue;

        glyph.setAttribute('x', `${box.offsetLeft}`);
        glyph.setAttribute('y', `${base.offsetTop}`);
        glyph.style.fontFamily = cs.fontFamily;
        glyph.style.fontSize = cs.fontSize;
        glyph.style.fontWeight = cs.fontWeight;
        glyph.style.fontStyle = cs.fontStyle;
        glyph.style.letterSpacing = cs.letterSpacing;
      }
      this.place();
    }

    bindEvents() {
      this.sync();

      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(() => this.sync());
        this.resizeObserver.observe(this.root);
      }

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this.sync()).catch(() => {});
      }

      // RAF drift loop
      let last = performance.now();
      let clock = 0;

      const frame = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        clock += dt;

        const dx = Math.sin(clock * 0.21) * this.drift;
        const dy = Math.cos(clock * 0.17) * this.drift * 0.6;

        const ease = 1 - Math.exp(-dt / 0.18);
        this.offset.x += (this.offset.tx + dx - this.offset.x) * ease;
        this.offset.y += (this.offset.ty + dy - this.offset.y) * ease;

        this.place();
        this.rafId = requestAnimationFrame(frame);
      };

      const onMove = (e) => {
        if (this.parallax <= 0) return;
        const r = this.root.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / (r.width || 1)) * 2 - 1;
        const ny = ((e.clientY - r.top) / (r.height || 1)) * 2 - 1;
        this.offset.tx = clamp(nx, -1, 1) * -this.parallax;
        this.offset.ty = clamp(ny, -1, 1) * -this.parallax;
      };

      const onLeave = () => {
        this.offset.tx = 0;
        this.offset.ty = 0;
      };

      this.root.addEventListener('pointermove', onMove);
      this.root.addEventListener('pointerleave', onLeave);
      this.rafId = requestAnimationFrame(frame);
    }

    initReveal() {
      const glyphs = this.glyphRefs.filter(Boolean);
      const layer = this.revealRef;
      if (!this.root || !layer || !glyphs.length) return;

      const riseDistance = () => (parseFloat(window.getComputedStyle(this.root).fontSize) || 48) * 1.15;

      const settle = () => {
        if (window.gsap) {
          window.gsap.set(glyphs, { y: 0 });
          window.gsap.set(layer, { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' });
        } else {
          glyphs.forEach(g => g.setAttribute('transform', 'translate(0, 0)'));
          layer.style.opacity = '1';
          layer.style.clipPath = 'inset(0% 0% 0% 0%)';
        }
      };

      const rest = () => {
        if (!window.gsap) return;
        if (this.reveal === 'rise') {
          window.gsap.set(glyphs, { y: riseDistance() });
        } else if (this.reveal === 'wipe') {
          window.gsap.set(layer, { clipPath: 'inset(0% 100% 0% 0%)' });
        } else if (this.reveal === 'fade') {
          window.gsap.set(layer, { opacity: 0, scale: 1.08 });
        }
      };

      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (this.reveal === 'none' || reduce) {
        settle();
        return;
      }

      const play = () => {
        if (this.tween) this.tween.kill();
        if (!window.gsap) {
          settle();
          return;
        }

        if (this.reveal === 'rise') {
          window.gsap.set(layer, { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' });
          this.tween = window.gsap.fromTo(
            glyphs,
            { y: riseDistance() },
            { y: 0, duration: this.duration, stagger: this.stagger, ease: 'power4.out', overwrite: 'auto' }
          );
        } else if (this.reveal === 'wipe') {
          window.gsap.set(glyphs, { y: 0 });
          const state = { p: 100 };
          this.tween = window.gsap.to(state, {
            p: 0,
            duration: this.duration,
            ease: 'power3.inOut',
            overwrite: 'auto',
            onUpdate: () => {
              layer.style.clipPath = `inset(0% ${state.p}% 0% 0%)`;
            }
          });
        } else {
          window.gsap.set(glyphs, { y: 0 });
          this.tween = window.gsap.fromTo(
            layer,
            { opacity: 0, scale: 1.08 },
            { opacity: 1, scale: 1, duration: this.duration, ease: 'power3.out', overwrite: 'auto' }
          );
        }
      };

      if (this.trigger === 'hover') {
        settle();
        this.root.addEventListener('pointerenter', play);
      } else if (this.trigger === 'view' && 'IntersectionObserver' in window) {
        settle();
        rest();
        const io = new IntersectionObserver((entries) => {
          if (entries.some(e => e.isIntersecting)) {
            play();
            io.disconnect();
          }
        }, { threshold: 0.25 });
        io.observe(this.root);
      } else {
        settle();
        play();
      }
    }
  }

  function initAllMaskedHeadings() {
    const headings = document.querySelectorAll('[data-masked-heading], .masked-heading-auto');
    headings.forEach(el => {
      if (!el.__maskedHeadingInstance) {
        el.__maskedHeadingInstance = new MaskedHeadingInstance(el);
      }
    });
  }

  global.MaskedHeading = MaskedHeadingInstance;
  global.initAllMaskedHeadings = initAllMaskedHeadings;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllMaskedHeadings);
  } else {
    initAllMaskedHeadings();
  }

})(typeof window !== 'undefined' ? window : this);
