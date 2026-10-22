# ============================================================
# routes/tarot.py
# ============================================================
# INDEPENDENT TAROT READING
#
# Tarot works independently from Palmistry.
#
# This module:
#   - Generates Tarot readings
#   - Generates detailed Tarot interpretation
#   - Generates Tarot personality insights
#   - Generates relationship/career/finance insights
#   - Generates life trends
#   - Generates recommendations
#   - Generates personalized guidance
#   - Supports role-based Tarot access
#
# This module DOES NOT:
#   - query PalmReading
#   - combine Palmistry + Tarot
#   - create a combined Palmistry/Tarot report
#
# Palmistry + Tarot synthesis is handled separately
# by the personalized guidance / dashboard layer.
# ============================================================

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from typing import List, Optional, Dict, Any

import json


from database.database import get_db
from database.models import User, TarotCard, TarotReading

# ============================================================
# AUTHENTICATION
# ============================================================

from auth import get_current_user

# ============================================================
# ROLE-BASED ACCESS CONTROL
# ============================================================

from routes.rbac import (
    require_user,
    require_tarot_reader,
    require_spiritual_consultant,
    require_admin,
    require_tarot_management,
    require_consultation_access
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    tags=["Tarot"]
)


# ============================================================
# REQUEST SCHEMAS
# ============================================================

class TarotCardInput(BaseModel):

    card_name: str

    card_meaning: Optional[str] = None

    position: Optional[str] = None


class TarotReadingRequest(BaseModel):

    reading_type: str = "single"

    cards: List[TarotCardInput] = Field(
        default_factory=list
    )

    # Backward compatibility
    card_name: Optional[str] = None

    card_meaning: Optional[str] = None


# ============================================================
# TAROT CARD DATA
# ============================================================

TAROT_CARDS = {

    # ========================================================
    # MAJOR ARCANA
    # ========================================================

    "The Fool":
        "New beginnings, freedom and adventure.",

    "The Magician":
        "Resourcefulness, confidence and manifestation.",

    "The High Priestess":
        "Intuition, mystery and inner wisdom.",

    "The Empress":
        "Growth, creativity and abundance.",

    "The Emperor":
        "Structure, leadership and responsibility.",

    "The Hierophant":
        "Tradition, learning and guidance.",

    "The Lovers":
        "Connection, relationships and choices.",

    "The Chariot":
        "Determination, direction and progress.",

    "Strength":
        "Inner strength, courage and patience.",

    "The Hermit":
        "Reflection, solitude and wisdom.",

    "Wheel of Fortune":
        "Change, cycles and opportunity.",

    "Justice":
        "Balance, fairness and accountability.",

    "The Hanged Man":
        "Perspective, patience and surrender.",

    "Death":
        "Transformation, endings and new beginnings.",

    "Temperance":
        "Balance, harmony and moderation.",

    "The Devil":
        "Attachment, temptation and awareness.",

    "The Tower":
        "Sudden change and revelation.",

    "The Star":
        "Hope, optimism and inspiration.",

    "The Moon":
        "Intuition, uncertainty and reflection.",

    "The Sun":
        "Positivity, confidence and success.",

    "Judgement":
        "Reflection, awakening and renewal.",

    "The World":
        "Completion, achievement and integration.",


    # ========================================================
    # WANDS
    # ========================================================

    "Ace of Wands":
        "New energy, inspiration and initiative.",

    "Two of Wands":
        "Planning and future possibilities.",

    "Three of Wands":
        "Expansion and progress.",

    "Four of Wands":
        "Celebration, stability and harmony.",

    "Five of Wands":
        "Competition and challenge.",

    "Six of Wands":
        "Recognition and achievement.",

    "Seven of Wands":
        "Persistence and standing your ground.",

    "Eight of Wands":
        "Speed, movement and communication.",

    "Nine of Wands":
        "Resilience and persistence.",

    "Ten of Wands":
        "Responsibility and workload.",

    "Page of Wands":
        "Curiosity and exploration.",

    "Knight of Wands":
        "Action, energy and adventure.",

    "Queen of Wands":
        "Confidence and creativity.",

    "King of Wands":
        "Leadership and vision.",


    # ========================================================
    # CUPS
    # ========================================================

    "Ace of Cups":
        "Emotional beginnings and openness.",

    "Two of Cups":
        "Connection and partnership.",

    "Three of Cups":
        "Friendship and celebration.",

    "Four of Cups":
        "Reflection and emotional withdrawal.",

    "Five of Cups":
        "Loss, reflection and emotional processing.",

    "Six of Cups":
        "Memories, nostalgia and kindness.",

    "Seven of Cups":
        "Choices and possibilities.",

    "Eight of Cups":
        "Moving forward and seeking meaning.",

    "Nine of Cups":
        "Satisfaction and wishes.",

    "Ten of Cups":
        "Emotional fulfillment and harmony.",

    "Page of Cups":
        "Creativity and emotional openness.",

    "Knight of Cups":
        "Emotion, imagination and expression.",

    "Queen of Cups":
        "Empathy and emotional awareness.",

    "King of Cups":
        "Emotional balance and maturity.",


    # ========================================================
    # SWORDS
    # ========================================================

    "Ace of Swords":
        "Clarity and new ideas.",

    "Two of Swords":
        "Decision-making and balance.",

    "Three of Swords":
        "Emotional difficulty and reflection.",

    "Four of Swords":
        "Rest and recovery.",

    "Five of Swords":
        "Conflict and learning.",

    "Six of Swords":
        "Transition and moving forward.",

    "Seven of Swords":
        "Strategy and independence.",

    "Eight of Swords":
        "Restriction and perspective.",

    "Nine of Swords":
        "Worry and reflection.",

    "Ten of Swords":
        "Ending and renewal.",

    "Page of Swords":
        "Curiosity and communication.",

    "Knight of Swords":
        "Determination and action.",

    "Queen of Swords":
        "Clarity and independence.",

    "King of Swords":
        "Logic and leadership.",


    # ========================================================
    # PENTACLES
    # ========================================================

    "Ace of Pentacles":
        "New opportunities and stability.",

    "Two of Pentacles":
        "Balance and adaptability.",

    "Three of Pentacles":
        "Teamwork and skill.",

    "Four of Pentacles":
        "Security and control.",

    "Five of Pentacles":
        "Difficulty and resilience.",

    "Six of Pentacles":
        "Generosity and balance.",

    "Seven of Pentacles":
        "Patience and long-term growth.",

    "Eight of Pentacles":
        "Practice and skill development.",

    "Nine of Pentacles":
        "Independence and achievement.",

    "Ten of Pentacles":
        "Stability and long-term success.",

    "Page of Pentacles":
        "Learning and opportunity.",

    "Knight of Pentacles":
        "Consistency and responsibility.",

    "Queen of Pentacles":
        "Practicality and nurturing.",

    "King of Pentacles":
        "Stability, responsibility and achievement."
}


