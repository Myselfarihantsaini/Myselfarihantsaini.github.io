// =============================================
// Shambhava — Main JavaScript
// =============================================

// ---- Animated Stars + Sacred Symbols Background ----
function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [], symbols = [], shootingStars = [];
    const STAR_COUNT = 220;
    const SACRED = ['ॐ', '᳐', '✦', 'ॐ', '☸'];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.8 + 0.2,
                alpha: Math.random(),
                speed: Math.random() * 0.006 + 0.001,
                direction: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    function createSymbols() {
        symbols = [];
        const count = Math.floor(canvas.width / 280);
        for (let i = 0; i < count; i++) {
            symbols.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                char: SACRED[Math.floor(Math.random() * SACRED.length)],
                size: Math.random() * 28 + 18,
                alpha: 0,
                maxAlpha: Math.random() * 0.06 + 0.02,
                speedX: (Math.random() - 0.5) * 0.15,
                speedY: -Math.random() * 0.2 - 0.05,
                fadeSpeed: Math.random() * 0.002 + 0.001,
                fadingIn: true
            });
        }
    }

    function spawnShootingStar() {
        shootingStars.push({
            x: Math.random() * canvas.width * 0.7,
            y: Math.random() * canvas.height * 0.4,
            len: Math.random() * 80 + 40,
            speed: Math.random() * 4 + 3,
            alpha: 1,
            angle: Math.PI / 5
        });
    }

    setInterval(() => { if (Math.random() < 0.4) spawnShootingStar(); }, 4000);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Stars
        stars.forEach(star => {
            star.alpha += star.speed * star.direction;
            if (star.alpha >= 1) { star.alpha = 1; star.direction = -1; }
            if (star.alpha <= 0.05) { star.alpha = 0.05; star.direction = 1; }
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 168, 67, ${star.alpha * 0.55})`;
            ctx.fill();
        });

        // Sacred floating symbols
        symbols.forEach(sym => {
            if (sym.fadingIn) {
                sym.alpha += sym.fadeSpeed;
                if (sym.alpha >= sym.maxAlpha) sym.fadingIn = false;
            } else {
                sym.alpha -= sym.fadeSpeed * 0.5;
                if (sym.alpha <= 0) {
                    sym.x = Math.random() * canvas.width;
                    sym.y = canvas.height + 20;
                    sym.alpha = 0;
                    sym.fadingIn = true;
                    sym.char = SACRED[Math.floor(Math.random() * SACRED.length)];
                }
            }
            sym.x += sym.speedX;
            sym.y += sym.speedY;
            ctx.font = `${sym.size}px serif`;
            ctx.fillStyle = `rgba(198, 161, 91, ${sym.alpha})`;
            ctx.fillText(sym.char, sym.x, sym.y);
        });

        // Shooting stars
        shootingStars.forEach((s, i) => {
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
            const grad = ctx.createLinearGradient(s.x, s.y, s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
            grad.addColorStop(0, `rgba(212, 168, 67, ${s.alpha})`);
            grad.addColorStop(1, 'transparent');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            s.alpha -= 0.02;
            if (s.alpha <= 0) shootingStars.splice(i, 1);
        });

        requestAnimationFrame(draw);
    }

    resize();
    createStars();
    createSymbols();
    draw();
    window.addEventListener('resize', () => { resize(); createStars(); createSymbols(); });
}

// ---- Navbar Scroll Effect ----
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ---- Mobile Menu ----
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const links = document.getElementById('nav-links');
    if (!btn || !links) return;

    const closeMenu = () => {
        links.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Open navigation menu');
        document.body.classList.remove('menu-open');
    };

    btn.addEventListener('click', () => {
        links.classList.toggle('active');
        const isOpen = links.classList.contains('active');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        btn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        document.body.classList.toggle('menu-open', isOpen);
    });

    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
}

// ---- Scroll Reveal Animation ----
function initScrollReveal() {
    const elements = document.querySelectorAll('.post-card, .zodiac-card, .about-grid, .cta-content, .service-card, .product-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
}

// ---- Render Posts on Home Page ----
function escapeHTML(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getStoredPostComments(postId) {
    try {
        return JSON.parse(localStorage.getItem(`comments_${postId}`)) || [];
    } catch (error) {
        return [];
    }
}

function renderStoredPostComments(container, comments) {
    if (!container) return;

    if (!comments.length) {
        container.innerHTML = '<p class="comment-empty">No comments yet.</p>';
        return;
    }

    container.innerHTML = comments.map(comment => `
        <article class="comment-card">
            <div class="comment-card-header">
                <strong>${escapeHTML(comment.name)}</strong>
                <span>${escapeHTML(comment.date)}</span>
            </div>
            <p>${escapeHTML(comment.message).replace(/\n/g, '<br>')}</p>
        </article>
    `).join('');
}

function initializePostCommentForm(container, post) {
    if (!container || !post || container.dataset.initialized === 'true') return;

    const form = container.querySelector('[data-post-comment-form]');
    const list = container.querySelector('[data-post-comment-list]');
    const status = container.querySelector('[data-post-comment-status]');
    const comments = getStoredPostComments(post.id);

    renderStoredPostComments(list, comments);

    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const formData = new FormData(form);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const message = String(formData.get('message') || '').trim();
        const date = new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        const comment = { name, email, message, date };
        const nextComments = [...comments, comment];
        localStorage.setItem(`comments_${post.id}`, JSON.stringify(nextComments));
        comments.push(comment);
        renderStoredPostComments(list, comments);

        const subject = `New comment on ${post.title}`;
        const body = [
            `Post: ${post.title}`,
            `URL: ${window.location.href}`,
            `Name: ${name}`,
            `Email: ${email}`,
            '',
            'Comment:',
            message
        ].join('\n');

        if (status) {
            status.textContent = 'Comment saved here. Opening email to send it now.';
        }

        window.location.href = buildMailtoUrl('shambhavaa.reviews@gmail.com', subject, body);
        form.reset();
    });

    container.dataset.initialized = 'true';
}

function initializePostActions(container, post) {
    if (!container || !post) return;

    const likeBtn = container.querySelector('.like-btn');
    const commentBtn = container.querySelector('.comment-btn');
    const shareBtn = container.querySelector('.share-btn');
    
    // Generate a unique, consistent "starting" like count based on post ID
    // This makes the site feel active and professional immediately
    let baseLikes = 0;
    for (let i = 0; i < post.id.length; i++) {
        baseLikes += post.id.charCodeAt(i);
    }
    const simulatedLikes = (baseLikes % 50) + 42; 
    
    if (likeBtn && likeBtn.dataset.initialized !== 'true') {
        const isLiked = localStorage.getItem(`liked_${post.id}`) === 'true';
        if (isLiked) {
            likeBtn.classList.add('liked');
            likeBtn.innerHTML = `♥ <span class="like-count">${simulatedLikes + 1}</span>`;
        } else {
            likeBtn.innerHTML = `♡ <span class="like-count">${simulatedLikes}</span>`;
        }

        likeBtn.addEventListener('click', () => {
            const liked = likeBtn.classList.toggle('liked');
            localStorage.setItem(`liked_${post.id}`, liked);
            
            const currentCount = parseInt(likeBtn.querySelector('.like-count').textContent);
            const newCount = liked ? currentCount + 1 : currentCount - 1;
            
            likeBtn.innerHTML = `${liked ? '♥' : '♡'} <span class="like-count">${newCount}</span>`;
            
            if (liked) {
                likeBtn.style.animation = 'none';
                setTimeout(() => likeBtn.style.animation = 'pulse 0.4s ease', 10);
            }
        });
        likeBtn.dataset.initialized = 'true';
    }

    if (shareBtn && shareBtn.dataset.initialized !== 'true') {
        shareBtn.addEventListener('click', async () => {
            try {
                const copied = await copyTextToClipboard(window.location.href);
                if (copied) {
                    shareBtn.innerHTML = '✅ Copied';
                    setTimeout(() => shareBtn.innerHTML = '🔗 Share', 2000);
                }
            } catch (error) {
                console.error('Share failed', error);
            }
        });
        shareBtn.dataset.initialized = 'true';
    }

    if (commentBtn && commentBtn.dataset.initialized !== 'true') {
        commentBtn.addEventListener('click', () => {
            const commentsSection = document.getElementById('discussion-anchor');
            if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        commentBtn.dataset.initialized = 'true';
    }
}

// ---- Render Single Post ----
function renderSinglePost() {
    const singlePostContainer = document.getElementById('single-post');
    if (!singlePostContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const staticPostMatch = window.location.pathname.match(/\/posts\/([^/]+)\.html$/);
    const staticPostId = staticPostMatch ? staticPostMatch[1] : null;

    const post = (staticPostId || postId)
        ? postsData.find(p => p.id === (staticPostId || postId))
        : postsData[0];

    if (post) {
        document.title = `${post.title} — Shambhava`;
        updatePostMetadata(post);
        singlePostContainer.innerHTML = `
            <header class="post-header">
                <span class="category-badge mb-1" style="display:inline-block; position:relative;">${post.category}</span>
                <h1 class="post-title-large">${post.title}</h1>
                <p class="post-meta">Published on ${post.date} • by Arihant Saini</p>
            </header>
            <div class="post-hero-image" style="background-image: url('${post.image}')"></div>
            <div class="post-body">
                ${post.content}
            </div>

            <div class="post-actions" style="display: flex; gap: 12px; margin: 30px 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); padding: 20px 0; flex-wrap: wrap;">
                <button class="post-action-btn like-btn" type="button">♡ Like</button>
                <button class="post-action-btn comment-btn" type="button">💬 Comment</button>
                <button class="post-action-btn share-btn" type="button">🔗 Share</button>
            </div>
            
            <div id="discussion-anchor" class="post-comments-section">
                <h3>Comments</h3>
                <form class="post-comment-form" data-post-comment-form>
                    <div class="post-comment-grid">
                        <label class="sr-only" for="post-comment-name">Your Name</label>
                        <input type="text" id="post-comment-name" name="name" class="form-control" placeholder="Your Name" autocomplete="name" required>

                        <label class="sr-only" for="post-comment-email">Your Email</label>
                        <input type="email" id="post-comment-email" name="email" class="form-control" placeholder="Your Email" autocomplete="email" required>
                    </div>

                    <label class="sr-only" for="post-comment-message">Your Comment</label>
                    <textarea id="post-comment-message" name="message" class="form-control" rows="5" placeholder="Write your comment..." required></textarea>

                    <button type="submit" class="btn-primary post-comment-submit">
                        <span>Send Comment</span>
                    </button>
                    <p class="post-comment-status" data-post-comment-status></p>
                </form>
                <div class="post-comment-list" data-post-comment-list></div>
            </div>

            <div class="post-footer" style="margin-top: 40px; text-align: center;">
                <a href="index.html" class="btn-threads" style="display: inline-block;">← Back to Home</a>
            </div>
        `;

        initializePostCommentForm(singlePostContainer.querySelector('.post-comments-section'), post);
        initializePostActions(singlePostContainer, post);
    } else {
        singlePostContainer.innerHTML = `
            <div style="text-align:center; padding: 60px 20px;">
                <h1 style="font-size: 3rem; margin-bottom: 20px;">✦</h1>
                <h2>Post not found</h2>
                <p style="margin: 20px 0;">The stars have aligned elsewhere. We couldn't find the article you were looking for.</p>
                <a href="index.html" class="btn-primary"><span>Return Home</span></a>
            </div>
        `;
    }
}

function updatePostMetadata(post) {
    if (!post) return;

    const pageUrl = new URL(`posts/${post.id}.html`, window.location.origin);
    const imageUrl = new URL(post.image, window.location.href).toString();
    const description = post.excerpt || 'Read in-depth Vedic astrology articles and planetary insights from Shambhava.';

    const setContent = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) element.setAttribute('content', value);
    };

    const canonical = document.getElementById('page-canonical');
    if (canonical) canonical.setAttribute('href', pageUrl.toString());

    setContent('meta[name="description"]', description);
    setContent('#og-title', `${post.title} — Shambhava`);
    setContent('#og-description', description);
    setContent('#og-url', pageUrl.toString());
    setContent('#og-image', imageUrl);
    setContent('#twitter-title', `${post.title} — Shambhava`);
    setContent('#twitter-description', description);
    setContent('#twitter-image', imageUrl);
}

// ---- Floating Chat Button Logic ----
function initChatFab() {
    const fab = document.getElementById('chat-fab');
    const fabBtn = document.getElementById('chat-fab-btn');

    if (!fab || !fabBtn) return;

    // Toggle menu on button click
    fabBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent clicking outside from firing immediately
        fab.classList.toggle('active');
    });

    // Close menu when clicking anywhere else
    document.addEventListener('click', (e) => {
        if (fab.classList.contains('active') && !fab.contains(e.target)) {
            fab.classList.remove('active');
        }
    });

    // Optional: Auto-open the chat menu once after a delay to grab attention
    setTimeout(() => {
        if (!fab.classList.contains('active')) {
            fab.classList.add('active');
            // Auto close it after 5 seconds
            setTimeout(() => {
                fab.classList.remove('active');
            }, 5000);
        }
    }, 15000); // Trigger after 15 seconds of page load
}

// ---- Reference Navagraha Transits ----
let currentPlanetData = null;
const TRANSIT_REFERENCE_DATA_2026 = {
    "Sun": { current_sign: 1, normDegree: 10 },
    "Moon": { current_sign: 4, normDegree: 15 },
    "Mars": { current_sign: 11, normDegree: 22 },
    "Mercury": { current_sign: 1, normDegree: 5 },
    "Jupiter": { current_sign: 3, normDegree: 25 },
    "Venus": { current_sign: 12, normDegree: 28 },
    "Saturn": { current_sign: 12, normDegree: 18 },
    "Rahu": { current_sign: 11, normDegree: 4, isRetro: "true" },
    "Ketu": { current_sign: 5, normDegree: 4, isRetro: "true" }
};
const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

function normalizeLongitude(longitude) {
    return ((longitude % 360) + 360) % 360;
}

function createPlanetPosition(longitude, isRetro) {
    const normalized = normalizeLongitude(longitude);
    return {
        current_sign: Math.floor(normalized / 30) + 1,
        normDegree: normalized % 30,
        isRetro: isRetro ? "true" : "false"
    };
}

function buildReferenceBirthChart(birthDate) {
    const totalDays = birthDate.getTime() / 86400000;
    const minutes = birthDate.getHours() * 60 + birthDate.getMinutes();
    const ascLongitude = ((birthDate.getDate() - 1) * 12) + (minutes / 4) + (birthDate.getMonth() * 30);

    return {
        "Sun": createPlanetPosition((totalDays / 365.256) * 360 + 280, false),
        "Moon": createPlanetPosition((totalDays / 27.32166) * 360 + 218, false),
        "Mars": createPlanetPosition((totalDays / 686.98) * 360 + 150, false),
        "Mercury": createPlanetPosition((totalDays / 87.969) * 360 + 60, false),
        "Jupiter": createPlanetPosition((totalDays / 4332.59) * 360 + 120, false),
        "Venus": createPlanetPosition((totalDays / 224.701) * 360 + 45, false),
        "Saturn": createPlanetPosition((totalDays / 10759.22) * 360 + 300, false),
        "Rahu": createPlanetPosition(210 - (totalDays / 6798.38) * 360, true),
        "Ketu": createPlanetPosition(30 - (totalDays / 6798.38) * 360, true),
        "Ascendant": createPlanetPosition(ascLongitude, false)
    };
}

function fetchNavagrahaTransits() {
    if (!document.getElementById('navagraha-transits')) return;
    currentPlanetData = TRANSIT_REFERENCE_DATA_2026;
    renderTransits();
}

function renderTransits() {
    if (!currentPlanetData) return;

    const signs = {
        1: "Aries", 2: "Taurus", 3: "Gemini", 4: "Cancer",
        5: "Leo", 6: "Virgo", 7: "Libra", 8: "Scorpio",
        9: "Sagittarius", 10: "Capricorn", 11: "Aquarius", 12: "Pisces"
    };

    const statuses = {
        "Sun": {1: "Exalted", 5: "Own Sign", 7: "Debilitated"},
        "Moon": {2: "Exalted", 4: "Own Sign", 8: "Debilitated"},
        "Mars": {10: "Exalted", 1: "Own Sign", 8: "Own Sign", 4: "Debilitated"},
        "Mercury": {6: "Exalted/Own", 3: "Own Sign", 12: "Debilitated"},
        "Jupiter": {4: "Exalted", 9: "Own Sign", 12: "Own Sign", 10: "Debilitated"},
        "Venus": {12: "Exalted", 2: "Own Sign", 7: "Own Sign", 6: "Debilitated"},
        "Saturn": {7: "Exalted", 10: "Own Sign", 11: "Moolatrikona", 1: "Debilitated"},
        "Rahu": {3: "Exalted", 2: "Exalted", 9: "Debilitated"},
        "Ketu": {9: "Exalted", 8: "Exalted", 3: "Debilitated"}
    };

    // 2026 Sidereal (Lahiri) Transit Lookup Table for Slow Planets
    const transitTable2026 = {
        "Jupiter": [
            { date: new Date("2026-06-02"), sign: 4 }, // Cancer
            { date: new Date("2026-10-31"), sign: 5 }  // Leo
        ],
        "Rahu": [
            { date: new Date("2026-12-05"), sign: 10 } // Capricorn
        ],
        "Ketu": [
            { date: new Date("2026-12-05"), sign: 4 }  // Cancer
        ],
        "Saturn": [] // Remains in Pisces (12) all 2026
    };

    const formatDegrees = (deg) => {
        const d = Math.floor(deg);
        const m = Math.floor((deg - d) * 60);
        return `${d}° ${m}'`;
    };

    const calculateStay = (name, p) => {
        const now = new Date();
        const degRemaining = 30 - p.normDegree;

        // Mathematical approximations for fast planets
        if (name === "Moon") {
            const days = degRemaining / 13.18; // Avg speed
            return days < 1 ? `${Math.round(days * 24)}h left` : `${Math.round(days)}d left`;
        }
        if (name === "Sun") {
            return `${Math.round(degRemaining)}d left`;
        }
        if (name === "Mercury" || name === "Venus" || name === "Mars") {
            const avgSpeeds = { "Mercury": 1.4, "Venus": 1.2, "Mars": 0.5 };
            const days = degRemaining / (avgSpeeds[name] || 1);
            return `~${Math.round(days)}d left`;
        }

        // Lookup table for slow planets
        if (transitTable2026[name]) {
            const nextTransit = transitTable2026[name].find(t => t.date > now);
            if (nextTransit) {
                const diffTime = Math.abs(nextTransit.date - now);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return `${diffDays}d left`;
            } else {
                if (name === "Saturn") return "Stays all year";
                return "Moving soon";
            }
        }
        return "--";
    };

    const updatePlanet = (apiName, idPrefix) => {
        const p = currentPlanetData[apiName];
        if (p) {
            const signNum = p.current_sign;
            const signName = signs[signNum];
            const degStr = formatDegrees(p.normDegree);
            const retro = p.isRetro === "true" ? ' <span style="color: #ff4d4d;">(R)</span>' : '';
            const stayText = calculateStay(apiName, p);
            const status = (statuses[apiName] && statuses[apiName][signNum]) 
                ? `<span style="color: var(--primary-light); font-size: 0.8rem; display: block; margin-top: 4px;">${statuses[apiName][signNum]}</span>` 
                : "";
            
            const el = document.getElementById(`transit-${idPrefix}`);
            if (el) {
                el.innerHTML = `
                    <span class="transit-sign">${signName}</span>
                    <span class="transit-degree">${degStr}${retro}</span>
                    <span class="transit-stay">${stayText}</span>
                    ${status}
                `;
            }
        }
    };

    const grahas = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    grahas.forEach(g => updatePlanet(g, g.toLowerCase()));
}

