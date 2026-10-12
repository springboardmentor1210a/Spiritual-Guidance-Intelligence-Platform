from ultralytics import YOLO

model = YOLO("yolo11n-pose.pt")

model.train(
    data="datasets/palm_lines/palm_lines/data.yaml",
    epochs=10,
    imgsz=640,
    batch=8,
    name="palm_lines"
)

print("Palm line model training completed.") 