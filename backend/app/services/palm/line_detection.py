from pathlib import Path
from math import sqrt
from ultralytics import YOLO


# Locate the trained YOLO model
MODEL_PATH = (
    Path(__file__).resolve().parents[3]
    / "models"
    / "palm_lines_best.pt"
)

# Load the model once when the application starts
model = YOLO(str(MODEL_PATH))


def calculate_line_length(points):
    """
    Calculate the total length of a palm line
    using the detected keypoints.
    """

    if len(points) < 2:
        return 0.0

    total_length = 0.0

    for i in range(1, len(points)):

        x1 = points[i - 1]["x"]
        y1 = points[i - 1]["y"]

        x2 = points[i]["x"]
        y2 = points[i]["y"]

        distance = sqrt(
            (x2 - x1) ** 2 +
            (y2 - y1) ** 2
        )

        total_length += distance

    return round(total_length, 2)


def calculate_line_direction(points):
    """
    Calculate the overall direction of the detected line.
    """

    if len(points) < 2:
        return {
            "dx": 0.0,
            "dy": 0.0,
            "direction": "Unknown"
        }

    start = points[0]
    end = points[-1]

    dx = end["x"] - start["x"]
    dy = end["y"] - start["y"]

    if abs(dx) < 1e-6:
        direction = "Vertical"

    elif abs(dy) < 1e-6:
        direction = "Horizontal"

    elif dy < 0:
        direction = "Upward"

    else:
        direction = "Downward"

    return {
        "dx": round(dx, 2),
        "dy": round(dy, 2),
        "direction": direction
    }


def classify_line_length(length):
    """
    Give a simple relative classification to the
    detected line length.

    This is based on detected pixel geometry,
    not a medical or scientific prediction.
    """

    if length >= 350:
        return "Long"

    if length >= 180:
        return "Medium"

    return "Short"


def remove_duplicate_lines(detections):
    """
    Keep only the strongest detection for each
    palm-line class.

    Example:

    fate 0.48
    fate 0.27

    becomes:

    fate 0.48
    """

    best_lines = {}

    for detection in detections:

        line_name = detection.get("line")

        if not line_name:
            continue

        confidence = detection.get(
            "confidence",
            0
        )

        # If this line type has not appeared before
        if line_name not in best_lines:

            best_lines[line_name] = detection

        # If another detection has higher confidence
        elif confidence > best_lines[line_name].get(
            "confidence",
            0
        ):

            best_lines[line_name] = detection

    return list(best_lines.values())


def detect_palm_lines(image_path: str) -> dict:
    """
    Detect palm lines using the trained YOLO pose model
    and extract image-specific geometric features.
    """

    results = model.predict(
        source=image_path,
        imgsz=640,
        conf=0.25,
        device="cpu",
        verbose=False
    )

    detections = []

    for result in results:

        if result.boxes is None:
            continue

        boxes = result.boxes
        keypoints = result.keypoints

        for i in range(len(boxes)):

            class_id = int(
                boxes.cls[i].item()
            )

            confidence = float(
                boxes.conf[i].item()
            )

            class_name = model.names[class_id]

            # -----------------------------------
            # BOUNDING BOX
            # -----------------------------------

            bbox = boxes.xyxy[i].tolist()

            detection = {
                "line": class_name,

                "confidence": round(
                    confidence,
                    4
                ),

                "bbox": [
                    round(float(value), 2)
                    for value in bbox
                ]
            }

            # -----------------------------------
            # KEYPOINTS
            # -----------------------------------

            points = []

            if keypoints is not None:

                raw_points = (
                    keypoints.xy[i].tolist()
                )

                points = [
                    {
                        "x": round(
                            float(point[0]),
                            2
                        ),
                        "y": round(
                            float(point[1]),
                            2
                        )
                    }
                    for point in raw_points
                ]

                detection["keypoints"] = points

            # -----------------------------------
            # IMAGE-SPECIFIC LINE FEATURES
            # -----------------------------------

            line_length = calculate_line_length(
                points
            )

            direction = calculate_line_direction(
                points
            )

            detection["length"] = line_length

            detection["length_category"] = (
                classify_line_length(
                    line_length
                )
            )

            detection["direction"] = (
                direction["direction"]
            )

            detection["start_point"] = (
                points[0]
                if points
                else None
            )

            detection["end_point"] = (
                points[-1]
                if points
                else None
            )

            detections.append(
                detection
            )

    # -------------------------------------------
    # REMOVE DUPLICATE LINE TYPES
    # -------------------------------------------

    detections = remove_duplicate_lines(
        detections
    )

    return {
        "detected": len(detections) > 0,

        "count": len(detections),

        "lines": detections
    }