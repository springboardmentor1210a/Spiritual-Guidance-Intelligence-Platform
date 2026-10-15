import os
import sys

# Disable oneDNN
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

print("Step 1: Basic imports...")
try:
    import sys
    print("✓ sys")
except Exception as e:
    print(f"✗ sys: {e}")
    sys.exit(1)

print("\nStep 2: Core Python libs...")
try:
    import os
    print("✓ os")
except Exception as e:
    print(f"✗ os: {e}")

print("\nStep 3: NumPy...")
try:
    import numpy as np
    print(f"✓ numpy {np.__version__}")
except Exception as e:
    print(f"✗ numpy: {e}")

print("\nStep 4: OpenCV...")
try:
    import cv2
    print(f"✓ cv2 {cv2.__version__}")
except Exception as e:
    print(f"✗ cv2: {e}")

print("\nStep 5: TensorFlow...")
try:
    import tensorflow as tf
    print(f"✓ tensorflow {tf.__version__}")
except Exception as e:
    print(f"✗ tensorflow: {e}")
    import traceback
    traceback.print_exc()

print("\nStep 6: DeepFace...")
try:
    from deepface import DeepFace
    print("✓ DeepFace")
except Exception as e:
    print(f"✗ DeepFace: {e}")
    import traceback
    traceback.print_exc()

print("\nStep 7: FastAPI...")
try:
    from fastapi import FastAPI
    print("✓ FastAPI")
except Exception as e:
    print(f"✗ FastAPI: {e}")

print("\nStep 8: Your app.main...")
try:
    import app.main
    print("✓ app.main")
except Exception as e:
    print(f"✗ app.main: {e}")
    import traceback
    traceback.print_exc()

print("\n=== All imports successful! ===")