function setupChartSelector() {
    const selector = document.getElementById('rashi-selector');
    if (!selector) return;

    // Initialize with current selector value (or default to Aries if empty)
    const initialValue = selector.value || "1";
    selector.value = initialValue;
    updateKundli(parseInt(initialValue));

    selector.addEventListener('change', (e) => {
        updateKundli(parseInt(e.target.value));
    });
}

function updateKundli(lagnaRashi) {
    if (!currentPlanetData) return;

    // Clear all houses
    for (let i = 1; i <= 12; i++) {
        const h = document.getElementById(`house-${i}`);
        if (h) h.innerHTML = "";
    }

    const planetSymbols = {
        "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me",
        "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa", "Rahu": "Ra", "Ketu": "Ke"
    };

    // For each house, determine which rashi it is
    // House 1 is lagnaRashi, House 2 is lagnaRashi + 1, etc.
    for (let hNum = 1; hNum <= 12; hNum++) {
        const houseRashi = ((lagnaRashi + hNum - 2) % 12) + 1;
        const houseEl = document.getElementById(`house-${hNum}`);
        
        // Add Rashi Number to House
        const rashiLabel = document.createElement('span');
        rashiLabel.className = 'gochar-rashi';
        rashiLabel.innerText = houseRashi;
        houseEl.appendChild(rashiLabel);

        // Find planets in this rashi
        const planetList = [];
        for (const [pName, pData] of Object.entries(currentPlanetData)) {
            if (planetSymbols[pName] && pData.current_sign === houseRashi) {
                planetList.push(planetSymbols[pName]);
            }
        }

        if (planetList.length > 0) {
            const pLabel = document.createElement('span');
            pLabel.className = 'gochar-planets';
            pLabel.innerText = planetList.join(' ');
            houseEl.appendChild(pLabel);
        }
    }
}

