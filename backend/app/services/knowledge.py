from __future__ import annotations
from typing import Dict, List, Tuple
# The six trait axes used across personality, recommendations and scoring.
TRAITS = ["empathy", "intellect", "drive", "stability", "intuition", "adaptability"]
CATEGORIES = [
    "personality", "relationships", "career", "finance",
    "health_wellness", "personal_growth", "life_opportunities",
]

PALM_LINE_TRAITS: Dict[str, Dict[str, float]] = {
    "heart_line": {"empathy": 1.0, "intuition": 0.3},
    "head_line":  {"intellect": 1.0, "adaptability": 0.3},
    "life_line":  {"stability": 0.7, "drive": 0.5},
    "fate_line":  {"drive": 0.8, "stability": 0.3},
}

PALM_LINE_CATEGORIES: Dict[str, Dict[str, float]] = {
    "heart_line": {"relationships": 1.0, "personality": 0.4},
    "head_line":  {"career": 0.8, "personality": 0.5, "finance": 0.4},
    "life_line":  {"health_wellness": 1.0, "personal_growth": 0.3},
    "fate_line":  {"career": 0.7, "life_opportunities": 1.0, "finance": 0.3},
}

ELEMENT_TRAITS: Dict[str, Dict[str, float]] = {
    "fire":  {"drive": 1.0, "adaptability": 0.4},
    "earth": {"stability": 1.0, "drive": 0.2},
    "air":   {"intellect": 1.0, "adaptability": 0.5},
    "water": {"intuition": 1.0, "empathy": 0.7},
}

SUIT_TRAITS: Dict[str, Dict[str, float]] = {
    "wands":     {"drive": 1.0, "adaptability": 0.3},
    "cups":      {"empathy": 0.9, "intuition": 0.7},
    "swords":    {"intellect": 1.0, "adaptability": 0.2},
    "pentacles": {"stability": 1.0, "drive": 0.2},
}

SUIT_CATEGORIES: Dict[str, Dict[str, float]] = {
    "wands":     {"career": 0.8, "personal_growth": 0.6, "life_opportunities": 0.5},
    "cups":      {"relationships": 1.0, "personality": 0.4},
    "swords":    {"personality": 0.6, "career": 0.4, "personal_growth": 0.4},
    "pentacles": {"finance": 1.0, "career": 0.6, "health_wellness": 0.5},
}

MAJOR_ARCANA: Dict[str, Tuple[Dict[str, float], Dict[str, float], str]] = {
    "the fool":            ({"adaptability": 1.0, "intuition": 0.4}, {"life_opportunities": 1.0, "personal_growth": 0.6}, "positive"),
    "the magician":        ({"drive": 0.9, "intellect": 0.6},        {"career": 0.8, "life_opportunities": 0.7}, "positive"),
    "the high priestess":  ({"intuition": 1.0},                       {"personality": 0.7, "personal_growth": 0.6}, "neutral"),
    "the empress":         ({"empathy": 0.8, "stability": 0.6},       {"relationships": 0.7, "health_wellness": 0.5}, "positive"),
    "the emperor":         ({"stability": 0.9, "drive": 0.7},         {"career": 0.8, "finance": 0.6}, "positive"),
    "the hierophant":      ({"stability": 0.7, "intellect": 0.4},     {"personal_growth": 0.6, "career": 0.4}, "neutral"),
    "the lovers":          ({"empathy": 1.0, "intuition": 0.4},       {"relationships": 1.0}, "positive"),
    "the chariot":         ({"drive": 1.0},                           {"career": 0.8, "life_opportunities": 0.6}, "positive"),
    "strength":            ({"empathy": 0.6, "stability": 0.8},       {"personal_growth": 0.8, "health_wellness": 0.5}, "positive"),
    "the hermit":          ({"intuition": 0.8, "intellect": 0.6},     {"personal_growth": 1.0}, "neutral"),
    "wheel of fortune":    ({"adaptability": 1.0},                    {"life_opportunities": 1.0}, "neutral"),
    "justice":             ({"intellect": 0.8, "stability": 0.4},     {"career": 0.5, "personality": 0.5}, "neutral"),
    "the hanged man":      ({"adaptability": 0.7, "intuition": 0.5},  {"personal_growth": 0.9}, "neutral"),
    "death":               ({"adaptability": 1.0},                    {"personal_growth": 0.8, "life_opportunities": 0.6}, "challenging"),
    "temperance":          ({"stability": 0.8, "adaptability": 0.5},  {"health_wellness": 0.8, "personality": 0.5}, "positive"),
    "the devil":           ({"drive": 0.4},                           {"relationships": 0.6, "finance": 0.5, "health_wellness": 0.4}, "challenging"),
    "the tower":           ({"adaptability": 0.9},                    {"life_opportunities": 0.5, "career": 0.4}, "challenging"),
    "the star":            ({"intuition": 0.7, "empathy": 0.5},       {"personal_growth": 0.7, "life_opportunities": 0.6}, "positive"),
    "the moon":            ({"intuition": 1.0},                       {"personality": 0.6, "personal_growth": 0.5}, "challenging"),
    "the sun":             ({"drive": 0.6, "empathy": 0.6},           {"life_opportunities": 0.8, "health_wellness": 0.6}, "positive"),
    "judgement":           ({"intellect": 0.5, "intuition": 0.6},     {"personal_growth": 1.0}, "neutral"),
    "the world":           ({"stability": 0.6, "drive": 0.6},         {"life_opportunities": 1.0, "personal_growth": 0.6}, "positive"),
}

