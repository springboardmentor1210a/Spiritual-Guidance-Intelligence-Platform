from __future__ import annotations

import base64

import json
import logging
import os

import re

from pathlib import Path

from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from fastapi.responses import FileResponse

from pydantic import BaseModel, Field

from sqlalchemy.orm import Session

try:
    import cv2
    import numpy as np
    import onnxruntime as ort
except ImportError:
    cv2 = None
    np = None
    ort = None

from app.database import get_db

from app.dependencies import get_current_user

from app.models import Reading, User, UserProfile

try:

    from groq import Groq

except ImportError:

    Groq = None

router = APIRouter(tags=["Readings & Personal Insights"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads" / "palms"

MAX_IMAGE_BYTES = 8 * 1024 * 1024

DEFAULT_GROQ_MODEL = "qwen/qwen3.8-27b"
LOGGER = logging.getLogger(__name__)
PALM_ONNX_PATH = Path(__file__).resolve().parents[2] / "models" / "student_fp16.onnx"
PALM_MODEL_SIZE = 512
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32) if np is not None else None
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32) if np is not None else None
_ONNX_SESSION = None
_ONNX_SESSION_ERROR = None


MAJOR_ARCANA = [

    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",

    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",

    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",

    "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World",

]

RANKS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"]

SUITS = ["Wands", "Cups", "Swords", "Pentacles"]

TAROT_CARDS = set(MAJOR_ARCANA + [f"{rank} of {suit}" for suit in SUITS for rank in RANKS])

PALM_FEATURES = [

    {"key": "heart", "name": "Heart Line", "area": "Upper palm", "description": "Traditionally associated with emotional expression and relationships."},

    {"key": "head", "name": "Head Line", "area": "Middle palm", "description": "Traditionally associated with thinking style and decision-making."},

    {"key": "life", "name": "Life Line", "area": "Curves around the thumb", "description": "Traditionally associated with vitality and major life changes; it does not measure lifespan."},

    {"key": "fate", "name": "Fate Line", "area": "Vertical centre of palm", "description": "Traditionally associated with direction, work and personal goals."},

    {"key": "sun", "name": "Sun Line", "area": "Below the ring finger", "description": "Traditionally associated with creativity, recognition and fulfilment."},

]

PALM_COLORS = {"heart": "#9d3f3f", "head": "#765039", "life": "#6b7b3e", "fate": "#7a5aa6", "sun": "#b47724"}

class TarotRequest(BaseModel):

    cards: list[str] = Field(min_length=1, max_length=10)

    question: str = Field(default="General reflection", max_length=500)

    spread: str = Field(default="Custom spread", max_length=80)

    orientations: list[str] = Field(default_factory=list, max_length=10)

def _env_value(name: str, default: str = "") -> str:

    env_path = Path(__file__).resolve().parents[2] / ".env"

    if env_path.is_file():

        try:

            for raw in env_path.read_text(encoding="utf-8").splitlines():

                line = raw.strip()

                if not line or line.startswith("#") or "=" not in line:

                    continue

                key, value = line.split("=", 1)

                if key.strip() == name:

                    value = value.strip().strip('"').strip("'")

                    if value:

                        return value

        except Exception:

            pass

    return os.getenv(name, default).strip().strip('"').strip("'")

def _groq_client() -> Groq:

    key = _env_value("GROQ_API_KEY")

    if not key or key.upper().startswith("YOUR_"):

        raise HTTPException(status_code=503, detail="Groq is not configured. Add a valid GROQ_API_KEY to backend/.env.")

    if Groq is None:

        raise HTTPException(status_code=503, detail="The Groq Python package is not installed. Run: pip install groq")

    return Groq(api_key=key)

def _model() -> str:

    return _env_value("GROQ_MODEL", DEFAULT_GROQ_MODEL)

def _header_value(exc: Exception, name: str):

    """Read a response header from Groq SDK exceptions when available."""

    response = getattr(exc, "response", None)

    headers = getattr(response, "headers", None)

    if headers is None:

        headers = getattr(exc, "headers", None)

    if headers is None:

        return None

    try:

        value = headers.get(name)

        if value is not None:

            return str(value)

    except Exception:

        pass

    return None

