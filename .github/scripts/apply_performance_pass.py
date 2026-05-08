from pathlib import Path
import re
from PIL import Image

ROOT = Path.cwd()
ASSETS = ROOT / 'assets'
WEBP_QUALITY = 68


def save_webp(src_name, dest_name, max_size=None, quality=WEBP_QUALITY):
    src = ASSETS / src_name
    if not src.exists():
        return False
    dest = ASSETS / dest_name
    with Image.open(src) as img:
        img = img.convert('RGB')
        if max_size:
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest, 'WEBP', quality=quality, method=6)
    return True


save_webp('om_bg.png', 'om_bg.webp', max_size=900, quality=62)
save_webp('card_background.png', 'card_background.webp', max_size=760, quality=62)
save_webp('logo.png', 'logo-small.webp', max_size=96, quality=72)
save_webp('zodiac_wheel.png', 'zodiac_wheel-640.webp', max_size=640, quality=70)
for src in ASSETS.glob('service-*.jpg'):
    save_webp(src.name, f'{src.stem}.webp', max_size=640, quality=68)

index = ROOT / 'index.html'
html = index.read_text()
html = html.replace('css/styles.css?v=5.2', 'css/styles.css?v=5.4')
if 'css/styles.css?v=' not in html:
    html = html.replace('css/styles.css', 'css/styles.css?v=5.4')
html = html.replace('js/main.js?v=5.2', 'js/main.js?v=5.4')
html = re.sub(r'<script src="js/main\.js([^\"]*)"></script>', r'<script defer src="js/main.js\1"></script>', html)
html = re.sub(r'<script async src="https://pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js\?client=ca-pub-9194178610009666" crossorigin="anonymous"></script>\s*', '', html)
html = html.replace(
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Playfair+Display:wght@400;700&display=swap'
)
html = html.replace('<link rel="preload" href="assets/om_bg.png" as="image">', '<link rel="preload" href="assets/om_bg.webp" as="image" type="image/webp">')
html = html.replace('<link rel="icon" type="image/png" sizes="32x32" href="assets/logo.png">', '<link rel="icon" type="image/png" sizes="32x32" href="favicon.ico">')
html = html.replace('<link rel="icon" type="image/png" sizes="16x16" href="assets/logo.png">', '<link rel="icon" type="image/png" sizes="16x16" href="favicon.ico">')
html = html.replace('<img src="assets/logo.png" alt="Shambhava Icon">', '<img src="assets/logo-small.webp" alt="Shambhava Icon" width="40" height="40" decoding="async">')
html = html.replace('<img src="assets/zodiac_wheel.png" alt="Vedic Zodiac Wheel">', '<img loading="lazy" decoding="async" width="640" height="640" src="assets/zodiac_wheel-640.webp" alt="Vedic Zodiac Wheel">')
html = re.sub(
    r'<section class="ad-section container">\s*<ins class="adsbygoogle"[\s\S]*?</script>\s*</section>',
    '<section class="ad-section container" aria-label="Sponsored"></section>',
    html
)
html = re.sub(
    r'<audio id="om-audio" loop>\s*<source src="om\.mp3" type="audio/mpeg">\s*</audio>',
    '<audio id="om-audio" loop preload="none">\n        <source data-src="om.mp3" type="audio/mpeg">\n    </audio>',
    html
)
service_pattern = re.compile(r'<img(?![^>]*\bloading=)([^>]*?)src="assets/(service-[^".]+)\.jpg"([^>]*?)>')

def service_repl(match):
    before, stem, after = match.groups()
    return f'<img loading="lazy" decoding="async" width="640" height="427"{before}src="assets/{stem}.webp"{after}>'

html = service_pattern.sub(service_repl, html)
html = re.sub(r'<img loading="lazy" src="assets/(service-[^".]+)\.jpg"', r'<img loading="lazy" decoding="async" width="640" height="427" src="assets/\1.webp"', html)
index.write_text(html)

css_path = ROOT / 'css' / 'styles.css'
css = css_path.read_text()
css = css.replace("url('../assets/om_bg.png')", "url('../assets/om_bg.webp')")
css = css.replace("url('../assets/card_background.png')", "url('../assets/card_background.webp')")
css_path.write_text(css)

main_path = ROOT / 'js' / 'main.js'
js = main_path.read_text()
js = js.replace('const STAR_COUNT = 220;', 'const STAR_COUNT = window.innerWidth < 768 ? 70 : 140;')

ad_block = r'''let adsenseScriptPromise = null;

function loadAdsenseScript() {
    if (window.adsbygoogle && document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
        return Promise.resolve();
    }
    if (adsenseScriptPromise) return adsenseScriptPromise;

    adsenseScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9194178610009666';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    return adsenseScriptPromise;
}

function initializeAdSlot(container) {
    if (!container || container.dataset.initialized === 'true') return;

    const ad = document.createElement('ins');
    ad.className = 'adsbygoogle';
    ad.style.display = 'block';
    ad.setAttribute('data-ad-client', 'ca-pub-9194178610009666');
    ad.setAttribute('data-ad-slot', 'auto');
    ad.setAttribute('data-ad-format', 'auto');
    ad.setAttribute('data-full-width-responsive', 'true');
    container.appendChild(ad);
    container.dataset.initialized = 'true';

    loadAdsenseScript().then(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
            console.warn('AdSense slot could not be initialized.', error);
        }
    }).catch((error) => console.warn('AdSense could not be loaded.', error));
}

function initLazyAds() {
    const adSections = document.querySelectorAll('.ad-section');
    if (!adSections.length) return;

    const loadAllAds = () => adSections.forEach(initializeAdSlot);
    if (!('IntersectionObserver' in window)) {
        window.setTimeout(loadAllAds, 4500);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                initializeAdSlot(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '700px 0px' });

    adSections.forEach((section) => observer.observe(section));
}

'''
js = re.sub(r'function initializeAdSlot\(container\) \{[\s\S]*?\n\}\n\n(?=function initializeUtterances)', ad_block, js, count=1)

transit_loader = r'''function initTransitLoading() {
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

'''
if 'function initTransitLoading()' not in js:
    js = js.replace('async function fetchNavagrahaTransits() {', transit_loader + 'async function fetchNavagrahaTransits() {')

js = re.sub(r'function initAudio\(\) \{[\s\S]*?\n\}\n\n(?=function secureExternalLinks)', r'''function initAudio() {
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

''', js, count=1)
js = js.replace('    safeInit("Stars", initStars);', '''    const runWhenIdle = (callback) => {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout: 1800 });
        } else {
            window.setTimeout(callback, 900);
        }
    };

    runWhenIdle(() => safeInit("Stars", initStars));''')
js = js.replace('    safeInit("Transits", fetchNavagrahaTransits);', '    safeInit("Transits", initTransitLoading);')
if 'safeInit("LazyAds", initLazyAds);' not in js:
    js = js.replace('    safeInit("Forms", initLeadForms);', '    safeInit("Forms", initLeadForms);\n    safeInit("LazyAds", initLazyAds);')
main_path.write_text(js)
