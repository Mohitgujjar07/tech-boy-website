/**
 * @file test-utils.js
 * @description Shared testing utilities, DOM analysis helpers, CSS token parser,
 * HTTP client, and assertion framework for Aarambhx Technology E2E test suite.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT_DIR, 'index.html');
const CSS_PATH = path.join(ROOT_DIR, 'styles.css');
const JS_PATH = path.join(ROOT_DIR, 'main.js');
const CONFIG_PATH = path.join(ROOT_DIR, 'config.js');
const FAVICON_PATH = path.join(ROOT_DIR, 'assets', 'favicon.svg');
const SERVER_PATH = path.join(ROOT_DIR, 'server.js');

// Load raw file contents
function getHTMLContent() {
  return fs.readFileSync(HTML_PATH, 'utf-8');
}

function getCSSContent() {
  return fs.readFileSync(CSS_PATH, 'utf-8');
}

function getJSContent() {
  return fs.readFileSync(JS_PATH, 'utf-8');
}

function getConfigContent() {
  return fs.readFileSync(CONFIG_PATH, 'utf-8');
}

/**
 * Safely evaluates and returns the TBS_CONFIG object from config.js
 */
function getTBSConfig() {
  const code = getConfigContent();
  const sandbox = {};
  const fn = new Function('sandbox', `${code}; return TBS_CONFIG;`);
  return fn(sandbox);
}

/**
 * Lightweight pure-JS DOM parser for testing structure, attributes, and contents
 */
class DOMParserLite {
  constructor(html) {
    this.rawHTML = html;
  }

  // Find elements by CSS-like selector (simple support for tags, #id, .class, [attr], [attr=val])
  querySelectorAll(selector) {
    return DOMParserLite.query(this.rawHTML, selector);
  }

  querySelector(selector) {
    const results = this.querySelectorAll(selector);
    return results.length > 0 ? results[0] : null;
  }

  getElementById(id) {
    return this.querySelector(`#${id}`);
  }

  static query(html, selector) {
    const cleanSel = selector.trim();
    if (cleanSel.includes(' ')) {
      const parts = cleanSel.split(/\s+/);
      let currentResults = DOMParserLite.querySingle(html, parts[0]);
      for (let i = 1; i < parts.length; i++) {
        const nextResults = [];
        for (const el of currentResults) {
          const sub = DOMParserLite.query(el.innerHTML, parts[i]);
          nextResults.push(...sub);
        }
        currentResults = nextResults;
      }
      return currentResults;
    }
    return DOMParserLite.querySingle(html, cleanSel);
  }

