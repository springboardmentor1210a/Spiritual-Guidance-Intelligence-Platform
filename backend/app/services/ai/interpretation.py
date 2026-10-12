def _safe_text(value):
    """Convert different data types into readable text."""
    if value is None:
        return ""

    if isinstance(value, list):
        return " ".join(str(item) for item in value)

    if isinstance(value, dict):
        return " ".join(
            f"{key}: {value}"
            for key, value in value.items()
        )

    return str(value)


def _collect_palm_insights(palm_analysis):
    """Extract image-dependent information from palm analysis."""
    if not isinstance(palm_analysis,dict):
        return []
    insights = []

    if not palm_analysis:
        return insights

    # ==========================================================
    # PALM SHAPE
    # ==========================================================

    palm_shape = palm_analysis.get(
        "palm_shape" ) or {}

    shape = palm_shape.get("palm_shape")

    if shape:
        insights.append(
            f"Palm shape: {shape}"
        )

    ratio = palm_shape.get(
        "length_width_ratio"
    )

    if ratio is not None:
        insights.append(
            f"Palm length-width ratio: {ratio}"
        )

    proportion = palm_shape.get(
        "palm_proportion"
    )

    if proportion:
        insights.append(
            f"Palm proportion: {proportion}"
        )

    distribution = palm_shape.get(
        "upper_palm_distribution"
    )

    if distribution:
        insights.append(
            f"Upper palm distribution: {distribution}"
        )

    # ==========================================================
    # FINGER STRUCTURE
    # ==========================================================

    finger_analysis = palm_analysis.get(
        "finger_analysis") or {}

    finger_structure = finger_analysis.get(
        "finger_structure"
    )

    if finger_structure:
        insights.append(
            f"Finger structure: {finger_structure}"
        )

    average_ratio = finger_analysis.get(
        "average_finger"
    )

    if average_ratio is not None:
        insights.append(
            f"Average finger-to-palm ratio: {average_ratio}"
        )

    dominant_finger = finger_analysis.get(
        "dominant_finger"
    )

    if dominant_finger:
        insights.append(
            f"Dominant finger by measured length: "
            f"{dominant_finger}"
        )

    index_ring_relation = finger_analysis.get(
        "index_ring_relation"
    )

    if index_ring_relation:
        insights.append(
            f"Finger comparison: "
            f"{index_ring_relation}"
        )

    # ==========================================================
    # INDIVIDUAL FINGER MEASUREMENTS
    # ==========================================================

    finger_ratios = [
        ("Thumb", "thumb_ratio"),
        ("Index", "index_ratio"),
        ("Middle", "middle_ratio"),
        ("Ring", "ring_ratio"),
        ("Little", "little_ratio")
    ]

    for finger_name, key in finger_ratios:

        value = finger_analysis.get(key)

        if value is not None:
            insights.append(
                f"{finger_name} finger ratio: {value}"
            )

    # ==========================================================
    # PALM LINES
    # ==========================================================

    palm_lines = palm_analysis.get(
        "palm_lines") or {}

    lines = palm_lines.get(
        "lines") or []

    for line in lines:

        if not isinstance(line,dict):
            continue
        line_name = line.get("line")

        if not line_name:
            continue

        confidence = line.get(
            "confidence"
        )

        length = line.get(
            "length"
        )

        length_category = line.get(
            "length_category"
        )

        direction = line.get(
            "direction"
        )

        # Build detailed line insight
        line_text = (
            f"{line_name.capitalize()} line"
        )

        if confidence is not None:
            line_text += (
                f" confidence: {confidence:.2f}"
            )

        if length is not None:
            line_text += (
                f", length: {length}"
            )

        if length_category:
            line_text += (
                f", length category: "
                f"{length_category}"
            )

        if direction:
            line_text += (
                f", direction: {direction}"
            )

        insights.append(line_text)

    # ==========================================================
    # TRADITIONAL INTERPRETATIONS
    # ==========================================================

    interpretations = palm_analysis.get(
        "interpretations"
    ) or {}

    if isinstance(interpretations, dict):

        for key, value in interpretations.items():

            # Avoid adding the entire dictionary as one
            # unreadable string.
            if isinstance(value, dict):

                title = value.get(
                    "title",
                    key
                )

                interpretation = value.get(
                    "interpretation"
                )

                if interpretation:
                    insights.append(
                        f"{title}: "
                        f"{interpretation}"
                    )

            else:

                text = _safe_text(value)

                if text:
                    insights.append(
                        f"{key}: {text}"
                    )

    elif isinstance(interpretations, list):

        for item in interpretations:

            text = _safe_text(item)

            if text:
                insights.append(text)

    return insights


def _collect_tarot_insights(
    tarot_reading,
    tarot_intention=None
):
    """
    Collect Tarot cards and convert their meanings into
    intention-aware personalized reflections.
    """

    insights = []

    if not tarot_reading:
        return insights

    # Get intention from the function argument first.
    # If unavailable, get it from the Tarot reading object.
    intention = tarot_intention

    if intention is None:
        intention = tarot_reading.get("intention")

    cards = tarot_reading.get("cards") or []

    for card in cards:

        if not isinstance(card, dict):
            continue

        name = card.get(
            "name",
            "Unknown Card"
        )

        orientation = card.get(
            "orientation",
            "upright"
        )

        position = card.get(
            "position",
            "Reading"
        )

        meaning = _safe_text(
            card.get("meaning", [])
        )

        personalized_insight = _personalize_tarot_insight(
            card_name=name,
            position=position,
            orientation=orientation,
            meaning=meaning,
            intention=intention
        )

        insights.append(
            personalized_insight
        )

    return insights

def _summarize_tarot_meaning(meaning, max_items=3):
    """
    Keep only the first few traditional Tarot themes so that
    the generated interpretation remains concise.
    """

    if isinstance(meaning, list):
        items = [
            str(item).strip()
            for item in meaning
            if str(item).strip()
        ]

        return "; ".join(items[:max_items])

    text = str(meaning or "").strip()

    if not text:
        return "The card provides a point for reflection."

    return text

def _personalize_tarot_insight(
    card_name,
    position,
    orientation,
    meaning,
    intention
):
    """
    Convert a Tarot card's traditional meaning into a concise,
    intention-aware and position-aware reflection.

    This is an AI-assisted traditional Tarot interpretation
    for reflection and entertainment, not a prediction.
    """

    intention_text = str(
        intention or "general reflection"
    ).strip().lower()

    position_text = str(
        position or "Reading"
    ).strip()

    meaning_text = _summarize_tarot_meaning(
        meaning,
        max_items=3
    )

    if not meaning_text:
        meaning_text = (
            "The card provides a point for reflection "
            "in this area of life."
        )

    # ==========================================================
    # PERSONAL GROWTH
    # ==========================================================

    if intention_text in [
        "personal",
        "personal growth",
        "growth"
    ]:

        if position_text.lower() == "past":

            return (
                f"{position_text}: {card_name} appears "
                f"{orientation}. "
                f"This card can reflect experiences or lessons "
                f"that may have contributed to your personal "
                f"development. Its traditional themes suggest: "
                f"{meaning_text}"
            )

        elif position_text.lower() == "present":

            return (
                f"{position_text}: {card_name} appears "
                f"{orientation}. "
                f"This card can highlight an area of personal "
                f"growth that may be worth reflecting on in the "
                f"present. Its traditional themes suggest: "
                f"{meaning_text}"
            )

        elif position_text.lower() == "future":

            return (
                f"{position_text}: {card_name} appears "
                f"{orientation}. "
                f"This card can serve as a reflection on areas "
                f"where continued learning, awareness, or change "
                f"may be valuable. Its traditional themes suggest: "
                f"{meaning_text}"
            )

        return (
            f"{position_text}: {card_name} appears "
            f"{orientation}. "
            f"This card offers a point for personal reflection "
            f"and self-awareness. Its traditional themes suggest: "
            f"{meaning_text}"
        )

    # ==========================================================
    # LOVE / RELATIONSHIPS
    # ==========================================================

    if intention_text in [
        "love",
        "relationship",
        "relationships"
    ]:

        if position_text.lower() == "past":

            return (
                f"{position_text}: {card_name} appears "
                f"{orientation}. "
                f"This card can reflect past experiences that "
                f"may have shaped your approach to relationships. "
                f"Its traditional themes suggest: "
                f"{meaning_text}"
            )

        elif position_text.lower() == "present":

            return (
                f"{position_text}: {card_name} appears "
                f"{orientation}. "
                f"This card can highlight themes worth reflecting "
                f"on in your current relationships and emotional "
                f"connections. Its traditional themes suggest: "
                f"{meaning_text}"
            )

        elif position_text.lower() == "future":

            return (
                f"{position_text}: {card_name} appears "
                f"{orientation}. "
                f"This card can offer a perspective on relationship "
                f"themes you may wish to consider going forward. "
                f"Its traditional themes suggest: "
                f"{meaning_text}"
            )

        return (
            f"{position_text}: {card_name} appears "
            f"{orientation}. "
            f"This card offers a point for reflection on "
            f"relationships and emotional connections. "
            f"Its traditional themes suggest: "
            f"{meaning_text}"
        )

    # ==========================================================
    # CAREER
    # ==========================================================

    if intention_text in [
        "career",
        "work"
    ]:

        if position_text.lower() == "past":

            return (
                f"{position_text}: {card_name} appears "
                f"{orientation}. "
                f"This card can reflect previous experiences "
                f"that may have influenced your goals or work "
                f"direction. Its traditional themes suggest: "
                f"{meaning_text}"
            )

        elif position_text.lower() == "present":

            return (
                f"{position_text}: {card_name} appears "
                f"{orientation}. "
                f"This card can highlight themes to consider "
                f"when reflecting on your current goals, work, "
                f"and decisions. Its traditional themes suggest: "
                f"{meaning_text}"
            )

        elif position_text.lower() == "future":

            return (
                f"{position_text}: {card_name} appears "
                f"{orientation}. "
                f"This card can provide a perspective on career "
                f"areas you may wish to explore or prepare for. "
                f"Its traditional themes suggest: "
                f"{meaning_text}"
            )

        return (
            f"{position_text}: {card_name} appears "
            f"{orientation}. "
            f"This card offers a point for reflection on career "
            f"goals and professional development. "
            f"Its traditional themes suggest: "
            f"{meaning_text}"
        )

    # ==========================================================
    # FINANCE
    # ==========================================================

    if intention_text in [
        "finance",
        "financial",
        "money"
    ]:

        return ( 
            f"{position_text}: {card_name} appears "
            f"{orientation}. "
            f"This card can be used as a reflection point for "
            f"your financial priorities, choices, and approach "
            f"to resources. Its traditional themes suggest: "
            f"{meaning_text}"
        )

    # ==========================================================
    # GENERAL
    # ==========================================================

    return (
        f"{position_text}: {card_name} appears "
        f"{orientation}. "
        f"This card offers a point for personal reflection. "
        f"Its traditional themes suggest: "
        f"{meaning_text}"
    )

def _categorize_insight(
    insight,
    personality,
    relationships,
    career,
    personal_growth,
    opportunities,
    tarot_intention=None
):
    """
    Categorize palm and Tarot insights.

    Palm interpretations are categorized using palmistry
    feature meanings.

    Tarot interpretations are categorized using the detected
    card name and the meaning contained in the insight.
    """

    text = str(insight).lower()

    # ==========================================================
    # IGNORE OVERALL TAROT READING
    # ==========================================================

    if text.startswith("overall tarot reading:"):
        return

    # ==========================================================
    # TAROT-SPECIFIC CATEGORIZATION
    # ==========================================================

    tarot_cards = [
        "appears upright",
        "appears reversed",
    ]

    is_tarot = any(marker in text for marker in tarot_cards)

    if is_tarot:

        # ------------------------------------------------------
        # USER INTENTION PRIORITY
        # ------------------------------------------------------

        if tarot_intention:

            intention = str(tarot_intention).strip().lower()

            # Personal Growth
            if intention in [
                "personal",
                "personal growth",
                "growth"
            ]:
                personal_growth.append(insight)
                return

            # Love / Relationships
            elif intention in [
                "love",
                "relationship",
                "relationships"
            ]:
                relationships.append(insight)
                return

            # Career
            elif intention in [
                "career",
                "work"
            ]:
                career.append(insight)
                return

            # Finance
            elif intention in [
                "finance",
                "financial",
                "money"
            ]:
                opportunities.append(insight)
                return

        # ------------------------------------------------------
        # RELATIONSHIPS
        # ------------------------------------------------------

        tarot_relationship_keywords = [
            "love",
            "relationship",
            "relationships",
            "romance",
            "affection",
            "emotional connection",
            "partner",
            "partnership",
            "attraction",
            "intimacy",
            "friendship",
            "connection",
            "union",
            "heart"
        ]

        if any(
            keyword in text
            for keyword in tarot_relationship_keywords
        ):
            relationships.append(insight)
            return

        # ------------------------------------------------------
        # CAREER
        # ------------------------------------------------------

        tarot_career_keywords = [
            "career",
            "work",
            "professional",
            "job",
            "business",
            "achievement",
            "accomplishment",
            "success",
            "goals",
            "ambition",
            "leadership",
            "responsibility",
            "project",
            "examination",
            "exams",
            "performance",
            "abilities",
            "schedule",
            "program"
        ]

        if any(
            keyword in text
            for keyword in tarot_career_keywords
        ):
            career.append(insight)
            return

        # ------------------------------------------------------
        # PERSONALITY
        # ------------------------------------------------------

        tarot_personality_keywords = [
            "self-image",
            "self image",
            "ego",
            "confidence",
            "abilities",
            "charms",
            "skills",
            "attention to yourself",
            "calling attention",
            "behavior",
            "behaviors",
            "personality",
            "identity",
            "expression",
            "distracted",
            "spontaneous",
            "leadership",
            "independent",
            "creativity",
            "passion",
            "determination"
        ]

        if any(
            keyword in text
            for keyword in tarot_personality_keywords
        ):
            personality.append(insight)
            return

        # ------------------------------------------------------
        # OPPORTUNITIES
        # ------------------------------------------------------

        tarot_opportunity_keywords = [
            "opportunity",
            "potential",
            "possibility",
            "new beginning",
            "reinvent",
            "reinvention",
            "hope",
            "success",
            "achievement",
            "recognition",
            "progress",
            "future",
            "chance",
            "possibilities"
        ]

        if any(
            keyword in text
            for keyword in tarot_opportunity_keywords
        ):
            opportunities.append(insight)
            return

        # ------------------------------------------------------
        # PERSONAL GROWTH
        # ------------------------------------------------------

        tarot_growth_keywords = [
            "growth",
            "learning",
            "development",
            "reflection",
            "healing",
            "transformation",
            "change",
            "self-improvement",
            "reinvent yourself",
            "prepare",
            "preparation",
            "lesson",
            "journey",
            "examination",
            "measure up",
            "re-evaluate",
            "reinvent"
        ]

        if any(
            keyword in text
            for keyword in tarot_growth_keywords
        ):
            personal_growth.append(insight)
            return

        # If a Tarot insight doesn't match a specific category,
        # use Personal Growth as a general reflection category.
        personal_growth.append(insight)
        return

    # ==========================================================
    # PALM-SPECIFIC CATEGORIZATION
    # ==========================================================

    # ----------------------------------------------------------
    # RELATIONSHIPS
    # ----------------------------------------------------------

    relationship_keywords = [
        "heart line",
        "emotional expression",
        "emotional",
        "affection",
        "relationships",
        "relationship",
        "romance"
    ]

    if any(
        keyword in text
        for keyword in relationship_keywords
    ):
        #relationships.append(insight) 
        return

    # ----------------------------------------------------------
    # CAREER
    # ----------------------------------------------------------

    career_keywords = [
        "fate line",
        "career direction",
        "career",
        "ambition",
        "goals",
        "professional",
        "life direction",
        "personal direction"
    ]

    if any(
        keyword in text
        for keyword in career_keywords
    ):
        # career.append(insight)
        return

    # ----------------------------------------------------------
    # PERSONALITY
    # ----------------------------------------------------------

    personality_keywords = [
        "palm has an elongated structure",
        "palm has a relatively wide structure",
        "palm has relatively balanced proportions",
        "palm structure",
        "finger structure",
        "long fingers",
        "short fingers",
        "medium-length fingers",
        "imagination",
        "curiosity",
        "sensitivity",
        "practicality",
        "confidence",
        "directness",
        "quick thinking",
        "spontaneity",
        "adaptability",
        "attention to detail",
        "patience",
        "thoughtful decision-making",
        "action-oriented"
    ]

    if any(
        keyword in text
        for keyword in personality_keywords
    ):
        personality.append(insight)
        return

    # ----------------------------------------------------------
    # PERSONAL GROWTH
    # ----------------------------------------------------------

    growth_keywords = [
        "growth",
        "learning",
        "development",
        "challenge",
        "change",
        "journey",
        "reflection",
        "healing",
        "self",
        "transformation",
        "decision-making"
    ]

    if any(
        keyword in text
        for keyword in growth_keywords
    ):
        # personal_growth.append(insight)
        return

    # ----------------------------------------------------------
    # OPPORTUNITIES
    # ----------------------------------------------------------

    opportunity_keywords = [
        "opportunity",
        "potential",
        "possibility",
        "new beginning",
        "hope",
        "inspiration",
        "exploration",
        "direction"
    ]

    if any(
        keyword in text
        for keyword in opportunity_keywords
    ):
        # opportunities.append(insight)
        return


