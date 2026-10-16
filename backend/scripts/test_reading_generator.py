from app.services.reading_generator import reading_generator
from app.services.tarot_engine import tarot_engine


# ---------------------------------------------------------
# Sample palm data
# ---------------------------------------------------------

palm_features = {
    "life_line": {
        "confidence": 0.8126,
        "length": 254.974,
        "curvature_ratio": 1.0539,
    },

    "heart_line": {
        "confidence": 0.8112,
        "length": 140.1831,
        "curvature_ratio": 1.0191,
    },

    "head_line": {
        "confidence": 0.6565,
        "length": 147.0565,
        "curvature_ratio": 1.0191,
    },

    "fate_line": {
        "confidence": 0.2852,
        "length": 126.2218,
        "curvature_ratio": 1.0091,
    },
}


# ---------------------------------------------------------
# Sample palm interpretations
# ---------------------------------------------------------

palm_interpretations = [
    {
        "line": "LIFE_LINE",
        "confidence": 0.8126,
        "interpretation": [
            "The life line is relatively long in the detected palm region.",
            "The life line shows noticeable curvature.",
        ],
    },

    {
        "line": "HEART_LINE",
        "confidence": 0.8112,
        "interpretation": [
            "The detected heart line extends across a substantial portion of the measured palm region.",
            "The heart line appears relatively straight.",
        ],
    },

    {
        "line": "HEAD_LINE",
        "confidence": 0.6565,
        "interpretation": [
            "The head line has a relatively extended path.",
            "The head line appears relatively straight.",
        ],
    },

    {
        "line": "FATE_LINE",
        "confidence": 0.2852,
        "interpretation": [
            "The fate line detection has low confidence and should be treated cautiously.",
        ],
    },
]


# ---------------------------------------------------------
# Generate Tarot reading
# ---------------------------------------------------------

tarot_reading = tarot_engine.generate_reading(
    spread_name="three_card",
    context="career",
)


# ---------------------------------------------------------
# Generate combined reading
# ---------------------------------------------------------

reading = reading_generator.generate_reading(
    palm_features=palm_features,
    palm_interpretations=palm_interpretations,
    tarot_reading=tarot_reading,
    user_context={
        "reading_type": "combined",
        "domain": "career",
    },
)


# ---------------------------------------------------------
# Display result
# ---------------------------------------------------------

print("\n========== COMBINED READING ==========")

print("\nSTATUS:")
print(reading["status"])

print("\n========== PALM SUMMARY ==========")
print(reading["summary"]["palm"])

print("\n========== TAROT SUMMARY ==========")
print(reading["summary"]["tarot"])

print("\n========== OVERALL SUMMARY ==========")
print(reading["summary"]["overall"])

print("\n========== PALM FEATURES ==========")

for line, features in reading["palm_analysis"]["features"].items():

    print(f"\n{line}")

    for key, value in features.items():
        print(f"  {key}: {value}")

print("\n========== TAROT CARDS ==========")

for item in reading["tarot_reading"]["cards"]:

    card = item["card"]

    print(
        f"{item['position']}: "
        f"{card['name']} "
        f"({card['orientation']})"
    )