from pathlib import Path
from ultralytics import YOLO

MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "tarot_best.pt"
)

if not MODEL_PATH.is_file():
    raise FileNotFoundError(
        f"Tarot model file not found: {MODEL_PATH}"
    )

model = YOLO(str(MODEL_PATH))


def convert_card_name(model_name: str) -> str:
    """
    Convert the Tarot model class name into
    the human-readable database card name.
    """

    # Special dataset class
    if model_name == "card_back":
        return "card_back"

    # Major Arcana
    major_arcana = {
        "the_fool": "The Fool",
        "the_magician": "The Magician",
        "the_high_priestess": "The High Priestess",
        "the_empress": "The Empress",
        "the_emperor": "The Emperor",
        "the_hierophant": "The Hierophant",
        "the_lovers": "The Lovers",
        "the_chariot": "The Chariot",
        "strength": "Strength",
        "the_hermit": "The Hermit",
        "wheel_of_fortune": "Wheel of Fortune",
        "justice": "Justice",
        "the_hanged_man": "The Hanged Man",
        "death": "Death",
        "temperance": "Temperance",
        "the_devil": "The Devil",
        "the_tower": "The Tower",
        "the_star": "The Star",
        "the_moon": "The Moon",
        "the_sun": "The Sun",
        "judgement": "Judgement",
        "the_world": "The World"
    }

    if model_name in major_arcana:
        return major_arcana[model_name]

    # Minor Arcana
    words = model_name.split("_")

    if len(words) >= 3:
        return (
            words[0].capitalize()
            + " of "
            + " ".join(word.lower().capitalize() for word in words[2:])
        )

    return model_name.replace("_", " ").title()


def predict_tarot_card(image_path: str):

    if not Path (image_path).is_file( ):
        raise FileNotFoundError("Tarot image not found")

    results = model.predict(
        source=image_path,
        imgsz=224,
        verbose=False
    )

    result = results[0]

    if result.probs is None:
        return {
            "card": "Unknown",
            "confidence": 0.0
        }

    class_id = int(result.probs.top1)

    confidence = float(result.probs.top1conf)

    model_card_name = result.names[class_id]

    database_card_name = convert_card_name(model_card_name)

    return {
        "card": database_card_name,
        "model_card": model_card_name,
        "confidence": round(confidence * 100, 2)
    }