def _generate_personality_intelligence(
    palm_analysis
):
    """
    Generate an image-specific traditional palmistry personality
    reflection based on combinations of detected palm features.

    This interpretation is intended for personal reflection and
    entertainment. It is not a scientifically validated assessment
    of personality, behavior, or future events.
    """

    if not isinstance(palm_analysis, dict) or not palm_analysis:
        return None

    # ==========================================================
    # GET DETECTED FEATURES
    # ==========================================================

    palm_shape = palm_analysis.get("palm_shape") or {}
    finger_analysis = palm_analysis.get("finger_analysis") or {}
    palm_lines = palm_analysis.get("palm_lines") or {}

    shape = palm_shape.get("palm_shape")

    average_finger = finger_analysis.get(
        "average_finger"
    )

    dominant_finger = finger_analysis.get(
        "dominant_finger"
    )

    index_ring_relation = finger_analysis.get(
        "index_ring_relation"
    )

    # ==========================================================
    # DETECT PALM LINES
    # ==========================================================

    lines = palm_lines.get("lines") or []

    detected_lines = {}

    for line in lines:

        if not isinstance(line, dict):
            continue

        name = str(
            line.get("line", "")
        ).strip().lower()

        if name:
            detected_lines[name] = line

    head = detected_lines.get("head")
    heart = detected_lines.get("heart")
    life = detected_lines.get("life")
    fate = detected_lines.get("fate")

    head_category = (
        head.get("length_category")
        if head
        else None
    )

    head_direction = (
        str(head.get("direction", "")).lower()
        if head
        else ""
    )

    heart_category = (
        heart.get("length_category")
        if heart
        else None
    )

    heart_direction = (
        str(heart.get("direction", "")).lower()
        if heart
        else ""
    )

    life_category = (
        life.get("length_category")
        if life
        else None
    )

    fate_category = (
        fate.get("length_category")
        if fate
        else None
    )

    # ==========================================================
    # INTERNAL TRAIT SIGNALS
    #
    # These are not shown directly to the user.
    # They are used to combine multiple detected features.
    # ==========================================================

    traits = set()

    # ----------------------------------------------------------
    # PALM SHAPE
    # ----------------------------------------------------------

    if shape == "Long Palm":
        traits.update({
            "curious",
            "imaginative",
            "explorative"
        })

    elif shape == "Wide Palm":
        traits.update({
            "practical",
            "action_oriented",
            "grounded"
        })

    elif shape == "Balanced Palm":
        traits.update({
            "adaptable",
            "balanced",
            "flexible"
        })

    # ----------------------------------------------------------
    # FINGER PROPORTIONS
    # ----------------------------------------------------------

    if isinstance(
        average_finger,
        (int, float)
    ):

        if average_finger <= 1.6:

            traits.update({
                "direct",
                "quick_decision",
                "action_oriented"
            })

        elif average_finger >= 1.8:

            traits.update({
                "detail_oriented",
                "reflective",
                "patient"
            })

        else:

            traits.update({
                "adaptable",
                "practical"
            })

    # ----------------------------------------------------------
    # DOMINANT FINGER
    # ----------------------------------------------------------

    dominant = str(
        dominant_finger or ""
    ).lower()

    if dominant == "middle":

        traits.update({
            "structured",
            "responsible"
        })

    elif dominant == "index":

        traits.update({
            "initiative",
            "self_expression"
        })

    elif dominant == "ring":

        traits.update({
            "creative",
            "expressive"
        })

    elif dominant == "little":

        traits.update({
            "communicative",
            "social_expression"
        })

    elif dominant == "thumb":

        traits.update({
            "independent",
            "self_driven"
        })

    # ----------------------------------------------------------
    # INDEX / RING RELATIONSHIP
    # ----------------------------------------------------------

    relation = str(
        index_ring_relation or ""
    ).lower()

    if "index finger longer" in relation:

        traits.update({
            "initiative",
            "self_expression"
        })

    elif "ring finger longer" in relation:

        traits.update({
            "creative",
            "expressive"
        })

    # ----------------------------------------------------------
    # HEAD LINE
    # ----------------------------------------------------------

    if head_category == "Long":

        traits.update({
            "focused",
            "analytical"
        })

    elif head_category == "Short":

        traits.update({
            "direct",
            "quick_decision"
        })

    elif head_category:

        traits.update({
            "balanced_thinking"
        })

    if head_direction == "downward":

        traits.update({
            "imaginative",
            "reflective"
        })

    elif head_direction == "upward":

        traits.update({
            "practical",
            "goal_oriented"
        })

    # ----------------------------------------------------------
    # HEART LINE
    # ----------------------------------------------------------

    if heart_category == "Long":

        traits.update({
            "emotionally_expressive",
            "connection_oriented"
        })

    elif heart_category == "Short":

        traits.update({
            "emotionally_reserved"
        })

    elif heart_category:

        traits.update({
            "emotionally_balanced"
        })

    if heart_direction == "downward":

        traits.add(
            "emotionally_reflective"
        )

    elif heart_direction == "upward":

        traits.add(
            "outwardly_expressive"
        )

    # ----------------------------------------------------------
    # LIFE LINE
    # ----------------------------------------------------------

    if life_category == "Long":

        traits.update({
            "active",
            "engaged"
        })

    elif life_category == "Short":

        traits.add(
            "measured_activity"
        )

    elif life_category:

        traits.add(
            "balanced_activity"
        )

    # ----------------------------------------------------------
    # FATE LINE
    # ----------------------------------------------------------

    if fate_category == "Long":

        traits.update({
            "goal_oriented",
            "direction_focused"
        })

    elif fate_category == "Short":

        traits.update({
            "flexible_direction",
            "adaptable"
        })

    elif fate_category:

        traits.add(
            "balanced_direction"
        )

    # ==========================================================
    # RESULT CONTAINERS
    # ==========================================================

    strengths = []
    areas_for_development = []
    behavioral_insights = []
    personal_development = []

    # ==========================================================
    # COMBINATION-BASED PERSONALITY PROFILE
    # ==========================================================

    profile_parts = []

    # ----------------------------------------------------------
    # PRIMARY PERSONALITY PATTERN
    # ----------------------------------------------------------

    if (
        "curious" in traits
        and "action_oriented" in traits
        and "initiative" in traits
    ):

        profile_parts.append(
            "an exploratory nature combined with a strong tendency "
            "to turn ideas into action and take initiative"
        )

    elif (
        "curious" in traits
        and "action_oriented" in traits
        and "creative" in traits
    ):

        profile_parts.append(
            "an exploratory nature combined with creativity and "
            "a preference for expressing ideas in your own way"
        )

    elif (
        "curious" in traits
        and "action_oriented" in traits
    ):

        profile_parts.append(
            "an exploratory nature combined with a practical and "
            "action-oriented approach"
        )

    elif (
        "curious" in traits
        and "creative" in traits
    ):

        profile_parts.append(
            "a curious and imaginative approach with a strong interest "
            "in creativity and self-expression"
        )

    elif "curious" in traits:

        profile_parts.append(
            "a naturally curious and exploratory approach to new ideas"
        )

    elif (
        "practical" in traits
        and "action_oriented" in traits
    ):

        profile_parts.append(
            "a practical mindset combined with a preference for "
            "turning ideas into visible action"
        )

    elif "adaptable" in traits:

        profile_parts.append(
            "an adaptable approach that allows you to adjust when "
            "situations or priorities change"
        )

    # ----------------------------------------------------------
    # THINKING PATTERN
    # ----------------------------------------------------------

    if (
        "analytical" in traits
        and "quick_decision" in traits
    ):

        profile_parts.append(
            "a distinctive balance between quick action and deeper "
            "analysis when something is important"
        )

    elif (
        "analytical" in traits
        and "reflective" in traits
    ):

        profile_parts.append(
            "a thoughtful and analytical side that may become stronger "
            "when you are deeply interested in a subject"
        )

    elif "analytical" in traits:

        profile_parts.append(
            "a focused and analytical way of approaching subjects "
            "that genuinely interest you"
        )

    elif "detail_oriented" in traits:

        profile_parts.append(
            "a detail-aware and reflective approach to understanding "
            "situations before acting"
        )

    elif "quick_decision" in traits:

        profile_parts.append(
            "a direct decision-making style that tends to favor "
            "forward movement"
        )

    # ----------------------------------------------------------
    # EXPRESSION / INDIVIDUALITY
    # ----------------------------------------------------------

    if (
        "creative" in traits
        and "self_expression" in traits
    ):

        profile_parts.append(
            "a strong preference for creativity, individuality, "
            "and personal expression"
        )

    elif "creative" in traits:

        profile_parts.append(
            "an interest in creativity and finding your own way "
            "of approaching ideas"
        )

    elif "initiative" in traits:

        profile_parts.append(
            "a tendency to take initiative when something aligns "
            "with your interests or goals"
        )
    # ----------------------------------------------------------
    # DIRECTION / GOALS
    # ----------------------------------------------------------

    if "direction_focused" in traits:

        profile_parts.append(
            "a stronger traditional association with personal "
            "direction, goals, and long-term focus"
        )

    elif "flexible_direction" in traits:

        profile_parts.append(
            "a more flexible approach to personal direction, "
            "with room to adjust goals as circumstances change"
        )

    elif "balanced_direction" in traits:

        profile_parts.append(
            "a balanced approach to personal direction and changing priorities"
        )
    # ----------------------------------------------------------
    # EMOTIONAL STYLE
    # ----------------------------------------------------------

    if "emotionally_reserved" in traits:

        profile_parts.append(
            "a more measured emotional style in which you may prefer "
            "to process feelings before expressing them"
        )

    elif (
        "emotionally_expressive" in traits
        and "connection_oriented" in traits
    ):

        profile_parts.append(
            "an emotionally expressive approach that places importance "
            "on meaningful connections"
        )

    elif "emotionally_balanced" in traits:

        profile_parts.append(
            "a relatively balanced approach to emotional expression "
            "and relationships"
        )

    # ----------------------------------------------------------
    # BUILD A NATURAL PROFILE
    #
    # Combine the strongest detected patterns into a concise,
    # natural-sounding personality reflection.
    # ----------------------------------------------------------

    profile_parts = list(
        dict.fromkeys(profile_parts)
    )

    if len(profile_parts) >= 4:

        profile = (
            "Your palm shows a combination traditionally associated "
            f"with {profile_parts[0]}. It also suggests {profile_parts[1]}. "
            f"Another notable pattern is {profile_parts[2]}, while "
            f"{profile_parts[3]}. Overall, these associations suggest "
            "a personality pattern that can be used as a reflection "
            "point for how you approach ideas, decisions, relationships, "
            "and personal direction."
        )

    elif len(profile_parts) == 3:

        profile = (
            "Your palm shows a combination traditionally associated "
            f"with {profile_parts[0]}. It also suggests {profile_parts[1]}. "
            f"A further pattern points toward {profile_parts[2]}. "
            "Together, these associations provide a reflection point "
            "for your thinking style, behavior, and personal direction."
        )

    elif len(profile_parts) == 2:

        profile = (
            "Your palm shows a combination traditionally associated "
            f"with {profile_parts[0]}. It also suggests {profile_parts[1]}. "
            "Together, these patterns provide reflection points around "
            "your thinking style, behavior, and personal direction."
        )

    elif len(profile_parts) == 1:

        profile = (
            "Your palm shows a pattern traditionally associated with "
            f"{profile_parts[0]}. This can serve as a reflection point "
            "for understanding your personal tendencies and development."
        )

    else:

        profile = (
            "The detected palm features provide limited information "
            "for a traditional personality reflection."
        )

    # ---------------------------------------------------------
    # Strengths
    # ---------------------------------------------------------
    strengths = []

    # Palm-shape based strengths
    if shape == "Long Palm":
        strengths.append(
            "You may have a natural curiosity that encourages you "
            "to explore unfamiliar ideas, subjects, and experiences."
        )

    elif shape == "Wide Palm":
        strengths.append(
            "You may naturally focus on practical outcomes and "
            "prefer turning ideas into something useful."
        )

    elif shape == "Balanced Palm":
        strengths.append(
            "You may be comfortable adapting your approach when "
            "situations change while still keeping your overall "
            "direction in mind."
        )

    # Finger-proportion based strengths
    if isinstance(average_finger,(int,float)) and average_finger <=1.6:
        strengths.append(
            "You may be comfortable making straightforward decisions "
            "and moving from consideration toward action."
        )

    elif isinstance(average_finger,(int,float)) and average_finger >=1.8:
        strengths.append(
            "You may naturally give attention to details and take "
            "time to consider different aspects before acting."
        )

    else:
        strengths.append(
            "You may be able to balance quick action with consideration "
            "when approaching decisions."
        )

    # Dominant-finger based strengths
    if dominant_finger == "Middle Finger":
        strengths.append(
            "You may have a natural sense of responsibility and "
            "structure when working toward something important."
        )

    elif dominant_finger == "Index Finger":
        strengths.append(
            "You may naturally show initiative when something "
            "matches your interests or personal goals."
        )

    elif dominant_finger == "Ring Finger":
        strengths.append(
            "You may have a natural tendency toward creativity, "
            "expression, and exploring different ways to present ideas."
        )

    elif dominant_finger == "Little Finger":
        strengths.append(
            "You may naturally value communication and expressing "
            "ideas or perspectives to others."
        )

    elif dominant_finger == "Thumb":
        strengths.append(
            "You may show a tendency toward independence and "
            "self-directed action."
        )

    # Head-line based strengths
    if head_category == "Long":
        strengths.append(
            "You may be able to stay focused on an idea and explore "
            "it in greater depth before moving on."
        )

    elif head_category == "Short":
        strengths.append(
            "You may prefer reaching a workable decision and "
            "learning through action rather than remaining uncertain."
        )

    # Heart-line based strengths
    if heart_category == "Long":
        strengths.append(
            "You may place meaningful value on emotional connection "
            "and expressing what matters to you."
        )

    elif heart_category == "Short":
        strengths.append(
            "You may prefer keeping emotional matters measured and "
            "processing them in your own way."
        )

    # ---------------------------------------------------------
    # Remove duplicates while preserving order
    # ---------------------------------------------------------
    strengths = list(dict.fromkeys(strengths))

    # ---------------------------------------------------------
    # Prioritize feature-specific strengths
    #
    # The order below gives more importance to the features
    # that make one palm different from another.
    # ---------------------------------------------------------

    prioritized_strengths = []

    # Palm shape is one of the strongest personality signals
    if shape == "Long Palm":
        for item in strengths:
            if "curiosity" in item.lower():
                prioritized_strengths.append(item)

    elif shape == "Balanced Palm":
        for item in strengths:
            if "adapting" in item.lower():
                prioritized_strengths.append(item)

    elif shape == "Wide Palm":
        for item in strengths:
            if "practical outcomes" in item.lower():
                prioritized_strengths.append(item)

    # Head-line based strength
    if head_category in ("Long", "Short"):
        for item in strengths:
            if (
                "workable decision" in item.lower()
                or "focused on an idea" in item.lower()
                or "details" in item.lower()
            ):
                prioritized_strengths.append(item)

    # Dominant-finger based strength
    for item in strengths:
        if any(
            phrase in item.lower()
            for phrase in [
                "responsibility and structure",
                "initiative",
                "creativity",
                "communication",
                "independence"
            ]
        ):
            prioritized_strengths.append(item)

    # Finger-proportion strength
    for item in strengths:
        if (
            "straightforward decisions" in item.lower()
            or "balance quick action" in item.lower()
        ):
            prioritized_strengths.append(item)

    # Heart-line based strength
    for item in strengths:
        if (
            "emotional connection" in item.lower()
            or "emotional matters" in item.lower()
        ):
            prioritized_strengths.append(item)

    # Add anything that was not selected above
    for item in strengths:
        if item not in prioritized_strengths:
            prioritized_strengths.append(item)

    # Remove duplicsates again
    strengths = list(
        dict.fromkeys(prioritized_strengths)
    )

    # Keep Personality Intelligence concise
    strengths = strengths[:4]

    # ==========================================================
    # AREAS FOR DEVELOPMENT
    # ==========================================================
    # These are based on the combination of detected features.
    # They are reflection points, not psychological diagnoses.
    # ==========================================================

    areas_for_development = []

    # ----------------------------------------------------------
    # LONG PALM + CURIOSITY
    # ----------------------------------------------------------

    if (
        shape == "Long Palm"
        and "curious" in traits
    ):

        areas_for_development.append(
            "Curiosity can lead you toward many possibilities, so "
            "choosing a few meaningful priorities may help turn "
            "exploration into consistent progress."
        )

    # ----------------------------------------------------------
    # BALANCED PALM + ADAPTABILITY
    # ----------------------------------------------------------

    if (
        shape == "Balanced Palm"
        and "adaptable" in traits
    ):

        areas_for_development.append(
            "Your ability to adapt can be useful, while keeping a "
            "small number of clear priorities may help you maintain "
            "direction when circumstances change."
        )

    # ----------------------------------------------------------
    # WIDE PALM + ACTION ORIENTATION
    # ----------------------------------------------------------

    if (
        shape == "Wide Palm"
        and "action_oriented" in traits
    ):

        areas_for_development.append(
            "A strong focus on practical action can be useful, while "
            "occasionally stepping back to consider alternative "
            "approaches may reveal additional possibilities."
        )

    # ----------------------------------------------------------
    # QUICK DECISION + ACTION ORIENTATION
    # ----------------------------------------------------------

    if (
        "quick_decision" in traits
        and "action_oriented" in traits
    ):

        areas_for_development.append(
            "Because you may naturally move quickly once interested, "
            "important decisions can benefit from a short pause to "
            "consider alternatives and consequences."
        )

    # ----------------------------------------------------------
    # ANALYTICAL / REFLECTIVE
    # ----------------------------------------------------------

    if (
        "analytical" in traits
        and "reflective" in traits
    ):

        areas_for_development.append(
            "Deep thinking can be valuable, but setting a clear point "
            "for moving from analysis to action may help prevent "
            "unnecessary delay."
        )

    # ----------------------------------------------------------
    # SHORT HEAD LINE
    # ----------------------------------------------------------

    if head_category == "Short":

        areas_for_development.append(
            "A direct approach to decisions can be useful, while "
            "giving important choices a little extra time may help "
            "you consider alternatives and consequences."
        )

    # ----------------------------------------------------------
    # SHORT HEART LINE
    # ----------------------------------------------------------

    if heart_category == "Short":

        areas_for_development.append(
            "If you naturally process emotions privately, expressing "
            "important feelings clearly may help others understand "
            "your perspective more easily."
        )

    # ----------------------------------------------------------
    # LONG HEART LINE
    # ----------------------------------------------------------

    if heart_category == "Long":

        areas_for_development.append(
            "Strong emotional involvement can be meaningful, while "
            "maintaining personal boundaries may help keep relationships "
            "balanced."
        )

    # ----------------------------------------------------------
    # FLEXIBLE DIRECTION
    # ----------------------------------------------------------

    if (
        "flexible_direction" in traits
        and "adaptable" in traits
    ):

        areas_for_development.append(
            "Flexibility can help you respond to changing situations, "
            "while regularly checking your longer-term priorities can "
            "help maintain a clear sense of direction."
        )

    # ----------------------------------------------------------
    # REMOVE DUPLICATES
    # ----------------------------------------------------------

    areas_for_development = list(
        dict.fromkeys(areas_for_development)
    )

    # Keep the section concise
    areas_for_development = areas_for_development[:3]

    # ==========================================================
    # BEHAVIORAL INSIGHTS
    #
    # Prioritize combinations of detected traits so that the
    # insights reflect what is most distinctive about this palm.
    # ==========================================================

    behavioral_insights = []

    # ----------------------------------------------------------
    # CURIOSITY + CREATIVITY
    # ----------------------------------------------------------

    if (
        "curious" in traits
        and "creative" in traits
    ):

        behavioral_insights.append(
            "You may be especially interested in experiences that "
            "allow experimentation, creativity, or discovery."
        )

    # ----------------------------------------------------------
    # ADAPTABILITY + PRACTICAL THINKING
    # ----------------------------------------------------------

    if (
        "adaptable" in traits
        and "practical" in traits
    ):

        behavioral_insights.append(
            "You may adjust your approach while still keeping "
            "practical results in mind."
        )

    # ----------------------------------------------------------
    # QUICK DECISION + ACTION ORIENTATION
    # ----------------------------------------------------------

    if (
        "quick_decision" in traits
        and "action_oriented" in traits
    ):

        behavioral_insights.append(
            "You may prefer reaching a workable decision and "
            "learning through action rather than remaining "
            "uncertain for too long."
        )

    # ----------------------------------------------------------
    # ANALYTICAL + REFLECTIVE
    # ----------------------------------------------------------

    if (
        "analytical" in traits
        and "reflective" in traits
    ):

        behavioral_insights.append(
            "When a subject is important to you, you may spend "
            "more time examining it carefully before settling "
            "on a response."
        )

    # ----------------------------------------------------------
    # CREATIVE + SELF EXPRESSION
    # ----------------------------------------------------------

    if (
        "creative" in traits
        and "self_expression" in traits
    ):

        behavioral_insights.append(
            "You may prefer expressing ideas in your own way "
            "rather than always following an established approach."
        )

    # ----------------------------------------------------------
    # EMOTIONAL STYLE
    # ----------------------------------------------------------

    if "emotionally_reserved" in traits:

        behavioral_insights.append(
            "You may prefer processing emotions privately before "
            "expressing them openly to others."
        )

    elif (
        "emotionally_expressive" in traits
        and "connection_oriented" in traits
    ):

        behavioral_insights.append(
            "You may place greater importance on relationships "
            "where emotional connection and mutual understanding "
            "can develop naturally."
        )

    # ----------------------------------------------------------
    # ADAPTABILITY
    # ----------------------------------------------------------

    if (
        "adaptable" in traits
        and "flexible" in traits
    ):

        behavioral_insights.append(
            "When circumstances change, you may be comfortable "
            "adjusting your approach rather than remaining fixed "
            "on one method."
        )

    # ----------------------------------------------------------
    # CURIOSITY / EXPLORATION
    # ----------------------------------------------------------

    if (
        "curious" in traits
        and "explorative" in traits
    ):

        behavioral_insights.append(
            "You may naturally become interested when you encounter "
            "new subjects, unfamiliar ideas, or possibilities."
        )

    # ----------------------------------------------------------
    # ANALYTICAL
    # ----------------------------------------------------------

    if "analytical" in traits:

        behavioral_insights.append(
            "You may naturally look for structure and reasoning "
            "when trying to understand a situation."
        )

    # ----------------------------------------------------------
    # INITIATIVE
    # ----------------------------------------------------------

    if "initiative" in traits:

        behavioral_insights.append(
            "When something matches your interests or goals, "
            "you may be inclined to take the first step yourself."
        )

    # ----------------------------------------------------------
    # RESPONSIBILITY / STRUCTURE
    # ----------------------------------------------------------

    if (
        "structured" in traits
        and "responsible" in traits
    ):

        behavioral_insights.append(
            "You may naturally pay attention to responsibilities "
            "and prefer having some structure when working toward "
            "an important outcome."
        )

    # ----------------------------------------------------------
    # REMOVE DUPLICATES
    # ----------------------------------------------------------

    behavioral_insights = list(
        dict.fromkeys(behavioral_insights)
    )

    # Keep the most distinctive four insights
    behavioral_insights = behavioral_insights[:4]   