# ============================================================
# READING CARD COUNTS
# ============================================================

READING_CARD_COUNT = {

    "single": 1,

    "three_card": 3,

    "relationship": 5,

    "career": 5,

    "life_path": 5,

    "celtic_cross": 5
}


# ============================================================
# POSITION MEANINGS
# ============================================================

POSITION_MEANINGS = {

    "single":
        "Focused insight for the current situation.",

    "three_card":
        "Past, present and possible future perspectives.",

    "relationship":
        "Relationship and interpersonal influences.",

    "career":
        "Career and professional influences.",

    "life_path":
        "Life direction and personal growth.",

    "celtic_cross":
        "A broader symbolic view of the situation."
}


# ============================================================
# CARD POSITION GENERATOR
# ============================================================

def get_card_position(
    reading_type: str,
    index: int
):

    if reading_type == "single":

        positions = [
            "Focus"
        ]

        return positions[index]

    if reading_type == "three_card":

        positions = [
            "Past",
            "Present",
            "Future"
        ]

        return positions[index]

    if reading_type == "relationship":

        positions = [
            "You",
            "Other Person",
            "Connection",
            "Challenge",
            "Direction"
        ]

        return positions[index]

    if reading_type == "career":

        positions = [
            "Current Situation",
            "Challenge",
            "Strength",
            "Opportunity",
            "Direction"
        ]

        return positions[index]

    if reading_type == "life_path":

        positions = [
            "Current Path",
            "Growth",
            "Direction",
            "Challenge",
            "Opportunity"
        ]

        return positions[index]

    if reading_type == "celtic_cross":

        positions = [
            "Present Situation",
            "Challenge",
            "Foundation",
            "Past Influence",
            "Possible Direction"
        ]

        return positions[index]

    return "Position " + str(index + 1)


# ============================================================
# CARD THEMES
# ============================================================

def get_card_theme(card_name: str):

    themes = {

        "The Fool":
            "new beginnings, exploration and openness to experience",

        "The Magician":
            "initiative, confidence and using available abilities",

        "The High Priestess":
            "intuition, observation and inner awareness",

        "The Empress":
            "creativity, growth and nurturing energy",

        "The Emperor":
            "structure, leadership and responsibility",

        "The Hierophant":
            "learning, tradition and guidance",

        "The Lovers":
            "connection, values and important choices",

        "The Chariot":
            "determination, direction and focused progress",

        "Strength":
            "patience, courage and inner resilience",

        "The Hermit":
            "reflection, wisdom and personal understanding",

        "Wheel of Fortune":
            "change, cycles and emerging opportunities",

        "Justice":
            "balance, accountability and fair consideration",

        "The Hanged Man":
            "patience, perspective and seeing a situation differently",

        "Death":
            "transformation, transition and new beginnings",

        "Temperance":
            "balance, harmony and moderation",

        "The Devil":
            "attachments, habits and awareness of personal patterns",

        "The Tower":
            "sudden change, revelation and rebuilding",

        "The Star":
            "hope, inspiration and renewed confidence",

        "The Moon":
            "uncertainty, intuition and careful reflection",

        "The Sun":
            "confidence, positivity and clarity",

        "Judgement":
            "reflection, awakening and personal renewal",

        "The World":
            "completion, achievement and integration"
    }

    return themes.get(
        card_name,
        "growth, learning, practical experience and personal development"
    )


# ============================================================
# DETAILED CARD INTERPRETATION
# ============================================================