def _rate_limit_message(exc: Exception) -> str:

    retry_after = _header_value(exc, "retry-after")

    reset_tokens = _header_value(exc, "x-ratelimit-reset-tokens")

    reset_requests = _header_value(exc, "x-ratelimit-reset-requests")

    if retry_after:

        try:

            seconds = max(1, int(float(retry_after)))

            if seconds < 60:

                wait_text = f"about {seconds} second{"s" if seconds != 1 else ""}"

            else:

                minutes = max(1, round(seconds / 60))

                wait_text = f"about {minutes} minute{"s" if minutes != 1 else ""}"

            return (

                f"Groq rate limit reached. Please wait {wait_text} and try again. "

                "The limit resets automatically; you do not need a new API key."

            )

        except (TypeError, ValueError):

            pass

    reset_hint = reset_tokens or reset_requests

    if reset_hint:

        return (

            f"Groq rate limit reached. The current limit should reset in approximately {reset_hint}. "

            "Please try again after that; a new API key is not required."

        )

    return (

        "Groq rate limit reached. Please wait for the current rate-limit window to reset and try again. "

        "The limit resets automatically; you do not need a new API key."

    )

def _ai_error(exc: Exception) -> str:

    msg = re.sub(r"gsk_[A-Za-z0-9_-]+", "[redacted-key]", str(exc))

    lower = msg.lower()

    if "401" in lower or "authentication" in lower or "unauthorized" in lower or "invalid api key" in lower:

        return "Groq rejected the configured API key. Check GROQ_API_KEY in backend/.env and restart the backend."

    if "429" in lower or "rate limit" in lower or "quota" in lower:

        return _rate_limit_message(exc)

    if "model" in lower and ("not found" in lower or "does not exist" in lower or "not available" in lower):

        return "The configured Groq model is not available. Check GROQ_MODEL in backend/.env."

    return msg[:700]

def _safe_json(text: str, fallback):

    if not text:

        return fallback

    cleaned = text.strip()

    if cleaned.startswith("```"):

        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.I)

        cleaned = re.sub(r"\s*```$", "", cleaned)

    try:

        return json.loads(cleaned)

    except Exception:

        start, end = cleaned.find("{"), cleaned.rfind("}")

        if start >= 0 and end > start:

            try:

                return json.loads(cleaned[start:end + 1])

            except Exception:

                pass

    return fallback

def _profile_context(profile: UserProfile | None) -> dict:

    if not profile:

        return {"profile_available": False}

    result = {"profile_available": True}

    for field in ["date_of_birth", "gender", "occupation", "education", "location", "relationship_status", "goals", "interests", "about", "spiritual_goals"]:

        if hasattr(profile, field):

            value = getattr(profile, field)

            if value is not None and str(value).strip():

                result[field] = str(value).strip()

    return result

def save_reading(db: Session, user: User, reading_type: str, title: str, input_summary: str, result_text: str, image_path: str | None = None, detected_lines_json: str | None = None, palm_insights_json: str | None = None, detection_status: str | None = None):

    item = Reading(user_id=user.id, reading_type=reading_type, title=title, input_summary=input_summary, result_text=result_text, image_path=image_path, detected_lines_json=detected_lines_json, palm_insights_json=palm_insights_json, detection_status=detection_status)

    db.add(item)

    db.commit()

    db.refresh(item)

    return item

def _decode_json(value, fallback):

    if value is None:

        return fallback

    if isinstance(value, (dict, list)):

        return value

    try:

        return json.loads(value)

    except Exception:

        return fallback

def reading_dict(item: Reading):

    return {

        "id": item.id,

        "reading_type": item.reading_type,

        "title": item.title,

        "input_summary": item.input_summary,

        "result_text": item.result_text,

        "created_at": item.created_at.isoformat() if item.created_at else None,

        "detection_status": getattr(item, "detection_status", None),

        "detected_lines": _decode_json(getattr(item, "detected_lines_json", None), []),

        "palm_insights": _decode_json(getattr(item, "palm_insights_json", None), {}),

        "has_palm_image": bool(getattr(item, "image_path", None)),

        "ai_enabled": True,

    }

def _get_profile(db: Session, user: User):

    return db.query(UserProfile).filter(UserProfile.user_id == user.id).first()

def _clamp01(value):

    try:

        n = float(value)

    except (TypeError, ValueError):

        return None

    if abs(n) > 1:

        n /= 100.0

    return max(0.0, min(1.0, n))

def _sanitize_palm_points(points, hand_bbox=None):

    if not isinstance(points, list):

        return []

    bbox = None

    if isinstance(hand_bbox, list) and len(hand_bbox) == 4:

        vals = [_clamp01(v) for v in hand_bbox]

        if all(v is not None for v in vals):

            x1, y1, x2, y2 = vals

            if x2 < x1:

                x1, x2 = x2, x1

            if y2 < y1:

                y1, y2 = y2, y1

            # Small safety margin around the detected hand.

            pad_x = max(0.02, (x2 - x1) * 0.06)

            pad_y = max(0.02, (y2 - y1) * 0.06)

            bbox = (max(0.0, x1 - pad_x), max(0.0, y1 - pad_y), min(1.0, x2 + pad_x), min(1.0, y2 + pad_y))

    clean = []

    for point in points[:20]:

        if not isinstance(point, (list, tuple)) or len(point) < 2:

            continue

        x, y = _clamp01(point[0]), _clamp01(point[1])

        if x is None or y is None:

            continue

        if bbox and not (bbox[0] <= x <= bbox[2] and bbox[1] <= y <= bbox[3]):

            continue

        clean.append([round(x, 4), round(y, 4)])

    # Remove near-duplicate points so the overlay stays clean.

    deduped = []

    for point in clean:

        if not deduped or abs(point[0] - deduped[-1][0]) + abs(point[1] - deduped[-1][1]) > 0.008:

            deduped.append(point)

    return deduped if len(deduped) >= 2 else []

