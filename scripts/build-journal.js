/**
 * AarambhX Engineering Journal Static Generator (scripts/build-journal.js)
 * Pre-renders SEO-optimised static HTML pages for every published article in /journal/<slug>.html
 * and generates a complete sitemap.xml for Google crawler & Google AdSense discovery.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const JOURNAL_DIR = path.join(ROOT_DIR, 'journal');
const SITEMAP_PATH = path.join(ROOT_DIR, 'sitemap.xml');

// Mock localStorage and window sandbox to load admin-store.js in Node
const memStorage = {};
global.localStorage = {
  getItem: (key) => (key in memStorage ? memStorage[key] : null),
  setItem: (key, val) => { memStorage[key] = String(val); },
  removeItem: (key) => { delete memStorage[key]; },
  clear: () => { Object.keys(memStorage).forEach(k => delete memStorage[k]); }
};
global.window = global;

const Store = require(path.join(ROOT_DIR, 'admin-store.js'));
const JournalCore = require(path.join(ROOT_DIR, 'journal-core.js'));

if (!fs.existsSync(JOURNAL_DIR)) {
  fs.mkdirSync(JOURNAL_DIR, { recursive: true });
}

console.log('=== AARAMBHX JOURNAL: STATIC PAGE GENERATOR ===\n');

const posts = Store.getBlogPosts('all', 'Published');
console.log(`Found ${posts.length} published articles to pre-render.`);

const BASE_URL = 'https://aarambhx-technology.vercel.app';
const ADSENSE_PUB = 'ca-pub-8724628344472439';

function generateArticleHtml(post, allPosts) {
  const slug = post.slug;
  const canonicalUrl = `${BASE_URL}/journal/${slug}.html`;
  const relativeBase = '../';
  const relatedPosts = JournalCore.getRelated(post, allPosts, 3);
  const articleBodyHtml = JournalCore.renderArticle(post, {
    base: relativeBase,
    related: relatedPosts,
    shareUrl: canonicalUrl
  });

  const isoDate = JournalCore.toISODate(post) || '2026-03-01';
  const displayDate = JournalCore.formatDate(post) || 'March 2026';
  const metaDesc = JournalCore.escapeHtml(post.metaDescription || post.summary || 'Technical breakdown from the AarambhX Engineering Lab.');
  const title = JournalCore.escapeHtml(post.title);
  const authorName = JournalCore.escapeHtml(post.author || 'Lalith H & AarambhX AI Lab');
  const imageUrl = post.image ? (post.image.startsWith('http') ? post.image : `${BASE_URL}/${post.image}`) : `${BASE_URL}/assets/hero.webp`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${canonicalUrl}#article`,
        "isPartOf": {
          "@type": "Blog",
          "@id": `${BASE_URL}/blog.html#blog`,
          "name": "AarambhX Engineering Journal & AI Tech News"
        },
        "headline": post.title,
        "description": post.summary,
        "url": canonicalUrl,
        "datePublished": isoDate,
        "dateModified": post.updatedAt ? post.updatedAt.slice(0, 10) : isoDate,
        "inLanguage": "en-US",
        "image": imageUrl,
        "author": {
          "@type": "Person",
          "name": post.author || "Lalith H"
        },
        "publisher": {
          "@type": "Organization",
          "name": "AarambhX Technology",
          "logo": {
            "@type": "ImageObject",
            "url": `${BASE_URL}/assets/aarambhx-logo.jpg`
          }
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${BASE_URL}/`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Engineering Journal",
            "item": `${BASE_URL}/blog.html`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": canonicalUrl
          }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | AarambhX Engineering Journal</title>
  
  <meta name="description" content="${metaDesc}">
  <meta name="keywords" content="${JournalCore.escapeHtml((post.tags || []).join(', '))}">
  <meta name="author" content="${authorName}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Immediate Theme Initializer -->
  <script>
    (function() {
      try {
        var savedTheme = localStorage.getItem('tbs_theme') || localStorage.getItem('tb_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark-theme');
          document.documentElement.classList.remove('light-theme');
        } else {
          document.documentElement.classList.add('light-theme');
          document.documentElement.classList.remove('dark-theme');
        }
      } catch (e) {}
    })();
  </script>

  <!-- Open Graph / Social -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title} | AarambhX Engineering Journal">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:image" content="${imageUrl}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${title} | AarambhX Engineering Journal">
  <meta name="twitter:description" content="${metaDesc}">
  <meta name="twitter:image" content="${imageUrl}">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg?v=3.0">
  <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png?v=3.0">
  <link rel="icon" type="image/png" sizes="16x16" href="../assets/favicon-16.png?v=3.0">
  <link rel="icon" type="image/x-icon" href="../favicon.ico?v=3.0">
  <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png?v=3.0">

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="../styles.css?v=2.4.0">
  <link rel="stylesheet" href="../blog.css?v=4.2.0">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(structuredData, null, 2)}
  </script>

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB}" crossorigin="anonymous"></script>
</head>
<body class="blog-page">

  <!-- Reading Progress Bar -->
  <div class="reading-progress-bar" id="readingProgressBar"></div>

  <!-- Ambient Glowing Meshes -->
  <div class="blog-bg-ambient" aria-hidden="true"></div>

  <!-- Floating Glassmorphism Header -->
  <header id="navbar" class="apple-glass-nav" aria-label="Site Header">
    <div class="nav-container">
      <a href="../index.html" class="nav-brand" aria-label="Aarambhx Technology Home">
        <span class="brand-badge">
          <picture>
            <source srcset="../assets/aarambhx-logo.avif" type="image/avif">
            <source srcset="../assets/aarambhx-logo.webp" type="image/webp">
            <img src="../assets/aarambhx-logo.jpg" alt="Aarambhx Technology Logo" class="brand-logo-img" width="38" height="38" fetchpriority="high">
          </picture>
        </span>
        <span class="brand-text">Aarambhx <span class="brand-highlight">Technology</span></span>
      </a>

      <nav class="nav-menu" aria-label="Main Navigation">
        <ul class="nav-list">
          <li><a href="../index.html#services" class="nav-item">Services</a></li>
          <li><a href="../work.html" class="nav-item">Our Work</a></li>
          <li><a href="../index.html#projects" class="nav-item">Projects</a></li>
          <li><a href="../academy.html" class="nav-item dev-link-highlight" title="AarambhX Academy — Industrial Training &amp; Workshops">Academy</a></li>
          <li><a href="../blog.html" class="nav-item active" style="color:var(--blog-gold); font-weight:700;">Journal</a></li>
          <li><a href="../index.html#contact" class="nav-item">Contact</a></li>
          <li class="nav-item-aux"><a href="../brochure.html" class="nav-item nav-item-aux" title="Institutional Training Brochure">Brochure</a></li>
          <li class="nav-item-aux"><a href="../highlights.html" class="nav-item nav-item-aux" title="Watch Instagram Reels">Reels</a></li>
        </ul>
      </nav>

      <div class="nav-actions">
        <button type="button" class="theme-toggle-btn" id="themeToggle" aria-label="Toggle light/dark theme" title="Toggle light/dark theme">
          <i data-lucide="moon" class="theme-icon-dark"></i>
          <i data-lucide="sun" class="theme-icon-light"></i>
        </button>
        <a href="../index.html#contact" class="apple-btn-cta desktop-cta">
          <span>Get Consultation</span>
          <i data-lucide="arrow-right"></i>
        </a>
      </div>
    </div>
  </header>

  <!-- Static Article Container -->
  <main class="article-reader-container" style="display:block; padding-top:5.5rem;">
    <div class="reader-toolbar">
      <a href="../blog.html" class="reader-back-btn">
        <i data-lucide="arrow-left" style="width:14px; height:14px;"></i>
        <span>&larr; Back to Journal</span>
      </a>
      <div class="font-size-controls">
        <span style="font-size:0.75rem; color:var(--blog-text-tertiary); margin-right:4px;">Text Size:</span>
        <button type="button" class="font-size-btn" id="btnFontDecr" title="Decrease font size" aria-label="Decrease font size">A-</button>
        <button type="button" class="font-size-btn" id="btnFontIncr" title="Increase font size" aria-label="Increase font size">A+</button>
      </div>
    </div>

    ${articleBodyHtml}
  </main>

  <!-- Footer -->
  <footer class="site-footer blog-footer">
    <div class="blog-container">
      <div class="footer-grid">
        <div class="footer-col">
          <div class="footer-brand">
            <img src="../assets/aarambhx-logo.jpg" alt="AarambhX Logo" class="footer-logo" width="32" height="32">
            <span class="footer-brand-name">AarambhX <span class="footer-brand-accent">Technology</span></span>
          </div>
          <p class="footer-desc">
            Your single technology partner for custom cloud software, industrial IoT sensor rigs, high-density structured networking, and terminal-driven academy workshops.
          </p>
        </div>

        <div class="footer-col">
          <h3 class="footer-heading">Quick Navigation</h3>
          <ul class="footer-links">
            <li><a href="../index.html">Home</a></li>
            <li><a href="../work.html">Our Work &amp; Portfolio</a></li>
            <li><a href="../academy.html">AarambhX Academy</a></li>
            <li><a href="../brochure.html">Interactive Brochure</a></li>
            <li><a href="../highlights.html">Reels &amp; Highlights</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3 class="footer-heading">Contact &amp; Labs</h3>
          <p class="footer-contact">
            Tumakuru, Karnataka &bull; Remote Worldwide<br>
            Direct: +91 76766 90081<br>
            Email: info@aarambhxtechnology.in
          </p>
          <a href="https://wa.me/917676690081?text=Hello%20AarambhX!%20I%20read%20your%20Engineering%20Journal." target="_blank" rel="noopener noreferrer" class="footer-whatsapp-link">
            <i data-lucide="message-circle" style="width:16px; height:16px;" aria-hidden="true"></i>
            <span>Chat with Lead Architect</span>
          </a>
        </div>
      </div>

      <div class="footer-bottom">
        <span>&copy; 2026 AarambhX Technology. All rights reserved.</span>
        <span>Crafted with precision engineering</span>
      </div>
    </div>
  </footer>

  <!-- Floating WhatsApp Action Button -->
  <a href="https://wa.me/917676690081?text=Hello%20AarambhX!%20I%20have%20an%20inquiry%20regarding%20your%20Engineering%20Journal%20article%20'${encodeURIComponent(post.title)}'." 
     target="_blank" 
     rel="noopener noreferrer" 
     class="whatsapp-fab" 
     aria-label="Chat directly on WhatsApp with AarambhX Team"
     title="Chat with Us on WhatsApp">
    <i data-lucide="message-circle"></i>
    <span class="fab-pulse"></span>
  </a>

  <!-- Toast Notification Mount -->
  <div id="toastContainer" class="ax-toast-container"></div>

  <!-- Runtime Client Scripts -->
  <script>
    // Theme Manager
    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
      }
      localStorage.setItem('tb_theme', theme);
      localStorage.setItem('tbs_theme', theme);
    }
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function() {
        const curr = document.body.getAttribute('data-theme') || (document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        applyTheme(curr === 'dark' ? 'light' : 'dark');
      });
    }

    // Scroll Progress
    const progressBar = document.getElementById('readingProgressBar');
    window.addEventListener('scroll', function() {
      if (!progressBar) return;
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      progressBar.style.width = Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) + '%';
    }, { passive: true });

    // Copy Code Buttons
    document.querySelectorAll('[data-copy-code]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const pre = btn.closest('figure').querySelector('pre code');
        if (!pre) return;
        navigator.clipboard.writeText(pre.innerText).then(function() {
          const span = btn.querySelector('span');
          if (span) span.textContent = 'Copied!';
          setTimeout(function() { if (span) span.textContent = 'Copy'; }, 2000);
        });
      });
    });

    // Copy Article Link
    document.querySelectorAll('[data-copy-link]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const link = btn.getAttribute('data-copy-link') || window.location.href;
        navigator.clipboard.writeText(link).then(function() {
          alert('Article link copied to clipboard!');
        });
      });
    });

    // Font Scalers
    let currentScale = 1;
    const fontSizes = ['0.95rem', '1.05rem', '1.18rem'];
    const prose = document.getElementById('articleProseBody');
    const btnDecr = document.getElementById('btnFontDecr');
    const btnIncr = document.getElementById('btnFontIncr');
    if (btnDecr && prose) {
      btnDecr.addEventListener('click', function() {
        if (currentScale > 0) { currentScale--; prose.style.fontSize = fontSizes[currentScale]; }
      });
    }
    if (btnIncr && prose) {
      btnIncr.addEventListener('click', function() {
        if (currentScale < fontSizes.length - 1) { currentScale++; prose.style.fontSize = fontSizes[currentScale]; }
      });
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  </script>
</body>
</html>
`;
}

// Generate static page for each article
posts.forEach(post => {
  const filePath = path.join(JOURNAL_DIR, `${post.slug}.html`);
  const html = generateArticleHtml(post, posts);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✔ Generated static page: journal/${post.slug}.html`);
});

// Generate sitemap.xml
function generateSitemap() {
  const staticRoutes = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${BASE_URL}/work.html`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${BASE_URL}/academy.html`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${BASE_URL}/blog.html`, priority: '0.9', changefreq: 'daily' },
    { loc: `${BASE_URL}/brochure.html`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${BASE_URL}/highlights.html`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${BASE_URL}/verify.html`, priority: '0.5', changefreq: 'monthly' }
  ];

  const nowIso = new Date().toISOString().split('T')[0];

  const articleRoutes = posts.map(p => ({
    loc: `${BASE_URL}/journal/${p.slug}.html`,
    priority: '0.85',
    changefreq: 'monthly',
    lastmod: JournalCore.toISODate(p) || nowIso
  }));

  const allUrls = staticRoutes.concat(articleRoutes);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || nowIso}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
  console.log(`\n✔ Generated sitemap.xml with ${allUrls.length} total URLs.`);
}

generateSitemap();

console.log('\nStatic journal generation complete.');
