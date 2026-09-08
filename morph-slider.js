/**
 * MorphSlider Component Vanilla Controller (Adapted from React Bits)
 * Delivers GPU displacement WebGL morph transitions between slides powered by OGL & GSAP,
 * with procedural noise fields (melt, ripple, shear, swirl), chromatic aberration,
 * pointer drag gestures, autoplay, glassmorphic captions, and graceful fallback.
 */

(function(global) {
  'use strict';

  const TRANSITIONS = { melt: 0, ripple: 1, shear: 2, swirl: 3 };

  const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

  const fragmentShader = `
precision highp float;

uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform vec2 uResolution;
uniform vec2 uCurrentSize;
uniform vec2 uNextSize;
uniform float uProgress;
uniform float uDir;
uniform int uMode;
uniform float uIntensity;
uniform float uScale;
uniform float uAberration;
uniform float uDrift;
uniform float uTime;
uniform float uReduce;
uniform vec2 uPointer;
uniform vec3 uOverlay;

varying vec2 vUv;

const float PI = 3.14159265359;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

vec2 coverUV(vec2 uv, vec2 res, vec2 img) {
  float rA = res.x / max(res.y, 1.0);
  float iA = img.x / max(img.y, 1.0);
  vec2 s = vec2(1.0);
  float ratio = rA / max(iA, 0.0001);
  if (ratio > 1.0) {
    s.y = 1.0 / ratio;
  } else {
    s.x = ratio;
  }
  return (uv - 0.5) * s + 0.5;
}

void main() {
  float p = clamp(uProgress, 0.0, 1.0);
  float env = sin(p * PI);

  vec2 uv = vUv;

  uv += vec2(sin(uTime * 0.25 + uv.y * 4.0), cos(uTime * 0.22 + uv.x * 4.0)) * uDrift * 0.008;
  uv = (uv - 0.5) * (1.0 - uDrift * 0.02 * sin(uTime * 0.4)) + 0.5;

  vec2 uvC = uv;
  vec2 uvN = uv;
  float m = smoothstep(0.0, 1.0, p);

  if (uReduce < 0.5) {
    if (uMode == 3) {
      vec2 c = uv - 0.5;
      float r = length(c);
      float ang = env * uIntensity * 3.5 * (1.0 - r);
      uvC = rot(ang) * c + 0.5;
      uvN = rot(-ang) * c + 0.5;
      m = smoothstep(0.0, 1.0, p);
    } else if (uMode == 1) {
      float d = distance(uv, uPointer);
      float ring = p * 1.6;
      float wave = sin((d - ring) * 30.0) * env;
      vec2 dir = normalize(uv - uPointer + 1e-4);
      vec2 disp = dir * wave * uIntensity * 0.25;
      uvC = uv + disp;
      uvN = uv + disp * 0.6;
      m = 1.0 - smoothstep(ring - 0.03, ring + 0.03, d);
    } else if (uMode == 2) {
      float slices = 14.0;
      float row = floor(uv.y * slices);
      float rnd = hash11(row);
      vec2 disp = vec2((rnd - 0.5) * env * uIntensity * 0.6, 0.0);
      uvC = uv + disp;
      uvN = uv + disp;
      float localX = uDir > 0.0 ? uv.x : 1.0 - uv.x;
      float th = p * 1.5 - 0.25 + (rnd - 0.5) * 0.25;
      m = 1.0 - smoothstep(th - 0.06, th + 0.06, localX);
    } else {
      float nn = fbm(uv * uScale + uTime * 0.03);
      float warp = fbm(uv * uScale * 1.7 - uTime * 0.02);
      vec2 g = vec2(nn, warp) - 0.5;
      uvC = uv + g * uIntensity * 0.5 * p;
      uvN = uv - g * uIntensity * 0.5 * (1.0 - p);
      m = smoothstep(nn - 0.15, nn + 0.15, p);
    }
  }

  vec2 sC = coverUV(uvC, uResolution, uCurrentSize);
  vec2 sN = coverUV(uvN, uResolution, uNextSize);

  float ca = uReduce < 0.5 ? uAberration * env * 0.03 : 0.0;

  vec3 colC = vec3(
    texture2D(tCurrent, sC + vec2(ca, 0.0)).r,
    texture2D(tCurrent, sC).g,
    texture2D(tCurrent, sC - vec2(ca, 0.0)).b
  );
  vec3 colN = vec3(
    texture2D(tNext, sN + vec2(ca, 0.0)).r,
    texture2D(tNext, sN).g,
    texture2D(tNext, sN - vec2(ca, 0.0)).b
  );

  vec3 col = mix(colC, colN, m);

  float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
  col = mix(col, uOverlay, (1.0 - vig) * 0.28);

  gl_FragColor = vec4(col, 1.0);
}
`;

  function hexToRgb(hex) {
    let h = (hex || '#000000').replace('#', '');
    if (h.length === 3) {
      h = h.split('').map(c => c + c).join('');
    }
    const n = parseInt(h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function makeFallbackTexture(gl, TextureClass) {
    const size = 4;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = 24;
      data[i * 4 + 1] = 24;
      data[i * 4 + 2] = 28;
      data[i * 4 + 3] = 255;
    }
    return new TextureClass(gl, { image: data, width: size, height: size, generateMipmaps: false });
  }

  class MorphEngine {
    constructor(container, { items, startIndex, reducedMotion, getOptions, onIndexChange, dprCap = 2 }) {
      this.container = container;
      this.items = items;
      this.getOptions = getOptions;
      this.onIndexChange = onIndexChange;
      this.reducedMotion = reducedMotion;

      this.current = startIndex;
      this.animating = false;
      this.dragging = false;
      this.dragDir = 0;
      this.shownIndex = startIndex;
      this.tween = null;

      const ogl = window.ogl || global.ogl || {};
      const { Renderer, Triangle, Program, Mesh, Texture } = ogl;

      if (!Renderer || !Triangle || !Program || !Mesh || !Texture) {
        throw new Error('OGL library not found in window/global scope');
      }

      this.TextureClass = Texture;
      this.renderer = new Renderer({
        alpha: false,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, dprCap)
      });
      this.gl = this.renderer.gl;
      this.gl.clearColor(0.05, 0.05, 0.06, 1);

      this.canvas = this.gl.canvas;
      this.canvas.className = 'morph-slider-canvas';
      container.appendChild(this.canvas);

      this.geometry = new Triangle(this.gl);

      this.textures = this.items.map(() => makeFallbackTexture(this.gl, this.TextureClass));
      this.sizes = this.items.map(() => [1, 1]);

      const opts = this.getOptions();
      this.program = new Program(this.gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          tCurrent: { value: this.textures[this.current] },
          tNext: { value: this.textures[this.current] },
          uResolution: { value: [1, 1] },
          uCurrentSize: { value: this.sizes[this.current] },
          uNextSize: { value: this.sizes[this.current] },
          uProgress: { value: 0 },
          uDir: { value: 1 },
          uMode: { value: TRANSITIONS[opts.transition] ?? 0 },
          uIntensity: { value: opts.intensity },
          uScale: { value: opts.scale },
          uAberration: { value: opts.aberration },
          uDrift: { value: opts.drift },
          uTime: { value: 0 },
          uReduce: { value: reducedMotion ? 1 : 0 },
          uPointer: { value: [0.5, 0.5] },
          uOverlay: { value: hexToRgb(opts.overlayColor) }
        }
      });

      this.mesh = new Mesh(this.gl, { geometry: this.geometry, program: this.program });

      this.boundContextLost = this.onContextLost.bind(this);
      this.canvas.addEventListener('webglcontextlost', this.boundContextLost, false);

      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(container);
      }
      this.resize();

      this.loadTextures();

      this.boundLoop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.boundLoop);
    }

    loadTextures() {
      this.items.forEach((item, index) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = item.image;
        img.onload = () => {
          const texture = new this.TextureClass(this.gl, { generateMipmaps: false });
          texture.image = img;
          this.textures[index] = texture;
          this.sizes[index] = [img.naturalWidth || 1, img.naturalHeight || 1];
          if (index === this.current) {
            this.program.uniforms.tCurrent.value = texture;
            this.program.uniforms.uCurrentSize.value = this.sizes[index];
          }
        };
        img.onerror = () => {};
      });
    }

    resize() {
      const rect = this.container.getBoundingClientRect();
      const w = Math.max(rect.width, 1);
      const h = Math.max(rect.height, 1);
      this.renderer.setSize(w, h);
      this.program.uniforms.uResolution.value = [this.gl.canvas.width, this.gl.canvas.height];
    }

    syncOptions() {
      const opts = this.getOptions();
      this.program.uniforms.uMode.value = TRANSITIONS[opts.transition] ?? 0;
      this.program.uniforms.uIntensity.value = opts.intensity;
      this.program.uniforms.uScale.value = opts.scale;
      this.program.uniforms.uAberration.value = opts.aberration;
      this.program.uniforms.uDrift.value = opts.drift;
      this.program.uniforms.uOverlay.value = hexToRgb(opts.overlayColor);
    }

    loop(t) {
      this.program.uniforms.uTime.value = t * 0.001;
      if (!this.dragging && !this.animating) this.syncOptions();
      this.renderer.render({ scene: this.mesh });
      this.raf = requestAnimationFrame(this.boundLoop);
    }

    wrap(i) {
      const n = this.items.length;
      return ((i % n) + n) % n;
    }

    prepareNext(dir) {
      const target = this.wrap(this.current + dir);
      this.program.uniforms.tCurrent.value = this.textures[this.current];
      this.program.uniforms.uCurrentSize.value = this.sizes[this.current];
      this.program.uniforms.tNext.value = this.textures[target];
      this.program.uniforms.uNextSize.value = this.sizes[target];
      this.program.uniforms.uDir.value = dir;
      return target;
    }

    goTo(dir) {
      if (this.animating || this.dragging || this.items.length < 2) return;
      const opts = this.getOptions();
      if (!opts.loop) {
        const raw = this.current + dir;
        if (raw < 0 || raw > this.items.length - 1) return;
      }
      this.syncOptions();
      const target = this.prepareNext(dir);
      this.animating = true;
      this.announce(target);
      const duration = this.reducedMotion ? Math.min(opts.duration, 0.4) : opts.duration;

      const gsapInstance = window.gsap || global.gsap;
      if (gsapInstance) {
        this.tween = gsapInstance.fromTo(
          this.program.uniforms.uProgress,
          { value: 0 },
          {
            value: 1,
            duration,
            ease: opts.ease || 'power2.inOut',
            onComplete: () => this.commit(target)
          }
        );
      } else {
        // Fallback without GSAP
        this.program.uniforms.uProgress.value = 1;
        this.commit(target);
      }
    }

    announce(index) {
      if (index === this.shownIndex) return;
      this.shownIndex = index;
      if (this.onIndexChange) this.onIndexChange(index);
    }

    commit(target) {
      this.current = target;
      this.program.uniforms.tCurrent.value = this.textures[target];
      this.program.uniforms.uCurrentSize.value = this.sizes[target];
      this.program.uniforms.uProgress.value = 0;
      this.animating = false;
      this.tween = null;
      this.announce(target);
    }

    next() {
      this.goTo(1);
    }

    prev() {
      this.goTo(-1);
    }

    setPointer(x, y) {
      this.program.uniforms.uPointer.value = [x, y];
    }

    beginDrag() {
      if (this.animating || this.items.length < 2) return false;
      this.dragging = true;
      this.dragDir = 0;
      this.syncOptions();
      return true;
    }

    drag(ndx) {
      if (!this.dragging) return;
      const opts = this.getOptions();
      const dir = ndx < 0 ? 1 : -1;
      if (!opts.loop) {
        const raw = this.current + dir;
        if (raw < 0 || raw > this.items.length - 1) {
          this.program.uniforms.uProgress.value = 0;
          return;
        }
      }
      if (dir !== this.dragDir) {
        this.dragDir = dir;
        this.prepareNext(dir);
      }
      const progress = Math.min(Math.abs(ndx), 1);
      this.program.uniforms.uProgress.value = progress;
      this.announce(progress > 0.5 ? this.wrap(this.current + dir) : this.current);
    }

    endDrag() {
      if (!this.dragging) return;
      this.dragging = false;
      const p = this.program.uniforms.uProgress.value;
      if (this.dragDir === 0) return;
      const target = this.wrap(this.current + this.dragDir);
      const duration = this.reducedMotion ? 0.3 : 0.5;
      this.animating = true;

      const gsapInstance = window.gsap || global.gsap;
      if (p > 0.4) {
        this.announce(target);
        if (gsapInstance) {
          this.tween = gsapInstance.to(this.program.uniforms.uProgress, {
            value: 1,
            duration,
            ease: 'power2.out',
            onComplete: () => this.commit(target)
          });
        } else {
          this.commit(target);
        }
      } else {
        this.announce(this.current);
        if (gsapInstance) {
          this.tween = gsapInstance.to(this.program.uniforms.uProgress, {
            value: 0,
            duration,
            ease: 'power2.out',
            onComplete: () => {
              this.animating = false;
              this.tween = null;
            }
          });
        } else {
          this.animating = false;
        }
      }
    }

    onContextLost(e) {
      e.preventDefault();
      cancelAnimationFrame(this.raf);
    }

    destroy() {
      cancelAnimationFrame(this.raf);
      if (this.tween) this.tween.kill();
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.canvas) {
        this.canvas.removeEventListener('webglcontextlost', this.boundContextLost);
        if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
      }
      this.textures.forEach(tex => {
        if (tex && tex.texture && this.gl) this.gl.deleteTexture(tex.texture);
      });
      if (this.program && this.program.program && this.gl) this.gl.deleteProgram(this.program.program);
      const ext = this.gl ? this.gl.getExtension('WEBGL_lose_context') : null;
      if (ext) ext.loseContext();
    }
  }

  // Vanilla Controller wrapping the stage, captions, indicators, and controls
  class MorphSliderVanilla {
    constructor(element, options = {}) {
      this.root = element;
      this.options = Object.assign({
        items: [],
        startIndex: parseInt(element.getAttribute('data-start-index') || '0', 10),
        transition: element.getAttribute('data-transition') || 'melt',
        duration: parseFloat(element.getAttribute('data-duration') || '1.1'),
        ease: element.getAttribute('data-ease') || 'power2.inOut',
        intensity: parseFloat(element.getAttribute('data-intensity') || '0.55'),
        scale: parseFloat(element.getAttribute('data-scale') || '2.4'),
        aberration: parseFloat(element.getAttribute('data-aberration') || '0.35'),
        drift: parseFloat(element.getAttribute('data-drift') || '0.4'),
        autoplay: element.getAttribute('data-autoplay') === 'true' || options.autoplay || false,
        autoplayDelay: parseFloat(element.getAttribute('data-autoplay-delay') || '4'),
        loop: element.getAttribute('data-loop') !== 'false',
        radius: parseFloat(element.getAttribute('data-radius') || '16'),
        overlayColor: element.getAttribute('data-overlay-color') || '#000000',
        showCaptions: element.getAttribute('data-show-captions') !== 'false',
        showControls: element.getAttribute('data-show-controls') !== 'false',
        showIndicators: element.getAttribute('data-show-indicators') !== 'false'
      }, options);

      // Parse items from data-items attribute or children
      if (!this.options.items.length) {
        const dataItems = element.getAttribute('data-items');
        if (dataItems) {
          try {
            this.options.items = JSON.parse(dataItems);
          } catch (e) {}
        }
      }

      if (!this.options.items.length) {
        const slideNodes = element.querySelectorAll('.morph-slide-data');
        if (slideNodes.length) {
          this.options.items = Array.from(slideNodes).map(node => ({
            image: node.getAttribute('data-image') || '',
            caption: node.getAttribute('data-caption') || node.textContent.trim()
          }));
        }
      }

      if (!this.options.items.length) {
        this.options.items = [
          { image: '/hero.jpg', caption: 'Precision Workstations & Hardware Lab' },
          { image: 'assets/art/ascii-blue-beam.jpg', caption: 'ESP32 Real-Time Cloud Sensor Array' },
          { image: 'assets/art/ascii-emerald-cosmic.jpg', caption: 'Custom Liquid-Cooled AI & Gaming Rig' },
          { image: 'assets/art/ascii-pyramids.jpg', caption: 'Full-Stack SaaS Billing & Inventory Engine' }
        ];
      }

      this.currentIndex = this.options.startIndex;
      this.hovering = false;
      this.autoplayTimer = null;

      this.buildDOM();
      this.initEngine();
      this.bindEvents();
      this.startAutoplay();
    }

    buildDOM() {
      const c = this.options;
      this.root.classList.add('morph-slider');
      this.root.style.borderRadius = `${c.radius}px`;
      this.root.style.setProperty('--ms-swap', `${(c.duration * 0.66).toFixed(3)}s`);
      this.root.style.setProperty('--ms-dot', `${(c.duration * 0.45).toFixed(3)}s`);

      // 1. Stage
      this.stage = document.createElement('div');
      this.stage.className = 'morph-slider-stage';
      this.stage.setAttribute('role', 'group');
      this.stage.setAttribute('aria-roledescription', 'carousel');
      this.stage.setAttribute('aria-label', 'Image morph slider');
      this.stage.tabIndex = 0;
      this.root.appendChild(this.stage);

      // 2. Captions
      if (c.showCaptions && this.options.items.some(it => it.caption)) {
        this.captionBox = document.createElement('div');
        this.captionBox.className = 'morph-slider-caption';
        this.captionBox.setAttribute('aria-live', 'polite');

        this.captionSpans = this.options.items.map((item, i) => {
          const span = document.createElement('span');
          span.className = `morph-slider-caption-text ${i === this.currentIndex ? 'is-active' : ''}`;
          span.textContent = item.caption || '';
          if (i !== this.currentIndex) span.setAttribute('aria-hidden', 'true');
          this.captionBox.appendChild(span);
          return span;
        });

        this.root.appendChild(this.captionBox);
      }

      // 3. Controls (Prev / Next Buttons)
      if (c.showControls) {
        const controls = document.createElement('div');
        controls.className = 'morph-slider-controls';

        this.prevBtn = document.createElement('button');
        this.prevBtn.type = 'button';
        this.prevBtn.className = 'morph-slider-btn';
        this.prevBtn.setAttribute('aria-label', 'Previous slide');
        this.prevBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;

        this.nextBtn = document.createElement('button');
        this.nextBtn.type = 'button';
        this.nextBtn.className = 'morph-slider-btn';
        this.nextBtn.setAttribute('aria-label', 'Next slide');
        this.nextBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;

        controls.appendChild(this.prevBtn);
        controls.appendChild(this.nextBtn);
        this.root.appendChild(controls);
      }

      // 4. Indicators (Dots)
      if (c.showIndicators) {
        this.indicators = document.createElement('div');
        this.indicators.className = 'morph-slider-indicators';
        this.indicators.setAttribute('role', 'tablist');
        this.indicators.setAttribute('aria-label', 'Slides');

        this.dotButtons = this.options.items.map((item, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = `morph-slider-dot ${i === this.currentIndex ? 'is-active' : ''}`;
          dot.setAttribute('role', 'tab');
          dot.setAttribute('aria-selected', String(i === this.currentIndex));
          dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
          dot.addEventListener('click', () => {
            if (!this.engine || i === this.currentIndex) return;
            this.engine.goTo(i > this.currentIndex ? 1 : -1);
          });
          this.indicators.appendChild(dot);
          return dot;
        });

        this.root.appendChild(this.indicators);
      }
    }

    initEngine() {
      const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      try {
        this.engine = new MorphEngine(this.stage, {
          items: this.options.items,
          startIndex: this.currentIndex,
          reducedMotion,
          dprCap: 2,
          getOptions: () => this.options,
          onIndexChange: (idx) => this.onIndexChange(idx)
        });
      } catch (err) {
        console.warn('MorphEngine WebGL fallback active:', err.message);
        this.initFallback();
      }
    }

    initFallback() {
      // Clean CSS fallback in case WebGL is unavailable
      const fallbackImg = document.createElement('img');
      fallbackImg.className = 'morph-slider-canvas';
      fallbackImg.src = this.options.items[this.currentIndex]?.image || '';
      fallbackImg.alt = this.options.items[this.currentIndex]?.caption || '';
      fallbackImg.style.objectFit = 'cover';
      this.stage.appendChild(fallbackImg);

      this.engine = {
        goTo: (dir) => {
          const n = this.options.items.length;
          const nextIdx = ((this.currentIndex + dir) % n + n) % n;
          this.onIndexChange(nextIdx);
          fallbackImg.src = this.options.items[nextIdx].image;
        },
        next: () => this.engine.goTo(1),
        prev: () => this.engine.goTo(-1),
        destroy: () => {}
      };
    }

    onIndexChange(newIndex) {
      this.currentIndex = newIndex;

      // Update Captions
      if (this.captionSpans) {
        this.captionSpans.forEach((span, i) => {
          if (i === newIndex) {
            span.classList.add('is-active');
            span.removeAttribute('aria-hidden');
          } else {
            span.classList.remove('is-active');
            span.setAttribute('aria-hidden', 'true');
          }
        });
      }

      // Update Indicator Dots
      if (this.dotButtons) {
        this.dotButtons.forEach((dot, i) => {
          if (i === newIndex) {
            dot.classList.add('is-active');
            dot.setAttribute('aria-selected', 'true');
          } else {
            dot.classList.remove('is-active');
            dot.setAttribute('aria-selected', 'false');
          }
        });
      }

      this.resetAutoplay();
    }

    bindEvents() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.engine?.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.engine?.next());
      }

      // Pointer Drag gestures on stage
      let startX = 0;
      let width = 1;
      let active = false;

      const onDown = (e) => {
        const rect = this.stage.getBoundingClientRect();
        width = rect.width || 1;
        startX = e.clientX;
        const px = (e.clientX - rect.left) / width;
        const py = (e.clientY - rect.top) / (rect.height || 1);
        if (this.engine && this.engine.setPointer) {
          this.engine.setPointer(px, 1 - py);
        }
        active = this.engine?.beginDrag ? this.engine.beginDrag() : false;
        if (active && this.stage.setPointerCapture) {
          try { this.stage.setPointerCapture(e.pointerId); } catch (e) {}
        }
      };

      const onMove = (e) => {
        if (!active) return;
        const ndx = (e.clientX - startX) / width;
        this.engine?.drag && this.engine.drag(ndx);
      };

      const onUp = () => {
        if (!active) return;
        active = false;
        this.engine?.endDrag && this.engine.endDrag();
      };

      this.stage.addEventListener('pointerdown', onDown);
      this.stage.addEventListener('pointermove', onMove);
      this.stage.addEventListener('pointerup', onUp);
      this.stage.addEventListener('pointercancel', onUp);

      // Keyboard Left/Right
      this.stage.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.engine?.next();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.engine?.prev();
        }
      });

      // Hover pause for autoplay
      this.root.addEventListener('mouseenter', () => {
        this.hovering = true;
        this.clearAutoplay();
      });

      this.root.addEventListener('mouseleave', () => {
        this.hovering = false;
        this.startAutoplay();
      });
    }

    startAutoplay() {
      if (!this.options.autoplay || this.hovering) return;
      this.clearAutoplay();
      const delay = Math.max(this.options.autoplayDelay, 1) * 1000;
      this.autoplayTimer = setTimeout(() => {
        this.engine?.next();
      }, delay);
    }

    clearAutoplay() {
      if (this.autoplayTimer) {
        clearTimeout(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    }

    resetAutoplay() {
      this.clearAutoplay();
      this.startAutoplay();
    }

    destroy() {
      this.clearAutoplay();
      if (this.engine) this.engine.destroy();
    }
  }

  // Auto-initialize elements with data-morph-slider="true"
  function initAutoMorphSlider() {
    const mounts = document.querySelectorAll('[data-morph-slider="true"]');
    mounts.forEach(el => {
      if (!el.__morphSliderInstance) {
        el.__morphSliderInstance = new MorphSliderVanilla(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoMorphSlider);
  } else {
    initAutoMorphSlider();
  }

  // Export to global scope
  global.MorphSlider = MorphSliderVanilla;
  global.MorphEngine = MorphEngine;
  global.initAutoMorphSlider = initAutoMorphSlider;

})(typeof window !== 'undefined' ? window : this);
