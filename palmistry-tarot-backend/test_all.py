# -*- coding: utf-8 -*-
"""Test all training images via full Express proxy to find what detects."""
import sys, io, requests
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from pathlib import Path

BASE_DIR  = Path(r"C:\Users\NAVYA SRI\OneDrive\Desktop\projects\Palmistry_Tarot")
TRAIN_DIR = BASE_DIR / "Palm Line Detection" / "splits" / "train" / "images"
TEST_DIR  = BASE_DIR / "Palm Line Detection" / "splits" / "test" / "images"

BACKEND = "http://127.0.0.1:3001"

# Login
login = requests.post(f"{BACKEND}/api/auth/login",
                      json={"email": "e2e_test@palm.test", "password": "TestPass123!"},
                      timeout=10)
token = login.json().get("token")
headers = {"Authorization": f"Bearer {token}"} if token else {}

all_imgs = list(TRAIN_DIR.glob("*.jpg")) + list(TEST_DIR.glob("*.jpg"))
print(f"Testing {len(all_imgs)} images...\n")
found = 0
for img in all_imgs:
    with open(img, "rb") as f:
        r = requests.post(f"{BACKEND}/api/palm/analyze",
                          files={"image": ("palm.jpg", f, "image/jpeg")},
                          headers=headers, timeout=120)
    lines = r.json().get("data", {}).get("lines", [])
    if lines:
        found += 1
        print(f"HIT  {img.name[:55]:55s} {len(lines)} lines: {[l['name'] for l in lines]}")
    else:
        print(f"MISS {img.name[:55]}")

print(f"\nDetections: {found}/{len(all_imgs)}")