# ==========================================================
    # PERSONAL DEVELOPMENT
    #
    # These suggestions translate the detected personality
    # patterns into practical reflection and development ideas.
    # ==========================================================

    personal_development = []

    # ----------------------------------------------------------
    # CURIOSITY + ACTION
    # ----------------------------------------------------------

    if (
        "curious" in traits
        and "action_oriented" in traits
    ):

        personal_development.append(
            "Use your curiosity as a starting point, then turn the "
            "most valuable ideas into small practical experiments "
            "or achievable goals."
        )

    # ----------------------------------------------------------
    # ADAPTABILITY + PRACTICAL THINKING
    # ----------------------------------------------------------

    if (
        "adaptable" in traits
        and "practical" in traits
    ):

        personal_development.append(
            "Use your ability to adapt as a strength while keeping "
            "a small number of clear priorities to guide your progress."
        )

    # ----------------------------------------------------------
    # CREATIVITY + SELF EXPRESSION
    # ----------------------------------------------------------

    if (
        "creative" in traits
        and "self_expression" in traits
    ):

        personal_development.append(
            "Give yourself regular opportunities to create, "
            "experiment, and express ideas in ways that feel "
            "personally meaningful."
        )

    # ----------------------------------------------------------
    # CREATIVITY
    # ----------------------------------------------------------

    elif "creative" in traits:

        personal_development.append(
            "Explore creative activities that allow you to develop "
            "ideas in your own way and turn imagination into something "
            "you can share or build."
        )

    # ----------------------------------------------------------
    # QUICK DECISION + ANALYSIS
    # ----------------------------------------------------------

    if (
        "quick_decision" in traits
        and "analytical" in traits
    ):

        personal_development.append(
            "Keep your ability to act quickly while giving important "
            "decisions enough time for thoughtful evaluation."
        )

    # ----------------------------------------------------------
    # QUICK DECISION
    # ----------------------------------------------------------

    elif "quick_decision" in traits:

        personal_development.append(
            "Maintain your ability to act decisively while developing "
            "a habit of checking the consequences of important choices."
        )

    # ----------------------------------------------------------
    # ANALYTICAL + REFLECTIVE
    # ----------------------------------------------------------

    if (
        "analytical" in traits
        and "reflective" in traits
    ):

        personal_development.append(
            "Use your reflective thinking to understand problems deeply, "
            "while setting practical points where analysis can become action."
        )

    # ----------------------------------------------------------
    # EMOTIONAL EXPRESSION
    # ----------------------------------------------------------

    if "emotionally_reserved" in traits:

        personal_development.append(
            "Practice expressing important thoughts and feelings clearly "
            "when doing so could improve communication with people around you."
        )

    elif (
        "emotionally_expressive" in traits
        and "connection_oriented" in traits
    ):

        personal_development.append(
            "Invest in relationships where honest communication, "
            "emotional connection, and mutual understanding can grow."
        )

    # ----------------------------------------------------------
    # DIRECTION / GOALS
    # ----------------------------------------------------------

    if "direction_focused" in traits:

        personal_development.append(
            "Connect your everyday actions with a small number of "
            "long-term goals so that your sense of direction remains clear."
        )

    elif "flexible_direction" in traits:

        personal_development.append(
            "Allow your goals to evolve when circumstances change, "
            "while regularly checking whether your current direction "
            "still matches what matters to you."
        )

    # ----------------------------------------------------------
    # RESPONSIBILITY / STRUCTURE
    # ----------------------------------------------------------

    if (
        "structured" in traits
        and "responsible" in traits
    ):

        personal_development.append(
            "Use structure and responsibility to create consistent "
            "habits without making your approach unnecessarily rigid."
        )

    # ----------------------------------------------------------
    # REMOVE DUPLICATES
    # ----------------------------------------------------------

    personal_development = list(
        dict.fromkeys(personal_development)
    )

    # Keep the section concise
    personal_development = personal_development[:4]

    # ==========================================================
    # PERSONAL TENDENCIES
    #
    # These provide a deeper reflection on how the detected
    # personality pattern may translate into everyday tendencies.
    # ==========================================================

    # ----------------------------------------------------------
    # DECISION STYLE
    # ----------------------------------------------------------

    if (
        "quick_decision" in traits
        and "analytical" in traits
    ):

        decision_style = (
            "You may make an initial decision relatively quickly, "
            "then become more analytical when the choice has greater "
            "importance."
        )

    elif "quick_decision" in traits:

        decision_style = (
            "You may prefer making a practical decision and moving "
            "forward rather than spending too long weighing every option."
        )

    elif (
        "analytical" in traits
        and "reflective" in traits
    ):

        decision_style = (
            "You may prefer examining the details and reflecting on "
            "different possibilities before committing to an important choice."
        )

    elif "analytical" in traits:

        decision_style = (
            "You may prefer understanding the reasoning behind a choice "
            "before deciding how to proceed."
        )

    elif "reflective" in traits:

        decision_style = (
            "You may prefer taking some time to consider how a decision "
            "fits with the situation before acting."
        )

    else:

        decision_style = (
            "You may adjust your decision-making approach depending on "
            "the situation and importance of the choice."
        )

    # ----------------------------------------------------------
    # LEARNING STYLE
    # ----------------------------------------------------------

    if (
        "curious" in traits
        and "creative" in traits
    ):

        learning_style = (
            "You may learn well through exploration, experimentation, "
            "and opportunities to approach a subject creatively."
        )

    elif (
        "curious" in traits
        and "action_oriented" in traits
    ):

        learning_style = (
            "You may learn effectively when you can connect new ideas "
            "with practical examples or hands-on experience."
        )

    elif (
        "analytical" in traits
        and "detail_oriented" in traits
    ):

        learning_style = (
            "You may prefer understanding how concepts work in detail "
            "before applying them."
        )

    elif "analytical" in traits:

        learning_style = (
            "You may learn well when you can understand the reasoning "
            "and structure behind a concept."
        )

    elif "creative" in traits:

        learning_style = (
            "You may enjoy learning through creative activities and "
            "finding your own way to explore a subject."
        )

    elif "curious" in traits:

        learning_style = (
            "You may learn naturally through exploration and discovering "
            "connections between new ideas."
        )

    else:

        learning_style = (
            "You may benefit from combining explanation with practical "
            "experience when learning something new."
        )

    # ----------------------------------------------------------
    # PROBLEM-SOLVING STYLE
    # ----------------------------------------------------------

    if (
        "analytical" in traits
        and "action_oriented" in traits
    ):

        problem_solving_style = (
            "You may combine analysis with practical action, examining "
            "a problem and then testing a promising solution."
        )

    elif (
        "creative" in traits
        and "action_oriented" in traits
    ):

        problem_solving_style = (
            "You may enjoy generating different possibilities and then "
            "testing the ideas that seem most useful."
        )

    elif "analytical" in traits:

        problem_solving_style = (
            "You may prefer understanding the structure of a problem "
            "before deciding how to approach it."
        )

    elif "action_oriented" in traits:

        problem_solving_style = (
            "You may prefer trying a practical solution and learning "
            "from the results."
        )

    elif "creative" in traits:

        problem_solving_style = (
            "You may enjoy finding alternative or unconventional ways "
            "to approach a difficult problem."
        )

    elif "adaptable" in traits:

        problem_solving_style = (
            "You may adjust your problem-solving approach depending "
            "on what the situation requires."
        )

    else:

        problem_solving_style = (
            "You may adapt your problem-solving approach according "
            "to the situation and available options."
        )

    # ----------------------------------------------------------
    # RESPONSE TO CHALLENGES
    # ----------------------------------------------------------

    if (
        "adaptable" in traits
        and "action_oriented" in traits
    ):

        response_to_challenges = (
            "When circumstances change, you may respond by adjusting "
            "your approach and looking for a practical way forward."
        )

    elif (
        "adaptable" in traits
        and "reflective" in traits
    ):

        response_to_challenges = (
            "You may respond to challenges by first considering what "
            "has changed and then adapting your approach."
        )

    elif "action_oriented" in traits:

        response_to_challenges = (
            "When facing a challenge, you may feel more comfortable "
            "taking an initial step rather than remaining inactive."
        )

    elif (
        "analytical" in traits
        or "reflective" in traits
    ):

        response_to_challenges = (
            "You may prefer understanding a challenge first and then "
            "choosing a considered response."
        )

    elif "creative" in traits:

        response_to_challenges = (
            "You may look for alternative ways to approach a challenge "
            "when the usual method does not work."
        )

    else:

        response_to_challenges = (
            "You may adapt your response to challenges based on the "
            "specific circumstances and available options."
        )
    # ==========================================================
    # REMOVE DUPLICATES
    # ==========================================================

    strengths = list(
        dict.fromkeys(strengths)
    )

    areas_for_development = list(
        dict.fromkeys(areas_for_development)
    )

    behavioral_insights = list(
        dict.fromkeys(behavioral_insights)
    )

    personal_development = list(
        dict.fromkeys(personal_development)
    )

    # ==========================================================
    # AVOID EXACT REPETITION BETWEEN SECTIONS
    #
    # Each section should contribute a different reflection.
    # ==========================================================

    strength_text = {
        item.strip().lower()
        for item in strengths
    }

    areas_for_development = [
        item
        for item in areas_for_development
        if item.strip().lower() not in strength_text
    ]

    behavioral_text = {
        item.strip().lower()
        for item in behavioral_insights
    }

    personal_development = [
        item
        for item in personal_development
        if item.strip().lower() not in behavioral_text
    ]

    # ==========================================================
    # LIMIT OUTPUT
    # ==========================================================

    strengths = strengths[:4]

    areas_for_development = areas_for_development[:3]

    behavioral_insights = behavioral_insights[:4]

    personal_development = personal_development[:4]

    # ==========================================================
    # FINAL RESULT
    # ==========================================================

    return {
        "profile": profile,

        "strengths": strengths,

        "areas_for_development": areas_for_development,

        "behavioral_insights": behavioral_insights,

        "personal_development": personal_development,

        "personal_tendencies": {
            "decision_style": decision_style,
            "learning_style": learning_style,
            "problem_solving_style": problem_solving_style,
            "response_to_challenges": response_to_challenges
        }
    }