def _sanitize_palm_analysis(ai: dict) -> dict:

    hand_bbox = ai.get("hand_bbox")

    if isinstance(hand_bbox, list) and len(hand_bbox) == 4:

        ai["hand_bbox"] = [round(_clamp01(v), 4) if _clamp01(v) is not None else 0.0 for v in hand_bbox]

    features = ai.get("features") if isinstance(ai.get("features"), dict) else {}

    for key, raw in features.items():

        if isinstance(raw, dict):

            raw["normalized_points"] = _sanitize_palm_points(raw.get("normalized_points", []), ai.get("hand_bbox"))

            raw["confidence"] = max(0.0, min(1.0, float(raw.get("confidence", 0) or 0)))

    return ai

def _sanitize_points(points, hand_bbox=None):

    """Keep AI overlay points normalized and inside the visually detected hand region."""

    if not isinstance(points, list):

        return []

    bbox = hand_bbox if isinstance(hand_bbox, list) and len(hand_bbox) == 4 else None

    if bbox:

        try:

            bx1, by1, bx2, by2 = [float(v) for v in bbox]

            if max(abs(bx1), abs(by1), abs(bx2), abs(by2)) > 1.5:

                bx1, by1, bx2, by2 = [v / 100.0 for v in (bx1, by1, bx2, by2)]

            bx1, by1, bx2, by2 = max(0, min(bx1, bx2)), max(0, min(by1, by2)), min(1, max(bx1, bx2)), min(1, max(by1, by2))

        except Exception:

            bbox = None

    cleaned = []

    for point in points:

        if not isinstance(point, (list, tuple)) or len(point) < 2:

            continue

        try:

            x, y = float(point[0]), float(point[1])

            if abs(x) > 1.5 or abs(y) > 1.5:

                x, y = x / 100.0, y / 100.0

            if not (0 <= x <= 1 and 0 <= y <= 1):

                continue

            if bbox:

                pad_x = max(0.025, (bx2 - bx1) * 0.04)

                pad_y = max(0.025, (by2 - by1) * 0.04)

                if not (bx1 - pad_x <= x <= bx2 + pad_x and by1 - pad_y <= y <= by2 + pad_y):

                    continue

            if not cleaned or abs(x - cleaned[-1][0]) + abs(y - cleaned[-1][1]) > 0.006:

                cleaned.append([round(x, 5), round(y, 5)])

        except Exception:

            continue

    return cleaned[:20]

def _onnx_session():
    """Load the local palm-crease model once per worker, if available."""
    global _ONNX_SESSION, _ONNX_SESSION_ERROR
    if _ONNX_SESSION is not None:
        return _ONNX_SESSION
    if _ONNX_SESSION_ERROR:
        return None
    if ort is None or np is None or cv2 is None:
        _ONNX_SESSION_ERROR = "Install onnxruntime, numpy and opencv-python-headless."
        return None
    if not PALM_ONNX_PATH.is_file():
        _ONNX_SESSION_ERROR = f"ONNX model not found at {PALM_ONNX_PATH}"
        return None
    try:
        _ONNX_SESSION = ort.InferenceSession(str(PALM_ONNX_PATH), providers=["CPUExecutionProvider"])
        inputs = _ONNX_SESSION.get_inputs()
        outputs = _ONNX_SESSION.get_outputs()
        if not inputs or not outputs:
            raise RuntimeError("ONNX model has no input or output tensors.")
        expected = [1, 3, PALM_MODEL_SIZE, PALM_MODEL_SIZE]
        shape = list(inputs[0].shape)
        if shape != expected:
            raise RuntimeError(f"Unexpected ONNX input shape {shape}; expected {expected}.")
        return _ONNX_SESSION
    except Exception as exc:
        _ONNX_SESSION_ERROR = str(exc)
        LOGGER.exception("Could not load palm ONNX model")
        return None


