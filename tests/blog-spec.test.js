/**
 * @file blog-spec.test.js
 * @description Comprehensive specification & regression test suite for AarambhX Engineering Journal & AI Tech News (Tier 13).
 * Validates blog.html, blog.css, blog.js, blog.min.* assets, AarambhXStore blog CRUD methods, Admin CMS, and cross-site links.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { Assert } = require('./test-utils');

const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Creates an isolated mock browser sandbox to test admin-store.js blog methods
 */
function createStoreSandbox() {
  const store = {};
  const mockLocalStorage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };

  const sandbox = {
    localStorage: mockLocalStorage,
    console: {
      log: () => {},
      warn: () => {},
      error: () => {}
    }
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;

  vm.createContext(sandbox);
  const storeCode = fs.readFileSync(path.join(ROOT_DIR, 'admin-store.js'), 'utf8');
  vm.runInContext(storeCode, sandbox);

  return {
    sandbox,
    AarambhXStore: sandbox.AarambhXStore
  };
}

function runBlogSpecTests() {
  console.log('\n================================================================================');
  console.log('   AARAMBHX ENGINEERING JOURNAL & AI TECH NEWS SPEC (Tier 13)                   ');
  console.log('================================================================================\n');

  const blogHtmlPath = path.join(ROOT_DIR, 'blog.html');
  const blogCssPath = path.join(ROOT_DIR, 'blog.css');
  const blogMinCssPath = path.join(ROOT_DIR, 'blog.min.css');
  const blogJsPath = path.join(ROOT_DIR, 'blog.js');
  const blogMinJsPath = path.join(ROOT_DIR, 'blog.min.js');
  const adminHtmlPath = path.join(ROOT_DIR, 'admin.html');
  const adminJsPath = path.join(ROOT_DIR, 'admin.js');
  const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
  const academyHtmlPath = path.join(ROOT_DIR, 'academy.html');
  const workHtmlPath = path.join(ROOT_DIR, 'work.html');
  const highlightsHtmlPath = path.join(ROOT_DIR, 'highlights.html');
  const brochureHtmlPath = path.join(ROOT_DIR, 'brochure.html');

  let passed = 0;
  let failed = 0;
  let assertions = 0;

  function test(name, fn) {
    try {
      const count = fn();
      assertions += count;
      passed++;
      console.log(`  ✔ [BLOG-SPEC] ${name} (${count} assertions)`);
    } catch (err) {
      failed++;
      console.error(`  ✘ [BLOG-SPEC] ${name} FAILED: ${err.message}`);
      throw err;
    }
  }

  // -------------------------------------------------------------------------
  // 1. File Existence & Asset Integrity
  // -------------------------------------------------------------------------
  test('Blog Core Files & Minified Assets Exist', () => {
    Assert.isTrue(fs.existsSync(blogHtmlPath), 'blog.html exists');
    Assert.isTrue(fs.existsSync(blogCssPath), 'blog.css exists');
    Assert.isTrue(fs.existsSync(blogMinCssPath), 'blog.min.css exists');
    Assert.isTrue(fs.existsSync(blogJsPath), 'blog.js exists');
    Assert.isTrue(fs.existsSync(blogMinJsPath), 'blog.min.js exists');

    const minCss = fs.readFileSync(blogMinCssPath, 'utf8');
    const minJs = fs.readFileSync(blogMinJsPath, 'utf8');
    Assert.isTrue(minCss.length > 500, 'blog.min.css has content');
    Assert.isTrue(minJs.length > 500, 'blog.min.js has content');
    return 7;
  });

  // -------------------------------------------------------------------------
  // 2. SEO & Schema.org JSON-LD Metadata Architecture
  // -------------------------------------------------------------------------
  test('Blog SEO, OpenGraph & Schema.org JSON-LD Architecture', () => {
    const html = fs.readFileSync(blogHtmlPath, 'utf8');
    Assert.contains(html, '<!DOCTYPE html>', 'Valid DOCTYPE');
    Assert.contains(html, '<title>AarambhX Engineering Journal &amp; AI Tech News', 'SEO Title present');
    Assert.contains(html, 'meta name="description"', 'Meta description present');
    Assert.contains(html, 'property="og:title"', 'OpenGraph title present');
    Assert.contains(html, 'property="og:image"', 'OpenGraph image present');
    Assert.contains(html, 'name="twitter:card"', 'Twitter card present');
    Assert.contains(html, 'application/ld+json', 'Schema.org JSON-LD script present');
    Assert.contains(html, '"@type": "Blog"', 'Schema.org Blog type present');
    Assert.contains(html, '"@type": "BreadcrumbList"', 'Schema.org BreadcrumbList present');
    return 9;
  });

  // -------------------------------------------------------------------------
  // 3. Public Hub DOM & Interactive Elements
  // -------------------------------------------------------------------------
  test('Public Journal DOM Elements & Layout Components', () => {
    const html = fs.readFileSync(blogHtmlPath, 'utf8');
    Assert.contains(html, 'id="readingProgressBar"', 'Reading progress bar exists');
    Assert.contains(html, 'class="apple-glass-nav"', 'Floating glass navbar exists');
    Assert.contains(html, 'id="blogListingView"', 'Blog listing container exists');
    Assert.contains(html, 'id="blogSearchInput"', 'Search input exists');
    Assert.contains(html, 'data-category="all"', 'All filter tab exists');
    Assert.contains(html, 'data-category="ai-tech"', 'AI tech filter tab exists');
    Assert.contains(html, 'data-category="fullstack"', 'Full-stack filter tab exists');
    Assert.contains(html, 'data-category="hardware-iot"', 'Hardware IoT filter tab exists');
    Assert.contains(html, 'data-category="case-studies"', 'Case studies filter tab exists');
    Assert.contains(html, 'id="featuredStoryMount"', 'Hero split-card slot exists');
    Assert.contains(html, 'id="blogGridMount"', 'Bento card grid mount exists');
    Assert.contains(html, 'id="articleReaderView"', 'Dedicated reader view exists');
    Assert.contains(html, 'id="newsletterForm"', 'Newsletter subscription form exists');
    Assert.contains(html, 'id="themeToggle"', 'Theme toggle button exists');
    return 13;
  });

  // -------------------------------------------------------------------------
  // 4. AarambhXStore Blog Engine (CRUD & Seed Verification)
  // -------------------------------------------------------------------------
  test('AarambhXStore Blog CRUD Engine & Persistence', () => {
    const { AarambhXStore } = createStoreSandbox();
    AarambhXStore.init();

    // 1. Pre-seeded posts
    const initialPosts = AarambhXStore.getBlogPosts();
    Assert.isTrue(Array.isArray(initialPosts), 'getBlogPosts returns array');
    Assert.isTrue(initialPosts.length >= 4, 'At least 4 seed articles pre-populated');

    // 2. Lookup by slug (supports modern slug and legacy alias)
    const aiPost = AarambhXStore.getBlogPostBySlug('autonomous-multi-agent-mcp-orchestration') || AarambhXStore.getBlogPostBySlug('autonomous-ai-agents-rag');
    Assert.isTrue(!!aiPost, 'autonomous-multi-agent-mcp-orchestration slug lookup works');
    Assert.contains(aiPost.title, 'Multi-Agent', 'Seed title matched');
    Assert.isTrue(aiPost.category.includes('AI'), 'Category matches AI');

    // 3. View counter increment
    const initialViews = aiPost.views || 0;
    AarambhXStore.incrementBlogPostViews('autonomous-multi-agent-mcp-orchestration');
    const updatedAiPost = AarambhXStore.getBlogPostBySlug('autonomous-multi-agent-mcp-orchestration');
    Assert.equal(updatedAiPost.views, initialViews + 1, 'incrementBlogPostViews works');

    // 4. Create new article
    const created = AarambhXStore.saveBlogPost({
      title: 'Quantum Key Distribution in Edge IoT',
      slug: 'quantum-key-distribution-iot',
      category: 'Hardware & IoT',
      author: 'Lalith H',
      authorRole: 'Chief Systems Architect',
      readTime: '6 min read',
      status: 'Published',
      summary: 'Quantum-safe key distribution algorithms implemented on RISC-V edge microcontrollers.',
      content: '## QKD Hardware Protocols\n\nDetailed breakdown of lattice cryptography on constrained hardware.'
    });
    Assert.isTrue(!!created.id, 'saveBlogPost creates new post with unique ID');
    Assert.equal(created.slug, 'quantum-key-distribution-iot', 'Slug saved correctly');

    // 5. Retrieve by ID
    const byId = AarambhXStore.getBlogPostById(created.id);
    Assert.isTrue(!!byId, 'getBlogPostById retrieves created post');
    Assert.equal(byId.title, 'Quantum Key Distribution in Edge IoT', 'Post title matched by ID');

    // 6. Update article
    created.title = 'Quantum Key Distribution in Edge IoT (v2)';
    const updated = AarambhXStore.saveBlogPost(created);
    Assert.equal(updated.title, 'Quantum Key Distribution in Edge IoT (v2)', 'Post updated successfully');

    // 7. Delete article
    const deleted = AarambhXStore.deleteBlogPost(created.id);
    Assert.isTrue(deleted, 'deleteBlogPost returns true');
    const lookupDeleted = AarambhXStore.getBlogPostById(created.id);
    Assert.isTrue(!lookupDeleted, 'Deleted post is no longer in store');

    // 8. Full export contains blog posts
    const backup = AarambhXStore.exportAllJSON();
    Assert.isTrue(backup.includes('blogPosts'), 'exportAllJSON includes blogPosts');

    return 13;
  });

  // -------------------------------------------------------------------------
  // 5. Admin Hub CMS Integration (admin.html & admin.js)
  // -------------------------------------------------------------------------
  test('Admin Hub CMS Panel & Modal Integration', () => {
    const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
    const adminJs = fs.readFileSync(adminJsPath, 'utf8');

    // Admin HTML Navigation & Panel
    Assert.contains(adminHtml, 'data-tab="blog"', 'Sidebar has Blog & Journal CMS link');
    Assert.contains(adminHtml, 'id="tab-blog"', 'Tab 12 section tab-blog exists');
    Assert.contains(adminHtml, 'id="blogMetricTotal"', 'Metric total articles card exists');
    Assert.contains(adminHtml, 'id="blogMetricPublished"', 'Metric published card exists');
    Assert.contains(adminHtml, 'id="blogMetricDrafts"', 'Metric drafts card exists');
    Assert.contains(adminHtml, 'id="blogMetricViews"', 'Metric views card exists');
    Assert.contains(adminHtml, 'id="btnNewBlogPost"', 'Write New Article button exists');
    Assert.contains(adminHtml, 'id="blogPostsTable"', 'Article table exists');
    Assert.contains(adminHtml, 'id="blogPostsTableBody"', 'Article table body exists');

    // Modal Editor
    Assert.contains(adminHtml, 'id="modalBlogEditor"', 'Blog Editor Modal exists');
    Assert.contains(adminHtml, 'id="formBlogEditor"', 'Blog Editor Form exists');
    Assert.contains(adminHtml, 'id="blogPostTitle"', 'Article title input exists');
    Assert.contains(adminHtml, 'id="blogPostSlug"', 'Article slug input exists');
    Assert.contains(adminHtml, 'id="blogPostCategory"', 'Article category select exists');
    Assert.contains(adminHtml, 'id="blogPostAuthor"', 'Article author input exists');
    Assert.contains(adminHtml, 'id="blogPostContent"', 'Article markdown content textarea exists');
    Assert.contains(adminHtml, 'id="blogLivePreviewBox"', 'Real-time WYSIWYG preview box exists');
    Assert.contains(adminHtml, 'id="btnAiGenerateBlogTemplate"', 'AI content assistant button exists');

    // Admin JS Controller Logic
    Assert.contains(adminJs, "case 'blog':", 'switchTab routes blog tab');
    Assert.contains(adminJs, "'blog'", 'validTabs includes blog');
    Assert.contains(adminJs, 'function renderBlogCMS()', 'renderBlogCMS function exists');
    Assert.contains(adminJs, 'function openBlogModal(', 'openBlogModal function exists');
    Assert.contains(adminJs, 'function aiGenerateBlogTemplate()', 'aiGenerateBlogTemplate function exists');
    Assert.contains(adminJs, 'function updateBlogLivePreview()', 'updateBlogLivePreview function exists');
    Assert.contains(adminJs, 'Store.saveBlogPost(', 'Form submission saves blog post');
    Assert.contains(adminJs, 'Store.deleteBlogPost(', 'deleteBlogPost handler exists');

    return 26;
  });

  // -------------------------------------------------------------------------
  // 6. Cross-Site Navigation Verification
  // -------------------------------------------------------------------------
  test('Cross-Site Navigation Links to blog.html', () => {
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    const academyHtml = fs.readFileSync(academyHtmlPath, 'utf8');
    const workHtml = fs.readFileSync(workHtmlPath, 'utf8');
    const highlightsHtml = fs.readFileSync(highlightsHtmlPath, 'utf8');
    const brochureHtml = fs.readFileSync(brochureHtmlPath, 'utf8');

    // index.html
    Assert.contains(indexHtml, 'href="blog.html"', 'index.html has blog.html in desktop nav');
    Assert.contains(indexHtml, "window.location.href='blog.html'", 'index.html has blog.html in mobile drawer');
    Assert.contains(indexHtml, '<a href="blog.html">Engineering Journal ↗</a>', 'index.html has blog.html in footer');

    // academy.html
    Assert.contains(academyHtml, 'href="blog.html"', 'academy.html has blog.html in navbar');
    Assert.contains(academyHtml, 'href="blog.html" class="drawer-link"', 'academy.html has blog.html in drawer');
    Assert.contains(academyHtml, '<a href="blog.html">Engineering Journal ↗</a>', 'academy.html has blog.html in footer');

    // work.html
    Assert.contains(workHtml, 'href="blog.html"', 'work.html has blog.html in navbar');
    Assert.contains(workHtml, 'href="blog.html" class="drawer-link"', 'work.html has blog.html in drawer');
    Assert.contains(workHtml, '<a href="blog.html">Engineering Journal ↗</a>', 'work.html has blog.html in footer');

    // highlights.html & brochure.html
    Assert.contains(highlightsHtml, 'href="blog.html"', 'highlights.html has blog.html back link');
    Assert.contains(brochureHtml, 'href="blog.html"', 'brochure.html has blog.html back link');

    return 11;
  });

  // -------------------------------------------------------------------------
  // 7. Reading Modes & Theme System Specification (Obsidian, Terminal, Sepia)
  // -------------------------------------------------------------------------
  test('Reading Modes & Theme System (Obsidian, Terminal, Sepia Paper)', () => {
    const blogCss = fs.readFileSync(blogCssPath, 'utf8');
    const blogJs = fs.readFileSync(blogJsPath, 'utf8');

    // 1. CSS Reading Themes
    Assert.contains(blogCss, 'body.mode-obsidian', 'Obsidian mode class defined in blog.css');
    Assert.contains(blogCss, 'body.mode-sepia', 'Sepia mode class defined in blog.css');
    Assert.contains(blogCss, 'body.mode-terminal', 'Terminal mode class defined in blog.css');

    // 2. Sepia Theme Color Custom Properties & Cosmic Canvas Suppression
    Assert.contains(blogCss, '--blog-bg: #F4ECE1', 'Sepia parchment background variable defined');
    Assert.contains(blogCss, '--blog-gold: #B45309', 'Sepia warm amber variable defined');
    Assert.contains(blogCss, '--blog-text-primary: #2C2218', 'Sepia espresso text variable defined');
    Assert.contains(blogCss, 'body.mode-sepia .blog-cosmic-canvas', 'Sepia cosmic canvas selector exists');
    Assert.contains(blogCss, 'opacity: 0', 'Cosmic canvas hidden in sepia mode');

    // 3. Terminal Theme Color Custom Properties & Phosphor Monospace
    Assert.contains(blogCss, '--blog-bg: #020A05', 'Terminal matrix background variable defined');
    Assert.contains(blogCss, '--blog-gold: #10B981', 'Terminal emerald variable defined');
    Assert.contains(blogCss, '--blog-text-primary: #6EE7B7', 'Terminal phosphor text variable defined');
    Assert.contains(blogCss, "font-family: 'SFMono-Regular'", 'Terminal monospace typography defined');

    // 4. JS Reading Mode Engine & Persistence
    Assert.contains(blogJs, 'function applyReadingMode(', 'applyReadingMode function exists in blog.js');
    Assert.contains(blogJs, 'function wireReadingModes(', 'wireReadingModes function exists in blog.js');
    Assert.contains(blogJs, "'ax_reading_mode'", 'Reading mode persisted to ax_reading_mode in localStorage');
    Assert.contains(blogJs, 'mode-obsidian', 'Obsidian mode managed in blog.js');
    Assert.contains(blogJs, 'mode-sepia', 'Sepia mode managed in blog.js');
    Assert.contains(blogJs, 'mode-terminal', 'Terminal mode managed in blog.js');
    Assert.contains(blogJs, "document.body.classList.remove('mode-terminal', 'mode-sepia', 'mode-obsidian')", 'Reader modes cleaned up on returning to listing');
    Assert.contains(blogJs, '<code class="inline-code">', 'Inline code parser uses themed inline-code class');

    return 20;
  });

  return {
    passed,
    failed,
    assertions
  };
}

module.exports = { runBlogSpecTests };

if (require.main === module) {
  try {
    const res = runBlogSpecTests();
    console.log(`\nBlog Spec Suite Completed: ${res.passed} tests passed, ${res.failed} failed, ${res.assertions} assertions.\n`);
    process.exit(res.failed === 0 ? 0 : 1);
  } catch (e) {
    console.error('Test Suite Failed:', e);
    process.exit(1);
  }
}
