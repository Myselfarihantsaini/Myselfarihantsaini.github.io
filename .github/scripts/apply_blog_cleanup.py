from pathlib import Path
import re

BLOG = "https://shambhavaa.blog"

root = Path.cwd()
index = root / "index.html"
css = root / "css" / "styles.css"
main_js = root / "js" / "main.js"
post = root / "post.html"
data = root / "js" / "data.js"

idx = index.read_text()
idx = idx.replace("Shambhavaa — Daily Astrology Insights", "Shambhavaa - Vedic Astrology Services")
idx = re.sub(r'<meta name="description" content="[^"]*Daily astrology insights[^"]*">', '<meta name="description" content="Vedic astrology services, products, zodiac guidance, and divine services from Shambhavaa.">', idx)
idx = re.sub(r'<a href="#insights">(?:Insights|Blog)</a>', f'<a href="{BLOG}">Blog</a>', idx)
idx = re.sub(r'<li><a href="#insights">(?:Insights|Blog)</a></li>', f'<li><a href="{BLOG}">Blog</a></li>', idx)
idx = re.sub(r'\n\s*<!-- Insights Section -->\s*<section[^>]*id="insights"[\s\S]*?</section>\s*', '\n', idx, count=1)
idx = re.sub(r'\n\s*<script src="js/data\.js[^\"]*"></script>\s*', '\n', idx)
idx = re.sub(r'<a href="#insights">Insights</a>', f'<a href="{BLOG}">Blog</a>', idx)
idx = idx.replace('<div id="gocharChart" class="chart-container">', '<div id="gocharChart" class="gochar-chart">')
for n in range(1, 13):
    idx = re.sub(rf'<div class="house house-{n}"><span>{n}</span></div>', f'<div class="gochar-house house-{n}"><span>{n}</span></div>', idx)
index.write_text(idx)

js = main_js.read_text()
js = re.sub(r',\s*\.post-card', '', js)
js = re.sub(r'function renderPosts\(\) \{[\s\S]*?\n\}\n\n(?=function|//)', '', js, count=1)
js = re.sub(r'\n\s*safeInit\("Posts", renderPosts\);', '', js)
js = re.sub(
    r'el\.innerHTML = `\n\s*<div style="font-size: 1\.1rem; color: var\(--text-light\);">\$\{signName\}</div>\n\s*<div style="font-size: 0\.85rem; color: var\(--text-muted\); margin-top: 2px;">\$\{degStr\}\$\{retro\}</div>\n\s*<div style="font-size: 0\.75rem; color: var\(--primary\); opacity: 0\.8; margin-top: 4px; font-weight: 600;">\$\{stayText\}</div>\n\s*\$\{status\}\n\s*`;',
    'el.innerHTML = `\n                    <span class="transit-sign">${signName}</span>\n                    <span class="transit-degree">${degStr}${retro}</span>\n                    <span class="transit-stay">${stayText}</span>\n                    ${status}\n                `;',
    js,
)
js = re.sub(
    r'const rashiLabel = document\.createElement\(\'div\'\);\n\s*rashiLabel\.style\.fontSize = "0\.7rem";\n\s*rashiLabel\.style\.color = "var\(--primary\)";\n\s*rashiLabel\.style\.marginBottom = "2px";\n\s*rashiLabel\.innerText = houseRashi;',
    "const rashiLabel = document.createElement('span');\n        rashiLabel.className = 'gochar-rashi';\n        rashiLabel.innerText = houseRashi;",
    js,
)
js = re.sub(
    r'const pLabel = document\.createElement\(\'div\'\);\n\s*pLabel\.style\.fontSize = "0\.85rem";\n\s*pLabel\.style\.color = "var\(--text-light\)";\n\s*pLabel\.innerText = planetList\.join\(" "\);',
    "const pLabel = document.createElement('span');\n            pLabel.className = 'gochar-planets';\n            pLabel.innerText = planetList.join(' ');",
    js,
)
main_js.write_text(js)

styles = css.read_text()
add = '''

/* ==================== TRANSIT GRID + GOCHAR CHART ==================== */
.transit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
.transit-card { display: flex; align-items: center; gap: 16px; min-width: 0; padding: 22px; border: 1px solid var(--border-subtle); border-radius: 16px; background: rgba(255,255,255,0.02); }
.transit-icon { display: flex; align-items: center; justify-content: center; flex: 0 0 56px; width: 56px; height: 56px; border-radius: 50%; background: rgba(198,161,91,0.1); color: var(--primary); font-size: 2rem; line-height: 1; }
.transit-details { min-width: 0; }
.transit-sign, .transit-degree, .transit-stay, .transit-status { display: block; }
.transit-sign { color: var(--text-light); font-size: 1.05rem; line-height: 1.25; }
.transit-degree { margin-top: 2px; color: var(--text-muted); font-size: 0.85rem; line-height: 1.25; }
.transit-stay { margin-top: 4px; color: var(--primary); font-size: 0.75rem; font-weight: 600; line-height: 1.25; opacity: 0.85; }
.transit-status { margin-top: 4px; color: var(--primary-light); font-size: 0.8rem; line-height: 1.25; }
.retrograde-marker { color: #ff4d4d; }
.gochar-chart { position: relative; width: min(100%, 370px); margin: 0 auto; aspect-ratio: 1 / 1; border: 2px solid var(--primary); border-radius: 4px; background: rgba(255,255,255,0.01); }
.gochar-house { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; min-height: 28px; padding: 1px 3px; color: var(--text-light); font-weight: 700; line-height: 1.05; text-align: center; pointer-events: none; transform: translate(-50%, -50%); }
.gochar-house > span:first-child { color: var(--primary); font-size: 0.72rem; line-height: 1; }
.gochar-rashi { color: var(--primary-light); font-size: 0.66rem; line-height: 1; white-space: nowrap; }
.gochar-planets { color: var(--text-light); font-size: clamp(0.58rem, 1.5vw, 0.8rem); line-height: 1.05; max-width: 54px; overflow-wrap: anywhere; }
.house-1 { top: 16%; left: 50%; } .house-2 { top: 10%; left: 77%; } .house-3 { top: 30%; left: 91%; } .house-4 { top: 50%; left: 84%; }
.house-5 { top: 70%; left: 91%; } .house-6 { top: 90%; left: 77%; } .house-7 { top: 84%; left: 50%; } .house-8 { top: 90%; left: 23%; }
.house-9 { top: 70%; left: 9%; } .house-10 { top: 50%; left: 16%; } .house-11 { top: 30%; left: 9%; } .house-12 { top: 10%; left: 23%; }
@media (max-width: 576px) {
  .transit-grid { grid-template-columns: 1fr; gap: 14px; }
  .transit-card { padding: 16px; }
  .gochar-chart { width: min(100%, 320px); }
  .gochar-planets { max-width: 44px; }
}
'''
if '.gochar-chart' not in styles:
    styles = styles.rstrip() + add + '\n'
css.write_text(styles)

post.write_text(f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shambhavaa Blog</title>
    <meta http-equiv="refresh" content="0; url={BLOG}">
    <link rel="canonical" href="{BLOG}">
</head>
<body>
    <p>Redirecting to <a href="{BLOG}">Shambhavaa Blog</a>...</p>
</body>
</html>
''')

if data.exists():
    data.unlink()
