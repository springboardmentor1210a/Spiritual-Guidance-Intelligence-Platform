"""Read-only validator for YOLO segmentation images and labels."""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

from PIL import Image


CLASS_NAMES = ["family ring", "fate line", "girdle of venus", "head line", "heart line", "life line"]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}


def validate_label(label: Path, counts: Counter[int]) -> list[str]:
    errors: list[str] = []
    text = label.read_text(encoding="utf-8").strip()
    if not text:
        return [f"{label}: empty label"]
    for number, line in enumerate(text.splitlines(), start=1):
        fields = line.split()
        try:
            class_id = int(fields[0])
            values = [float(value) for value in fields[1:]]
        except (ValueError, IndexError):
            errors.append(f"{label}:{number}: non-numeric label")
            continue
        if not 0 <= class_id < len(CLASS_NAMES) or len(values) < 6 or len(values) % 2:
            errors.append(f"{label}:{number}: invalid polygon shape")
        elif any(value < 0 or value > 1 for value in values):
            errors.append(f"{label}:{number}: coordinate outside [0, 1]")
        else:
            counts[class_id] += 1
    return errors


def verify(dataset_root: Path) -> int:
    total_counts: Counter[int] = Counter()
    errors: list[str] = []
    for split in ("train", "valid", "test"):
        image_dir = dataset_root / "splits" / split / "images"
        label_dir = dataset_root / "splits" / split / "labels"
        images = {path.stem: path for path in image_dir.iterdir() if path.suffix.lower() in IMAGE_EXTENSIONS}
        labels = {path.stem: path for path in label_dir.glob("*.txt")}
        errors.extend(f"{split}: no label for {name}" for name in images.keys() - labels.keys())
        errors.extend(f"{split}: no image for {name}" for name in labels.keys() - images.keys())
        for image in images.values():
            try:
                with Image.open(image) as opened:
                    opened.verify()
            except Exception as exc:  # Pillow reports decoder errors here.
                errors.append(f"{image}: unreadable image ({exc})")
        for label in labels.values():
            errors.extend(validate_label(label, total_counts))
        print(f"{split}: {len(images)} images, {len(labels)} labels")

    print("annotations:", {CLASS_NAMES[index]: total_counts[index] for index in range(len(CLASS_NAMES))})
    if errors:
        print("validation errors:")
        print("\n".join(errors))
        return 1
    print("Dataset validation passed.")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=Path, required=True)
    args = parser.parse_args()
    raise SystemExit(verify(args.dataset.resolve()))
