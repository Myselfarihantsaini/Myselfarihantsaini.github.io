const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://shambhavaa.com';
const POSTS_DIR = path.join(ROOT, 'posts');

function loadPosts() {
    const dataSource = fs.readFileSync(path.join(ROOT, 'js', 'data.js'), 'utf8');
    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(`${dataSource}\nthis.postsData = postsData;`, sandbox);
    return sandbox.postsData;
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function toISODate(displayDate) {
    const parsed = displayDate.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
    if (!parsed) return new Date().toISOString().slice(0, 10);

    const monthIndex = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ].indexOf(parsed[1].toLowerCase());

    if (monthIndex === -1) return new Date().toISOString().slice(0, 10);
    return `${parsed[3]}-${String(monthIndex + 1).padStart(2, '0')}-${String(parsed[2]).padStart(2, '0')}`;
}

function postUrl(post) {
    return `${SITE_URL}/posts/${post.id}.html`;
}

function assetUrl(assetPath) {
    if (/^https?:\/\//i.test(assetPath)) return assetPath;
    return `${SITE_URL}/${assetPath.replace(/^\/+/, '')}`;
}

function renderArticlePage(post) {
    const title = `${post.title} — Shambhava`;
    const description = post.excerpt || 'Read in-depth Vedic astrology articles and planetary insights from Shambhava.';
    const canonical = postUrl(post);
    const image = assetUrl(post.image || 'assets/cosmic_banner.png');
    const published = toISODate(post.date);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="../">
    <title>${escapeHTML(title)}</title>
    <meta name="description" content="${escapeHTML(description)}">
    <meta name="robots" content="index,follow">
    <meta name="theme-color" content="#0B1020">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="favicon.ico" sizes="any">
    <link rel="apple-touch-icon" href="assets/logo.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/logo.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/logo.png">
    <meta property="og:title" content="${escapeHTML(title)}">
    <meta property="og:description" content="${escapeHTML(description)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${image}">
    <meta property="article:published_time" content="${published}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHTML(title)}">
    <meta name="twitter:description" content="${escapeHTML(description)}">
    <meta name="twitter:image" content="${image}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css?v=5.1">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": ${JSON.stringify(post.title)},
      "description": ${JSON.stringify(description)},
      "image": ${JSON.stringify(image)},
      "url": ${JSON.stringify(canonical)},
      "datePublished": ${JSON.stringify(published)},
      "dateModified": ${JSON.stringify(published)},
      "author": { "@type": "Person", "name": "Arihant Saini" },
      "publisher": {
        "@type": "Organization",
        "name": "Shambhava",
        "logo": { "@type": "ImageObject", "url": "${SITE_URL}/assets/logo.png" }
      }
    }
    </script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9194178610009666" crossorigin="anonymous"></script>
</head>
<body>
    <canvas id="stars-canvas" aria-hidden="true"></canvas>

    <nav class="navbar" id="navbar">
        <div class="container nav-container">
            <a href="index.html" class="logo">
                <img src="assets/logo.png" alt="Shambhava Icon">
                Sham<span class="logo-accent">bhava</span>
            </a>
            <ul class="nav-links" id="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="index.html#daily-insights">Insights</a></li>
                <li><a href="index.html#zodiac-signs">Zodiac</a></li>
                <li><a href="index.html#services">Services</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="index.html#contact">Contact</a></li>
            </ul>
            <button class="mobile-menu-btn" id="mobile-menu-btn" type="button" aria-label="Open navigation menu" aria-controls="nav-links" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <main class="container section post-page-container">
        <article id="single-post" class="single-post">
            <header class="post-header">
                <span class="category-badge mb-1" style="display:inline-block; position:relative;">${escapeHTML(post.category)}</span>
                <h1 class="post-title-large">${escapeHTML(post.title)}</h1>
                <p class="post-meta">Published on ${escapeHTML(post.date)} • by Arihant Saini</p>
            </header>
            <div class="post-hero-image" style="background-image: url('${escapeHTML(post.image)}')"></div>
            <div class="post-body">
                ${post.content}
            </div>
            <div class="post-footer" style="margin-top: 40px; text-align: center;">
                <a href="index.html" class="btn-threads" style="display: inline-block;">← Back to Home</a>
            </div>
        </article>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-bottom">
                <p>&copy; 2026 Shambhava by Arihant Saini. All rights reserved.</p>
                <p><a href="../privacy.html">Privacy Policy</a> · <a href="../terms.html">Terms & Disclaimer</a></p>
            </div>
        </div>
    </footer>

    <script src="js/data.js?v=5.3"></script>
    <script src="js/main.js?v=5.3"></script>
</body>
</html>
`;
}

function renderPostCard(post, index) {
    return `                <div class="post-card" style="transition-delay: ${(index * 0.1).toFixed(1).replace('.0', '')}s;">
                    <div class="post-image" style="background-image: url('${escapeHTML(post.image)}')">
                        <span class="category-badge">${escapeHTML(post.category)}</span>
                    </div>
                    <div class="post-content">
                        <span class="post-date">${escapeHTML(post.date)}</span>
                        <h3 class="post-title"><a href="posts/${escapeHTML(post.id)}.html">${escapeHTML(post.title)}</a></h3>
                        <p class="post-excerpt">${escapeHTML(post.excerpt)}</p>
                        <a href="posts/${escapeHTML(post.id)}.html" class="read-more">Read Full Post →</a>
                    </div>
                </div>`;
}

function updateIndex(posts) {
    const indexPath = path.join(ROOT, 'index.html');
    const html = fs.readFileSync(indexPath, 'utf8');
    const start = html.indexOf('            <div id="posts-grid" class="posts-grid">');
    if (start === -1) throw new Error('Could not find posts-grid start in index.html');
    const containerClose = '\n        </div>\n    </main>';
    const end = html.indexOf(containerClose, start);
    if (end === -1) throw new Error('Could not find daily insights section end in index.html');

    const replacement = `            <div id="posts-grid" class="posts-grid">\n${posts.map(renderPostCard).join('\n')}\n            </div>`;
    fs.writeFileSync(indexPath, `${html.slice(0, start)}${replacement}${html.slice(end)}`);
}

function updateSitemap(posts) {
    const urls = [
        { loc: `${SITE_URL}/`, lastmod: '2026-04-30', changefreq: 'daily', priority: '1.0' },
        { loc: `${SITE_URL}/about.html`, lastmod: '2026-04-27', changefreq: 'monthly', priority: '0.6' },
        { loc: `${SITE_URL}/products.html`, lastmod: '2026-05-06', changefreq: 'monthly', priority: '0.6' },
        { loc: `${SITE_URL}/privacy.html`, lastmod: '2026-05-06', changefreq: 'yearly', priority: '0.4' },
        { loc: `${SITE_URL}/terms.html`, lastmod: '2026-05-06', changefreq: 'yearly', priority: '0.4' },
        ...posts.map(post => ({
            loc: postUrl(post),
            lastmod: toISODate(post.date),
            changefreq: 'monthly',
            priority: '0.8'
        }))
    ];

    const body = urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
}

function generate() {
    const posts = loadPosts();
    fs.mkdirSync(POSTS_DIR, { recursive: true });

    posts.forEach(post => {
        fs.writeFileSync(path.join(POSTS_DIR, `${post.id}.html`), renderArticlePage(post));
    });

    updateIndex(posts);
    updateSitemap(posts);
    console.log(`Generated ${posts.length} static post pages.`);
}

generate();
