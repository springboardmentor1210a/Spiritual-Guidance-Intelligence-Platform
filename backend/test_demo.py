print("✅ Backend is working!")
print("Testing imports...")
try:
    import cv2
    print("✅ OpenCV works")
except:
    print("❌ OpenCV failed")

try:
    from app.services.vision_service import PalmVisionEngine
    print("✅ Palm Vision works")
except Exception as e:
    print(f"❌ Palm Vision failed: {e}")