def _generate_tarot_personality_intelligence(
    tarot_reading,
    tarot_intention=None
):
    """
    Generate a Tarot-based personality reflection using
    the selected cards, their traditional meanings,
    orientation, and reading intention.

    This is intended for reflection and entertainment.
    It is not a scientifically validated personality assessment.
    """

    if not tarot_reading:
        return {
            "profile": "No Tarot personality information is available.",
            "strengths": [],
            "areas_for_development": [],
            "behavioral_insights": [],
            "personal_development": [],
            "personal_tendencies": {}
        }

    cards = tarot_reading.get("cards") or []

    if not cards:
        return {
            "profile": "No selected Tarot cards are available for personality reflection.",
            "strengths": [],
            "areas_for_development": [],
            "behavioral_insights": [],
            "personal_development": [],
            "personal_tendencies": {}
        }

    intention = str(
        tarot_intention
        or tarot_reading.get("intention")
        or "general"
    ).strip().lower()

    card_text = []

    for card in cards:
        if not isinstance(card, dict):
            continue

        name = str(card.get("name", "")).strip()

        keywords = card.get("keywords", [])
        meaning = card.get("meaning", [])

        orientation = str(
            card.get("orientation", "upright")
        ).strip().lower()

        if isinstance(keywords, list):
            keyword_text = " ".join(
                str(item) for item in keywords
            )
        else:
            keyword_text = str(keywords)

        if isinstance(meaning, list):
            meaning_text = " ".join(
                str(item) for item in meaning
            )
        else:
            meaning_text = str(meaning)

        card_text.append(
            f"{name} {keyword_text} "
            f"{meaning_text} {orientation}"
        )

    text = " ".join(card_text).lower()

    strengths = []
    areas_for_development = []
    behavioral_insights = []
    personal_development = []

    # -----------------------------------------
    # INTUITION / REFLECTION
    # -----------------------------------------

    reflective_words = [
        "intuition",
        "intuitive",
        "reflection",
        "inner",
        "wisdom",
        "mystery",
        "spiritual",
        "contemplation",
        "insight"
    ]

    if any(word in text for word in reflective_words):

        strengths.append(
            "The Tarot themes suggest that reflection, "
            "intuition, and inner awareness may be useful strengths."
        )

        behavioral_insights.append(
            "You may naturally spend time considering "
            "your experiences and looking for deeper meaning "
            "before acting."
        )

        personal_development.append(
            "Make space for quiet reflection or journaling "
            "when you need to understand your thoughts and priorities."
        )

    # -----------------------------------------
    # ACTION / CONFIDENCE
    # -----------------------------------------

    action_words = [
        "action",
        "courage",
        "confidence",
        "leadership",
        "initiative",
        "determination",
        "ambition",
        "movement",
        "achievement"
    ]

    if any(word in text for word in action_words):

        strengths.append(
            "The Tarot themes suggest potential for initiative, "
            "determination, and taking purposeful action."
        )

        behavioral_insights.append(
            "You may be inclined to move forward when "
            "you have a clear sense of direction or motivation."
        )

        personal_development.append(
            "Use your drive constructively by combining "
            "action with clear priorities and thoughtful decisions."
        )

    # -----------------------------------------
    # EMOTIONS / RELATIONSHIPS
    # -----------------------------------------

    emotional_words = [
        "emotion",
        "emotional",
        "love",
        "compassion",
        "connection",
        "relationship",
        "feelings",
        "heart",
        "care"
    ]

    if any(word in text for word in emotional_words):

        strengths.append(
            "The Tarot themes highlight emotional awareness "
            "and the importance of meaningful connections."
        )

        behavioral_insights.append(
            "You may place importance on emotional understanding "
            "and the quality of your connections with others."
        )

        personal_development.append(
            "Practice communicating your feelings clearly "
            "while maintaining healthy personal boundaries."
        )

    # -----------------------------------------
    # ANALYSIS / CLARITY
    # -----------------------------------------

    analytical_words = [
        "clarity",
        "truth",
        "logic",
        "reason",
        "analysis",
        "decision",
        "intellect",
        "knowledge",
        "understanding"
    ]

    if any(word in text for word in analytical_words):

        strengths.append(
            "The Tarot themes suggest that clarity, reasoning, "
            "and thoughtful decision-making may be useful strengths."
        )

        behavioral_insights.append(
            "You may prefer understanding a situation clearly "
            "before committing to an important decision."
        )

        personal_development.append(
            "Balance careful analysis with timely action "
            "when important opportunities require a decision."
        )

    # -----------------------------------------
    # CHANGE / ADAPTABILITY
    # -----------------------------------------

    change_words = [
        "change",
        "transformation",
        "transition",
        "new beginning",
        "adapt",
        "cycle",
        "movement",
        "release"
    ]

    if any(word in text for word in change_words):

        strengths.append(
            "The Tarot themes suggest that adaptability "
            "and openness to change may support your development."
        )

        behavioral_insights.append(
            "You may encounter situations where adjusting "
            "your approach becomes important for continued progress."
        )

        personal_development.append(
            "Treat change as an opportunity to review your priorities "
            "and adjust your direction when necessary."
        )

    # -----------------------------------------
    # DEFAULT CONTENT
    # -----------------------------------------

    if not strengths:
        strengths.append(
            "The selected Tarot cards provide themes that can "
            "be used as reflection points for self-awareness "
            "and personal development."
        )

    if not behavioral_insights:
        behavioral_insights.append(
            "The current Tarot themes can be used to reflect "
            "on your thoughts, choices, relationships, and direction."
        )

    if not personal_development:
        personal_development.append(
            "Use the themes from this reading as prompts "
            "for self-reflection rather than fixed predictions."
        )

    # -----------------------------------------
    # AREAS FOR DEVELOPMENT
    # -----------------------------------------

    if "decision" in text or "clarity" in text:
        areas_for_development.append(
            "Give important decisions enough consideration "
            "while avoiding unnecessary overthinking."
        )

    if "change" in text or "transformation" in text:
        areas_for_development.append(
            "Develop flexibility when circumstances change "
            "and avoid becoming overly attached to one approach."
        )

    if "emotion" in text or "relationship" in text:
        areas_for_development.append(
            "Maintain clear emotional communication "
            "and healthy boundaries in important relationships."
        )

    if not areas_for_development:
        areas_for_development.append(
            "Continue developing self-awareness by reflecting "
            "on how the themes of the reading relate to your current situation."
        )

    # -----------------------------------------
    # PERSONAL TENDENCIES
    # -----------------------------------------

    if any(word in text for word in reflective_words):

        decision_style = (
            "You may prefer reflection and intuition "
            "when considering important choices."
        )

    elif any(word in text for word in action_words):

        decision_style = (
            "You may prefer taking purposeful action "
            "once you feel confident about a direction."
        )

    else:

        decision_style = (
            "You may adapt your decision-making approach "
            "according to the situation."
        )

    if any(word in text for word in analytical_words):

        problem_solving_style = (
            "You may prefer understanding the situation clearly "
            "and considering different possibilities."
        )

    elif any(word in text for word in reflective_words):

        problem_solving_style = (
            "You may prefer reflecting on a situation "
            "before choosing a response."
        )

    else:

        problem_solving_style = (
            "You may combine reflection and practical action "
            "when solving problems."
        )

    if any(word in text for word in change_words):

        response_to_challenges = (
            "You may benefit from adapting your approach "
            "when circumstances change."
        )

    else:

        response_to_challenges = (
            "You may prefer understanding a challenge "
            "before deciding how to respond."
        )

    # -----------------------------------------
    # PROFILE
    # -----------------------------------------

    profile = (
        "The selected Tarot cards show themes traditionally "
        "associated with your current reading context. "
        "These themes can be used as reflection points for "
        "understanding your tendencies, choices, relationships, "
        "and personal direction."
    )

    # -----------------------------------------
    # REMOVE DUPLICATES
    # -----------------------------------------

    strengths = list(dict.fromkeys(strengths))[:4]

    areas_for_development = list(
        dict.fromkeys(areas_for_development)
    )[:3]

    behavioral_insights = list(
        dict.fromkeys(behavioral_insights)
    )[:3]

    personal_development = list(
        dict.fromkeys(personal_development)
    )[:3]

    return {
        "profile": profile,
        "strengths": strengths,
        "areas_for_development": areas_for_development,
        "behavioral_insights": behavioral_insights,
        "personal_development": personal_development,
        "personal_tendencies": {
            "decision_style": decision_style,
            "learning_style": (
                "You may learn effectively by reflecting on "
                "experiences and connecting their themes to "
                "your current goals."
            ),
            "problem_solving_style": problem_solving_style,
            "response_to_challenges": response_to_challenges
        }
    }

