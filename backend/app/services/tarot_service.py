import random
from typing import List, Dict, Any

FULL_TAROT_78_DECK = [
    # --- 22 MAJOR ARCANA ---
    {"name": "The Fool", "suit": "Major", "upright": "New beginnings, spontaneity, leap of faith", "reversed": "Recklessness, risk-taking, hesitation"},
    {"name": "The Magician", "suit": "Major", "upright": "Manifestation, resourcefulness, power, inspired action", "reversed": "Manipulation, unexpressed talent, illusions"},
    {"name": "The High Priestess", "suit": "Major", "upright": "Intuition, sacred knowledge, divine feminine, subconscious", "reversed": "Secrets, disconnected intuition, surface focus"},
    {"name": "The Empress", "suit": "Major", "upright": "Abundance, nurturing, fertility, artistic creativity", "reversed": "Creative block, dependence, disharmony"},
    {"name": "The Emperor", "suit": "Major", "upright": "Authority, establishment, structure, solid foundation", "reversed": "Domination, excessive control, lack of discipline"},
    {"name": "The Hierophant", "suit": "Major", "upright": "Spiritual wisdom, tradition, guidance, sacred institutions", "reversed": "Personal beliefs, rebellion, unconventional paths"},
    {"name": "The Lovers", "suit": "Major", "upright": "Love, harmony, partnerships, aligned choices and values", "reversed": "Self-love deficit, disharmony, misaligned values"},
    {"name": "The Chariot", "suit": "Major", "upright": "Control, willpower, success, determination, victory", "reversed": "Self-discipline loss, lack of direction, aggression"},
    {"name": "Strength", "suit": "Major", "upright": "Courage, compassion, inner stamina, patience, resilience", "reversed": "Self-doubt, weakness, raw emotional overwhelm"},
    {"name": "The Hermit", "suit": "Major", "upright": "Soul-searching, introspection, inner guidance, solitude", "reversed": "Isolation, loneliness, withdrawal from growth"},
    {"name": "Wheel of Fortune", "suit": "Major", "upright": "Good luck, destiny, cycles of change, turning point", "reversed": "Bad luck, resistance to change, breaking repetitive cycles"},
    {"name": "Justice", "suit": "Major", "upright": "Fairness, truth, cause and effect, legal equilibrium", "reversed": "Dishonesty, lack of accountability, unfair bias"},
    {"name": "The Hanged Man", "suit": "Major", "upright": "Surrender, letting go, new perspective, pausing", "reversed": "Delays, resistance, stalling inevitable growth"},
    {"name": "Death", "suit": "Major", "upright": "Transformation, ending, new chapter, deep metamorphosis", "reversed": "Fear of change, repeating patterns, decay of momentum"},
    {"name": "Temperance", "suit": "Major", "upright": "Balance, moderation, patience, purpose, alchemy", "reversed": "Imbalance, excess, self-healing necessity"},
    {"name": "The Devil", "suit": "Major", "upright": "Shadow self, attachment, restriction, material bond", "reversed": "Release, freedom, overcoming limiting habits"},
    {"name": "The Tower", "suit": "Major", "upright": "Sudden revelation, upheaval, breaking illusions, awakening", "reversed": "Disaster avoided, delaying inevitable, fear of suffering"},
    {"name": "The Star", "suit": "Major", "upright": "Hope, faith, renewal, spiritual inspiration, serenity", "reversed": "Despair, lack of faith, discouragement, feeling lost"},
    {"name": "The Moon", "suit": "Major", "upright": "Illusion, fear, subconscious clarity, intuition unveiling", "reversed": "Release of fear, unveiled secrets, clarity restored"},
    {"name": "The Sun", "suit": "Major", "upright": "Positivity, warmth, success, vitality, celebration", "reversed": "Inner child blocks, temporary sadness, cloudiness"},
    {"name": "Judgement", "suit": "Major", "upright": "Reckoning, awakening, higher calling, absolute rebirth", "reversed": "Self-doubt, harsh self-criticism, refusal to learn"},
    {"name": "The World", "suit": "Major", "upright": "Completion, integration, accomplishment, wholeness", "reversed": "Seeking closure, shortcuts, incomplete cycle"},

    # --- MINOR ARCANA: CUPS (Water / Emotion) ---
    {"name": "Ace of Cups", "suit": "Cups", "upright": "New feelings, spiritual outpouring, unconditional love", "reversed": "Emotional drain, blocked intuition, withheld vulnerability"},
    {"name": "Two of Cups", "suit": "Cups", "upright": "Unified love, partnership, mutual attraction, harmony", "reversed": "Imbalance, broken trust, miscommunication, tension"},
    {"name": "Three of Cups", "suit": "Cups", "upright": "Celebration, friendship, collaboration, creative community", "reversed": "Overindulgence, gossip, feeling isolated from peer group"},
    {"name": "Four of Cups", "suit": "Cups", "upright": "Meditation, contemplation, apathy, reevaluation", "reversed": "New possibilities, seizing sudden opportunities, awakening"},
    {"name": "Five of Cups", "suit": "Cups", "upright": "Regret, sorrow, focusing on loss, grief", "reversed": "Acceptance, moving on, emotional recovery, forgiveness"},
    {"name": "Six of Cups", "suit": "Cups", "upright": "Nostalgia, childhood memories, innocence, reunion", "reversed": "Living in the past, moving forward, leaving old habits"},
    {"name": "Seven of Cups", "suit": "Cups", "upright": "Choices, imagination, illusion, daydreaming", "reversed": "Clarity, decisive focus, reality check, commitment"},
    {"name": "Eight of Cups", "suit": "Cups", "upright": "Walking away, seeking higher truth, leaving the past", "reversed": "Fear of moving on, remaining in stagnation, indecision"},
    {"name": "Nine of Cups", "suit": "Cups", "upright": "Contentment, satisfaction, gratitude, wish fulfillment", "reversed": "Greed, superficial indulgence, inner dissatisfaction"},
    {"name": "Ten of Cups", "suit": "Cups", "upright": "Divine love, family harmony, ultimate emotional alignment", "reversed": "Shattered ideals, domestic friction, misaligned goals"},
    {"name": "Page of Cups", "suit": "Cups", "upright": "Creative inspiration, intuitive message, curiosity", "reversed": "Emotional vulnerability, moodiness, creative doubt"},
    {"name": "Knight of Cups", "suit": "Cups", "upright": "Romance, charm, chivalry, pursuing ideals", "reversed": "Overactive imagination, unrealistic expectations, jealousy"},
    {"name": "Queen of Cups", "suit": "Cups", "upright": "Compassion, emotional security, intuitive calm", "reversed": "Codependency, emotional overwhelm, martyrdom"},
    {"name": "King of Cups", "suit": "Cups", "upright": "Emotional balance, wisdom, diplomatic mastery", "reversed": "Emotional manipulation, mood swings, detachment"},

    # --- MINOR ARCANA: WANDS (Fire / Action) ---
    {"name": "Ace of Wands", "suit": "Wands", "upright": "Inspiration, creative spark, enthusiasm, bold new drive", "reversed": "Delays, creative blockage, lack of passion"},
    {"name": "Two of Wands", "suit": "Wands", "upright": "Future planning, discovery, stepping outside comfort zone", "reversed": "Fear of the unknown, hesitation, bad timing"},
    {"name": "Three of Wands", "suit": "Wands", "upright": "Expansion, foresight, rapid progress, horizon expansion", "reversed": "Delays, obstacles in execution, feeling restricted"},
    {"name": "Four of Wands", "suit": "Wands", "upright": "Celebration, harmony, homecoming, festive milestone", "reversed": "Personal friction, transient tension, postponed event"},
    {"name": "Five of Wands", "suit": "Wands", "upright": "Competition, conflict, tension, creative friction", "reversed": "Conflict resolution, finding common ground, agreement"},
    {"name": "Six of Wands", "suit": "Wands", "upright": "Public recognition, victory, triumphant success", "reversed": "Ego fall, lack of confidence, overlooked achievements"},
    {"name": "Seven of Wands", "suit": "Wands", "upright": "Perseverance, defensive strength, conviction under pressure", "reversed": "Giving up, overwhelmed by resistance, burnout"},
    {"name": "Eight of Wands", "suit": "Wands", "upright": "Swift momentum, rapid communication, lightning progress", "reversed": "Misunderstandings, frantic chaos, sudden delays"},
    {"name": "Nine of Wands", "suit": "Wands", "upright": "Resilience, grit, nearly crossing the finish line", "reversed": "Exhaustion, stubborn defensiveness, burnout"},
    {"name": "Ten of Wands", "suit": "Wands", "upright": "Carrying heavy burdens, duty, intense responsibility", "reversed": "Delegation, releasing unnecessary obligations, relief"},
    {"name": "Page of Wands", "suit": "Wands", "upright": "Exploration, excitement, spark of bold ventures", "reversed": "Procrastination, lack of follow-through, low drive"},
    {"name": "Knight of Wands", "suit": "Wands", "upright": "Audacity, energy, passionate action, adventure", "reversed": "Impatience, reckless haste, hot temper"},
    {"name": "Queen of Wands", "suit": "Wands", "upright": "Radiance, confidence, social magnetism, boldness", "reversed": "Insecurity, demanding nature, demanding praise"},
    {"name": "King of Wands", "suit": "Wands", "upright": "Visionary leadership, honor, big-picture mastery", "reversed": "Impulsive dictatorship, unrealistic vision, arrogance"},

    # --- MINOR ARCANA: SWORDS (Air / Mind) ---
    {"name": "Ace of Swords", "suit": "Swords", "upright": "Breakthrough, mental clarity, undeniable truth, sharp focus", "reversed": "Confusion, hostililty, misjudgment, cloudiness"},
    {"name": "Two of Swords", "suit": "Swords", "upright": "Difficult decisions, stalemate, avoidance of truth", "reversed": "Information overload, agonizing choice, breaking impasse"},
    {"name": "Three of Swords", "suit": "Swords", "upright": "Heartbreak, painful release, truth emerging through sorrow", "reversed": "Recovery, forgiveness, moving past grief, self-soothing"},
    {"name": "Four of Swords", "suit": "Swords", "upright": "Rest, recuperation, sanctuary, mental restoration", "reversed": "Exhaustion, returning too soon, burnout relapse"},
    {"name": "Five of Swords", "suit": "Swords", "upright": "Unethical victory, friction, hollow conquest", "reversed": "Reconciliation, making amends, putting pride aside"},
    {"name": "Six of Swords", "suit": "Swords", "upright": "Transition, moving towards calm waters, spiritual journey", "reversed": "Emotional baggage, trapped in past, turbulent voyage"},
    {"name": "Seven of Swords", "suit": "Swords", "upright": "Strategy, stealth, resourcefulness, tactical maneuvers", "reversed": "Confession, exposed deception, seeking honest terms"},
    {"name": "Eight of Swords", "suit": "Swords", "upright": "Self-imposed limitation, victimization, mental traps", "reversed": "Freedom, new perspective, breaking mental barriers"},
    {"name": "Nine of Swords", "suit": "Swords", "upright": "Anxiety, worry, insomnia, nightmares, stress", "reversed": "Hope, recovery from fear, objective clarity"},
    {"name": "Ten of Swords", "suit": "Swords", "upright": "Rock bottom, dramatic ending, dawn follows the dark", "reversed": "Rising again, inevitable recovery, lessons integrated"},
    {"name": "Page of Swords", "suit": "Swords", "upright": "Intellectual curiosity, truth-seeking, vigilant mind", "reversed": "Deception, harsh gossip, all talk and no action"},
    {"name": "Knight of Swords", "suit": "Swords", "upright": "Ambitious speed, direct action, sharp mental focus", "reversed": "Rude arguments, thoughtless force, burnout sprint"},
    {"name": "Queen of Swords", "suit": "Swords", "upright": "Clear boundaries, razor-sharp intellect, honest counsel", "reversed": "Cold detachment, cruel bitterness, emotional isolation"},
    {"name": "King of Swords", "suit": "Swords", "upright": "Mental authority, ethical truth, strategic brilliance", "reversed": "Tyranny, manipulation of facts, cold harshness"},

    # --- MINOR ARCANA: PENTACLES (Earth / Body & Material) ---
    {"name": "Ace of Pentacles", "suit": "Pentacles", "upright": "Material abundance, financial opportunity, grounded venture", "reversed": "Lost investment, missed opportunity, unstable footing"},
    {"name": "Two of Pentacles", "suit": "Pentacles", "upright": "Balancing priorities, flexibility, adaptable management", "reversed": "Financial overload, disorganization, dropped balls"},
    {"name": "Three of Pentacles", "suit": "Pentacles", "upright": "Teamwork, craftsmanship, collaborative mastery", "reversed": "Disorganized team, low quality, lack of alignment"},
    {"name": "Four of Pentacles", "suit": "Pentacles", "upright": "Financial security, frugality, conservation of wealth", "reversed": "Greed, hoarding, fear of material insecurity"},
    {"name": "Five of Pentacles", "suit": "Pentacles", "upright": "Hardship, feeling left in the cold, temporary lack", "reversed": "Recovery, financial resurgence, finding refuge"},
    {"name": "Six of Pentacles", "suit": "Pentacles", "upright": "Generosity, charity, mutual support, balanced prosperity", "reversed": "Debt, strings attached, power imbalances"},
    {"name": "Seven of Pentacles", "suit": "Pentacles", "upright": "Long-term investment, patience, evaluating progress", "reversed": "Impatience, wasted effort, lack of harvest"},
    {"name": "Eight of Pentacles", "suit": "Pentacles", "upright": "Apprenticeship, deliberate practice, high skill mastery", "reversed": "Lack of motivation, shortcuts, rushed uninspired work"},
    {"name": "Nine of Pentacles", "suit": "Pentacles", "upright": "Self-reliance, luxury, personal harvest, abundance", "reversed": "Over-spending, superficial reliance, financial dependency"},
    {"name": "Ten of Pentacles", "suit": "Pentacles", "upright": "Generational wealth, lasting legacy, family security", "reversed": "Family disputes over money, shaky financial foundation"},
    {"name": "Page of Pentacles", "suit": "Pentacles", "upright": "Manifestation study, career ambition, practical curiosity", "reversed": "Procrastination, missed educational milestones"},
    {"name": "Knight of Pentacles", "suit": "Pentacles", "upright": "Routine dedication, methodical progress, unwavering duty", "reversed": "Stubbornness, perfectionist paralysis, stagnation"},
    {"name": "Queen of Pentacles", "suit": "Pentacles", "upright": "Practical warmth, nurturing security, earth prosperity", "reversed": "Material anxiety, neglect of self-care, smothering"},
    {"name": "King of Pentacles", "suit": "Pentacles", "upright": "Empire building, business acumen, abundance mastery", "reversed": "Material greed, corruption, bad financial guidance"}
]

