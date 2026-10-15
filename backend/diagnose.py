"""
Run this from your backend folder with the venv active:
    python diagnose.py

It imports each piece of your app one at a time and writes a plain-ASCII
result to diagnose_log.txt (no emoji, so it can't hit the Windows console
encoding bug that's been swallowing your errors). Whichever line says FAIL
is your actual problem -- paste that whole line + the error under it.
"""
import sys
import traceback

log = open("diagnose_log.txt", "w", encoding="utf-8")

def check(label, fn):
    try:
        fn()
        log.write(f"OK   - {label}\n")
        log.flush()
    except Exception:
        log.write(f"FAIL - {label}\n")
        log.write(traceback.format_exc())
        log.write("\n")
        log.flush()

check("import cv2", lambda: __import__("cv2"))
check("import numpy", lambda: __import__("numpy"))
check("import mediapipe", lambda: __import__("mediapipe"))
check("import authlib", lambda: __import__("authlib"))
check("import fastapi", lambda: __import__("fastapi"))
check("import sqlalchemy", lambda: __import__("sqlalchemy"))
check("import apscheduler", lambda: __import__("apscheduler"))
check("app.core.config", lambda: __import__("app.core.config"))
check("app.core.database", lambda: __import__("app.core.database"))
check("app.core.security", lambda: __import__("app.core.security"))
check("app.core.rbac", lambda: __import__("app.core.rbac"))
check("app.models.postgres_models", lambda: __import__("app.models.postgres_models"))
check("app.models.schemas", lambda: __import__("app.models.schemas"))
check("app.services.tarot_service", lambda: __import__("app.services.tarot_service"))
check("app.services.vision_service", lambda: __import__("app.services.vision_service"))
check("app.services.report_service", lambda: __import__("app.services.report_service"))
check("app.services.scoring_service", lambda: __import__("app.services.scoring_service"))
check("app.services.vedic_astrology_engine", lambda: __import__("app.services.vedic_astrology_engine"))
check("app.main (full app)", lambda: __import__("app.main"))

log.write("\nDONE\n")
log.close()
print("Wrote diagnose_log.txt -- open it and paste the contents here.")