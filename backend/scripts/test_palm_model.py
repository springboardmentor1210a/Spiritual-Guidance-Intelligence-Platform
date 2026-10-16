from ultralytics import YOLO
from pathlib import Path

# Trained YOLO model
MODEL_PATH = Path(
    r"C:\Users\Toshiba\palmistry-tarot-platform\runs\pose\train-3\weights\best.pt"
)

# CHANGE THIS to the actual path of your test image
IMAGE_PATH = Path(
    r"C:\Users\Toshiba\palmistry-tarot-platform\Palm lines recognition-5\valid\images\smaple.jpg"
)

# Load trained model
model = YOLO(str(MODEL_PATH))

# Run prediction
results = model.predict(
    source=str(IMAGE_PATH),
    imgsz=512,
    conf=0.25,
    save=True
)

print("\nPrediction completed.")

for result in results:
    print("Detected objects:", len(result.boxes))

    if result.keypoints is not None:
        print("Keypoints detected:", len(result.keypoints))

    if result.boxes is not None:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            class_name = model.names[class_id]

            print(
                f"Detected: {class_name} | "
                f"Confidence: {confidence:.3f}"
            )