// ---- Audio Controls (Automatic Om Chant) ----
function initAudio() {
    const audio = document.getElementById('om-audio');
    if (!audio) return;

    // Set a whisper-quiet, subtle volume (3%)
    audio.volume = 0.03;

    // Browser policy blocks audio unless user interacts. 
    // We play it as soon as the user clicks anywhere or scrolls.
    const startAudio = () => {
        audio.play().then(() => {
            console.log("Sacred chant started automatically.");
            // Remove listeners once it starts
            document.removeEventListener('click', startAudio);
            document.removeEventListener('touchstart', startAudio);
            document.removeEventListener('scroll', startAudio);
        }).catch(err => {
            // If still blocked, wait for next interaction
        });
    };

    document.addEventListener('click', startAudio);
    document.addEventListener('touchstart', startAudio);
    document.addEventListener('scroll', startAudio, { once: true });
}

function secureExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        const existingRel = link.getAttribute('rel') || '';
        const relTokens = new Set(existingRel.split(/\s+/).filter(Boolean));
        relTokens.add('noopener');
        relTokens.add('noreferrer');
        link.setAttribute('rel', Array.from(relTokens).join(' '));
    });
}

function initFaqAccessibility() {
    document.querySelectorAll('.faq-item').forEach((item, index) => {
        const button = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!button || !answer) return;

        const answerId = answer.id || `faq-answer-${index + 1}`;
        answer.id = answerId;
        button.setAttribute('aria-controls', answerId);
        button.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');

        if (button.dataset.initialized === 'true') return;

        button.addEventListener('click', () => {
            const isOpen = item.classList.toggle('open');
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        button.dataset.initialized = 'true';
    });
}

function buildMailtoUrl(email, subject, body) {
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function initLeadForms() {
    const reviewForm = document.querySelector('.review-form');
    if (reviewForm && reviewForm.dataset.initialized !== 'true') {
        reviewForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!reviewForm.reportValidity()) return;

            const formData = new FormData(reviewForm);
            const subject = formData.get('_subject') || 'New Website Review - Shambhava';
            const body = [
                'New website review',
                '',
                `Stars: ${formData.get('stars') || ''}`,
                `Name: ${formData.get('name') || ''}`,
                `Email: ${formData.get('email') || ''}`,
                '',
                'Review:',
                `${formData.get('message') || ''}`
            ].join('\n');

            window.location.href = buildMailtoUrl('shambhavaa.reviews@gmail.com', subject, body);
        });
        reviewForm.dataset.initialized = 'true';
    }

    const contactForm = document.querySelector('.contact-form');
    if (contactForm && contactForm.dataset.initialized !== 'true') {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!contactForm.reportValidity()) return;

            const formData = new FormData(contactForm);
            const serviceField = contactForm.querySelector('#service');
            const selectedService = serviceField && serviceField.selectedIndex >= 0
                ? serviceField.options[serviceField.selectedIndex].text
                : (formData.get('service') || 'General consultation');

            const isIshaService = ['tarot', 'vastu', 'numerology', 'manifestation'].includes(serviceField.value);
            const targetNumber = isIshaService ? '917795374787' : '919057918251';
            const recipientName = isIshaService ? 'Isha' : 'Arihant';

            const message = [
                `Hi ${recipientName}, I would like to book a consultation.`,
                '',
                `Name: ${formData.get('name') || ''}`,
                `Email: ${formData.get('email') || ''}`,
                `Service: ${selectedService}`,
                '',
                'Details:',
                `${formData.get('message') || ''}`
            ].join('\n');

            const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
            const openedWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            if (!openedWindow) {
                window.location.href = whatsappUrl;
            }
        });
        contactForm.dataset.initialized = 'true';
    }
}