def generate_card_details(
    card_name: str,
    meaning: str,
    position: str,
    reading_type: str
):

    theme = get_card_theme(card_name)

    detailed = (
        f"{card_name} in the position '{position}' "
        f"symbolically highlights {theme}. "
        f"The primary meaning of this card is {meaning.lower()} "
        f"In this position, the card can be viewed as an invitation "
        f"to examine how these themes relate to the current situation. "
        f"It may encourage awareness of choices, experiences and "
        f"personal responses rather than presenting a fixed prediction."
    )

    if reading_type == "relationship":

        relationship_context = (
            f"In the relationship context, {card_name} suggests "
            f"paying attention to {theme}. The card can be used "
            f"as a reflection point for communication, expectations, "
            f"boundaries and mutual understanding. It does not "
            f"determine another person's thoughts or future behavior."
        )

    elif reading_type == "career":

        relationship_context = (
            f"In a career context, {card_name} highlights "
            f"{theme}. This can be considered when reviewing "
            f"professional goals, skills, responsibilities and "
            f"possible next steps."
        )

    elif reading_type == "life_path":

        relationship_context = (
            f"In a life-path context, {card_name} encourages "
            f"reflection on {theme}. The card can represent a "
            f"theme to consider while developing goals and "
            f"learning from personal experiences."
        )

    else:

        relationship_context = (
            f"In this reading, the card provides a symbolic "
            f"perspective connected with {theme}. Consider how "
            f"this theme relates to your current circumstances "
            f"and choices."
        )

    strength = (
        f"A possible strength represented by {card_name} is "
        f"the ability to work constructively with themes of "
        f"{theme}. This can encourage awareness, adaptability "
        f"and thoughtful action."
    )

    challenge = (
        f"A possible challenge is becoming overly focused on "
        f"the difficult side of {theme}. A balanced approach "
        f"can help turn the card's theme into a useful learning "
        f"opportunity."
    )

    reflection = (
        f"Reflection question: How can you respond to the "
        f"themes represented by {card_name} in a thoughtful "
        f"and practical way?"
    )

    return {

        "detailed_interpretation":
            detailed,

        "relationship_context":
            relationship_context,

        "strength":
            strength,

        "challenge":
            challenge,

        "reflection":
            reflection
    }


# ============================================================
# BUILD CARD RESULT
# ============================================================

def build_card_result(
    reading_type: str,
    card_name: str,
    meaning: str,
    position: str
):

    details = generate_card_details(
        card_name,
        meaning,
        position,
        reading_type
    )

    return {

        "position": position,

        "card_name": card_name,

        "meaning": meaning,

        "detailed_interpretation":
            details["detailed_interpretation"],

        "relationship_context":
            details["relationship_context"],

        "strength":
            details["strength"],

        "challenge":
            details["challenge"],

        "reflection":
            details["reflection"]
    }


# ============================================================
# OVERALL INTERPRETATION
# ============================================================

def generate_overall_interpretation(
    reading_type: str,
    cards: List[Dict[str, Any]]
):

    card_names = [
        card["card_name"]
        for card in cards
    ]

    names_text = ", ".join(card_names)

    if reading_type == "relationship":

        return (
            f"The Relationship Spread contains {names_text}. "
            f"Taken together, these cards provide symbolic themes "
            f"around personal perspective, the perspective of the "
            f"other person, and the relationship itself. "
            f"The reading highlights the importance of honest "
            f"communication, balanced expectations, awareness of "
            f"change and practical understanding. "
            f"Rather than treating the cards as fixed predictions, "
            f"the spread can be used to reflect on how each person "
            f"approaches the relationship and what areas may benefit "
            f"from patience, clarity and mutual understanding."
        )

    if reading_type == "career":

        return (
            f"The Career Spread contains {names_text}. "
            f"Together, the cards provide symbolic perspectives "
            f"on the current professional situation, possible "
            f"challenges and direction. The reading encourages "
            f"skill development, realistic planning, awareness "
            f"of opportunities and thoughtful decision-making."
        )

    if reading_type == "life_path":

        return (
            f"The Life Path Spread contains {names_text}. "
            f"Together, the cards highlight themes of personal "
            f"development, learning, direction and choices. "
            f"The reading can be used to reflect on current "
            f"priorities and practical steps toward personal goals."
        )

    if reading_type == "celtic_cross":

        return (
            f"The Celtic Cross Spread contains {names_text}. "
            f"These five selected positions provide a symbolic "
            f"perspective on the present situation, challenge, "
            f"foundation, past influence and possible direction. "
            f"The reading should be used for reflection and "
            f"self-awareness rather than as a fixed prediction."
        )

    return (
        f"The selected cards — {names_text} — provide symbolic "
        f"themes for reflection. Their combined meanings can be "
        f"considered in relation to your current experiences, "
        f"choices, relationships, goals and personal development. "
        f"The cards should be viewed as reflective guidance rather "
        f"than guaranteed predictions."
    )


# ============================================================
# PERSONALITY INSIGHT
# ============================================================

