import cv2
import numpy as np


def extract_palm_features(preprocessed_data: dict) -> dict:
    """
    Extract basic measurable features from a preprocessed palm image.

    This is the first stage of the palm feature extraction pipeline.
    It prepares measurable image features that can later be used by
    the palm analysis engine.
    """

    enhanced = preprocessed_data.get("enhanced")

    if enhanced is None:
        raise ValueError("Enhanced palm image is missing")

    # Edge detection
    edges = cv2.Canny(
        enhanced,
        threshold1=50,
        threshold2=150
    )

    # Binary threshold
    _, binary = cv2.threshold(
        enhanced,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    # Find contours
    contours, _ = cv2.findContours(
        binary,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    largest_contour_area = 0.0

    if contours:
        largest_contour = max(
            contours,
            key=cv2.contourArea
        )

        largest_contour_area = float(
            cv2.contourArea(largest_contour)
        )

    height, width = enhanced.shape

    image_area = float(width * height)

    contour_ratio = 0.0

    if image_area > 0:
        contour_ratio = largest_contour_area / image_area

    edge_pixels = int(
        np.count_nonzero(edges)
    )

    return {
        "image_width": width,
        "image_height": height,
        "largest_contour_area": round(
            largest_contour_area,
            2
        ),
        "contour_area_ratio": round(
            contour_ratio,
            4
        ),
        "edge_pixel_count": edge_pixels
    }