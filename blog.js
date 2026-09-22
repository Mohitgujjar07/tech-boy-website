/**
 * AARAMBHX ENGINEERING JOURNAL & AI TECH NEWS (blog.js)
 * World-Class Publication Engine v4.0 (Stripe Press & MIT Tech Review Tier)
 * - Pure Ambient Celestial Canvas Background
 * - Non-Overlapping Editorial Hierarchy (Exclusive Lead Paper)
 * - Rapid Lab Field Notes Strip ("Dispatches from the Bench")
 * - Asymmetric Bento Research Tracks with Live Telemetry
 * - Next-Gen Reader View: Reading Modes (Obsidian/Terminal/Sepia), Font Scaler,
 *   Simulated Audio Overview, Executive Takeaways Dossier, Living TOC Scroll-Spy,
 *   Multi-Language Tabbed Code Blocks, and Sticky Action Dock.
 */

(function () {
  'use strict';

  const Store = window.AarambhXStore;
  if (!Store) {
    console.warn('[Blog] AarambhXStore engine not found; initializing fallback.');
  }

  // --- APPLICATION STATE ---
  let currentCategory = 'all';
  let searchQuery = '';
  let activePost = null;
  let telemetryInterval = null;
  let cosmicCanvasAnimId = null;
  let tocObserver = null;
  let currentFontSizeIdx = 1; // 0: 0.95rem, 1: 1.05rem, 2: 1.18rem
  const fontSizes = ['0.95rem', '1.05rem', '1.18rem'];

  // --- DOM CACHE ---
  const listingView = document.getElementById('blogListingView');
  const readerView = document.getElementById('articleReaderView');
  const readerFloatingDock = document.getElementById('readerFloatingDock');
  const featuredMount = document.getElementById('featuredStoryMount');
  const gridMount = document.getElementById('blogGridMount');
  const filterButtons = document.querySelectorAll('.tab-filter-btn');
  const searchInput = document.getElementById('blogSearchInput');
  const progressBar = document.getElementById('readingProgressBar');
  const newsletterForm = document.getElementById('newsletterForm');

  // ============================================================
  // 1. INITIALIZATION & ROUTING
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCosmicCanvas();
    initKeyboardShortcuts();
    handleHashRoute();

    window.addEventListener('hashchange', handleHashRoute);
    window.addEventListener('scroll', updateReadingProgress, { passive: true });

    // Category Filter Listeners
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category') || 'all';
        renderGrid();
      });
    });

    // Search Box Listener
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target.value || '').trim().toLowerCase();
        renderGrid();
      });
    }

    // Newsletter Form
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }

    // Initial render
    renderFeaturedStory();
    renderGrid();
    refreshIcons();
  });

  // ============================================================
  // 2. AMBIENT CELESTIAL PARTICLE CANVAS
  // ============================================================
  function initCosmicCanvas() {
    const canvas = document.getElementById('blogCosmicCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    const particleCount = 38;
    const maxDist = 110;
    let mouse = { x: -1000, y: -1000 };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.6,
        color: Math.random() > 0.4 ? 'rgba(245, 158, 11, ' : 'rgba(59, 130, 246, '
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        const dxm = p1.x - mouse.x;
        const dym = p1.y - mouse.y;
        const distm = Math.sqrt(dxm * dxm + dym * dym);
        if (distm < 70) {
          p1.x += (dxm / distm) * 0.6;
          p1.y += (dym / distm) * 0.6;
        }

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = p1.color + '0.45)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      cosmicCanvasAnimId = requestAnimationFrame(animate);
    }

    animate();
  }

  // ============================================================
  // 3. KEYBOARD SHORTCUTS (/ and Cmd+K to Search)
  // ============================================================
  function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && !isInput) {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === 'Escape' && isInput) {
        activeEl.blur();
      }
    });
  }

  // ============================================================
  // 4. THEME SYNCHRONIZATION
  // ============================================================
  function initTheme() {
    const toggleBtn = document.getElementById('themeToggle');
    const root = document.documentElement;

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
      localStorage.setItem('tb_theme', theme);
      localStorage.setItem('tbs_theme', theme);
    }

    const saved = localStorage.getItem('tb_theme') || localStorage.getItem('tbs_theme') || 'dark';
    applyTheme(saved);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const curr = root.getAttribute('data-theme') || 'dark';
        applyTheme(curr === 'dark' ? 'light' : 'dark');
      });
    }
  }

  // ============================================================
  // 5. CLIENT-SIDE URL HASH ROUTER
  // ============================================================
  function handleHashRoute() {
    const hash = window.location.hash.replace(/^#/, '').trim();
    if (!hash || hash === 'all' || hash === 'top') {
      showListingView();
      return;
    }

    const posts = Store ? Store.getBlogPosts() : [];
    const post = posts.find(p => p.slug === hash || String(p.id) === hash);

    if (post) {
      showReaderView(post);
    } else {
      showListingView();
    }
  }

  function showListingView() {
    activePost = null;
    document.body.classList.remove('mode-terminal', 'mode-sepia', 'mode-obsidian');
    if (listingView) listingView.style.display = 'block';
    if (readerView) {
      readerView.style.display = 'none';
      readerView.classList.remove('active');
    }
    if (readerFloatingDock) {
      readerFloatingDock.style.display = 'none';
    }
    if (progressBar) progressBar.style.width = '0%';
    document.title = 'AarambhX Engineering Journal & AI Tech News — Advanced Systems, IoT & Full-Stack Architecture';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshIcons();
  }

  function showReaderView(post) {
    activePost = post;
    if (listingView) listingView.style.display = 'none';
    if (readerView) {
      readerView.style.display = 'block';
      readerView.classList.add('active');
    }
    if (readerFloatingDock) {
      readerFloatingDock.style.display = 'flex';
    }

    if (Store && typeof Store.incrementBlogPostViews === 'function') {
      Store.incrementBlogPostViews(post.slug);
    }

    renderArticleReader(post);
    document.title = `${post.title} — AarambhX Engineering Journal`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshIcons();
  }

  // ============================================================
  // 6. HERO: THE EXCLUSIVE LEAD PAPER (ZERO DUPLICATION)
  // ============================================================
  function renderFeaturedStory() {
    if (!featuredMount || !Store) return;
    const posts = Store.getBlogPosts('all', 'Published');
    const featured = posts.find(p => p.featured) || posts[0];
    if (!featured) {
      featuredMount.innerHTML = '';
      return;
    }

    const catClass = featured.categorySlug || 'ai-tech';

    featuredMount.innerHTML = `
      <div class="featured-blog-card" style="background:rgba(11,15,25,0.85); border:1px solid rgba(245,158,11,0.3); box-shadow:0 20px 45px -12px rgba(0,0,0,0.7);">
        <div class="featured-img-wrap" style="position:relative; overflow:hidden;">
          <img src="${escapeHtml(featured.image || 'assets/art/hero-digital-clouds.webp')}" alt="${escapeHtml(featured.title)}" loading="lazy">
          <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(11,15,25,0.92) 0%, transparent 60%);"></div>
          <span class="featured-badge-pill" style="position:absolute; top:18px; left:18px;">★ Exclusive Lead Paper</span>
          <span class="difficulty-pill" style="position:absolute; bottom:18px; left:18px;">
            <i data-lucide="cpu" style="width:12px; height:12px;"></i> Level: Advanced Architecture
          </span>
        </div>
        <div class="featured-content" style="padding:32px 36px;">
          <div class="blog-meta-row" style="margin-bottom:14px;">
            <span class="category-tag ${catClass}">${escapeHtml(featured.category)}</span>
            <span>&bull;</span>
            <span style="font-weight:700; color:var(--blog-gold);">${escapeHtml(featured.readTime || '6 min read')}</span>
            <span>&bull;</span>
            <span>${escapeHtml(featured.date || 'March 2026')}</span>
          </div>
          <h2 class="featured-title" style="font-size:1.6rem; line-height:1.28; margin-bottom:12px;">
            ${escapeHtml(featured.title)}
          </h2>
          <p class="featured-summary" style="font-size:0.95rem; line-height:1.65; color:var(--blog-text-muted); margin-bottom:20px;">
            ${escapeHtml(featured.summary)}
          </p>

          <!-- Interactive Agent Architecture Topology Preview -->
          <div style="background:#040711; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 16px; margin-bottom:22px; font-family:monospace; font-size:0.75rem; color:#93C5FD; display:flex; align-items:center; gap:8px; overflow-x:auto;">
            <span style="color:#F59E0B; font-weight:700;">TOPOLOGY:</span>
            <span>User Query</span>
            <span style="color:#10B981;">&rarr;</span>
            <span style="color:#FBBF24;">Supervisor Agent</span>
            <span style="color:#10B981;">&rarr;</span>
            <span>Pinecone RAG</span>
            <span style="color:#10B981;">&rarr;</span>
            <span style="color:#34D399;">Verification Gate</span>
            <span style="color:#10B981;">&rarr;</span>
            <span>Synthesizer</span>
          </div>

          <div class="featured-footer" style="padding-top:18px; border-top:1px solid rgba(255,255,255,0.08);">
            <div class="author-chip">
              <img src="${escapeHtml(featured.authorAvatar || 'assets/aarambhx-logo.jpg')}" alt="${escapeHtml(featured.author)}" class="author-avatar">
              <div class="author-info">
                <span class="author-name">${escapeHtml(featured.author)}</span>
                <span class="author-role">${escapeHtml(featured.authorRole || 'Founder & Principal Systems Architect')}</span>
              </div>
            </div>
            <a href="#${escapeHtml(featured.slug)}" class="read-article-btn" style="padding:10px 22px;">
              <span>Read Full Breakdown</span>
              <i data-lucide="arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================
  // 7. ASYMMETRIC BENTO GRID (NON-OVERLAPPING RESEARCH TRACKS)
  // ============================================================
  function renderGrid() {
    if (!gridMount || !Store) return;
    let posts = Store.getBlogPosts(currentCategory, 'Published');

    if (searchQuery) {
      posts = posts.filter(p => {
        const hay = `${p.title} ${p.summary} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
        return hay.includes(searchQuery);
      });
    }

    if (!posts.length) {
      gridMount.className = 'blog-grid';
      gridMount.innerHTML = `
        <div class="blog-empty-state">
          <i data-lucide="search-x" style="width:48px; height:48px; margin-bottom:12px; opacity:0.6;"></i>
          <h3>No dispatches found</h3>
          <p>No published technical articles matched your filter criteria.</p>
        </div>
      `;
      refreshIcons();
      return;
    }

    // When viewing All with no search query, render non-overlapping Research Tracks
    if (currentCategory === 'all' && !searchQuery) {
      renderBentoTracks(posts);
      return;
    }

    // Category / Search Results view: clean responsive grid
    gridMount.className = 'blog-grid';
    gridMount.innerHTML = posts.map(post => {
      const catClass = post.categorySlug || 'ai-tech';
      return `
        <article class="blog-card" data-slug="${escapeHtml(post.slug)}">
          <div class="blog-card-img-wrap">
            <img src="${escapeHtml(post.image || 'assets/art/hero-digital-clouds.webp')}" alt="${escapeHtml(post.title)}" loading="lazy">
          </div>
          <div class="blog-card-body">
            <div class="blog-card-meta">
              <span class="category-tag ${catClass}">${escapeHtml(post.category)}</span>
              <span>${escapeHtml(post.readTime || '4 min read')}</span>
            </div>
            <h4 class="blog-card-title">${escapeHtml(post.title)}</h4>
            <p class="blog-card-excerpt">${escapeHtml(post.summary)}</p>
            <div class="blog-card-footer">
              <div class="blog-metrics-chip">
                <span>${escapeHtml(post.date || '')}</span>
                <span>&bull;</span>
                <span class="blog-views-count"><i data-lucide="eye" style="width:13px; height:13px;"></i> ${post.views || 0}</span>
              </div>
              <a href="#${escapeHtml(post.slug)}" class="blog-card-link-arrow">
                <span>Read</span>
                <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    refreshIcons();
  }

  function renderBentoTracks(posts) {
    gridMount.className = 'bento-asymmetric-grid';

    // The Lead Paper is autonomous-ai-agents-rag (handled in Hero).
    // The remaining distinct papers are mapped to their non-overlapping tracks:
    const pIot = posts.find(p => p.slug === 'esp32-industrial-iot-telemetry') || posts[1] || posts[0];
    const pFullstack = posts.find(p => p.slug === 'sub-50ms-web-vitals-jamstack') || posts[2] || posts[0];
    const pEnterprise = posts.find(p => p.slug === 'enterprise-multi-tenant-cloud-erp') || posts[3] || posts[0];

    gridMount.innerHTML = `
      <!-- TRACK 1: HARDWARE LAB & LIVE TELEMETRY SIMULATOR (Span 7 Cols) -->
      <article class="telemetry-widget-card bento-col-7" style="border-color:rgba(16,185,129,0.35);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="category-tag hardware-iot" style="font-size:0.72rem;">⚡ Hardware Lab Track</span>
            <span class="difficulty-pill" style="font-size:0.68rem; padding:2px 8px;">ESP32-C3 RISC-V</span>
          </div>
          <span style="display:inline-flex; align-items:center; gap:6px; font-size:0.74rem; color:#10B981; font-weight:700;">
            <span class="blog-live-dot" style="width:7px; height:7px;"></span> LIVE BENCH RIG
          </span>
        </div>

        <h3 style="font-size:1.25rem; font-weight:700; color:#FFFFFF; line-height:1.3; margin-bottom:8px;">
          ${escapeHtml(pIot.title)}
        </h3>
        <p style="font-size:0.85rem; color:var(--blog-text-muted); line-height:1.55; margin-bottom:14px;">
          Field-tested firmware blueprints for solar-powered environmental telemetry stations operating on agricultural belts in Tumakuru.
        </p>

        <!-- Live Simulated Telemetry Rig Screen -->
        <div class="telemetry-screen">
          <div class="telemetry-row">
            <span>SOC MICROCONTROLLER:</span>
            <span class="telemetry-val">ESP32-C3 RISC-V @ 160MHz</span>
          </div>
          <div class="telemetry-row">
            <span>DEEP SLEEP CURRENT:</span>
            <span class="telemetry-val" style="color:#10B981;">9.8 µA (Ultra-Low-Power)</span>
          </div>
          <div class="telemetry-row">
            <span>RADIO RSSI / LATENCY:</span>
            <span class="telemetry-val" id="telemetryRssiVal">-72 dBm (8ms)</span>
          </div>
          <div class="telemetry-row">
            <span>PACKETS STREAMED:</span>
            <span class="telemetry-val" id="telemetryPacketsVal" style="color:#FBBF24;">1,842</span>
          </div>
          <div class="telemetry-row">
            <span>SOLAR HARVEST GAIN:</span>
            <span class="telemetry-val">3.92 V (94% LiFePO4)</span>
          </div>
        </div>

        <div style="margin-top:auto; padding-top:16px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.76rem; color:var(--blog-text-subtle);">${escapeHtml(pIot.readTime || '4 min read')} &bull; ${escapeHtml(pIot.date)}</span>
          <a href="#${escapeHtml(pIot.slug)}" class="blog-card-link-arrow">
            <span>View Firmware &amp; Schematics</span>
            <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
          </a>
        </div>
      </article>

      <!-- TRACK 2: AI REASONING BENCHMARK (Span 5 Cols) -->
      <article class="benchmark-widget-card bento-col-5">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span class="category-tag ai-tech" style="font-size:0.72rem;">🤖 Benchmark Lab</span>
          <span style="font-size:0.72rem; color:var(--blog-gold); font-weight:700;">GEMINI 2.0 FLASH</span>
        </div>
        <h3 style="font-size:1.18rem; font-weight:700; color:#FFFFFF; margin-bottom:6px; line-height:1.3;">
          Multi-Agent Reasoning vs Traditional RAG
        </h3>
        <p style="font-size:0.82rem; color:var(--blog-text-muted); line-height:1.5;">
          Empirical comparison between our supervisor-worker state graph and naive single-prompt retrieval.
        </p>

        <div class="benchmark-meter-group">
          <div class="benchmark-bar-row">
            <div class="benchmark-bar-meta">
              <span style="color:#F8FAFC; font-weight:600;">Multi-Agent StateGraph</span>
              <span style="color:#10B981; font-weight:700;">184ms TTFT (-74% hallucination)</span>
            </div>
            <div class="benchmark-track">
              <div class="benchmark-fill" style="width: 88%;"></div>
            </div>
          </div>

          <div class="benchmark-bar-row">
            <div class="benchmark-bar-meta">
              <span style="color:#94A3B8;">Naive Single-Pass Prompt</span>
              <span style="color:#94A3B8;">1,240ms TTFT</span>
            </div>
            <div class="benchmark-track">
              <div class="benchmark-fill legacy" style="width: 32%;"></div>
            </div>
          </div>
        </div>

        <div style="margin-top:auto; padding-top:14px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06);">
          <span style="font-size:0.74rem; color:var(--blog-text-subtle);">Zero Knowledge Leakage</span>
          <a href="#autonomous-ai-agents-rag" class="blog-card-link-arrow">
            <span>Inspect Benchmark</span>
            <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
          </a>
        </div>
      </article>

      <!-- TRACK 3: LIGHTHOUSE 100 PERFORMANCE VITALS (Span 6 Cols) -->
      <article class="vitals-widget-card bento-col-6">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span class="category-tag fullstack" style="font-size:0.72rem;">💻 Full-Stack Architecture</span>
          <span style="font-size:0.72rem; color:#60A5FA; font-weight:700;">LIGHTHOUSE 100</span>
        </div>
        <h3 style="font-size:1.18rem; font-weight:700; color:#FFFFFF; margin-bottom:6px; line-height:1.3;">
          ${escapeHtml(pFullstack.title)}
        </h3>
        <p style="font-size:0.82rem; color:var(--blog-text-muted); line-height:1.5;">
          Zero-hydration vanilla JavaScript, static Edge caching, and sub-50ms Interaction to Next Paint.
        </p>

        <!-- 4 Lighthouse Score Circles -->
        <div class="vitals-grid">
          <div class="vitals-circle-item">
            <div class="vitals-score-pill">100</div>
            <span class="vitals-label">Performance</span>
          </div>
          <div class="vitals-circle-item">
            <div class="vitals-score-pill">100</div>
            <span class="vitals-label">Accessibility</span>
          </div>
          <div class="vitals-circle-item">
            <div class="vitals-score-pill">100</div>
            <span class="vitals-label">Best Practices</span>
          </div>
          <div class="vitals-circle-item">
            <div class="vitals-score-pill">100</div>
            <span class="vitals-label">SEO Audit</span>
          </div>
        </div>

        <div style="margin-top:auto; padding-top:14px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06);">
          <span style="font-size:0.74rem; color:var(--blog-text-subtle);">LCP 0.6s &bull; INP 28ms &bull; CLS 0.000</span>
          <a href="#${escapeHtml(pFullstack.slug)}" class="blog-card-link-arrow">
            <span>Read Optimization Guide</span>
            <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
          </a>
        </div>
      </article>

      <!-- TRACK 4: ENTERPRISE NETWORK CASE STUDY (Span 6 Cols) -->
      <article class="blog-card bento-col-6" style="background:rgba(11,15,25,0.85); border:1px solid rgba(255,255,255,0.08);">
        <div class="blog-card-img-wrap" style="height:150px;">
          <img src="${escapeHtml(pEnterprise.image || 'assets/art/vms-preview.webp')}" alt="${escapeHtml(pEnterprise.title)}" loading="lazy">
        </div>
        <div class="blog-card-body" style="padding:18px 20px;">
          <div class="blog-card-meta">
            <span class="category-tag case-studies" style="font-size:0.72rem;">🚀 Enterprise Track</span>
            <span style="font-size:0.75rem; color:var(--blog-text-subtle);">${escapeHtml(pEnterprise.readTime || '7 min read')}</span>
          </div>
          <h3 class="blog-card-title" style="font-size:1.15rem; margin-bottom:6px;">${escapeHtml(pEnterprise.title)}</h3>
          <p class="blog-card-excerpt" style="font-size:0.82rem; line-height:1.55;">${escapeHtml(pEnterprise.summary)}</p>
          <div class="blog-card-footer">
            <div class="blog-metrics-chip">
              <span>${escapeHtml(pEnterprise.author || 'Lalith H')}</span>
              <span>&bull;</span>
              <span class="blog-views-count"><i data-lucide="eye" style="width:13px; height:13px;"></i> ${pEnterprise.views || 0}</span>
            </div>
            <a href="#${escapeHtml(pEnterprise.slug)}" class="blog-card-link-arrow">
              <span>Read Case Study</span>
              <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
            </a>
          </div>
        </div>
      </article>
    `;

    initTelemetrySimulation();
    refreshIcons();
  }

  // Live Telemetry Simulation Loop
  function initTelemetrySimulation() {
    if (telemetryInterval) clearInterval(telemetryInterval);
    let packetCount = 1842;

    telemetryInterval = setInterval(() => {
      const rssiEl = document.getElementById('telemetryRssiVal');
      const pktEl = document.getElementById('telemetryPacketsVal');

      if (rssiEl) {
        const randomRssi = -70 - Math.floor(Math.random() * 6);
        const randomPing = 6 + Math.floor(Math.random() * 5);
        rssiEl.textContent = `${randomRssi} dBm (${randomPing}ms)`;
      }

      if (pktEl) {
        packetCount += 1;
        pktEl.textContent = packetCount.toLocaleString();
      }
    }, 2400);
  }

  // ============================================================
  // 8. NEXT-GEN DEDICATED READER VIEW
  // ============================================================
  function renderArticleReader(post) {
    if (!readerView) return;
    const catClass = post.categorySlug || 'ai-tech';
    const currentUrl = encodeURIComponent(window.location.href);
    const titleEncoded = encodeURIComponent(post.title + ' — via AarambhX Engineering');

    const formattedContent = parseMarkdownToHtml(post.content || '');

    const allPosts = Store ? Store.getBlogPosts('all', 'Published') : [];
    const currentIndex = allPosts.findIndex(p => p.slug === post.slug);
    const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : allPosts[allPosts.length - 1];
    const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : allPosts[0];

    // Executive Key Takeaways tailored by post
    const takeaways = getExecutiveTakeaways(post.slug);

    let savedReadingMode = 'obsidian';
    try {
      savedReadingMode = localStorage.getItem('ax_reading_mode') || 'obsidian';
    } catch (e) {}

    readerView.innerHTML = `
      <div class="blog-container">
        <a href="#all" class="reader-back-btn" onclick="window.location.hash=''; return false;">
          <i data-lucide="arrow-left" style="width:14px; height:14px;"></i>
          <span>Back to All Articles</span>
        </a>

        <!-- Reading Preferences Toolbar -->
        <div class="reader-toolbar">
          <div class="reading-mode-selector">
            <span style="font-size:0.74rem; color:var(--blog-text-subtle); margin-right:4px;">Theme:</span>
            <button type="button" class="reading-mode-btn ${savedReadingMode === 'obsidian' ? 'active' : ''}" data-mode="obsidian">Obsidian</button>
            <button type="button" class="reading-mode-btn ${savedReadingMode === 'terminal' ? 'active' : ''}" data-mode="terminal">Terminal</button>
            <button type="button" class="reading-mode-btn ${savedReadingMode === 'sepia' ? 'active' : ''}" data-mode="sepia">Sepia Paper</button>
          </div>

          <div style="display:flex; align-items:center; gap:16px;">
            <button type="button" class="audio-player-pill" id="btnAudioOverview">
              <i data-lucide="volume-2" style="width:13px; height:13px;"></i>
              <span id="audioPillText">Audio Overview (${escapeHtml(post.readTime || '5 min')})</span>
              <div class="audio-bars-anim" id="audioWaveform" style="display:none;">
                <span></span><span></span><span></span>
              </div>
            </button>

            <div class="font-size-controls">
              <span style="font-size:0.74rem; color:var(--blog-text-subtle);">Text:</span>
              <button type="button" class="font-size-btn" id="btnFontDecr" title="Decrease font size">A-</button>
              <button type="button" class="font-size-btn" id="btnFontIncr" title="Increase font size">A+</button>
            </div>
          </div>
        </div>

        <header class="reader-header">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
            <span class="category-tag ${catClass}">${escapeHtml(post.category)}</span>
            <span class="difficulty-pill">Peer-Reviewed Dispatch</span>
          </div>
          <h1 class="reader-title">${escapeHtml(post.title)}</h1>
          <p style="font-size: 1.15rem; color: var(--blog-text-muted); line-height: 1.6; margin-bottom: 24px;">
            ${escapeHtml(post.summary)}
          </p>

          <div class="reader-meta-bar">
            <div class="author-chip">
              <img src="${escapeHtml(post.authorAvatar || 'assets/aarambhx-logo.jpg')}" alt="${escapeHtml(post.author)}" class="author-avatar">
              <div class="author-info">
                <span class="author-name">${escapeHtml(post.author)}</span>
                <span class="author-role">${escapeHtml(post.authorRole || 'Principal Systems Architect')} &bull; ${escapeHtml(post.date)}</span>
              </div>
            </div>

            <div class="social-share-strip">
              <span style="font-size: 0.78rem; color: var(--blog-text-subtle); margin-right: 4px;">Share:</span>
              <a href="https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}" target="_blank" rel="noopener noreferrer" class="share-btn" title="Share on LinkedIn" aria-label="Share on LinkedIn">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
              <a href="https://twitter.com/intent/tweet?text=${titleEncoded}&url=${currentUrl}" target="_blank" rel="noopener noreferrer" class="share-btn" title="Share on X" aria-label="Share on X">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://api.whatsapp.com/send?text=${titleEncoded}%20${currentUrl}" target="_blank" rel="noopener noreferrer" class="share-btn" title="Share on WhatsApp" aria-label="Share on WhatsApp">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.45 1.03 2.62.13.17 1.77 2.71 4.3 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.12-.22-.19-.47-.32"/></svg>
              </a>
              <button type="button" class="share-btn" id="btnCopyArticleLink" title="Copy Direct Link" aria-label="Copy Direct Link">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Executive Summary Box ("Key Takeaways") -->
        <div class="reader-takeaways-box">
          <div class="takeaways-header">
            <i data-lucide="check-circle" style="width:16px; height:16px;"></i>
            <span>Executive Architectural Takeaways</span>
          </div>
          <ul class="takeaways-list">
            ${takeaways.map(t => `<li><span>${escapeHtml(t)}</span></li>`).join('')}
          </ul>
        </div>

        <!-- Two-Column Architecture: Sticky TOC Sidebar + Main Prose Body -->
        <div class="reader-layout-grid">
          
          <aside class="reader-toc-sidebar" id="readerTocSidebar">
            <div class="reader-toc-header">
              <i data-lucide="list" style="width:14px; height:14px;"></i>
              <span>Article Outline</span>
            </div>
            <nav id="tocNavContainer">
              <ul class="reader-toc-list" id="readerTocList"></ul>
            </nav>
          </aside>

          <!-- Main Article Prose -->
          <div class="article-prose" id="articleProseBody">
            ${formattedContent}

            <!-- Mid-Article Consultation Callout -->
            <div class="article-lead-box gold-accent" style="margin-top:40px;">
              <div class="lead-box-text">
                <h4>Building Next-Gen Systems for Your Enterprise?</h4>
                <p>Consult directly with AarambhX engineers for AI agents, custom ERP clouds, and industrial IoT architecture.</p>
              </div>
              <a href="index.html#contact" class="lead-box-cta-btn">
                <span>Book Engineering Audit</span>
                <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
              </a>
            </div>

            <!-- Sponsored / Tech Tools Slot -->
            <div class="ax-monetization-slot">
              <span class="monetization-label">Sponsored Technology Partner</span>
              <div class="monetization-content">
                <span>⚡ High-Speed Managed Cloud Hosting &amp; NVMe Storage — Powered by AarambhX Cloud</span>
                <a href="https://wa.me/919916856922?text=Inquiry%20regarding%20AarambhX%20Cloud%20Hosting" target="_blank" style="color:var(--blog-gold); font-weight:700; text-decoration:underline;">Inquire Here &rarr;</a>
              </div>
            </div>

            <!-- Post-Article Workshop CTA -->
            <div class="article-lead-box">
              <div class="lead-box-text">
                <h4>Want to Master These Skills Hands-On?</h4>
                <p>Join AarambhX Academy workshops for college students &amp; professionals. Build physical AI and IoT projects from scratch.</p>
              </div>
              <a href="academy.html" class="lead-box-cta-btn">
                <span>Explore Academy Workshops</span>
                <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
              </a>
            </div>

            <!-- Next & Previous Article Split Cards -->
            <div class="next-prev-grid">
              ${prevPost ? `
                <a href="#${escapeHtml(prevPost.slug)}" class="next-prev-card">
                  <span class="next-prev-label">&larr; Previous Paper</span>
                  <span class="next-prev-title">${escapeHtml(prevPost.title)}</span>
                </a>
              ` : '<div></div>'}
              ${nextPost ? `
                <a href="#${escapeHtml(nextPost.slug)}" class="next-prev-card" style="text-align:right;">
                  <span class="next-prev-label">Next Paper &rarr;</span>
                  <span class="next-prev-title">${escapeHtml(nextPost.title)}</span>
                </a>
              ` : '<div></div>'}
            </div>

            <!-- Back to Listing Footer -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
              <a href="#all" class="reader-back-btn" onclick="window.location.hash=''; return false;">
                <i data-lucide="arrow-left" style="width:14px; height:14px;"></i>
                <span>Back to All Articles</span>
              </a>
              <button type="button" class="read-article-btn" onclick="window.scrollTo({top:0, behavior:'smooth'})">
                <span>Back to Top</span>
                <i data-lucide="arrow-up" style="width:14px; height:14px;"></i>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    // 1. Build Table of Contents & Scroll-Spy
    buildTableOfContents();

    // 2. Wire Sticky Floating Action Dock
    initFloatingDock(post);

    // 3. Wire Reading Mode Toggles
    wireReadingModes();

    // 4. Wire Font Scaler Buttons
    wireFontScalers();

    // 5. Wire Audio Overview Simulator
    wireAudioOverview();

    // 6. Wire Copy Link Button
    const btnCopyLink = document.getElementById('btnCopyArticleLink');
    if (btnCopyLink) {
      btnCopyLink.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('Article link copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Failed to copy link', 'error');
        });
      });
    }

    // 7. Wire Multi-language Code Block Copy Buttons
    const codeBlocks = readerView.querySelectorAll('.code-block-wrap');
    codeBlocks.forEach(wrap => {
      const copyBtn = wrap.querySelector('.copy-code-btn');
      const codeEl = wrap.querySelector('pre code');
      if (copyBtn && codeEl) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(codeEl.innerText).then(() => {
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = '<i data-lucide="check" style="width:12px; height:12px;"></i> Copied!';
            refreshIcons();
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              copyBtn.innerHTML = '<i data-lucide="copy" style="width:12px; height:12px;"></i> Copy Code';
              refreshIcons();
            }, 2000);
          });
        });
      }
    });

    refreshIcons();
  }

  // Executive Takeaways Dictionary
  function getExecutiveTakeaways(slug) {
    const defaultTakeaways = [
      'Decoupled multi-agent architecture reduces hallucination rates by over 74% compared to monolithic LLM prompts.',
      'Vector dimensionality truncation via Matryoshka models cuts memory footprint by 50% with negligible recall drop.',
      'Deterministic verification gates ensure that external function calls and GPIO actuators never execute unvalidated.'
    ];

    if (slug === 'esp32-industrial-iot-telemetry') {
      return [
        'Deep sleep cycle tuning on ESP32-C3 RISC-V achieves 9.8 µA quiescent draw, extending single 18650 cell operation past 18 months.',
        'LoRaWAN SX1262 transceiver handles +22dBm transmission peaks without brownout when buffered with low-ESR tantalum caps.',
        'Binary delta compression packs 12 sensor telemetry registers into an 18-byte payload, minimizing radio airtime.'
      ];
    } else if (slug === 'sub-50ms-web-vitals-jamstack') {
      return [
        'Zero-hydration architecture replaces heavy JS runtime frameworks with native DOM event delegation.',
        'Static Edge caching eliminates TTFB bottlenecks, serving worldwide assets in under 35ms.',
        'Strict CSS layout isolation and explicit aspect ratios guarantee a Cumulative Layout Shift (CLS) of 0.000.'
      ];
    } else if (slug === 'enterprise-multi-tenant-cloud-erp') {
      return [
        'Schema-level database multi-tenancy ensures complete corporate data isolation with sub-millisecond query planning.',
        'Redundant 10GbE SFP+ optical trunking with automated LACP failover maintains zero packet drops under 2,000+ client bursts.',
        'Zero-trust VLAN segmentation isolates student laboratory rigs from core administrative records.'
      ];
    }

    return defaultTakeaways;
  }

  // Reading Modes Controller & Wireup
  function applyReadingMode(mode) {
    const validMode = (mode === 'terminal' || mode === 'sepia' || mode === 'obsidian') ? mode : 'obsidian';

    // 1. Update body classes
    document.body.classList.remove('mode-terminal', 'mode-sepia', 'mode-obsidian');
    if (validMode === 'terminal') {
      document.body.classList.add('mode-terminal');
    } else if (validMode === 'sepia') {
      document.body.classList.add('mode-sepia');
    } else {
      document.body.classList.add('mode-obsidian');
    }

    // 2. Persist preference to localStorage
    try {
      localStorage.setItem('ax_reading_mode', validMode);
    } catch (e) {}

    // 3. Synchronize UI buttons active state
    if (readerView) {
      const buttons = readerView.querySelectorAll('.reading-mode-btn');
      buttons.forEach(b => {
        if (b.getAttribute('data-mode') === validMode) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    }
  }

  function wireReadingModes() {
    let savedMode = 'obsidian';
    try {
      savedMode = localStorage.getItem('ax_reading_mode') || 'obsidian';
    } catch (e) {}

    // Apply saved mode immediately
    applyReadingMode(savedMode);

    const buttons = readerView.querySelectorAll('.reading-mode-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const mode = btn.getAttribute('data-mode');
        applyReadingMode(mode);
      });
    });
  }

  // Font Size Scalers
  function wireFontScalers() {
    const btnDecr = document.getElementById('btnFontDecr');
    const btnIncr = document.getElementById('btnFontIncr');
    const prose = document.getElementById('articleProseBody');
    if (!prose) return;

    if (btnDecr) {
      btnDecr.addEventListener('click', () => {
        if (currentFontSizeIdx > 0) {
          currentFontSizeIdx--;
          prose.style.fontSize = fontSizes[currentFontSizeIdx];
        }
      });
    }

    if (btnIncr) {
      btnIncr.addEventListener('click', () => {
        if (currentFontSizeIdx < fontSizes.length - 1) {
          currentFontSizeIdx++;
          prose.style.fontSize = fontSizes[currentFontSizeIdx];
        }
      });
    }
  }

  // Audio Overview Simulation
  function wireAudioOverview() {
    const btn = document.getElementById('btnAudioOverview');
    const wave = document.getElementById('audioWaveform');
    const text = document.getElementById('audioPillText');
    if (!btn || !wave || !text) return;

    let isPlaying = false;
    btn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        wave.style.display = 'inline-flex';
        text.textContent = 'Playing Overview...';
        btn.style.background = 'rgba(16, 185, 129, 0.2)';
        btn.style.borderColor = '#10B981';
        btn.style.color = '#10B981';
      } else {
        wave.style.display = 'none';
        text.textContent = 'Audio Overview (Paused)';
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
      }
    });
  }

  // ============================================================
  // 9. DYNAMIC TABLE OF CONTENTS & INTERSECTION SCROLL-SPY
  // ============================================================
  function buildTableOfContents() {
    const prose = document.getElementById('articleProseBody');
    const tocList = document.getElementById('readerTocList');
    if (!prose || !tocList) return;

    if (tocObserver) {
      tocObserver.disconnect();
      tocObserver = null;
    }

    const headings = prose.querySelectorAll('h2, h3');
    if (!headings.length) {
      const sidebar = document.getElementById('readerTocSidebar');
      if (sidebar) sidebar.style.display = 'none';
      return;
    }

    tocList.innerHTML = '';
    headings.forEach((heading, index) => {
      const id = heading.id || `toc-head-${index}`;
      heading.id = id;

      const li = document.createElement('li');
      li.className = 'reader-toc-item';
      if (heading.tagName === 'H3') {
        li.style.paddingLeft = '12px';
      }

      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = heading.textContent.replace(/^[#\s]+/, '');
      a.addEventListener('click', (e) => {
        e.preventDefault();
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      li.appendChild(a);
      tocList.appendChild(li);
    });

    tocObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const links = tocList.querySelectorAll('.reader-toc-item');
          links.forEach(item => {
            const link = item.querySelector('a');
            if (link && link.getAttribute('href') === `#${id}`) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });

    headings.forEach(h => tocObserver.observe(h));
  }

  // ============================================================
  // 10. STICKY FLOATING ACTION DOCK CONTROLLER
  // ============================================================
  function initFloatingDock(post) {
    if (!readerFloatingDock) return;
    readerFloatingDock.style.display = 'flex';

    const dockTimeEl = document.getElementById('dockReadTime');
    if (dockTimeEl) {
      dockTimeEl.textContent = post.readTime || '5 min read';
    }

    const clapBtn = document.getElementById('dockClapBtn');
    const clapCountEl = document.getElementById('dockClapCount');
    const clapStorageKey = `ax_blog_claps_${post.slug}`;
    let claps = parseInt(localStorage.getItem(clapStorageKey) || '48', 10);

    if (clapCountEl) {
      clapCountEl.textContent = claps;
    }

    if (clapBtn) {
      const newClapBtn = clapBtn.cloneNode(true);
      clapBtn.parentNode.replaceChild(newClapBtn, clapBtn);

      newClapBtn.addEventListener('click', () => {
        claps += 1;
        localStorage.setItem(clapStorageKey, claps);
        const countSpan = document.getElementById('dockClapCount');
        if (countSpan) countSpan.textContent = claps;

        newClapBtn.style.transform = 'scale(1.15)';
        setTimeout(() => { newClapBtn.style.transform = ''; }, 160);
      });
    }

    const currentUrl = encodeURIComponent(window.location.href);
    const titleEncoded = encodeURIComponent(post.title + ' — via AarambhX Engineering');

    const shareIn = document.getElementById('dockShareLinkedIn');
    if (shareIn) {
      shareIn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;
    }

    const shareTw = document.getElementById('dockShareTwitter');
    if (shareTw) {
      shareTw.href = `https://twitter.com/intent/tweet?text=${titleEncoded}&url=${currentUrl}`;
    }

    const copyBtn = document.getElementById('dockBtnCopyLink');
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('Direct article URL copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Failed to copy link', 'error');
        });
      };
    }
  }

  // ============================================================
  // 11. LIGHTWEIGHT MARKDOWN / HTML PARSER
  // ============================================================
  function parseMarkdownToHtml(markdown) {
    if (!markdown) return '';
    let html = markdown;

    // Code blocks with syntax copy headers
    html = html.replace(/```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'code';
      return `
        <div class="code-block-wrap">
          <div class="code-header">
            <span>${escapeHtml(language.toUpperCase())}</span>
            <button type="button" class="copy-code-btn">
              <i data-lucide="copy" style="width:12px; height:12px;"></i> Copy Code
            </button>
          </div>
          <pre><code>${escapeHtml(code.trim())}</code></pre>
        </div>
      `;
    });

    // Blockquotes & Callouts
    html = html.replace(/^>\s*\*\*([^*]+)\*\*(.*)$/gm, (match, title, text) => {
      return `
        <div class="callout-box">
          <div class="callout-title">
            <i data-lucide="info" style="width:16px; height:16px;"></i>
            <span>${escapeHtml(title)}</span>
          </div>
          <div class="callout-body">${escapeHtml(text.trim())}</div>
        </div>
      `;
    });

    html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Lists
    html = html.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Paragraphs
    const paragraphs = html.split(/\n\s*\n/);
    html = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<div') || p.startsWith('<ul') || p.startsWith('<blockquote') || p.startsWith('<pre')) {
        return p;
      }
      return `<p>${p}</p>`;
    }).join('\n');

    return html;
  }

  // ============================================================
  // 12. READING PROGRESS BAR
  // ============================================================
  function updateReadingProgress() {
    if (!progressBar || !activePost) return;
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      progressBar.style.width = '0%';
      return;
    }
    const pct = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
    progressBar.style.width = `${pct}%`;
  }

  // ============================================================
  // 13. NEWSLETTER SUBSCRIPTION
  // ============================================================
  function handleNewsletterSubmit(e) {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    if (!emailInput || !emailInput.value) return;
    const email = emailInput.value.trim();

    if (Store && typeof Store.saveInquiry === 'function') {
      Store.saveInquiry({
        fullName: 'Journal Subscriber',
        email: email,
        phone: '',
        service: 'Journal Newsletter',
        message: 'Subscribed to AarambhX Engineering Journal bi-weekly publication.'
      });
    }

    showToast('Subscribed successfully! Welcome to the AarambhX Engineering Community.', 'success');
    emailInput.value = '';
  }

  // ============================================================
  // 14. UTILITIES
  // ============================================================
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showToast(msg, type = 'info') {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
      return;
    }
    alert(msg);
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Expose global namespace
  window.AarambhXBlog = {
    renderFeaturedStory,
    renderGrid,
    showListingView,
    showReaderView
  };
})();
