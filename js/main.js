// =============================================
// Shambhava — Main JavaScript
// =============================================

// ---- Animated Stars + Sacred Symbols Background ----
function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [], symbols = [], shootingStars = [];
    const STAR_COUNT = window.innerWidth < 768 ? 70 : 140;
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

function initLazyImages() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    const loadImage = (img) => {
        if (!img.dataset.src) return;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.remove('lazy-img');
    };

    if (!('IntersectionObserver' in window)) {
        images.forEach(loadImage);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                loadImage(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '350px 0px' });

    images.forEach((img) => observer.observe(img));
}

// ---- Scroll Reveal Animation ----
function initScrollReveal() {
    const elements = document.querySelectorAll('.zodiac-card, .about-grid, .cta-content, .service-card, .product-card');

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

// ---- Live Navagraha Transits ----
let currentPlanetData = null;
let transitRefreshTimer = null;
let transitSourceMeta = null;
const ASTRONOMY_ENGINE_URL = "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js";
const SWISS_EPHEMERIS_TRANSITS_URL = "data/navagraha-transits.json";
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

function getLahiriAyanamsa(date) {
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const yearProgress = (date.getTime() - yearStart.getTime()) / (365.2425 * 86400000);
    const decimalYear = date.getUTCFullYear() + yearProgress;
    return 24.044 + ((decimalYear - 2000) * 50.290966 / 3600);
}

function tropicalToSidereal(tropicalLongitude, date) {
    return normalizeLongitude(tropicalLongitude - getLahiriAyanamsa(date));
}

function getMeanRahuLongitude(date) {
    const jd = date.getTime() / 86400000 + 2440587.5;
    const t = (jd - 2451545.0) / 36525;
    const meanNode = 125.04452 - (1934.136261 * t) + (0.0020708 * t * t) + (t * t * t / 450000);
    return tropicalToSidereal(meanNode, date);
}

function getFallbackTransitData(date = new Date()) {
    const days = date.getTime() / 86400000;
    const rahuLongitude = getMeanRahuLongitude(date);

    return {
        "Sun": createPlanetPosition(tropicalToSidereal((days / 365.256363) * 360 + 280.46, date), false),
        "Moon": createPlanetPosition(tropicalToSidereal((days / 27.321582) * 360 + 218.32, date), false),
        "Mars": createPlanetPosition(tropicalToSidereal((days / 686.98) * 360 + 150, date), false),
        "Mercury": createPlanetPosition(tropicalToSidereal((days / 87.969) * 360 + 60, date), false),
        "Jupiter": createPlanetPosition(tropicalToSidereal((days / 4332.59) * 360 + 120, date), false),
        "Venus": createPlanetPosition(tropicalToSidereal((days / 224.701) * 360 + 45, date), false),
        "Saturn": createPlanetPosition(tropicalToSidereal((days / 10759.22) * 360 + 300, date), false),
        "Rahu": createPlanetPosition(rahuLongitude, true),
        "Ketu": createPlanetPosition(rahuLongitude + 180, true)
    };
}

function getSiteDataUrl(filePath) {
    const path = window.location.pathname || "";
    const prefix = (path.includes("/resources/") || path.includes("/posts/")) ? "../" : "";
    return `${prefix}${filePath}`;
}

async function loadSwissEphemerisTransits() {
    const response = await fetch(getSiteDataUrl(SWISS_EPHEMERIS_TRANSITS_URL), {
        cache: "no-store"
    });
    if (!response.ok) throw new Error(`Swiss Ephemeris snapshot unavailable: ${response.status}`);

    const snapshot = await response.json();
    if (!snapshot || !snapshot.generatedAt || !snapshot.planets) {
        throw new Error("Swiss Ephemeris snapshot is malformed");
    }

    const generatedAt = new Date(snapshot.generatedAt);
    const validHours = Number(snapshot.validHours || 72);
    const ageHours = (Date.now() - generatedAt.getTime()) / 3600000;
    if (!Number.isFinite(ageHours) || ageHours > validHours) {
        throw new Error("Swiss Ephemeris snapshot is stale");
    }

    return snapshot;
}

function loadAstronomyEngine() {
    if (window.Astronomy) return Promise.resolve(window.Astronomy);

    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${ASTRONOMY_ENGINE_URL}"]`);
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.Astronomy), { once: true });
            existingScript.addEventListener('error', reject, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = ASTRONOMY_ENGINE_URL;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.onload = () => window.Astronomy ? resolve(window.Astronomy) : reject(new Error("Astronomy Engine unavailable"));
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function getLivePlanetLongitude(astronomy, planetName, time) {
    if (planetName === "Moon") {
        return astronomy.EclipticGeoMoon(time).lon;
    }

    const vector = astronomy.GeoVector(astronomy.Body[planetName], time, true);
    return astronomy.Ecliptic(vector).elon;
}

function buildLiveTransitData(astronomy, date = new Date()) {
    const time = astronomy.MakeTime(date);
    const comparisonDate = new Date(date.getTime() + 6 * 60 * 60 * 1000);
    const comparisonTime = astronomy.MakeTime(comparisonDate);
    const liveData = {};

    ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].forEach((planetName) => {
        const tropicalLongitude = getLivePlanetLongitude(astronomy, planetName, time);
        const futureLongitude = getLivePlanetLongitude(astronomy, planetName, comparisonTime);
        const currentSidereal = tropicalToSidereal(tropicalLongitude, date);
        const futureSidereal = tropicalToSidereal(futureLongitude, comparisonDate);
        const movement = normalizeLongitude(futureSidereal - currentSidereal);
        const isRetro = movement > 180;

        liveData[planetName] = createPlanetPosition(currentSidereal, isRetro);
    });

    const rahuLongitude = getMeanRahuLongitude(date);
    liveData.Rahu = createPlanetPosition(rahuLongitude, true);
    liveData.Ketu = createPlanetPosition(rahuLongitude + 180, true);

    return liveData;
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

function initTransitLoading() {
    const section = document.getElementById('navagraha-transits');
    if (!section) return;

    if (!('IntersectionObserver' in window)) {
        fetchNavagrahaTransits();
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            fetchNavagrahaTransits();
        }
    }, { rootMargin: '600px 0px' });
    observer.observe(section);
}

