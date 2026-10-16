from pathlib import Path

from ultralytics import YOLO

from app.services.palm_feature_extractor import (
    build_palm_features
)


MODEL_PATH = Path(
    r"C:\Users\Toshiba\palmistry-tarot-platform\runs\pose\train-3\weights\best.pt"
)

IMAGE_PATH = Path(
    r"C:\Users\Toshiba\palmistry-tarot-platform\Palm lines recognition-5\valid\images\smaple.jpg"
)


model = YOLO(str(MODEL_PATH))

results = model.predict(
    source=str(IMAGE_PATH),
    imgsz=512,
    conf=0.25,
    device="cpu",
    verbose=False
)


detections = []


for result in results:

    if result.boxes is None:
        continue

    if result.keypoints is None:
        continue

    for i in range(len(result.boxes)):

        class_id = int(
            result.boxes.cls[i].item()
        )

        confidence = float(
            result.boxes.conf[i].item()
        )

        points = result.keypoints.xy[i].cpu().numpy()

        keypoints = [
            (float(point[0]), float(point[1]))
            for point in points
        ]

        detections.append({
            "class_id": class_id,
            "confidence": confidence,
            "keypoints": keypoints,
        })


features = build_palm_features(detections)


print("\n========== PALM FEATURES ==========\n")

for line_name, data in features["lines"].items():

    print(f"{line_name.upper()} LINE")

    print(
        f"Confidence: {data['confidence']}"
    )

    print(
        f"Keypoints: {data['keypoint_count']}"
    )

    print(
        f"Length: {data['length']}"
    )

    print(
        f"Direct distance: {data['direct_distance']}"
    )

    print(
        f"Curvature ratio: {data['curvature']}"
    )

    print(
        f"Orientation: {data['orientation']}°"
    )

    print(
        f"Start: {data['start_point']}"
    )

    print(
        f"End: {data['end_point']}"
    )

    print("----------------------------------")

print(
    f"\nDetected lines: "
    f"{features['detected_line_count']}"
)