def _generate_life_trend_analysis(
    palm_analysis,
    tarot_reading=None,
    personality_intelligence=None,
    recommendations=None
):
    """
    Generate Life Trend Analysis from palm and tarot reading data.

    This provides traditional/spiritual reflection themes
    and is not a scientifically validated prediction system.
    """

    life_path = []
    opportunities = []
    challenges = []
    trends = []
    growth_potential = []

    # ---------------------------------------------------------
    # 1. LIFE PATH ANALYSIS
    # ---------------------------------------------------------

    if isinstance(palm_analysis, dict):

        palm_shape_data = palm_analysis.get("palm_shape") or {}
        finger_data = palm_analysis.get("finger_analysis") or {}
        line_data = palm_analysis.get("palm_lines") or {}

    
        # -----------------------------------------------------
        # Palm Shape
        # -----------------------------------------------------

        shape = ""

        if isinstance(palm_shape_data, dict):
            shape = str(
                palm_shape_data.get("palm_shape", "")
            ).strip()

        if shape == "Long Palm":
            life_path.append(
                "The current palm pattern emphasizes exploration, "
                "curiosity, and openness to new experiences."
            )

        elif shape == "Wide Palm":
            life_path.append(
                "The current palm pattern emphasizes practical "
                "action, grounded thinking, and direct engagement "
                "with experiences."
            )

        elif shape == "Balanced Palm":
            life_path.append(
                "The current palm pattern emphasizes balance, "
                "adaptability, and a steady approach to different "
                "experiences."
            )

        # -----------------------------------------------------
        # Palm Lines
        # -----------------------------------------------------

        lines = []

        if isinstance(line_data, dict):
            lines = line_data.get("lines", [])

        if isinstance(lines, list):

            for line in lines:

                if not isinstance(line, dict):
                    continue

                line_name = str(
                    line.get("line", "")
                ).strip().lower()

                length_category = str(
                    line.get("length_category", "")
                ).strip()

                # ---------------------------------------------
                # Life Line
                # ---------------------------------------------

                if "life" in line_name:

                    if length_category == "Long":
                        life_path.append(
                            "The Life Line pattern emphasizes "
                            "an active and engaged approach to "
                            "experiences."
                        )

                    elif length_category == "Short":
                        life_path.append(
                            "The Life Line pattern emphasizes "
                            "a more measured approach to activity "
                            "and change."
                        )

                # ---------------------------------------------
                # Fate Line
                # ---------------------------------------------

                elif "fate" in line_name:

                    if length_category == "Long":
                        life_path.append(
                            "The Fate Line pattern emphasizes "
                            "direction, goals, and a sense of purpose."
                        )

                    elif length_category == "Short":
                        life_path.append(
                            "The Fate Line pattern emphasizes "
                            "flexibility in direction and goals."
                        )

                # ---------------------------------------------
                # Head Line
                # ---------------------------------------------

                elif "head" in line_name:

                    if length_category == "Long":
                        life_path.append(
                            "The Head Line pattern emphasizes "
                            "deeper exploration of ideas and "
                            "thoughtful decision-making."
                        )

                    elif length_category == "Short":
                        life_path.append(
                            "The Head Line pattern emphasizes "
                            "direct thinking and practical action."
                        )
    # ---------------------------------------------------------
    # Tarot themes for Life Path
    # ---------------------------------------------------------

    if isinstance(tarot_reading, dict):

        cards = tarot_reading.get("cards", [])

        if isinstance(cards, list):

            for card in cards:

                if not isinstance(card, dict):
                    continue

                name = str(
                    card.get("name", "Unknown card")
                ).strip()

                keywords = card.get("keywords", [])
                meanings = card.get("meaning", [])
                orientation = str(
                    card.get("orientation", "")
                ).strip().lower()

                if not isinstance(keywords, list):
                    keywords = [str(keywords)]

                if not isinstance(meanings, list):
                    meanings = [str(meanings)]

                keywords_text = " ".join(
                    str(item).lower()
                    for item in keywords
                )

                meanings_text = " ".join(
                    str(item).lower()
                    for item in meanings
                )

                card_text = (
                    f"{name.lower()} "
                    f"{keywords_text} "
                    f"{meanings_text}"
                )

                if any(
                    word in card_text
                    for word in [
                        "growth",
                        "learning",
                        "knowledge",
                        "wisdom",
                        "development"
                    ]
                ):
                    life_path.append(
                        f"{name} highlights themes of learning, "
                        "growth, and personal development within "
                        "the current life journey."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "inspiration",
                        "vision",
                        "creation",
                        "creativity",
                        "invention",
                        "desire"
                    ]
                ):
                    life_path.append(
                        f"{name} highlights themes of inspiration, "
                        "creativity, and exploring meaningful goals "
                        "within the current life journey."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "choice",
                        "choices",
                        "possibility",
                        "possibilities",
                        "decision",
                        "direction",
                        "quest",
                        "departure"
                    ]
                ):
                    life_path.append(
                        f"{name} highlights themes of choices, "
                        "direction, and exploring different paths "
                        "within the current life journey."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "change",
                        "transition",
                        "transformation",
                        "new beginning",
                        "new beginnings"
                    ]
                ):
                    life_path.append(
                        f"{name} introduces a theme of change "
                        "or transition within the current life journey."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "focus",
                        "realism",
                        "practicality",
                        "responsibility"
                    ]
                ):
                    life_path.append(
                        f"{name} highlights themes of focus, "
                        "practical thinking, and purposeful progress "
                        "within the current life journey."
                    )

                elif orientation == "reversed":
                    life_path.append(
                        f"{name} appears reversed and can be used "
                        "as a reflection point for greater awareness "
                        "and personal development."
                    )

                else:
                    life_path.append(
                        f"{name} contributes a theme for reflection "
                        "within the current life journey."
                    )
    # ---------------------------------------------------------
    # Finger structure themes for Life Path
    # ---------------------------------------------------------

    if isinstance(palm_analysis, dict):

        finger_data = palm_analysis.get("finger_analysis") or {}

        if isinstance(finger_data, dict):

            average_finger = finger_data.get("average_finger")

            try:
                average_finger = float(average_finger)
            except (TypeError, ValueError):
                average_finger = None

            if average_finger is not None:

                if average_finger <= 1.6:
                    life_path.append(
                        "The finger structure reflects a more "
                        "direct and action-oriented approach to "
                        "experiences."
                    )

                elif average_finger >= 1.8:
                    life_path.append(
                        "The finger structure reflects a more "
                        "reflective and detail-oriented approach "
                        "to experiences."
                    )

                else:
                    life_path.append(
                        "The finger structure reflects a balanced "
                        "approach between direct action and "
                        "reflection."
                    )
    # ---------------------------------------------------------
    # Personality themes for Life Path
    # ---------------------------------------------------------

    if isinstance(personality_intelligence, dict):

        profile = personality_intelligence.get("profile", "")
        strengths = personality_intelligence.get("strengths", [])

        if isinstance(profile, str) and profile.strip():
            life_path.append(
                "The personality profile suggests a life path "
                "that can be explored through self-awareness "
                "and personal development."
            )

        if isinstance(strengths, list):

            for strength in strengths[:2]:

                if isinstance(strength, str) and strength.strip():
                    life_path.append(
                        f"A personal strength to carry forward "
                        f"is: {strength}"
                    )
    # ---------------------------------------------------------
    # Life Path fallback
    # ---------------------------------------------------------
    if not life_path:
        life_path.append(
            "The available reading data does not provide enough "
            "patterns for a detailed life path reflection. "
            "The current reading can be used as a starting point "
            "for self-reflection and personal development."
        )

    # ---------------------------------------------------------
    # 2. OPPORTUNITY IDENTIFICATION
    # ---------------------------------------------------------
    if isinstance(palm_analysis, dict):

        palm_shape_data = palm_analysis.get("palm_shape") or {}

        if isinstance(palm_shape_data, dict):

            shape = str(
                palm_shape_data.get("palm_shape", "")
            ).strip()

            if shape == "Long Palm":
                opportunities.append(
                    "The current palm pattern can be used as a "
                    "reflection point for opportunities involving "
                    "learning, creativity, exploration, and discovering "
                    "new ideas."
                )

            elif shape == "Wide Palm":
                opportunities.append(
                    "The current palm pattern can be used as a "
                    "reflection point for opportunities involving "
                    "practical work, execution, stability, and "
                    "tangible results."
                )

            elif shape == "Balanced Palm":
                opportunities.append(
                    "The current palm pattern can be used as a "
                    "reflection point for opportunities involving "
                    "adaptability, collaboration, and different "
                    "types of responsibilities."
                )

        # ---------------------------------------------------------
        # Head Line opportunities
        # ---------------------------------------------------------

        if isinstance(palm_analysis, dict):

            line_data = palm_analysis.get("palm_lines") or {}

            if isinstance(line_data, dict):

                lines = line_data.get("lines", [])

                if isinstance(lines, list):

                    for line in lines:

                        if not isinstance(line, dict):
                            continue

                        line_name = str(
                            line.get("line", "")
                        ).strip().lower()

                        if "head" not in line_name:
                            continue

                        length_category = str(
                            line.get("length_category", "")
                        ).strip()

                        if length_category == "Long":
                            opportunities.append(
                                "The Head Line pattern can be used as a "
                                "reflection point for opportunities involving "
                                "analysis, planning, research, and exploring "
                                "complex ideas."
                            )

                        elif length_category == "Short":
                            opportunities.append(
                                "The Head Line pattern can be used as a "
                                "reflection point for opportunities involving "
                                "practical problem-solving, quick decisions, "
                                "and learning through action."
                            )

                        break
        # ---------------------------------------------------------
        # Fate Line opportunities
        # ---------------------------------------------------------

        if isinstance(palm_analysis, dict):

            line_data = palm_analysis.get("palm_lines") or {}

            if isinstance(line_data, dict):

                lines = line_data.get("lines", [])

                if isinstance(lines, list):

                    for line in lines:

                        if not isinstance(line, dict):
                            continue

                        line_name = str(
                            line.get("line", "")
                        ).strip().lower()

                        if "fate" not in line_name:
                            continue

                        length_category = str(
                            line.get("length_category", "")
                        ).strip()

                        if length_category == "Long":
                            opportunities.append(
                                "The Fate Line pattern can be used as a "
                                "reflection point for opportunities involving "
                                "clear goals, long-term direction, and purposeful "
                                "development."
                            )

                        elif length_category == "Short":
                            opportunities.append(
                                "The Fate Line pattern can be used as a "
                                "reflection point for opportunities that allow "
                                "flexibility and adjustment as interests or "
                                "circumstances change."
                            )

                        break
        # ---------------------------------------------------------
        # Finger structure opportunities
        # ---------------------------------------------------------

        if isinstance(palm_analysis, dict):

            finger_data = palm_analysis.get("finger_analysis") or {}

            if isinstance(finger_data, dict):

                average_finger = finger_data.get("average_finger")

                try:
                    average_finger = float(average_finger)
                except (TypeError, ValueError):
                    average_finger = None

                if average_finger is not None:

                    if average_finger <= 1.6:
                        opportunities.append(
                            "The finger structure can be used as a "
                            "reflection point for opportunities where "
                            "initiative, direct action, and execution "
                            "are important."
                        )

                    elif average_finger >= 1.8:
                        opportunities.append(
                            "The finger structure can be used as a "
                            "reflection point for opportunities involving "
                            "careful analysis, planning, and attention "
                            "to detail."
                        )

                    else:
                        opportunities.append(
                            "The finger structure can be used as a "
                            "reflection point for opportunities that "
                            "combine action with thoughtful planning."
                        )
    # ---------------------------------------------------------
    # Tarot opportunities
    # ---------------------------------------------------------

    if isinstance(tarot_reading, dict):

        cards = tarot_reading.get("cards", [])

        if isinstance(cards, list):

            for card in cards:

                if not isinstance(card, dict):
                    continue

                name = str(
                    card.get("name", "Unknown card")
                ).strip()

                keywords = card.get("keywords", [])
                meanings = card.get("meaning", [])

                if not isinstance(keywords, list):
                    keywords = [str(keywords)]

                if not isinstance(meanings, list):
                    meanings = [str(meanings)]

                keywords_text = " ".join(
                    str(item).lower()
                    for item in keywords
                )

                meanings_text = " ".join(
                    str(item).lower()
                    for item in meanings
                )

                card_text = (
                    f"{name.lower()} "
                    f"{keywords_text} "
                    f"{meanings_text}"
                )

                if any(
                    word in card_text
                    for word in [
                        "growth",
                        "learning",
                        "wisdom",
                        "knowledge",
                        "creativity",
                        "creation",
                        "invention",
                        "inspiration",
                        "development"
                    ]
                ):
                    opportunities.append(
                        f"{name} highlights an opportunity for "
                        "learning, creativity, exploration, or personal development."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "opportunity",
                        "possibility",
                        "possibilities",
                        "choice",
                        "choices",
                        "decision",
                        "goal",
                        "vision",
                        "direction"
                    ]
                ):
                    opportunities.append(
                        f"{name} highlights an opportunity to "
                        "consider new possibilities, goals, or directions."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "change",
                        "transition",
                        "transformation",
                        "new beginning",
                        "renewal"
                    ]
                ):
                    opportunities.append(
                        f"{name} highlights an opportunity to "
                        "adapt to change and explore a new direction."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "relationship",
                        "connection",
                        "partnership",
                        "support"
                    ]
                ):
                    opportunities.append(
                        f"{name} highlights opportunities involving "
                        "relationships, cooperation, or meaningful connections."
                    )

                else:
                    opportunities.append(
                        f"{name} can be used as a reflection point for "
                        "exploring possibilities and personal development."
                    )
        # ---------------------------------------------------------
        # Opportunity fallback
        # ---------------------------------------------------------

        if not opportunities:
            opportunities.append(
                "The available reading can be used as a reflection "
                "point for exploring personal development, learning, "
                "and new possibilities."
            )
    # ---------------------------------------------------------
    # 3. CHALLENGE FORECASTING
    # ---------------------------------------------------------

    if isinstance(palm_analysis, dict):

        palm_shape_data = palm_analysis.get("palm_shape") or {}

        if isinstance(palm_shape_data, dict):

            shape = str(
                palm_shape_data.get("palm_shape", "")
            ).strip()

            if shape == "Long Palm":
                challenges.append(
                    "A highly exploratory pattern may create a "
                    "tendency to consider many possibilities at once. "
                    "Choosing clear priorities may help maintain "
                    "consistent progress."
                )

            elif shape == "Wide Palm":
                challenges.append(
                    "A strongly practical pattern may encourage "
                    "focus on immediate action. Making time for "
                    "reflection can help when situations require "
                    "careful consideration."
                )

            elif shape == "Balanced Palm":
                challenges.append(
                    "An adaptable pattern may make it easier to "
                    "adjust to different situations, but maintaining "
                    "clear priorities can help avoid unnecessary "
                    "changes in direction."
                )
        # ---------------------------------------------------------
        # Head Line challenges
        # ---------------------------------------------------------

        if isinstance(palm_analysis, dict):

            line_data = palm_analysis.get("palm_lines") or {}

            if isinstance(line_data, dict):

                lines = line_data.get("lines", [])

                if isinstance(lines, list):

                    for line in lines:

                        if not isinstance(line, dict):
                            continue

                        line_name = str(
                            line.get("line", "")
                        ).strip().lower()

                        if "head" not in line_name:
                            continue

                        length_category = str(
                            line.get("length_category", "")
                        ).strip()

                        if length_category == "Long":
                            challenges.append(
                                "A strong focus on analysis and detailed "
                                "thinking may sometimes lead to spending "
                                "too much time evaluating possibilities. "
                                "Balancing analysis with timely action "
                                "may be useful."
                            )

                        elif length_category == "Short":
                            challenges.append(
                                "A direct thinking pattern may encourage "
                                "quick decisions. Taking additional time "
                                "to consider important alternatives may "
                                "be useful in complex situations."
                            )

                        break
        # ---------------------------------------------------------
        # Fate Line challenges
        # ---------------------------------------------------------

        if isinstance(palm_analysis, dict):

            line_data = palm_analysis.get("palm_lines") or {}

            if isinstance(line_data, dict):

                lines = line_data.get("lines", [])

                if isinstance(lines, list):

                    for line in lines:

                        if not isinstance(line, dict):
                            continue

                        line_name = str(
                            line.get("line", "")
                        ).strip().lower()

                        if "fate" not in line_name:
                            continue

                        length_category = str(
                            line.get("length_category", "")
                        ).strip()

                        if length_category == "Long":
                            challenges.append(
                                "A strong sense of direction may sometimes "
                                "create pressure to follow a fixed path. "
                                "Allowing room to adjust goals when needed "
                                "may help maintain flexibility."
                            )

                        elif length_category == "Short":
                            challenges.append(
                                "A less prominent direction pattern may "
                                "reflect periods of uncertainty about goals. "
                                "Setting smaller, flexible goals may help "
                                "create a clearer sense of direction."
                            )

                        break
        # ---------------------------------------------------------
        # Finger structure challenges
        # ---------------------------------------------------------

        if isinstance(palm_analysis, dict):

            finger_data = palm_analysis.get("finger_analysis") or {}

            if isinstance(finger_data, dict):

                average_finger = finger_data.get("average_finger")

                try:
                    average_finger = float(average_finger)
                except (TypeError, ValueError):
                    average_finger = None

                if average_finger is not None:

                    if average_finger <= 1.6:
                        challenges.append(
                            "A direct and action-oriented pattern may "
                            "sometimes encourage quick decisions. "
                            "Considering important alternatives before "
                            "acting may help."
                        )

                    elif average_finger >= 1.8:
                        challenges.append(
                            "A reflective and detail-oriented pattern may "
                            "sometimes lead to extended analysis. "
                            "Setting reasonable decision timeframes may "
                            "help maintain forward progress."
                        )

                    else:
                        challenges.append(
                            "A balanced pattern may support flexibility, "
                            "while maintaining clear priorities can help "
                            "when several options are available."
                        )
    # ---------------------------------------------------------
    # Tarot challenges
    # ---------------------------------------------------------

    if isinstance(tarot_reading, dict):

        cards = tarot_reading.get("cards", [])

        if isinstance(cards, list):

            for card in cards:

                if not isinstance(card, dict):
                    continue

                name = str(
                    card.get("name", "Unknown card")
                ).strip()

                keywords = card.get("keywords", [])
                meanings = card.get("meaning", [])
                orientation = str(
                    card.get("orientation", "")
                ).strip().lower()

                if not isinstance(keywords, list):
                    keywords = [str(keywords)]

                if not isinstance(meanings, list):
                    meanings = [str(meanings)]

                keywords_text = " ".join(
                    str(item).lower()
                    for item in keywords
                )

                meanings_text = " ".join(
                    str(item).lower()
                    for item in meanings
                )

                card_text = (
                    f"{name.lower()} "
                    f"{keywords_text} "
                    f"{meanings_text}"
                )

                if any(
                    word in card_text
                    for word in [
                        "challenge",
                        "difficulty",
                        "conflict",
                        "uncertainty",
                        "obstacle",
                        "struggle",
                        "fear",
                        "loss",
                        "misguiding",
                        "dogmatic",
                        "misdeed",
                        "restricting"
                    ]
                ):
                    challenges.append(
                        f"{name} highlights a theme that may "
                        "require greater awareness, patience, and thoughtful response."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "careless",
                        "carelessly",
                        "immature",
                        "today",
                        "no thought of tomorrow",
                        "excuse"
                    ]
                ):
                    challenges.append(
                        f"{name} highlights a reflection point around "
                        "responsibility, maturity, and long-term thinking."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "choice",
                        "choices",
                        "decision",
                        "dilemma",
                        "goal",
                        "direction"
                    ]
                ):
                    challenges.append(
                        f"{name} suggests paying careful attention to "
                        "choices, goals, and decisions."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "change",
                        "transition",
                        "transformation",
                        "new beginning"
                    ]
                ):
                    challenges.append(
                        f"{name} highlights that adapting to change "
                        "may require flexibility and self-awareness."
                    )

                elif orientation == "reversed":
                    challenges.append(
                        f"{name} appears reversed and can be used as "
                        "a reflection point for areas that may need greater awareness or balance."
                    )

                else:
                    challenges.append(
                        f"{name} can be used as a reflection point for "
                        "recognizing possible challenges and responding thoughtfully."
                    )
        # ---------------------------------------------------------
        # Challenge fallback
        # ---------------------------------------------------------

        if not challenges:
            challenges.append(
                "The available reading does not highlight a specific "
                "challenge theme. General self-reflection and awareness "
                "can help when navigating future situations."
            )
    # ---------------------------------------------------------
    # 4. TREND MONITORING
    # ---------------------------------------------------------

    if isinstance(palm_analysis, dict):

        palm_shape_data = palm_analysis.get("palm_shape") or {}

        if isinstance(palm_shape_data, dict):

            shape = str(
                palm_shape_data.get("palm_shape", "")
            ).strip()

            if shape == "Long Palm":
                trends.append(
                    "A recurring theme in the current reading is "
                    "exploration, curiosity, and openness to new ideas."
                )

            elif shape == "Wide Palm":
                trends.append(
                    "A recurring theme in the current reading is "
                    "practical action, stability, and focus on tangible results."
                )

            elif shape == "Balanced Palm":
                trends.append(
                    "A recurring theme in the current reading is "
                    "adaptability, balance, and adjusting to different situations."
                )
        # ---------------------------------------------------------
        # Palm Line trends
        # ---------------------------------------------------------

        if isinstance(palm_analysis, dict):

            line_data = palm_analysis.get("palm_lines") or {}

            if isinstance(line_data, dict):

                lines = line_data.get("lines", [])

                if isinstance(lines, list):

                    for line in lines:

                        if not isinstance(line, dict):
                            continue

                        line_name = str(
                            line.get("line", "")
                        ).strip().lower()

                        length_category = str(
                            line.get("length_category", "")
                        ).strip()

                        if "life" in line_name:

                            if length_category == "Long":
                                trends.append(
                                    "The Life Line pattern contributes a "
                                    "recurring theme of active engagement "
                                    "and continued involvement with experiences."
                                )

                            elif length_category == "Short":
                                trends.append(
                                    "The Life Line pattern contributes a "
                                    "recurring theme of measured pacing "
                                    "and careful management of activity."
                                )

                        elif "head" in line_name:

                            if length_category == "Long":
                                trends.append(
                                    "The Head Line pattern contributes a "
                                    "recurring theme of analysis, deeper "
                                    "thinking, and consideration of ideas."
                                )

                            elif length_category == "Short":
                                trends.append(
                                    "The Head Line pattern contributes a "
                                    "recurring theme of direct thinking "
                                    "and practical decision-making."
                                )

                        elif "fate" in line_name:

                            if length_category == "Long":
                                trends.append(
                                    "The Fate Line pattern contributes a "
                                    "recurring theme of direction, goals, "
                                    "and purposeful development."
                                )

                            elif length_category == "Short":
                                trends.append(
                                    "The Fate Line pattern contributes a "
                                    "recurring theme of flexibility in "
                                    "direction and goals."
                                )
        # ---------------------------------------------------------
        # Finger structure trends
        # ---------------------------------------------------------

        if isinstance(palm_analysis, dict):

            finger_data = palm_analysis.get("finger_analysis") or {}

            if isinstance(finger_data, dict):

                average_finger = finger_data.get("average_finger")

                try:
                    average_finger = float(average_finger)
                except (TypeError, ValueError):
                    average_finger = None

                if average_finger is not None:

                    if average_finger <= 1.6:
                        trends.append(
                            "The finger structure contributes a recurring "
                            "theme of directness, action, and practical "
                            "engagement."
                        )

                    elif average_finger >= 1.8:
                        trends.append(
                            "The finger structure contributes a recurring "
                            "theme of reflection, patience, and attention "
                            "to detail."
                        )

                    else:
                        trends.append(
                            "The finger structure contributes a recurring "
                            "theme of balance between action and reflection."
                        )
    # ---------------------------------------------------------
    # Tarot trends
    # ---------------------------------------------------------

    if isinstance(tarot_reading, dict):

        cards = tarot_reading.get("cards", [])

        if isinstance(cards, list):

            for card in cards:

                if not isinstance(card, dict):
                    continue

                name = str(
                    card.get("name", "Unknown card")
                ).strip()

                keywords = card.get("keywords", [])
                meanings = card.get("meaning", [])
                orientation = str(
                    card.get("orientation", "")
                ).strip().lower()

                if not isinstance(keywords, list):
                    keywords = [str(keywords)]

                if not isinstance(meanings, list):
                    meanings = [str(meanings)]

                keywords_text = " ".join(
                    str(item).lower()
                    for item in keywords
                )

                meanings_text = " ".join(
                    str(item).lower()
                    for item in meanings
                )

                card_text = (
                    f"{name.lower()} "
                    f"{keywords_text} "
                    f"{meanings_text}"
                )

                if any(
                    word in card_text
                    for word in [
                        "growth",
                        "learning",
                        "wisdom",
                        "knowledge",
                        "reflection",
                        "development"
                    ]
                ):
                    trends.append(
                        f"{name} highlights an ongoing theme of "
                        "learning, reflection, and personal development."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "inspiration",
                        "vision",
                        "creation",
                        "creativity",
                        "invention",
                        "desire"
                    ]
                ):
                    trends.append(
                        f"{name} highlights a developing theme of "
                        "creativity, motivation, and new ideas."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "choice",
                        "choices",
                        "possibility",
                        "possibilities",
                        "decision",
                        "goal",
                        "direction"
                    ]
                ):
                    trends.append(
                        f"{name} highlights a developing theme around "
                        "choices, goals, and personal direction."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "change",
                        "transition",
                        "transformation",
                        "new beginning",
                        "renewal"
                    ]
                ):
                    trends.append(
                        f"{name} highlights a possible theme of "
                        "change and adaptation."
                    )

                elif orientation == "reversed":
                    trends.append(
                        f"{name} appears reversed and can be viewed as "
                        "a reflection point for an area requiring awareness or balance."
                    )

                else:
                    trends.append(
                        f"{name} contributes a theme for reflection "
                        "within the current personal journey."
                    )
        # ---------------------------------------------------------
        # Trend Monitoring fallback
        # ---------------------------------------------------------

        if not trends:
            trends.append(
                "The available reading does not show a strong recurring "
                "theme. The current results can still be used as a "
                "reflection point for observing patterns over time."
            )
    # ---------------------------------------------------------
    # 5. GROWTH POTENTIAL ASSESSMENT
    # ---------------------------------------------------------

    if isinstance(palm_analysis, dict):

        palm_shape_data = palm_analysis.get("palm_shape") or {}

        if isinstance(palm_shape_data, dict):

            shape = str(
                palm_shape_data.get("palm_shape", "")
            ).strip()

            if shape == "Long Palm":
                growth_potential.append(
                    "The current palm pattern can be used as a "
                    "reflection point for developing curiosity, "
                    "creativity, learning, and turning exploration "
                    "into focused progress."
                )

            elif shape == "Wide Palm":
                growth_potential.append(
                    "The current palm pattern can be used as a "
                    "reflection point for developing practical "
                    "execution, consistency, and grounded decision-making."
                )

            elif shape == "Balanced Palm":
                growth_potential.append(
                    "The current palm pattern can be used as a "
                    "reflection point for developing adaptability "
                    "while maintaining clear priorities and balance."
                )
        # ---------------------------------------------------------
        # Head Line growth potential
        # ---------------------------------------------------------

        if isinstance(palm_analysis, dict):

            line_data = palm_analysis.get("palm_lines") or {}

            if isinstance(line_data, dict):

                lines = line_data.get("lines", [])

                if isinstance(lines, list):

                    for line in lines:

                        if not isinstance(line, dict):
                            continue

                        line_name = str(
                            line.get("line", "")
                        ).strip().lower()

                        if "head" not in line_name:
                            continue

                        length_category = str(
                            line.get("length_category", "")
                        ).strip()

                        if length_category == "Long":
                            growth_potential.append(
                                "The Head Line pattern can be used as a "
                                "reflection point for developing deeper "
                                "analysis while also turning ideas into "
                                "practical progress."
                            )

                        elif length_category == "Short":
                            growth_potential.append(
                                "The Head Line pattern can be used as a "
                                "reflection point for developing thoughtful "
                                "decision-making while maintaining practical "
                                "action."
                            )

                        break
        # ---------------------------------------------------------
        # Fate Line growth potential
        # ---------------------------------------------------------

        if isinstance(palm_analysis, dict):

            line_data = palm_analysis.get("palm_lines") or {}

            if isinstance(line_data, dict):

                lines = line_data.get("lines", [])

                if isinstance(lines, list):

                    for line in lines:

                        if not isinstance(line, dict):
                            continue

                        line_name = str(
                            line.get("line", "")
                        ).strip().lower()

                        if "fate" not in line_name:
                            continue

                        length_category = str(
                            line.get("length_category", "")
                        ).strip()

                        if length_category == "Long":
                            growth_potential.append(
                                "The Fate Line pattern can be used as a "
                                "reflection point for developing clearer "
                                "goals, consistency, and commitment toward "
                                "chosen directions."
                            )

                        elif length_category == "Short":
                            growth_potential.append(
                                "The Fate Line pattern can be used as a "
                                "reflection point for developing flexibility "
                                "while maintaining a clear sense of direction "
                                "and personal priorities."
                            )

                        break
        # ---------------------------------------------------------
        # Finger Structure growth potential
        # ---------------------------------------------------------

        if isinstance(palm_analysis, dict):

            finger_data = palm_analysis.get("finger_analysis") or {}

            if isinstance(finger_data, dict):

                average_finger = finger_data.get("average_finger")

                try:
                    average_finger = float(average_finger)
                except (TypeError, ValueError):
                    average_finger = None

                if average_finger is not None:

                    if average_finger <= 1.6:
                        growth_potential.append(
                            "The current finger structure can be used as a "
                            "reflection point for developing patience, "
                            "planning, and thoughtful consideration before "
                            "taking action."
                        )

                    elif average_finger >= 1.8:
                        growth_potential.append(
                            "The current finger structure can be used as a "
                            "reflection point for developing practical action, "
                            "decisiveness, and translating detailed thinking "
                            "into consistent progress."
                        )

                    else:
                        growth_potential.append(
                            "The current finger structure can be used as a "
                            "reflection point for maintaining a balance between "
                            "thoughtful planning and practical action."
                        )
    # ---------------------------------------------------------
    # Tarot growth potential
    # ---------------------------------------------------------

    if isinstance(tarot_reading, dict):

        cards = tarot_reading.get("cards", [])

        if isinstance(cards, list):

            for card in cards:

                if not isinstance(card, dict):
                    continue

                name = str(
                    card.get("name", "Unknown card")
                ).strip()

                keywords = card.get("keywords", [])
                meanings = card.get("meaning", [])
                orientation = str(
                    card.get("orientation", "")
                ).strip().lower()

                if not isinstance(keywords, list):
                    keywords = [str(keywords)]

                if not isinstance(meanings, list):
                    meanings = [str(meanings)]

                keywords_text = " ".join(
                    str(item).lower()
                    for item in keywords
                )

                meanings_text = " ".join(
                    str(item).lower()
                    for item in meanings
                )

                card_text = (
                    f"{name.lower()} "
                    f"{keywords_text} "
                    f"{meanings_text}"
                )

                if any(
                    word in card_text
                    for word in [
                        "growth",
                        "learning",
                        "knowledge",
                        "wisdom",
                        "development",
                        "skill"
                    ]
                ):
                    growth_potential.append(
                        f"{name} highlights potential for "
                        "learning, growth, and continued personal development."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "inspiration",
                        "creativity",
                        "creation",
                        "invention",
                        "vision",
                        "desire"
                    ]
                ):
                    growth_potential.append(
                        f"{name} highlights potential for "
                        "creative exploration, motivation, and new ideas."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "guidance",
                        "direction",
                        "goal",
                        "vision",
                        "revelation"
                    ]
                ):
                    growth_potential.append(
                        f"{name} highlights potential for "
                        "greater clarity, direction, and self-awareness."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "prosperity",
                        "practicality",
                        "opportunity",
                        "success"
                    ]
                ):
                    growth_potential.append(
                        f"{name} highlights potential for "
                        "practical development and progress toward goals."
                    )

                elif any(
                    word in card_text
                    for word in [
                        "change",
                        "transition",
                        "transformation",
                        "new beginning",
                        "renewal"
                    ]
                ):
                    growth_potential.append(
                        f"{name} highlights potential for "
                        "growth through adaptation and change."
                    )

                elif orientation == "reversed":
                    growth_potential.append(
                        f"{name} appears reversed and can be used as "
                        "a reflection point for an area where greater awareness "
                        "may support personal growth."
                    )

                else:
                    growth_potential.append(
                        f"{name} can be used as a reflection point for "
                        "identifying areas of personal growth."
                    )
        # ---------------------------------------------------------
        # Growth potential fallback
        # ---------------------------------------------------------

        if not growth_potential:
            growth_potential.append(
                "The current reading can be used as a reflection point "
                "for self-awareness, personal development, and identifying "
                "areas for continued growth."
            )

    # ---------------------------------------------------------
    # 6. LIFE TREND VISUAL SCORES
    # ---------------------------------------------------------

    life_path_score = 50
    opportunities_score = 50
    challenges_score = 50
    trends_score = 50
    growth_score = 50

    # Palm shape
    palm_shape_data = {}

    if isinstance(palm_analysis, dict):
        palm_shape_data = palm_analysis.get("palm_shape") or {}

    if isinstance(palm_shape_data, dict):
        shape = str(
            palm_shape_data.get("palm_shape", "")
        ).strip()

        if shape == "Long Palm":
            life_path_score += 10
            opportunities_score += 10
            trends_score += 5
            growth_score += 10
            challenges_score += 5

        elif shape == "Wide Palm":
            life_path_score += 5
            opportunities_score += 5
            challenges_score += 5
            trends_score += 10
            growth_score += 5

        elif shape == "Balanced Palm":
            life_path_score += 8
            opportunities_score += 8
            challenges_score += 2
            trends_score += 8
            growth_score += 8


    # Palm line data
    line_data = {}

    if isinstance(palm_analysis, dict):
        line_data = palm_analysis.get("palm_lines") or {}

    if isinstance(line_data, dict):
        lines = line_data.get("lines", [])

        if isinstance(lines, list):
            for line in lines:

                if not isinstance(line, dict):
                    continue

                line_name = str(
                    line.get("line", "")
                ).strip().lower()

                length_category = str(
                    line.get("length_category", "")
                ).strip()

                if "life" in line_name:

                    if length_category == "Long":
                        life_path_score += 8
                        trends_score += 6
                        growth_score += 6

                    elif length_category == "Short":
                        challenges_score += 6

                elif "head" in line_name:

                    if length_category == "Long":
                        life_path_score += 6
                        opportunities_score += 6
                        growth_score += 6

                    elif length_category == "Short":
                        opportunities_score += 4
                        challenges_score += 5

                elif "heart" in line_name:

                    if length_category == "Long":
                        opportunities_score += 5
                        trends_score += 5

                    elif length_category == "Short":
                        challenges_score += 5

                elif "fate" in line_name:

                    if length_category == "Long":
                        life_path_score += 8
                        trends_score += 8
                        growth_score += 8

                    elif length_category == "Short":
                        opportunities_score += 4
                        challenges_score += 4


    # Finger structure
    finger_data = {}

    if isinstance(palm_analysis, dict):
        finger_data = palm_analysis.get("finger_analysis") or {}

    if isinstance(finger_data, dict):

        average_finger = finger_data.get("average_finger")

        try:
            average_finger = float(average_finger)
        except (TypeError, ValueError):
            average_finger = None

        if average_finger is not None:

            if average_finger <= 1.6:
                opportunities_score += 5
                challenges_score += 4

            elif average_finger >= 1.8:
                life_path_score += 5
                growth_score += 5
                challenges_score += 3

            else:
                trends_score += 5
                growth_score += 4


    # Keep scores inside 0-100
    life_path_score = max(0, min(100, life_path_score))
    opportunities_score = max(0, min(100, opportunities_score))
    challenges_score = max(0, min(100, challenges_score))
    trends_score = max(0, min(100, trends_score))
    growth_score = max(0, min(100, growth_score))


    trend_scores = {
        "life_path": life_path_score,
        "opportunities": opportunities_score,
        "challenges": challenges_score,
        "trends": trends_score,
        "growth_potential": growth_score
    }


    return {
        "life_path": life_path,
        "opportunities": opportunities,
        "challenges": challenges,
        "trends": trends,
        "growth_potential": growth_potential,
        "trend_scores": trend_scores
    }