async function fetchNavagrahaTransits() {
    if (!document.getElementById('navagraha-transits')) return;
    const setLoadingState = (text) => {
        document.querySelectorAll('[id^="transit-"]').forEach((el) => {
            el.innerHTML = `<span class="transit-sign">${text}</span>`;
        });
    };

    try {
        setLoadingState("Loading Swiss Ephemeris...");
        const swissSnapshot = await loadSwissEphemerisTransits();
        currentPlanetData = swissSnapshot.planets;
        transitSourceMeta = swissSnapshot;
        renderTransits("swiss");
        return;
    } catch (error) {
        console.warn("Swiss Ephemeris snapshot failed, using live browser calculation:", error);
    }

    try {
        setLoadingState("Loading live position...");
        const astronomy = await loadAstronomyEngine();
        currentPlanetData = buildLiveTransitData(astronomy, new Date());
        transitSourceMeta = null;
        renderTransits(true);

        if (!transitRefreshTimer) {
            transitRefreshTimer = window.setInterval(() => {
                try {
                    currentPlanetData = buildLiveTransitData(astronomy, new Date());
                    renderTransits(true);
                } catch (error) {
                    console.warn("Live transit refresh failed:", error);
                }
            }, 15 * 60 * 1000);
        }
    } catch (error) {
        console.warn("Live transit source failed, using date-based fallback:", error);
        currentPlanetData = getFallbackTransitData(new Date());
        transitSourceMeta = null;
        renderTransits(false);
    }
}

