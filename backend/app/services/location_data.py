"""
Comprehensive Geographic Hierarchy and Geocoding Service for Vedic Astrology.
Supports multi-level location resolution:
Country -> State / Province -> District -> Mandal / Taluk / Tehsil -> City / Town -> Village / Locality
with accurate Latitude, Longitude, and Timezone offsets.
"""

from typing import Dict, Any, List, Optional
import httpx
import math

# ============================================================
# COMPREHENSIVE INDIAN GEOGRAPHIC HIERARCHY
# ============================================================

INDIA_HIERARCHY: Dict[str, Dict[str, Any]] = {
    "Andhra Pradesh": {
        "timezone": "Asia/Kolkata",
        "offset": 5.5,
        "districts": {
            "Krishna": {
                "mandals": {
                    "Vijayawada Urban": {"lat": 16.5062, "lon": 80.6480, "places": ["Vijayawada", "Benz Circle", "Governorpet", "Gandhinagar", "Bhavanipuram", "Patamata"]},
                    "Vijayawada Rural": {"lat": 16.5320, "lon": 80.6050, "places": ["Enikepadu", "Gannavaram Road", "Nidamanuru", "Nunna", "Gollapudi"]},
                    "Gannavaram": {"lat": 16.5417, "lon": 80.8017, "places": ["Gannavaram", "Airport Locality", "Kesarapalle", "Savargudem"]},
                    "Penamaluru": {"lat": 16.4812, "lon": 80.7025, "places": ["Penamaluru", "Poranki", "Kanuru", "Tadigadapa", "Yenamalakuduru"]},
                    "Machilipatnam": {"lat": 16.1875, "lon": 81.1389, "places": ["Machilipatnam", "Bandar Port", "Chilakalapudi", "Rustumbada"]},
                    "Gudivada": {"lat": 16.4350, "lon": 80.9925, "places": ["Gudivada", "Bantumilli Road", "Valivartipadu", "Mallayapalem"]},
                    "Nuzvid": {"lat": 16.7850, "lon": 80.8467, "places": ["Nuzvid", "Hanuman Junction", "Musaligunta", "Tukkuluru"]}
                }
            },
            "Guntur": {
                "mandals": {
                    "Guntur Urban": {"lat": 16.3067, "lon": 80.4365, "places": ["Guntur City", "Arundelpet", "Brodipet", "Kothapet", "Pattabhipuram", "Old Guntur"]},
                    "Guntur Rural": {"lat": 16.2800, "lon": 80.4000, "places": ["Gorantla", "Nallapadu", "Ankireddypalem", "Etukuru", "Pedakakani"]},
                    "Tenali": {"lat": 16.2430, "lon": 80.6400, "places": ["Tenali", "Chenchupet", "Ithanagar", "Morrispet", "Angalakuduru"]},
                    "Mangalagiri": {"lat": 16.4300, "lon": 80.5500, "places": ["Mangalagiri", "Panakala Swamy Temple Area", "Atmakuru", "Navuluru", "Yerrabalem"]},
                    "Bapatla": {"lat": 15.9042, "lon": 80.4675, "places": ["Bapatla", "Suryalanka", "Karlapalem", "Appikatla"]},
                    "Narasaraopet": {"lat": 16.2361, "lon": 80.0528, "places": ["Narasaraopet", "Kotappakonda", "Prakash Nagar", "Palnadu Road"]},
                    "Sattenapalle": {"lat": 16.3967, "lon": 80.1500, "places": ["Sattenapalle", "Dhulipalla", "Kandlagunta", "Rompicherla"]}
                }
            },
            "Bapatla": {
                "mandals": {
                    "Chirala": {"lat": 15.8246, "lon": 80.3521, "places": ["Chirala", "Perala", "Vadarevu", "Chirala Cotton Market", "Ipurupalem", "Vetapalem Road", "Chirala Beach"]},
                    "Bapatla": {"lat": 15.9042, "lon": 80.4675, "places": ["Bapatla", "Suryalanka Beach", "Karlapalem", "Appikatla", "Agri University"]},
                    "Vetapalem": {"lat": 15.7833, "lon": 80.3167, "places": ["Vetapalem", "Kothapeta", "Bandarivaripalem", "Pandillapalle"]},
                    "Karamchedu": {"lat": 15.9000, "lon": 80.2667, "places": ["Karamchedu", "Daggubadu", "Kodavaluru"]},
                    "Chinaganjam": {"lat": 15.7000, "lon": 80.2500, "places": ["Chinaganjam", "Pedaganjam", "Motta Palle"]},
                    "Parchur": {"lat": 15.9667, "lon": 80.2667, "places": ["Parchur", "Inkollu", "Nagandla", "Adusumalli"]}
                }
            },
            "Prakasam": {
                "mandals": {
                    "Ongole Urban": {"lat": 15.5057, "lon": 80.0499, "places": ["Ongole City", "Trunk Road", "Kurnool Road", "Mangamuru Road", "RIMS Ongole"]},
                    "Singarayakonda": {"lat": 15.2500, "lon": 80.0333, "places": ["Singarayakonda", "Pakala Beach", "Somarajupalli"]},
                    "Kandukur": {"lat": 15.2167, "lon": 79.9000, "places": ["Kandukur", "Malakonda", "Ulavapadu", "Gudluru"]},
                    "Markapur": {"lat": 15.7333, "lon": 79.2833, "places": ["Markapur", "Slate Town", "Podili", "Tarlupadu"]},
                    "Addanki": {"lat": 15.8167, "lon": 79.9833, "places": ["Addanki", "Singarakonda", "Medarametla", "Ballikurava"]},
                    "Chirala Division": {"lat": 15.8246, "lon": 80.3521, "places": ["Chirala", "Perala"]}
                }
            },
            "Nellore": {
                "mandals": {
                    "Nellore Urban": {"lat": 14.4426, "lon": 79.9865, "places": ["Nellore City", "Stonehousepet", "Magunta Layout", "Dargamitta", "Vedayapalem"]},
                    "Kavali": {"lat": 14.9131, "lon": 79.9928, "places": ["Kavali", "Allur", "Bitragunta", "Kavali Beach"]},
                    "Gudur": {"lat": 14.1464, "lon": 79.8504, "places": ["Gudur", "Kota", "Vakadu", "Chillakur"]}
                }
            },
            "Palnadu": {
                "mandals": {
                    "Narasaraopet": {"lat": 16.2361, "lon": 80.0528, "places": ["Narasaraopet", "Kotappakonda", "Prakash Nagar"]},
                    "Sattenapalle": {"lat": 16.3967, "lon": 80.1500, "places": ["Sattenapalle", "Dhulipalla", "Kandlagunta"]},
                    "Macherla": {"lat": 16.4800, "lon": 79.3000, "places": ["Macherla", "Nagarjuna Sagar", "Karempudi"]}
                }
            },
            "Visakhapatnam": {
                "mandals": {
                    "Visakhapatnam Urban": {"lat": 17.6868, "lon": 83.2185, "places": ["Vizag Central", "MVP Colony", "Siripuram", "Dwaraka Nagar", "Beach Road", "Jagadamba"]},
                    "Gajuwaka": {"lat": 17.6900, "lon": 83.1500, "places": ["Gajuwaka", "Steel Plant Township", "Auto Nagar", "Kurmannapalem", "Duvvada"]},
                    "Bheemunipatnam": {"lat": 17.8900, "lon": 83.4500, "places": ["Bheemili", "Insignia Beach", "Tagarapuvalasa", "Anandapuram"]},
                    "Anakapalle": {"lat": 17.6917, "lon": 83.0039, "places": ["Anakapalle", "Ring Road", "Kasimkota", "Munagapaka"]},
                    "Pendurthi": {"lat": 17.8200, "lon": 83.2000, "places": ["Pendurthi", "Suvarnanagar", "Chintagatla", "Vepagunta"]}
                }
            },
            "Tirupati": {
                "mandals": {
                    "Tirupati Urban": {"lat": 13.6288, "lon": 79.4192, "places": ["Tirupati", "Alipiri", "Tirumala Hills", "Bhavani Nagar", "Korlagunta", "Renigunta Road"]},
                    "Tirupati Rural": {"lat": 13.6100, "lon": 79.3800, "places": ["Chandragiri", "Peruru", "Avilala", "Tiruchanur", "Daminedu"]},
                    "Srikalahasti": {"lat": 13.7500, "lon": 79.7000, "places": ["Srikalahasti", "Subbaiah Thota", "Panagal", "Bahuda River Area"]},
                    "Puttur": {"lat": 13.4417, "lon": 79.5528, "places": ["Puttur", "Nagari", "Vadamalapeta", "Karvetinagar"]}
                }
            },
            "East Godavari": {
                "mandals": {
                    "Kakinada": {"lat": 16.9891, "lon": 82.2475, "places": ["Kakinada Port", "Bhanugudi", "Suryaraopeta", "Madhavapatnam"]},
                    "Rajamahendravaram": {"lat": 17.0005, "lon": 81.8040, "places": ["Rajahmundry", "Godavari Bund", "Danavaipeta", "Kotipalli", "Morampudi"]}
                }
            },
            "Kurnool": {
                "mandals": {
                    "Kurnool Urban": {"lat": 15.8281, "lon": 78.0373, "places": ["Kurnool", "Nandyal Road", "B Camp", "Joharapuram", "Kallur"]},
                    "Adoni": {"lat": 15.6322, "lon": 77.2728, "places": ["Adoni", "Alur", "Yemmiganur", "Aspari"]}
                }
            }
        }
    },
    "Telangana": {
        "timezone": "Asia/Kolkata",
        "offset": 5.5,
        "districts": {
            "Hyderabad": {
                "mandals": {
                    "Khairatabad": {"lat": 17.4123, "lon": 78.4608, "places": ["Khairatabad", "Banjara Hills", "Jubilee Hills", "Somajiguda", "Panjagutta"]},
                    "Charminar": {"lat": 17.3616, "lon": 78.4747, "places": ["Old City", "Charminar", "Falaknuma", "Bahadurpura", "Chandrayangutta"]},
                    "Secunderabad": {"lat": 17.4399, "lon": 78.4983, "places": ["Secunderabad Station", "Begumpet", "Marredpally", "Tarnaka", "Trimulgherry"]},
                    "Ameerpet": {"lat": 17.4375, "lon": 78.4482, "places": ["Ameerpet", "SR Nagar", "Sanjeeva Reddy Nagar", "Balkampet"]},
                    "Musheerabad": {"lat": 17.4180, "lon": 78.5020, "places": ["Musheerabad", "Chikkadpally", "Gandhinagar", "Ramnagar", "Kavadiguda"]}
                }
            },
            "Rangareddy": {
                "mandals": {
                    "Serilingampally": {"lat": 17.4834, "lon": 78.3158, "places": ["Gachibowli", "Hitec City", "Madhapur", "Kondapur", "Financial District", "Tellapur"]},
                    "Rajendranagar": {"lat": 17.3167, "lon": 78.4000, "places": ["Rajendranagar", "Attapur", "Budvel", "Shamshabad", "Airport Zone"]},
                    "Ibrahimpatnam": {"lat": 17.1950, "lon": 78.6475, "places": ["Ibrahimpatnam", "Manchal", "Yacharam", "Kandukur"]}
                }
            },
            "Medchal-Malkajgiri": {
                "mandals": {
                    "Kukatpally": {"lat": 17.4875, "lon": 78.4039, "places": ["Kukatpally Housing Board (KPHB)", "Nizampet", "Pragathi Nagar", "Hydernagar", "Bachupally"]},
                    "Malkajgiri": {"lat": 17.4520, "lon": 78.5300, "places": ["Malkajgiri", "Alwal", "Neredmet", "Sainikpuri", "Kapra"]},
                    "Uppal": {"lat": 17.4022, "lon": 78.5600, "places": ["Uppal", "Habsiguda", "Boduppal", "Peerzadiguda", "Nacharam"]}
                }
            },
            "Warangal": {
                "mandals": {
                    "Warangal Urban": {"lat": 17.9689, "lon": 79.5941, "places": ["Warangal", "Hanamkonda", "Kazipet", "Subedari", "Bhadrakali Temple Area"]}
                }
            }
        }
    },
    "Karnataka": {
        "timezone": "Asia/Kolkata",
        "offset": 5.5,
        "districts": {
            "Bengaluru Urban": {
                "mandals": {
                    "Bengaluru North": {"lat": 13.0358, "lon": 77.5970, "places": ["Hebbal", "Yelahanka", "Malleswaram", "Yeshwanthpur", "Sahakara Nagar"]},
                    "Bengaluru South": {"lat": 12.9250, "lon": 77.5850, "places": ["Jayanagar", "JP Nagar", "Banashankari", "BTM Layout", "Kanakapura Road"]},
                    "Bengaluru East": {"lat": 12.9716, "lon": 77.6412, "places": ["Indiranagar", "Koramangala", "Whitefield", "Marathahalli", "Electronic City", "Bellandur"]}
                }
            },
            "Mysuru": {
                "mandals": {
                    "Mysuru Taluk": {"lat": 12.2958, "lon": 76.6394, "places": ["Mysuru Palace Area", "Gokulam", "Vijayanagar", "Jayalakshmipuram", "Chamundi Hill"]}
                }
            }
        }
    },
    "Tamil Nadu": {
        "timezone": "Asia/Kolkata",
        "offset": 5.5,
        "districts": {
            "Chennai": {
                "mandals": {
                    "Chennai Central": {"lat": 13.0827, "lon": 80.2707, "places": ["George Town", "T. Nagar", "Mylapore", "Alwarpet", "Nungambakkam", "Triplicane"]},
                    "South Chennai": {"lat": 12.9800, "lon": 80.2200, "places": ["Adyar", "Besant Nagar", "Velachery", "Guindy", "Thiruvanmiyur", "OMR IT Corridor"]}
                }
            },
            "Coimbatore": {
                "mandals": {
                    "Coimbatore North": {"lat": 11.0168, "lon": 76.9558, "places": ["RS Puram", "Gandhipuram", "Peelamedu", "Saibaba Colony", "Saravanampatti"]}
                }
            }
        }
    },
    "Maharashtra": {
        "timezone": "Asia/Kolkata",
        "offset": 5.5,
        "districts": {
            "Mumbai": {
                "mandals": {
                    "Mumbai City": {"lat": 18.9388, "lon": 72.8354, "places": ["Colaba", "Marine Drive", "Fort", "Nariman Point", "Dadar", "Worli", "Lower Parel"]},
                    "Mumbai Suburban": {"lat": 19.0760, "lon": 72.8777, "places": ["Bandra", "Andheri West", "Andheri East", "Juhu", "Borivali", "Goregaon", "Powai"]}
                }
            },
            "Pune": {
                "mandals": {
                    "Pune City": {"lat": 18.5204, "lon": 73.8567, "places": ["Shivajinagar", "Kothrud", "Aundh", "Baner", "Koregaon Park", "Viman Nagar", "Deccan"]},
                    "Haveli (Pimpri-Chinchwad)": {"lat": 18.6279, "lon": 73.8009, "places": ["Pimpri", "Chinchwad", "Wakad", "Hinjawadi IT Park", "Pimple Saudagar"]}
                }
            }
        }
    },
    "Delhi NCR": {
        "timezone": "Asia/Kolkata",
        "offset": 5.5,
        "districts": {
            "New Delhi": {
                "mandals": {
                    "Chanakyapuri": {"lat": 28.5983, "lon": 77.1970, "places": ["Connaught Place", "India Gate", "Lodi Road", "Chanakyapuri", "Barakhamba"]},
                    "South Delhi": {"lat": 28.5355, "lon": 77.2280, "places": ["Hauz Khas", "Greater Kailash", "Saket", "Vasant Kunj", "Nehru Place"]}
                }
            }
        }
    },
    "Uttar Pradesh": {
        "timezone": "Asia/Kolkata",
        "offset": 5.5,
        "districts": {
            "Varanasi": {
                "mandals": {
                    "Varanasi Sadar": {"lat": 25.3176, "lon": 82.9739, "places": ["Kashi Vishwanath Ghats", "Assi Ghat", "Dashashwamedh", "BHU Campus", "Sarnath"]}
                }
            },
            "Lucknow": {
                "mandals": {
                    "Lucknow Sadar": {"lat": 26.8467, "lon": 80.9462, "places": ["Hazratganj", "Gomti Nagar", "Alambagh", "Indira Nagar", "Chowk"]}
                }
            }
        }
    }
}