// ---- Initialize Everything ----
document.addEventListener('DOMContentLoaded', () => {
    const safeInit = (fnName, fn) => {
        try {
            fn();
            console.log(`[Init] ${fnName} successful.`);
        } catch (e) {
            console.warn(`[Init] ${fnName} failed:`, e);
        }
    };

    safeInit("Stars", initStars);
    safeInit("Navbar", initNavbar);
    safeInit("MobileMenu", initMobileMenu);
    safeInit("SinglePost", renderSinglePost);
    safeInit("ChatFab", initChatFab);
    safeInit("Transits", fetchNavagrahaTransits);
    safeInit("ExternalLinks", secureExternalLinks);
    safeInit("FAQ", initFaqAccessibility);
    safeInit("Forms", initLeadForms);
    safeInit("ChartSelector", setupChartSelector);
    safeInit("Audio", initAudio);
    safeInit("ReviewStars", initReviewStars);

    setTimeout(() => {
        try { initScrollReveal(); } catch(e) {}
    }, 100);
});

// ---- Divine Discovery Logic (D1 & D9) ----
const remedyLibrary = {
    "Sun": { 
        perfume: "Oudh & Saffron", rudraksha: "12 Mukhi", stone: "Sunstone", gem: "Ruby", 
        advice: "To ignite your internal fire and soul authority.", 
        link: "https://wa.me/919057918251?text=Order%20Sun%20Remedies" 
    },
    "Moon": { 
        perfume: "Jasmine & White Sandal", rudraksha: "2 Mukhi", stone: "Moonstone", gem: "Pearl", 
        advice: "To soothe the mind and stabilize emotional tides.", 
        link: "https://wa.me/919057918251?text=Order%20Moon%20Remedies" 
    },
    "Mars": { 
        perfume: "Musk & Red Cedar", rudraksha: "3 Mukhi", stone: "Carnelian", gem: "Red Coral", 
        advice: "To channel courage and protective energy.", 
        link: "https://wa.me/919057918251?text=Order%20Mars%20Remedies" 
    },
    "Mercury": { 
        perfume: "Vetiver & Basil", rudraksha: "4 Mukhi", stone: "Peridot", gem: "Emerald", 
        advice: "To sharpen the intellect and verbal flow.", 
        link: "https://wa.me/919057918251?text=Order%20Mercury%20Remedies" 
    },
    "Jupiter": { 
        perfume: "Amber & Lotus", rudraksha: "5 Mukhi", stone: "Citrine", gem: "Yellow Sapphire", 
        advice: "To expand wisdom and attract abundance.", 
        link: "https://wa.me/919057918251?text=Order%20Jupiter%20Remedies" 
    },
    "Venus": { 
        perfume: "Rose & White Lily", rudraksha: "6 Mukhi", stone: "White Topaz", gem: "Diamond", 
        advice: "To enhance attraction, art, and luxury.", 
        link: "https://wa.me/919057918251?text=Order%20Venus%20Remedies" 
    },
    "Saturn": { 
        perfume: "Patchouli & Myrrh", rudraksha: "7 Mukhi", stone: "Amethyst", gem: "Blue Sapphire", 
        advice: "To bring discipline, stability, and karmic clearance.", 
        link: "https://wa.me/919057918251?text=Order%20Saturn%20Remedies" 
    },
    "Rahu": { 
        perfume: "Frankincense & Smoke", rudraksha: "8 Mukhi", stone: "Tiger Eye", gem: "Hessonite", 
        advice: "To clear illusion and navigate sudden change.", 
        link: "https://wa.me/919057918251?text=Order%20Rahu%20Remedies" 
    },
    "Ketu": { 
        perfume: "Camphor & Earth", rudraksha: "9 Mukhi", stone: "Lapis Lazuli", gem: "Cat's Eye", 
        advice: "To deepen intuition and spiritual detachment.", 
        link: "https://wa.me/919057918251?text=Order%20Ketu%20Remedies" 
    }
};

