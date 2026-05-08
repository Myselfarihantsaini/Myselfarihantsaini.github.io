from pathlib import Path
import re

index = Path('index.html')
main_js = Path('js/main.js')

html = index.read_text()
html = html.replace(
    '<span class="section-tag">2026 Reference Alignments</span>\n                <h2>Navagraha <span class="text-gradient">Transits</span></h2>\n                <p>A stable 2026 sidereal reference map of all 9 grahas for quick guidance.</p>',
    '<span class="section-tag">Live Sidereal Alignments</span>\n                <h2>Navagraha <span class="text-gradient">Transits</span></h2>\n                <p>Real-time Lahiri sidereal positions for all 9 grahas, refreshed automatically from live astronomy data.</p>\n                <p id="transit-source" style="margin-top: 10px; font-size: 0.85rem; color: var(--primary); letter-spacing: 0.04em;"></p>'
)
index.write_text(html)

js = main_js.read_text()
start = js.index('// ---- Reference Navagraha Transits ----')
end = js.index('// ---- Audio Controls', start)
replacement = r'''// ---- Live Navagraha Transits ----
let currentPlanetData = null;
let transitRefreshTimer = null;
const ASTRONOMY_ENGINE_URL = "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js";
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

async function fetchNavagrahaTransits() {
    if (!document.getElementById('navagraha-transits')) return;
    const setLoadingState = (text) => {
        document.querySelectorAll('[id^="transit-"]').forEach((el) => {
            el.innerHTML = `<span class="transit-sign">${text}</span>`;
        });
    };

    try {
        setLoadingState("Loading live position...");
        const astronomy = await loadAstronomyEngine();
        currentPlanetData = buildLiveTransitData(astronomy, new Date());
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
        sourceLabel.textContent = `${isLive ? "Live sidereal data" : "Estimated sidereal data"} • Updated ${now.toLocaleString([], {
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
            const status = (statuses[apiName] && statuses[apiName][signNum])
                ? `<span class="transit-status">${statuses[apiName][signNum]}</span>`
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

'''
js = js[:start] + replacement + js[end:]
main_js.write_text(js)