def _sample_mask_points(mask, class_index: int, max_points: int = 16):
    """Convert a segmentation class mask into normalized, ordered polyline points."""
    if np is None or cv2 is None:
        return [], 0
    binary = (mask == class_index).astype(np.uint8)
    pixel_count = int(binary.sum())
    if pixel_count < 8:
        return [], pixel_count

    # Keep thin crease masks intact; a morphological opening can erase 1-pixel lines.
    count, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if count <= 1:
        return [], pixel_count
    component = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    if stats[component, cv2.CC_STAT_AREA] < 8:
        return [], pixel_count
    ys, xs = np.where(labels == component)
    if len(xs) < 8:
        return [], pixel_count

    # Order pixels along the dominant axis, averaging the minor axis in bins.
    x_span = int(xs.max() - xs.min())
    y_span = int(ys.max() - ys.min())
    points = []
    if x_span >= y_span:
        edges = np.linspace(xs.min(), xs.max() + 1, min(max_points, max(2, x_span + 1)) + 1)
        for left, right in zip(edges[:-1], edges[1:]):
            select = (xs >= left) & (xs < right)
            if np.any(select):
                points.append([float(np.mean(xs[select])) / (PALM_MODEL_SIZE - 1), float(np.mean(ys[select])) / (PALM_MODEL_SIZE - 1)])
    else:
        edges = np.linspace(ys.min(), ys.max() + 1, min(max_points, max(2, y_span + 1)) + 1)
        for top, bottom in zip(edges[:-1], edges[1:]):
            select = (ys >= top) & (ys < bottom)
            if np.any(select):
                points.append([float(np.mean(xs[select])) / (PALM_MODEL_SIZE - 1), float(np.mean(ys[select])) / (PALM_MODEL_SIZE - 1)])
    if len(points) < 2:
        return [], pixel_count
    return [[round(x, 5), round(y, 5)] for x, y in points[:max_points]], pixel_count


def _onnx_palm_lines(image_bytes: bytes):
    """Run the pretrained three-line segmentation model. Returns line data or None."""
    session = _onnx_session()
    if session is None:
        return None
    try:
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        bgr = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if bgr is None:
            raise ValueError("OpenCV could not decode the uploaded image.")
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        # Matches web/palmLines.js: plain resize, RGB, ImageNet normalization, NCHW.
        resized = cv2.resize(rgb, (PALM_MODEL_SIZE, PALM_MODEL_SIZE), interpolation=cv2.INTER_LINEAR)
        image_float = resized.astype(np.float32) / 255.0
        image_float = (image_float - IMAGENET_MEAN) / IMAGENET_STD
        tensor = np.transpose(image_float, (2, 0, 1))[None, ...].astype(np.float32)
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        logits = session.run([output_name], {input_name: tensor})[0]
        if logits.shape != (1, 4, PALM_MODEL_SIZE, PALM_MODEL_SIZE):
            raise RuntimeError(f"Unexpected ONNX output shape: {logits.shape}")
        mask = np.argmax(logits[0], axis=0).astype(np.uint8)
        result = {}
        for key, class_index in (("heart", 1), ("head", 2), ("life", 3)):
            points, pixels = _sample_mask_points(mask, class_index)
            result[key] = {"normalized_points": points, "pixel_count": pixels, "confidence": 0.0 if not pixels else min(0.99, 0.5 + pixels / 20000.0)}
        result["model"] = "student_fp16.onnx"
        result["input_size"] = PALM_MODEL_SIZE
        return result
    except Exception as exc:
        LOGGER.exception("Palm ONNX inference failed")
        return {"error": str(exc), "model": "student_fp16.onnx"}


