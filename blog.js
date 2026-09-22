/**
 * AARAMBHX ENGINEERING JOURNAL & AI TECH NEWS (blog.js)
 * Client-Side Publication Engine, Real-Time Filtering,
 * Zero-Lag Hash Deep-Linking, and Article Reader View v3.0
 */

(function () {
  'use strict';

  const Store = window.AarambhXStore;
  if (!Store) {
    console.error('[Blog] AarambhXStore engine not found.');
  }

  // --- APPLICATION STATE ---
  let currentCategory = 'all';
  let searchQuery = '';
  let activePost = null;

  // --- DOM CACHE ---
  const listingView = document.getElementById('blogListingView');
  const readerView = document.getElementById('articleReaderView');
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
  // 2. THEME SYNCHRONIZATION
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
  // 3. CLIENT-SIDE URL HASH ROUTER
  // ============================================================
  function handleHashRoute() {
    const hash = window.location.hash.replace(/^#/, '').trim();
    if (!hash || hash === 'all' || hash === 'top') {
      showListingView();
      return;
    }

    // Look up post in store
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
    if (listingView) listingView.style.display = 'block';
    if (readerView) {
      readerView.style.display = 'none';
      readerView.classList.remove('active');
    }
    if (progressBar) progressBar.style.width = '0%';
    document.title = 'AarambhX Engineering Journal & AI Tech News';
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

    // Increment View Counter
    if (Store && typeof Store.incrementBlogPostViews === 'function') {
      Store.incrementBlogPostViews(post.slug);
    }

    renderArticleReader(post);
    document.title = `${post.title} — AarambhX Engineering Journal`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshIcons();
  }

  // ============================================================
  // 4. HERO FEATURED STORY RENDERER
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
      <div class="featured-blog-card">
        <div class="featured-img-wrap">
          <img src="${escapeHtml(featured.image || 'assets/art/hero-digital-clouds.webp')}" alt="${escapeHtml(featured.title)}" loading="lazy">
          <span class="featured-badge-pill">★ Featured Analysis</span>
        </div>
        <div class="featured-content">
          <div class="blog-meta-row">
            <span class="category-tag ${catClass}">${escapeHtml(featured.category)}</span>
            <span>&bull;</span>
            <span>${escapeHtml(featured.readTime || '5 min read')}</span>
            <span>&bull;</span>
            <span>${escapeHtml(featured.date || 'March 2026')}</span>
          </div>
          <h3 class="featured-title">${escapeHtml(featured.title)}</h3>
          <p class="featured-summary">${escapeHtml(featured.summary)}</p>
          <div class="featured-footer">
            <div class="author-chip">
              <img src="${escapeHtml(featured.authorAvatar || 'assets/aarambhx-logo.jpg')}" alt="${escapeHtml(featured.author)}" class="author-avatar">
              <div class="author-info">
                <span class="author-name">${escapeHtml(featured.author)}</span>
                <span class="author-role">${escapeHtml(featured.authorRole || 'Engineering Team')}</span>
              </div>
            </div>
            <a href="#${escapeHtml(featured.slug)}" class="read-article-btn">
              <span>Read Full Breakdown</span>
              <i data-lucide="arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================
  // 5. BENTO ARTICLE GRID RENDERER
  // ============================================================
  function renderGrid() {
    if (!gridMount || !Store) return;
    let posts = Store.getBlogPosts(currentCategory, 'Published');

    // Filter by search query if present
    if (searchQuery) {
      posts = posts.filter(p => {
        const hay = `${p.title} ${p.summary} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
        return hay.includes(searchQuery);
      });
    }

    if (!posts.length) {
      gridMount.innerHTML = `
        <div class="blog-empty-state">
          <i data-lucide="search-x" style="width:48px; height:48px; margin-bottom:12px; opacity:0.6;"></i>
          <h3>No articles found</h3>
          <p>No published technical articles matched your filter criteria.</p>
        </div>
      `;
      refreshIcons();
      return;
    }

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

  // ============================================================
  // 6. DEDICATED READER VIEW RENDERER
  // ============================================================
  function renderArticleReader(post) {
    if (!readerView) return;
    const catClass = post.categorySlug || 'ai-tech';
    const currentUrl = encodeURIComponent(window.location.href);
    const titleEncoded = encodeURIComponent(post.title + ' — via AarambhX Engineering');

    const formattedContent = parseMarkdownToHtml(post.content || '');

    readerView.innerHTML = `
      <div class="blog-container">
        <a href="#all" class="reader-back-btn" onclick="window.location.hash=''; return false;">
          <i data-lucide="arrow-left" style="width:14px; height:14px;"></i>
          <span>Back to All Articles</span>
        </a>

        <header class="reader-header">
          <span class="category-tag ${catClass}" style="margin-bottom:12px;">${escapeHtml(post.category)}</span>
          <h1 class="reader-title">${escapeHtml(post.title)}</h1>
          <p style="font-size: 1.15rem; color: var(--blog-text-muted); line-height: 1.6; margin-bottom: 24px;">
            ${escapeHtml(post.summary)}
          </p>

          <div class="reader-meta-bar">
            <div class="author-chip">
              <img src="${escapeHtml(post.authorAvatar || 'assets/aarambhx-logo.jpg')}" alt="${escapeHtml(post.author)}" class="author-avatar">
              <div class="author-info">
                <span class="author-name">${escapeHtml(post.author)}</span>
                <span class="author-role">${escapeHtml(post.authorRole || 'Systems Architect')} &bull; ${escapeHtml(post.date)}</span>
              </div>
            </div>

            <!-- Social Sharing Links -->
            <div class="social-share-strip">
              <span style="font-size: 0.78rem; color: var(--blog-text-subtle); margin-right: 4px;">Share:</span>
              <a href="https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}" target="_blank" rel="noopener noreferrer" class="share-btn" title="Share on LinkedIn" aria-label="Share on LinkedIn">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
              <a href="https://twitter.com/intent/tweet?text=${titleEncoded}&url=${currentUrl}" target="_blank" rel="noopener noreferrer" class="share-btn" title="Share on X (Twitter)" aria-label="Share on X">
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

        <!-- Main Article Prose -->
        <div class="article-prose">
          ${formattedContent}

          <!-- Mid-Article Lead Magnet / Consultation CTA -->
          <div class="article-lead-box gold-accent">
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
        </div>

        <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
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
    `;

    // Wire Copy Link Button
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

    // Wire Code Block Copy Buttons
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

  // ============================================================
  // 7. LIGHTWEIGHT MARKDOWN / HTML PARSER
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
          <div style="font-size:0.92rem; color:var(--blog-text-muted); line-height:1.6;">${escapeHtml(text.trim())}</div>
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
    html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-family:monospace; font-size:0.88em; color:#FBBF24;">$1</code>');

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
  // 8. READING PROGRESS BAR
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
  // 9. NEWSLETTER SUBSCRIPTION
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
  // 10. UTILITIES
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
