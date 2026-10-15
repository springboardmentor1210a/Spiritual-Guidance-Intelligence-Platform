# Palmistry & Tarot Intelligence Platform

A full-stack chiromancy, tarot archetype, and personal reflection platform featuring real-time camera-based hand tracking and AI-driven spiritual guidance.

---

## 🚀 Running Directly from VS Code (`http://localhost:3000`)

You can launch and debug this platform directly inside **Visual Studio Code**:

### Method 1: One-Click Run (F5 or Run & Debug)
1. Open this repository folder in **VS Code**.
2. Make sure dependencies are installed:
   ```bash
   npm install
   ```
3. Press **`F5`** (or go to the **Run & Debug** menu on the left sidebar `Ctrl+Shift+D` / `Cmd+Shift+D`).
4. Select **`Run Palmistry & Tarot Platform (http://localhost:3000)`** and click the green play button.
5. VS Code will execute `npm run dev` in the integrated terminal and launch the server on:
   **`http://localhost:3000`**

### Method 2: Integrated Terminal
1. Open the VS Code terminal (``Ctrl+` `` or ``Cmd+` ``).
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Click on the URL link in terminal output:
   `➜ Local: http://localhost:3000`

---

## 📸 Camera Palm Reading Access Method

The application includes a camera scanning method for palmistry readings:
1. Navigate to the **Palmistry** tab in the top navigation or sidebar.
2. Click **"Use Camera"** or **"Live Camera Scanner"**.
3. Allow camera access when prompted by your browser:
   - Modern browsers treat `http://localhost:3000` and secure iframe environments as secure origins.
4. Position your open hand inside the camera alignment silhouette:
   - **YOLOv8 Palm Bounding Box**: Confirms hand region detection.
   - **MediaPipe 21-Point Topology**: Guides finger joint and crease alignment.
   - **Flip Camera**: Toggle between front/selfie and rear/environment cameras.
5. Click **"Capture & Analyze Now"** (or use the **"⏱ 3s Timer"**).
6. The system captures the image and passes it to the chiromancy analysis engine to extract the Life Line, Head Line, Heart Line, Fate Line, and planetary mounts.

---

## 🧠 Platform Intelligence Stack

### Computer Vision & Biometrics
- **MediaPipe**: 21-Point hand landmark topology and 3D joint regression
- **YOLO**: Hand detection, bounding box localization, and posture verification
- **OpenCV**: Contour detection, ridge frequency enhancement, and line vectorization
- **TensorFlow & PyTorch**: Deep neural feature extraction and crease classification

### Image Processing
- **OpenCV**: Canny edge detection, bilateral filtering, and morphological transformations
- **Pillow (PIL)**: Preprocessing, normalization, and dimensional scaling
- **Albumentations**: Contrast equalization and skin tone invariant transformations

### NLP & Interpretation
- **LangChain**: Multi-stage prompt synthesis and metaphysical reasoning pipelines
- **Hugging Face Transformers**: Semantic classification and archetype embeddings
- **Sentence Transformers**: Vector similarity for Tarot card pairings and astrological cross-referencing
- **OpenAI & Gemini Vision APIs**: Deep contextual chiromancy synthesis and Hermetic interpretations