def _palm_ai_analysis(client: Groq, image_bytes: bytes, mime_type: str, profile: dict) -> dict:

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    data_url = f"data:{mime_type};base64,{image_b64}"

    prompt = f"""

You are the visual AI engine for a palmistry reflection application.

Analyze the uploaded open-palm photograph. Palmistry is cultural and reflective, not scientifically validated. Never diagnose health, determine lifespan, identify a person, or guarantee future events.

Return ONLY valid JSON.

IMPORTANT VISUAL TASKS:

A) Identify the five traditional palm features: Heart Line, Head Line, Life Line, Fate Line, Sun Line.

B) First estimate the visible hand bounding box as hand_bbox = [left, top, right, bottom], normalized to the ORIGINAL FULL IMAGE (0 to 1, x left-to-right, y top-to-bottom). Then provide normalized_points as 6-16 [x,y] points for each line, also normalized to the ORIGINAL FULL IMAGE.

LINE-PLACEMENT RULES — THESE ARE CRITICAL:

- Every point MUST lie on the visible palm/hand skin, never on the background, clothing, table, wrist outside the hand, or empty image area.

- Heart Line: upper palm, beginning near the outer little-finger side and curving toward the index/middle-finger side.

- Head Line: begins around the thumb/index web area and crosses the middle palm.

- Life Line: begins near the thumb/index web and curves around the base of the thumb toward the lower palm/wrist.

- Fate Line: if visible, runs approximately vertically through the central palm; stop at the visible palm rather than continuing into the background.

- Sun Line: if visible, lies below/under the ring-finger area and normally occupies the upper-to-middle palm, not the background.

- Do NOT invent a line merely to fill the output. If you cannot visually trace it with reasonable confidence, return an empty normalized_points array and status "not_clear".

- The points must follow the actual visible crease, not an imagined ideal palmistry diagram. Use a gently curved polyline when the crease is curved.

- Before returning JSON, visually check every point against the image and remove any point that falls outside the hand.

C) Estimate palm structure from visible geometry: palm shape, relative length/width, symmetry, visible texture, and overall structure.

D) Estimate finger structure: thumb, index, middle, ring, little finger. Describe relative length, spacing, straightness/curvature, and visible shape. Do not infer personality from finger structure; this is visual description only.

E) Keep each line observation to 1-2 concise sentences (maximum about 30 words), each traditional_meaning to 1 concise sentence (maximum about 25 words), and each reflection to 1-2 concise sentences (maximum about 45 words). Keep overall/personality/career/relationship reflections concise and balanced (maximum about 55 words each).

F) Provide confidence from 0 to 1 for each feature and each structural group.

User profile context:

{json.dumps(profile, ensure_ascii=False)}

Use this exact JSON shape:

{{

  "hand_detected": true,

  "hand_bbox": [0.0,0.0,1.0,1.0],

  "image_quality": "good",

  "overall_observation": "...",

  "features": {{

    "heart": {{"status":"visible","confidence":0.0,"normalized_points":[],"observation":"...","traditional_meaning":"...","reflection":"..."}},

    "head": {{"status":"visible","confidence":0.0,"normalized_points":[],"observation":"...","traditional_meaning":"...","reflection":"..."}},

    "life": {{"status":"visible","confidence":0.0,"normalized_points":[],"observation":"...","traditional_meaning":"...","reflection":"..."}},

    "fate": {{"status":"visible","confidence":0.0,"normalized_points":[],"observation":"...","traditional_meaning":"...","reflection":"..."}},

    "sun": {{"status":"visible","confidence":0.0,"normalized_points":[],"observation":"...","traditional_meaning":"...","reflection":"..."}}

  }},

  "palm_structure": {{

    "shape": "...",

    "length_width_ratio": "...",

    "symmetry": "...",

    "texture": "...",

    "observation": "...",

    "confidence": 0.0

  }},

  "finger_structure": {{

    "overall_observation": "...",

    "confidence": 0.0,

    "thumb": {{"relative_length":"...","shape":"...","spacing":"...","straightness":"...","confidence":0.0}},

    "index": {{"relative_length":"...","shape":"...","spacing":"...","straightness":"...","confidence":0.0}},

    "middle": {{"relative_length":"...","shape":"...","spacing":"...","straightness":"...","confidence":0.0}},

    "ring": {{"relative_length":"...","shape":"...","spacing":"...","straightness":"...","confidence":0.0}},

    "little": {{"relative_length":"...","shape":"...","spacing":"...","straightness":"...","confidence":0.0}}

  }},

  "overall_reflection":"...",

  "personality_reflection":"...",

  "career_reflection":"...",

  "relationship_reflection":"...",

  "growth_opportunities":["...","...","..."],

  "practical_next_steps":["...","...","..."],

  "closing_reflection":"..."

}}

"""

    response = client.chat.completions.create(

        model=_model(),

        messages=[{"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": data_url}}]}],

        temperature=0.7,

        max_completion_tokens=3000,

        response_format={"type": "json_object"},

        reasoning_effort="none",

    )

    content = response.choices[0].message.content or ""

    result = _safe_json(content, None)

    if not isinstance(result, dict):

        raise RuntimeError("Groq returned an invalid palm analysis response.")

    return _sanitize_palm_analysis(result)

