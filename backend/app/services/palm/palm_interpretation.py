def interpret_palm(
    palm_lines: dict,
    palm_shape: dict,
    finger_analysis: dict
) -> dict:
    """
    Generate image-dependent traditional palmistry interpretations.

    The interpretations are based on measurable features detected
    from the uploaded palm image. They represent traditional
    palmistry interpretations for reflection and entertainment,
    not scientific predictions.
    """

    interpretations = {}

    # ==========================================================
    # PALM SHAPE
    # ==========================================================

    if palm_shape:

        shape = palm_shape.get("palm_shape")
        ratio = palm_shape.get("length_width_ratio", 0)
        proportion = palm_shape.get("palm_proportion", "")
        distribution = palm_shape.get(
            "upper_palm_distribution",
            ""
        )

        if shape == "Long Palm":

            interpretation = (
                f"The detected palm has a relatively elongated "
                f"proportion (length/width ratio {ratio}). "
                "In traditional palmistry, a longer palm is "
                "associated with imagination, sensitivity, "
                "curiosity, and interest in exploring ideas."
            )

        elif shape == "Wide Palm":

            interpretation = (
                f"The detected palm has a relatively wide "
                f"proportion (length/width ratio {ratio}). "
                "In traditional palmistry, a wider palm is "
                "associated with practicality, grounded thinking, "
                "confidence, and an action-oriented approach."
            )

        else:

            interpretation = (
                f"The detected palm has a relatively balanced "
                f"proportion (length/width ratio {ratio}). "
                "In traditional palmistry, balanced proportions "
                "are associated with adaptability and a mixture "
                "of practical and imaginative qualities."
            )

        # Add additional image-specific observation
        if distribution == "Index-side wider":

            interpretation += (
                " The upper palm measurement is slightly wider "
                "toward the index-finger side."
            )

        elif distribution == "Little-finger side wider":

            interpretation += (
                " The upper palm measurement is slightly wider "
                "toward the little-finger side."
            )

        else:

            interpretation += (
                " The upper palm measurements appear relatively "
                "balanced."
            )

        interpretations["palm_shape"] = {
            "title": "Palm Shape",
            "type": shape,
            "interpretation": interpretation,
            "measurements": {
                "length_width_ratio": ratio,
                "palm_proportion": proportion,
                "upper_palm_distribution": distribution
            }
        }

    # ==========================================================
    # FINGER STRUCTURE
    # ==========================================================

    if finger_analysis:

        finger_structure = finger_analysis.get(
            "finger_structure"
        )

        average_ratio = finger_analysis.get(
            "average_finger_ratio",
            0
        )

        dominant_finger = finger_analysis.get(
            "dominant_finger",
            "Unknown"
        )

        index_ring_relation = finger_analysis.get(
            "index_ring_relation",
            ""
        )

        if finger_structure == "Long Fingers":

            interpretation = (
                f"The detected fingers have a higher average "
                f"finger-to-palm ratio ({average_ratio}). "
                "In traditional palmistry, longer fingers are "
                "associated with attention to detail, sensitivity, "
                "patience, and thoughtful decision-making."
            )

        elif finger_structure == "Short Fingers":

            interpretation = (
                f"The detected fingers have a lower average "
                f"finger-to-palm ratio ({average_ratio}). "
                "In traditional palmistry, shorter fingers are "
                "associated with quick thinking, directness, "
                "spontaneity, and an action-oriented approach."
            )

        else:

            interpretation = (
                f"The detected fingers have a moderate average "
                f"finger-to-palm ratio ({average_ratio}). "
                "In traditional palmistry, medium-length fingers "
                "are associated with balance, adaptability, and "
                "a practical approach to different situations."
            )

        # Add actual finger comparison
        if dominant_finger != "Unknown":

            interpretation += (
                f" The {dominant_finger.lower()} shows the greatest "
                "wrist-to-tip measurement among the detected "
                "fingers."
            )

        if index_ring_relation:

            interpretation += (
                f" {index_ring_relation}."
            )

        interpretations["finger_structure"] = {
            "title": "Finger Structure",
            "type": finger_structure,
            "interpretation": interpretation,
            "measurements": {
                "average_finger_ratio": average_ratio,
                "dominant_finger": dominant_finger,
                "index_ring_relation": index_ring_relation
            }
        }

    # ==========================================================
    # PALM LINES
    # ==========================================================

    if palm_lines:

        lines = palm_lines.get("lines", [])

        for line_data in lines:

            line_name = line_data.get("line")
            confidence = line_data.get(
                "confidence",
                0
            )

            # Features added by line_detection.py
            length = line_data.get(
                "length",
                None
            )

            length_category = line_data.get(
                "length_category",
                None
            )

            direction = line_data.get(
                "direction",
                None
            )

            start_point = line_data.get(
                "start_point",
                None
            )

            end_point = line_data.get(
                "end_point",
                None
            )

            # --------------------------------------------------
            # Create image-specific measurement text
            # --------------------------------------------------

            measurement_text = ""

            if length is not None:

                measurement_text += (
                    f" Detected line length is approximately "
                    f"{length} pixels"
                )

            if length_category:

                measurement_text += (
                    f", classified as {length_category.lower()}"
                )

            if direction:

                measurement_text += (
                    f", with an overall {direction} direction"
                )

            measurement_text += "."

            # --------------------------------------------------
            # LIFE LINE
            # --------------------------------------------------


            if line_name == "life":

                if length_category == "Long":

                    interpretation = (
                        f"The detected Life Line has a relatively long "
                        f"geometric length of approximately {float(length):.1f} "
                        f"pixels. In traditional palmistry, a longer Life Line "
                        "is commonly associated with vitality, energy, activity, "
                        "and major life experiences."
                    )

                elif length_category == "Short":

                    interpretation = (
                        f"The detected Life Line has a relatively short "
                        f"geometric length of approximately {float(length):.1f} "
                        f"pixels. In traditional palmistry, this represents "
                        "a more compact Life Line pattern rather than a "
                        "prediction of lifespan."
                    )

                else:

                    interpretation = (
                        f"The detected Life Line has a moderate geometric "
                        f"length of approximately {float(length):.1f} pixels. "
                        "In traditional palmistry, this is associated with "
                        "a balanced Life Line pattern."
                    )

                if direction:

                    interpretation += (
                        f" The detected line direction is "
                        f"{str(direction).lower()}."
                    )

                interpretations["life_line"] = {
                    "title": "Life Line",
                    "confidence": confidence,
                    "length": length,
                    "length_category": length_category,
                    "direction": direction,
                    "start_point": start_point,
                    "end_point": end_point,
                    "interpretation": interpretation
                }

            # --------------------------------------------------
            # HEAD LINE
            # --------------------------------------------------

            elif line_name == "head":
               
                if length_category == "Long":

                    interpretation = (
                        f"The detected Head Line has a relatively long "
                        f"geometric length of approximately {float(length):.1f} "
                        f"pixels. In traditional palmistry, longer Head Lines "
                        "are associated with concentration, analysis, "
                        "careful thinking, and thoughtful decision-making."
                        )

                elif length_category == "Short":

                    interpretation = (
                        f"The detected Head Line has a relatively short "
                        f"geometric length of approximately {float(length):.1f} "
                        f"pixels. In traditional palmistry, shorter Head Lines "
                        "are associated with direct thinking and quick "
                        "decision-making."
                    )

                else:

                    interpretation = (
                        f"The detected Head Line has a moderate geometric "
                        f"length of approximately {float(length):.1f} pixels. "
                        "In traditional palmistry, this is associated with "
                        "a balanced approach to thinking and decision-making."
                    )

                if direction:

                    interpretation += (
                        f" The detected line direction is "
                        f"{str(direction).lower()}."
                    )

                interpretations["head_line"] = {
                    "title": "Head Line",
                    "confidence": confidence,
                    "length": length,
                    "length_category": length_category,
                    "direction": direction,
                    "start_point": start_point,
                    "end_point": end_point,
                    "interpretation": interpretation
                }

            # --------------------------------------------------
            # HEART LINE
            # --------------------------------------------------


            elif line_name == "heart":

                if length_category == "Long":

                    interpretation = (
                        f"The detected Heart Line has a relatively long "
                        f"geometric length of approximately {float(length):.1f} "
                        f"pixels. In traditional palmistry, longer Heart Lines "
                        "are associated with emotional expression, affection, "
                        "relationships, and sensitivity."
                    )

                elif length_category == "Short":

                    interpretation = (
                        f"The detected Heart Line has a relatively short "
                        f"geometric length of approximately {float(length):.1f} "
                        f"pixels. In traditional palmistry, shorter Heart Lines "
                        "are associated with a more direct or reserved style "
                        "of emotional expression."
                    )

                else:

                    interpretation = (
                        f"The detected Heart Line has a moderate geometric "
                        f"length of approximately {float(length):.1f} pixels. "
                        "In traditional palmistry, this is associated with "
                        "balanced emotional expression and relationships."
                    )

                if direction:

                    interpretation += (
                        f" The detected line direction is "
                        f"{str(direction).lower()}."
                    )

                interpretations["heart_line"] = {
                    "title": "Heart Line",
                    "confidence": confidence,
                    "length": length,
                    "length_category": length_category,
                    "direction": direction,
                    "start_point": start_point,
                    "end_point": end_point,
                    "interpretation": interpretation
                }

            # --------------------------------------------------
            # FATE LINE
            # --------------------------------------------------

            elif line_name == "fate":

                if length_category == "Long":

                    interpretation = (
                    f"The detected Fate Line has a relatively long "
                    f"geometric length of approximately {float(length):.1f} "
                    f"pixels. In traditional palmistry, longer Fate Lines "
                    "are associated with career direction, goals, ambition, "
                    "and a strong sense of life direction."
                )

                elif length_category == "Short":

                    interpretation = (
                        f"The detected Fate Line has a relatively short "
                        f"geometric length of approximately {float(length):.1f} "
                        f"pixels. In traditional palmistry, shorter Fate Lines "
                        "are associated with a less prominent or more variable "
                        "pattern of career direction."
                    )

                else:

                    interpretation = (
                        f"The detected Fate Line has a moderate geometric "
                        f"length of approximately {float(length):.1f} pixels. "
                        "In traditional palmistry, this is associated with "
                        "a balanced pattern of career direction and personal goals."
                    )

                if direction:

                    interpretation += (
                        f" The detected line direction is "
                        f"{str(direction).lower()}."
                    )

                interpretations["fate_line"] = {
                    "title": "Fate Line",
                    "confidence": confidence,
                    "length": length,
                    "length_category": length_category,
                    "direction": direction,
                    "start_point": start_point,
                    "end_point": end_point,
                    "interpretation": interpretation
                }

            # --------------------------------------------------
            # SUN LINE
            # --------------------------------------------------

            elif line_name == "sun":

                if length_category == "Long":

                    interpretation = (
                        "The detected Sun Line is relatively long. "
                        "In traditional palmistry, this is associated "
                        "with creativity, recognition, achievement, "
                        "and personal expression."
                    )

                elif length_category == "Short":

                    interpretation = (
                        "The detected Sun Line is relatively short. "
                        "In traditional palmistry, this indicates a "
                        "less prominent Sun Line pattern."
                    )

                else:

                    interpretation = (
                        "The detected Sun Line has a moderate "
                        "measured length and is traditionally "
                        "associated with creativity and personal "
                        "expression."
                    )

                interpretation += measurement_text

                interpretations["sun_line"] = {
                    "title": "Sun Line",
                    "confidence": confidence,
                    "length": length,
                    "length_category": length_category,
                    "direction": direction,
                    "start_point": start_point,
                    "end_point": end_point,
                    "interpretation": interpretation
                }

    return interpretations