function renderRemedyPortal(ak, mahadasha) {
    const portal = document.getElementById('remedy-portal-content');
    if (!portal) return;

    const akRem = remedyLibrary[ak] || remedyLibrary["Sun"];
    const mdRem = remedyLibrary[mahadasha] || remedyLibrary["Sun"];

    const items = [
        { type: "Essence", name: akRem.perfume, icon: "🌬️", tag: "Soul Signature", advice: akRem.advice, link: akRem.link },
        { type: "Rudraksha", name: akRem.rudraksha, icon: "📿", tag: "Divine Shield", advice: akRem.advice, link: akRem.link },
        { type: "Semi-Precious", name: mdRem.stone, icon: "✨", tag: "Timeline Balancer", advice: mdRem.advice, link: mdRem.link },
        { type: "Gemstone", name: akRem.gem, icon: "💎", tag: "Primary Catalyst", advice: akRem.advice, link: akRem.link }
    ];

    portal.innerHTML = items.map(item => `
        <div class="remedy-card" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(198,161,91,0.1); padding: 25px; border-radius: 20px; text-align: center; transition: all 0.3s ease;">
            <div style="font-size: 2.5rem; margin-bottom: 15px;">${item.icon}</div>
            <span style="font-size: 0.65rem; color: var(--primary); letter-spacing: 2px; text-transform: uppercase; font-weight: 700;">${item.tag}</span>
            <h4 style="color: var(--text-light); margin: 10px 0; font-size: 1.2rem;">${item.name}</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px;">${item.advice}</p>
            <a href="${item.link}" target="_blank" style="display: block; padding: 12px; background: rgba(198, 161, 91, 0.1); color: var(--primary-light); text-decoration: none; border-radius: 10px; font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(198, 161, 91, 0.2);">Acquire ${item.type} →</a>
        </div>
    `).join("");
}