def _palm_result_text(ai: dict, detected: list[dict]) -> str:

    sections = []

    for title, key in [

        ("Overall reflection", "overall_reflection"),

        ("Personality reflection", "personality_reflection"),

        ("Career & work reflection", "career_reflection"),

        ("Relationship & emotional reflection", "relationship_reflection"),

    ]:

        if ai.get(key):

            sections.append(f"{title}\n{ai[key]}")

    feature_sections = []

    for item in detected:

        conf = round(float(item.get("confidence", 0)) * 100) if str(item.get("confidence", "")).replace(".", "", 1).isdigit() else 0

        feature_sections.append(f"{item['name']}\nObservation: {item.get('observation', '')}\nTraditional association: {item.get('traditional_meaning', '')}\nReflection: {item.get('reflection', '')}\nVisual confidence: {conf}%")

    if feature_sections:

        sections.append("Palm feature interpretation\n" + "\n\n".join(feature_sections))

    if ai.get("palm_structure"):

        p = ai["palm_structure"]

        sections.append("Palm structure\nShape: {0}\nLength/width: {1}\nSymmetry: {2}\nTexture: {3}\nObservation: {4}".format(p.get("shape", ""), p.get("length_width_ratio", ""), p.get("symmetry", ""), p.get("texture", ""), p.get("observation", "")))

    if ai.get("finger_structure"):

        f = ai["finger_structure"]

        sections.append("Finger structure\n" + f.get("overall_observation", ""))

    if ai.get("growth_opportunities"):

        sections.append("Growth opportunities\n" + "\n".join(f"• {x}" for x in ai["growth_opportunities"]))

    if ai.get("practical_next_steps"):

        sections.append("Practical next steps\n" + "\n".join(f"• {x}" for x in ai["practical_next_steps"]))

    if ai.get("closing_reflection"):

        sections.append("Closing reflection\n" + ai["closing_reflection"])

    sections.append("Reflective note\nPalmistry is a cultural and reflective practice, not a scientifically validated way to predict personality, health or future events.")

    return "\n\n".join(sections)

@router.post("/api/readings/palm")

async def create_palm_reading(image: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    content_type = (image.content_type or "").lower()

    if content_type not in {"image/jpeg", "image/png", "image/webp"}:

        raise HTTPException(status_code=415, detail="Upload a JPG, PNG or WEBP palm image.")

    content = await image.read(MAX_IMAGE_BYTES + 1)

    if not content or len(content) > MAX_IMAGE_BYTES:

        raise HTTPException(status_code=413, detail="Image must be between 1 byte and 8 MB.")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    suffix = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}[content_type]

    image_path = UPLOAD_DIR / f"user_{current_user.id}_{uuid4().hex}{suffix}"

    image_path.write_bytes(content)

    profile = _get_profile(db, current_user)

    detected, insights = [], {}
    onnx_lines = _onnx_palm_lines(content)

    try:

        ai = _palm_ai_analysis(_groq_client(), content, content_type, _profile_context(profile))

        hand_detected = bool(ai.get("hand_detected"))

        if not hand_detected:

            result_text = "The AI could not confidently identify an open palm in this image. Please upload a clear palm photograph."

            detection_status = "hand_not_detected"

        else:

            for feature in PALM_FEATURES:

                key = feature["key"]

                raw = ai.get("features", {}).get(key, {}) if isinstance(ai.get("features", {}), dict) else {}

                if not isinstance(raw, dict):

                    raw = {}

                detected.append({

                    **feature,

                    "status": raw.get("status", "not_clear"),

                    "confidence": raw.get("confidence", 0),

                    "normalized_points": _sanitize_palm_points(raw.get("normalized_points", []), ai.get("hand_bbox")),

                    "points": _sanitize_palm_points(raw.get("normalized_points", []), ai.get("hand_bbox")),

                    "observation": raw.get("observation", ""),

                    "traditional_meaning": raw.get("traditional_meaning", feature["description"]),

                    "reflection": raw.get("reflection", ""),

                    "color": PALM_COLORS[key],

                })

            # The local ONNX model supplies the visual masks for heart/head/life.
            # Groq remains responsible for the written observations and reflections.
            if isinstance(onnx_lines, dict) and not onnx_lines.get("error"):
                by_key = {item["key"]: item for item in detected}
                for key in ("heart", "head", "life"):
                    model_line = onnx_lines.get(key, {})
                    model_points = _sanitize_palm_points(model_line.get("normalized_points", []))
                    if key not in by_key:
                        continue
                    if len(model_points) >= 2:
                        by_key[key]["normalized_points"] = model_points
                        by_key[key]["points"] = model_points
                        by_key[key]["status"] = "visible"
                        by_key[key]["detection_source"] = "onnx_segmentation"
                        by_key[key]["model_pixel_count"] = int(model_line.get("pixel_count", 0))
                    else:
                        # No usable mask: retain Groq points only as a clearly labelled fallback.
                        by_key[key]["detection_source"] = "groq_fallback" if len(by_key[key].get("normalized_points", [])) >= 2 else "not_detected"
                for key in ("fate", "sun"):
                    if key in by_key:
                        by_key[key]["detection_source"] = "groq_vision"

            insights = {

                "ai_enabled": True,

                "provider": "Groq",

                "model": _model(),
                "line_segmentation": {
                    "enabled": bool(isinstance(onnx_lines, dict) and not onnx_lines.get("error")),
                    "model": "student_fp16.onnx",
                    "error": onnx_lines.get("error") if isinstance(onnx_lines, dict) else _ONNX_SESSION_ERROR,
                    "classes": ["heart", "head", "life"],
                    "pixel_counts": {key: int(onnx_lines.get(key, {}).get("pixel_count", 0)) for key in ("heart", "head", "life")} if isinstance(onnx_lines, dict) and not onnx_lines.get("error") else {},
                },

                "hand_detected": True,

                "hand_bbox": ai.get("hand_bbox", []),

                "image_quality": ai.get("image_quality", "unknown"),

                "overall_observation": ai.get("overall_observation", ""),

                "overall_reflection": ai.get("overall_reflection", ""),

                "personality_reflection": ai.get("personality_reflection", ""),

                "career_reflection": ai.get("career_reflection", ""),

                "relationship_reflection": ai.get("relationship_reflection", ""),

                "hand_bbox": ai.get("hand_bbox", []),

                "features": detected,

                "palm_structure": ai.get("palm_structure", {}),

                "finger_structure": ai.get("finger_structure", {}),

            }

            result_text = _palm_result_text(ai, detected)

            detection_status = "groq_ai_interpreted_onnx_lines" if isinstance(onnx_lines, dict) and not onnx_lines.get("error") else "groq_ai_interpreted"

    except HTTPException:

        raise

    except Exception as exc:

        error = _ai_error(exc)

        result_text = f"The palm image was saved, but the AI interpretation could not be completed.\n\n{error}"

        detection_status = "ai_error"

        insights = {"ai_enabled": True, "provider": "Groq", "error": error, "features": []}

    item = save_reading(db, current_user, "palm", "AI Palm Reading", image.filename or "Palm image uploaded", result_text, str(image_path), json.dumps(detected, ensure_ascii=False), json.dumps(insights, ensure_ascii=False), detection_status)

    return reading_dict(item)

