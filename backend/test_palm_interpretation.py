from app.services.palm.palm_interpretation import interpret_palm_lines


test_data = {
    "detected": True,
    "count": 3,
    "lines": [
        {
            "line": "head",
            "confidence": 0.8246
        },
        {
            "line": "heart",
            "confidence": 0.8200
        },
        {
            "line": "life",
            "confidence": 0.7629
        }
    ]
}


result = interpret_palm_lines(test_data)

print("\nPALM LINE INTERPRETATION")
print("------------------------")

for key, value in result.items():
    print(f"\n{value['title']}")
    print(f"Confidence: {value['confidence']}")
    print(f"Interpretation: {value['interpretation']}")
