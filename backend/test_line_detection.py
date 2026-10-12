
from app.services.palm.line_detection import detect_palm_lines


IMAGE_PATH = "test_data/palm/sample.jpg"


result = detect_palm_lines(IMAGE_PATH)


print("\nPalm Line Detection")
print("=" * 40)

print("Detected:", result["detected"])
print("Number of lines:", result["count"])

for line in result["lines"]:

    print("\nLine:", line["line"])
    print("Confidence:", line["confidence"])
    print("Bounding Box:", line["bbox"])

    print("Keypoints:")

    for point in line["keypoints"]:
        print(
            f"  ({point['x']}, {point['y']})"
        )