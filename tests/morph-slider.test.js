/**
 * MorphSlider Component Spec & Integration Test Suite
 * Validates the React Bits <MorphSlider /> component implementation:
 * - MorphSlider.jsx React Component & OGL integration
 * - MorphSlider.css Stylesheet & Tokens
 * - morph-slider.js Vanilla Controller & WebGL Shaders
 * - assets/ogl.umd.js Local OGL Library
 * - index.html Live Integration & Data Mount
 */

const fs = require('fs');
const path = require('path');
const { DOMParserLite, Assert } = require('./test-utils');

function runMorphSliderTests() {
  console.log('\n================================================================================');
  console.log('   REACT BITS <MorphSlider /> SPEC SUITE (morph-slider.test.js)                ');
  console.log('================================================================================\n');

  const jsxPath = path.resolve(__dirname, '../MorphSlider.jsx');
  const cssPath = path.resolve(__dirname, '../MorphSlider.css');
  const jsPath = path.resolve(__dirname, '../morph-slider.js');
  const oglPath = path.resolve(__dirname, '../assets/ogl.umd.js');
  const htmlPath = path.resolve(__dirname, '../index.html');

  Assert.isTrue(fs.existsSync(jsxPath), 'MorphSlider.jsx exists');
  Assert.isTrue(fs.existsSync(cssPath), 'MorphSlider.css exists');
  Assert.isTrue(fs.existsSync(jsPath), 'morph-slider.js exists');
  Assert.isTrue(fs.existsSync(oglPath), 'assets/ogl.umd.js exists');
  Assert.isTrue(fs.existsSync(htmlPath), 'index.html exists');

  const jsx = fs.readFileSync(jsxPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const js = fs.readFileSync(jsPath, 'utf8');
  const ogl = fs.readFileSync(oglPath, 'utf8');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new DOMParserLite(html);

  let passed = 0;
  let assertions = 0;

  function test(name, fn) {
    try {
      const count = fn();
      assertions += count;
      passed++;
      console.log(`  ✔ [MORPH-SLIDER] ${name} (${count} assertions)`);
    } catch (err) {
      console.error(`  ✘ [MORPH-SLIDER] ${name} FAILED: ${err.message}`);
      throw err;
    }
  }

  // 1. React Component Source Contract
  test('React Component Props & OGL Imports Integrity', () => {
    Assert.contains(jsx, 'export default function MorphSlider', 'Default export MorphSlider exists');
    Assert.contains(jsx, 'from \'ogl\'', 'Imports OGL classes');
    Assert.contains(jsx, 'Renderer', 'Imports Renderer from OGL');
    Assert.contains(jsx, 'Triangle', 'Imports Triangle geometry');
    Assert.contains(jsx, 'Program', 'Imports Program from OGL');
    Assert.contains(jsx, 'Mesh', 'Imports Mesh from OGL');
    Assert.contains(jsx, 'Texture', 'Imports Texture from OGL');
    Assert.contains(jsx, 'from \'gsap\'', 'Imports gsap for transition progress');
    Assert.contains(jsx, 'transition = \'melt\'', 'Default transition is melt');
    Assert.contains(jsx, 'intensity = 0.55', 'Default intensity is 0.55');
    Assert.contains(jsx, 'aberration = 0.35', 'Default aberration is 0.35');
    Assert.contains(jsx, 'drift = 0.4', 'Default drift is 0.4');
    return 12;
  });

  // 2. WebGL GLSL Shader Architecture
  test('GLSL Procedural Noise & Transition Shaders', () => {
    Assert.contains(jsx, 'attribute vec2 position', 'Vertex shader takes position attribute');
    Assert.contains(jsx, 'attribute vec2 uv', 'Vertex shader takes uv attribute');
    Assert.contains(jsx, 'float hash11(', 'Implements 1D hash algorithm');
    Assert.contains(jsx, 'float hash21(', 'Implements 2D-to-1D hash algorithm');
    Assert.contains(jsx, 'float noise(', 'Implements procedural noise function');
    Assert.contains(jsx, 'float fbm(', 'Implements Fractal Brownian Motion');
    Assert.contains(jsx, 'mat2 rot(', 'Implements 2D rotation matrix');
    Assert.contains(jsx, 'vec2 coverUV(', 'Implements aspect ratio cover projection');
    Assert.contains(jsx, 'uAberration', 'Computes RGB channel split (chromatic aberration)');
    Assert.contains(jsx, 'uDrift', 'Computes continuous sinusoidal image drift');
    Assert.contains(jsx, 'uMode == 3', 'Implements swirl transition mode');
    Assert.contains(jsx, 'uMode == 1', 'Implements ripple transition mode');
    Assert.contains(jsx, 'uMode == 2', 'Implements shear transition mode');
    return 13;
  });

  // 3. Component CSS Hierarchy & Visual Tokens
  test('MorphSlider CSS Class Hierarchy & Controls', () => {
    Assert.contains(css, '.morph-slider', 'Defines root .morph-slider');
    Assert.contains(css, '.morph-slider-stage', 'Defines stage viewport');
    Assert.contains(css, '.morph-slider-canvas', 'Defines canvas element');
    Assert.contains(css, '.morph-slider-caption', 'Defines caption wrapper');
    Assert.contains(css, '.morph-slider-caption-text', 'Defines caption text styling');
    Assert.contains(css, '.morph-slider-controls', 'Defines control buttons bar');
    Assert.contains(css, '.morph-slider-btn', 'Defines arrow button styling');
    Assert.contains(css, '.morph-slider-indicators', 'Defines slide indicators');
    Assert.contains(css, '.morph-slider-dot', 'Defines indicator dot styling');
    Assert.contains(css, 'prefers-reduced-motion', 'Provides reduced-motion safety override');
    return 10;
  });

  // 4. Local OGL Library Integrity
  test('Local OGL UMD Library Integrity (assets/ogl.umd.js)', () => {
    Assert.isGreaterThanOrEqual(ogl.length, 100000, 'assets/ogl.umd.js is full bundle (>100KB)');
    Assert.contains(ogl, 'Renderer', 'OGL bundle defines Renderer');
    Assert.contains(ogl, 'Program', 'OGL bundle defines Program');
    Assert.contains(ogl, 'Mesh', 'OGL bundle defines Mesh');
    Assert.contains(ogl, 'Texture', 'OGL bundle defines Texture');
    return 5;
  });

  // 5. Vanilla Controller (morph-slider.js)
  test('Vanilla Controller & Gesture Physics (morph-slider.js)', () => {
    Assert.contains(js, 'class MorphEngine', 'Implements WebGL MorphEngine class');
    Assert.contains(js, 'class MorphSliderVanilla', 'Implements MorphSliderVanilla wrapper');
    Assert.contains(js, 'pointerdown', 'Binds pointerdown drag initiation');
    Assert.contains(js, 'pointermove', 'Binds pointermove drag tracking');
    Assert.contains(js, 'pointerup', 'Binds pointerup drag release');
    Assert.contains(js, 'mouseenter', 'Pauses autoplay on hover');
    Assert.contains(js, 'mouseleave', 'Resumes autoplay on hover exit');
    Assert.contains(js, 'webglcontextlost', 'Handles WebGL context lost recovery');
    Assert.contains(js, 'global.MorphSlider', 'Exports MorphSlider to global scope');
    Assert.contains(js, 'initAutoMorphSlider', 'Provides DOM auto-initialization');
    return 10;
  });

  // 6. Live Website Integration in index.html
  test('index.html Mount Point & Hardware Lab Showcase', () => {
    Assert.contains(html, 'href="MorphSlider.css"', 'MorphSlider.css linked in head');
    Assert.contains(html, 'src="assets/ogl.umd.js"', 'assets/ogl.umd.js script included');
    Assert.contains(html, 'src="morph-slider.js"', 'morph-slider.js script included');

    const slider = dom.querySelector('[data-morph-slider="true"]');
    Assert.exists(slider, '[data-morph-slider="true"] mount element exists');
    Assert.contains(html, 'data-transition="melt"', 'Configures melt GPU transition');
    Assert.contains(html, 'data-autoplay="true"', 'Enables autoplay on slider');

    const slides = dom.querySelectorAll('.morph-slide-data');
    Assert.isGreaterThanOrEqual(slides.length, 4, 'Provides at least 4 slides for morphing');
    return 7;
  });

  console.log(`\n✔ ALL ${passed} MORPH-SLIDER TESTS PASSED (${assertions} assertions)\n`);
  return { passed, assertions };
}

if (require.main === module) {
  runMorphSliderTests();
}

module.exports = { runMorphSliderTests };