def _calculate_spiritual_guidance_score(
    palm_analysis=None,
    tarot_reading=None,
    tarot_intention=None,
    tarot_question=None,
    personality_intelligence=None,
    combined_insights=None
):
    """
    Calculate the Spiritual Guidance Score using the mentor-defined
    weighted model.

    Weights:
    - Palm Analysis Confidence: 30%
    - Tarot Interpretation Relevance: 25%
    - Personality Alignment: 20%
    - User Context Relevance: 15%
    - Reading Consistency: 10%
    """

    # ----------------------------------------------------------
    # 1. PALM ANALYSIS CONFIDENCE - 30%
    # ----------------------------------------------------------

    palm_confidences = []

    if isinstance(palm_analysis, dict):

        palm_lines = palm_analysis.get("palm_lines") or {}
        lines = palm_lines.get("lines") or []

        if isinstance(lines, list):

            for line in lines:

                if not isinstance(line, dict):
                    continue

                confidence = line.get("confidence")

                try:
                    confidence = float(confidence)

                    if 0 <= confidence <= 1:
                        palm_confidences.append(confidence * 100)
                    elif 0 <= confidence <= 100:
                        palm_confidences.append(confidence)

                except (TypeError, ValueError):
                    pass

    if palm_confidences:
        palm_confidence_score = sum(palm_confidences) / len(palm_confidences)
    elif palm_analysis:
        palm_confidence_score = 50.0
    else:
        palm_confidence_score = 0.0


    # ----------------------------------------------------------
    # 2. TAROT INTERPRETATION RELEVANCE - 25%
    # ----------------------------------------------------------

    tarot_relevance_score = 0.0

    if isinstance(tarot_reading, dict):

        cards = tarot_reading.get("cards") or []

        if isinstance(cards, list) and cards:

            tarot_relevance_score = 60.0

            if tarot_intention or tarot_question:

                context_text = " ".join([
                    str(tarot_intention or ""),
                    str(tarot_question or "")
                ]).lower()

                matching_cards = 0

                for card in cards:

                    if not isinstance(card, dict):
                        continue

                    keywords = card.get("keywords") or []
                    meanings = card.get("meaning") or []

                    if not isinstance(keywords, list):
                        keywords = [keywords]

                    if not isinstance(meanings, list):
                        meanings = [meanings]

                    card_text = " ".join(
                        str(item).lower()
                        for item in keywords + meanings
                    )

                    context_words = [
                        word for word in context_text.split()
                        if len(word) > 3
                    ]

                    if any(word in card_text for word in context_words):
                        matching_cards += 1

                if matching_cards > 0:
                    match_ratio = matching_cards / len(cards)
                    tarot_relevance_score = min(
                        100.0,
                        60.0 + (match_ratio * 40.0)
                    )


    # ----------------------------------------------------------
    # 3. PERSONALITY ALIGNMENT - 20%
    # ----------------------------------------------------------

    personality_alignment_score = 0.0

    if personality_intelligence:

        personality_alignment_score = 70.0

        if isinstance(personality_intelligence, dict):

            strengths = personality_intelligence.get("strengths") or []
            behavioral = personality_intelligence.get("behavioral_insights") or []
            development = personality_intelligence.get("areas_for_development") or []

            evidence_count = (
                len(strengths)
                + len(behavioral)
                + len(development)
            )

            if evidence_count >= 5:
                personality_alignment_score = 90.0
            elif evidence_count >= 3:
                personality_alignment_score = 80.0


    # ----------------------------------------------------------
    # 4. USER CONTEXT RELEVANCE - 15%
    # ----------------------------------------------------------

    user_context_score = 0.0

    context_available = bool(
        tarot_intention or
        tarot_question
    )

    if context_available:

        user_context_score = 70.0

        context_length = len(
            str(tarot_intention or "") +
            str(tarot_question or "")
        )

        if context_length >= 20:
            user_context_score = 85.0

        if context_length >= 50:
            user_context_score = 95.0


    # ----------------------------------------------------------
    # 5. READING CONSISTENCY - 10%
    # ----------------------------------------------------------

    reading_consistency_score = 0.0

    if combined_insights:

        insight_count = len(combined_insights)

        if insight_count >= 8:
            reading_consistency_score = 90.0
        elif insight_count >= 5:
            reading_consistency_score = 80.0
        elif insight_count >= 3:
            reading_consistency_score = 70.0
        elif insight_count > 0:
            reading_consistency_score = 60.0


    # ----------------------------------------------------------
    # WEIGHTED FINAL SCORE
    # ----------------------------------------------------------

    overall_score = (
        (palm_confidence_score * 0.30) +
        (tarot_relevance_score * 0.25) +
        (personality_alignment_score * 0.20) +
        (user_context_score * 0.15) +
        (reading_consistency_score * 0.10)
    )

    overall_score = round(
        max(0.0, min(100.0, overall_score)),
        2
    )


    return {
        "overall_score": overall_score,

        "palm_analysis_confidence": round(
            palm_confidence_score, 2
        ),

        "tarot_interpretation_relevance": round(
            tarot_relevance_score, 2
        ),

        "personality_alignment": round(
            personality_alignment_score, 2
        ),

        "user_context_relevance": round(
            user_context_score, 2
        ),

        "reading_consistency": round(
            reading_consistency_score, 2
        ),

        "weights": {
            "palm_analysis_confidence": 30,
            "tarot_interpretation_relevance": 25,
            "personality_alignment": 20,
            "user_context_relevance": 15,
            "reading_consistency": 10
        }
    }

