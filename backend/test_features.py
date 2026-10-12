from pathlib import Path

from app.services.palm.preprocessing import preprocess_palm_image
from app.services.palm.feature_extraction import extract_palm_features


image_path = Path("test_data/palm/sample.jpg")

if not image_path.exists():
    raise FileNotFoundError(
        f"Image not found: {image_path}"
    )

image_bytes = image_path.read_bytes()

preprocessed = preprocess_palm_image(
    image_bytes
)

features = extract_palm_features(
    preprocessed
)

print("\nPalm preprocessing successful!")
print("Image size:")
print(
    preprocessed["width"],
    "x",
    preprocessed["height"]
)

print("\nExtracted palm features:")
for name, value in features.items():
    print(f"{name}: {value}")