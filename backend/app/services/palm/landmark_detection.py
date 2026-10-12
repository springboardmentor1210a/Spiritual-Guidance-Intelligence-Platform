import mediapipe as mp
from pathlib import Path
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


#MODEL_PATH = "models/hand_landmarker.task"
MODEL_PATH = str(
    Path(__file__).resolve().parents[3] / "models" / "hand_landmarker.task"
)


def detect_hand_landmarks(image_path: str) -> dict:
    """
    Detect 21 hand landmarks using MediaPipe Tasks API.
    """

    # Create MediaPipe model configuration
    base_options = python.BaseOptions(
        model_asset_path=MODEL_PATH
    )

    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        num_hands=1
    )

    # Create hand landmarker
    detector = vision.HandLandmarker.create_from_options(
        options
    )

    # Load image
    image = mp.Image.create_from_file(image_path)

    # Detect landmarks
    result = detector.detect(image)

    detector.close()

    if not result.hand_landmarks:
        return {
            "detected": False,
            "landmarks": []
        }

    landmarks = []
    height = image.height
    width = image.width
    for landmark in result.hand_landmarks[0]:
        landmarks.append({
            "x": round(landmark.x, 6),
            "y": round(landmark.y, 6),
            "px": int(landmark.x*width),
            "py": int(landmark.y*height),
            "z": round(landmark.z, 6)
        })

    return {
        "detected": True,
        "landmarks": landmarks
    }
