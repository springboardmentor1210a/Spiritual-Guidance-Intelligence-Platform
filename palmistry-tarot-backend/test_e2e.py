# -*- coding: utf-8 -*-
"""
End-to-end test: upload via Express /api/palm/analyze (mirrors what the browser does).
Requires backend on port 3001 AND ML service on port 8000.
"""
import sys, json, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import requests
from pathlib import Path

BASE_DIR = Path(r"C:\Users\NAVYA SRI\OneDrive\Desktop\projects\Palmistry_Tarot")
TEST_DIR  = BASE_DIR / "Palm Line Detection" / "splits" / "test" / "images"
TRAIN_DIR = BASE_DIR / "Palm Line Detection" / "splits" / "train" / "images"

# Pick any existing image
test_imgs = list(TEST_DIR.glob("*.jpg")) + list(TRAIN_DIR.glob("*.jpg"))
if not test_imgs:
    print("ERROR: No test images found"); sys.exit(1)

TEST_IMG = test_imgs[0]
print(f"Using test image: {TEST_IMG.name}")

BACKEND = "http://127.0.0.1:3001"
ML_SVC   = "http://127.0.0.1:8000"

# ── 1) Direct ML service ─────────────────────────────────────────────────────
print("\n1) Direct ML service (/predict)...")
with open(TEST_IMG, "rb") as f:
    ml_resp = requests.post(f"{ML_SVC}/predict",
                            files={"image": ("palm.jpg", f, "image/jpeg")},
                            timeout=90)
print(f"   Status: {ml_resp.status_code}")
ml_data = ml_resp.json()
lines = ml_data.get("lines", [])
print(f"   Lines detected: {len(lines)}")
for l in lines:
    print(f"     {l['name']:20s}  conf={l['confidence']}%  pts={len(l.get('coordinates',[]))}")

# ── 2) Register a throwaway test user ────────────────────────────────────────
print("\n2) Registering test user...")
reg = requests.post(f"{BACKEND}/api/auth/register", json={
    "name": "Test User", "email": "e2e_test@palm.test",
    "password": "TestPass123!", "role": "user"
}, timeout=10)
print(f"   Register: {reg.status_code} - {reg.text[:80]}")

# ── 3) Login ──────────────────────────────────────────────────────────────────
print("\n3) Login...")
login = requests.post(f"{BACKEND}/api/auth/login", json={
    "email": "e2e_test@palm.test", "password": "TestPass123!"
}, timeout=10)
print(f"   Login: {login.status_code}")
token = None
if login.status_code == 200:
    body = login.json()
    token = body.get("token") or body.get("data", {}).get("token")
    print(f"   Token: {str(token)[:30]}...")

# ── 4) Express proxy ──────────────────────────────────────────────────────────
print("\n4) Express proxy (/api/palm/analyze)...")
headers = {}
if token:
    headers["Authorization"] = f"Bearer {token}"

with open(TEST_IMG, "rb") as f:
    proxy = requests.post(
        f"{BACKEND}/api/palm/analyze",
        files={"image": ("palm.jpg", f, "image/jpeg")},
        headers=headers,
        timeout=120,
    )

print(f"   Status: {proxy.status_code}")
if proxy.status_code == 200:
    data = proxy.json().get("data", {})
    lines = data.get("lines", [])
    print(f"   Lines via proxy: {len(lines)}")
    for l in lines:
        print(f"     {l['name']:20s}  conf={l['confidence']}%  pts={len(l.get('coordinates',[]))}")
    print("\n   ✓ FULL PIPELINE: React -> Express -> ML Service -> Response")
else:
    print(f"   ERROR body: {proxy.text[:500]}")