@router.get("/api/readings/{reading_id}/palm-image")

def get_palm_image(reading_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    item = db.query(Reading).filter(Reading.id == reading_id, Reading.user_id == current_user.id, Reading.reading_type == "palm").first()

    if not item or not item.image_path:

        raise HTTPException(status_code=404, detail="Palm image not found.")

    upload_root = UPLOAD_DIR.resolve()
    saved_path = Path(item.image_path)
    candidates = []

    # First try the exact saved path (works when the container path has not changed).
    try:
        candidates.append(saved_path.resolve())
    except (OSError, RuntimeError):
        pass

    # Older records may contain an absolute path from a previous local/Docker location.
    # Safely retry the same filename inside the current user's palm upload directory.
    # pathlib.Path on Linux does not treat backslashes in old Windows paths as separators.
    # Normalize both slash styles before extracting the filename so legacy records work in Docker.
    filename = str(item.image_path).replace("\\", "/").rsplit("/", 1)[-1]
    if filename:
        candidates.append((upload_root / filename).resolve())

    path = None
    for candidate in candidates:
        try:
            if candidate.is_file() and upload_root in candidate.parents:
                path = candidate
                break
        except OSError:
            continue

    if path is None:
        LOGGER.warning("Palm image file unavailable for reading_id=%s user_id=%s saved_path=%s", reading_id, current_user.id, item.image_path)
        raise HTTPException(status_code=404, detail="Palm image file is unavailable. The original image may not exist in the current uploads volume.")

    media_type = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}.get(path.suffix.lower(), "application/octet-stream")
    return FileResponse(path, media_type=media_type, filename=f"palm-reading-{reading_id}{path.suffix}")

def _tarot_ai(client: Groq, cards: list[str], orientations: list[str], question: str, spread: str, profile: dict) -> str:

    details = [{"position": i + 1, "card": card, "orientation": orientations[i] if i < len(orientations) else "upright"} for i, card in enumerate(cards)]

    prompt = f"""

You are the AI Tarot Intelligence Engine. Tarot is a cultural reflection practice, not a scientifically validated prediction system.

Question: {question}

Spread: {spread}

Cards: {json.dumps(details, ensure_ascii=False)}

Profile: {json.dumps(profile, ensure_ascii=False)}

Give a warm personalized reading with: Overall reading; Card-by-card interpretation; Relationship and emotional themes; Career and work themes; Personal growth; Opportunities; Things to be mindful of; Practical next steps; Closing reflection.

For every card explain its traditional symbolism, position and orientation. Do not guarantee future events, exact dates, wealth, marriage, health outcomes or supernatural certainty.

"""

    response = client.chat.completions.create(model=_model(), messages=[{"role": "user", "content": prompt}], temperature=0.75, max_completion_tokens=2200, reasoning_effort="none")

    return (response.choices[0].message.content or "").strip()

