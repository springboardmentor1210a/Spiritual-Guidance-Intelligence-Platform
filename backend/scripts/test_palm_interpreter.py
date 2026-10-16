from app.services.palm_interpreter import generate_palm_interpretation


sample_features = {
    "life": {
        "confidence": 0.8126,
        "length": 254.974,
        "direct_distance": 241.9325,
        "curvature_ratio": 1.0539,
        "orientation": 62.49,
    },

    "heart": {
        "confidence": 0.8112,
        "length": 140.1831,
        "direct_distance": 137.55,
        "curvature_ratio": 1.0191,
        "orientation": 23.04,
    },

    "head": {
        "confidence": 0.6565,
        "length": 147.0565,
        "direct_distance": 144.2972,
        "curvature_ratio": 1.0191,
        "orientation": 27.51,
    },

    "fate": {
        "confidence": 0.2852,
        "length": 126.2218,
        "direct_distance": 125.0871,
        "curvature_ratio": 1.0091,
        "orientation": 84.54,
    },
}


result = generate_palm_interpretation(sample_features)

print("\n========== PALM INTERPRETATION ==========\n")

for line_name, data in result.items():

    print(line_name.upper())

    print("Confidence:", data["confidence"])

    print("Features:")
    for key, value in data["features"].items():
        print(f"  {key}: {value}")

    print("Interpretation:")
    for statement in data["interpretation"]:
        print(" -", statement)

    print("----------------------------------------")