SPREAD_CONFIGS = {
    "single": ["Daily Focus & Core Essence"],
    "three_card": ["Past Influence", "Present Catalyst", "Future Horizon"],
    "relationship": ["Your Inner Energy", "Partner's Energy", "Connection Dynamic", "Underlying Challenge", "Harmonious Outcome"],
    "career": ["Current Position", "Primary Challenge", "Hidden Strength", "Key Opportunity", "Ultimate Outcome"],
    "celtic_cross": [
        "Present Situation", "Immediate Obstacle", "Subconscious Basis", "Recent Past",
        "Best Potential / Crown", "Near Future", "Internal Power & Attitude",
        "External Environment & Allies", "Hopes, Fears & Vulnerabilities", "Final Resolution"
    ],
    "life_path": ["Soul Root & Foundation", "Current Spiritual Stage", "Hidden Potential", "Karmic Lesson to Master", "Higher Destiny Horizon"]
}


class TarotIntelligenceEngine:
    def get_full_deck_summary(self) -> List[Dict[str, Any]]:
        return [{"id": i, "name": c["name"], "suit": c["suit"]} for i, c in enumerate(FULL_TAROT_78_DECK)]

    def draw_spread(self, spread_type: str = "three_card", forced_indices: List[int] = None) -> Dict[str, Any]:
        positions = SPREAD_CONFIGS.get(spread_type, SPREAD_CONFIGS["three_card"])
        num_cards = len(positions)

        # 1. Use Quantum indices if provided from the API
        if forced_indices and len(forced_indices) >= num_cards:
            # We use modulo (%) 78 just in case a number is higher than the deck size
            selected_cards = [FULL_TAROT_78_DECK[idx % 78] for idx in forced_indices[:num_cards]]
        
        # 2. Fallback to standard Python randomness if Quantum API is offline
        else:
            selected_cards = random.sample(FULL_TAROT_78_DECK, num_cards)

        drawn: List[Dict[str, Any]] = []
        for i, card in enumerate(selected_cards):
            is_reversed = random.random() < 0.35
            drawn.append({
                "position": positions[i],
                "name": card["name"],
                "suit": card["suit"],
                "orientation": "Reversed" if is_reversed else "Upright",
                "meaning": card["reversed"] if is_reversed else card["upright"]
            })

        return {
            "spread_type": spread_type,
            "cards_count": len(drawn),
            "cards": drawn
        }

    def pick_specific_cards(self, card_indices: List[int], spread_type: str = "three_card") -> Dict[str, Any]:
        """Allows seeker to manually choose specific cards from the 78-card arc."""
        positions = SPREAD_CONFIGS.get(spread_type, SPREAD_CONFIGS["three_card"])
        drawn: List[Dict[str, Any]] = []

        for i, idx in enumerate(card_indices[:len(positions)]):
            card = FULL_TAROT_78_DECK[idx % len(FULL_TAROT_78_DECK)]
            is_reversed = random.random() < 0.35
            drawn.append({
                "position": positions[i],
                "name": card["name"],
                "suit": card["suit"],
                "orientation": "Reversed" if is_reversed else "Upright",
                "meaning": card["reversed"] if is_reversed else card["upright"]
            })

        return {
            "spread_type": spread_type,
            "cards_count": len(drawn),
            "cards": drawn
        }