def generate_personality_insight(
    cards: List[Dict[str, Any]]
):

    meanings = " ".join(
        card["meaning"].lower()
        for card in cards
    )

    traits = []

    strengths = []

    challenges = []

    if any(
        word in meanings
        for word in [
            "confidence",
            "leadership",
            "determination",
            "achievement",
            "success"
        ]
    ):

        traits.append(
            "Confident and goal-oriented"
        )

        strengths.append(
            "Initiative and determination"
        )

    if any(
        word in meanings
        for word in [
            "reflection",
            "intuition",
            "wisdom"
        ]
    ):

        traits.append(
            "Reflective and intuitive"
        )

        strengths.append(
            "Self-reflection and awareness"
        )

    if any(
        word in meanings
        for word in [
            "connection",
            "relationship",
            "communication",
            "emotional",
            "friendship"
        ]
    ):

        traits.append(
            "Relationship-oriented"
        )

        strengths.append(
            "Communication and connection"
        )

    if any(
        word in meanings
        for word in [
            "growth",
            "learning",
            "skill",
            "development"
        ]
    ):

        traits.append(
            "Adaptable and growth-oriented"
        )

        strengths.append(
            "Learning and adaptability"
        )

    if not traits:

        traits.append(
            "Reflective and open-minded"
        )

    if not strengths:

        strengths.append(
            "Self-awareness and learning"
        )

    challenges.append(
        "Avoid becoming overly dependent on symbolic interpretations."
    )

    challenges.append(
        "Give yourself enough time to consider practical information "
        "before making important decisions."
    )

    return {

        "title":
            "Tarot Personality Insight",

        "summary":
            "The selected Tarot themes suggest a reflective "
            "personality pattern that can be explored through "
            "self-awareness, learning and thoughtful decisions.",

        "traits":
            list(dict.fromkeys(traits)),

        "strengths":
            list(dict.fromkeys(strengths)),

        "challenges":
            challenges,

        "communication_style":
            "Thoughtful communication that balances personal "
            "feelings with practical understanding.",

        "decision_style":
            "A reflective decision style that benefits from "
            "considering different perspectives before acting.",

        "emotional_style":
            "Emotionally aware and responsive, with value placed "
            "on understanding experiences and relationships."
    }


# ============================================================
# RELATIONSHIP INSIGHT
# ============================================================

def generate_relationship_insight(
    cards: List[Dict[str, Any]]
):

    return {

        "title":
            "Tarot Relationship Insight",

        "summary":
            "The relationship reading encourages awareness "
            "of communication, expectations, fairness and "
            "mutual understanding.",

        "communication":
            "Clear and respectful communication can help reduce "
            "misunderstandings and create space for both people "
            "to express their perspectives.",

        "emotional_connection":
            "Emotional experiences can be explored with patience "
            "rather than assumptions about another person's feelings.",

        "balance":
            "Healthy relationships benefit from balanced effort, "
            "respect and realistic expectations.",

        "reflection":
            "Consider what both people need from the relationship "
            "and which areas could benefit from clearer communication."
    }


# ============================================================
# CAREER INSIGHT
# ============================================================

def generate_career_insight(
    cards: List[Dict[str, Any]]
):

    return {

        "title":
            "Tarot Career Insight",

        "summary":
            "The cards can be used to reflect on professional "
            "direction, skills, responsibilities and opportunities.",

        "skills":
            "Continue developing skills that support your "
            "long-term professional goals.",

        "planning":
            "Break larger career goals into practical and "
            "measurable steps.",

        "opportunities":
            "Remain open to learning experiences and opportunities "
            "that match your interests and abilities.",

        "reflection":
            "Review your current priorities and consider whether "
            "your daily actions are supporting your longer-term goals."
    }


# ============================================================
# FINANCIAL INSIGHT
# ============================================================

def generate_financial_insight(
    cards: List[Dict[str, Any]]
):

    return {

        "title":
            "Tarot Financial Insight",

        "summary":
            "The Tarot themes can be used as a reminder to "
            "approach financial decisions with awareness and planning.",

        "planning":
            "Maintain a realistic budget and review important "
            "financial commitments carefully.",

        "stability":
            "Focus on sustainable financial habits rather than "
            "short-term assumptions.",

        "opportunity":
            "Consider learning opportunities that may improve "
            "your skills and future earning potential.",

        "reflection":
            "Use practical financial information when making "
            "important money-related decisions."
    }


# ============================================================
# PERSONAL GROWTH
# ============================================================

def generate_personal_growth(
    cards: List[Dict[str, Any]]
):

    return {

        "title":
            "Personal Growth",

        "summary":
            "The reading encourages self-awareness, patience "
            "and continuous learning.",

        "self_awareness":
            "Observe your reactions, strengths and areas where "
            "you would like to improve.",

        "learning":
            "Treat experiences as opportunities to learn and "
            "develop new skills.",

        "action":
            "Convert reflection into small practical actions "
            "that support your goals.",

        "balance":
            "Maintain balance between thinking about possibilities "
            "and taking practical action."
    }


# ============================================================
# LIFE OPPORTUNITIES
# ============================================================

def generate_life_opportunities(
    cards: List[Dict[str, Any]]
):

    return {

        "title":
            "Life Opportunities",

        "summary":
            "The cards can be interpreted as symbolic prompts "
            "to notice opportunities for learning, growth and change.",

        "learning_opportunities":
            "Look for situations where you can develop knowledge "
            "or practical skills.",

        "relationship_opportunities":
            "Use honest communication to strengthen meaningful "
            "connections.",

        "career_opportunities":
            "Explore opportunities that align with your skills "
            "and long-term interests.",

        "personal_opportunities":
            "Use periods of change as opportunities to reassess "
            "priorities and create realistic goals."
    }