def generate_ai_interpretation(
    palm_analysis=None,
    tarot_reading=None,
    tarot_intention=None,
    tarot_question=None
):
    """
    Generate personalized AI-assisted insights from
    palm measurements and/or tarot results.

    Palm interpretations are based on detected image
    features and traditional palmistry associations.
    They are not scientific predictions.
    """

    palm_insights = []
    tarot_insights = []

    # ==========================================================
    # PALM-SPECIFIC PERSONALIZED INSIGHTS
    # ==========================================================

    if isinstance(palm_analysis,dict):

        palm_shape = palm_analysis.get(
            "palm_shape") or {}

        finger_analysis = palm_analysis.get(
            "finger_analysis") or {}

        palm_lines = palm_analysis.get(
            "palm_lines") or {}

        # ------------------------------------------------------
        # PALM SHAPE
        # ------------------------------------------------------

        shape = palm_shape.get(
            "palm_shape"
        )

        ratio = palm_shape.get(
            "length_width_ratio"
        )

        proportion = palm_shape.get(
            "palm_proportion"
        )

        if shape:

            if shape == "Long Palm":

                palm_insights.append(
                    "Your detected palm has an elongated "
                    "structure. In traditional palmistry, "
                    "this pattern is associated with imagination, "
                    "curiosity, sensitivity, and exploration of ideas."
                )

            elif shape == "Wide Palm":

                palm_insights.append(
                    "Your detected palm has a relatively wide "
                    "structure. Traditional palmistry associates "
                    "this pattern with practicality, grounded "
                    "thinking, confidence, and an action-oriented style."
                )

            else:

                palm_insights.append(
                    "Your detected palm has relatively balanced "
                    "proportions. Traditional palmistry associates "
                    "this pattern with adaptability and a balance "
                    "between practical and imaginative qualities."
                )

        if ratio is not None:

            palm_insights.append(
                f"The measured palm length-to-width ratio is "
                f"{ratio}, indicating a {proportion.lower() if proportion else 'measured'} "
                "palm proportion."
            )

        # ------------------------------------------------------
        # FINGER STRUCTURE
        # ------------------------------------------------------

        finger_structure = finger_analysis.get(
            "finger_structure"
        )

        average_ratio = finger_analysis.get(
            "average_finger"
        )

        dominant_finger = finger_analysis.get(
            "dominant_finger"
        )

        index_ring_relation = finger_analysis.get(
            "index_ring_relation"
        )

        if finger_structure:

            if finger_structure == "Long Fingers":

                palm_insights.append(
                    "The detected fingers are relatively long "
                    "compared with the palm reference measurement. "
                    "Traditional palmistry associates this pattern "
                    "with attention to detail, patience, sensitivity, "
                    "and thoughtful decision-making."
                )

            elif finger_structure == "Short Fingers":

                palm_insights.append(
                    "The detected fingers are relatively shorter "
                    "compared with the palm reference measurement. "
                    "Traditional palmistry associates this pattern "
                    "with directness, quick thinking, spontaneity, "
                    "and an action-oriented approach."
                )

            else:

                palm_insights.append(
                    "The detected fingers have moderate proportions "
                    "relative to the palm. Traditional palmistry "
                    "associates this pattern with balance, adaptability, "
                    "and practical decision-making."
                )

        if average_ratio is not None:

            palm_insights.append(
                f"The measured average finger-to-palm ratio is "
                f"{average_ratio}, providing an image-specific "
                "measurement of finger proportions."
            )

        if dominant_finger:

            palm_insights.append(
                f"The {dominant_finger.lower()} shows the greatest "
                "measured wrist-to-tip distance among the detected "
                "fingers."
            )

        if index_ring_relation:

            palm_insights.append(
                f"Finger comparison indicates that "
                f"{index_ring_relation.lower()}."
            )

        # ------------------------------------------------------
        # PALM LINES
        # ------------------------------------------------------

        lines = palm_lines.get(
            "lines") or []

        for line in lines:

            line_name = str(line.get("line", "")).strip().lower()

            # Normalize different possible formats
            if "life" in line_name:
                line_name = "life"
            elif "heart" in line_name:
                line_name = "heart"
            elif "head" in line_name:
                line_name = "head"
            elif "fate" in line_name:
                line_name = "fate" 

            confidence = line.get(
                "confidence",
                0
            )

            length = line.get(
                "length"
            )

            length_category = line.get(
                "length_category"
            )

            direction = line.get(
                "direction"
            )

            if not line_name:
                continue

            # ----------------------------------------------
            # LIFE LINE
            # ----------------------------------------------

            if line_name == "life":

                if length_category == "Long":

                    message = (
                        "The detected Life Line is relatively long. "
                        "In traditional palmistry, this pattern is "
                        "associated with vitality, energy, and major "
                        "life experiences."
                    )

                elif length_category == "Short":

                    message = (
                        "The detected Life Line is relatively short. "
                        "This should not be interpreted as a prediction "
                        "of lifespan. In traditional palmistry, it "
                        "represents a more compact line pattern."
                    )

                else:

                    message = (
                        "The detected Life Line has a moderate "
                        "measured length. Traditional palmistry "
                        "associates this with a relatively balanced "
                        "life-line pattern."
                    )

                if length is not None:

                    message += (
                        f" The detected geometric length is "
                        f"approximately {length} pixels."
                    )

                palm_insights.append(
                    message
                )

            # ----------------------------------------------
            # HEART LINE
            # ----------------------------------------------

            elif line_name == "heart":

                if length_category == "Long":

                    message = (
                        "The detected Heart Line is relatively long. "
                        "Traditional palmistry associates this pattern "
                        "with emotional expression, affection, "
                        "relationships, and sensitivity."
                    )

                elif length_category == "Short":

                    message = (
                        "The detected Heart Line is relatively short. "
                        "Traditional palmistry associates this pattern "
                        "with a more direct or reserved style of "
                        "emotional expression."
                    )

                else:

                    message = (
                        "The detected Heart Line has a moderate "
                        "measured length. Traditional palmistry "
                        "associates this with balanced emotional "
                        "expression and relationships."
                    )

                if length is not None:

                    message += (
                        f" The detected geometric length is "
                        f"approximately {length} pixels."
                    )

                palm_insights.append(
                    message
                )

            # ----------------------------------------------
            # HEAD LINE
            # ----------------------------------------------

            elif line_name == "head":

                if length_category == "Long":

                    message = (
                        "The detected Head Line is relatively long. "
                        "Traditional palmistry associates this pattern "
                        "with concentration, analysis, and thoughtful "
                        "decision-making."
                    )

                elif length_category == "Short":

                    message = (
                        "The detected Head Line is relatively short. "
                        "Traditional palmistry associates this pattern "
                        "with direct thinking and quick decision-making."
                    )

                else:

                    message = (
                        "The detected Head Line has a moderate "
                        "measured length. Traditional palmistry "
                        "associates this with a balanced approach "
                        "to thinking and decision-making."
                    )

                if length is not None:

                    message += (
                        f" The detected geometric length is "
                        f"approximately {length} pixels."
                    )

                palm_insights.append(
                    message
                )

            # ----------------------------------------------
            # FATE LINE
            # ----------------------------------------------

            elif line_name == "fate":

                if length_category == "Long":

                    message = (
                        "The detected Fate Line is relatively long. "
                        "Traditional palmistry associates this pattern "
                        "with career direction, ambition, goals, and "
                        "a stronger sense of personal direction."
                    )

                elif length_category == "Short":

                    message = (
                        "The detected Fate Line is relatively short. "
                        "Traditional palmistry associates this pattern "
                        "with a less prominent or more variable "
                        "career-direction pattern."
                    )

                else:

                    message = (
                        "The detected Fate Line has a moderate "
                        "measured length. Traditional palmistry "
                        "associates this with a balanced pattern "
                        "of goals and career direction."
                    )

                if length is not None:

                    message += (
                        f" The detected geometric length is "
                        f"approximately {length} pixels."
                    )

                palm_insights.append(
                    message
                )

            # ----------------------------------------------
            # ADD CONFIDENCE INFORMATION
            # ----------------------------------------------

            if confidence:

                palm_insights.append(
                    f"The computer-vision model detected the "
                    f"{line_name} line with approximately "
                    f"{confidence * 100:.1f}% confidence."
                )

            if direction:

                palm_insights.append(
                    f"The detected {line_name} line has an overall "
                    f"{direction.lower()} geometric direction in "
                    "the analyzed image."
                )

    # ==========================================================
    # TAROT INSIGHTS
    # ==========================================================

    tarot_insights = _collect_tarot_insights(
        tarot_reading,
        tarot_intention
    )

    # ==========================================================
    # COMBINE
    # ==========================================================

    combined_insights = (
        palm_insights +
        tarot_insights
    )

    if not combined_insights:

        return {
            "success": False,
            "message": (
                "No palm or tarot information "
                "was provided for interpretation."
            ),
            "insights": []
        }

    # ==========================================================
    # CATEGORIES
    # ==========================================================

    personality = []
    relationships = []
    career = []
    personal_growth = []
    opportunities = []
    recommendations = []

    # ==========================================================
    # RELATIONSHIP INTELLIGENCE
    # ==========================================================

    if palm_analysis:

        palm_shape_data = palm_analysis.get("palm_shape") or {}
        finger_data = palm_analysis.get("finger_analysis") or {}
        line_data = palm_analysis.get("palm_lines") or {}

        shape = str(
            palm_shape_data.get("palm_shape", "")
        ).strip()

        average_finger = finger_data.get(
            "average_finger"
        )

        heart_line = None

        lines = line_data.get("lines", [])

        if isinstance(lines, list):

            for line in lines:

                if not isinstance(line, dict):
                    continue

                line_name = str(
                    line.get("line", "")
                ).strip().lower()

                if "heart" in line_name:
                    heart_line = line
                    break

        # ------------------------------------------------------
        # Heart Line based interpretation
        # ------------------------------------------------------

        if heart_line:

            heart_length_category = str(
                heart_line.get("length_category", "")
            ).strip()

            heart_direction = str(
                heart_line.get("direction", "")
            ).strip().lower()

            if heart_length_category == "Short":

                relationships.append(
                    "Your shorter Heart Line is traditionally "
                    "associated with a more measured style of "
                    "emotional expression. You may prefer to "
                    "process feelings internally before expressing "
                    "them openly."
                )

            elif heart_length_category == "Long":

                relationships.append(
                    "Your longer Heart Line is traditionally "
                    "associated with a more expressive emotional "
                    "style. You may place greater importance on "
                    "emotional connection and open communication."
                )

            else:

                relationships.append(
                    "Your Heart Line shows a more balanced pattern "
                    "traditionally associated with combining "
                    "emotional expression with personal space."
                )

                if shape == "Long Palm":
                    relationships.append(
                        "Your elongated palm pattern is traditionally "
                        "associated with sensitivity and curiosity. "
                        "In relationships, this may be reflected in "
                        "taking time to understand people and emotional "
                        "situations deeply."
                    )

                elif shape == "Wide Palm":
                    relationships.append(
                        "Your wider palm pattern is traditionally "
                        "associated with a grounded approach. In "
                        "relationships, this may be reflected in "
                        "valuing stability, reliability, and consistent "
                        "actions."
                    )

                elif shape == "Balanced Palm":
                    relationships.append(
                        "Your balanced palm pattern is traditionally "
                        "associated with adaptability. In relationships, "
                        "this may be reflected in adjusting your "
                        "communication style according to the situation."
                    )

            # --------------------------------------------------
            # Heart Line + palm shape combination
            # --------------------------------------------------

            if (
                heart_length_category == "Short"
                and shape == "Long Palm"
            ):

                relationships.append(
                    "The combination of an elongated palm and a "
                    "shorter Heart Line suggests an interesting "
                    "balance between sensitivity and emotional "
                    "privacy. You may notice emotional details "
                    "deeply while still taking time before sharing "
                    "your feelings."
                )

            elif (
                heart_length_category == "Long"
                and shape == "Long Palm"
            ):

                relationships.append(
                    "The combination of an elongated palm and a "
                    "longer Heart Line is traditionally associated "
                    "with sensitivity together with a stronger "
                    "tendency toward emotional expression."
                )

            elif shape == "Wide Palm":

                relationships.append(
                    "The wider palm pattern is traditionally "
                    "associated with a grounded approach. In "
                    "relationships, this may be reflected in "
                    "valuing stability, reliability, and actions "
                    "that demonstrate care."
                )

            elif shape == "Balanced Palm":

                relationships.append(
                    "The balanced palm pattern is traditionally "
                    "associated with adaptability. In relationships, "
                    "this may be reflected in adjusting your "
                    "communication style according to the situation."
                )

            # --------------------------------------------------
            # Direct communication pattern
            # --------------------------------------------------

            if average_finger is not None:

                try:

                    average_finger = float(
                        average_finger
                    )

                    if average_finger <= 1.6:

                        relationships.append(
                            "Your relatively shorter finger pattern "
                            "is traditionally associated with a "
                            "direct communication style, which may "
                            "encourage you to prefer clarity rather "
                            "than prolonged uncertainty in "
                            "relationships."
                        )

                except (TypeError, ValueError):

                    pass

        # Keep the section concise
        relationships = relationships[:3]

    for insight in combined_insights:

        _categorize_insight(
            insight,
            personality,
            relationships,
            career,
            personal_growth,
            opportunities,
            tarot_intention
        )      

    # ==========================================================
    # FALLBACK PERSONALITY INSIGHT
    # ==========================================================

    if not personality and palm_analysis:

        personality.append(
            "The detected palm structure and finger proportions "
            "provide the basis for this image-specific traditional "
            "palmistry interpretation."
        )

    # ====================================================
    # Personality Intelligence
    # ====================================================
    
    personality_intelligence = _generate_personality_intelligence(palm_analysis)
    tarot_personality_intelligence = _generate_tarot_personality_intelligence(tarot_reading,tarot_intention)

    # ==========================================================
    # CAREER INTELLIGENCE
    # ==========================================================

    if palm_analysis:

        palm_shape_data = palm_analysis.get("palm_shape") or {}
        finger_data = palm_analysis.get("finger_analysis") or {}
        line_data = palm_analysis.get("palm_lines") or {}

        shape = str(
            palm_shape_data.get("palm_shape", "")
        ).strip()

        average_finger = finger_data.get("average_finger")

        head_line = None
        fate_line = None
        life_line = None

        lines = line_data.get("lines", [])

        if isinstance(lines, list):

            for line in lines:

                if not isinstance(line, dict):
                    continue

                line_name = str(
                    line.get("line", "")
                ).strip().lower()

                if "head" in line_name:
                    head_line = line

                elif "fate" in line_name:
                    fate_line = line
                elif "life" in line_name:
                    life_line = line

        # ------------------------------------------------------
        # Fate Line
        # ------------------------------------------------------

        if fate_line:

            fate_length = str(
                fate_line.get("length_category", "")
            ).strip()

            if fate_length == "Long":
                career.append(
                    "Your longer Fate Line is traditionally "
                    "associated with a stronger sense of direction "
                    "and persistence toward important goals."
                )

            elif fate_length == "Short":
                career.append(
                    "Your shorter Fate Line is traditionally "
                    "associated with a more flexible approach to "
                    "career direction. You may be comfortable "
                    "adjusting your path as opportunities change."
                )

            else:
                career.append(
                    "Your Fate Line shows a balanced pattern "
                    "traditionally associated with developing "
                    "career direction gradually through experience."
                )

        # ------------------------------------------------------
        # Head Line
        # ------------------------------------------------------

        if head_line:

            head_length = str(
                head_line.get("length_category", "")
            ).strip()

            if head_length == "Short":
                career.append(
                    "Your shorter Head Line is traditionally "
                    "associated with a direct and practical "
                    "thinking style. You may prefer learning by "
                    "doing and moving toward workable solutions."
                )

            elif head_length == "Long":
                career.append(
                    "Your longer Head Line is traditionally "
                    "associated with sustained concentration and "
                    "a tendency to explore ideas in greater depth."
                )

            else:
                career.append(
                    "Your Head Line shows a balanced pattern "
                    "traditionally associated with combining "
                    "practical thinking with consideration of "
                    "different possibilities."
                )

        # ------------------------------------------------------
        # Palm shape + career style
        # ------------------------------------------------------

        if shape == "Long Palm":
            career.append(
                "Your elongated palm pattern is traditionally "
                "associated with curiosity and exploration. "
                "This can be a useful reflection point for careers "
                "that involve learning, creativity, or discovering "
                "new ideas."
            )

        elif shape == "Wide Palm":
            career.append(
                "Your wider palm pattern is traditionally "
                "associated with a grounded and practical approach. "
                "This can be a useful reflection point for work "
                "that values execution, stability, and tangible "
                "results."
            )

        elif shape == "Balanced Palm":
            career.append(
                "Your balanced palm pattern is traditionally "
                "associated with adaptability. This can be a useful "
                "reflection point for roles that require adjusting "
                "to different situations and responsibilities."
            )

        # ------------------------------------------------------
        # Finger pattern
        # ------------------------------------------------------

        if average_finger is not None:

            try:

                average_finger = float(
                    average_finger
                )

                if average_finger <= 1.6:
                    career.append(
                        "Your relatively shorter finger pattern "
                        "is traditionally associated with a direct "
                        "and action-oriented approach, which may "
                        "suit situations where decisions and "
                        "execution are important."
                    )

                elif average_finger >= 1.8:
                    career.append(
                        "Your relatively longer finger pattern "
                        "is traditionally associated with a more "
                        "patient and detail-oriented approach, "
                        "which may suit work requiring careful "
                        "analysis and planning."
                    )

            except (TypeError, ValueError):
                pass

        # ------------------------------------------------------
        # Keep Career concise
        # ------------------------------------------------------

        career = career[:3]


    # ==========================================================
    # PERSONAL GROWTH INTELLIGENCE
    # ==========================================================

    if palm_analysis:

        palm_shape_data = palm_analysis.get("palm_shape") or {}
        finger_data = palm_analysis.get("finger_analysis") or {}
        line_data = palm_analysis.get("palm_lines") or {}

        shape = str(
            palm_shape_data.get("palm_shape", "")
        ).strip()

        average_finger = finger_data.get("average_finger")

        head_line = None
        heart_line = None

        lines = line_data.get("lines", [])

        if isinstance(lines, list):

            for line in lines:

                if not isinstance(line, dict):
                    continue

                line_name = str(
                    line.get("line", "")
                ).strip().lower()

                if "head" in line_name:
                    head_line = line

                elif "heart" in line_name:
                    heart_line = line


        # ------------------------------------------------------
        # Curiosity + action
        # ------------------------------------------------------

        if (
            shape == "Long Palm"
            and average_finger is not None
        ):

            try:

                average_finger = float(
                    average_finger
                )

                if average_finger <= 1.6:

                    personal_growth.append(
                        "Your combination of an exploratory palm "
                        "pattern and a direct approach suggests that "
                        "you may benefit from choosing a few ideas "
                        "and turning them into consistent action."
                    )

                elif average_finger >= 1.8:

                    personal_growth.append(
                        "Your combination of an exploratory palm "
                        "pattern and a more patient finger pattern "
                        "suggests that developing ideas gradually "
                        "and giving them time to mature may support "
                        "your personal growth."
                    )

            except (TypeError, ValueError):
                pass

        # ------------------------------------------------------
        # Head Line
        # ------------------------------------------------------

        if head_line:

            head_length = str(
                head_line.get("length_category", "")
            ).strip()

            if head_length == "Short":

                personal_growth.append(
                    "Your shorter Head Line is traditionally "
                    "associated with direct thinking. A useful "
                    "growth practice may be giving important "
                    "decisions a little more time before acting."
                )

            elif head_length == "Long":

                personal_growth.append(
                    "Your longer Head Line is traditionally "
                    "associated with deeper mental exploration. "
                    "Balancing analysis with timely action may "
                    "help turn ideas into progress."
                )

        # ------------------------------------------------------
        # Heart Line
        # ------------------------------------------------------

        if heart_line:

            heart_length = str(
                heart_line.get("length_category", "")
            ).strip()

            if heart_length == "Short":

                personal_growth.append(
                    "Your shorter Heart Line is traditionally "
                    "associated with a more private emotional style. "
                    "Practicing clear expression of important "
                    "feelings may support stronger communication."
                )

            elif heart_length == "Long":

                personal_growth.append(
                    "Your longer Heart Line is traditionally "
                    "associated with stronger emotional expression. "
                    "Maintaining healthy personal boundaries can "
                    "help balance emotional involvement with self-care."
                )

        # ------------------------------------------------------
        # Life Line
        # ------------------------------------------------------

        if life_line:

            life_length = str(
                life_line.get("length_category", "")
            ).strip()

            if life_length == "Long":

                personal_growth.append(
                    "Your longer Life Line is traditionally "
                    "associated with an active approach to life. "
                    "Maintaining consistency and balance can help "
                    "support long-term development."
                )

            elif life_length == "Short":

                personal_growth.append(
                    "Your shorter Life Line can be used as a "
                    "reflection point for maintaining a balanced "
                    "pace and being mindful of how you manage "
                    "your time and energy."
                )

        # ------------------------------------------------------
        # Fallback
        # ------------------------------------------------------

        if not personal_growth:

            personal_growth.append(
                "Your detected palm features provide a useful "
                "reflection point for developing self-awareness, "
                "decision-making, and personal growth."
            )

        # Keep the section concise
        personal_growth = personal_growth[:3]

    # ==========================================================
    # OPPORTUNITIES INTELLIGENCE
    # ==========================================================

    if palm_analysis:

        palm_shape_data = palm_analysis.get("palm_shape") or {}
        finger_data = palm_analysis.get("finger_analysis") or {}
        line_data = palm_analysis.get("palm_lines") or {}

        shape = str(
            palm_shape_data.get("palm_shape", "")
        ).strip()

        average_finger = finger_data.get("average_finger")

        head_line = None
        fate_line = None

        lines = line_data.get("lines", [])

        if isinstance(lines, list):

            for line in lines:

                if not isinstance(line, dict):
                    continue

                line_name = str(
                    line.get("line", "")
                ).strip().lower()

                if "head" in line_name:
                    head_line = line

                elif "fate" in line_name:
                    fate_line = line

        # Palm shape opportunities
        if shape == "Long Palm":
            opportunities.append(
                "Your elongated palm pattern can be used as a reflection point for opportunities involving learning, exploration, creativity, and discovering new ideas."
            )

        elif shape == "Wide Palm":
            opportunities.append(
                "Your wider palm pattern can be used as a reflection point for opportunities involving practical work, execution, stability, and tangible results."
            )

        elif shape == "Balanced Palm":
            opportunities.append(
                "Your balanced palm pattern can be used as a reflection point for opportunities that involve adaptability, collaboration, and handling different types of responsibilities."
            )

        # Head Line opportunities
        if head_line:

            head_length = str(
                head_line.get("length_category", "")
            ).strip()

            if head_length == "Short":
                opportunities.append(
                    "Your shorter Head Line can be used as a reflection point for opportunities that involve practical problem-solving, quick decisions, and learning through action."
                )

            elif head_length == "Long":
                opportunities.append(
                    "Your longer Head Line can be used as a reflection point for opportunities involving analysis, planning, research, and exploring complex ideas."
                )

            else:
                opportunities.append(
                    "Your balanced Head Line can be used as a reflection point for opportunities that combine practical decision-making with consideration of different possibilities."
                )

        # Finger pattern opportunities
        if average_finger is not None:

            try:

                average_finger = float(average_finger)

                if average_finger <= 1.6:
                    opportunities.append(
                        "Your relatively shorter finger pattern can be used as a reflection point for opportunities where initiative, direct action, and execution are important."
                    )

                elif average_finger >= 1.8:
                    opportunities.append(
                        "Your relatively longer finger pattern can be used as a reflection point for opportunities involving careful analysis, planning, and attention to detail."
                    )

            except (TypeError, ValueError):
                pass

        # Fate Line opportunities
        if fate_line:

            fate_length = str(
                fate_line.get("length_category", "")
            ).strip()

            if fate_length == "Long":
                opportunities.append(
                    "Your longer Fate Line can be used as a reflection point for opportunities that involve setting clear goals and building toward a defined direction."
                )

            elif fate_length == "Short":
                opportunities.append(
                    "Your shorter Fate Line can be used as a reflection point for opportunities that allow flexibility and adjustment as your interests or circumstances change."
                )

        opportunities = opportunities[:3]

    # ==========================================================
    # RECOMMENDATION ENGINE
    # ==========================================================

    if palm_analysis:

        palm_shape_data = palm_analysis.get("palm_shape") or {}
        finger_data = palm_analysis.get("finger_analysis") or {}

        shape = str(
            palm_shape_data.get("palm_shape", "")
        ).strip()

        average_finger = finger_data.get("average_finger")

        # Palm-shape based recommendation
        if shape == "Long Palm":
            recommendations.append(
                "Explore activities that allow you to learn, experiment, and develop new ideas while maintaining a few clear priorities."
            )

        elif shape == "Wide Palm":
            recommendations.append(
                "Focus on practical activities where you can turn ideas into measurable results and build consistent routines."
            )

        elif shape == "Balanced Palm":
            recommendations.append(
                "Try activities that allow you to balance flexibility with structure and adapt your approach when circumstances change."
            )

        # Relationship-focused recommendation
        line_data = palm_analysis.get("palm_lines") or {}

        heart_line = None

        lines = line_data.get("lines", [])

        if isinstance(lines, list):

            for line in lines:

                if not isinstance(line, dict):
                    continue

                line_name = str(
                    line.get("line", "")
                ).strip().lower()

                if "heart" in line_name:
                    heart_line = line
                    break


        if heart_line:

            heart_length = str(
                heart_line.get("length_category", "")
            ).strip()

            if heart_length == "Short":

                recommendations.append(
                    "Practice expressing important feelings clearly and give yourself space to build emotional connections at a comfortable pace."
                )

            elif heart_length == "Long":

                recommendations.append(
                    "Use your natural tendency toward emotional expression to build open communication while maintaining healthy personal boundaries."
                )

            else:

                recommendations.append(
                    "Maintain a balance between expressing your feelings openly and giving yourself enough personal space in relationships."
                )

        # Career-focused recommendation
        head_line = None
        fate_line = None
        life_line = None

        if isinstance(lines, list):

            for line in lines:

                if not isinstance(line, dict):
                    continue

                line_name = str(
                    line.get("line", "")
                ).strip().lower()

                if "head" in line_name:
                    head_line = line

                elif "fate" in line_name:
                    fate_line = line

                elif "life" in line_name:
                    life_line = line


        if head_line:

            head_length = str(
                head_line.get("length_category", "")
            ).strip()

            if head_length == "Short":

                recommendations.append(
                    "Choose learning or work activities that let you apply ideas practically and see progress through action."
                )

            elif head_length == "Long":

                recommendations.append(
                    "Give yourself opportunities to work on deeper analysis, planning, research, and complex problem-solving."
                )

            else:

                recommendations.append(
                    "Look for activities that combine practical decision-making with planning and consideration of different possibilities."
                )


        if fate_line:

            fate_length = str(
                fate_line.get("length_category", "")
            ).strip()

            if fate_length == "Short":

                recommendations.append(
                    "Keep your career goals flexible and allow yourself to explore different paths as your interests and circumstances develop."
                )

            elif fate_length == "Long":

                recommendations.append(
                    "Set clear long-term goals and build a consistent plan that allows you to develop steadily toward your chosen direction."
                )

            else:

                recommendations.append(
                    "Build your career direction gradually by combining clear goals with flexibility as you gain new experience."
                )

        # Personal-growth recommendation
        if life_line:

            life_length = str(
                life_line.get("length_category", "")
            ).strip()

            if life_length == "Long":

                recommendations.append(
                    "Maintain consistent routines and balance your time and energy so that steady progress can be sustained over the long term."
                )

            elif life_length == "Short":

                recommendations.append(
                    "Build healthy routines and pay attention to how you manage your time and energy so that you can maintain a balanced pace."
                )

            else:

                recommendations.append(
                    "Build steady routines while allowing enough flexibility to adjust your pace when circumstances change."
                )

        # Goal-alignment recommendation
        if fate_line:

            fate_length = str(
                fate_line.get("length_category", "")
            ).strip()

            if fate_length == "Long":

                recommendations.append(
                    "Align your daily actions with a few clear long-term goals and review your progress regularly."
                )

            elif fate_length == "Short":

                recommendations.append(
                    "Break larger goals into smaller achievable steps and allow your goals to evolve as you gain new experience."
                )

            else:

                recommendations.append(
                    "Set clear priorities and regularly adjust your goals as your interests, experience, and circumstances develop."
                )

        # Spiritual-development recommendation
        if shape == "Long Palm":
            recommendations.append(
                "Make time for reflection, journaling, meditation, or other practices that help you explore your values and inner perspective."
            )
        elif shape == "Wide Palm":
            recommendations.append(
                "Consider grounding practices such as mindfulness, quiet reflection, or spending time in nature to maintain balance between activity and inner well-being."
            )
        elif shape == "Balanced Palm":
            recommendations.append(
                "Explore reflective practices such as meditation, journaling, or mindfulness that allow you to maintain balance between your practical goals and inner well-being."
            )
            
        # Finger-pattern based recommendation
        if average_finger is not None:

            try:

                average_finger = float(average_finger)

                if average_finger <= 1.6:
                    recommendations.append(
                        "Use your action-oriented tendency constructively by setting clear short-term goals and following them with consistent execution."
                    )

                elif average_finger >= 1.8:
                    recommendations.append(
                        "Use your detail-oriented tendency constructively by giving important plans enough time for careful analysis before acting."
                    )

            except (TypeError, ValueError):
                pass

        recommendations = recommendations[:7]

    # ==========================================================
    # TAROT RECOMMENDATION ENGINE
    # ==========================================================

    if tarot_reading:

        cards = tarot_reading.get("cards", [])

        if isinstance(cards, list):

            for card in cards:

                if not isinstance(card, dict):
                    continue

                name = str(
                    card.get("name", "Unknown card")
                ).strip()

                keywords = card.get("keywords", [])
                meanings = card.get("meaning", [])
                orientation = str(
                    card.get("orientation", "")
                ).strip().lower()

                if not isinstance(keywords, list):
                    keywords = [str(keywords)]

                if not isinstance(meanings, list):
                    meanings = [str(meanings)]

                card_text = " ".join(
                    str(item).lower()
                    for item in keywords + meanings
                )

                # Personal-growth recommendation
                if any(word in card_text for word in [
                    "growth",
                    "learning",
                    "knowledge",
                    "wisdom",
                    "development"
                ]):
                    recommendations.append(
                        f"{name} can be used as a reflection point for learning, personal growth, and continued development."
                    )

                # Career / goal recommendation
                elif any(word in card_text for word in [
                    "goal",
                    "direction",
                    "vision",
                    "opportunity",
                    "success",
                    "creation",
                    "invention"
                ]):
                    recommendations.append(
                        f"{name} can be used as a reflection point for clarifying goals, exploring opportunities, and developing a purposeful direction."
                    )

                # Relationship recommendation
                elif any(word in card_text for word in [
                    "relationship",
                    "relationships",
                    "connection",
                    "partnership",
                    "love",
                    "support"
                ]):
                    recommendations.append(
                        f"{name} can be used as a reflection point for communication, relationships, and meaningful connections."
                    )

                # Practical / financial recommendation
                elif any(word in card_text for word in [
                    "practicality",
                    "prosperity",
                    "wealth",
                    "money",
                    "financial",
                    "responsibility"
                ]):
                    recommendations.append(
                        f"{name} can be used as a reflection point for practical decisions, responsibility, and thoughtful use of resources."
                    )

                # Spiritual-development recommendation
                elif any(word in card_text for word in [
                    "guidance",
                    "belief",
                    "revelation",
                    "spiritual",
                    "reflection"
                ]):
                    recommendations.append(
                        f"{name} can be used as a reflection point for self-awareness, reflection, and personal values."
                    )

                # Reversed-card recommendation
                elif orientation == "reversed":
                    recommendations.append(
                        f"{name} appears reversed and can be used as a reflection point for greater awareness, balance, and thoughtful decision-making."
                    )

                # General Tarot recommendation
                else:
                    recommendations.append(
                        f"{name} can be used as a reflection point for self-awareness and personal development."
                    )


    recommendations = recommendations[:7]

    # ==========================================================
    # LIFE TREND ANALYSIS
    # ==========================================================

    print("BEFORE LIFE TREND")

    life_trend_analysis = _generate_life_trend_analysis(
        palm_analysis,
        tarot_reading,
        personality_intelligence,
        recommendations
    )

    print("LIFE TREND DEBUG:",life_trend_analysis)

    # ==========================================================
    # SPIRITUAL GUIDANCE SCORE
    # ==========================================================

    spiritual_guidance_score = _calculate_spiritual_guidance_score(
        palm_analysis=palm_analysis,
        tarot_reading=tarot_reading,
        tarot_intention=tarot_intention,
        tarot_question=tarot_question,
        personality_intelligence=personality_intelligence,
        combined_insights=combined_insights
    )

    # ==========================================================
    # RESULT
    # ==========================================================

    print("DEBUG RECOMMENDATIONS COUNT:", len(recommendations))
    print("DEBUG RECOMMENDATIONS:", recommendations)        

    return {
        "success": True,

        "source_summary": {
            "palm_analysis_available": bool(
                palm_analysis
            ),

            "tarot_reading_available": bool(
                tarot_reading
            ),

            "total_insights": len(
                combined_insights
            )
        },

        "personality": personality,

        "personality_intelligence": personality_intelligence,

        "tarot_personality_intelligence": tarot_personality_intelligence,

        "spiritual_guidance_score": spiritual_guidance_score,

        "relationships": relationships,

        "career": career,

        "personal_growth": personal_growth,

        "opportunities": opportunities,

        "recommendations": recommendations,

        "life_trend_analysis": life_trend_analysis,

        "all_insights": combined_insights,

        "disclaimer": (
            "These insights are based on image-derived "
            "measurements and traditional palmistry associations "
            "for personal reflection and entertainment. They are "
            "not scientifically validated predictions of personality "
            "or future events and should not be considered "
            "professional advice."
        )
    }