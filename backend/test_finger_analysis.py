
from app.services.palm.landmark_detection import detect_hand_landmarks
from app.services.palm.finger_analysis import analyze_fingers

image_path = "test_data/palm/sample.jpg"

landmarks = detect_hand_landmarks(image_path)

result = analyze_fingers(landmarks)

print("\nFinger Analysis")
print("----------------------")

for key, value in result.items():
    print(f"{key}: {value}")