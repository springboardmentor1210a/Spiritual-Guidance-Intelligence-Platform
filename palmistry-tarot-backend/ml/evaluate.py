"""Evaluate the trained model and save predicted mask visualizations."""

from __future__ import annotations

import argparse
import os
from pathlib import Path

os.environ.setdefault("YOLO_CONFIG_DIR", str(Path(__file__).parent / "ultralytics-config"))
from ultralytics import YOLO


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", type=Path, required=True)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--split", choices=("val", "test"), default="test")
    parser.add_argument("--images", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("predictions"))
    args = parser.parse_args()
    model = YOLO(str(args.weights.resolve()))
    metrics = model.val(data=str(args.data.resolve()), split=args.split, imgsz=640, batch=1, device="cpu", workers=0)
    print("precision:", metrics.seg.mp)
    print("recall:", metrics.seg.mr)
    print("mAP50:", metrics.seg.map50)
    print("mAP50-95:", metrics.seg.map)
    print("per-class mAP50:", metrics.seg.maps.tolist())
    model.predict(source=str(args.images.resolve()), imgsz=640, conf=0.35, device="cpu", save=True, project=str(args.output), name=args.split, exist_ok=True)


if __name__ == "__main__":
    main()