# ============================================================
# WORLD COUNTRIES WITH KEY CITIES & TIMEZONES
# ============================================================

WORLD_LOCATIONS: List[Dict[str, Any]] = [
    {"country": "United States", "state": "California", "district": "Los Angeles County", "mandal": "Los Angeles", "city": "Los Angeles", "lat": 34.0522, "lon": -118.2437, "timezone": "America/Los_Angeles", "offset": -8.0},
    {"country": "United States", "state": "New York", "district": "New York County", "mandal": "Manhattan", "city": "New York City", "lat": 40.7128, "lon": -74.0060, "timezone": "America/New_York", "offset": -5.0},
    {"country": "United Kingdom", "state": "Greater London", "district": "City of Westminster", "mandal": "Westminster", "city": "London", "lat": 51.5074, "lon": -0.1278, "timezone": "Europe/London", "offset": 0.0},
    {"country": "United Arab Emirates", "state": "Dubai", "district": "Dubai", "mandal": "Bur Dubai", "city": "Dubai", "lat": 25.2048, "lon": 55.2708, "timezone": "Asia/Dubai", "offset": 4.0},
    {"country": "Singapore", "state": "Central Region", "district": "Downtown Core", "mandal": "Singapore", "city": "Singapore", "lat": 1.3521, "lon": 103.8198, "timezone": "Asia/Singapore", "offset": 8.0},
    {"country": "Australia", "state": "New South Wales", "district": "Sydney", "mandal": "Sydney CBD", "city": "Sydney", "lat": -33.8688, "lon": 151.2093, "timezone": "Australia/Sydney", "offset": 10.0},
    {"country": "Canada", "state": "Ontario", "district": "Toronto", "mandal": "Old Toronto", "city": "Toronto", "lat": 43.6532, "lon": -79.3832, "timezone": "America/Toronto", "offset": -5.0},
]


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def estimate_timezone_offset(lat: float, lon: float) -> tuple[str, float]:
    """
    Computes standard timezone and offset based on coordinates.
    Indian bounds: lat 8..37, lon 68..97 -> Asia/Kolkata (+5.5)
    """
    if 6.0 <= lat <= 38.0 and 68.0 <= lon <= 98.0:
        return "Asia/Kolkata", 5.5

    # General longitude offset estimate rounded to nearest half-hour
    raw_offset = lon / 15.0
    rounded_offset = round(raw_offset * 2.0) / 2.0
    tz_str = f"UTC{'+' if rounded_offset >= 0 else ''}{rounded_offset:g}"
    return tz_str, rounded_offset