function calculateNavamsha(rashi, deg) {
    const navIndex = Math.floor(deg / (30 / 9)); // 0 to 8
    let startSign = 1;
    if ([1, 5, 9].includes(rashi)) startSign = 1;         // Fire: Starts from Aries
    else if ([2, 6, 10].includes(rashi)) startSign = 10;  // Earth: Starts from Capricorn
    else if ([3, 7, 11].includes(rashi)) startSign = 7;   // Air: Starts from Libra
    else if ([4, 8, 12].includes(rashi)) startSign = 4;   // Water: Starts from Cancer
    
    return ((startSign + navIndex - 1) % 12) + 1;
}

function runDivineDiscovery() {
    const nameField = document.getElementById('disc-name');
    const dateField = document.getElementById('disc-date');
    const timeField = document.getElementById('disc-time');

    if (!nameField || !dateField || !timeField) {
        console.warn('Discovery form is not available on this page.');
        return;
    }

    const name = nameField.value;
    const date = dateField.value;
    const time = timeField.value;
    
    if(!name || !date || !time) {
        alert("Please enter full details to generate your reference analysis.");
        return;
    }

    try {
        const birthDate = new Date(`${date}T${time}`);
        if (Number.isNaN(birthDate.getTime())) {
            alert("Please check the date and time you entered.");
            return;
        }
        const pData = buildReferenceBirthChart(birthDate);

        let ak = "Sun"; let maxDeg = 0;
        for (const [p, d] of Object.entries(pData)) {
            if (d.normDegree > maxDeg && p !== "Rahu" && p !== "Ketu") {
                maxDeg = d.normDegree; ak = p;
            }
        }

        const d1_sign = pData[ak].current_sign;
        const d9_sign = calculateNavamsha(pData[ak].current_sign, pData[ak].normDegree);
        const isVargottama = d1_sign === d9_sign;

        document.getElementById('discovery-input-state').style.display = 'none';
        document.getElementById('discovery-results-state').style.display = 'block';
        document.getElementById('discovery-user-name').innerText = `Soul Analysis: ${name}`;
        
        // --- VIMSHOTTARI DASHA LOGIC ---
        const moonPos = pData["Moon"] ? (pData["Moon"].current_sign - 1) * 30 + pData["Moon"].normDegree : 0;
        const nakSize = 360 / 27;
        const nakIndex = Math.floor(moonPos / nakSize);
        const startingDashaIndex = nakIndex % 9;
        const nakPassed = (moonPos % nakSize) / nakSize;
        
        const currentDate = new Date();
        const ageInYears = (currentDate - birthDate) / (1000 * 60 * 60 * 24 * 365.25);
        
        let yearsPassed = nakPassed * DASHA_YEARS[startingDashaIndex];
        let totalYears = 0;
        let currentMahadasha = DASHA_ORDER[startingDashaIndex];
        
        for (let i = 0; i < 100; i++) {
            let idx = (startingDashaIndex + i) % 9;
            let duration = DASHA_YEARS[idx];
            if (i === 0) duration -= yearsPassed;
            
            totalYears += duration;
            if (totalYears > ageInYears) {
                currentMahadasha = DASHA_ORDER[idx];
                break;
            }
        }

        document.getElementById('current-mahadasha').innerText = currentMahadasha;
        document.getElementById('current-antardasha').innerText = ak;
        document.getElementById('dasha-advice').innerText = `This reference reading emphasizes ${currentMahadasha}. Use it as directional guidance, and book a manual reading for exact timing.`;

        let summary = `Your Atmakaraka (Soul Planet) is **${ak}**. `;
        if (isVargottama) summary += `It appears **Vargottama** in this reference model, indicating a strong repeating pattern. `;
        summary += `These remedies are directional and meant as an on-site reference, not a substitute for a full manual chart reading.`;
        document.getElementById('discovery-summary').innerHTML = summary;

        // --- Render Dual Charts (D1 & D9) ---
        // D1 Logic
        const lagnaRashiD1 = pData["Ascendant"] ? pData["Ascendant"].current_sign : 1;
        renderChart("d1", lagnaRashiD1, pData, ak);

        // D9 Logic
        // For D9, we assume lagna is roughly the same or we calculate it if available
        const lagnaRashiD9 = calculateNavamsha(pData["Ascendant"] ? pData["Ascendant"].current_sign : 1, pData["Ascendant"] ? pData["Ascendant"].normDegree : 0);
        
        // Prepare D9 data object
        const pDataD9 = {};
        for (const [p, d] of Object.entries(pData)) {
            pDataD9[p] = { current_sign: calculateNavamsha(d.current_sign, d.normDegree) };
        }
        renderChart("d9", lagnaRashiD9, pDataD9, ak);
        renderRemedyPortal(ak, currentMahadasha);

    } catch (e) {
        console.error("Discovery Error:", e);
        alert("The reference calculator could not complete. Please try again.");
    }
}

