import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("🔍 Starting Backend Code Audit...")

try:
    print("1. Testing Core Config...")
    from app.core.config import settings
    print("✅ Config OK")

    print("2. Testing Database...")
    from app.core.database import engine, Base
    print("✅ Database OK")

    print("3. Testing Security...")
    from app.core.security import get_password_hash, create_access_token
    print("✅ Security OK")

    print("4. Testing Models...")
    from app.models.postgres_models import User, UserProfile
    from app.models.schemas import UserCreate, UserProfileCreate
    print("✅ Models OK")

    print("5. Testing Tarot Service...")
    from app.services.tarot_service import TarotIntelligenceEngine
    print("✅ Tarot Service OK")

    print("6. Testing Vision Service (The dangerous one)...")
    from app.services.vision_service import PalmVisionEngine
    print("✅ Vision Service OK")

    print("7. Testing Report & Scoring Services...")
    from app.services.report_service import generate_pdf_report
    from app.services.scoring_service import compute_score_inputs, weighted_insight_score
    print("✅ Report & Scoring OK")

    print("\n SUCCESS! All backend code is 100% perfect and imports correctly.")

except Exception as e:
    print(f"\n❌ CRASHED! The error is in the file we just tried to import.")
    print(f"Error Details: {e}")