from pathlib import Path
import re

ROOT = Path.cwd()
index = ROOT / 'index.html'
main_js = ROOT / 'js' / 'main.js'
PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='

html = index.read_text()
html = html.replace('<link rel="apple-touch-icon" href="assets/logo.png">', '<link rel="apple-touch-icon" href="assets/logo-small.webp">')
html = html.replace('<link rel="icon" type="image/png" sizes="32x32" href="assets/logo.png">', '<link rel="icon" type="image/png" sizes="32x32" href="favicon.ico">')
html = html.replace('<link rel="icon" type="image/png" sizes="16x16" href="assets/logo.png">', '<link rel="icon" type="image/png" sizes="16x16" href="favicon.ico">')
html = html.replace('<meta property="og:image" content="https://shambhavaa.com/assets/cosmic_banner.png">', '<meta property="og:image" content="https://shambhavaa.com/assets/om_bg.webp">')
html = html.replace('<meta name="twitter:image" content="https://shambhavaa.com/assets/cosmic_banner.png">', '<meta name="twitter:image" content="https://shambhavaa.com/assets/om_bg.webp">')
html = html.replace('"image": "https://shambhavaa.com/assets/cosmic_banner.png"', '"image": "https://shambhavaa.com/assets/om_bg.webp"')
html = html.replace('"logo": "https://shambhavaa.com/assets/logo.png"', '"logo": "https://shambhavaa.com/assets/logo-small.webp"')
html = html.replace('css/styles.css?v=5.4', 'css/styles.css?v=5.5')
html = html.replace('js/main.js?v=5.4', 'js/main.js?v=5.5')
html = html.replace('src="assets/logo-small.webp" alt="Shambhava Icon" width="40" height="40" decoding="async">', 'src="assets/logo-small.webp" alt="Shambhava Icon" width="40" height="40" decoding="async">', 1)
html = html.replace('src="assets/logo-small.webp" alt="Shambhava Icon" width="40" height="40" decoding="async">', 'src="assets/logo-small.webp" alt="Shambhava Icon" width="40" height="40" loading="lazy" decoding="async">', 1)
html = re.sub(
    r'<img loading="lazy" decoding="async" width="640" height="427" src="(assets/service-[^"]+\.webp)"',
    rf'<img loading="lazy" decoding="async" width="640" height="427" class="lazy-img" src="{PLACEHOLDER}" data-src="\1"',
    html,
)
html = html.replace(
    '<img loading="lazy" decoding="async" width="640" height="640" src="assets/zodiac_wheel-640.webp" alt="Vedic Zodiac Wheel">',
    f'<img loading="lazy" decoding="async" width="640" height="640" class="lazy-img" src="{PLACEHOLDER}" data-src="assets/zodiac_wheel-640.webp" alt="Vedic Zodiac Wheel">'
)
index.write_text(html)

js = main_js.read_text()
post_start = js.find('// ---- Render Posts on Home Page ----')
post_end = js.find('// ---- Floating Chat Button Logic ----', post_start)
if post_start != -1 and post_end != -1:
    js = js[:post_start] + js[post_end:]

discovery_start = js.find('// ---- Divine Discovery Logic (D1 & D9) ----')
if discovery_start != -1:
    review_start = js.find('function initReviewStars()', discovery_start)
    if review_start != -1:
        js = js[:discovery_start] + '// ---- Review Stars ----\n' + js[review_start:]

lazy_images = r'''function initLazyImages() {
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

'''
if 'function initLazyImages()' not in js:
    js = js.replace('// ---- Scroll Reveal Animation ----', lazy_images + '// ---- Scroll Reveal Animation ----')
js = js.replace('    safeInit("SinglePost", renderSinglePost);\n', '')
if 'safeInit("LazyImages", initLazyImages);' not in js:
    js = js.replace('    safeInit("MobileMenu", initMobileMenu);', '    safeInit("MobileMenu", initMobileMenu);\n    safeInit("LazyImages", initLazyImages);')
main_js.write_text(js)
