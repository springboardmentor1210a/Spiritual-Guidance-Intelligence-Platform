import math


def distance(p1, p2):
    return math.sqrt(
        (p1["x"] - p2["x"]) ** 2 +
        (p1["y"] - p2["y"]) ** 2
    )


def analyze_palm_shape(landmark_result):
    """
    Analyze palm shape using MediaPipe hand landmarks.

    The measurements are based on the detected hand image.
    This is an AI-assisted structural analysis and not a
    scientific prediction of personality or future events.
    """

    if not landmark_result["detected"]:
        return None

    landmarks = landmark_result["landmarks"]

    # ---------------------------------------------------------
    # Important palm landmarks
    # ---------------------------------------------------------

    wrist = landmarks[0]

    # Index finger MCP
    index_mcp = landmarks[5]

    # Middle finger MCP
    middle_mcp = landmarks[9]

    # Ring finger MCP
    ring_mcp = landmarks[13]

    # Little finger MCP
    little_mcp = landmarks[17]

    # ---------------------------------------------------------
    # Palm width
    # ---------------------------------------------------------

    palm_width = distance(
        index_mcp,
        little_mcp
    )

    # ---------------------------------------------------------
    # Palm length
    # ---------------------------------------------------------

    palm_length = distance(
        wrist,
        middle_mcp
    )

    if palm_width == 0:
        return None

    # ---------------------------------------------------------
    # Length / width ratio
    # ---------------------------------------------------------

    ratio = palm_length / palm_width

    # ---------------------------------------------------------
    # Palm shape classification
    # ---------------------------------------------------------

    if ratio > 1.20:
        shape = "Long Palm"

    elif ratio < 0.90:
        shape = "Wide Palm"

    else:
        shape = "Balanced Palm"

    # ---------------------------------------------------------
    # Additional structural measurements
    # ---------------------------------------------------------

    # Distance between index and middle MCP
    index_middle_width = distance(
        index_mcp,
        middle_mcp
    )

    # Distance between ring and little MCP
    ring_little_width = distance(
        ring_mcp,
        little_mcp
    )

    # Compare upper palm width distribution
    if index_middle_width > ring_little_width:
        upper_palm_distribution = "Index-side wider"

    elif ring_little_width > index_middle_width:
        upper_palm_distribution = "Little-finger side wider"

    else:
        upper_palm_distribution = "Balanced upper palm"

    # ---------------------------------------------------------
    # Palm proportions
    # ---------------------------------------------------------

    if ratio > 1.35:
        proportion = "Highly elongated"

    elif ratio > 1.20:
        proportion = "Moderately elongated"

    elif ratio < 0.80:
        proportion = "Very wide"

    elif ratio < 0.90:
        proportion = "Moderately wide"

    else:
        proportion = "Proportionally balanced"

    # ---------------------------------------------------------
    # Return image-dependent result
    # ---------------------------------------------------------

    return {
        "palm_shape": shape,

        "palm_length": round(palm_length, 3),

        "palm_width": round(palm_width, 3),

        "length_width_ratio": round(ratio, 3),

        "index_middle_width": round(
            index_middle_width, 3
        ),

        "ring_little_width": round(
            ring_little_width, 3
        ),

        "upper_palm_distribution": upper_palm_distribution,

        "palm_proportion": proportion
    }