async def reverse_geocode_location(lat: float, lon: float) -> Dict[str, Any]:
    """
    Reverse geocodes coordinates into full hierarchy:
    Country -> State -> District -> Mandal/Tehsil -> City/Village
    Using OpenStreetMap Nominatim with safe fallback.
    """
    headers = {
        "User-Agent": "MysticInsightsAstrology/2.0 (spiritual.intelligence@mysticinsights.ai)",
        "Accept": "application/json"
    }
    url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}&zoom=18&addressdetails=1"

    tz_name, tz_offset = estimate_timezone_offset(lat, lon)

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            res = await client.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json()
                addr = data.get("address", {})

                country = addr.get("country", "India" if (6 <= lat <= 38 and 68 <= lon <= 98) else "Unknown")
                state = addr.get("state") or addr.get("province") or addr.get("region") or "Unknown State"
                district = (
                    addr.get("state_district")
                    or addr.get("county")
                    or addr.get("district")
                    or addr.get("city_district")
                    or "Central District"
                )
                mandal = (
                    addr.get("subdistrict")
                    or addr.get("mandal")
                    or addr.get("tehsil")
                    or addr.get("taluk")
                    or addr.get("municipality")
                    or "Urban Mandal"
                )
                city_or_village = (
                    addr.get("city")
                    or addr.get("town")
                    or addr.get("village")
                    or addr.get("suburb")
                    or addr.get("neighbourhood")
                    or addr.get("hamlet")
                    or "Local Area"
                )

                formatted = f"{city_or_village}, {mandal}, {district}, {state}, {country}"

                return {
                    "country": country,
                    "state": state,
                    "district": district,
                    "mandal": mandal,
                    "city_or_village": city_or_village,
                    "display_name": data.get("display_name", formatted),
                    "latitude": round(lat, 5),
                    "longitude": round(lon, 5),
                    "timezone": tz_name,
                    "timezone_offset": tz_offset,
                    "hierarchy": {
                        "country": country,
                        "state": state,
                        "district": district,
                        "mandal": mandal,
                        "locality": city_or_village
                    }
                }
    except Exception as e:
        print(f"Reverse geocode lookup warning: {e}")

    # Fallback to local coordinate matching if network fails
    best_match = None
    min_dist = float("inf")
    for state_name, s_data in INDIA_HIERARCHY.items():
        for dist_name, d_data in s_data["districts"].items():
            for mandal_name, m_data in d_data["mandals"].items():
                m_lat, m_lon = m_data["lat"], m_data["lon"]
                dist = math.hypot(lat - m_lat, lon - m_lon)
                if dist < min_dist:
                    min_dist = dist
                    best_match = {
                        "country": "India",
                        "state": state_name,
                        "district": dist_name,
                        "mandal": mandal_name,
                        "city_or_village": m_data["places"][0] if m_data.get("places") else mandal_name,
                        "display_name": f"{m_data['places'][0]}, {mandal_name}, {dist_name}, {state_name}, India",
                        "latitude": round(lat, 5),
                        "longitude": round(lon, 5),
                        "timezone": s_data.get("timezone", "Asia/Kolkata"),
                        "timezone_offset": s_data.get("offset", 5.5),
                        "hierarchy": {
                            "country": "India",
                            "state": state_name,
                            "district": dist_name,
                            "mandal": mandal_name,
                            "locality": m_data["places"][0]
                        }
                    }

    if best_match and min_dist < 1.5:  # within ~150km
        return best_match

    # Generic coordinate container
    return {
        "country": "India" if (6 <= lat <= 38 and 68 <= lon <= 98) else "Detected Region",
        "state": "Detected State",
        "district": "Detected District",
        "mandal": "Detected Sub-district",
        "city_or_village": f"Coordinates ({round(lat, 4)}°, {round(lon, 4)}°)",
        "display_name": f"Lat: {round(lat, 4)}, Lon: {round(lon, 4)}",
        "latitude": round(lat, 5),
        "longitude": round(lon, 5),
        "timezone": tz_name,
        "timezone_offset": tz_offset,
        "hierarchy": {
            "country": "Detected Country",
            "state": "Detected State",
            "district": "Detected District",
            "mandal": "Detected Sub-district",
            "locality": f"{round(lat, 4)}°, {round(lon, 4)}°"
        }
    }


