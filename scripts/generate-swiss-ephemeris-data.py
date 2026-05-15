#!/usr/bin/env python3
"""Generate a static Swiss Ephemeris transit snapshot for shambhavaa.com.

This script intentionally keeps pyswisseph as a build-time tool. GitHub Pages
cannot run Python, so the website reads the generated JSON file instead.
"""

from __future__ import annotations

import json
import math
import os
import subprocess
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

SWETEST_PLANET_INDEXES = {
    0: "Sun",
    1: "Moon",
    2: "Mercury",
    3: "Venus",
    4: "Mars",
    5: "Jupiter",
    6: "Saturn",
    10: "Rahu",
}


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


def configure_ephemeris_path(swe) -> None:
    ephe_path = os.environ.get("SWISS_EPHE_PATH")
    if ephe_path:
        swe.set_ephe_path(ephe_path)


def normalize(longitude: float) -> float:
    return longitude % 360.0


def angular_delta(first: float, second: float) -> float:
    return abs((first - second + 180) % 360 - 180)


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


def swetest_validation(now: datetime, planets: dict) -> dict | None:
    swetest_bin = os.environ.get("SWETEST_BIN")
    if not swetest_bin:
        return None

    swetest_path = Path(swetest_bin).expanduser()
    tolerance = float(os.environ.get("SWETEST_TOLERANCE_DEGREES", "0.01"))
    args = [
        str(swetest_path),
        f"-b{now.day:02d}.{now.month:02d}.{now.year}",
        f"-ut{now.hour:02d}:{now.minute:02d}:{now.second:02d}",
        "-sid1",
        "-p0123456m",
        "-fpls",
        "-g,",
        "-head",
    ]

    ephe_path = os.environ.get("SWETEST_EPHE_PATH")
    if ephe_path:
        args.insert(1, f"-edir{Path(ephe_path).expanduser()}")

    try:
        result = subprocess.run(args, check=True, capture_output=True, text=True, timeout=20)
    except Exception as exc:
        return {
            "tool": "swetest",
            "status": "warning",
            "checkedAt": now.isoformat(),
            "message": f"swetest validation skipped: {exc}",
        }

    comparisons = []
    max_delta = 0.0
    for line in result.stdout.splitlines():
        parts = [part.strip() for part in line.split(",")]
        if len(parts) < 3:
            continue
        try:
            index = int(parts[0])
            longitude = normalize(float(parts[1]))
        except ValueError:
            continue
        public_name = SWETEST_PLANET_INDEXES.get(index)
        if not public_name or public_name not in planets:
            continue
        delta = angular_delta(planets[public_name]["longitude"], longitude)
        max_delta = max(max_delta, delta)
        comparisons.append(
            {
                "planet": public_name,
                "generatedLongitude": planets[public_name]["longitude"],
                "swetestLongitude": round(longitude, 6),
                "deltaDegrees": round(delta, 8),
            }
        )

    status = "passed" if comparisons and max_delta <= tolerance else "warning"
    return {
        "tool": "swetest",
        "status": status,
        "checkedAt": now.isoformat(),
        "comparison": "Lahiri sidereal longitude",
        "toleranceDegrees": tolerance,
        "maxLongitudeDeltaDegrees": round(max_delta, 8),
        "planetsChecked": len(comparisons),
        "note": "swetest was used as a local build-time validator only; its source, binary, and ephemeris files are not bundled in the website.",
        "comparisons": comparisons,
    }


def main() -> None:
    swe = load_swisseph()
    configure_ephemeris_path(swe)
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
    validation = swetest_validation(now, planets)
    if validation:
        payload["validation"] = validation

    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
