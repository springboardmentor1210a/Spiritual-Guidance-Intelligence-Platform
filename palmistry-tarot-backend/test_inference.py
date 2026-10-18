"""Quick end-to-end inference test. Run from the backend directory."""
import sys, json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import os
os.environ.setdefault("YOLO_CONFIG_DIR", str(Path(__file__).parent / "ml" / "ultralytics-config"))

import requests

TEST_IMAGE = (
    Path(r"C:\Users\NAVYA SRI\OneDrive\Desktop\projects\Palmistry_Tarot")
    / "Palm Line Detection" / "splits" / "test" / "images"
    / "shutterstock-open-palm5_PNG.rf.02850cdf18a4eb076c009a262421c878.jpg"
)

if not TEST_IMAGE.exists():
    print("ERROR: test image not found:", TEST_IMAGE)
    sys.exit(1)

with open(TEST_IMAGE, "rb") as f:
    resp = requests.post(
        "http://127.0.0.1:8000/predict",
        files={"image": ("palm.jpg", f, "image/jpeg")},
        timeout=120,
    )

print("Status:", resp.status_code)
data = resp.json()
print("Model:", data.get("model"))
print("Image size:", data.get("imageWidth"), "x", data.get("imageHeight"))
lines = data.get("lines", [])
print(f"Lines detected: {len(lines)}")
for line in lines:
    pts = len(line.get("coordinates", []))
    print(f"  {line['name']:20s}  conf={line['confidence']:5.1f}%  points={pts}")

print("\nFull JSON (truncated):")
print(json.dumps(data, indent=2)[:3000])
