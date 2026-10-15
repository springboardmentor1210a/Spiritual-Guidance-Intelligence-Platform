from datetime import datetime
from typing import Dict, Any

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", 
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", 
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", 
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", 
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

PLANETARY_LORDS = {
    "Sun": ["Krittika", "Uttara Phalguni", "Uttara Ashadha"],
    "Moon": ["Rohini", "Hasta", "Shravana"],
    "Mars": ["Mrigashira", "Chitra", "Dhanishta"],
    "Mercury": ["Ashlesha", "Jyeshtha", "Revati"],
    "Jupiter": ["Punarvasu", "Vishakha", "Purva Bhadrapada"],
    "Venus": ["Bharani", "Purva Phalguni", "Purva Ashadha"],
    "Saturn": ["Pushya", "Anuradha", "Uttara Bhadrapada"],
    "Rahu": ["Ardra", "Swati", "Shatabhisha"],
    "Ketu": ["Ashwini", "Magha", "Mula"]
}

class VedicAstrologyEngine:
    def calculate_kundali(self, birth_date: str, birth_time: str, latitude: float, longitude: float) -> Dict[str, Any]:
        dt = None
        for fmt in ("%Y-%m-%d", "%d-%m-%Y"):
            try:
                dt = datetime.strptime(f"{birth_date} {birth_time}", f"{fmt} %H:%M")
                break
            except ValueError:
                continue
                
        if not dt:
            dt = datetime.now()

        day_of_year = dt.timetuple().tm_yday
        nakshatra_idx = (day_of_year + int(latitude)) % len(NAKSHATRAS)
        nakshatra = NAKSHATRAS[nakshatra_idx]
        
        ruling_lord = "Unknown"
        for lord, nak_list in PLANETARY_LORDS.items():
            if nakshatra in nak_list:
                ruling_lord = lord
                break

        return {
            "birth_timestamp": f"{birth_date} {birth_time}",
            "coordinates": {"lat": latitude, "lon": longitude},
            "nakshatra": nakshatra,
            "nakshatra_index": nakshatra_idx + 1,
            "ruling_lord": ruling_lord,
            "ascendant": "Taurus" if day_of_year % 2 == 0 else "Scorpio",
            "moon_sign": "Cancer" if nakshatra_idx % 2 == 0 else "Pisces",
            "vedic_insight": f"Born under the {nakshatra} lunar mansion ruled by {ruling_lord}. Strong intuitive and karmic alignment."
        }