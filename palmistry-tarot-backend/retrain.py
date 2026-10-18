# -*- coding: utf-8 -*-
"""
Retrain palm-line segmentation model for 50 more epochs starting from the
existing best.pt checkpoint. Saves best.pt to ml/weights/ when done.
"""
import os
import sys
import shutil
from pathlib import Path

# Keep YOLO state out of user AppData
BASE = Path(__file__).resolve().parent
os.environ.setdefault("YOLO_CONFIG_DIR", str(BASE / "ml" / "ultralytics-config"))

from ultralytics import YOLO

WEIGHTS    = BASE / "ml" / "weights" / "best.pt"
DATA_YAML  = Path(r"C:\Users\NAVYA SRI\OneDrive\Desktop\projects\Palmistry_Tarot\Palm Line Detection\data.yaml")
RUNS_DIR   = BASE / "runs" / "palm-line-seg"
RUN_NAME   = "retrain50"

assert WEIGHTS.exists(),   f"weights not found: {WEIGHTS}"
assert DATA_YAML.exists(), f"dataset yaml not found: {DATA_YAML}"

print(f"Starting 50-epoch retraining from: {WEIGHTS}")
print(f"Dataset: {DATA_YAML}")
print("-" * 60)

model = YOLO(str(WEIGHTS))   # resume from best.pt
results = model.train(
    data=str(DATA_YAML),
    epochs=50,
    imgsz=640,
    batch=4,                  # small batch for CPU
    device="cpu",
    project=str(RUNS_DIR),
    name=RUN_NAME,
    exist_ok=True,
    patience=20,              # early-stop if no improvement for 20 epochs
    augment=True,
    degrees=10,
    flipud=0.3,
    fliplr=0.5,
    hsv_h=0.02,
    hsv_s=0.4,
    hsv_v=0.3,
    verbose=True,
)

# Copy best weights to the canonical location
best_run = RUNS_DIR / RUN_NAME / "weights" / "best.pt"
if best_run.exists():
    dest = WEIGHTS          # overwrite previous best
    shutil.copy2(best_run, dest)
    print(f"\nSaved new best weights -> {dest}")
    # Hot-reload the running inference service
    try:
        import requests
        r = requests.post("http://127.0.0.1:8000/reload", timeout=30)
        print(f"Inference service reloaded: {r.json()}")
    except Exception as e:
        print(f"Note: could not auto-reload inference service ({e}). Restart it manually.")
else:
    print(f"\nWARNING: best.pt not found at {best_run}")


print("Retraining complete.")