@router.post("/api/readings/tarot")

def create_tarot_reading(payload: TarotRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    cards = [c.strip() for c in payload.cards if c and c.strip()]

    unknown = [c for c in cards if c not in TAROT_CARDS]

    if unknown:

        raise HTTPException(status_code=422, detail=f"Unknown card(s): {', '.join(unknown)}")

    orientations = [(payload.orientations[i] if i < len(payload.orientations) else "upright").lower() for i in range(len(cards))]

    orientations = [o if o in {"upright", "reversed"} else "upright" for o in orientations]

    try:

        result = _tarot_ai(_groq_client(), cards, orientations, payload.question, payload.spread, _profile_context(_get_profile(db, current_user)))

        detection_status = "groq_ai_interpreted"

    except Exception as exc:

        error = _ai_error(exc)

        result = f"Your tarot cards were selected successfully, but the AI interpretation could not be completed.\n\n{error}"

        detection_status = "ai_error"

    summary = json.dumps({"cards": [{"position": i + 1, "card": c, "orientation": orientations[i]} for i, c in enumerate(cards)], "question": payload.question, "spread": payload.spread}, ensure_ascii=False)

    item = save_reading(db, current_user, "tarot", "AI Tarot Reading", summary, result, detection_status=detection_status)

    return reading_dict(item)

@router.get("/api/readings/me")

def my_readings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    items = db.query(Reading).filter(Reading.user_id == current_user.id).order_by(Reading.created_at.desc()).all()

    return {"items": [reading_dict(x) for x in items], "total": len(items)}

@router.delete("/api/readings/{reading_id}", status_code=status.HTTP_204_NO_CONTENT)

def delete_reading(

    reading_id: int,

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db),

):

    item = (

        db.query(Reading)

        .filter(Reading.id == reading_id, Reading.user_id == current_user.id)

        .first()

    )

    if not item:

        raise HTTPException(status_code=404, detail="Reading not found.")

    image_path = getattr(item, "image_path", None)

    db.delete(item)

    db.commit()

    # Delete only the image belonging to this user's reading.

    if image_path:

        try:

            path = Path(image_path).resolve()

            upload_root = UPLOAD_DIR.resolve()

            if path.is_file() and upload_root in path.parents:

                path.unlink()

        except OSError:

            # The database record is already deleted; an unavailable image

            # file should not make the delete action fail.

            pass

    return None

@router.get("/api/readings/latest")

def latest_reading(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    item = db.query(Reading).filter(Reading.user_id == current_user.id).order_by(Reading.created_at.desc()).first()

    if not item:

        raise HTTPException(status_code=404, detail="No readings found.")

    return reading_dict(item)

@router.get("/api/insights/life-trends")

def life_trends(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    items = db.query(Reading).filter(Reading.user_id == current_user.id).order_by(Reading.created_at.desc()).limit(20).all()

    return {"total_readings": len(items), "palm_readings": sum(x.reading_type == "palm" for x in items), "tarot_readings": sum(x.reading_type == "tarot" for x in items), "message": "These are activity trends from saved sessions, not predictions.", "themes": ["Self-reflection", "Personal goals", "Consistency"] if items else []}

@router.get("/api/insights/summary")

def insights_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    profile = _get_profile(db, current_user)

    items = db.query(Reading).filter(Reading.user_id == current_user.id).order_by(Reading.created_at.desc()).limit(5).all()

    return {"profile_interests": getattr(profile, "interests", None) if profile else None, "spiritual_goals": getattr(profile, "spiritual_goals", None) if profile else None, "recent_readings": [reading_dict(x) for x in items], "message": "Your insights combine profile context with saved reading activity."}

@router.get("/api/insights/guidance")

def personalized_guidance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    profile = _get_profile(db, current_user)

    return {"based_on": {"goals": getattr(profile, "spiritual_goals", None) if profile else None, "interests": getattr(profile, "interests", None) if profile else None}, "guidance": ["Choose one goal that matters to you and write why it matters.", "Spend five minutes reflecting before making an important decision.", "Turn an insight into one small action you can review at the end of the week."], "note": "Guidance is reflective and supportive, not a prediction or professional advice."}

@router.get("/api/insights/recommendations")

def recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    count = db.query(Reading).filter(Reading.user_id == current_user.id).count()

    return {"items": ["Review your reading history and note any themes that repeat." if count else "Complete your profile so reflections can use your selected interests.", "Try a focused tarot reflection and record your own interpretation.", "Keep a weekly journal of goals, choices and outcomes."], "reading_count": count}
