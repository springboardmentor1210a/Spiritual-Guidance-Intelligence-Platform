
from ultralytics import YOLO

MODEL_PATH = r"C:\Users\megha\runs\pose\palm_lines-2\weights\best.pt"
IMAGE_PATH = "test_data/palm/sample.jpg"

model = YOLO(MODEL_PATH)

results = model.predict(
    source=IMAGE_PATH,
    conf=0.20,
    imgsz=640,
    save=True,
    verbose=False
)

print("Prediction completed.")
print("Result saved in the runs folder.")