#!/usr/bin/env python3
"""Generate a static Swiss Ephemeris transit snapshot for shambhavaa.com.

This script intentionally keeps pyswisseph as a build-time tool. GitHub Pages
cannot run Python, so the website reads the generated JSON file instead.
"""

from __future__ import annotations

import json
import math
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "navagraha-transits.json"

RASHIS = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
]

NAKSHATRAS = [
    "Ashwini",
    "Bharani",
    "Krittika",
    "Rohini",
    "Mrigashira",
    "Ardra",
    "Punarvasu",
    "Pushya",
    "Ashlesha",
    "Magha",
    "Purva Phalguni",
    "Uttara Phalguni",
    "Hasta",
    "Chitra",
    "Swati",
    "Vishakha",
    "Anuradha",
    "Jyeshtha",
    "Mula",
    "Purva Ashadha",
    "Uttara Ashadha",
    "Shravana",
    "Dhanishta",
    "Shatabhisha",
    "Purva Bhadrapada",
    "Uttara Bhadrapada",
    "Revati",
]

PLANETS = [
    ("Sun", "SUN", False),
    ("Moon", "MOON", False),
    ("Mars", "MARS", False),
    ("Mercury", "MERCURY", False),
    ("Jupiter", "JUPITER", False),
    ("Venus", "VENUS", False),
    ("Saturn", "SATURN", False),
    ("Rahu", "MEAN_NODE", True),
]


def fail(message: str) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(1)


def load_swisseph():
    extra_path = os.environ.get("PYSWISSEPH_PATH")
    if extra_path:
        sys.path.insert(0, extra_path)

    try:
        import swisseph as swe  # type: ignore
    except Exception as exc:  # pragma: no cover - environment guard
        fail(
            "Unable to import swisseph. Install pyswisseph or run with "
            "PYSWISSEPH_PATH=/path/to/package. Original error: "
            f"{exc}"
        )

    return swe


def normalize(longitude: float) -> float:
    return longitude % 360.0


def dms(value: float) -> dict[str, int]:
    degrees = int(math.floor(value))
    minutes_float = (value - degrees) * 60
    minutes = int(math.floor(minutes_float))
    seconds = int(round((minutes_float - minutes) * 60))
    if seconds == 60:
        seconds = 0
        minutes += 1
    if minutes == 60:
        minutes = 0
        degrees += 1
    return {"degrees": degrees, "minutes": minutes, "seconds": seconds}


def position_payload(longitude: float, speed: float, source: str) -> dict:
    lon = normalize(longitude)
    sign_index = int(lon // 30)
    sign_degree = lon % 30
    nak_index = int(lon // (360 / 27))
    nak_degree = lon % (360 / 27)
    pada = int(nak_degree // (360 / 108)) + 1

    return {
        "longitude": round(lon, 6),
        "current_sign": sign_index + 1,
        "sign": RASHIS[sign_index],
        "normDegree": round(sign_degree, 6),
        "degreeParts": dms(sign_degree),
        "nakshatra": NAKSHATRAS[nak_index],
        "nakshatraIndex": nak_index + 1,
        "pada": pada,
        "speed": round(speed, 6),
        "isRetro": "true" if speed < 0 else "false",
        "source": source,
    }


def main() -> None:
    swe = load_swisseph()
    now = datetime.now(timezone.utc)
    jd = swe.julday(
        now.year,
        now.month,
        now.day,
        now.hour + now.minute / 60 + now.second / 3600,
        swe.GREG_CAL,
    )

    swe.set_sid_mode(swe.SIDM_LAHIRI)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED

    planets = {}
    for public_name, swe_name, force_retro in PLANETS:
        body = getattr(swe, swe_name)
        data, _flags = swe.calc_ut(jd, body, flags)
        speed = -abs(data[3]) if force_retro else data[3]
        planets[public_name] = position_payload(data[0], speed, "Swiss Ephemeris")

    rahu_longitude = planets["Rahu"]["longitude"]
    ketu_speed = planets["Rahu"]["speed"]
    planets["Ketu"] = position_payload(rahu_longitude + 180, ketu_speed, "Swiss Ephemeris")

    payload = {
        "schemaVersion": 1,
        "generatedAt": now.isoformat(),
        "validHours": 72,
        "engine": "pyswisseph",
        "engineVersion": getattr(swe, "version", "unknown"),
        "ayanamsa": "Lahiri",
        "zodiac": "sidereal",
        "calculationTime": "UTC",
        "licenseNote": "Swiss Ephemeris data generated at build time; pyswisseph source is not bundled in the website.",
        "planets": planets,
    }

    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
