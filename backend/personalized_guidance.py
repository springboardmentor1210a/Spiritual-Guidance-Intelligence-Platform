from ai_interpretation import generate_ai_interpretation
from personality import generate_personality
from recommendations import generate_recommendations
from life_trends import generate_life_trends


def generate_personalized_guidance(
    palm_features=None,
    tarot_card=None,
    tarot_meaning=None,
    tarot_interpretation=None
):
    # =====================================================
    # 1. PREPARE PALM FEATURES
    # =====================================================

    palm_features = palm_features or {}

    # =====================================================
    # 2. PERSONALITY ANALYSIS
    # =====================================================

    personality = generate_personality(
        palm_features=palm_features,
        tarot_card=tarot_card,
        tarot_meaning=tarot_meaning
    )

    # =====================================================
    # 3. AI INTERPRETATION
    # =====================================================

    ai_interpretation = generate_ai_interpretation(
        palm_features=palm_features,
        tarot_card=tarot_card,
        tarot_meaning=tarot_meaning,
        tarot_interpretation=tarot_interpretation
    )

    # =====================================================
    # 4. RECOMMENDATIONS
    # =====================================================

    recommendations = generate_recommendations(
        personality=personality,
        palm_features=palm_features,
        tarot_card=tarot_card
    )

    # =====================================================
    # 5. LIFE TRENDS
    # =====================================================

    life_trends = generate_life_trends(
        personality=personality,
        palm_features=palm_features,
        tarot_card=tarot_card,
        tarot_meaning=tarot_meaning
    )

    # =====================================================
    # 6. FINAL RESULT
    # =====================================================

    return {
        "personality": personality,

        "ai_interpretation": ai_interpretation,

        "interpretation": ai_interpretation,

        "recommendations": recommendations,

        "life_trends": life_trends
    }


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    palm_features = {
        "heart_line": "Strong",
        "head_line": "Straight",
        "life_line": "Long",
        "palm_shape": "Long Palm"
    }

    result = generate_personalized_guidance(
        palm_features=palm_features,
        tarot_card="The Star",
        tarot_meaning="Hope, inspiration and healing",
        tarot_interpretation=(
            "A positive period of personal development."
        )
    )

    print("\n")
    print("======================================")
    print("PERSONALIZED GUIDANCE")
    print("======================================")

    print("\nPERSONALITY")
    print("--------------------------------------")

    print("Traits:", result["personality"]["traits"])
    print("Strengths:", result["personality"]["strengths"])
    print("Challenges:", result["personality"]["challenges"])
    print(
        "Communication:",
        result["personality"]["communication_style"]
    )
    print(
        "Decision Style:",
        result["personality"]["decision_style"]
    )
    print(
        "Emotional Style:",
        result["personality"]["emotional_style"]
    )

    print("\nAI INTERPRETATION")
    print("--------------------------------------")
    print(result["ai_interpretation"])

    print("\nRECOMMENDATIONS")
    print("--------------------------------------")

    for category, items in result["recommendations"].items():
        print(f"\n{category.upper()}:")

        for item in items:
            print("-", item)

    print("\nLIFE TRENDS")
    print("--------------------------------------")

    life_trends = result["life_trends"]

    print("Mode:", life_trends["mode"])

    print("\n1. LIFE PATH ANALYSIS")
    print(life_trends["life_path_analysis"])

    print("\n2. OPPORTUNITY IDENTIFICATION")
    print(life_trends["opportunity_identification"])

    print("\n3. CHALLENGE FORECASTING")
    print(life_trends["challenge_forecasting"])

    print("\n4. TREND MONITORING")
    print(life_trends["trend_monitoring"])

    print("\n5. GROWTH POTENTIAL ASSESSMENT")
    print(life_trends["growth_potential_assessment"])

    print("\n======================================")
    print("PERSONALIZED GUIDANCE TEST COMPLETED")
    print("======================================")