function renderTransits(isLive = false) {
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

    const formatDegrees = (deg) => {
        const d = Math.floor(deg);
        const m = Math.floor((deg - d) * 60);
        return `${d}° ${m}'`;
    };

    const calculateStay = (name, p) => {
        const forwardDegree = p.isRetro === "true" ? p.normDegree : 30 - p.normDegree;
        if (name === "Moon") {
            const days = forwardDegree / 13.18;
            return days < 1 ? `${Math.round(days * 24)}h left` : `${Math.round(days)}d left`;
        }
        if (name === "Sun") {
            return `${Math.round(forwardDegree)}d left`;
        }
        if (name === "Mercury" || name === "Venus" || name === "Mars") {
            const avgSpeeds = { "Mercury": 1.35, "Venus": 1.2, "Mars": 0.52 };
            const days = forwardDegree / avgSpeeds[name];
            return `~${Math.round(days)}d left`;
        }
        if (name === "Rahu" || name === "Ketu") {
            return `~${Math.round(forwardDegree / 0.05295)}d left`;
        }

        const avgSpeeds = { "Jupiter": 0.083, "Saturn": 0.033 };
        return `~${Math.round(forwardDegree / avgSpeeds[name])}d left`;
    };

    const sourceLabel = document.getElementById('transit-source');
    if (sourceLabel) {
        const now = new Date();
        const sourceText = isLive === "swiss"
            ? "Swiss Ephemeris Lahiri sidereal snapshot"
            : (isLive ? "Live sidereal data" : "Estimated sidereal data");
        const sourceTime = (isLive === "swiss" && transitSourceMeta && transitSourceMeta.generatedAt)
            ? new Date(transitSourceMeta.generatedAt)
            : now;
        sourceLabel.textContent = `${sourceText} • Updated ${sourceTime.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })}`;
    }

    const updatePlanet = (apiName, idPrefix) => {
        const p = currentPlanetData[apiName];
        if (p) {
            const signNum = p.current_sign;
            const signName = signs[signNum];
            const degStr = formatDegrees(p.normDegree);
            const retro = p.isRetro === "true" ? ' <span class="retrograde-marker">(R)</span>' : '';
            const stayText = calculateStay(apiName, p);
            const nakshatra = p.nakshatra
                ? `<span class="transit-stay">${p.nakshatra}${p.pada ? ` Pada ${p.pada}` : ""}${p.nakshatraLord ? ` • Lord ${p.nakshatraLord}` : ""}</span>`
                : "";
            const transitMeta = (p.absoluteLongitudeLabel || Number.isFinite(Number(p.longitude)) || Number.isFinite(Number(p.speed)))
                ? `<span class="transit-stay">${p.absoluteLongitudeLabel || `${Number(p.longitude).toFixed(2)}°`} 360°${Number.isFinite(Number(p.speed)) ? ` • Speed ${Number(p.speed).toFixed(4)}°/day` : ""}</span>`
                : "";
            const status = (statuses[apiName] && statuses[apiName][signNum])
                ? `<span class="transit-status">${statuses[apiName][signNum]}</span>`
                : "";

            const el = document.getElementById(`transit-${idPrefix}`);
            if (el) {
                el.innerHTML = `
                    <span class="transit-sign">${signName}</span>
                    <span class="transit-degree">${degStr}${retro}</span>
                    ${nakshatra}
                    ${transitMeta}
                    <span class="transit-stay">${stayText}</span>
                    ${status}
                `;
            }
        }
    };

    const grahas = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    grahas.forEach(g => updatePlanet(g, g.toLowerCase()));

    const selector = document.getElementById('rashi-selector');
    if (selector) updateKundli(parseInt(selector.value || "1", 10));
}

function setupChartSelector() {
    const selector = document.getElementById('rashi-selector');
    if (!selector) return;

    const initialValue = selector.value || "1";
    selector.value = initialValue;
    updateKundli(parseInt(initialValue));

    selector.addEventListener('change', (e) => {
        updateKundli(parseInt(e.target.value));
    });
}

function updateKundli(lagnaRashi) {
    if (!currentPlanetData) return;

    for (let i = 1; i <= 12; i++) {
        const h = document.getElementById(`house-${i}`);
        if (h) h.innerHTML = "";
    }

    const planetSymbols = {
        "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me",
        "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa", "Rahu": "Ra", "Ketu": "Ke"
    };

    for (let hNum = 1; hNum <= 12; hNum++) {
        const houseRashi = ((lagnaRashi + hNum - 2) % 12) + 1;
        const houseEl = document.getElementById(`house-${hNum}`);
        if (!houseEl) continue;

        const rashiLabel = document.createElement('span');
        rashiLabel.className = "gochar-rashi";
        rashiLabel.innerText = houseRashi;
        houseEl.appendChild(rashiLabel);

        const planetList = [];
        for (const [pName, pData] of Object.entries(currentPlanetData)) {
            if (planetSymbols[pName] && pData.current_sign === houseRashi) {
                planetList.push(planetSymbols[pName]);
            }
        }

        if (planetList.length > 0) {
            const pLabel = document.createElement('span');
            pLabel.className = "gochar-planets";
            pLabel.innerText = planetList.join(" ");
            houseEl.appendChild(pLabel);
        }
    }
}