  static querySingle(html, cleanSel) {
    const results = [];

    // ID selector: #id
    if (cleanSel.startsWith('#')) {
      const id = cleanSel.slice(1);
      const regex = new RegExp(`<([a-zA-Z0-9\\-]+)([^>]*?)\\s+id=["']${id}["']([^>]*?)>`, 'i');
      const match = regex.exec(html);
      if (match) {
        const fullTag = match[0];
        const tagName = match[1];
        const attrStr = match[2] + ' ' + match[3];
        const el = DOMParserLite.extractElement(html, match.index, tagName, fullTag, attrStr);
        if (el) results.push(el);
      }
      return results;
    }

    // Class selector: .class
    if (cleanSel.startsWith('.')) {
      const className = cleanSel.slice(1);
      const regex = new RegExp(`<([a-zA-Z0-9\\-]+)([^>]*?\\s+class=["']([^"']*)["'][^>]*?)>`, 'gi');
      let match;
      while ((match = regex.exec(html)) !== null) {
        const fullTag = match[0];
        const tagName = match[1];
        const attrStr = match[2];
        const classAttr = match[3] || '';
        const classes = classAttr.trim().split(/\s+/);
        if (classes.includes(className)) {
          const el = DOMParserLite.extractElement(html, match.index, tagName, fullTag, attrStr);
          if (el) results.push(el);
        }
      }
      return results;
    }

    // Tag selector or attribute selector or compound
    if (cleanSel.startsWith('[') && cleanSel.endsWith(']')) {
      const attrExpr = cleanSel.slice(1, -1);
      let attrName = attrExpr;
      let attrVal = null;
      if (attrExpr.includes('=')) {
        const parts = attrExpr.split('=');
        attrName = parts[0].trim();
        attrVal = parts[1].replace(/["']/g, '').trim();
      }
      const regex = attrVal !== null
        ? new RegExp(`<([a-zA-Z0-9\\-]+)([^>]*?\\s+${attrName}=["']${attrVal}["'][^>]*?)>`, 'gi')
        : new RegExp(`<([a-zA-Z0-9\\-]+)([^>]*?\\s+${attrName}(?:=["'][^"']*?["'])?[^>]*?)>`, 'gi');
      let match;
      while ((match = regex.exec(html)) !== null) {
        const el = DOMParserLite.extractElement(html, match.index, match[1], match[0], match[2]);
        if (el) results.push(el);
      }
      return results;
    }

    // Standard Tag selector: e.g. 'section', 'nav', 'footer', 'button', 'a', 'input'
    const tagRegex = new RegExp(`<(${cleanSel})\\b([^>]*?)>`, 'gi');
    let match;
    while ((match = tagRegex.exec(html)) !== null) {
      const el = DOMParserLite.extractElement(html, match.index, match[1], match[0], match[2]);
      if (el) results.push(el);
    }

    return results;
  }

  static extractElement(html, startIndex, tagName, openTag, attrStr) {
    const isSelfClosing = ['img', 'input', 'br', 'hr', 'meta', 'link', 'circle', 'rect', 'path', 'polygon', 'line'].includes(tagName.toLowerCase()) || openTag.endsWith('/>');
    
    // Parse attributes directly from openTag
    const attributes = {};
    const attrRegex = /([a-zA-Z0-9\-_:@.]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(openTag)) !== null) {
      const name = attrMatch[1];
      // Skip the tagName if matched as first token
      if (name.toLowerCase() === tagName.toLowerCase()) continue;
      const val = attrMatch[2] !== undefined ? attrMatch[2] : (attrMatch[3] !== undefined ? attrMatch[3] : (attrMatch[4] !== undefined ? attrMatch[4] : ''));
      attributes[name] = val;
    }

    if (isSelfClosing) {
      return new DOMElement(tagName, attributes, '', openTag);
    }

    // Find matching closing tag with depth tracking
    const closeTag = `</${tagName}>`;
    let depth = 1;
    let searchPos = startIndex + openTag.length;
    const tagFinder = new RegExp(`(<${tagName}\\b[^>]*>)|(</${tagName}>)`, 'gi');
    tagFinder.lastIndex = searchPos;
    
    let endPos = -1;
    let nestedMatch;
    while ((nestedMatch = tagFinder.exec(html)) !== null) {
      if (nestedMatch[1]) {
        depth++;
      } else if (nestedMatch[2]) {
        depth--;
        if (depth === 0) {
          endPos = nestedMatch.index;
          break;
        }
      }
    }

    let innerHTML = '';
    if (endPos !== -1) {
      innerHTML = html.substring(startIndex + openTag.length, endPos);
    } else {
      // Fallback: grab up to next same close tag or reasonably sized chunk
      const simpleClose = html.indexOf(closeTag, searchPos);
      if (simpleClose !== -1) {
        innerHTML = html.substring(startIndex + openTag.length, simpleClose);
      }
    }

    return new DOMElement(tagName, attributes, innerHTML, openTag);
  }
}

class DOMElement {
  constructor(tagName, attributes, innerHTML, openTag) {
    this.tagName = tagName.toLowerCase();
    this.attributes = attributes || {};
    this.innerHTML = innerHTML || '';
    this.openTag = openTag || '';
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  hasAttribute(name) {
    return this.attributes[name] !== undefined;
  }

  get id() {
    return this.attributes['id'] || '';
  }

  get className() {
    return this.attributes['class'] || '';
  }

  get classList() {
    return this.className.split(/\s+/).filter(Boolean);
  }

  hasClass(cls) {
    return this.classList.includes(cls);
  }

  get textContent() {
    return this.innerHTML.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&bull;/g, '•').replace(/&times;/g, '×').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&rarr;/g, '→').trim();
  }

  querySelectorAll(selector) {
    return DOMParserLite.query(this.innerHTML, selector);
  }

  querySelector(selector) {
    const results = this.querySelectorAll(selector);
    return results.length > 0 ? results[0] : null;
  }
}

/**
 * CSS Parser and Token Extractor
 */
class CSSAnalyzer {
  constructor(cssContent) {
    this.css = cssContent;
  }

