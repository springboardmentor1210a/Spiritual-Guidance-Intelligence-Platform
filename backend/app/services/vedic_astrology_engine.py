"""
Vedic astrology engine backed by the Swiss Ephemeris (pyswisseph).

- Sidereal zodiac with the Lahiri ayanamsa (standard in Indian astrology)
- Uses the built-in Moshier ephemeris, so no ephemeris data files are needed
- Real Ascendant (Lagna) when latitude/longitude are supplied

Install:  pip install pyswisseph
"""
from datetime import datetime, timedelta
from typing import Optional

import swisseph as swe

SIDEREAL_FLAGS = swe.FLG_MOSEPH | swe.FLG_SIDEREAL
NAKSHATRA_SPAN = 360.0 / 27  # 13 deg 20 min


class VedicAstrologyEngine:
    def __init__(self):
        self.zodiac_signs = [
            "Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)",
            "Cancer (Karka)", "Leo (Simha)", "Virgo (Kanya)",
            "Libra (Tula)", "Scorpio (Vrishchika)", "Sagittarius (Dhanus)",
            "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"
        ]
        self.nakshatras = [
            "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
            "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
            "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
            "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
            "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
        ]
        # Vimshottari dasha lords, repeating every 9 nakshatras
        self.lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

    @staticmethod
    def _to_julian_day_ut(year, month, day, hour, minute, utc_offset_hours) -> float:
        """Convert local civil time to a Julian Day in UT (handles day rollover)."""
        local = datetime(year, month, day, hour, minute)
        ut = local - timedelta(hours=utc_offset_hours)
        return swe.julday(ut.year, ut.month, ut.day, ut.hour + ut.minute / 60.0)

    def generate_chart(
        self,
        year: int,
        month: int,
        day: int,
        hour: int = 12,
        minute: int = 0,
        utc_offset_hours: float = 5.5,      # Timezone offset in hours
        city: str = "",
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        location_hierarchy: Optional[dict] = None,
        ayanamsa: str = "Lahiri"
    ):
        # Choose ayanamsa
        if ayanamsa.lower() == "raman":
            swe.set_sid_mode(swe.SIDM_RAMAN)
        elif ayanamsa.lower() in ("kp", "krishnamurti"):
            swe.set_sid_mode(swe.SIDM_KRISHNAMURTI)
        else:
            swe.set_sid_mode(swe.SIDM_LAHIRI)

        jd = self._to_julian_day_ut(year, month, day, hour, minute, utc_offset_hours)

        # 1. Real Ascendant and Houses
        ascendant = None
        asc_long = 0.0
        houses_list = []
        if latitude is not None and longitude is not None:
            cusps, ascmc = swe.houses_ex(jd, latitude, longitude, b"P", swe.FLG_SIDEREAL)
            asc_long = ascmc[0] % 360
            ascendant = self.zodiac_signs[int(asc_long // 30)]
            for h_idx in range(12):
                cusp_long = cusps[h_idx] % 360
                sign_idx = int(cusp_long // 30)
                houses_list.append({
                    "house": h_idx + 1,
                    "sign": self.zodiac_signs[sign_idx],
                    "degree": round(cusp_long % 30, 2),
                    "total_degree": round(cusp_long, 2)
                })

        # 2. Nine Planets (Navagraha)
        planet_specs = [
            ("Sun", swe.SUN),
            ("Moon", swe.MOON),
            ("Mars", swe.MARS),
            ("Mercury", swe.MERCURY),
            ("Jupiter", swe.JUPITER),
            ("Venus", swe.VENUS),
            ("Saturn", swe.SATURN),
            ("Rahu", swe.MEAN_NODE),
        ]

        planets_data = {}
        planets_list = []
        for name, pid in planet_specs:
            p_long = swe.calc_ut(jd, pid, SIDEREAL_FLAGS)[0][0] % 360
            sign_idx = int(p_long // 30)
            sign_deg = round(p_long % 30, 2)
            house_num = int((p_long - asc_long) // 30) % 12 + 1 if ascendant else (sign_idx + 1)
            p_dict = {
                "name": name,
                "sign": self.zodiac_signs[sign_idx],
                "sign_degree": sign_deg,
                "longitude": round(p_long, 2),
                "house": house_num
            }
            planets_data[name.lower()] = p_dict
            planets_list.append(p_dict)

        # Ketu is exactly 180 opposite to Rahu
        rahu_long = planets_data["rahu"]["longitude"]
        ketu_long = (rahu_long + 180.0) % 360
        k_sign_idx = int(ketu_long // 30)
        k_house_num = int((ketu_long - asc_long) // 30) % 12 + 1 if ascendant else (k_sign_idx + 1)
        ketu_dict = {
            "name": "Ketu",
            "sign": self.zodiac_signs[k_sign_idx],
            "sign_degree": round(ketu_long % 30, 2),
            "longitude": round(ketu_long, 2),
            "house": k_house_num
        }
        planets_data["ketu"] = ketu_dict
        planets_list.append(ketu_dict)

        sun_long = planets_data["sun"]["longitude"]
        moon_long = planets_data["moon"]["longitude"]

        sun_sign_idx = int(sun_long // 30)
        moon_sign_idx = int(moon_long // 30)
        nakshatra_idx = int(moon_long // NAKSHATRA_SPAN)
        pada = int((moon_long % NAKSHATRA_SPAN) // (NAKSHATRA_SPAN / 4)) + 1
        ruling_lord = self.lords[nakshatra_idx % 9]

        # 3. Vimshottari Mahadasha Calculation
        dasha_years = {
            "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
            "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
        }
        deg_in_nakshatra = moon_long % NAKSHATRA_SPAN
        fraction_passed = deg_in_nakshatra / NAKSHATRA_SPAN
        birth_lord_years = dasha_years[ruling_lord]
        balance_at_birth = birth_lord_years * (1.0 - fraction_passed)

        # Calculate current age
        birth_dt = datetime(year, month, day)
        now_dt = datetime.now()
        age_years = max(0.0, (now_dt - birth_dt).days / 365.25)

        # Walk through dashas from birth lord onwards
        lord_order = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
        start_idx = lord_order.index(ruling_lord)
        cumulative_years = balance_at_birth
        curr_dasha = ruling_lord

        if age_years > balance_at_birth:
            for step in range(1, 10):
                next_lord = lord_order[(start_idx + step) % 9]
                next_duration = dasha_years[next_lord]
                if cumulative_years + next_duration >= age_years:
                    curr_dasha = next_lord
                    break
                cumulative_years += next_duration

        reading_text = (
            f"Your Vedic chart reveals the Moon in {self.zodiac_signs[moon_sign_idx]}, "
            f"positioned within the sacred {self.nakshatras[nakshatra_idx]} Nakshatra (pada {pada}). "
            f"Governed by {ruling_lord}, this celestial placement empowers your innate "
            f"intuition and soul mission. Your {self.zodiac_signs[sun_sign_idx]} Sun "
            f"provides vital spiritual radiance to illuminate your life path."
        )

        if ascendant:
            insight_text = (
                f"With {ascendant} as your rising sign (Lagna) and {ruling_lord} as your "
                f"Nakshatra lord, your destiny unfolds through deliberate spiritual discipline. "
                f"Currently traversing the {curr_dasha} Mahadasha cycle, harness this planetary "
                f"energy to cultivate personal alignment and transformative growth."
            )
        else:
            insight_text = (
                f"Governed by {ruling_lord} as your Nakshatra lord and undergoing the "
                f"{curr_dasha} Mahadasha cycle, your soul path guides you towards harmonic self-mastery."
            )

        curr_dasha_obj = {
            "mahadasha_lord": curr_dasha,
            "years_duration": dasha_years.get(curr_dasha, 7)
        }

        return {
            "sun_sign": self.zodiac_signs[sun_sign_idx],
            "moon_sign": self.zodiac_signs[moon_sign_idx],
            "ascendant": ascendant or "Needs birth place",
            "ascendant_degree": round(asc_long % 30, 2) if ascendant else 0.0,
            "sun_longitude": round(sun_long, 2),
            "moon_longitude": round(moon_long, 2),
            "nakshatra_index": nakshatra_idx + 1,
            "nakshatra": self.nakshatras[nakshatra_idx],
            "nakshatra_pada": pada,
            "ruling_lord": ruling_lord,
            "current_mahadasha": curr_dasha_obj,
            "birth_dasha_balance_years": round(balance_at_birth, 2),
            "ayanamsa": ayanamsa.capitalize(),
            "planets": planets_list,
            "houses": houses_list,
            "reading": reading_text,
            "vedic_insight": insight_text,
            "location_name": city or "Custom Coordinates",
            "coordinates": {
                "latitude": latitude,
                "longitude": longitude
            },
            "timezone_offset": utc_offset_hours,
            "location_hierarchy": location_hierarchy or {}
        }


vedic_engine = VedicAstrologyEngine()