function renderChart(prefix, lagna, data, ak) {
    for (let hNum = 1; hNum <= 12; hNum++) {
        const houseRashi = ((lagna + hNum - 2) % 12) + 1;
        const houseEl = document.getElementById(`${prefix}-house-${hNum}`);
        if (!houseEl) continue;

        houseEl.innerHTML = `<span class="house-label">${houseRashi}</span>`;
        
        const planetsInHouse = [];
        const planetSymbols = {
            "sun": "Su", "moon": "Mo", "mars": "Ma", "mercury": "Me",
            "jupiter": "Ju", "venus": "Ve", "saturn": "Sa", "rahu": "Ra", "ketu": "Ke"
        };

        for (let [pName, pObj] of Object.entries(data)) {
            let pNameLower = pName.toLowerCase();
            if (planetSymbols[pNameLower] && pObj.current_sign === houseRashi) {
                const isAK = pNameLower === ak.toLowerCase();
                planetsInHouse.push(`<span class="${isAK ? 'ak-highlight' : ''}">${planetSymbols[pNameLower]}${isAK ? '★' : ''}</span>`);
            }
        }
        houseEl.innerHTML += planetsInHouse.join(" ");
    }
}

function resetDiscovery() {
    const inputState = document.getElementById('discovery-input-state');
    const resultsState = document.getElementById('discovery-results-state');
    if (inputState) inputState.style.display = 'block';
    if (resultsState) resultsState.style.display = 'none';
}

function initReviewStars() {
    const starContainer = document.getElementById('star-rating');
    if (!starContainer) return;

    const stars = starContainer.querySelectorAll('.star-input');
    const starsValue = document.getElementById('stars-value');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = star.getAttribute('data-value');
            starsValue.value = val;
            
            stars.forEach(s => {
                if (s.getAttribute('data-value') <= val) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Set 5 stars by default
    stars[4].click();
}
