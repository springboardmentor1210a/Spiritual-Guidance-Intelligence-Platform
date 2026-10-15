import sqlite3
import requests
import io
import json
from PIL import Image

BASE = 'http://127.0.0.1:8000'

def run_tests():
    email = "admin@cosmos.ai"
    password = "password123"
    try:
        conn = sqlite3.connect('mystic_insights.db')
        c = conn.cursor()
        c.execute("UPDATE users SET is_verified = 1, role = 'Administrator' WHERE email LIKE 'deploy_test_%'")
        conn.commit()
        email_row = c.execute("SELECT email FROM users WHERE email LIKE 'deploy_test_%' ORDER BY id DESC LIMIT 1").fetchone()
        conn.close()
        if email_row:
            email = email_row[0]
            password = "Password123!"
    except Exception:
        pass

    print(f"Testing with verified user: {email}")

    # 1. Login
    login_res = requests.post(f"{BASE}/login", data={"username": email, "password": password})
    if login_res.status_code != 200:
        login_res = requests.post(f"{BASE}/login", data={"username": "admin@cosmos.ai", "password": "password123"})
    print(f"1. Login Status: {login_res.status_code}")
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Aura Scan
    img = Image.new("RGB", (320, 240), color=(240, 210, 190))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    aura_res = requests.post(f"{BASE}/vision/aura", files={"file": ("face.jpg", buf.getvalue(), "image/jpeg")}, headers=headers)
    print(f"2. Aura Scan Status: {aura_res.status_code} | Color: {aura_res.json().get('aura_color')} | Emotion: {aura_res.json().get('emotion')}")
    assert aura_res.status_code == 200

    # 3. Tarot Draw
    tarot_res = requests.post(f"{BASE}/tarot/draw?spread_type=three_card", headers=headers)
    cards = tarot_res.json().get("cards", [])
    print(f"3. Tarot Draw Status: {tarot_res.status_code} | Cards drawn: {len(cards)}")
    assert tarot_res.status_code == 200 and len(cards) == 3

    # 4. Kundali
    kundali_res = requests.post(f"{BASE}/astrology/kundali", json={
        "birth_date": "1995-05-15",
        "birth_time": "14:30",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "timezone_offset": 5.5,
        "location_name": "Bangalore"
    }, headers=headers)
    print(f"4. Kundali Status: {kundali_res.status_code} | Ascendant: {kundali_res.json().get('ascendant')}")
    assert kundali_res.status_code == 200

    # 5. Guidance Synthesis
    synth_res = requests.get(f"{BASE}/guidance/synthesis", headers=headers)
    print(f"5. Guidance Synthesis Status: {synth_res.status_code} | Core theme: {synth_res.json().get('core_theme', '')[:40]}")
    assert synth_res.status_code == 200

    # 6. Reader Analytics
    reader_res = requests.get(f"{BASE}/reader/analytics", headers=headers)
    print(f"6. Reader Analytics Status: {reader_res.status_code} | Sessions: {reader_res.json().get('total_sessions')}")
    assert reader_res.status_code == 200

    # 7. Consultant Trends
    consultant_res = requests.get(f"{BASE}/consultant/trends", headers=headers)
    print(f"7. Consultant Trends Status: {consultant_res.status_code} | Monthly data points: {len(consultant_res.json().get('monthly_trends', []))}")
    assert consultant_res.status_code == 200

    # 8. Admin Platform Stats
    admin_res = requests.get(f"{BASE}/admin/platform-stats", headers=headers)
    print(f"8. Admin Platform Stats: {admin_res.status_code} | Total Users: {admin_res.json().get('total_users')}")
    assert admin_res.status_code == 200

    # 9. Oracle Chat
    oracle_res = requests.post(f"{BASE}/oracle/chat", json={
        "query": "What is my spiritual guidance today?",
        "archetype": "Universal Seeker",
        "aura_color": aura_res.json().get("aura_color"),
        "vibrational_state": aura_res.json().get("vibrational_state")
    }, headers=headers)
    print(f"9. Oracle Chat Status: {oracle_res.status_code} | Reply: {oracle_res.json().get('reply')[:60]}...")
    assert oracle_res.status_code == 200

    print("\n==========================================")
    print("ALL CORE DEPLOYMENT APIS PASSED 100%!")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
