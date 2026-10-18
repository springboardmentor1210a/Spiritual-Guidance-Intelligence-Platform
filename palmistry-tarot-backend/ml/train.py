"""CPU-safe proof-of-concept training entrypoint for palm-line segmentation."""

from __future__ import annotations

import argparse
import os
from pathlib import Path

# Keep Ultralytics state inside the project instead of the user's protected AppData.
os.environ.setdefault("YOLO_CONFIG_DIR", str(Path(__file__).parent / "ultralytics-config"))
from ultralytics import YOLO


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--epochs", type=int, default=35)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=1)
    parser.add_argument("--project", type=Path, default=Path("runs/palm-line-seg"))
    args = parser.parse_args()

    # Nano segmentation weights are intentionally used for an 8 GB RAM CPU laptop.
    model = YOLO("yolov8n-seg.pt")
    model.train(
        data=str(args.data.resolve()),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device="cpu",
        workers=0,
        optimizer="AdamW",
        lr0=0.001,
        patience=12,
        degrees=5,
        translate=0.03,
        scale=0.10,
        fliplr=0.0,
        mosaic=0.0,
        hsv_h=0.01,
        hsv_s=0.15,
        hsv_v=0.15,
        project=str(args.project.resolve()),
        name="poc",
        exist_ok=True,
        plots=True,
    )


if __name__ == "__main__":
    main()
