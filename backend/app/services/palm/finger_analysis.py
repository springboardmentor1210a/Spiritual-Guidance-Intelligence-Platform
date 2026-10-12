import math


# Landmark IDs
WRIST = 0

THUMB_TIP = 4
INDEX_TIP = 8
MIDDLE_TIP = 12
RING_TIP = 16
LITTLE_TIP = 20

# Palm reference points
MIDDLE_MCP = 9


def distance(p1, p2):
    return math.sqrt(
        (p1["x"] - p2["x"]) ** 2 +
        (p1["y"] - p2["y"]) ** 2
    )


def analyze_fingers(landmark_result):
    """
    Analyze finger structure using MediaPipe hand landmarks.

    Finger measurements are normalized relative to palm length,
    making the result less dependent on image resolution.
    """

    if not landmark_result["detected"]:
        return None

    landmarks = landmark_result["landmarks"]

    wrist = landmarks[WRIST]

    # ---------------------------------------------------------
    # Palm reference length
    # ---------------------------------------------------------

    palm_length = distance(
        wrist,
        landmarks[MIDDLE_MCP]
    )

    if palm_length == 0:
        return None

    # ---------------------------------------------------------
    # Finger lengths
    # ---------------------------------------------------------

    thumb = distance(
        wrist,
        landmarks[THUMB_TIP]
    )

    index = distance(
        wrist,
        landmarks[INDEX_TIP]
    )

    middle = distance(
        wrist,
        landmarks[MIDDLE_TIP]
    )

    ring = distance(
        wrist,
        landmarks[RING_TIP]
    )

    little = distance(
        wrist,
        landmarks[LITTLE_TIP]
    )

    # ---------------------------------------------------------
    # Normalize finger lengths by palm length
    # ---------------------------------------------------------

    thumb_ratio = thumb / palm_length
    index_ratio = index / palm_length
    middle_ratio = middle / palm_length
    ring_ratio = ring / palm_length
    little_ratio = little / palm_length

    average_ratio = (
        thumb_ratio +
        index_ratio +
        middle_ratio +
        ring_ratio +
        little_ratio
    ) / 5

    # ---------------------------------------------------------
    # Finger structure classification
    # ---------------------------------------------------------

    if average_ratio > 2.7:
        structure = "Long Fingers"
    elif average_ratio > 2.2:
        structure = "Medium Fingers"
    else:
        structure = "Short Fingers"

    # ---------------------------------------------------------
    # Relative finger comparisons
    # ---------------------------------------------------------

    if middle >= index and middle >= ring:
        dominant_finger = "Middle Finger"
    elif index >= ring:
        dominant_finger = "Index Finger"
    else:
        dominant_finger = "Ring Finger"

    # Index vs ring comparison
    if index > ring:
        index_ring_relation = "Index finger longer than ring finger"
    elif ring > index:
        index_ring_relation = "Ring finger longer than index finger"
    else:
        index_ring_relation = "Index and ring fingers are similar in length"

    return {
        "finger_structure": structure,

        # Original measurements
        "thumb_length": round(thumb, 3),
        "index_length": round(index, 3),
        "middle_length": round(middle, 3),
        "ring_length": round(ring, 3),
        "little_length": round(little, 3),

        # Normalized measurements
        "thumb_ratio": round(thumb_ratio, 3),
        "index_ratio": round(index_ratio, 3),
        "middle_ratio": round(middle_ratio, 3),
        "ring_ratio": round(ring_ratio, 3),
        "little_ratio": round(little_ratio, 3),

        # Overall measurements
        "average_finger_ratio": round(average_ratio, 3),
        "palm_reference_length": round(palm_length, 3),

        # Additional image-dependent features
        "dominant_finger": dominant_finger,
        "index_ring_relation": index_ring_relation
    }