import sqlite3
import io
from fastapi.testclient import TestClient
from PIL import Image

# Import app
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)

# Ensure verified test user in SQLite
conn = sqlite3.connect('mystic_insights.db')
c = conn.cursor()
c.execute("INSERT OR IGNORE INTO users (email, hashed_password, is_verified, role) VALUES ('deploy_check@celestial.com', 'dummyhash', 1, 'Administrator')")
c.execute("UPDATE users SET is_verified = 1, role = 'Administrator' WHERE email = 'deploy_check@celestial.com'")
conn.commit()
conn.close()

token = create_access_token(data={"sub": "deploy_check@celestial.com"})
headers = {"Authorization": f"Bearer {token}"}

print("\n=======================================================")
print("  MYSTIC INSIGHTS - FULL PRODUCTION DEPLOYMENT AUDIT  ")
print("=======================================================")

# 1. Health check
res1 = client.get("/")
print(f"1. GET /                     -> Status: {res1.status_code}")
assert res1.status_code == 200

# 2. Vision Aura Scan (MediaPipe + Geometric Chromatic Engine)
img = Image.new("RGB", (320, 240), color=(240, 210, 190))
buf = io.BytesIO()
img.save(buf, format="JPEG")
buf.seek(0)
res2 = client.post("/vision/aura", files={"file": ("face.jpg", buf.getvalue(), "image/jpeg")}, headers=headers)
print(f"2. POST /vision/aura         -> Status: {res2.status_code} | Aura: {res2.json().get('aura_color')} | Emotion: {res2.json().get('emotion')}")
assert res2.status_code == 200

# 3. Tarot Draw
res3 = client.post("/tarot/draw?spread_type=three_card", headers=headers)
print(f"3. POST /tarot/draw          -> Status: {res3.status_code} | Cards count: {len(res3.json().get('cards', []))}")
assert res3.status_code == 200

# 4. Astrology Kundali
res4 = client.post("/astrology/kundali", json={
    "birth_date": "1995-05-15",
    "birth_time": "14:30",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "timezone_offset": 5.5,
    "location_name": "Bangalore"
}, headers=headers)
print(f"4. POST /astrology/kundali   -> Status: {res4.status_code} | Ascendant: {res4.json().get('ascendant')}")
assert res4.status_code == 200

# 5. Guidance Synthesis
res5 = client.get("/guidance/synthesis", headers=headers)
print(f"5. GET /guidance/synthesis   -> Status: {res5.status_code} | Theme: {res5.json().get('core_theme', '')[:35]}...")
assert res5.status_code == 200

# 6. Reader Analytics
res6 = client.get("/reader/analytics", headers=headers)
print(f"6. GET /reader/analytics     -> Status: {res6.status_code} | Consultations: {res6.json().get('total_tarot_consultations')}")
assert res6.status_code == 200

# 7. Consultant Trends
res7 = client.get("/consultant/trends", headers=headers)
print(f"7. GET /consultant/trends    -> Status: {res7.status_code} | Monthly Trends: {len(res7.json().get('monthly_trends', []))}")
assert res7.status_code == 200

# 8. Admin Platform Stats
res8 = client.get("/admin/platform-stats", headers=headers)
print(f"8. GET /admin/platform-stats -> Status: {res8.status_code} | Total Users: {res8.json().get('total_users')}")
assert res8.status_code == 200

# 9. Oracle Chat
res9 = client.post("/oracle/chat", json={
    "query": "What celestial energy guides me today?",
    "archetype": "Universal Seeker",
    "aura_color": res2.json().get("aura_color"),
    "vibrational_state": res2.json().get("vibrational_state")
}, headers=headers)
print(f"9. POST /oracle/chat         -> Status: {res9.status_code} | Reply: {res9.json().get('reply', '')[:50]}...")
assert res9.status_code == 200

print("=======================================================")
print(" ALL 9 CORE ENGINES & API ENDPOINTS VERIFIED 100% OK!  ")
print("=======================================================\n")
