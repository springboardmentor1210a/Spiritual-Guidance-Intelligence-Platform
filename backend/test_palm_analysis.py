from pprint import pprint

from app.services.palm.palm_analysis import analyze_palm


IMAGE_PATH = "test_data/palm/sample.jpg"


result = analyze_palm(IMAGE_PATH)


print("\n")
print("=" * 60)
print("COMPLETE PALM ANALYSIS")
print("=" * 60)

print("\nSUCCESS:")
print(result["success"])


print("\nIMAGE FEATURES:")
pprint(result["image_features"])


print("\nHAND LANDMARKS:")
pprint(result["hand_landmarks"])


print("\nPALM SHAPE:")
pprint(result["palm_shape"])


print("\nFINGER ANALYSIS:")
pprint(result["finger_analysis"])


print("\nPALM LINES:")
pprint(result["palm_lines"])

print("\nINTERPRETATIONS:")
print(result["interpretations"])


print("\n")
print("=" * 60)