_SUIT_TONE_HINTS = {
    "three of swords": "challenging", "five of swords": "challenging",
    "ten of swords": "challenging", "nine of swords": "challenging",
    "five of pentacles": "challenging", "five of cups": "challenging",
    "ten of pentacles": "positive", "ace of cups": "positive",
    "ace of wands": "positive", "ace of pentacles": "positive",
    "ten of cups": "positive", "nine of pentacles": "positive"
}

def card_profile(name: str, orientation: str = "Upright") -> Dict:
    key = (name or "").strip().lower()
    reversed_ = (orientation or "").strip().lower().startswith("rev")
    traits: Dict[str, float] = {}
    cats: Dict[str, float] = {}
    tone = "neutral"
    suit = None
    
    if key in MAJOR_ARCANA:
        t, c, tone = MAJOR_ARCANA[key]
        traits, cats, suit = dict(t), dict(c), "major"
    else:
        for s in SUIT_TRAITS:
            if key.endswith(s):
                suit = s
                traits, cats = dict(SUIT_TRAITS[s]), dict(SUIT_CATEGORIES[s])
                tone = _SUIT_TONE_HINTS.get(key, "neutral")
                break
                
    if reversed_:
        traits = {k: v * 0.5 for k, v in traits.items()}
        tone = "challenging" if tone != "challenging" else "neutral"
        
    return {"traits": traits, "categories": cats, "tone": tone, "suit": suit, "reversed": reversed_}

KEYWORD_CATEGORIES: Dict[str, List[str]] = {
    "relationships": ["love", "relationship", "marriage", "partner", "family", "friend", "romance", "dating"],
    "career": ["career", "job", "work", "business", "promotion", "profession", "startup", "leadership"],
    "finance": ["money", "finance", "wealth", "invest", "saving", "income", "debt", "prosper"],
    "health_wellness": ["health", "wellness", "fitness", "sleep", "stress", "yoga", "meditation", "balance"],
    "personal_growth": ["growth", "self", "habit", "confidence", "mindful", "purpose", "spiritual", "learn"],
    "life_opportunities": ["opportunit", "travel", "change", "move", "abroad", "new start", "future"],
    "personality": ["personality", "character", "identity", "strength", "weakness"],
}

def categories_from_text(text: str) -> Dict[str, float]:
    t = (text or "").lower()
    out: Dict[str, float] = {}
    for cat, words in KEYWORD_CATEGORIES.items():
        hits = sum(1 for w in words if w in t)
        if hits:
            out[cat] = min(1.0, 0.5 + 0.25 * hits)
    return out

def clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))

def normalize_element(element: str) -> str:
    e = (element or "").lower()
    for k in ELEMENT_TRAITS:
        if e.startswith(k):
            return k
    return ""