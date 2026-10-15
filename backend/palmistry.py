"""
Reference implementation of /palmistry/upload using MediaPipe Hands.

Common bugs this avoids, based on symptoms like "always says No Palm
Landmarks Detected even with a clear photo":

1. Wrong color order -- MediaPipe expects RGB, but cv2.imread /
   cv2.imdecode gives BGR. Forgetting cv2.cvtColor(..., COLOR_BGR2RGB)
   is the #1 cause of "never detects anything."
2. min_detection_confidence set too high (e.g. 0.7+) for a live webcam
   capture, which tends to be noisier/lower quality than a studio photo.
   0.5 is the MediaPipe default and a safer starting point.
3. Re-creating the Hands() model on every request instead of reusing a
   static_image_mode instance -- wasteful, and in some setups causes
   graph re-init failures that get silently swallowed.
4. Not handling multi_hand_landmarks being None (i.e. not checking for
   "no hand found" before indexing into the result).
5. Reading the wrong field from the UploadFile (e.g. reading only part
   of the stream, or forgetting `await file.read()` is async).
"""

import base64
from io import BytesIO

import cv2
import mediapipe as mp
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image

router = APIRouter()

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Reuse a single Hands() instance across requests. static_image_mode=True
# is correct here since each request is an independent photo, not a
# video stream -- using the video-tracking mode (False) on unrelated
# frames from different requests can actually hurt accuracy.
hands_detector = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5,  # lower to 0.3 if still failing on OK-quality images
    model_complexity=1,
)


def decode_upload_to_bgr(raw_bytes: bytes) -> np.ndarray:
    """Decode raw uploaded bytes into an OpenCV BGR image (H, W, 3)."""
    image = Image.open(BytesIO(raw_bytes)).convert("RGB")
    rgb = np.array(image)
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    return bgr


def annotate_frame(bgr_image: np.ndarray, hand_landmarks) -> str:
    """Draw landmarks on the frame and return a base64 PNG data URL."""
    annotated = bgr_image.copy()
    mp_drawing.draw_landmarks(
        annotated,
        hand_landmarks,
        mp_hands.HAND_CONNECTIONS,
        mp_drawing_styles.get_default_hand_landmarks_style(),
        mp_drawing_styles.get_default_hand_connections_style(),
    )
    rgb_annotated = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb_annotated)
    buf = BytesIO()
    pil_img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"


@router.post("/palmistry/upload")
async def upload_palm_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        bgr_image = decode_upload_to_bgr(raw_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not decode image file.")

    # MediaPipe requires RGB input, NOT BGR.
    rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)

    results = hands_detector.process(rgb_image)

    if not results.multi_hand_landmarks:
        return {
            "detected": False,
            "analysis": (
                "No hand landmarks were found in the image. Try better "
                "lighting, a plain background, and keep your open palm "
                "centered and filling most of the frame."
            ),
        }

    hand_landmarks = results.multi_hand_landmarks[0]
    handedness = None
    confidence = None
    if results.multi_handedness:
        classification = results.multi_handedness[0].classification[0]
        handedness = classification.label
        confidence = classification.score

    annotated_b64 = annotate_frame(bgr_image, hand_landmarks)

    # --- Your archetype / line-metric logic goes here ---
    # This is where you'd compute things like palm_aspect_ratio,
    # finger_palm_ratio, and the heart/head/life line scores from the
    # 21 (x, y, z) landmarks in hand_landmarks.landmark.
    landmarks_xyz = [
        {"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand_landmarks.landmark
    ]

    return {
        "detected": True,
        "confidence": confidence if confidence is not None else 0.9,
        "handedness": handedness,
        "annotated_image_base64": annotated_b64,
        "landmarks": landmarks_xyz,
        "archetype": "Universal Seeker",  # placeholder -- replace with your logic
        "element": "Water",
        "gesture": "Open Palm",
    }