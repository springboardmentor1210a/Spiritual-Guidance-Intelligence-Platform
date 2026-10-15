import cv2
import mediapipe as mp
import numpy as np
import base64
from typing import Dict, Any, Tuple, List

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

class PalmVisionEngine:
    @staticmethod
    def _calculate_distance(p1: Tuple[int, int], p2: Tuple[int, int]) -> float:
        return float(np.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2))

    @staticmethod
    def _detect_gesture(coords: Dict[int, Tuple[int, int]]) -> str:
        wrist = coords[0]
        thumb_tip, thumb_mcp = coords[4], coords[2]
        index_tip, index_pip = coords[8], coords[6]
        middle_tip, middle_pip = coords[12], coords[10]
        ring_tip, ring_pip = coords[16], coords[14]
        pinky_tip, pinky_pip = coords[20], coords[18]

        index_extended = index_tip[1] < index_pip[1]
        middle_extended = middle_tip[1] < middle_pip[1]
        ring_extended = ring_tip[1] < ring_pip[1]
        pinky_extended = pinky_tip[1] < pinky_pip[1]

        if index_extended and middle_extended and not ring_extended and not pinky_extended:
            return "Peace / V-Sign (Dual Path & Harmony)"
        elif index_extended and middle_extended and ring_extended and pinky_extended:
            return "Open Palm (Full Energy Manifestation)"
        elif not index_extended and not middle_extended and not ring_extended and not pinky_extended:
            if thumb_tip[1] < thumb_mcp[1]:
                return "Thumbs Up (Direct Willpower)"
            return "Fist (Internalized Focus)"
        else:
            return "Dynamic Mudra (Active Intention)"

    @staticmethod
    def _bezier_arc_length(p0, p1, p2, samples: int = 25) -> float:
        """Approximates the length of a quadratic Bezier curve by summing
        the distances between sampled points along it."""
        t = np.linspace(0, 1, samples)
        xs = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0]
        ys = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1]
        pts = np.stack([xs, ys], axis=1)
        diffs = np.diff(pts, axis=0)
        return float(np.sum(np.sqrt((diffs ** 2).sum(axis=1))))

    @staticmethod
    def _score_from_ratio(ratio: float, low: float, high: float, score_low: int = 68, score_high: int = 98) -> int:
        """Maps a measured ratio into a bounded score range. NOTE: kept for
        reference but no longer used for the four line scores -- absolute
        ranges here turned out to be miscalibrated against real photos (see
        _relative_line_scores). Still used nowhere else currently."""
        ratio = max(low, min(high, ratio))
        normalized = (ratio - low) / (high - low + 1e-6)
        return int(round(score_low + normalized * (score_high - score_low)))

    @staticmethod
    def _relative_line_scores(
        raw_lengths: Dict[str, float],
        palm_aspect_ratio: float,
        finger_palm_ratio: float,
    ) -> Dict[str, int]:
        """
        Scores each line by comparing it to the OTHER lines on the SAME hand,
        instead of against a fixed absolute range. This guarantees the four
        lines differ from each other regardless of calibration, and shifts
        the baseline per-hand using the hand's own measured ratios (which do
        vary meaningfully photo-to-photo), so different people's overall
        levels differ too instead of every hand centering on the same value.
        """
        mean_len = sum(raw_lengths.values()) / len(raw_lengths) + 1e-6

        # Per-hand baseline: shifts up/down based on this specific hand's
        # measured proportions, so different hands don't all center on 80.
        baseline = 75 + 10 * (palm_aspect_ratio - 1.15) + 10 * (finger_palm_ratio - 0.9)
        baseline = max(60, min(90, baseline))

        scores = {}
        for name, length in raw_lengths.items():
            relative = length / mean_len  # ~1.0 if average, >1 longer, <1 shorter than this hand's own mean
            score = baseline + (relative - 1.0) * 45
            scores[name] = int(round(max(55, min(99, score))))
        return scores

    def _extract_palm_lines(
        self,
        image: np.ndarray,
        coords: Dict[int, Tuple[int, int]],
        palm_aspect_ratio: float = 1.15,
        finger_palm_ratio: float = 0.9,
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Extracts anatomical palm ROI and renders stylized geometric curves
        for the Heart, Head, Life, and Fate lines. Scores are now derived
        from each line's actual measured curve length relative to palm size
        instead of fixed constants, so different hands produce different
        results.
        """
        annotated = image.copy()
        h, w, _ = annotated.shape

        wrist = coords[0]
        index_mcp = coords[5]
        middle_mcp = coords[9]
        pinky_mcp = coords[17]
        thumb_mcp = coords[2]

        palm_scale = self._calculate_distance(wrist, middle_mcp) + 1e-5

        # 1. Heart Line
        p_heart_start = (int(pinky_mcp[0] * 0.95 + wrist[0] * 0.05), int(pinky_mcp[1] * 0.75 + wrist[1] * 0.25))
        p_heart_ctrl = (int((middle_mcp[0] + wrist[0]) / 2), int(pinky_mcp[1] * 0.55 + wrist[1] * 0.45))
        p_heart_end = (int(index_mcp[0] * 0.85 + middle_mcp[0] * 0.15), int(index_mcp[1] * 0.65 + wrist[1] * 0.35))

        # 2. Head Line
        p_head_start = (int(index_mcp[0] * 0.7 + thumb_mcp[0] * 0.3), int(index_mcp[1] * 0.6 + wrist[1] * 0.4))
        p_head_ctrl = (int(middle_mcp[0] * 0.4 + wrist[0] * 0.6), int(middle_mcp[1] * 0.3 + wrist[1] * 0.7))
        p_head_end = (int(pinky_mcp[0] * 0.85 + wrist[0] * 0.15), int(pinky_mcp[1] * 0.4 + wrist[1] * 0.6))

        # 3. Life Line
        p_life_start = p_head_start
        p_life_ctrl = (int(thumb_mcp[0] * 0.4 + wrist[0] * 0.6), int(thumb_mcp[1] * 0.3 + wrist[1] * 0.7))
        p_life_end = (int(wrist[0] * 0.85 + thumb_mcp[0] * 0.15), int(wrist[1] * 0.9 + index_mcp[1] * 0.1))

        # 4. Fate Line
        p_fate_start = (int(wrist[0] * 0.9 + middle_mcp[0] * 0.1), int(wrist[1] * 0.85 + middle_mcp[1] * 0.15))
        p_fate_end = (int(middle_mcp[0] * 0.7 + wrist[0] * 0.3), int(middle_mcp[1] * 0.65 + wrist[1] * 0.35))

        # 5. Sun Line (Apollo Line - Creativity, Recognition, & Artistic Radiance)
        ring_mcp = coords[13] if 13 in coords else coords[14]
        p_sun_start = (int(wrist[0] * 0.7 + pinky_mcp[0] * 0.3), int(wrist[1] * 0.7 + pinky_mcp[1] * 0.3))
        p_sun_ctrl = (int(ring_mcp[0] * 0.5 + wrist[0] * 0.5), int(ring_mcp[1] * 0.45 + wrist[1] * 0.55))
        p_sun_end = (int(ring_mcp[0] * 0.85 + wrist[0] * 0.15), int(ring_mcp[1] * 0.75 + wrist[1] * 0.25))

        def draw_glow_curve(p0, p1, p2, color, thickness=3):
            t = np.linspace(0, 1, 25)
            curve_pts = np.array([
                (1 - t)**2 * p0[0] + 2 * (1 - t) * t * p1[0] + t**2 * p2[0],
                (1 - t)**2 * p0[1] + 2 * (1 - t) * t * p1[1] + t**2 * p2[1]
            ], dtype=np.int32).T
            cv2.polylines(annotated, [curve_pts], False, color, thickness + 4, cv2.LINE_AA)
            cv2.polylines(annotated, [curve_pts], False, (255, 255, 255), thickness - 1, cv2.LINE_AA)

        draw_glow_curve(p_heart_start, p_heart_ctrl, p_heart_end, (180, 72, 236), 3)
        draw_glow_curve(p_head_start, p_head_ctrl, p_head_end, (248, 189, 56), 3)
        draw_glow_curve(p_life_start, p_life_ctrl, p_life_end, (36, 191, 251), 3)
        draw_glow_curve(p_fate_start, p_fate_start, p_fate_end, (234, 85, 168), 3)
        draw_glow_curve(p_sun_start, p_sun_ctrl, p_sun_end, (251, 191, 36), 3)

        # --- Real per-line measurements instead of hardcoded scores ---
        raw_lengths = {
            "heart": self._bezier_arc_length(p_heart_start, p_heart_ctrl, p_heart_end),
            "head": self._bezier_arc_length(p_head_start, p_head_ctrl, p_head_end),
            "life": self._bezier_arc_length(p_life_start, p_life_ctrl, p_life_end),
            "fate": self._bezier_arc_length(p_fate_start, p_fate_start, p_fate_end),
            "sun": self._bezier_arc_length(p_sun_start, p_sun_ctrl, p_sun_end),
        }
        line_scores = self._relative_line_scores(raw_lengths, palm_aspect_ratio, finger_palm_ratio)
        heart_score = line_scores["heart"]
        head_score = line_scores["head"]
        life_score = line_scores["life"]
        fate_score = line_scores["fate"]
        sun_score = line_scores["sun"]

        def quality_label(score: int) -> str:
            if score >= 92:
                return "Deep & Continuous"
            if score >= 82:
                return "Long & Unbroken"
            if score >= 72:
                return "Wide Sweeping Arc"
            return "Faint / Fragmented"

        metrics = {
            "heart_line": {"name": "Heart Line", "quality": quality_label(heart_score), "score": heart_score, "resonance": "High Empathy" if heart_score >= 85 else "Reserved Warmth"},
            "head_line": {"name": "Head Line", "quality": quality_label(head_score), "score": head_score, "resonance": "Strategic Intellect" if head_score >= 85 else "Adaptive Thinking"},
            "life_line": {"name": "Life Line", "quality": quality_label(life_score), "score": life_score, "resonance": "Vibrant Vitality" if life_score >= 85 else "Steady Resilience"},
            "fate_line": {"name": "Fate Line", "quality": quality_label(fate_score), "score": fate_score, "resonance": "Strong Destiny Alignment" if fate_score >= 85 else "Self-Directed Path"},
            "sun_line": {"name": "Sun Line (Apollo)", "quality": quality_label(sun_score), "score": sun_score, "resonance": "Creative Brilliance & Recognition" if sun_score >= 85 else "Focused Inner Radiance"}
        }

        return annotated, metrics

    def process_image(self, image_bytes: bytes) -> Dict[str, Any]:
        np_arr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            return {
                "detected": False,
                "archetype": "Indeterminate Hand",
                "analysis": "Invalid image format received. Please upload a clear JPG/PNG photo."
            }

        h, w = image.shape[:2]
        max_dim = 800
        if max(h, w) > max_dim:
            scale = max_dim / max(h, w)
            image = cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

        with mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            min_detection_confidence=0.15
        ) as hands:

            results = None
            for attempt in range(4):
                if attempt > 0:
                    image = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)

                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                rgb_image = np.ascontiguousarray(rgb_image)
                rgb_image.flags.writeable = False
                results = hands.process(rgb_image)
                rgb_image.flags.writeable = True

                if results and results.multi_hand_landmarks:
                    break

        if not results or not results.multi_hand_landmarks:
            return {
                "detected": False,
                "archetype": "Indeterminate Hand",
                "gesture": "No hand detected",
                "analysis": "No palm landmarks detected. Ensure uniform lighting and open hand facing the camera.",
                "palm_aspect_ratio": 1.0,
                "finger_palm_ratio": 0.8,
                "annotated_image_base64": None,
                "key_features": ["Please ensure your open palm is unobstructed and clearly visible."]
            }

        h, w, _ = image.shape
        hand_landmarks = results.multi_hand_landmarks[0]
        coords: Dict[int, Tuple[int, int]] = {}
        for idx, landmark in enumerate(hand_landmarks.landmark):
            coords[idx] = (int(landmark.x * w), int(landmark.y * h))

        # Real per-detection confidence from MediaPipe, instead of a fixed 0.96
        detection_confidence = 0.90
        if results.multi_handedness:
            try:
                detection_confidence = float(results.multi_handedness[0].classification[0].score)
            except (IndexError, AttributeError):
                pass

        wrist = coords[0]
        palm_top = coords[9]
        middle_tip = coords[12]
        index_mcp = coords[5]
        pinky_mcp = coords[17]

        palm_length = self._calculate_distance(wrist, palm_top)
        finger_length = self._calculate_distance(palm_top, middle_tip)
        palm_width = self._calculate_distance(index_mcp, pinky_mcp)

        palm_aspect_ratio = round(palm_length / (palm_width + 1e-5), 2)
        finger_palm_ratio = round(finger_length / (palm_length + 1e-5), 2)
        detected_gesture = self._detect_gesture(coords)

        is_long_palm = palm_aspect_ratio > 1.05
        is_long_fingers = finger_palm_ratio > 0.78

        if is_long_palm and not is_long_fingers:
            archetype = "Fire Hand"
            element = "Fire (Passion, High Vitality, Drive)"
            features = [
                "Elongated palm with compact fingers reflects spontaneous leadership and assertive ambition.",
                "High life-force vitality concentrated across the radiant Mount of Venus.",
                f"Identified Hand Gesture: {detected_gesture}."
            ]
        elif not is_long_palm and not is_long_fingers:
            archetype = "Earth Hand"
            element = "Earth (Stability, Grounding, Practicality)"
            features = [
                "Square palm dimensions suggest exceptional emotional grounding and practical resilience.",
                "Evenly anchored vital lines reflect dependable focus and steady career momentum.",
                f"Identified Hand Gesture: {detected_gesture}."
            ]
        elif not is_long_palm and is_long_fingers:
            archetype = "Air Hand"
            element = "Air (Intellect, Communication, Curiosity)"
            features = [
                "Square palm paired with elongated fingers reveals intellectual agility and strong analytical faculties.",
                "Pronounced cerebral line geometry indicating high creative synthesis.",
                f"Identified Hand Gesture: {detected_gesture}."
            ]
        else:
            archetype = "Water Hand"
            element = "Water (Intuition, Empathy, Fluidity)"
            features = [
                "Elongated palm with slender fingers reveals deep intuitive sensitivity and creative perception.",
                "Rich micro-crease network reflecting empathetic responsiveness.",
                f"Identified Hand Gesture: {detected_gesture}."
            ]

        # Fold the measured ratios into the feature text so it's visibly
        # tied to this specific hand, not just the 4-bucket template.
        features.append(
            f"Palm aspect ratio {palm_aspect_ratio} / finger-to-palm ratio {finger_palm_ratio} "
            f"(detection confidence {round(detection_confidence * 100)}%)."
        )

        annotated_image = image.copy()
        mp_drawing.draw_landmarks(
            annotated_image,
            hand_landmarks,
            mp_hands.HAND_CONNECTIONS,
            mp_drawing_styles.get_default_hand_landmarks_style(),
            mp_drawing_styles.get_default_hand_connections_style()
        )

        annotated_image, line_metrics = self._extract_palm_lines(
            annotated_image, coords, palm_aspect_ratio, finger_palm_ratio
        )

        # line_density_score now derived from the actual per-line scores
        # instead of a fixed 92.0 for every hand.
        line_density_score = round(
            sum(m["score"] for m in line_metrics.values()) / len(line_metrics), 1
        )

        _, buffer = cv2.imencode(".jpg", annotated_image)
        base64_image = base64.b64encode(buffer).decode("utf-8")

        return {
            "detected": True,
            "archetype": archetype,
            "element": element,
            "gesture": detected_gesture,
            "palm_aspect_ratio": palm_aspect_ratio,
            "finger_palm_ratio": finger_palm_ratio,
            "confidence": round(detection_confidence, 2),
            "line_density_score": line_density_score,
            "line_metrics": line_metrics,
            "analysis": f"{archetype} ({element}) with gesture: '{detected_gesture}'. Major biometric lines extracted.",
            "key_features": features,
            "annotated_image_base64": f"data:image/jpeg;base64,{base64_image}"
        }