async def search_locations_online_or_offline(query: str) -> List[Dict[str, Any]]:
    """
    Searches for any village, mandal, district, city, or state.
    Queries OpenStreetMap Nominatim and combines with local hierarchical database.
    """
    q_clean = query.strip()
    if not q_clean or len(q_clean) < 2:
        return []

    results: List[Dict[str, Any]] = []
    seen = set()

    # 1. First search local offline database for instant matching
    q_lower = q_clean.lower()
    for state_name, s_data in INDIA_HIERARCHY.items():
        for dist_name, d_data in s_data["districts"].items():
            for mandal_name, m_data in d_data["mandals"].items():
                m_lat, m_lon = m_data["lat"], m_data["lon"]
                places = m_data.get("places", [])
                
                matched = False
                matched_place = places[0] if places else mandal_name
                
                for p in places:
                    if q_lower in p.lower():
                        matched = True
                        matched_place = p
                        break
                
                if not matched and (q_lower in mandal_name.lower() or q_lower in dist_name.lower() or q_lower in state_name.lower()):
                    matched = True

                if matched:
                    key = f"{matched_place}-{mandal_name}-{dist_name}"
                    if key not in seen:
                        seen.add(key)
                        results.append({
                            "country": "India",
                            "state": state_name,
                            "district": dist_name,
                            "mandal": mandal_name,
                            "city_or_village": matched_place,
                            "display_name": f"{matched_place}, {mandal_name}, {dist_name}, {state_name}, India",
                            "latitude": m_lat,
                            "longitude": m_lon,
                            "timezone": s_data.get("timezone", "Asia/Kolkata"),
                            "timezone_offset": s_data.get("offset", 5.5),
                            "hierarchy": {
                                "country": "India",
                                "state": state_name,
                                "district": dist_name,
                                "mandal": mandal_name,
                                "locality": matched_place
                            }
                        })

    # Also check world locations
    for w in WORLD_LOCATIONS:
        if q_lower in w["city"].lower() or q_lower in w["country"].lower() or q_lower in w["state"].lower():
            key = f"{w['city']}-{w['country']}"
            if key not in seen:
                seen.add(key)
                results.append({
                    "country": w["country"],
                    "state": w["state"],
                    "district": w["district"],
                    "mandal": w["mandal"],
                    "city_or_village": w["city"],
                    "display_name": f"{w['city']}, {w['state']}, {w['country']}",
                    "latitude": w["lat"],
                    "longitude": w["lon"],
                    "timezone": w["timezone"],
                    "timezone_offset": w["offset"],
                    "hierarchy": {
                        "country": w["country"],
                        "state": w["state"],
                        "district": w["district"],
                        "mandal": w["mandal"],
                        "locality": w["city"]
                    }
                })

    # 2. Query Nominatim for broader or hyper-specific coverage
    headers = {
        "User-Agent": "MysticInsightsAstrology/2.0 (spiritual.intelligence@mysticinsights.ai)",
        "Accept": "application/json"
    }
    url = f"https://nominatim.openstreetmap.org/search?q={httpx.URL(q_clean)}&format=jsonv2&addressdetails=1&limit=6"

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(url, headers=headers)
            if res.status_code == 200:
                online_items = res.json()
                for item in online_items:
                    lat = float(item["lat"])
                    lon = float(item["lon"])
                    addr = item.get("address", {})

                    country = addr.get("country", "India")
                    state = addr.get("state") or addr.get("province") or "State"
                    district = (
                        addr.get("state_district")
                        or addr.get("county")
                        or addr.get("district")
                        or "District"
                    )
                    mandal = (
                        addr.get("subdistrict")
                        or addr.get("mandal")
                        or addr.get("tehsil")
                        or addr.get("taluk")
                        or "Mandal"
                    )
                    city_or_village = (
                        addr.get("city")
                        or addr.get("town")
                        or addr.get("village")
                        or addr.get("suburb")
                        or addr.get("neighbourhood")
                        or item.get("name")
                        or "Locality"
                    )

                    key = f"{round(lat, 2)}-{round(lon, 2)}"
                    if key not in seen:
                        seen.add(key)
                        tz_name, tz_offset = estimate_timezone_offset(lat, lon)
                        results.append({
                            "country": country,
                            "state": state,
                            "district": district,
                            "mandal": mandal,
                            "city_or_village": city_or_village,
                            "display_name": item.get("display_name", f"{city_or_village}, {state}, {country}"),
                            "latitude": round(lat, 5),
                            "longitude": round(lon, 5),
                            "timezone": tz_name,
                            "timezone_offset": tz_offset,
                            "hierarchy": {
                                "country": country,
                                "state": state,
                                "district": district,
                                "mandal": mandal,
                                "locality": city_or_village
                            }
                        })
    except Exception as e:
        print(f"Online geocoding search notice: {e}")

    return results[:15]