# ============================================================
# LIFE TRENDS
# ============================================================

def generate_life_trends(
    reading_type: str,
    cards: List[Dict[str, Any]]
):

    return {

        "title":
            "Life Trends",

        "current_focus":
            "Reflection, awareness and understanding the current situation.",

        "short_term":
            "Pay attention to communication, choices and practical "
            "actions during the next stage of development.",

        "growth_trend":
            "Learning from experiences can support gradual personal "
            "and professional growth.",

        "relationship_trend":
            "Healthy communication and balanced expectations can "
            "support relationships.",

        "career_trend":
            "Consistent skill development and realistic planning "
            "can support professional progress.",

        "personal_trend":
            "The reading emphasizes reflection followed by practical action.",

        "overall_trend":
            POSITION_MEANINGS.get(
                reading_type,
                "Symbolic Tarot reflection."
            )
    }


# ============================================================
# RECOMMENDATIONS
# ============================================================

def generate_recommendations(
    reading_type: str
):

    recommendations = [

        "Use the Tarot reading as a self-reflection tool rather "
        "than as a guaranteed prediction.",

        "Write down the most important themes from the reading "
        "and compare them with your current situation.",

        "Turn useful insights into small and practical actions.",

        "Consider reliable real-world information before making "
        "important decisions."
    ]

    if reading_type == "relationship":

        recommendations.extend([

            "Communicate openly and respectfully.",

            "Avoid making assumptions about another person's "
            "feelings or intentions.",

            "Give both people space to express their perspective."
        ])

    elif reading_type == "career":

        recommendations.extend([

            "Identify one or two skills to improve.",

            "Create realistic short-term career goals.",

            "Review your progress regularly."
        ])

    elif reading_type == "life_path":

        recommendations.extend([

            "Review your priorities.",

            "Set achievable personal goals.",

            "Allow yourself to adjust plans when circumstances change."
        ])

    elif reading_type == "three_card":

        recommendations.extend([

            "Learn from past experiences.",

            "Focus on the present situation.",

            "Prepare practical options for the future."
        ])

    return recommendations


# ============================================================
# PERSONALIZED GUIDANCE
# ============================================================

def generate_personalized_guidance(
    reading_type: str,
    cards: List[Dict[str, Any]]
):

    card_names = [
        card["card_name"]
        for card in cards
    ]

    cards_text = ", ".join(card_names)

    if reading_type == "relationship":

        overall = (
            f"Your relationship spread contains {cards_text}. "
            f"The combined themes encourage honest communication, "
            f"balanced expectations, awareness of change and "
            f"practical understanding. Use the reading to reflect "
            f"on the relationship rather than to assume a fixed outcome."
        )

        relationship = (
            "Focus on communication and mutual understanding. "
            "Give both people an opportunity to express their "
            "needs, expectations and concerns."
        )

    else:

        overall = (
            f"Your Tarot reading contains {cards_text}. "
            f"The cards provide symbolic themes for reflection "
            f"and personal development. Consider which themes "
            f"connect with your current circumstances and then "
            f"translate useful insights into practical actions."
        )

        relationship = (
            "Maintain clear communication and healthy boundaries "
            "in important relationships."
        )

    return {

        "overall_guidance":
            overall,

        "personality_guidance":
            (
                "Develop self-awareness by observing your strengths, "
                "emotional responses, decision-making patterns and "
                "areas where you would like to grow."
            ),

        "relationship_guidance":
            relationship,

        "career_guidance":
            (
                "Continue developing relevant skills, maintain "
                "realistic goals and consider opportunities based "
                "on your abilities and interests."
            ),

        "finance_guidance":
            (
                "Approach financial matters with practical planning. "
                "Review budgets, commitments and reliable information "
                "before making important financial decisions."
            ),

        "personal_growth_guidance":
            (
                "Use reflection as the starting point for action. "
                "Choose one or two realistic improvements and work "
                "on them consistently."
            ),

        "opportunity_guidance":
            (
                "Remain open to learning, collaboration and new "
                "experiences while evaluating opportunities carefully."
            ),

        "challenges":
            [
                "Avoid treating symbolic Tarot meanings as guaranteed predictions.",

                "Avoid overthinking every possible outcome.",

                "Do not make major life decisions based only on a Tarot reading.",

                "Use practical evidence and personal judgment alongside reflection."
            ],

        "practical_recommendations":
            generate_recommendations(reading_type),

        "final_guidance":
            (
                "Use this reading as a structured reflection tool. "
                "The most useful outcome comes from combining self-awareness "
                "with practical planning, communication and consistent action."
            )
    }


# ============================================================
# BUILD COMPLETE TAROT RESULT
# ============================================================

