from pathlib import Path
from ultralytics import YOLO

# ============================================================
# PATHS
# ============================================================

# Project root:
# C:\Users\Toshiba\palmistry-tarot-platform
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Trained YOLO model
MODEL_PATH = (
    BASE_DIR
    / "runs"
    / "pose"
    / "train-3"
    / "weights"
    / "best.pt"
)

# Demo palm images
IMAGE_DIR = (
    BASE_DIR
    / "backend"
    / "demo images"
)

# Output directory
OUTPUT_DIR = (
    BASE_DIR
    / "runs"
    / "pose"
    / "multi_palm_demo"
)


# ============================================================
# CONFIGURATION
# ============================================================

CONFIDENCE_THRESHOLD = 0.25
IMAGE_SIZE = 512

CLASS_NAMES = {
    0: "fate",
    1: "head",
    2: "heart",
    3: "life",
}


# =========================================================
# CHECK FILES
# =========================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found:\n{MODEL_PATH}"
    )

if not IMAGE_DIR.exists():
    raise FileNotFoundError(
        f"Demo image folder not found:\n{IMAGE_DIR}"
    )


images = sorted(
    [
        p
        for p in IMAGE_DIR.iterdir()
        if p.suffix.lower() in {".jpg", ".jpeg", ".png"}
    ]
)

if not images:
    raise FileNotFoundError(
        f"No palm images found in:\n{IMAGE_DIR}"
    )


# =========================================================
# LOAD MODEL
# =========================================================

print("\nLoading palm analysis model...")

model = YOLO(str(MODEL_PATH))

print("Model loaded successfully.")


# =========================================================
# PROCESS IMAGES
# =========================================================

print("\n========== MULTI-PALM TEST ==========")
print(f"Images found: {len(images)}")
print(f"Model: {MODEL_PATH.name}")
print()


for index, image_path in enumerate(images, start=1):

    print("=" * 60)
    print(f"PALM {index}: {image_path.name}")
    print("=" * 60)

    results = model.predict(
        source=str(image_path),
        imgsz=IMAGE_SIZE,
        conf=CONFIDENCE_THRESHOLD,
        device="cpu",
        save=True,
        project=str(OUTPUT_DIR),
        name=f"palm_{index}",
        exist_ok=True,
        verbose=False,
    )

    result = results[0]

    # -----------------------------------------------------
    # Detection information
    # -----------------------------------------------------

    if result.boxes is None or len(result.boxes) == 0:

        print("No palm lines detected.")
        continue

    print(
        f"Detected objects: {len(result.boxes)}"
    )

    # -----------------------------------------------------
    # Print every detected line
    # -----------------------------------------------------

    for detection_index, box in enumerate(
        result.boxes
    ):

        class_id = int(box.cls[0])

        confidence = float(
            box.conf[0]
        )

        class_name = CLASS_NAMES.get(
            class_id,
            model.names[class_id]
        )

        print(
            f"  {detection_index + 1}. "
            f"{class_name.upper():<6} "
            f"confidence = {confidence:.4f}"
        )

    # -----------------------------------------------------
    # Keypoints
    # -----------------------------------------------------

    if result.keypoints is not None:

        keypoints = result.keypoints.xy.cpu().numpy()

        print(
            f"Keypoint groups detected: "
            f"{len(keypoints)}"
        )

        for kp_index, points in enumerate(keypoints):

            if kp_index >= len(result.boxes):
                break

            class_id = int(
                result.boxes[kp_index].cls[0]
            )

            class_name = CLASS_NAMES.get(
                class_id,
                model.names[class_id]
            )

            print(
                f"  {class_name.upper()} "
                f"→ {len(points)} keypoints"
            )

    print(
        f"\nAnnotated result saved to:"
    )

    print(
        OUTPUT_DIR
        / f"palm_{index}"
    )


print("\n" + "=" * 60)
print("MULTI-PALM TEST COMPLETED")
print("=" * 60)

print(
    "\nThe model processed "
    f"{len(images)} palm image(s)."
)

print(
    "\nAnnotated images are available under:"
)

print(OUTPUT_DIR)