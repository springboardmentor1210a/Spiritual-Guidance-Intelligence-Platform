from pathlib import Path

from app.services.palm.preprocessing import preprocess_palm_image
from app.services.palm.feature_extraction import extract_palm_features
from app.services.palm.landmark_detection import detect_hand_landmarks
from app.services.palm.palm_shape import analyze_palm_shape
from app.services.palm.finger_analysis import analyze_fingers
from app.services.palm.line_detection import detect_palm_lines
from app.services.palm.palm_interpretation import interpret_palm


def analyze_palm(image_path: str) -> dict:
    """
    Complete palm analysis pipeline.

    Steps:
    1. Image preprocessing
    2. Basic feature extraction
    3. Hand landmark detection
    4. Palm shape analysis
    5. Finger structure analysis
    6. Palm line detection
    """

    image_path = str(Path(image_path))

    # -----------------------------------
    # 1. PREPROCESSING
    # -----------------------------------

    preprocessed = preprocess_palm_image(
        Path(image_path).read_bytes()
    )

    # -----------------------------------
    # 2. BASIC IMAGE FEATURES
    # -----------------------------------

    image_features = extract_palm_features(
        preprocessed
    )

    # -----------------------------------
    # 3. HAND LANDMARKS
    # -----------------------------------

    landmarks = detect_hand_landmarks(
        image_path
    )

    # -----------------------------------
    # 4. PALM SHAPE
    # -----------------------------------

    palm_shape = analyze_palm_shape(
        landmarks
    )

    # -----------------------------------
    # 5. FINGER STRUCTURE
    # -----------------------------------

    finger_analysis = analyze_fingers(
        landmarks
    )

    # -----------------------------------
    # 6. PALM LINES
    # -----------------------------------

    palm_lines = detect_palm_lines(
        image_path
    )
    interpretations = interpret_palm(palm_lines,palm_shape,finger_analysis)

    # -----------------------------------
    # FINAL RESULT
    # -----------------------------------

    return {
        "success": True,

        "image_features": image_features,

        "hand_landmarks": {
            "detected": landmarks["detected"],
            "count": len(landmarks["landmarks"])
        },

        "palm_shape": palm_shape,

        "finger_analysis": finger_analysis,

        "palm_lines": palm_lines,
        "interpretations": interpretations
    }
