"""
Palm Interpretation Engine

Takes extracted palm-line features and produces
structured palmistry interpretations.

The CV model is responsible for detection.
This module is responsible only for interpretation.
"""


def interpret_life_line(features):
    length = features["length"]
    curvature = features["curvature_ratio"]
    confidence = features["confidence"]

    interpretation = []

    if length >= 200:
        interpretation.append(
            "The life line is relatively long in the detected palm region."
        )
    else:
        interpretation.append(
            "The life line is relatively short in the detected palm region."
        )

    if curvature >= 1.05:
        interpretation.append(
            "The life line shows noticeable curvature."
        )
    else:
        interpretation.append(
            "The life line appears relatively straight."
        )

    return {
        "confidence": confidence,
        "features": {
            "length": round(length, 2),
            "curvature_ratio": round(curvature, 3),
        },
        "interpretation": interpretation,
    }


def interpret_heart_line(features):
    length = features["length"]
    curvature = features["curvature_ratio"]
    confidence = features["confidence"]

    interpretation = []

    if length >= 140:
        interpretation.append(
            "The detected heart line extends across a substantial portion "
            "of the measured palm region."
        )
    else:
        interpretation.append(
            "The detected heart line has a comparatively shorter extent."
        )

    if curvature >= 1.05:
        interpretation.append(
            "The heart line shows noticeable curvature."
        )
    else:
        interpretation.append(
            "The heart line appears relatively straight."
        )

    return {
        "confidence": confidence,
        "features": {
            "length": round(length, 2),
            "curvature_ratio": round(curvature, 3),
        },
        "interpretation": interpretation,
    }


def interpret_head_line(features):
    length = features["length"]
    curvature = features["curvature_ratio"]
    confidence = features["confidence"]

    interpretation = []

    if length >= 140:
        interpretation.append(
            "The detected head line has a relatively extended path."
        )
    else:
        interpretation.append(
            "The detected head line has a comparatively shorter path."
        )

    if curvature >= 1.05:
        interpretation.append(
            "The head line shows noticeable curvature."
        )
    else:
        interpretation.append(
            "The head line appears relatively straight."
        )

    return {
        "confidence": confidence,
        "features": {
            "length": round(length, 2),
            "curvature_ratio": round(curvature, 3),
        },
        "interpretation": interpretation,
    }


def interpret_fate_line(features):
    length = features["length"]
    curvature = features["curvature_ratio"]
    confidence = features["confidence"]

    interpretation = []

    # Your current model produced only ~0.285 confidence
    # for the fate line, so don't make a strong interpretation.
    if confidence < 0.50:
        interpretation.append(
            "The fate line detection has low confidence, so this "
            "feature should be treated cautiously."
        )
    else:
        if length >= 125:
            interpretation.append(
                "The detected fate line has a relatively extended path."
            )
        else:
            interpretation.append(
                "The detected fate line has a comparatively shorter path."
            )

        if curvature >= 1.05:
            interpretation.append(
                "The fate line shows noticeable curvature."
            )
        else:
            interpretation.append(
                "The fate line appears relatively straight."
            )

    return {
        "confidence": confidence,
        "features": {
            "length": round(length, 2),
            "curvature_ratio": round(curvature, 3),
        },
        "interpretation": interpretation,
    }


def generate_palm_interpretation(palm_features):
    """
    Generate a structured interpretation from extracted palm features.
    """

    result = {}

    if "life" in palm_features:
        result["life_line"] = interpret_life_line(
            palm_features["life"]
        )

    if "heart" in palm_features:
        result["heart_line"] = interpret_heart_line(
            palm_features["heart"]
        )

    if "head" in palm_features:
        result["head_line"] = interpret_head_line(
            palm_features["head"]
        )

    if "fate" in palm_features:
        result["fate_line"] = interpret_fate_line(
            palm_features["fate"]
        )

    return result