from app.services.palm.landmark_detection import detect_hand_landmarks


image_path = "test_data/palm/sample.jpg"

result = detect_hand_landmarks(image_path)

print("Hand detected:", result["detected"])
print("Number of landmarks:", len(result["landmarks"]))

if result["landmarks"]:
    print("\nFirst landmark:")
    print(result["landmarks"][0])

    print("\nAll landmarks:")
    for i, landmark in enumerate(result["landmarks"]):
        print(i, landmark)
