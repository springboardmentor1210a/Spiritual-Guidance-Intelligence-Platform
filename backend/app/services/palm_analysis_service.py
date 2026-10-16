import json
import random
from pathlib import Path
from typing import Any


PALM_LINE_TEMPLATES = [
    {
        "name": "Life Line",
        "statuses": ["Clear", "Strong", "Visible", "Moderate"],
        "notes": [
            "Traditionally associated with vitality, grounding and resilience. The reading emphasizes steady energy rather than intensity.",
            "Traditionally interpreted around vitality, grounding and resilience, with emphasis on maintaining consistent momentum.",
            "The structured reading emphasizes stability, resilience and maintaining consistent momentum.",
        ],
    },
    {
        "name": "Head Line",
        "statuses": ["Distinct", "Clear", "Moderate", "Defined"],
        "notes": [
            "Traditionally linked with thought patterns, decision-making and the way ideas are processed.",
            "Traditionally associated with reasoning, mental focus and the way decisions are approached.",
            "The structured reading emphasizes thoughtful decision-making, concentration and practical reasoning.",
        ],
    },
    {
        "name": "Heart Line",
        "statuses": ["Visible", "Clear", "Strong", "Moderate"],
        "notes": [
            "Traditionally interpreted around emotional expression, connection and interpersonal balance.",
            "Traditionally associated with emotional expression, connection and interpersonal relationships.",
            "The reading emphasizes emotional awareness, communication and interpersonal balance.",
        ],
    },
    {
        "name": "Fate Line",
        "statuses": ["Moderate", "Visible", "Subtle", "Defined"],
        "notes": [
            "Traditionally associated with direction, work and the changing influence of life circumstances.",
            "Traditionally interpreted around career direction, responsibility and changing life circumstances.",
            "The reading highlights direction, personal responsibility and gradual changes in life circumstances.",
        ],
    },
    {
        "name": "Sun Line",
        "statuses": ["Subtle", "Visible", "Moderate", "Clear"],
        "notes": [
            "Traditionally connected with creativity, recognition and satisfaction derived from meaningful work.",
            "Traditionally associated with creativity, recognition and personal satisfaction.",
            "The reading emphasizes creativity, self-expression and fulfillment through meaningful activities.",
        ],
    },
]


def _random_score(minimum: int, maximum: int) -> int:
    return random.randint(minimum, maximum)


def _random_item(items: list[str]) -> str:
    return random.choice(items)


def generate_palm_analysis() -> dict[str, Any]:
    """
    Temporary structured palm-analysis implementation.

    IMPORTANT:
    This is not a computer-vision model.

    It exists so the complete upload -> persistence ->
    report -> PDF pipeline can be implemented independently
    from the future OpenCV/MediaPipe/YOLO analysis engine.
    """

    lines = []

    for template in PALM_LINE_TEMPLATES:
        lines.append(
            {
                "name": template["name"],
                "status": _random_item(template["statuses"]),
                "score": _random_score(58, 89),
                "note": _random_item(template["notes"]),
            }
        )

    return {
        "palmShape": {
            "value": _random_item(
                [
                    "Balanced / slightly rectangular",
                    "Balanced / moderately broad",
                    "Long and well-proportioned",
                    "Moderately rectangular",
                ]
            ),
            "score": _random_score(70, 90),
            "note": (
                "The structured demonstration profile suggests "
                "a palm shape traditionally associated with "
                "balance, practicality and adaptability."
            ),
        },
        "fingers": {
            "value": _random_item(
                [
                    "Moderate length, balanced spacing",
                    "Longer fingers, balanced spacing",
                    "Moderate length, close spacing",
                    "Balanced length, open spacing",
                ]
            ),
            "score": _random_score(68, 88),
            "note": (
                "The structured demonstration profile suggests "
                "a balanced approach between detail, intuition "
                "and practical decision-making."
            ),
        },
        "lines": lines,
    }


def build_palm_summary(
    analysis: dict[str, Any],
    image_filename: str,
) -> str:
    """
    Store the structured analysis as JSON inside the
    existing ReadingSession.summary column.
    """

    payload = {
        "analysis_type": "structured_demo",
        "image_filename": image_filename,
        "analysis": analysis,
    }

    return json.dumps(payload)


def resolve_palm_image_path(
    image_path: str,
) -> Path:
    """
    Resolve the stored palm image path.

    The report/PDF service uses this to locate the original
    uploaded image.
    """

    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Palm image not found: {image_path}"
        )

    return path