// ---- Audio Controls (Automatic Om Chant) ----
function initAudio() {
    const audio = document.getElementById('om-audio');
    if (!audio) return;

    audio.volume = 0.03;

    const prepareAudio = () => {
        const source = audio.querySelector('source[data-src]');
        if (source && !source.src) {
            source.src = source.dataset.src;
            audio.load();
        }
    };

    const startAudio = () => {
        prepareAudio();
        audio.play().then(() => {
            document.removeEventListener('click', startAudio);
            document.removeEventListener('touchstart', startAudio);
        }).catch(() => {});
    };

    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('touchstart', startAudio, { once: true });
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

const cookieConsentStorageKey = 'shambhavaa_cookie_consent';
let cookieConsentMemory = null;

function getStoredCookieConsent() {
    try {
        if (window.localStorage) {
            return window.localStorage.getItem(cookieConsentStorageKey);
        }
    } catch (error) {
        // Some privacy-focused browser modes disable localStorage.
    }

    try {
        const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${cookieConsentStorageKey}=([^;]*)`));
        if (cookieMatch) return decodeURIComponent(cookieMatch[1]);
    } catch (error) {
        // Keep the banner usable even when cookies are unavailable.
    }

    return cookieConsentMemory;
}

function setStoredCookieConsent(choice) {
    cookieConsentMemory = choice;

    try {
        if (window.localStorage) {
            window.localStorage.setItem(cookieConsentStorageKey, choice);
        }
    } catch (error) {
        // Fall back to a first-party cookie below.
    }

    try {
        const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${cookieConsentStorageKey}=${encodeURIComponent(choice)}; Max-Age=31536000; Path=/; SameSite=Lax${secureFlag}`;
    } catch (error) {
        // In-page memory already captured the choice for this visit.
    }
}

function initLazyAds() {
    const consent = getStoredCookieConsent();
    if (consent !== 'accepted') return;

    document.querySelectorAll('ins.adsbygoogle:not([data-ad-initialized])').forEach((adSlot) => {
        adSlot.dataset.adInitialized = 'true';
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
            console.warn('[Ads] Slot initialization skipped:', error);
        }
    });
}

function updateGoogleConsent(consentValue) {
    if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
            ad_storage: consentValue,
            analytics_storage: consentValue,
            ad_user_data: consentValue,
            ad_personalization: consentValue
        });
    }
}

function initCookieConsent() {
    const existingConsent = getStoredCookieConsent();
    if (existingConsent === 'accepted') {
        updateGoogleConsent('granted');
        initLazyAds();
        return;
    }
    if (existingConsent === 'declined') {
        updateGoogleConsent('denied');
        return;
    }

    const banner = document.createElement('div');
    banner.className = 'cookie-consent is-visible';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
        <p>Shambhavaa uses cookies for basic site functions, analytics, and Google AdSense advertising. You can accept or decline non-essential cookies. Read our <a href="${getSiteDataUrl('cookie-policy.html')}">Cookie Policy</a>.</p>
        <div class="cookie-actions">
            <button type="button" class="cookie-btn" data-cookie-choice="declined">Decline</button>
            <button type="button" class="cookie-btn cookie-btn-primary" data-cookie-choice="accepted">Accept</button>
        </div>
    `;

    banner.addEventListener('click', (event) => {
        const button = event.target.closest('[data-cookie-choice]');
        if (!button) return;
        const choice = button.dataset.cookieChoice;
        setStoredCookieConsent(choice);
        updateGoogleConsent(choice === 'accepted' ? 'granted' : 'denied');
        banner.remove();
        if (choice === 'accepted') initLazyAds();
    });

    document.body.appendChild(banner);
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

    const runWhenIdle = (callback) => {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout: 1800 });
        } else {
            window.setTimeout(callback, 900);
        }
    };

    runWhenIdle(() => safeInit("Stars", initStars));
    safeInit("Navbar", initNavbar);
    safeInit("MobileMenu", initMobileMenu);
    safeInit("LazyImages", initLazyImages);
    safeInit("ChatFab", initChatFab);
    safeInit("Transits", initTransitLoading);
    safeInit("ExternalLinks", secureExternalLinks);
    safeInit("FAQ", initFaqAccessibility);
    safeInit("Forms", initLeadForms);
    safeInit("CookieConsent", initCookieConsent);
    safeInit("ChartSelector", setupChartSelector);
    safeInit("Audio", initAudio);
    safeInit("ReviewStars", initReviewStars);

    setTimeout(() => {
        try { initScrollReveal(); } catch(e) {}
    }, 100);
});

// ---- Review Stars ----
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