def build_complete_tarot_result(
    reading_type: str,
    cards: List[Dict[str, Any]]
):

    card_results = []

    for card in cards:

        card_results.append(
            build_card_result(
                reading_type=reading_type,
                card_name=card["card_name"],
                meaning=card["meaning"],
                position=card["position"]
            )
        )

    overall = generate_overall_interpretation(
        reading_type,
        cards
    )

    personality = generate_personality_insight(
        cards
    )

    relationship = generate_relationship_insight(
        cards
    )

    career = generate_career_insight(
        cards
    )

    finance = generate_financial_insight(
        cards
    )

    personal_growth = generate_personal_growth(
        cards
    )

    opportunities = generate_life_opportunities(
        cards
    )

    life_trends = generate_life_trends(
        reading_type,
        cards
    )

    recommendations = generate_recommendations(
        reading_type
    )

    personalized = generate_personalized_guidance(
        reading_type,
        cards
    )

    return {

        "selected_cards":
            card_results,

        "overall_interpretation":
            overall,

        "personality_insight":
            personality,

        "relationship_insight":
            relationship,

        "career_insight":
            career,

        "financial_insight":
            finance,

        "personal_growth":
            personal_growth,

        "life_opportunities":
            opportunities,

        "life_trends":
            life_trends,

        "recommendations":
            recommendations,

        "personalized_guidance":
            personalized
    }


# ============================================================
# GET OR CREATE TAROT CARD
# ============================================================

def get_or_create_tarot_card(
    db: Session,
    card_name: str,
    meaning: str
):

    card = (
        db.query(TarotCard)
        .filter(
            TarotCard.name == card_name
        )
        .first()
    )

    if card:

        if not card.meaning:

            card.meaning = meaning

        return card

    card = TarotCard(
        name=card_name,
        meaning=meaning
    )

    db.add(card)

    db.flush()

    return card


# ============================================================
# SAVE COMPLETE TAROT SPREAD
# ============================================================

def serialize_selected_cards(
    cards: List[Dict[str, Any]]
):

    return json.dumps(
        cards,
        ensure_ascii=False
    )


# ============================================================
# LOAD COMPLETE TAROT SPREAD
# ============================================================

def load_selected_cards(
    reading: TarotReading
):

    if not reading.selected_cards:

        return []

    try:

        data = json.loads(
            reading.selected_cards
        )

        if isinstance(data, list):

            return data

        return []

    except Exception:

        return []


# ============================================================
# POST /tarot/reading
# ============================================================
# Available to:
#   - User
#   - Tarot Reader
#   - Spiritual Consultant
#   - Administrator
# ============================================================

