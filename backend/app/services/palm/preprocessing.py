import cv2
import numpy as np


def preprocess_palm_image(image_bytes: bytes) -> dict:
    """
    Preprocess an uploaded palm image.

    Steps:
    1. Decode the uploaded image
    2. Resize it
    3. Convert to grayscale
    4. Reduce noise
    5. Improve contrast
    """

    # Convert uploaded bytes into a NumPy array
    image_array = np.frombuffer(image_bytes, np.uint8)

    # Decode the image
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Invalid or unsupported image")

    # Resize image while maintaining a standard processing size
    max_dimension = 1200

    height, width = image.shape[:2]

    if max(height, width) > max_dimension:
        scale = max_dimension / max(height, width)

        new_width = int(width * scale)
        new_height = int(height * scale)

        image = cv2.resize(
            image,
            (new_width, new_height),
            interpolation=cv2.INTER_AREA
        )

    # Convert to grayscale
    grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Reduce noise
    denoised = cv2.GaussianBlur(
        grayscale,
        (5, 5),
        0
    )

    # Improve contrast using CLAHE
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    enhanced = clahe.apply(denoised)

    return {
        "image": image,
        "grayscale": grayscale,
        "enhanced": enhanced,
        "width": image.shape[1],
        "height": image.shape[0]
    }