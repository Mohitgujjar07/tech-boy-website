/**
 * Cosmic ASCII Ambient Engine
 * High-performance, lightweight digital constellation background.
 * Renders floating ASCII stardust and interactive mouse constellation lines.
 */
(function () {
  'use strict';

  class CosmicAsciiEngine {
    constructor(canvasId, options = {}) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d', { alpha: true });
      if (!this.ctx) return;

      this.options = Object.assign({
        glyphSet: '01X+*.:#',
        particleCount: 85,
        interactiveRadius: 180,
        connectionDistance: 110,
        speed: 0.35
      }, options);

      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.animFrame = null;
      this.lastTime = performance.now();
      this.time = 0;
      this.isVisible = true;

      this.mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
      this.particles = [];

      this._init();
    }

    _init() {
      this._resize();
      this._buildParticles();
      this._bind();
      this._loop(performance.now());
    }

    _resize() {
      const p = this.canvas.parentElement || document.body;
      const r = p.getBoundingClientRect();
      this.width = r.width || window.innerWidth;
      this.height = r.height || window.innerHeight;
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
    }

    _buildParticles() {
      const { particleCount, glyphSet, speed } = this.options;
      this.particles = [];
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const s = (0.2 + Math.random() * 0.6) * speed;
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: Math.cos(angle) * s,
          vy: Math.sin(angle) * s,
          size: 9 + Math.random() * 5,
          alpha: 0.15 + Math.random() * 0.45,
          char: glyphSet[Math.floor(Math.random() * glyphSet.length)],
          color: Math.random() > 0.4 ? '#00D2FF' : '#00F5A0'
        });
      }
    }

    _bind() {
      this._onResize = () => { this._resize(); this._buildParticles(); };
      window.addEventListener('resize', this._onResize);

      const target = window;
      this._onMouseMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.tx = e.clientX - rect.left;
        this.mouse.ty = e.clientY - rect.top;
        this.mouse.active = true;
      };
      this._onMouseLeave = () => {
        this.mouse.active = false;
        this.mouse.tx = -9999;
        this.mouse.ty = -9999;
      };
      target.addEventListener('mousemove', this._onMouseMove, { passive: true });
      document.addEventListener('mouseleave', this._onMouseLeave);

      if ('IntersectionObserver' in window) {
        this._observer = new IntersectionObserver((entries) => {
          this.isVisible = entries[0].isIntersecting;
          if (this.isVisible && !this.animFrame) {
            this.lastTime = performance.now();
            this._loop(performance.now());
          }
        }, { threshold: 0.01 });
        this._observer.observe(this.canvas);
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.isVisible = false;
        } else {
          this.isVisible = true;
          if (!this.animFrame) {
            this.lastTime = performance.now();
            this._loop(performance.now());
          }
        }
      });
    }

    _loop(now) {
      if (!this.isVisible) { this.animFrame = null; return; }
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.time += dt;

      this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.1;
      this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.1;

      this._render();
      this.animFrame = requestAnimationFrame((t) => this._loop(t));
    }

    _render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const { interactiveRadius, connectionDistance } = this.options;

      ctx.clearRect(0, 0, w, h);

      // Particle movements & wrapping
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
      }

      // Constellation lines between nearby particles
      ctx.lineWidth = 0.6;
      const pCount = this.particles.length;
      for (let i = 0; i < pCount; i++) {
        const p1 = this.particles[i];
        for (let j = i + 1; j < pCount; j++) {
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const lineAlpha = (1 - dist / connectionDistance) * 0.18;
            ctx.strokeStyle = `rgba(0, 210, 255, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Mouse interactive connections
      if (this.mouse.active) {
        for (const p of this.particles) {
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < interactiveRadius) {
            const lineAlpha = (1 - dist / interactiveRadius) * 0.35;
            ctx.strokeStyle = `rgba(0, 245, 160, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(this.mouse.x, this.mouse.y);
            ctx.stroke();
          }
        }
      }

      // Render ASCII glyphs
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const p of this.particles) {
        let alpha = p.alpha;

        if (this.mouse.active) {
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < interactiveRadius) {
            alpha = Math.min(1, alpha + (1 - dist / interactiveRadius) * 0.6);
          }
        }

        ctx.font = `600 ${Math.round(p.size)}px "JetBrains Mono", monospace`;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillText(p.char, p.x, p.y);
      }

      ctx.globalAlpha = 1;
    }

    destroy() {
      if (this.animFrame) cancelAnimationFrame(this.animFrame);
      window.removeEventListener('resize', this._onResize);
      if (this._observer) this._observer.disconnect();
    }
  }

  window.initCosmicAsciiShader = function (canvasId, opts) {
    return new CosmicAsciiEngine(canvasId || 'cosmicAsciiCanvas', opts);
  };
})();