@router.post("/tarot/reading")
def create_tarot_reading(

    request: TarotReadingRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_user
    )

):

    try:

        if current_user is None:

            raise HTTPException(
                status_code=401,
                detail="Authentication required."
            )

        # ----------------------------------------------------
        # Reading type
        # ----------------------------------------------------

        reading_type = (
            request.reading_type
            or "single"
        ).strip().lower()

        if reading_type not in READING_CARD_COUNT:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid reading type. "
                    "Use single, three_card, relationship, "
                    "career, life_path or celtic_cross."
                )
            )

        # ----------------------------------------------------
        # Cards
        # ----------------------------------------------------

        cards_input = list(
            request.cards
        )

        # Backward compatibility
        if not cards_input and request.card_name:

            cards_input = [
                TarotCardInput(
                    card_name=request.card_name,
                    card_meaning=request.card_meaning
                )
            ]

        required_count = READING_CARD_COUNT[
            reading_type
        ]

        if len(cards_input) != required_count:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"{reading_type} reading requires "
                    f"{required_count} card(s), but "
                    f"{len(cards_input)} card(s) were received."
                )
            )

        # ----------------------------------------------------
        # Process selected cards
        # ----------------------------------------------------

        processed_cards = []

        for index, card_input in enumerate(
            cards_input
        ):

            card_name = (
                card_input.card_name
                or ""
            ).strip()

            if not card_name:

                raise HTTPException(
                    status_code=400,
                    detail="Card name cannot be empty."
                )

            # ------------------------------------------------
            # Validate against the 78 Tarot cards
            # ------------------------------------------------

            if card_name not in TAROT_CARDS:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Unknown Tarot card: {card_name}"
                    )
                )

            meaning = TAROT_CARDS.get(
                card_name
            )

            position = (
                card_input.position
                or get_card_position(
                    reading_type,
                    index
                )
            )

            # Make sure the card exists in database.
            get_or_create_tarot_card(
                db=db,
                card_name=card_name,
                meaning=meaning
            )

            processed_cards.append({

                "card_name":
                    card_name,

                "meaning":
                    meaning,

                "position":
                    position
            })

        # ----------------------------------------------------
        # Build complete result
        # ----------------------------------------------------

        complete_result = build_complete_tarot_result(
            reading_type,
            processed_cards
        )

        # ----------------------------------------------------
        # Stored interpretation
        # ----------------------------------------------------

        stored_interpretation_parts = []

        stored_interpretation_parts.append(
            "TAROT INTERPRETATION"
        )

        stored_interpretation_parts.append(
            complete_result[
                "overall_interpretation"
            ]
        )

        stored_interpretation_parts.append(
            "PERSONALITY INSIGHT"
        )

        stored_interpretation_parts.append(
            json.dumps(
                complete_result[
                    "personality_insight"
                ],
                ensure_ascii=False
            )
        )

        stored_interpretation_parts.append(
            "RELATIONSHIP INSIGHT"
        )

        stored_interpretation_parts.append(
            json.dumps(
                complete_result[
                    "relationship_insight"
                ],
                ensure_ascii=False
            )
        )

        stored_interpretation_parts.append(
            "CAREER INSIGHT"
        )

        stored_interpretation_parts.append(
            json.dumps(
                complete_result[
                    "career_insight"
                ],
                ensure_ascii=False
            )
        )

        stored_interpretation_parts.append(
            "FINANCIAL INSIGHT"
        )

        stored_interpretation_parts.append(
            json.dumps(
                complete_result[
                    "financial_insight"
                ],
                ensure_ascii=False
            )
        )

        stored_interpretation_parts.append(
            "PERSONAL GROWTH"
        )

        stored_interpretation_parts.append(
            json.dumps(
                complete_result[
                    "personal_growth"
                ],
                ensure_ascii=False
            )
        )

        stored_interpretation_parts.append(
            "LIFE OPPORTUNITIES"
        )

        stored_interpretation_parts.append(
            json.dumps(
                complete_result[
                    "life_opportunities"
                ],
                ensure_ascii=False
            )
        )

        stored_interpretation_parts.append(
            "LIFE TRENDS"
        )

        stored_interpretation_parts.append(
            json.dumps(
                complete_result[
                    "life_trends"
                ],
                ensure_ascii=False
            )
        )

        stored_interpretation_parts.append(
            "RECOMMENDATIONS"
        )

        stored_interpretation_parts.append(
            json.dumps(
                complete_result[
                    "recommendations"
                ],
                ensure_ascii=False
            )
        )

        stored_interpretation_parts.append(
            "PERSONALIZED GUIDANCE"
        )

        stored_interpretation_parts.append(
            json.dumps(
                complete_result[
                    "personalized_guidance"
                ],
                ensure_ascii=False
            )
        )

        stored_interpretation = "\n\n".join(
            stored_interpretation_parts
        )

        # ----------------------------------------------------
        # Save complete Tarot reading
        # ----------------------------------------------------

        tarot_reading = TarotReading(

            user_id=current_user.id,
            created_at = datetime.utcnow(),

            reading_type=reading_type,

            selected_cards=serialize_selected_cards(
                processed_cards
            ),

            interpretation=stored_interpretation,

            personalized_guidance=json.dumps(
                complete_result[
                    "personalized_guidance"
                ],
                ensure_ascii=False
            )
        )

        db.add(
            tarot_reading
        )

        db.commit()

        db.refresh(
            tarot_reading
        )

        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return {

            "success":
                True,

            "message":
                "Detailed Tarot reading generated successfully.",

            "source":
                "tarot_only",

            "tarot_reading_id":
                tarot_reading.id,

            "reading_type":
                reading_type,

            "cards":
                processed_cards,

            "tarot_interpretation":
                complete_result,

            "interpretation":
                complete_result[
                    "overall_interpretation"
                ],

            "personalized_guidance":
                complete_result[
                    "personalized_guidance"
                ]
        }

    except HTTPException:

        db.rollback()

        raise

    except Exception as e:

        db.rollback()

        print(
            "\n========================================"
        )

        print(
            "TAROT READING ERROR"
        )

        print(
            "========================================"
        )

        print(
            "ERROR TYPE:",
            type(e).__name__
        )

        print(
            "ERROR:",
            str(e)
        )

        print(
            "========================================\n"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Tarot reading failed: "
                + str(e)
            )
        )


# ============================================================
# GET /tarot/meaning/{card_name}
# ============================================================

@router.get("/tarot/meaning/{card_name}")
def get_card_meaning(
    card_name: str
):

    meaning = TAROT_CARDS.get(
        card_name
    )

    if not meaning:

        raise HTTPException(
            status_code=404,
            detail="Tarot card not found."
        )

    return {

        "success":
            True,

        "source":
            "tarot_only",

        "card_name":
            card_name,

        "meaning":
            meaning
    }


# ============================================================
# GET /tarot/reading/{card_name}
# ============================================================

@router.get("/tarot/reading/{card_name}")
def get_tarot_reading(
    card_name: str
):

    meaning = TAROT_CARDS.get(
        card_name
    )

    if not meaning:

        raise HTTPException(
            status_code=404,
            detail="Tarot card not found."
        )

    cards = [

        {

            "card_name":
                card_name,

            "meaning":
                meaning,

            "position":
                "Focus"
        }

    ]

    result = build_complete_tarot_result(
        "single",
        cards
    )

    return {

        "success":
            True,

        "source":
            "tarot_only",

        "card_name":
            card_name,

        "meaning":
            meaning,

        "interpretation":
            result
    }


# ============================================================
# GET /tarot/latest
# ============================================================
# Available to all authenticated project roles.
# ============================================================

