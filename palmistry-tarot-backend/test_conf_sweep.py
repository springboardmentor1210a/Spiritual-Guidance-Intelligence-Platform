# -*- coding: utf-8 -*-
"""Test inference at very low confidence on all test images."""
import sys
import json
from pathlib import Path

# force stdout to UTF-8
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import requests

TEST_DIR = (
    Path(r"C:\Users\NAVYA SRI\OneDrive\Desktop\projects\Palmistry_Tarot")
    / "Palm Line Detection" / "splits" / "test" / "images"
)
TRAIN_DIR = (
    Path(r"C:\Users\NAVYA SRI\OneDrive\Desktop\projects\Palmistry_Tarot")
    / "Palm Line Detection" / "splits" / "train" / "images"
)

images = list(TEST_DIR.glob("*.jpg"))[:4] + list(TRAIN_DIR.glob("*.jpg"))[:3]

for conf in [0.10, 0.05, 0.03, 0.01]:
    print(f"\n=== Confidence threshold: {conf} ===")
    found = 0
    for img_path in images:
        with open(img_path, "rb") as f:
            resp = requests.post(
                "http://127.0.0.1:8000/predict",
                files={"image": ("palm.jpg", f, "image/jpeg")},
                timeout=60,
            )
        data = resp.json()
        lines = data.get("lines", [])
        n = len(lines)
        names = [l["name"] for l in lines]
        if n > 0:
            found += 1
            print(f"  FOUND {n:2d} lines in {img_path.name[:45]}: {names}")
        else:
            print(f"  NONE   in {img_path.name[:45]}")
    print(f"  => Images with detections: {found}/{len(images)}")
