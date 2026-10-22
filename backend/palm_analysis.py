from pathlib import Path
from ultralytics import YOLO
import cv2
import numpy as np


# ============================================================
# MODEL PATH
# ============================================================


PALMISTRY_MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "best.pt"
)


# ============================================================
# LOAD YOLO MODEL
# ============================================================

palmistry_model = YOLO(str
    (PALMISTRY_MODEL_PATH)
)


# ============================================================
# PALM ANALYSIS FUNCTION
# ============================================================

def extract_palm_features(image_path):

    # --------------------------------------------------------
    # READ IMAGE
    # --------------------------------------------------------

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(
            "Unable to read the uploaded palm image."
        )

    # --------------------------------------------------------
    # IMAGE SIZE
    # --------------------------------------------------------

    height, width = image.shape[:2]

    # --------------------------------------------------------
    # GRAYSCALE
    # --------------------------------------------------------

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # --------------------------------------------------------
    # EDGE DETECTION
    # --------------------------------------------------------

    edges = cv2.Canny(
        gray,
        50,
        150
    )

    edge_pixels = int(
        np.sum(edges > 0)
    )

    # --------------------------------------------------------
    # YOLO PALMISTRY DETECTION
    # --------------------------------------------------------

    results = palmistry_model.predict(
        source=image_path,
        conf=0.10,
        verbose=False
    )

    # --------------------------------------------------------
    # CONFIDENCE VALUES
    # --------------------------------------------------------

    confidence_values = {
        "heart": 0.0,
        "head": 0.0,
        "life": 0.0,
        "fate": 0.0
    }

    # --------------------------------------------------------
    # DETECTION LIST
    # --------------------------------------------------------

    detections = []

    # --------------------------------------------------------
    # READ YOLO RESULTS
    # --------------------------------------------------------

    for result in results:

        if result.boxes is None:
            continue

        for box in result.boxes:

            class_id = int(
                box.cls[0].item()
            )

            confidence = float(
                box.conf[0].item()
            )

            class_name = palmistry_model.names.get(
                class_id,
                str(class_id)
            ).lower().strip()

            # ------------------------------------------------
            # SAVE DETECTION
            # ------------------------------------------------

            detections.append({
                "name": class_name,
                "confidence": round(
                    confidence,
                    3
                )
            })

            # ------------------------------------------------
            # SAVE HIGHEST CONFIDENCE
            # ------------------------------------------------

            if class_name in confidence_values:

                confidence_values[class_name] = max(
                    confidence_values[class_name],
                    confidence
                )

    # ========================================================
    # DETECTION STATUS
    # ========================================================

    palm_detected = len(detections) > 0

    # ========================================================
    # INDIVIDUAL LINE STATUS
    # ========================================================

    heart_detected = (
        confidence_values["heart"] > 0
    )

    head_detected = (
        confidence_values["head"] > 0
    )

    life_detected = (
        confidence_values["life"] > 0
    )

    fate_detected = (
        confidence_values["fate"] > 0
    )

    # ========================================================
    # OVERALL DETECTION CONFIDENCE
    # ========================================================

    detected_confidences = [
        confidence
        for confidence in confidence_values.values()
        if confidence > 0
    ]

    if detected_confidences:

        detection_confidence = (
            sum(detected_confidences)
            / len(detected_confidences)
        )

    else:

        detection_confidence = 0.0

    # ========================================================
    # ANALYSIS CONFIDENCE
    # ========================================================

    total_possible_features = 4

    detected_features = sum([
        heart_detected,
        head_detected,
        life_detected,
        fate_detected
    ])

    analysis_confidence = (
        detected_features
        / total_possible_features
    )

    # ========================================================
    # PALM SHAPE
    # ========================================================

    aspect_ratio = width / height

    if aspect_ratio > 1.15:

        palm_shape = "Wide Palm"

    elif aspect_ratio < 0.85:

        palm_shape = "Long Palm"

    else:

        palm_shape = "Balanced Palm"

    # ========================================================
    # LINE DETECTION INFORMATION
    # ========================================================

    total_detected_lines = len(
        detections
    )

    long_lines = sum(
        1
        for detection in detections
        if detection["confidence"] >= 0.50
    )

    # ========================================================
    # OTHER EXTRACTED FEATURES
    # ========================================================

    other_features = {
        "palm_shape": palm_shape,
        "image_width": width,
        "image_height": height,
        "edge_pixels": edge_pixels,
        "total_detected_lines": total_detected_lines,
        "high_confidence_detections": long_lines
    }

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {

        # ----------------------------------------------------
        # PALM DETECTION
        # ----------------------------------------------------

        "palm_detected": palm_detected,

        "detection_confidence": round(
            detection_confidence * 100,
            1
        ),

        "analysis_confidence": round(
            analysis_confidence * 100,
            1
        ),

        # ----------------------------------------------------
        # PALM LINES
        # ----------------------------------------------------

        "life_line":
            "Detected"
            if life_detected
            else "Not detected",

        "heart_line":
            "Detected"
            if heart_detected
            else "Not detected",

        "head_line":
            "Detected"
            if head_detected
            else "Not detected",

        "fate_line":
            "Detected"
            if fate_detected
            else "Not detected",

        # ----------------------------------------------------
        # LINE CONFIDENCE
        # ----------------------------------------------------

        "life_confidence": round(
            confidence_values["life"] * 100,
            1
        ),

        "heart_confidence": round(
            confidence_values["heart"] * 100,
            1
        ),

        "head_confidence": round(
            confidence_values["head"] * 100,
            1
        ),

        "fate_confidence": round(
            confidence_values["fate"] * 100,
            1
        ),

        # ----------------------------------------------------
        # OTHER FEATURES
        # ----------------------------------------------------

        "other_features": other_features,

        # ----------------------------------------------------
        # ALL YOLO DETECTIONS
        # ----------------------------------------------------

        "palmistry_detections": detections,

        # ----------------------------------------------------
        # BASIC INFORMATION
        # ----------------------------------------------------

        "image_width": width,

        "image_height": height,

        "edge_pixels": edge_pixels,

        "palm_shape": palm_shape,

        "total_detected_lines":
            total_detected_lines,

        "long_lines":
            long_lines
    }