  // Get value of CSS variable in :root or [data-theme="..."]
  getVariable(varName, theme = 'root') {
    let block = '';
    if (theme === 'root') {
      const match = /:root\s*\{([^}]+)\}/s.exec(this.css);
      if (match) block = match[1];
    } else if (theme === 'light') {
      const match = /\[data-theme=["']?light["']?\]\s*\{([^}]+)\}/s.exec(this.css);
      if (match) block = match[1];
      if (!block) {
        // Fallback to :root if light inherits from root
        return this.getVariable(varName, 'root');
      }
    } else if (theme === 'dark') {
      const match = /\[data-theme=["']?dark["']?\]\s*\{([^}]+)\}/s.exec(this.css);
      if (match) block = match[1];
    }

    const varRegex = new RegExp(`${varName}\\s*:\\s*([^;]+);`);
    const varMatch = varRegex.exec(block);
    return varMatch ? varMatch[1].trim() : null;
  }

  hasRule(selectorPattern) {
    const regex = typeof selectorPattern === 'string'
      ? new RegExp(`${selectorPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`, 'i')
      : selectorPattern;
    return regex.test(this.css);
  }

  getRuleBlock(selector) {
    const regex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]+)\\}`, 'i');
    const match = regex.exec(this.css);
    return match ? match[1].trim() : null;
  }

  getMediaQueries() {
    const queries = [];
    const mediaRegex = /@media\s*\(([^)]+)\)\s*\{/g;
    let match;
    while ((match = mediaRegex.exec(this.css)) !== null) {
      queries.push(match[1]);
    }
    return queries;
  }
}

/**
 * Assertion Engine with descriptive error logging
 */
class Assert {
  static isTrue(value, message) {
    if (value !== true) {
      throw new Error(`Assertion Failed: ${message || 'Expected true but received ' + JSON.stringify(value)}`);
    }
  }

  static isFalse(value, message) {
    if (value !== false) {
      throw new Error(`Assertion Failed: ${message || 'Expected false but received ' + JSON.stringify(value)}`);
    }
  }

  static equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`Assertion Failed: ${message || ''}\n  Actual:   ${JSON.stringify(actual)}\n  Expected: ${JSON.stringify(expected)}`);
    }
  }

  static notEqual(actual, expected, message) {
    if (actual === expected) {
      throw new Error(`Assertion Failed: ${message || 'Expected values to differ, but both are ' + JSON.stringify(actual)}`);
    }
  }

  static contains(haystack, needle, message) {
    if (!haystack || !haystack.includes(needle)) {
      throw new Error(`Assertion Failed: ${message || ''}\n  Target does not contain expected substring: ${JSON.stringify(needle)}`);
    }
  }

  static match(text, regex, message) {
    if (!regex.test(text)) {
      throw new Error(`Assertion Failed: ${message || ''}\n  Text ${JSON.stringify(text)} does not match pattern ${regex.toString()}`);
    }
  }

  static exists(val, message) {
    if (val === null || val === undefined) {
      throw new Error(`Assertion Failed: ${message || 'Expected element/value to exist, but got ' + val}`);
    }
  }

  static isGreaterThanOrEqual(actual, expected, message) {
    if (!(actual >= expected)) {
      throw new Error(`Assertion Failed: ${message || ''}\n  Expected ${actual} >= ${expected}`);
    }
  }

  static isLessThanOrEqual(actual, expected, message) {
    if (!(actual <= expected)) {
      throw new Error(`Assertion Failed: ${message || ''}\n  Expected ${actual} <= ${expected}`);
    }
  }

  static isArray(val, message) {
    if (!Array.isArray(val)) {
      throw new Error(`Assertion Failed: ${message || 'Expected array but received ' + typeof val}`);
    }
  }
}

/**
 * Pure Node.js HTTP Fetcher for testing running local server
 */
function makeHttpRequest(urlPath = '/', port = 3000) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: port,
      path: urlPath,
      method: 'GET',
      headers: {
        'User-Agent': 'TBS-E2E-Test-Runner/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        error: err,
        statusCode: 0,
        body: null
      });
    });

    req.setTimeout(2000, () => {
      req.destroy();
      resolve({
        error: new Error('Request timeout'),
        statusCode: 0,
        body: null
      });
    });

    req.end();
  });
}

/**
 * Simulated client-side validation logic from main.js for headless testing
 */
function simulateFormValidation(fields) {
  const errors = {};
  let isValid = true;

  const requiredFields = ['fullName', 'phone', 'city', 'customerType', 'service', 'description'];
  for (const req of requiredFields) {
    if (!fields[req] || !fields[req].trim()) {
      errors[req] = 'This field is required.';
      isValid = false;
    }
  }

  if (fields.email && fields.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fields.email.trim())) {
      errors.email = 'Please enter a valid email address.';
      isValid = false;
    }
  }

  if (fields.phone && fields.phone.trim()) {
    const phoneRegex = /^[\d\s+\-()]{7,15}$/;
    if (!phoneRegex.test(fields.phone.trim())) {
      errors.phone = 'Please enter a valid phone number.';
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Builds WhatsApp dispatch URL from consultation form payload
 */
function buildWhatsAppPayload(fields, config) {
  const number = config.company.whatsapp;
  const lines = [
    `*New Consultation Request — Aarambhx Technology*`,
    `----------------------------------------`,
    `*Name:* ${fields.fullName}`,
    `*Phone:* ${fields.phone}`,
    `*Email:* ${fields.email || 'N/A'}`,
    `*Location:* ${fields.city}`,
    `*Customer Type:* ${fields.customerType}`,
    `*Service:* ${fields.service}`,
    `*Budget:* ${fields.budget || 'Flexible'}`,
    `*Preferred Contact:* ${fields.contactMethod || 'WhatsApp'}`,
    `*Description:* ${fields.description}`,
    `----------------------------------------`
  ];
  const message = lines.join('\n');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

module.exports = {
  ROOT_DIR,
  HTML_PATH,
  CSS_PATH,
  JS_PATH,
  CONFIG_PATH,
  FAVICON_PATH,
  SERVER_PATH,
  getHTMLContent,
  getCSSContent,
  getJSContent,
  getConfigContent,
  getTBSConfig,
  DOMParserLite,
  CSSAnalyzer,
  Assert,
  makeHttpRequest,
  simulateFormValidation,
  buildWhatsAppPayload
};
