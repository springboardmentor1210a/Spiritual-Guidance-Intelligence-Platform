import math
from typing import Any


PALM_LINE_CLASSES = {
    0: "fate",
    1: "head",
    2: "heart",
    3: "life",
}


def distance(p1: tuple[float, float], p2: tuple[float, float]) -> float:
    """Euclidean distance between two normalized points."""
    return math.sqrt(
        (p2[0] - p1[0]) ** 2 +
        (p2[1] - p1[1]) ** 2
    )


def calculate_line_length(
    points: list[tuple[float, float]]
) -> float:
    """Calculate total length through consecutive keypoints."""
    if len(points) < 2:
        return 0.0

    return sum(
        distance(points[i], points[i + 1])
        for i in range(len(points) - 1)
    )


def calculate_direct_distance(
    points: list[tuple[float, float]]
) -> float:
    """Distance between first and last keypoint."""
    if len(points) < 2:
        return 0.0

    return distance(points[0], points[-1])


def calculate_curvature(
    points: list[tuple[float, float]]
) -> float:
    """
    Approximate curvature using:
        path length / straight-line distance

    A value closer to 1 means the path is relatively straight.
    Higher values indicate more bending.
    """
    if len(points) < 2:
        return 0.0

    path_length = calculate_line_length(points)
    direct_distance = calculate_direct_distance(points)

    if direct_distance == 0:
        return 0.0

    return path_length / direct_distance


def calculate_orientation(
    points: list[tuple[float, float]]
) -> float:
    """
    Calculate overall orientation from first to last keypoint.

    Returns angle in degrees.
    """
    if len(points) < 2:
        return 0.0

    dx = points[-1][0] - points[0][0]
    dy = points[-1][1] - points[0][1]

    angle = math.degrees(math.atan2(dy, dx))

    return angle


def extract_line_features(
    class_id: int,
    confidence: float,
    keypoints: list[tuple[float, float]]
) -> dict[str, Any]:

    class_name = PALM_LINE_CLASSES.get(
        class_id,
        f"class_{class_id}"
    )

    return {
        "line": class_name,
        "class_id": class_id,
        "confidence": round(confidence, 4),
        "keypoint_count": len(keypoints),
        "length": round(
            calculate_line_length(keypoints),
            4
        ),
        "direct_distance": round(
            calculate_direct_distance(keypoints),
            4
        ),
        "curvature": round(
            calculate_curvature(keypoints),
            4
        ),
        "orientation": round(
            calculate_orientation(keypoints),
            2
        ),
        "start_point": {
            "x": round(keypoints[0][0], 4),
            "y": round(keypoints[0][1], 4),
        } if keypoints else None,
        "end_point": {
            "x": round(keypoints[-1][0], 4),
            "y": round(keypoints[-1][1], 4),
        } if keypoints else None,
    }


def build_palm_features(
    detections: list[dict[str, Any]]
) -> dict[str, Any]:

    palm_features = {
        "lines": {},
        "detected_line_count": 0,
    }

    for detection in detections:

        class_id = detection["class_id"]
        confidence = detection["confidence"]
        keypoints = detection["keypoints"]

        features = extract_line_features(
            class_id,
            confidence,
            keypoints
        )

        line_name = features["line"]

        # Keep the strongest detection if a line
        # is detected more than once.
        if (
            line_name not in palm_features["lines"]
            or confidence >
            palm_features["lines"][line_name]["confidence"]
        ):
            palm_features["lines"][line_name] = features

    palm_features["detected_line_count"] = len(
        palm_features["lines"]
    )

    return palm_features