@router.get("/tarot/latest")
def get_latest_tarot_reading(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_user
    )

):

    try:

        latest_reading = (

            db.query(TarotReading)

            .filter(
                TarotReading.user_id
                == current_user.id
            )

            .order_by(
                TarotReading.id.desc()
            )

            .first()
        )

        if not latest_reading:

            raise HTTPException(
                status_code=404,
                detail="No Tarot reading found."
            )

        selected_cards = load_selected_cards(
            latest_reading
        )

        return {

            "success":
                True,

            "source":
                "tarot_only",

            "tarot_reading_id":
                latest_reading.id,

            "reading_type":
                latest_reading.reading_type
                or "single",

            "selected_cards":
                selected_cards,

            "cards":
                selected_cards,

            "interpretation":
                latest_reading.interpretation,

            "personalized_guidance":
                latest_reading.personalized_guidance
        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "LATEST TAROT ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    # ============================================================
# GET /tarot/history
# Returns Tarot readings for the logged-in user
# ============================================================

@router.get("/tarot/history")
def get_tarot_reading_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    readings = (
        db.query(TarotReading)
        .filter(TarotReading.user_id == current_user.id)
        .order_by(TarotReading.id.desc())
        .all()
    )

    return {
        "success": True,
        "total": len(readings),
        "readings": [
            {
                "id": reading.id,
                "user_id": reading.user_id,
                "reading_type": reading.reading_type or "single",
                "question": reading.question,
                "interpretation": reading.interpretation,
                "personalized_guidance": reading.personalized_guidance,
                "selected_cards": load_selected_cards(reading),
                "created_at": (
                    reading.created_at.isoformat()
                    if reading.created_at
                    else None
                )
            }
            for reading in readings
        ]
    }


# ============================================================
# POST /personalized-guidance/tarot
# ============================================================
# Available to all authenticated project roles.
# ============================================================

@router.post(
    "/personalized-guidance/tarot"
)
def tarot_personalized_guidance(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_user
    )

):

    try:

        latest_reading = (

            db.query(TarotReading)

            .filter(
                TarotReading.user_id
                == current_user.id
            )

            .order_by(
                TarotReading.id.desc()
            )

            .first()
        )

        if not latest_reading:

            raise HTTPException(
                status_code=404,
                detail=(
                    "No Tarot reading found. "
                    "Please generate a Tarot reading first."
                )
            )

        reading_type = (
            latest_reading.reading_type
            or "single"
        )

        selected_cards = load_selected_cards(
            latest_reading
        )

        if not selected_cards:

            raise HTTPException(
                status_code=404,
                detail=(
                    "The latest Tarot reading does not "
                    "contain selected card information."
                )
            )

        cards = []

        for card in selected_cards:

            cards.append({

                "card_name":
                    card.get(
                        "card_name",
                        "Tarot Card"
                    ),

                "meaning":
                    card.get(
                        "meaning",
                        "Symbolic Tarot meaning."
                    ),

                "position":
                    card.get(
                        "position",
                        "Focus"
                    )
            })

        guidance = generate_personalized_guidance(
            reading_type=reading_type,
            cards=cards
        )

        personality = generate_personality_insight(
            cards
        )

        relationship = generate_relationship_insight(
            cards
        )

        career = generate_career_insight(
            cards
        )

        finance = generate_financial_insight(
            cards
        )

        personal_growth = generate_personal_growth(
            cards
        )

        opportunities = generate_life_opportunities(
            cards
        )

        life_trends = generate_life_trends(
            reading_type,
            cards
        )

        return {

            "success":
                True,

            "source":
                "tarot_only",

            "tarot_reading_id":
                latest_reading.id,

            "reading_type":
                reading_type,

            "tarot": {

                "cards":
                    cards
            },

            "tarot_interpretation":
                latest_reading.interpretation,

            "personalized_guidance":
                guidance,

            "tarot_insights": {

                "personality":
                    personality,

                "relationship":
                    relationship,

                "career":
                    career,

                "finance":
                    finance,

                "personal_growth":
                    personal_growth,

                "life_opportunities":
                    opportunities,

                "life_trends":
                    life_trends
            }
        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "\n========================================"
        )

        print(
            "TAROT GUIDANCE ERROR"
        )

        print(
            "========================================"
        )

        print(
            "ERROR TYPE:",
            type(e).__name__
        )

        print(
            "ERROR:",
            str(e)
        )

        print(
            "========================================\n"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Tarot personalized guidance failed: "
                + str(e)
            )
        )


# ============================================================
# GET /tarot/reader/access
#
# TAROT READER / ADMIN ONLY
# ============================================================

@router.get(
    "/tarot/reader/access"
)
def tarot_reader_access(
    current_user: User = Depends(
        require_tarot_reader
    )
):
    """
    Access endpoint for Tarot Readers and Administrators.

    This verifies that the logged-in account has
    Tarot Reader privileges.
    """

    return {

        "success":
            True,

        "message":
            "Tarot Reader access granted.",

        "username":
            current_user.username,

        "role":
            current_user.role,

        "permissions": [

            "Create Tarot readings",

            "Manage Tarot reading workflows",

            "View Tarot interpretations",

            "Provide Tarot guidance",

            "Access Tarot-related reports"
        ]
    }


# ============================================================
# POST /tarot/personalized-guidance
#
# Old compatibility endpoint
# ============================================================

@router.post(
    "/tarot/personalized-guidance"
)
def tarot_personalized_guidance_old(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_user
    )

):

    return tarot_personalized_guidance(
        db=db,
        current_user=current_user
    )