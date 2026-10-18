"""Create deterministic YOLO segmentation splits without altering raw data."""

from __future__ import annotations

import argparse
import random
import shutil
from pathlib import Path


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}
SPLIT_COUNTS = {"train": 32, "valid": 7, "test": 7}


def source_pairs(dataset_root: Path) -> list[tuple[Path, Path]]:
    images_dir = dataset_root / "train" / "images"
    labels_dir = dataset_root / "train" / "labels"
    images = sorted(path for path in images_dir.iterdir() if path.suffix.lower() in IMAGE_EXTENSIONS)
    pairs: list[tuple[Path, Path]] = []
    missing: list[str] = []
    for image in images:
        label = labels_dir / f"{image.stem}.txt"
        if label.exists():
            pairs.append((image, label))
        else:
            missing.append(image.name)
    extra_labels = sorted(label.name for label in labels_dir.glob("*.txt") if not any(label.stem == image.stem for image in images))
    if missing or extra_labels:
        raise RuntimeError(f"Unpaired files. Missing labels: {missing}; labels without images: {extra_labels}")
    return pairs


def prepare(dataset_root: Path, seed: int) -> None:
    pairs = source_pairs(dataset_root)
    if len(pairs) != sum(SPLIT_COUNTS.values()):
        raise RuntimeError(f"Expected {sum(SPLIT_COUNTS.values())} raw pairs, found {len(pairs)}")

    ordered = pairs[:]
    random.Random(seed).shuffle(ordered)
    destination_root = dataset_root / "splits"
    if destination_root.exists():
        shutil.rmtree(destination_root)

    start = 0
    for split, count in SPLIT_COUNTS.items():
        split_pairs = ordered[start : start + count]
        start += count
        image_destination = destination_root / split / "images"
        label_destination = destination_root / split / "labels"
        image_destination.mkdir(parents=True)
        label_destination.mkdir(parents=True)
        for image, label in split_pairs:
            shutil.copy2(image, image_destination / image.name)
            shutil.copy2(label, label_destination / label.name)
        print(f"{split}: {len(split_pairs)} image/label pairs")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--seed", type=int, default=2026)
    args = parser.parse_args()
    prepare(args.dataset.resolve(), args.seed)
