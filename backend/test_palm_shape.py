from app.services.palm.landmark_detection import detect_hand_landmarks
from app.services.palm.palm_shape import analyze_palm_shape


image_path = "test_data/palm/sample.jpg"

landmarks = detect_hand_landmarks(image_path)

result = analyze_palm_shape(landmarks)

print("\nPalm Shape Analysis")
print("----------------------")

for key, value in result.items():
    print(f"{key}: {value}")