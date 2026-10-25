import cv2

import mediapipe as mp

import numpy as np

import math

from mediapipe.tasks import python

from mediapipe.tasks.python import vision

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, HTMLResponse, RedirectResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import hashlib, random, json, os, ssl, urllib.request, urllib.parse, time
from pathlib import Path
from io import BytesIO
from datetime import datetime, timedelta, timezone
from PIL import Image, ImageOps

try:
    from zoneinfo import ZoneInfo
    KOLKATA_TZ = ZoneInfo("Asia/Kolkata")
except Exception:
    KOLKATA_TZ = timezone(timedelta(hours=5, minutes=30))

def load_env_file():
    for env_path in [Path(__file__).resolve().parent.parent.parent / '.env', Path(__file__).resolve().parent.parent / '.env']:
        if env_path.exists():
            try:
                for line in env_path.read_text(encoding='utf-8').splitlines():
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k and k not in os.environ:
                            os.environ[k] = v
            except Exception:
                pass

load_env_file()

app=FastAPI(title='AI Palmistry & Tarot Intelligence Platform API')
app.add_middleware(CORSMiddleware,allow_origins=['*'],allow_credentials=True,allow_methods=['*'],allow_headers=['*'])

DATA_DIR=Path(__file__).resolve().parent.parent/'data'
DATA_DIR.mkdir(exist_ok=True)
USERS_FILE=DATA_DIR/'users.json'
DEFAULT_USERS={

 'demo@example.com': {'name':'Saitejashree','password':'password','role':'User'},

 'reader@example.com': {'name':'Tarot Reader','password':'password','role':'Tarot Reader'},

 'consultant@example.com': {'name':'Consultant','password':'password','role':'Spiritual Consultant'},

 'admin@example.com': {'name':'Admin','password':'password','role':'Administrator'},

}

if USERS_FILE.exists():

    try:

        USERS=json.loads(USERS_FILE.read_text(encoding='utf-8'))

    except Exception:

        USERS=DEFAULT_USERS.copy()

else:

    USERS=DEFAULT_USERS.copy()



def save_users():

    USERS_FILE.write_text(json.dumps(USERS, indent=2), encoding='utf-8')



def password_hash(password:str)->str:

    return hashlib.sha256(password.encode('utf-8')).hexdigest()



def password_matches(stored:str,password:str)->bool:

    # Supports old demo accounts that may still contain plaintext passwords.

    return stored == password or stored == password_hash(password)



def migrate_passwords():

    changed=False

    for account in USERS.values():

        pwd=account.get('password','')

        if pwd in {'password'}:

            account['password']=password_hash(pwd)

            changed=True

    if changed:

        save_users()





migrate_passwords()



TAROT = [

    # =========================
    # MAJOR ARCANA
    # =========================

    {
        'name': 'The Fool',
        'meaning': 'New beginnings, adventure, freedom and trust.',
        'category': 'Journey',
        'emotional': 'Openness to new experiences and emotional possibilities.',
        'strength': 'Curiosity, courage and willingness to explore.',
        'challenge': 'Impulsiveness or moving forward without enough preparation.',
        'guidance': 'Embrace new possibilities while remaining aware of your choices.'
    },

    {
        'name': 'The Magician',
        'meaning': 'Skill, confidence, action and focused creation.',
        'category': 'Power',
        'emotional': 'Confidence in expressing feelings and personal intentions.',
        'strength': 'Resourcefulness, communication and ability to take initiative.',
        'challenge': 'Trying to control everything or relying too heavily on personal ability.',
        'guidance': 'Use your available skills and resources with clear intention.'
    },

    {
        'name': 'The High Priestess',
        'meaning': 'Intuition, reflection, hidden knowledge and patience.',
        'category': 'Intuition',
        'emotional': 'Deep feelings that may require time and quiet reflection.',
        'strength': 'Intuition, observation and emotional awareness.',
        'challenge': 'Overthinking, uncertainty or keeping too much inside.',
        'guidance': 'Listen to your intuition while giving yourself time to understand the situation.'
    },

    {
        'name': 'The Empress',
        'meaning': 'Growth, creativity, care and abundance.',
        'category': 'Growth',
        'emotional': 'Warmth, affection, care and emotional nourishment.',
        'strength': 'Creativity, compassion and ability to support growth.',
        'challenge': 'Giving too much to others or neglecting your own needs.',
        'guidance': 'Nurture what matters while maintaining healthy boundaries.'
    },

    {
        'name': 'The Emperor',
        'meaning': 'Structure, leadership, stability and responsibility.',
        'category': 'Leadership',
        'emotional': 'A desire for stability, security and dependable relationships.',
        'strength': 'Leadership, discipline and responsible decision-making.',
        'challenge': 'Rigidity, excessive control or difficulty adapting.',
        'guidance': 'Create structure without becoming resistant to necessary change.'
    },

    {
        'name': 'The Hierophant',
        'meaning': 'Tradition, learning, guidance and established values.',
        'category': 'Wisdom',
        'emotional': 'Seeking security through shared values and trusted connections.',
        'strength': 'Learning, commitment and respect for meaningful principles.',
        'challenge': 'Following expectations without questioning whether they still fit.',
        'guidance': 'Learn from established wisdom while forming your own understanding.'
    },

    {
        'name': 'The Lovers',
        'meaning': 'Connection, values, choices and meaningful relationships.',
        'category': 'Relationships',
        'emotional': 'Connection, attraction, harmony and emotional alignment.',
        'strength': 'Empathy, communication and ability to build meaningful connections.',
        'challenge': 'Indecision or choosing according to external expectations.',
        'guidance': 'Make choices that are aligned with your genuine values.'
    },

    {
        'name': 'The Chariot',
        'meaning': 'Determination, direction, momentum and self-control.',
        'category': 'Drive',
        'emotional': 'Strong emotional determination and desire to move forward.',
        'strength': 'Focus, discipline and persistence.',
        'challenge': 'Forcing progress or becoming overly focused on winning.',
        'guidance': 'Move forward with discipline while maintaining balance.'
    },

    {
        'name': 'Strength',
        'meaning': 'Courage, compassion, resilience and inner balance.',
        'category': 'Resilience',
        'emotional': 'Patience, compassion and emotional self-control.',
        'strength': 'Inner strength, courage and calm persistence.',
        'challenge': 'Suppressing emotions or believing strength means never asking for help.',
        'guidance': 'Use patience and compassion as forms of strength.'
    },

    {
        'name': 'The Hermit',
        'meaning': 'Self-reflection, wisdom and a deliberate pause.',
        'category': 'Reflection',
        'emotional': 'Need for emotional space, reflection and inner understanding.',
        'strength': 'Wisdom, independence and thoughtful observation.',
        'challenge': 'Isolation or withdrawing too much from others.',
        'guidance': 'Take time to reflect, but remain open to meaningful connection.'
    },

    {
        'name': 'Wheel of Fortune',
        'meaning': 'Cycles, changing circumstances and new possibilities.',
        'category': 'Change',
        'emotional': 'Changing emotional circumstances and acceptance of uncertainty.',
        'strength': 'Adaptability and ability to recognize new opportunities.',
        'challenge': 'Feeling powerless when circumstances change unexpectedly.',
        'guidance': 'Adapt to changing circumstances and focus on what you can influence.'
    },

    {
        'name': 'Justice',
        'meaning': 'Balance, accountability, clarity and fair decisions.',
        'category': 'Balance',
        'emotional': 'Need for honesty, fairness and emotional clarity.',
        'strength': 'Objectivity, accountability and thoughtful judgment.',
        'challenge': 'Being overly critical of yourself or others.',
        'guidance': 'Consider facts, consequences and fairness before making decisions.'
    },

    {
        'name': 'The Hanged Man',
        'meaning': 'Pause, perspective, surrender and seeing things differently.',
        'category': 'Perspective',
        'emotional': 'A period of emotional pause and reconsideration.',
        'strength': 'Patience, flexibility and ability to see another perspective.',
        'challenge': 'Feeling stuck or delaying action unnecessarily.',
        'guidance': 'Step back and consider whether a different perspective could help.'
    },

    {
        'name': 'Death',
        'meaning': 'Transformation, release and transition into a new phase.',
        'category': 'Transformation',
        'emotional': 'Emotional transition and release of what no longer serves you.',
        'strength': 'Ability to adapt, let go and begin again.',
        'challenge': 'Resistance to change or fear of endings.',
        'guidance': 'Allow necessary endings to create space for new beginnings.'
    },

    {
        'name': 'Temperance',
        'meaning': 'Moderation, harmony, patience and healthy integration.',
        'category': 'Harmony',
        'emotional': 'Emotional balance, patience and steady connection.',
        'strength': 'Adaptability, patience and ability to create balance.',
        'challenge': 'Avoiding necessary action in the name of maintaining peace.',
        'guidance': 'Seek balance while still taking appropriate action.'
    },

    {
        'name': 'The Devil',
        'meaning': 'Attachment, temptation, patterns and awareness of limitations.',
        'category': 'Awareness',
        'emotional': 'Strong attachments, desires or emotionally repetitive patterns.',
        'strength': 'Awareness of patterns and ability to recognize what influences you.',
        'challenge': 'Dependency, unhealthy attachment or feeling trapped.',
        'guidance': 'Identify patterns that limit you and consider healthier choices.'
    },

    {
        'name': 'The Tower',
        'meaning': 'Sudden change, truth and rebuilding on stronger foundations.',
        'category': 'Reset',
        'emotional': 'Strong emotional shifts that may challenge existing assumptions.',
        'strength': 'Ability to rebuild and recognize important truths.',
        'challenge': 'Resistance to unexpected change.',
        'guidance': 'Allow outdated structures to be reconsidered rather than resisting every change.'
    },

    {
        'name': 'The Star',
        'meaning': 'Hope, inspiration, healing and guidance.',
        'category': 'Hope',
        'emotional': 'Renewed hope, openness and emotional healing.',
        'strength': 'Optimism, inspiration and ability to recover.',
        'challenge': 'Waiting for change without taking practical steps.',
        'guidance': 'Keep hope while supporting it with realistic action.'
    },

    {
        'name': 'The Moon',
        'meaning': 'Intuition, uncertainty, dreams and emotional awareness.',
        'category': 'Awareness',
        'emotional': 'Complex feelings, sensitivity and uncertainty.',
        'strength': 'Imagination, intuition and emotional perception.',
        'challenge': 'Confusion, fear or assuming something without enough information.',
        'guidance': 'Give yourself time to separate intuition from uncertainty.'
    },

    {
        'name': 'The Sun',
        'meaning': 'Success, joy, vitality and confidence.',
        'category': 'Success',
        'emotional': 'Warmth, openness, joy and emotional confidence.',
        'strength': 'Optimism, confidence and clear self-expression.',
        'challenge': 'Overconfidence or overlooking details because things feel positive.',
        'guidance': 'Build on positive momentum while remaining grounded.'
    },

    {
        'name': 'Judgement',
        'meaning': 'Reflection, realization, renewal and important decisions.',
        'category': 'Renewal',
        'emotional': 'Emotional realization and release from old judgments.',
        'strength': 'Self-awareness, learning and ability to make meaningful changes.',
        'challenge': 'Being overly harsh about past choices.',
        'guidance': 'Learn from the past without allowing it to define your future.'
    },

    {
        'name': 'The World',
        'meaning': 'Completion, integration, achievement and a new chapter.',
        'category': 'Completion',
        'emotional': 'A sense of fulfillment, closure and emotional integration.',
        'strength': 'Perspective, accomplishment and ability to bring things together.',
        'challenge': 'Difficulty recognizing when a chapter has genuinely ended.',
        'guidance': 'Acknowledge progress and use what you learned as you move forward.'
    },


    # =========================
    # WANDS
    # =========================

    {
        'name': 'Ace of Wands',
        'meaning': 'Inspiration, enthusiasm, new energy and creative beginnings.',
        'category': 'Inspiration',
        'emotional': 'Excitement and renewed emotional energy.',
        'strength': 'Initiative, creativity and enthusiasm.',
        'challenge': 'Starting quickly without a sustainable plan.',
        'guidance': 'Channel your enthusiasm into a clear first step.'
    },

    {
        'name': 'Two of Wands',
        'meaning': 'Planning, possibilities, future direction and choice.',
        'category': 'Planning',
        'emotional': 'Considering what you want before committing emotionally.',
        'strength': 'Vision, planning and awareness of possibilities.',
        'challenge': 'Overplanning without taking action.',
        'guidance': 'Choose a direction and turn your plans into practical steps.'
    },

    {
        'name': 'Three of Wands',
        'meaning': 'Expansion, progress, preparation and looking ahead.',
        'category': 'Expansion',
        'emotional': 'Growing confidence about future possibilities.',
        'strength': 'Vision, patience and long-term thinking.',
        'challenge': 'Waiting for results instead of adjusting your approach.',
        'guidance': 'Build on your progress while staying open to new opportunities.'
    },

    {
        'name': 'Four of Wands',
        'meaning': 'Celebration, stability, community and achievement.',
        'category': 'Celebration',
        'emotional': 'Security, belonging and shared happiness.',
        'strength': 'Ability to create stability and supportive connections.',
        'challenge': 'Becoming too comfortable with the current situation.',
        'guidance': 'Appreciate stability while continuing to grow.'
    },

    {
        'name': 'Five of Wands',
        'meaning': 'Competition, disagreement, challenge and differing perspectives.',
        'category': 'Challenge',
        'emotional': 'Emotional tension caused by disagreement or competition.',
        'strength': 'Ability to handle challenge and defend your perspective.',
        'challenge': 'Unnecessary conflict or turning every difference into competition.',
        'guidance': 'Use disagreement as an opportunity to understand different perspectives.'
    },

    {
        'name': 'Six of Wands',
        'meaning': 'Recognition, progress, confidence and achievement.',
        'category': 'Recognition',
        'emotional': 'Confidence and satisfaction from being acknowledged.',
        'strength': 'Self-belief, motivation and ability to inspire others.',
        'challenge': 'Depending too much on external approval.',
        'guidance': 'Appreciate recognition while maintaining internal confidence.'
    },

    {
        'name': 'Seven of Wands',
        'meaning': 'Persistence, boundaries, defense and standing your ground.',
        'category': 'Persistence',
        'emotional': 'Protecting what matters and maintaining personal boundaries.',
        'strength': 'Courage, persistence and determination.',
        'challenge': 'Becoming defensive even when cooperation is possible.',
        'guidance': 'Protect your priorities while remaining open to constructive dialogue.'
    },

    {
        'name': 'Eight of Wands',
        'meaning': 'Momentum, communication, movement and rapid progress.',
        'category': 'Momentum',
        'emotional': 'Fast-moving emotions and direct communication.',
        'strength': 'Energy, responsiveness and ability to act quickly.',
        'challenge': 'Rushing without considering consequences.',
        'guidance': 'Use momentum wisely and communicate clearly.'
    },

    {
        'name': 'Nine of Wands',
        'meaning': 'Resilience, persistence, caution and endurance.',
        'category': 'Endurance',
        'emotional': 'Protectiveness shaped by previous experiences.',
        'strength': 'Resilience and ability to continue despite difficulty.',
        'challenge': 'Expecting problems even when circumstances improve.',
        'guidance': 'Protect your boundaries without allowing past experiences to control the present.'
    },

    {
        'name': 'Ten of Wands',
        'meaning': 'Responsibility, workload, pressure and completion.',
        'category': 'Responsibility',
        'emotional': 'Feeling emotionally burdened by too many responsibilities.',
        'strength': 'Commitment, reliability and perseverance.',
        'challenge': 'Carrying more responsibilities than necessary.',
        'guidance': 'Review your responsibilities and identify what can be delegated or released.'
    },

    {
        'name': 'Page of Wands',
        'meaning': 'Curiosity, exploration, enthusiasm and new ideas.',
        'category': 'Discovery',
        'emotional': 'Playful curiosity and excitement about possibilities.',
        'strength': 'Creativity, openness and willingness to learn.',
        'challenge': 'Losing focus after the initial excitement.',
        'guidance': 'Explore new ideas while developing consistency.'
    },

    {
        'name': 'Knight of Wands',
        'meaning': 'Action, ambition, adventure and energetic movement.',
        'category': 'Action',
        'emotional': 'Passion, excitement and strong emotional momentum.',
        'strength': 'Courage, initiative and enthusiasm.',
        'challenge': 'Impulsiveness or acting before considering consequences.',
        'guidance': 'Combine enthusiasm with enough planning to sustain your progress.'
    },

    {
        'name': 'Queen of Wands',
        'meaning': 'Confidence, creativity, warmth and independence.',
        'category': 'Confidence',
        'emotional': 'Warmth, self-confidence and emotional independence.',
        'strength': 'Leadership, creativity and positive self-expression.',
        'challenge': 'Taking on too much or appearing overly self-reliant.',
        'guidance': 'Express your confidence while remaining receptive to others.'
    },

    {
        'name': 'King of Wands',
        'meaning': 'Vision, leadership, ambition and purposeful action.',
        'category': 'Vision',
        'emotional': 'Passionate but purposeful emotional energy.',
        'strength': 'Leadership, vision and determination.',
        'challenge': 'Dominating situations or overlooking other perspectives.',
        'guidance': 'Lead with vision while making room for collaboration.'
    },


    # =========================
    # CUPS
    # =========================

    {
        'name': 'Ace of Cups',
        'meaning': 'Emotional renewal, compassion, connection and new feelings.',
        'category': 'Emotion',
        'emotional': 'Fresh emotional energy and openness.',
        'strength': 'Compassion, empathy and emotional openness.',
        'challenge': 'Giving emotionally without maintaining boundaries.',
        'guidance': 'Allow healthy emotional experiences to develop naturally.'
    },

    {
        'name': 'Two of Cups',
        'meaning': 'Partnership, mutual connection, harmony and understanding.',
        'category': 'Partnership',
        'emotional': 'Mutual affection, understanding and emotional connection.',
        'strength': 'Empathy, cooperation and communication.',
        'challenge': 'Losing individuality within a partnership.',
        'guidance': 'Build connection while maintaining mutual respect and individuality.'
    },

    {
        'name': 'Three of Cups',
        'meaning': 'Friendship, celebration, community and emotional support.',
        'category': 'Community',
        'emotional': 'Joy, friendship and shared emotional support.',
        'strength': 'Social connection and ability to create supportive relationships.',
        'challenge': 'Depending too much on social approval.',
        'guidance': 'Value supportive relationships while maintaining your own direction.'
    },

    {
        'name': 'Four of Cups',
        'meaning': 'Reflection, emotional withdrawal, dissatisfaction and reconsideration.',
        'category': 'Reflection',
        'emotional': 'Emotional withdrawal or difficulty appreciating current possibilities.',
        'strength': 'Ability to pause and reconsider what truly matters.',
        'challenge': 'Overlooking opportunities because of dissatisfaction.',
        'guidance': 'Pause, but remain open to possibilities you may not initially recognize.'
    },

    {
        'name': 'Five of Cups',
        'meaning': 'Disappointment, grief, reflection and learning from loss.',
        'category': 'Healing',
        'emotional': 'Sadness, disappointment and emotional processing.',
        'strength': 'Ability to learn from difficult experiences.',
        'challenge': 'Focusing only on what has been lost.',
        'guidance': 'Acknowledge disappointment while also noticing what remains available.'
    },

    {
        'name': 'Six of Cups',
        'meaning': 'Memories, familiarity, kindness and connections with the past.',
        'category': 'Memory',
        'emotional': 'Nostalgia, familiarity and emotional comfort.',
        'strength': 'Kindness, warmth and appreciation of meaningful memories.',
        'challenge': 'Idealizing the past.',
        'guidance': 'Learn from the past without allowing it to limit the present.'
    },

    {
        'name': 'Seven of Cups',
        'meaning': 'Choices, imagination, possibilities and uncertainty.',
        'category': 'Choices',
        'emotional': 'Many emotional possibilities and uncertainty about what you truly want.',
        'strength': 'Imagination and ability to consider alternatives.',
        'challenge': 'Confusion or unrealistic expectations.',
        'guidance': 'Separate genuine possibilities from distractions before choosing.'
    },

    {
        'name': 'Eight of Cups',
        'meaning': 'Moving on, emotional growth, release and searching for meaning.',
        'category': 'Transition',
        'emotional': 'Recognizing when an emotional situation no longer feels fulfilling.',
        'strength': 'Courage to leave situations that no longer support growth.',
        'challenge': 'Leaving without understanding what you actually need.',
        'guidance': 'Move forward thoughtfully and learn from what you are leaving behind.'
    },

    {
        'name': 'Nine of Cups',
        'meaning': 'Satisfaction, gratitude, enjoyment and emotional fulfillment.',
        'category': 'Fulfillment',
        'emotional': 'Contentment, appreciation and emotional satisfaction.',
        'strength': 'Gratitude and ability to appreciate progress.',
        'challenge': 'Focusing only on personal satisfaction.',
        'guidance': 'Enjoy what you have while remaining considerate of others.'
    },

    {
        'name': 'Ten of Cups',
        'meaning': 'Emotional harmony, belonging, family and shared happiness.',
        'category': 'Harmony',
        'emotional': 'Deep connection, belonging and emotional harmony.',
        'strength': 'Supportive relationships and emotional generosity.',
        'challenge': 'Expecting relationships to remain perfect.',
        'guidance': 'Build lasting connection through communication and mutual care.'
    },

    {
        'name': 'Page of Cups',
        'meaning': 'Emotional curiosity, creativity, sensitivity and openness.',
        'category': 'Sensitivity',
        'emotional': 'Gentle curiosity and openness to feelings.',
        'strength': 'Empathy, imagination and emotional creativity.',
        'challenge': 'Being overly sensitive or idealistic.',
        'guidance': 'Stay open to feelings while maintaining emotional grounding.'
    },

    {
        'name': 'Knight of Cups',
        'meaning': 'Romance, imagination, emotional expression and idealism.',
        'category': 'Romance',
        'emotional': 'Romantic expression and emotional idealism.',
        'strength': 'Empathy, creativity and ability to express feelings.',
        'challenge': 'Idealizing people or situations.',
        'guidance': 'Follow your feelings while balancing them with practical awareness.'
    },

    {
        'name': 'Queen of Cups',
        'meaning': 'Compassion, intuition, emotional intelligence and care.',
        'category': 'Compassion',
        'emotional': 'Deep empathy, sensitivity and emotional understanding.',
        'strength': 'Emotional intelligence, compassion and intuition.',
        'challenge': "Absorbing other people's emotions too strongly.",
        'guidance': 'Care for others while protecting your own emotional boundaries.'
    },

    {
        'name': 'King of Cups',
        'meaning': 'Emotional maturity, calmness, compassion and balance.',
        'category': 'Maturity',
        'emotional': 'Stable and mature emotional expression.',
        'strength': 'Calmness, empathy and emotional leadership.',
        'challenge': 'Hiding feelings behind emotional control.',
        'guidance': 'Balance emotional awareness with calm and thoughtful expression.'
    },


    # =========================
    # SWORDS
    # =========================

    {
        'name': 'Ace of Swords',
        'meaning': 'Clarity, truth, insight and decisive thinking.',
        'category': 'Clarity',
        'emotional': 'Need for honest communication and emotional clarity.',
        'strength': 'Clear thinking, truthfulness and decisiveness.',
        'challenge': 'Being overly blunt or analytical.',
        'guidance': 'Seek clarity and communicate honestly with consideration.'
    },

    {
        'name': 'Two of Swords',
        'meaning': 'Indecision, balance, uncertainty and difficult choices.',
        'category': 'Decision',
        'emotional': 'Emotional hesitation or avoidance of a difficult choice.',
        'strength': 'Ability to consider different perspectives.',
        'challenge': 'Avoiding decisions because of uncertainty.',
        'guidance': 'Gather the information you need and make a conscious choice.'
    },

    {
        'name': 'Three of Swords',
        'meaning': 'Disappointment, difficult truth, separation and emotional pain.',
        'category': 'Healing',
        'emotional': 'Pain, disappointment or difficult emotional realization.',
        'strength': 'Honesty and willingness to face difficult truths.',
        'challenge': 'Remaining focused on hurt instead of healing.',
        'guidance': 'Acknowledge difficult emotions and allow yourself to process them.'
    },

    {
        'name': 'Four of Swords',
        'meaning': 'Rest, recovery, pause and mental renewal.',
        'category': 'Recovery',
        'emotional': 'Need for emotional rest and mental space.',
        'strength': 'Patience and ability to recover through reflection.',
        'challenge': 'Avoiding action for too long.',
        'guidance': 'Take the pause you need before returning to action.'
    },

    {
        'name': 'Five of Swords',
        'meaning': 'Conflict, tension, competing interests and consequences.',
        'category': 'Conflict',
        'emotional': 'Tension caused by disagreement or unresolved conflict.',
        'strength': 'Ability to recognize difficult dynamics.',
        'challenge': 'Winning an argument while damaging the relationship.',
        'guidance': 'Consider whether the conflict is worth the cost.'
    },

    {
        'name': 'Six of Swords',
        'meaning': 'Transition, moving forward, recovery and calmer conditions.',
        'category': 'Transition',
        'emotional': 'Gradual emotional movement away from difficulty.',
        'strength': 'Adaptability and willingness to move forward.',
        'challenge': 'Carrying old concerns into a new situation.',
        'guidance': 'Allow yourself to move forward while learning from the past.'
    },

    {
        'name': 'Seven of Swords',
        'meaning': 'Strategy, independence, caution and hidden considerations.',
        'category': 'Strategy',
        'emotional': 'Need for privacy or caution around emotional communication.',
        'strength': 'Strategic thinking and independence.',
        'challenge': 'Avoidance, secrecy or lack of transparency.',
        'guidance': 'Use strategy wisely and consider when honest communication is necessary.'
    },

    {
        'name': 'Eight of Swords',
        'meaning': 'Restriction, self-doubt, uncertainty and perceived limitations.',
        'category': 'Perspective',
        'emotional': 'Feeling emotionally restricted or uncertain about choices.',
        'strength': 'Ability to recognize limiting beliefs.',
        'challenge': 'Believing there are no alternatives when choices may exist.',
        'guidance': 'Examine assumptions and identify choices that remain available.'
    },

    {
        'name': 'Nine of Swords',
        'meaning': 'Worry, overthinking, stress and mental pressure.',
        'category': 'Worry',
        'emotional': 'Anxiety, worry and emotional overthinking.',
        'strength': 'Awareness of concerns that need attention.',
        'challenge': 'Allowing imagined outcomes to overwhelm the present.',
        'guidance': 'Separate current facts from fears about possible outcomes.'
    },

    {
        'name': 'Ten of Swords',
        'meaning': 'Ending, release, difficult transition and recovery.',
        'category': 'Ending',
        'emotional': 'Recognition that an emotionally difficult chapter may be ending.',
        'strength': 'Ability to accept an ending and begin recovery.',
        'challenge': 'Seeing an ending only as failure.',
        'guidance': 'Allow closure to become the starting point for rebuilding.'
    },

    {
        'name': 'Page of Swords',
        'meaning': 'Curiosity, observation, communication and learning.',
        'category': 'Learning',
        'emotional': 'Curiosity and desire to understand what others think or feel.',
        'strength': 'Observation, questioning and quick learning.',
        'challenge': 'Overanalysis or speaking before understanding the situation.',
        'guidance': 'Ask thoughtful questions and verify information before reacting.'
    },

    {
        'name': 'Knight of Swords',
        'meaning': 'Determination, speed, ambition and direct action.',
        'category': 'Determination',
        'emotional': 'Strong mental energy and direct emotional expression.',
        'strength': 'Courage, decisiveness and ability to act quickly.',
        'challenge': 'Impulsive communication or rushing into decisions.',
        'guidance': 'Move decisively while considering the consequences of your actions.'
    },

    {
        'name': 'Queen of Swords',
        'meaning': 'Clarity, independence, honesty and thoughtful judgment.',
        'category': 'Discernment',
        'emotional': 'Clear emotional boundaries and honest communication.',
        'strength': 'Wisdom, independence and discernment.',
        'challenge': 'Becoming emotionally distant or overly critical.',
        'guidance': 'Maintain clarity and boundaries without closing yourself off.'
    },

    {
        'name': 'King of Swords',
        'meaning': 'Logic, authority, strategy and clear judgment.',
        'category': 'Wisdom',
        'emotional': 'Controlled emotional expression guided by reason.',
        'strength': 'Strategic thinking, objectivity and sound judgment.',
        'challenge': 'Over-reliance on logic or emotional detachment.',
        'guidance': 'Use clear reasoning while remembering the human side of decisions.'
    },


    # =========================
    # PENTACLES
    # =========================

    {
        'name': 'Ace of Pentacles',
        'meaning': 'Opportunity, stability, practical beginnings and resources.',
        'category': 'Opportunity',
        'emotional': 'Desire for security and dependable foundations.',
        'strength': 'Practical thinking and ability to recognize useful opportunities.',
        'challenge': 'Focusing only on material security.',
        'guidance': 'Build new opportunities through practical and consistent action.'
    },

    {
        'name': 'Two of Pentacles',
        'meaning': 'Balance, flexibility, priorities and managing responsibilities.',
        'category': 'Balance',
        'emotional': 'Balancing emotional needs with other responsibilities.',
        'strength': 'Adaptability and organization.',
        'challenge': 'Taking on too much at once.',
        'guidance': 'Review your priorities and create a manageable balance.'
    },

    {
        'name': 'Three of Pentacles',
        'meaning': 'Teamwork, skill, collaboration and constructive progress.',
        'category': 'Collaboration',
        'emotional': 'Appreciation of mutual effort and supportive relationships.',
        'strength': 'Cooperation, learning and developing expertise.',
        'challenge': 'Undervaluing your own contribution.',
        'guidance': 'Work with others and continue developing your skills.'
    },

    {
        'name': 'Four of Pentacles',
        'meaning': 'Security, control, stability and holding on.',
        'category': 'Security',
        'emotional': 'Need for emotional security and control.',
        'strength': 'Resource management and stability.',
        'challenge': 'Fear of change or holding on too tightly.',
        'guidance': 'Protect what matters without allowing fear to prevent growth.'
    },

    {
        'name': 'Five of Pentacles',
        'meaning': 'Difficulty, insecurity, support and resilience.',
        'category': 'Resilience',
        'emotional': 'Feelings of insecurity, isolation or uncertainty.',
        'strength': 'Ability to seek support and persist through difficulty.',
        'challenge': 'Assuming you must handle everything alone.',
        'guidance': 'Recognize available support and take practical steps forward.'
    },

    {
        'name': 'Six of Pentacles',
        'meaning': 'Generosity, support, balance and exchange.',
        'category': 'Generosity',
        'emotional': 'Mutual support and healthy emotional exchange.',
        'strength': 'Generosity, fairness and willingness to help.',
        'challenge': 'Unbalanced giving or receiving.',
        'guidance': 'Aim for relationships and situations where support flows both ways.'
    },

    {
        'name': 'Seven of Pentacles',
        'meaning': 'Patience, investment, progress and evaluation.',
        'category': 'Patience',
        'emotional': 'Waiting patiently for emotional growth or results.',
        'strength': 'Persistence and long-term thinking.',
        'challenge': 'Becoming discouraged because results take time.',
        'guidance': 'Evaluate your progress and continue investing where it is worthwhile.'
    },

    {
        'name': 'Eight of Pentacles',
        'meaning': 'Practice, learning, dedication and craftsmanship.',
        'category': 'Mastery',
        'emotional': 'Finding satisfaction through consistent effort and improvement.',
        'strength': 'Discipline, learning and attention to detail.',
        'challenge': 'Perfectionism or becoming overly focused on work.',
        'guidance': 'Keep developing your skills while maintaining balance.'
    },

    {
        'name': 'Nine of Pentacles',
        'meaning': 'Independence, achievement, confidence and self-sufficiency.',
        'category': 'Independence',
        'emotional': 'Contentment and confidence in your own stability.',
        'strength': 'Self-reliance, discipline and appreciation of progress.',
        'challenge': 'Isolation or believing you must do everything alone.',
        'guidance': 'Value independence while remaining open to meaningful connections.'
    },

    {
        'name': 'Ten of Pentacles',
        'meaning': 'Long-term stability, family, legacy and lasting foundations.',
        'category': 'Stability',
        'emotional': 'Security, belonging and long-term connection.',
        'strength': 'Planning, stability and commitment to long-term goals.',
        'challenge': 'Being overly concerned with expectations or material security.',
        'guidance': 'Build foundations that support both practical and personal values.'
    },

    {
        'name': 'Page of Pentacles',
        'meaning': 'Learning, opportunity, practicality and steady development.',
        'category': 'Learning',
        'emotional': 'Careful and grounded emotional development.',
        'strength': 'Curiosity, dedication and willingness to learn.',
        'challenge': 'Moving slowly because of excessive caution.',
        'guidance': 'Start with practical steps and develop your abilities consistently.'
    },

    {
        'name': 'Knight of Pentacles',
        'meaning': 'Reliability, persistence, routine and steady progress.',
        'category': 'Consistency',
        'emotional': 'Loyalty, dependability and steady emotional commitment.',
        'strength': 'Patience, reliability and discipline.',
        'challenge': 'Becoming too routine or resistant to change.',
        'guidance': 'Continue steadily while remaining flexible when circumstances change.'
    },

    {
        'name': 'Queen of Pentacles',
        'meaning': 'Practical care, stability, comfort and grounded confidence.',
        'category': 'Nurturing',
        'emotional': 'Warmth, security and practical expressions of care.',
        'strength': 'Organization, compassion and practical wisdom.',
        'challenge': 'Taking care of everyone while neglecting yourself.',
        'guidance': 'Create stability for yourself as well as for others.'
    },

    {
        'name': 'King of Pentacles',
        'meaning': 'Stability, responsibility, achievement and practical leadership.',
        'category': 'Abundance',
        'emotional': 'Dependability, security and mature commitment.',
        'strength': 'Planning, responsibility and long-term thinking.',
        'challenge': 'Becoming too focused on status, control or material success.',
        'guidance': 'Use your resources responsibly and define success beyond material results.'
    }

]
CONSULTATIONS_FILE = DATA_DIR / 'consultations.json'

if CONSULTATIONS_FILE.exists():
    try:
        CONSULTATION_REQUESTS = json.loads(
            CONSULTATIONS_FILE.read_text(encoding='utf-8')
        )
    except Exception:
        CONSULTATION_REQUESTS = []
else:
    CONSULTATION_REQUESTS = []


def save_consultations():
    CONSULTATIONS_FILE.write_text(
        json.dumps(
            CONSULTATION_REQUESTS,
            indent=2,
            ensure_ascii=False
        ),
        encoding='utf-8'
    )
LATEST_PALM_ANALYSIS = {}
LATEST_TAROT_READING = {}
READING_HISTORY_FILE = DATA_DIR / "reading_history.json"

if READING_HISTORY_FILE.exists():
    try:
        READING_HISTORY = json.loads(
            READING_HISTORY_FILE.read_text(encoding="utf-8")
        )
    except Exception:
        READING_HISTORY = []
else:
    READING_HISTORY = []


def save_reading_history():
    READING_HISTORY_FILE.write_text(
        json.dumps(READING_HISTORY, indent=2),
        encoding="utf-8"
    )

TAROT_READINGS_FILE = DATA_DIR / 'tarot_readings.json'
if TAROT_READINGS_FILE.exists():
    try:
        TAROT_READINGS = json.loads(TAROT_READINGS_FILE.read_text(encoding='utf-8'))
    except Exception:
        TAROT_READINGS = []
else:
    TAROT_READINGS = []

def save_tarot_readings():
    TAROT_READINGS_FILE.write_text(json.dumps(TAROT_READINGS, indent=2, ensure_ascii=False), encoding='utf-8')

PALM_READINGS_FILE = DATA_DIR / 'palm_readings.json'
if PALM_READINGS_FILE.exists():
    try:
        PALM_READINGS = json.loads(PALM_READINGS_FILE.read_text(encoding='utf-8'))
    except Exception:
        PALM_READINGS = []
else:
    PALM_READINGS = []

def save_palm_readings():
    PALM_READINGS_FILE.write_text(json.dumps(PALM_READINGS, indent=2, ensure_ascii=False), encoding='utf-8')

if PALM_READINGS:
    LATEST_PALM_ANALYSIS = PALM_READINGS[-1]
if TAROT_READINGS:
    LATEST_TAROT_READING = TAROT_READINGS[-1]

NOTIFICATIONS_FILE = DATA_DIR / 'notifications.json'
if NOTIFICATIONS_FILE.exists():
    try:
        NOTIFICATIONS = json.loads(NOTIFICATIONS_FILE.read_text(encoding='utf-8'))
    except Exception:
        NOTIFICATIONS = []
else:
    NOTIFICATIONS = []

def save_notifications():
    NOTIFICATIONS_FILE.write_text(json.dumps(NOTIFICATIONS, indent=2, ensure_ascii=False), encoding='utf-8')

def create_notification(recipient: str, title: str, message: str, notif_type: str = 'info', metadata: dict = None):
    notif = {
        'id': max([item.get('id', 0) for item in NOTIFICATIONS] or [0]) + 1,
        'recipient': recipient.strip(),
        'title': title,
        'message': message,
        'type': notif_type,
        'read': False,
        'created_at': datetime.now().isoformat(),
        'metadata': metadata or {}
    }
    NOTIFICATIONS.append(notif)
    save_notifications()
    return notif

ACTIVITY_LOGS_FILE = DATA_DIR / 'activity_logs.json'
if ACTIVITY_LOGS_FILE.exists():
    try:
        ACTIVITY_LOGS = json.loads(ACTIVITY_LOGS_FILE.read_text(encoding='utf-8'))
    except Exception:
        ACTIVITY_LOGS = []
else:
    ACTIVITY_LOGS = []

def save_activity_logs():
    ACTIVITY_LOGS_FILE.write_text(json.dumps(ACTIVITY_LOGS, indent=2, ensure_ascii=False), encoding='utf-8')

def log_activity(event_type: str, record_id: str, action_result: str, details: dict = None, actor: str = 'System'):
    entry = {
        'id': max([item.get('id', 0) for item in ACTIVITY_LOGS] or [0]) + 1,
        'timestamp': datetime.now(KOLKATA_TZ).isoformat(),
        'event_type': event_type,
        'actor': actor,
        'record_id': str(record_id),
        'action_result': action_result,
        'details': details or {}
    }
    ACTIVITY_LOGS.insert(0, entry)
    if len(ACTIVITY_LOGS) > 500:
        ACTIVITY_LOGS.pop()
    save_activity_logs()
    return entry

CALENDAR_TOKENS_FILE = DATA_DIR / 'google_calendar_tokens.json'

def parse_appt_datetime(date_str, time_str):
    if not date_str or not time_str:
        return None
    try:
        d_clean = date_str.strip()
        t_clean = time_str.strip().upper()
        is_pm = 'PM' in t_clean
        is_am = 'AM' in t_clean
        raw_time = t_clean.replace('AM', '').replace('PM', '').strip()
        parts = raw_time.split(':')
        h = int(parts[0]) if len(parts) > 0 else 0
        m = int(parts[1]) if len(parts) > 1 else 0
        if is_pm and h < 12:
            h += 12
        if is_am and h == 12:
            h = 0
        dt = datetime.strptime(d_clean, "%Y-%m-%d").replace(hour=h, minute=m, second=0, microsecond=0, tzinfo=KOLKATA_TZ)
        return dt
    except Exception:
        return None

def is_appointment_expired(appt: dict) -> bool:
    dt = parse_appt_datetime(appt.get('appointment_date'), appt.get('appointment_time'))
    if not dt:
        return False
    duration = int(appt.get('duration', 30))
    end_time = dt + timedelta(minutes=duration)
    return datetime.now(KOLKATA_TZ) > end_time

def is_appointment_starting_now(appt: dict) -> bool:
    dt = parse_appt_datetime(appt.get('appointment_date'), appt.get('appointment_time'))
    if not dt:
        return False
    duration = int(appt.get('duration', 30))
    start_window = dt - timedelta(minutes=5)
    end_time = dt + timedelta(minutes=duration)
    now = datetime.now(KOLKATA_TZ)
    return start_window <= now <= end_time

def verify_google_id_token(id_token: str) -> dict:
    if not id_token or not id_token.strip():
        raise ValueError("Google ID token is required.")
    clean_token = id_token.strip()
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={urllib.parse.quote(clean_token)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'AI-Palmistry-Tarot-Platform/1.0'})
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=10, context=ctx) as response:
            if response.status != 200:
                raise ValueError("Google verification endpoint returned an error status.")
            data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        raise ValueError(f"Google ID token verification failed: {str(e)}")

    iss = data.get('iss', '')
    if iss not in ('accounts.google.com', 'https://accounts.google.com'):
        raise ValueError(f"Invalid Google token issuer: {iss}")

    expected_aud = os.getenv('GOOGLE_CLIENT_ID', '').strip()
    if expected_aud:
        token_aud = data.get('aud', '')
        if token_aud != expected_aud:
            raise ValueError("Token audience does not match configured GOOGLE_CLIENT_ID.")

    exp = int(data.get('exp', 0))
    if exp < time.time():
        raise ValueError("Google ID token has expired.")

    email_verified = str(data.get('email_verified', '')).lower() in ('true', '1')
    if not email_verified:
        raise ValueError("Google account email is not verified.")

    email = data.get('email', '').strip().lower()
    if not email:
        raise ValueError("No verified email address found in Google token.")

    return {
        'sub': data.get('sub', ''),
        'email': email,
        'name': data.get('name', email.split('@')[0]),
        'picture': data.get('picture', '')
    }

def get_google_calendar_access_token():
    if not CALENDAR_TOKENS_FILE.exists():
        return None
    try:
        tokens = json.loads(CALENDAR_TOKENS_FILE.read_text(encoding='utf-8'))
    except Exception:
        return None
    refresh_token = tokens.get('refresh_token')
    if not refresh_token:
        return None
    client_id = os.getenv('GOOGLE_CLIENT_ID', '').strip()
    client_secret = os.getenv('GOOGLE_CLIENT_SECRET', '').strip()
    if not client_id or not client_secret:
        return None
    expires_at = tokens.get('expires_at', 0)
    if tokens.get('access_token') and time.time() < (expires_at - 60):
        return tokens['access_token']
    token_url = "https://oauth2.googleapis.com/token"
    params = {
        'client_id': client_id,
        'client_secret': client_secret,
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token'
    }
    encoded_data = urllib.parse.urlencode(params).encode('utf-8')
    req = urllib.request.Request(token_url, data=encoded_data, headers={
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'AI-Palmistry-Tarot-Platform/1.0'
    })
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=10, context=ctx) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            access_token = res_data.get('access_token')
            expires_in = int(res_data.get('expires_in', 3600))
            tokens['access_token'] = access_token
            tokens['expires_at'] = int(time.time()) + expires_in
            CALENDAR_TOKENS_FILE.write_text(json.dumps(tokens, indent=2), encoding='utf-8')
            return access_token
    except Exception as e:
        log_activity('calendar_token_refresh_error', 'system', 'failure', {'error': str(e)})
        return None

def create_or_update_google_calendar_event(consultation: dict) -> dict:
    # Prevent duplicate meeting creation if button is clicked more than once
    if consultation.get('meeting_url') and consultation.get('calendar_event_id'):
        consultation['meeting_link'] = consultation.get('meeting_url')
        return {
            'status': 'already_created',
            'meeting_url': consultation.get('meeting_url'),
            'meeting_link': consultation.get('meeting_url'),
            'event_id': consultation.get('calendar_event_id')
        }

    access_token = get_google_calendar_access_token()
    if not access_token:
        consultation['calendar_status'] = 'not_configured'
        consultation['meeting_url'] = None
        consultation['meeting_link'] = None
        consultation['calendar_event_id'] = None
        log_activity('calendar_not_configured', str(consultation.get('id')), 'warning', {
            'message': 'Google Calendar credentials not configured in environment. Meet link pending configuration.'
        })
        return {'status': 'not_configured', 'meeting_url': None, 'meeting_link': None, 'event_id': None}

    start_dt = parse_appt_datetime(consultation.get('appointment_date'), consultation.get('appointment_time'))
    if not start_dt:
        consultation['calendar_status'] = 'invalid_datetime'
        consultation['meeting_url'] = None
        consultation['meeting_link'] = None
        return {'status': 'invalid_datetime', 'meeting_url': None, 'meeting_link': None, 'event_id': None}

    duration = int(consultation.get('duration', 30))
    end_dt = start_dt + timedelta(minutes=duration)
    request_id = f"appt-{consultation['id']}-{int(start_dt.timestamp())}"

    event_body = {
        'summary': f"Spiritual Consultation: {consultation.get('focus', 'Guidance')} - {consultation.get('user_name', 'Client')}",
        'description': (
            f"Online Spiritual Consultation via Google Meet\n\n"
            f"Client: {consultation.get('user_name', 'Client')}\n"
            f"Professional: {consultation.get('consultant_name', consultation.get('consultant_type'))}\n"
            f"Topic: {consultation.get('focus', 'General')}\n"
            f"Details: {consultation.get('details', 'None provided')}\n"
            f"Timezone: Asia/Kolkata"
        ),
        'start': {
            'dateTime': start_dt.isoformat(),
            'timeZone': 'Asia/Kolkata'
        },
        'end': {
            'dateTime': end_dt.isoformat(),
            'timeZone': 'Asia/Kolkata'
        },
        'conferenceData': {
            'createRequest': {
                'requestId': request_id,
                'conferenceSolutionKey': {
                    'type': 'hangoutsMeet'
                }
            }
        }
    }

    # Attach client attendee email if registered in USERS
    client_name = (consultation.get('user_name') or '').strip().lower()
    for acc_email, acc in USERS.items():
        if acc.get('name', '').strip().lower() == client_name:
            event_body['attendees'] = [{'email': acc_email, 'displayName': consultation.get('user_name')}]
            break

    existing_event_id = consultation.get('calendar_event_id')
    ctx = ssl.create_default_context()
    try:
        if existing_event_id:
            url = f"https://www.googleapis.com/calendar/v3/calendars/primary/events/{existing_event_id}?conferenceDataVersion=1"
            req = urllib.request.Request(url, data=json.dumps(event_body).encode('utf-8'), headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json',
                'User-Agent': 'AI-Palmistry-Tarot-Platform/1.0'
            }, method='PATCH')
        else:
            url = "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1"
            req = urllib.request.Request(url, data=json.dumps(event_body).encode('utf-8'), headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json',
                'User-Agent': 'AI-Palmistry-Tarot-Platform/1.0'
            }, method='POST')

        with urllib.request.urlopen(req, timeout=12, context=ctx) as res:
            res_json = json.loads(res.read().decode('utf-8'))
            event_id = res_json.get('id')
            meet_url = res_json.get('hangoutLink')
            if not meet_url and 'conferenceData' in res_json:
                for ep in res_json['conferenceData'].get('entryPoints', []):
                    if ep.get('entryPointType') == 'video':
                        meet_url = ep.get('uri')
                        break
            consultation['calendar_event_id'] = event_id
            consultation['meeting_url'] = meet_url
            consultation['meeting_link'] = meet_url
            consultation['calendar_status'] = 'created' if meet_url else 'pending'
            log_activity('calendar_event_created', str(consultation['id']), 'success', {
                'meeting_url': meet_url,
                'calendar_event_id': event_id
            })
            return {'status': 'created', 'meeting_url': meet_url, 'meeting_link': meet_url, 'event_id': event_id}
    except Exception as e:
        consultation['calendar_status'] = 'failed'
        consultation['calendar_error'] = str(e)
        log_activity('calendar_integration_error', str(consultation['id']), 'failure', {'error': str(e)})
        return {'status': 'failed', 'meeting_url': None, 'meeting_link': None, 'event_id': None, 'error': str(e)}

@app.get('/api/health')
def health():
    return {'status': 'ok'}

@app.post('/api/auth/register')
def register(name:str=Form(...),email:str=Form(...),password:str=Form(...),role:str=Form(...)):
    name=name.strip(); email=email.strip().lower()
    if not name or not email or not password:
        raise HTTPException(status_code=400,detail='Name, email and password are required.')
    if len(password)<6:
        raise HTTPException(status_code=400,detail='Password must contain at least 6 characters.')
    if email in USERS:
        raise HTTPException(status_code=409,detail='An account with this email already exists.')
    if role not in {'User','Tarot Reader','Spiritual Consultant','Administrator'}:
        raise HTTPException(status_code=400,detail='Invalid role selected.')
    USERS[email]={
        'name': name,
        'password': password_hash(password),
        'role': role,
        'status': 'Active',
        'registered_at': datetime.now(KOLKATA_TZ).isoformat()
    }
    save_users()
    log_activity('account_created', email, 'success', {'role': role, 'auth_provider': 'email'})
    return {'message':'Registration successful','user':{'name':name,'email':email,'role':role}}

@app.post('/api/auth/login')
def login(email:str=Form(...),password:str=Form(...),role:str=Form(...)):
    email=email.strip().lower(); account=USERS.get(email)
    if not account or not password_matches(account['password'],password):
        raise HTTPException(status_code=401,detail='Invalid email or password.')
    if account.get('status') == 'Disabled':
        raise HTTPException(status_code=403, detail='This account has been deactivated. Please contact an administrator.')
    # Upgrade legacy plaintext demo credentials after a successful login.
    if account['password']==password:
        account['password']=password_hash(password)
        save_users()
    if account['role']!=role:
        raise HTTPException(status_code=403,detail='This account is registered under a different role.')
    user={'name':account['name'],'email':email,'role':account['role']}
    log_activity('login_success', email, 'success', {'role': account['role']})
    return {'token':hashlib.sha256(f'{email}:{role}'.encode()).hexdigest(),'user':user}

class GoogleLoginRequest(BaseModel):
    id_token: Optional[str] = None
    credential: Optional[str] = None
    role: Optional[str] = None

@app.get('/api/auth/google/config')
def google_auth_config():
    client_id = os.getenv('GOOGLE_CLIENT_ID', '').strip()
    return {
        'client_id': client_id,
        'configured': bool(client_id)
    }

@app.post('/api/auth/google')
def google_auth(req: GoogleLoginRequest):
    raw_token = (req.id_token or req.credential or '').strip()
    if not raw_token:
        raise HTTPException(status_code=400, detail="Google ID token credential is required.")
    try:
        google_info = verify_google_id_token(raw_token)
    except Exception as e:
        log_activity('google_login_failed', 'unknown', 'failure', {'error': str(e)})
        raise HTTPException(status_code=400, detail=str(e))

    email = google_info['email'].strip().lower()
    name = google_info['name'].strip()
    sub = google_info['sub']

    if email in USERS:
        account = USERS[email]
        if account.get('status') == 'Disabled':
            log_activity('google_login_blocked', email, 'failure', {'reason': 'Account disabled'})
            raise HTTPException(status_code=403, detail='This account has been deactivated. Please contact an administrator.')
        account['google_id'] = sub
        if not account.get('name') and name:
            account['name'] = name
        save_users()
        user_role = account['role']
        log_activity('google_login', email, 'success', {'role': user_role, 'is_new': False})
        return {
            'token': hashlib.sha256(f'{email}:{user_role}'.encode()).hexdigest(),
            'user': {'name': account['name'], 'email': email, 'role': user_role}
        }
    else:
        # New Google user: always receives default 'User' role
        account = {
            'name': name or email.split('@')[0],
            'password': '',
            'role': 'User',
            'status': 'Active',
            'google_id': sub,
            'registered_at': datetime.now(KOLKATA_TZ).isoformat()
        }
        USERS[email] = account
        save_users()
        log_activity('account_created', email, 'success', {'role': 'User', 'auth_provider': 'google'})
        return {
            'token': hashlib.sha256(f'{email}:User'.encode()).hexdigest(),
            'user': {'name': account['name'], 'email': email, 'role': 'User'}
        }

def resolve_auth_user(authorization: Any = None, x_auth_token: Any = None) -> Optional[dict]:
    token = None
    if isinstance(authorization, str) and authorization.strip():
        token = authorization.strip()
        if token.lower().startswith('bearer '):
            token = token[7:].strip()
    elif isinstance(x_auth_token, str) and x_auth_token.strip():
        token = x_auth_token.strip()

    if not token:
        return None

    for email, acc in USERS.items():
        role = acc.get('role', 'User')
        expected = hashlib.sha256(f'{email}:{role}'.encode()).hexdigest()
        if expected == token:
            return {'email': email, 'name': acc.get('name', ''), 'role': role}
    return None

# MediaPipe Tasks API

MODEL_PATH = (

    Path(__file__).resolve().parent.parent

    / "models"

    / "hand_landmarker.task"

)



base_options = python.BaseOptions(

    model_asset_path=str(MODEL_PATH)

)



hand_options = vision.HandLandmarkerOptions(

    base_options=base_options,

    num_hands=1,

    min_hand_detection_confidence=0.55,

    min_hand_presence_confidence=0.55,

    min_tracking_confidence=0.55

)



detector = vision.HandLandmarker.create_from_options(

    hand_options

)

def clamp(value, low=0.0, high=100.0):

    return max(low, min(high, value))





def point_from_landmark(landmarks, index):

    return np.array([

        landmarks[index].x,

        landmarks[index].y

    ], dtype=np.float32)





def bezier(p0, p1, p2, p3, samples=40):

    points = []



    for t in np.linspace(0, 1, samples):

        p = (

            ((1 - t) ** 3) * p0 +

            3 * ((1 - t) ** 2) * t * p1 +

            3 * (1 - t) * (t ** 2) * p2 +

            (t ** 3) * p3

        )



        points.append(p)



    return np.array(points, dtype=np.float32)





def normalize_path(points):

    return [

        {

            "x": round(float(p[0] * 100), 2),

            "y": round(float(p[1] * 100), 2)

        }

        for p in points

    ]
def make_line_candidates(lm):

    """

    Creates palm-line candidate curves relative to the detected

    MediaPipe hand geometry.

    """
    wrist = point_from_landmark(lm, 0)
    thumb_cmc = point_from_landmark(lm, 1)
    thumb_mcp = point_from_landmark(lm, 2)
    thumb_ip = point_from_landmark(lm, 3)
    index_mcp = point_from_landmark(lm, 5)
    middle_mcp = point_from_landmark(lm, 9)
    ring_mcp = point_from_landmark(lm, 13)
    pinky_mcp = point_from_landmark(lm, 17)
    index_tip = point_from_landmark(lm, 8)
    ring_tip = point_from_landmark(lm, 16)

    # Heart line

    heart = bezier(

        index_mcp + np.array([0.00, 0.035]),

        middle_mcp + np.array([-0.02, 0.045]),

        ring_mcp + np.array([0.01, 0.055]),

        pinky_mcp + np.array([0.015, 0.075]),

        50

    )
    # Head line
    head = bezier(

        thumb_mcp + np.array([0.025, 0.055]),

        middle_mcp + np.array([-0.01, 0.09]),

        ring_mcp + np.array([0.00, 0.12]),

        pinky_mcp + np.array([0.00, 0.14]),

        50

    )
    # Life line
    life = bezier(

        thumb_cmc + np.array([0.015, 0.005]),

        thumb_mcp + np.array([-0.055, 0.075]),

        wrist + np.array([-0.075, -0.015]),

        wrist + np.array([-0.015, -0.055]),

        55

    )
    # Fate line
    fate = bezier(

        wrist + np.array([0.00, -0.015]),

        middle_mcp + np.array([-0.02, 0.12]),

        middle_mcp + np.array([0.00, 0.05]),

        middle_mcp + np.array([0.00, -0.035]),

        50

    )
    # Sun line
    sun = bezier(

        wrist + np.array([0.055, -0.02]),

        ring_mcp + np.array([-0.01, 0.13]),

        ring_mcp + np.array([0.00, 0.07]),

        ring_mcp + np.array([0.00, -0.035]),

        45

    )
    return {
        "Heart Line": heart,

        "Head Line": head,

        "Life Line": life,

        "Fate Line": fate,

        "Sun Line": sun

    }
def palm_crease_map(image):

    """

    Enhances dark palm creases using black-hat morphology.

    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Improve local contrast

    clahe = cv2.createCLAHE(

        clipLimit=2.0,

        tileGridSize=(8, 8)

    )
    gray = clahe.apply(gray)

    # Palm creases are generally darker than their local surroundings.

    kernel = cv2.getStructuringElement(

        cv2.MORPH_ELLIPSE,

        (17, 17)

    )



    blackhat = cv2.morphologyEx(

        gray,

        cv2.MORPH_BLACKHAT,

        kernel

    )



    blackhat = cv2.GaussianBlur(

        blackhat,

        (5, 5),

        0

    )



    return blackhat
def score_path(crease_map, path):

    """

    Measures actual image evidence around a candidate palm line.

    """
    h, w = crease_map.shape
    values = []
    for p in path:

        x = int(np.clip(p[0] * w, 0, w - 1))

        y = int(np.clip(p[1] * h, 0, h - 1))

        radius = max(3, int(min(h, w) * 0.012))
        x1 = max(0, x - radius)

        x2 = min(w, x + radius + 1)

        y1 = max(0, y - radius)

        y2 = min(h, y + radius + 1)
        patch = crease_map[y1:y2, x1:x2]

        if patch.size:

            values.append(float(np.percentile(patch, 75)))

    if not values:

        return 0.0

    evidence = np.mean(values)
    # Convert image evidence into a readable 0–100 confidence.

    score = np.interp(

        evidence,

        [5, 15, 30, 55],

        [15, 35, 65, 85]

    )

    return round(float(clamp(score)), 1)
@app.post('/api/palm/analyze')
async def palm_analyze(
    image: UploadFile = File(...),
    user_name: str = Form('User'),
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):
    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user and auth_user.get('name'):
        effective_user = auth_user.get('name')
    elif isinstance(user_name, str) and user_name.strip() and user_name.strip() != 'User':
        effective_user = user_name.strip()
    else:
        effective_user = 'User'

    data = await image.read()
    # Convert uploaded image with EXIF orientation support
    img = None
    rgb = None
    try:
        pil_img = Image.open(BytesIO(data))
        pil_img = ImageOps.exif_transpose(pil_img)
        rgb = np.array(pil_img.convert('RGB'))
        img = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    except Exception:
        np_data = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
        if img is not None:
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    if img is None or rgb is None:
        return {
            "detected": False,
            "error": "Invalid image",
            "features": {},
            "line_paths": {},
            "landmarks": []
        }

    # Limit very large images
    max_width = 1400
    if img.shape[1] > max_width:
        scale = max_width / img.shape[1]
        img = cv2.resize(
            img,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_AREA
        )
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # MediaPipe Tasks image
    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb
    )

    # Detect hand
    result = detector.detect(mp_image)
    # No hand detected
    if not result.hand_landmarks:
        return {
            "detected": False,
            "handedness": "Unknown",
            "features": {},
            "line_paths": {},
            "landmarks": [],
            "palm_shape": "Not detected",
            "finger_structure": "Not detected",
            "summary": (
                "No hand was detected. "
                "Please upload a clear image of your palm."
            )
        }

    # First detected hand
    hand_landmarks = result.hand_landmarks[0]
    lm = hand_landmarks

    # MediaPipe Handedness Classification & Geometry Validation
    mp_category = None
    mp_score = 0.0
    if result.handedness and len(result.handedness) > 0 and len(result.handedness[0]) > 0:
        cat_obj = result.handedness[0][0]
        mp_category = getattr(cat_obj, 'category_name', None) or getattr(cat_obj, 'display_name', None)
        mp_score = float(getattr(cat_obj, 'score', 0.0))

    # Landmark geometry validation
    # MediaPipe landmarks: 0=wrist, 2=thumb_mcp, 5=index_mcp, 9=middle_mcp, 17=pinky_mcp
    w_pt = np.array([lm[0].x, lm[0].y], dtype=np.float32)
    m_pt = np.array([lm[9].x, lm[9].y], dtype=np.float32)
    i_pt = np.array([lm[5].x, lm[5].y], dtype=np.float32)
    p_pt = np.array([lm[17].x, lm[17].y], dtype=np.float32)

    hand_len = float(np.linalg.norm(m_pt - w_pt))
    palm_span = float(np.linalg.norm(i_pt - p_pt))

    handedness = "Unknown"
    uncertainty_msg = None

    if hand_len < 0.05 or palm_span < 0.04:
        handedness = "Uncertain"
        uncertainty_msg = "Hand side could not be determined reliably. Please ensure your palm is clearly open and facing the camera."
    elif mp_category in ["Left", "Right"] and mp_score >= 0.55:
        # Use MediaPipe's deep-learning handedness classification
        handedness = mp_category
    elif mp_category in ["Left", "Right"]:
        # Low confidence classification
        handedness = "Uncertain"
        uncertainty_msg = "Hand side could not be determined reliably. Please ensure your palm is clearly open and facing the camera."
    else:
        handedness = "Uncertain"
        uncertainty_msg = "Hand side could not be determined reliably. Please ensure your palm is clearly open and facing the camera."

    # Convert landmarks to the format used by our helpers

    lm = hand_landmarks



    # Create image-based crease map

    crease_map = palm_crease_map(img)



    # Generate palm-line candidates using THIS hand's landmarks

    candidates = make_line_candidates(lm)

    features = {}
    line_paths = {}

    for name, path in candidates.items():

        features[name] = score_path(

            crease_map,

            path

        )
        line_paths[name] = normalize_path(path)



    # Return actual MediaPipe landmarks

    landmarks = [

        {

            "x": round(float(p.x), 5),

            "y": round(float(p.y), 5),

            "z": round(float(p.z), 5)

        }

        for p in lm

    ]



    # Basic palm shape from detected geometry

    wrist = point_from_landmark(lm, 0)

    middle_mcp = point_from_landmark(lm, 9)

    index_mcp = point_from_landmark(lm, 5)

    pinky_mcp = point_from_landmark(lm, 17)



    palm_width = np.linalg.norm(

        index_mcp - pinky_mcp

    )



    palm_height = np.linalg.norm(

        wrist - middle_mcp

    )



    ratio = palm_height / max(

        palm_width,

        0.001

    )



    if ratio > 1.35:

        palm_shape = "Long / rectangular"

    elif ratio < 1.05:

        palm_shape = "Broad / square"

    else:

        palm_shape = "Balanced"
    global LATEST_PALM_ANALYSIS

    LATEST_PALM_ANALYSIS = {
        "handedness": handedness,
        "uncertainty_message": uncertainty_msg,
        "features": features,
        "palm_shape": palm_shape,
        "finger_structure": "Detected from hand landmarks",
        "landmarks": landmarks
    }
    # Save this actual palm reading in history
    palm_score = round(
        sum(float(value) for value in features.values()) / len(features)
    ) if features else 0

    READING_HISTORY.append({
        "id": len(READING_HISTORY) + 1,
        "type": "Palm Reading",
        "date": datetime.now().strftime("%d %b %Y"),
        "score": f"{palm_score}%",
        "user_name": effective_user,
        "summary": "Palm lines detected and analyzed from the uploaded image."
    })
    save_reading_history()

    palm_record = {
        "id": len(PALM_READINGS) + 1,
        "user_name": effective_user,
        "handedness": handedness,
        "uncertainty_message": uncertainty_msg,
        "features": features,
        "palm_shape": palm_shape,
        "finger_structure": "Detected from hand landmarks",
        "landmarks": landmarks,
        "palm_score": palm_score,
        "summary": "Palm lines detected and analyzed from the uploaded image.",
        "created_at": datetime.now().isoformat()
    }
    PALM_READINGS.append(palm_record)
    save_palm_readings()
    log_activity('palm_reading_created', str(palm_record['id']), 'success', {'hand_side': handedness, 'user': effective_user}, actor=effective_user or 'User')

    return {
        "detected": True,
        "handedness": handedness,
        "uncertainty_message": uncertainty_msg,
        "landmarks": landmarks,
        "features": features,
        "line_paths": line_paths,
        "palm_shape": palm_shape,
        "finger_structure": "Detected from hand landmarks",
        "summary": (
            uncertainty_msg
            if uncertainty_msg
            else "Palm lines were analyzed from the uploaded image using hand landmarks and local crease detection."
        )
    }

class TarotRequest(BaseModel):

    cards: List[str]

    focus: str = 'General'

    spread: str = 'Three Card'

    user_name: Optional[str] = None
class TarotReadingSaveRequest(BaseModel):
    user_name: str
    focus: str
    spread: str
    cards: List[str]
    reading: Dict[str, Any]
class ConsultationRequest(BaseModel):
    user_name: str
    consultant_type: str
    question: str
    focus: str
    spread: str
    cards: list[str]

    # Spiritual Consultation fields
    consultation_mode: str = 'Question'
    appointment_date: str = ''
    appointment_time: str = ''
    details: str = ''
    consultant_name: Optional[str] = ''
    duration: Optional[int] = 30
class ConsultationReply(BaseModel):
    reply: str


SPREAD_POSITIONS={

    'Single Card':['Guidance'],

    'Three Card':['Past','Present','Future'],

    'Relationship':['Your Energy','Their Energy','Connection','Challenge','Guidance'],

    'Career':['Current Position','Opportunity','Challenge','Action','Outcome'],

    'Personal Growth':['Current Self','Strength','Block','Lesson','Next Step'],

    'Life Path':['Past Influence','Present Path','Hidden Influence','Direction','Guidance'],

    'Celtic Cross':['Present','Challenge','Foundation','Recent Past','Possibility','Near Future','Self','Environment','Hopes & Fears','Outcome']

}



FOCUS_CONTEXT={

    'General':'general life reflection and current themes',

    'Relationship':'relationships, communication and emotional connection',

    'Career':'career, work, goals and professional direction',

    'Personal Growth':'self-development, habits, confidence and learning',

    'Finance':'financial planning, resources and practical choices',

    'Wellness':'balance, wellbeing, energy and emotional awareness'

}



@app.post('/api/tarot/interpret')
def tarot_interpret(
    request: TarotRequest,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):
    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user and auth_user.get('name'):
        effective_user = auth_user.get('name')
    elif request.user_name and request.user_name.strip():
        effective_user = request.user_name.strip()
    else:
        effective_user = 'User'

    from fastapi import HTTPException

    # -------------------------------------------------
    # GET POSITIONS FOR SELECTED SPREAD
    # -------------------------------------------------

    positions = SPREAD_POSITIONS.get(
        request.spread,
        SPREAD_POSITIONS['Three Card']
    )

    # -------------------------------------------------
    # VALIDATE NUMBER OF CARDS
    # -------------------------------------------------

    if len(request.cards) != len(positions):
        raise HTTPException(
            status_code=400,
            detail=f'{request.spread} requires {len(positions)} card(s).'
        )

    # -------------------------------------------------
    # CHECK DUPLICATE CARDS
    # -------------------------------------------------

    if len(set(request.cards)) != len(request.cards):
        raise HTTPException(
            status_code=400,
            detail='Each selected card must be unique.'
        )

    # -------------------------------------------------
    # FIND SELECTED CARDS
    # -------------------------------------------------

    found = []

    for position, name in zip(positions, request.cards):

        card = next(
            (c for c in TAROT if c['name'] == name),
            None
        )

        if not card:
            raise HTTPException(
                status_code=400,
                detail=f'Unknown tarot card: {name}'
            )

        # Create interpretation specifically for this card
        # and its position.
        interpretation = (
            f"{card.get('meaning', 'This card represents a meaningful theme.')} "
            f"In the {position.lower()} position, this suggests reflecting on "
            f"how these themes connect with your "
            f"{FOCUS_CONTEXT.get(request.focus, FOCUS_CONTEXT['General']).lower()}."
        )

        found.append({
            **card,
            'position': position,
            'interpretation': interpretation
        })

    # -------------------------------------------------
    # COLLECT CARD-SPECIFIC INFORMATION
    # -------------------------------------------------

    card_names = [
        card['name']
        for card in found
    ]

    meanings = [
        card.get('meaning', '')
        for card in found
    ]

    emotional_themes = [
        card.get('emotional', '')
        for card in found
    ]

    strengths_list = [
        card.get('strength', '')
        for card in found
    ]

    challenges_list = [
        card.get('challenge', '')
        for card in found
    ]

    guidance_list = [
        card.get('guidance', '')
        for card in found
    ]

    categories = [
        card.get('category', 'Reflection')
        for card in found
    ]

    unique_categories = list(
        dict.fromkeys(categories)
    )

    focus_context = FOCUS_CONTEXT.get(
        request.focus,
        FOCUS_CONTEXT['General']
    )

    # -------------------------------------------------
    # CARD SUMMARY
    # -------------------------------------------------

    card_summary = []

    for card in found:

        card_summary.append(
            f"{card['name']} ({card['position']}): "
            f"{card.get('meaning', '')}"
        )

    card_summary_text = " ".join(card_summary)

    # -------------------------------------------------
    # PERSONALITY
    # -------------------------------------------------

    personality = (
        f"Your selected cards — {', '.join(card_names)} — "
        f"create a personality theme around "
        f"{', '.join(unique_categories)}. "

        f"The reading suggests that your current approach to "
        f"{focus_context.lower()} may involve "
        f"{meanings[0]} "

        + (
            f"The presence of {card_names[1]} adds another layer of "
            f"{meanings[1].lower()} "
            if len(found) > 1
            else ""
        )

        + (
            f"Together, these cards suggest a personality that may "
            f"benefit from awareness, self-reflection and intentional "
            f"choices rather than reacting automatically to situations."
        )
    )

    # -------------------------------------------------
    # EMOTIONAL NATURE
    # -------------------------------------------------

    emotions = (
        f"Emotionally, the cards highlight the following themes: "
        f"{' '.join(emotional_themes)} "
        f"These themes can help you reflect on how you process "
        f"feelings and respond to situations related to "
        f"{focus_context.lower()}. "
        f"The reading encourages emotional awareness and honest "
        f"reflection rather than treating these themes as fixed traits."
    )

    # -------------------------------------------------
    # STRENGTHS
    # -------------------------------------------------

    strengths = (
        f"The cards highlight several potential strengths. "
        f"{' '.join(strengths_list)} "
        f"Taken together, these qualities can support you while "
        f"dealing with matters connected to {focus_context.lower()}. "
        f"Consider which of these qualities already feels natural "
        f"to you and which one you would like to develop further."
    )

    # -------------------------------------------------
    # CHALLENGES
    # -------------------------------------------------

    challenges = (
        f"The reading also highlights areas for reflection. "
        f"{' '.join(challenges_list)} "
        f"These are not fixed outcomes. Instead, they can be viewed "
        f"as possible patterns to become more aware of while dealing "
        f"with {focus_context.lower()}."
    )

    # -------------------------------------------------
    # PERSONAL GUIDANCE
    # -------------------------------------------------

    guidance = (
        f"For your {request.focus} reading, the cards suggest: "
        f"{' '.join(guidance_list)} "
        f"Considering the positions of the cards, use these themes "
        f"as practical reflection points for your current situation. "
        f"Focus on the choices and actions that are within your control."
    )

    # -------------------------------------------------
    # POSITION-BY-POSITION OVERALL INTERPRETATION
    # -------------------------------------------------

    position_messages = []

    for card in found:

        position_messages.append(
            f"In the {card['position'].lower()} position, "
            f"{card['name']} brings the theme of "
            f"{card.get('meaning', '').lower()}"
        )

    position_text = ". ".join(position_messages) + "."

    # -------------------------------------------------
    # OVERALL INTERPRETATION
    # -------------------------------------------------

    overall = (
        f"This {request.spread.lower()} reading focuses on "
        f"{focus_context.lower()}. "

        f"{position_text} "

        f"Together, {', '.join(card_names)} create a reading "
        f"centered around {', '.join(unique_categories)}. "

        f"The combination suggests that your current situation "
        f"can be explored through the themes represented by these "
        f"cards, particularly their relationship to "
        f"{focus_context.lower()}. "

        f"Use this reading as a structured tool for reflection, "
        f"personal insight and decision-making rather than as a "
        f"fixed prediction."
    )

    # -------------------------------------------------
    # RETURN RESULT
    # -------------------------------------------------

    global LATEST_TAROT_READING
    LATEST_TAROT_READING = {
        'user_name': effective_user,
        'focus': request.focus,
        'spread': request.spread,
        'positions': positions,
        'cards': found,
        'themes': unique_categories,
        'overall': overall,
        'personality': personality,
        'emotions': emotions,
        'strengths': strengths,
        'challenges': challenges,
        'guidance': guidance
    }
    # Save this actual tarot reading in history
    tarot_score = min(
        100,
        round(
            (len(found) / max(len(positions), 1)) * 100
        )
    )

    READING_HISTORY.append({
        "id": len(READING_HISTORY) + 1,
        "type": "Tarot Reading",
        "date": datetime.now().strftime("%d %b %Y"),
        "score": f"{tarot_score}%",
        "user_name": effective_user,
        "summary": f"{request.spread} reading focused on {request.focus}."
    })
    save_reading_history()

    return LATEST_TAROT_READING
@app.post('/api/consultations')
def create_consultation(request: ConsultationRequest):
    if request.consultation_mode == 'Appointment':
        if not request.appointment_date or not request.appointment_time:
            raise HTTPException(status_code=400, detail='Appointment date and time are required.')
        appt_dt = parse_appt_datetime(request.appointment_date, request.appointment_time)
        if not appt_dt:
            raise HTTPException(status_code=400, detail='Invalid appointment date or time format. Please use YYYY-MM-DD and HH:MM.')
        if appt_dt < datetime.now(KOLKATA_TZ):
            raise HTTPException(status_code=400, detail='Cannot request an appointment for a past date or time.')

    consultation = {
        'id': len(CONSULTATION_REQUESTS) + 1,
        'user_name': request.user_name.strip(),
        'consultant_type': request.consultant_type.strip(),
        'consultant_name': (request.consultant_name or '').strip(),
        'question': request.question.strip(),
        'focus': request.focus.strip(),
        'spread': request.spread.strip(),
        'cards': request.cards,
        'consultation_mode': request.consultation_mode.strip(),
        'appointment_date': request.appointment_date.strip(),
        'appointment_time': request.appointment_time.strip(),
        'duration': request.duration or 30,
        'details': request.details.strip(),
        'status': 'Pending',
        'meeting_url': None,
        'calendar_event_id': None,
        'calendar_status': 'pending_acceptance',
        'created_at': datetime.now(KOLKATA_TZ).isoformat()
    }

    CONSULTATION_REQUESTS.append(consultation)
    save_consultations()

    if request.consultation_mode == 'Appointment':
        message = f"Your appointment request has been sent to the {request.consultant_type}."
        recipient = request.consultant_name or request.consultant_type
        create_notification(
            recipient=recipient,
            title='New Appointment Request',
            message=f"Appointment request from {request.user_name} for {request.appointment_date} at {request.appointment_time} ({request.focus}).",
            notif_type='appointment',
            metadata={
                'user_name': request.user_name,
                'date': request.appointment_date,
                'time': request.appointment_time,
                'focus': request.focus,
                'consultation_id': consultation['id']
            }
        )
        log_activity('appointment_requested', str(consultation['id']), 'success', {
            'user': request.user_name,
            'consultant_type': request.consultant_type,
            'date': request.appointment_date,
            'time': request.appointment_time
        })
    else:
        message = f"Your question has been sent to the {request.consultant_type}."
        recipient = request.consultant_name or request.consultant_type
        create_notification(
            recipient=recipient,
            title='New Consultation Request',
            message=f"New question received from {request.user_name} regarding {request.focus}.",
            notif_type='question',
            metadata={
                'user_name': request.user_name,
                'focus': request.focus,
                'consultation_id': consultation['id']
            }
        )

    return {
        'success': True,
        'message': message,
        'consultation': consultation
    }

@app.get('/api/consultations/{consultant_type}')
def get_consultations(
    consultant_type: str,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):
    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user and auth_user.get('role') == 'User':
        raise HTTPException(status_code=403, detail="Forbidden: Regular users cannot browse consultant queries.")

    changed = False
    for c in CONSULTATION_REQUESTS:
        if c.get('consultation_mode') == 'Appointment' and c.get('status') == 'Pending' and is_appointment_expired(c):
            c['status'] = 'Expired'
            changed = True
    if changed:
        save_consultations()

    c_type_clean = consultant_type.strip().lower()
    if c_type_clean in {'spiritual consultant', 'consultant'}:
        return [
            consultation
            for consultation in CONSULTATION_REQUESTS
            if consultation.get('consultant_type', '').strip().lower() in {'spiritual consultant', 'consultant'}
            or consultation.get('consultation_mode') == 'Appointment'
        ]
    else:
        return [
            consultation
            for consultation in CONSULTATION_REQUESTS
            if consultation.get('consultant_type', '').strip().lower() == c_type_clean
            and consultation.get('consultation_mode') != 'Appointment'
        ]

@app.get('/api/user-consultations/{user_name}')
def get_user_consultations(
    user_name: str,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):
    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user:
        auth_role = auth_user.get('role', '')
        auth_name = auth_user.get('name', '').strip().lower()
        auth_email = auth_user.get('email', '').strip().lower()
        target_name = user_name.strip().lower()
        if auth_role not in ['Administrator', 'Spiritual Consultant', 'Tarot Reader']:
            if target_name not in [auth_name, auth_email]:
                raise HTTPException(status_code=403, detail="Forbidden: You cannot access consultations for another user.")

    changed = False
    for c in CONSULTATION_REQUESTS:
        if c.get('consultation_mode') == 'Appointment' and c.get('status') == 'Pending' and is_appointment_expired(c):
            c['status'] = 'Expired'
            changed = True
    if changed:
        save_consultations()

    u_clean = user_name.strip().lower()
    return [
        consultation
        for consultation in CONSULTATION_REQUESTS
        if consultation.get('user_name', '').strip().lower() == u_clean
    ]

@app.post('/api/consultations/{consultation_id}/reply')
def reply_to_consultation(consultation_id: int, request: ConsultationReply):
    for consultation in CONSULTATION_REQUESTS:
        if consultation['id'] == consultation_id:
            consultation['reply'] = request.reply.strip()
            consultation['status'] = 'Answered'
            save_consultations()

            create_notification(
                recipient=consultation.get('user_name', 'User'),
                title='Spiritual Guidance Received',
                message=f"Your consultant sent guidance for your request ({consultation.get('focus', 'General')}).",
                notif_type='guidance',
                metadata={
                    'consultation_id': consultation_id,
                    'reply': request.reply
                }
            )
            return {
                'success': True,
                'message': 'Reply sent successfully.',
                'consultation': consultation
            }

    raise HTTPException(status_code=404, detail='Consultation not found.')

class AppointmentResponseRequest(BaseModel):
    status: str
    reason: Optional[str] = None
    decline_reason: Optional[str] = None

class AppointmentStatusRequest(BaseModel):
    status: str
    reason: Optional[str] = None
    decline_reason: Optional[str] = None

@app.post('/api/consultations/{consultation_id}/appointment-response')
@app.put('/api/consultations/{consultation_id}/status')
def respond_to_appointment(consultation_id: int, request: AppointmentResponseRequest):
    for consultation in CONSULTATION_REQUESTS:
        if consultation['id'] == consultation_id:
            status = request.status.strip()
            if status not in ['Accepted', 'Declined', 'Expired', 'Pending', 'Completed']:
                raise HTTPException(status_code=400, detail='Invalid appointment status.')

            user_name = consultation.get('user_name', 'User')
            consultant_title = consultation.get('consultant_type', 'Spiritual Consultant')

            if status == 'Accepted':
                if is_appointment_expired(consultation):
                    raise HTTPException(status_code=400, detail='Cannot accept an expired appointment. The scheduled date and time have passed.')

                consultation['status'] = 'Accepted'
                consultation.pop('decline_reason', None)

                # Initiate Google Calendar and Google Meet creation
                cal_res = create_or_update_google_calendar_event(consultation)
                save_consultations()

                meet_url = consultation.get('meeting_url')
                consultation['meeting_link'] = meet_url
                msg = f"Your appointment for {consultation.get('focus', 'Consultation')} has been accepted by the {consultant_title}."
                if meet_url:
                    msg += f" Google Meet Link: {meet_url}"
                else:
                    msg += " Your consultant will share the Google Meet link before the session."

                create_notification(
                    recipient=user_name,
                    title='Appointment Accepted',
                    message=msg,
                    notif_type='appointment_accepted',
                    metadata={
                        'consultation_id': consultation_id,
                        'status': 'Accepted',
                        'date': consultation.get('appointment_date'),
                        'time': consultation.get('appointment_time'),
                        'meeting_url': meet_url,
                        'meeting_link': meet_url
                    }
                )

                log_activity('appointment_accepted', str(consultation_id), 'success', {
                    'user': user_name,
                    'consultant_type': consultant_title,
                    'meeting_url': meet_url,
                    'calendar_status': consultation.get('calendar_status')
                })

                return {'success': True, 'consultation': consultation, 'item': consultation}

            elif status == 'Declined':
                reason_str = (request.reason or request.decline_reason or '').strip()
                if not reason_str:
                    raise HTTPException(status_code=400, detail='Reason is required when declining an appointment.')
                consultation['status'] = 'Declined'
                consultation['decline_reason'] = reason_str
                consultation['meeting_url'] = None
                consultation['meeting_link'] = None
                consultation['calendar_event_id'] = None
                consultation['calendar_status'] = None
                save_consultations()

                create_notification(
                    recipient=user_name,
                    title='Appointment Declined',
                    message=f"Your appointment request for {consultation.get('focus', 'Consultation')} was declined by the {consultant_title}. Reason: {reason_str}",
                    notif_type='appointment_declined',
                    metadata={
                        'consultation_id': consultation_id,
                        'status': 'Declined',
                        'reason': reason_str
                    }
                )

                log_activity('appointment_declined', str(consultation_id), 'success', {
                    'user': user_name,
                    'consultant_type': consultant_title,
                    'reason': reason_str
                })

                return {'success': True, 'consultation': consultation, 'item': consultation}

            else:
                consultation['status'] = status
                save_consultations()
                return {'success': True, 'consultation': consultation, 'item': consultation}

    raise HTTPException(status_code=404, detail='Consultation not found.')

@app.post('/api/consultations/{consultation_id}/generate-meeting')
def generate_meeting(consultation_id: int):
    for consultation in CONSULTATION_REQUESTS:
        if consultation['id'] == consultation_id:
            if consultation.get('status') != 'Accepted':
                raise HTTPException(status_code=400, detail='Meeting links can only be generated for Accepted appointments.')

            # Check if meeting already generated to prevent duplicate creation
            if consultation.get('meeting_url') and consultation.get('calendar_event_id'):
                consultation['meeting_link'] = consultation.get('meeting_url')
                return {
                    'success': True,
                    'meeting_url': consultation.get('meeting_url'),
                    'meeting_link': consultation.get('meeting_url'),
                    'message': 'Google Meet link is already active.'
                }

            res = create_or_update_google_calendar_event(consultation)
            save_consultations()
            meet_url = consultation.get('meeting_url')
            if meet_url:
                consultation['meeting_link'] = meet_url
                save_consultations()
                user_name = consultation.get('user_name', 'User')
                consultant_title = consultation.get('consultant_type', 'Spiritual Consultant')
                create_notification(
                    recipient=user_name,
                    title='Google Meet Link Available',
                    message=f"Google Meet link generated for your appointment with {consultant_title}: {meet_url}",
                    notif_type='meeting_created',
                    metadata={
                        'consultation_id': consultation_id,
                        'meeting_url': meet_url,
                        'meeting_link': meet_url,
                        'date': consultation.get('appointment_date'),
                        'time': consultation.get('appointment_time')
                    }
                )
                return {'success': True, 'meeting_url': meet_url, 'meeting_link': meet_url, 'message': 'Google Meet created successfully.'}
            else:
                status = res.get('status', 'unknown')
                err = res.get('error', '')
                if status == 'not_configured':
                    msg = 'Google Calendar is not configured. Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend environment variables and complete authorization to generate Google Meet links.'
                else:
                    msg = f"Failed to generate Google Meet link: {err or 'Google Calendar API returned no conference link.'}"
                return {'success': False, 'calendar_status': status, 'message': msg}
    raise HTTPException(status_code=404, detail='Consultation not found.')

class ManualMeetLinkRequest(BaseModel):
    meeting_url: Optional[str] = None
    meet_link: Optional[str] = None

@app.post('/api/consultations/{consultation_id}/meet-link')
@app.put('/api/consultations/{consultation_id}/meet-link')
def save_consultation_meet_link(consultation_id: int, req: ManualMeetLinkRequest):
    raw_url = (req.meeting_url or req.meet_link or '').strip()
    if not (raw_url.startswith('https://meet.google.com/') and len(raw_url) >= 25):
        raise HTTPException(
            status_code=400,
            detail='Invalid Google Meet URL. The meeting link must be an HTTPS URL starting with https://meet.google.com/'
        )

    for consultation in CONSULTATION_REQUESTS:
        if consultation['id'] == consultation_id:
            user_name = consultation.get('user_name', 'User')
            consultant_title = consultation.get('consultant_type', 'Spiritual Consultant')

            consultation['meeting_url'] = raw_url
            consultation['meeting_link'] = raw_url
            if consultation.get('status') == 'Pending':
                consultation['status'] = 'Accepted'
            save_consultations()

            create_notification(
                recipient=user_name,
                title='Google Meet Link Available',
                message=f"Your {consultant_title} has provided the Google Meet link for your consultation ({consultation.get('focus', 'Consultation')}): {raw_url}",
                notif_type='meeting_created',
                metadata={
                    'consultation_id': consultation_id,
                    'meeting_url': raw_url,
                    'meeting_link': raw_url,
                    'date': consultation.get('appointment_date'),
                    'time': consultation.get('appointment_time')
                }
            )

            log_activity('manual_meet_link_saved', str(consultation_id), 'success', {
                'user': user_name,
                'consultant_type': consultant_title,
                'meeting_url': raw_url
            })

            return {
                'success': True,
                'meeting_url': raw_url,
                'meeting_link': raw_url,
                'consultation': consultation,
                'item': consultation,
                'message': 'Google Meet link saved and shared with client successfully.'
            }

    raise HTTPException(status_code=404, detail='Consultation not found.')

@app.get('/api/google/calendar/auth-url')
def google_calendar_auth_url():
    client_id = os.getenv('GOOGLE_CLIENT_ID', '').strip()
    redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/google/calendar/callback').strip()
    if not client_id:
        return {'configured': False, 'url': None, 'message': 'GOOGLE_CLIENT_ID is not configured in .env'}
    scopes = 'https://www.googleapis.com/auth/calendar.events openid email profile'
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': scopes,
        'access_type': 'offline',
        'prompt': 'consent'
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return {'configured': True, 'url': url}

@app.get('/api/google/calendar/callback')
def google_calendar_callback(code: Optional[str] = None, error: Optional[str] = None):
    if error or not code:
        log_activity('calendar_auth_failed', 'system', 'failure', {'error': error or 'Missing code'})
        return HTMLResponse("<h3>Google Calendar authorization failed or was cancelled.</h3><p>You can close this window.</p>")
    client_id = os.getenv('GOOGLE_CLIENT_ID', '').strip()
    client_secret = os.getenv('GOOGLE_CLIENT_SECRET', '').strip()
    redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/google/calendar/callback').strip()
    token_url = "https://oauth2.googleapis.com/token"
    params = {
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': redirect_uri
    }
    encoded_data = urllib.parse.urlencode(params).encode('utf-8')
    req = urllib.request.Request(token_url, data=encoded_data, headers={
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'AI-Palmistry-Tarot-Platform/1.0'
    })
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=12, context=ctx) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            refresh_token = res_data.get('refresh_token')
            access_token = res_data.get('access_token')
            expires_in = int(res_data.get('expires_in', 3600))
            existing = {}
            if CALENDAR_TOKENS_FILE.exists():
                try:
                    existing = json.loads(CALENDAR_TOKENS_FILE.read_text(encoding='utf-8'))
                except Exception:
                    existing = {}
            if not refresh_token and 'refresh_token' in existing:
                refresh_token = existing['refresh_token']
            token_record = {
                'refresh_token': refresh_token,
                'access_token': access_token,
                'expires_at': int(time.time()) + expires_in,
                'updated_at': datetime.now(KOLKATA_TZ).isoformat()
            }
            CALENDAR_TOKENS_FILE.write_text(json.dumps(token_record, indent=2), encoding='utf-8')
            log_activity('calendar_connected', 'system', 'success', {'message': 'Google Calendar connected successfully'})
            return HTMLResponse("""
                <div style="font-family: sans-serif; text-align: center; padding: 40px;">
                    <h2 style="color: #16a34a;">✓ Google Calendar Connected Successfully!</h2>
                    <p>Google Meet appointment links can now be generated automatically.</p>
                    <p>You can close this tab and return to the application.</p>
                </div>
            """)
    except Exception as e:
        log_activity('calendar_token_exchange_error', 'system', 'failure', {'error': str(e)})
        return HTMLResponse(f"<h3>Failed to exchange authorization token with Google: {str(e)}</h3>")

@app.get('/api/google/calendar/status')
def google_calendar_status():
    client_id = bool(os.getenv('GOOGLE_CLIENT_ID', '').strip())
    client_secret = bool(os.getenv('GOOGLE_CLIENT_SECRET', '').strip())
    has_tokens = False
    if CALENDAR_TOKENS_FILE.exists():
        try:
            tokens = json.loads(CALENDAR_TOKENS_FILE.read_text(encoding='utf-8'))
            has_tokens = bool(tokens.get('refresh_token'))
        except Exception:
            has_tokens = False
    return {
        'configured': client_id and client_secret,
        'connected': has_tokens,
        'has_client_id': client_id,
        'has_client_secret': client_secret
    }

@app.post('/api/google/calendar/disconnect')
def google_calendar_disconnect():
    if CALENDAR_TOKENS_FILE.exists():
        try:
            CALENDAR_TOKENS_FILE.unlink()
        except Exception:
            pass
    log_activity('calendar_disconnected', 'system', 'success', {'message': 'Google Calendar disconnected'})
    return {'success': True, 'message': 'Google Calendar disconnected successfully.'}

@app.get('/api/notifications/{recipient}')
def get_notifications(
    recipient: str,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):
    auth_user = resolve_auth_user(authorization, x_auth_token)
    r_clean = recipient.strip().lower()
    if auth_user:
        auth_role = auth_user.get('role', '')
        auth_name = auth_user.get('name', '').strip().lower()
        if auth_role == 'User':
            if auth_name != r_clean:
                raise HTTPException(status_code=403, detail="Forbidden: You cannot access notifications for another user.")

    items = [
        n for n in reversed(NOTIFICATIONS)
        if n.get('recipient', '').strip().lower() == r_clean
        or (r_clean in {'spiritual consultant', 'consultant'} and n.get('recipient', '').strip().lower() in {'spiritual consultant', 'consultant'})
    ]
    unread_count = sum(1 for n in items if not n.get('read'))
    return {'notifications': items, 'unread_count': unread_count}

@app.post('/api/notifications/mark-read')
def mark_notifications_read(recipient: str = Form(...)):
    r_clean = recipient.strip().lower()
    for n in NOTIFICATIONS:
        if n.get('recipient', '').strip().lower() == r_clean or (r_clean in {'spiritual consultant', 'consultant'} and n.get('recipient', '').strip().lower() in {'spiritual consultant', 'consultant'}):
            n['read'] = True
    save_notifications()
    return {'success': True}

@app.get('/api/palm/readings/user/{user_name}')
def get_user_palm_readings(
    user_name: str,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):
    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user:
        auth_role = auth_user.get('role', '')
        auth_name = auth_user.get('name', '').strip().lower()
        auth_email = auth_user.get('email', '').strip().lower()
        target_name = user_name.strip().lower()
        if auth_role not in ['Administrator', 'Spiritual Consultant']:
            if target_name not in [auth_name, auth_email]:
                raise HTTPException(status_code=403, detail="Forbidden: You cannot access reading history for another user.")

    u_clean = user_name.strip().lower()
    return [
        pr for pr in reversed(PALM_READINGS)
        if pr.get('user_name', '').strip().lower() == u_clean
    ]

@app.get('/api/palm/readings/latest/{user_name}')
def get_latest_user_palm_reading(
    user_name: str,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):
    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user:
        auth_role = auth_user.get('role', '')
        auth_name = auth_user.get('name', '').strip().lower()
        auth_email = auth_user.get('email', '').strip().lower()
        target_name = user_name.strip().lower()
        if auth_role not in ['Administrator', 'Spiritual Consultant']:
            if target_name not in [auth_name, auth_email]:
                raise HTTPException(status_code=403, detail="Forbidden: You cannot access reading history for another user.")

    u_clean = user_name.strip().lower()
    for pr in reversed(PALM_READINGS):
        if pr.get('user_name', '').strip().lower() == u_clean:
            return pr
    return {'available': False}

@app.get('/api/consultant/user-insights/{user_name}')
def get_consultant_user_insights(user_name: str):
    u_clean = user_name.strip().lower()
    user_account = USERS.get(u_clean, None)
    if not user_account:
        for email, acc in USERS.items():
            if acc.get('name', '').strip().lower() == u_clean:
                user_account = acc
                break

    latest_palm = None
    for pr in reversed(PALM_READINGS):
        if pr.get('user_name', '').strip().lower() == u_clean:
            latest_palm = pr
            break

    latest_tarot = None
    for tr in reversed(TAROT_READINGS):
        if tr.get('user_name', '').strip().lower() == u_clean:
            latest_tarot = tr
            break

    user_consultations = [
        c for c in CONSULTATION_REQUESTS
        if c.get('user_name', '').strip().lower() == u_clean
    ]

    has_readings = bool(latest_palm or latest_tarot)

    if not has_readings:
        return {
            'user_name': user_name,
            'user_account': user_account or {'name': user_name, 'role': 'User'},
            'has_readings': False,
            'data_basis': 'None',
            'palm_analysis': None,
            'tarot_reading': None,
            'consultations': user_consultations,
            'strengths': [],
            'growth_areas': [],
            'guidance_suggestions': [
                "Invite the user to complete their first Palm Reading or Tarot Reading.",
                "Review upcoming consultation topics and prepare baseline reflection questions."
            ],
            'synthesis': f"No reading history found for {user_name}. Personalized insights will be generated once the user completes a palm analysis or tarot reading."
        }

    palm_features = latest_palm.get('features', {}) if latest_palm else {}
    tarot_cards = []
    tarot_focus = ""
    if latest_tarot:
        tarot_focus = latest_tarot.get('focus', 'General Guidance')
        if isinstance(latest_tarot.get('cards'), list):
            tarot_cards = latest_tarot.get('cards')
        elif isinstance(latest_tarot.get('reading'), dict):
            tarot_cards = latest_tarot['reading'].get('cards', [])

    card_names = [c.get('name', c) if isinstance(c, dict) else str(c) for c in tarot_cards]

    strengths = []
    growth_areas = []

    if latest_palm:
        if palm_features.get('Heart Line', 0) >= 60:
            strengths.append(f"Strong emotional awareness and interpersonal connection (Heart Line {palm_features.get('Heart Line')}%)")
        elif palm_features.get('Heart Line', 0) > 0:
            growth_areas.append("Managing emotional sensitivity and establishing healthy boundaries (Heart Line)")

        if palm_features.get('Head Line', 0) >= 60:
            strengths.append(f"Analytical clarity and structured problem-solving (Head Line {palm_features.get('Head Line')}%)")
        elif palm_features.get('Head Line', 0) > 0:
            growth_areas.append("Balancing mental analysis with intuitive action (Head Line)")

        if palm_features.get('Life Line', 0) >= 60:
            strengths.append(f"Steady vitality and personal endurance (Life Line {palm_features.get('Life Line')}%)")

        if palm_features.get('Fate Line', 0) >= 60:
            strengths.append(f"Vocation and purposeful career alignment (Fate Line {palm_features.get('Fate Line')}%)")

        if palm_features.get('Sun Line', 0) >= 60:
            strengths.append(f"Creative expression and natural confidence (Sun Line {palm_features.get('Sun Line')}%)")

    if card_names:
        cards_str = ', '.join(card_names[:3])
        strengths.append(f"Tarot synergy with {cards_str} ({tarot_focus} focus)")

    if not strengths:
        strengths.append("Adaptability, openness and commitment to personal growth")
    if not growth_areas:
        growth_areas.append("Maintaining regular reflective pauses and grounded decision-making")

    # Generate genuinely differentiated synthesis based on available reading data
    if latest_palm and latest_tarot:
        data_basis = "Combined (Palmistry & Tarot)"
        top_palm_line = max(palm_features.items(), key=lambda x: x[1])[0] if palm_features else "palm traits"
        synthesis = (
            f"Integrated spiritual profile for {user_name} based on authentic Palmistry and Tarot records. "
            f"Prominent palm strength in {top_palm_line} ({palm_features.get(top_palm_line, 0)}%) corresponds with "
            f"Tarot exploration centered on '{tarot_focus}' featuring {', '.join(card_names[:3]) if card_names else 'selected cards'}."
        )
    elif latest_palm:
        data_basis = "Palmistry Analysis Only"
        top_line = max(palm_features.items(), key=lambda x: x[1]) if palm_features else ("Palm lines", 50)
        synthesis = (
            f"Spiritual profile for {user_name} based on authentic Palmistry biometric analysis. "
            f"Hand shape ({latest_palm.get('palm_shape', 'Natural')}) and {top_line[0]} strength ({top_line[1]}%) "
            f"highlight core grounding and personal vitality. Tarot reading recommended for multidimensional reflection."
        )
    else:
        data_basis = "Tarot Consultation Only"
        synthesis = (
            f"Spiritual profile for {user_name} based on authentic Tarot consultation records. "
            f"Focus centered on '{tarot_focus}' with {', '.join(card_names[:3]) if card_names else 'card spreads'} "
            f"revealing symbolic themes. Palm reading recommended to cross-examine biometric line evidence."
        )

    suggestions = [
        f"Acknowledge {user_name}'s authentic reading context ({data_basis}) with compassionate guidance.",
        "Reinforce their identified strengths and practical next steps for their personal journey.",
        "Ground recommendations in their specific focus areas and life themes."
    ]

    return {
        'user_name': user_name,
        'user_account': user_account or {'name': user_name, 'role': 'User'},
        'has_readings': True,
        'data_basis': data_basis,
        'palm_analysis': latest_palm,
        'tarot_reading': latest_tarot,
        'consultations': user_consultations,
        'strengths': strengths,
        'growth_areas': growth_areas,
        'guidance_suggestions': suggestions,
        'synthesis': synthesis
    }

    raise HTTPException(
        status_code=404,
        detail='Consultation not found.'
    )
@app.get('/api/consultant/trends')
def get_consultant_trends():

    consultations = CONSULTATION_REQUESTS

    total = len(consultations)

    answered = sum(
        1 for item in consultations
        if item.get('status') == 'Answered'
    )

    pending = total - answered

    question_requests = sum(
        1 for item in consultations
        if item.get('consultation_mode') != 'Appointment'
    )

    appointment_requests = sum(
        1 for item in consultations
        if item.get('consultation_mode') == 'Appointment'
    )

    # Popular consultation topics
    topics = {}

    for item in consultations:

        topic = item.get('focus') or 'Other'

        topics[topic] = topics.get(topic, 0) + 1

    topic_data = [
        {
            'topic': topic,
            'count': count
        }
        for topic, count in topics.items()
    ]

    # Consultation activity
    activity = {}

    for item in consultations:

        created_at = item.get('created_at')

        if not created_at:
            continue

        try:
            from datetime import datetime

            date = datetime.fromisoformat(
                created_at
            ).strftime('%Y-%m-%d')

            if date not in activity:
                activity[date] = {
                    'date': date,
                    'questions': 0,
                    'appointments': 0,
                    'total': 0
                }

            activity[date]['total'] += 1

            if item.get('consultation_mode') == 'Appointment':
                activity[date]['appointments'] += 1
            else:
                activity[date]['questions'] += 1

        except Exception:
            continue

    activity_data = sorted(
        activity.values(),
        key=lambda x: x['date']
    )

    # Unique clients
    clients = set(
        item.get('user_name')
        for item in consultations
        if item.get('user_name')
    )

    return {
        'total_clients': len(clients),
        'total_consultations': total,
        'answered': answered,
        'pending': pending,
        'question_requests': question_requests,
        'appointment_requests': appointment_requests,
        'topics': topic_data,
        'activity': activity_data
    }
@app.get('/api/insights')
def insights(
    user_name: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):
    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user:
        auth_name = auth_user.get('name', '').strip()
        auth_role = auth_user.get('role', '')
        if isinstance(user_name, str) and user_name.strip() and user_name.strip().lower() != auth_name.lower():
            if auth_role not in ['Administrator', 'Spiritual Consultant']:
                raise HTTPException(
                    status_code=403,
                    detail="Forbidden: You cannot access AI insights for another user."
                )
            target_user = user_name.strip().lower()
        else:
            target_user = auth_name.lower()
    else:
        if not isinstance(user_name, str) or not user_name.strip():
            return {
                "available": False,
                "reading_id": None,
                "palm_reading_id": None,
                "tarot_reading_id": None,
                "score": 0,
                "personality": "Complete a palm reading or Tarot reading to generate personalized insights.",
                "lines": [],
                "strengths": [],
                "challenges": [],
                "opportunities": [],
                "recommendations": [],
                "message": "Complete a palm reading or Tarot reading to generate personalized insights."
            }
        target_user = user_name.strip().lower()

    target_palm = None
    target_tarot = None

    for pr in reversed(PALM_READINGS):
        if pr.get('user_name', '').strip().lower() == target_user:
            target_palm = pr
            break
    for tr in reversed(TAROT_READINGS):
        if tr.get('user_name', '').strip().lower() == target_user:
            target_tarot = tr
            break

    if not target_palm and not target_tarot:
        return {
            "available": False,
            "reading_id": None,
            "palm_reading_id": None,
            "tarot_reading_id": None,
            "score": 0,
            "personality": "Complete a palm reading or Tarot reading to generate personalized insights.",
            "lines": [],
            "strengths": [],
            "challenges": [],
            "opportunities": [],
            "recommendations": [],
            "message": "Complete a palm reading or Tarot reading to generate personalized insights."
        }

    features = target_palm.get("features", {}) if target_palm else {}

    def get_score(name):
        value = features.get(name, 0)
        try:
            return round(float(value), 1)
        except Exception:
            return 0.0

    preferred_order = ['Heart Line', 'Life Line', 'Head Line', 'Fate Line', 'Sun Line']
    lines = []
    for name in preferred_order:
        if name in features:
            lines.append({
                "name": name,
                "score": get_score(name)
            })
    for name, value in features.items():
        if name not in preferred_order:
            lines.append({
                "name": name,
                "score": get_score(name)
            })

    # Strongest and weaker lines
    lines_sorted = sorted(lines, key=lambda item: item["score"], reverse=True)
    strong_lines = [item for item in lines_sorted if item["score"] >= 65]
    weaker_lines = [item for item in lines_sorted if item["score"] < 45]

    # Strengths from Palm features
    strengths = []
    if any("Life" in item["name"] for item in strong_lines):
        strengths.append("Resilience, steady vitality and endurance")
    if any("Head" in item["name"] for item in strong_lines):
        strengths.append("Analytical clarity, focus and structured reasoning")
    if any("Heart" in item["name"] for item in strong_lines):
        strengths.append("Emotional awareness, deep empathy and interpersonal warmth")
    if any("Fate" in item["name"] for item in strong_lines):
        strengths.append("Clear sense of purpose, vocation and self-direction")
    if any("Sun" in item["name"] for item in strong_lines):
        strengths.append("Creative self-expression, confidence and recognition")

    # Challenges from Palm features
    challenges = []
    if any("Heart" in item["name"] for item in weaker_lines):
        challenges.append("Managing emotional sensitivity and establishing healthy boundaries")
    if any("Head" in item["name"] for item in weaker_lines):
        challenges.append("Balancing mental overthinking with spontaneous decisions")
    if any("Fate" in item["name"] for item in weaker_lines):
        challenges.append("Navigating shifting career direction and adapting to changes")

    # Integrate actual Tarot readings if present
    tarot_cards = []
    tarot_focus = ""
    if target_tarot:
        tarot_focus = target_tarot.get('focus', 'General')
        if isinstance(target_tarot.get('cards'), list):
            tarot_cards = target_tarot.get('cards')
        elif isinstance(target_tarot.get('reading'), dict):
            tarot_cards = target_tarot['reading'].get('cards', [])

        card_names = [c.get('name', c) if isinstance(c, dict) else str(c) for c in tarot_cards]
        if card_names:
            strengths.append(f"Tarot synergy with {', '.join(card_names[:3])} ({tarot_focus} focus)")

    if not strengths:
        strengths.append("Adaptability, reflective curiosity and personal growth potential")
    if not challenges:
        challenges.append("Maintaining regular reflection and consistent self-awareness")

    opportunities = [
        "Personal growth through reflective awareness",
        "Building authentic confidence in your decisions",
        "Harnessing your strongest palm traits and tarot themes"
    ]
    if tarot_focus:
        opportunities.append(f"Deepening focus on {tarot_focus} guidance")

    recommendations = [
        "Reflect intentionally on the patterns highlighted in your reading",
        "Channel your strongest qualities in your daily routines",
        "Set clear short-term personal development intentions",
        "Review your reading progress as new insights emerge"
    ]
    if strong_lines:
        top_line = strong_lines[0]["name"]
        recommendations.insert(0, f"Build on the natural strengths indicated by your {top_line}")

    # Overall score matching the saved reading
    if target_palm and target_palm.get("palm_score") is not None:
        score = target_palm.get("palm_score")
    elif lines:
        score = round(sum(item["score"] for item in lines) / len(lines))
    else:
        score = 75

    personality = (
        "Your reading highlights a profile shaped by your authentic palm line patterns and Tarot reflection. "
        "These insights are intended as supportive, reflective guidance for personal awareness rather than fixed predictions."
    )
    if tarot_focus:
        personality += f" Recent consultation focus centered on {tarot_focus}."

    return {
        "available": True,
        "reading_id": target_palm.get("id") if target_palm else (target_tarot.get("id") if target_tarot else None),
        "palm_reading_id": target_palm.get("id") if target_palm else None,
        "tarot_reading_id": target_tarot.get("id") if target_tarot else None,
        "score": score,
        "handedness": (
            f"{target_palm.get('handedness')} Hand"
            if target_palm and target_palm.get("handedness") in ["Right", "Left"]
            else (
                "Hand detected (side uncertain)"
                if target_palm and target_palm.get("handedness") == "Uncertain"
                else (target_palm.get("handedness", "Hand detected") if target_palm else "Hand detected")
            )
        ),
        "palm_shape": target_palm.get("palm_shape", "Natural") if target_palm else "Balanced",
        "personality": personality,
        "lines": lines,
        "strengths": strengths,
        "challenges": challenges,
        "opportunities": opportunities,
        "recommendations": recommendations,
        "tarot_focus": tarot_focus or None,
        "tarot_cards": [c.get('name', c) if isinstance(c, dict) else str(c) for c in tarot_cards][:5]
    }
TAROT_CATEGORY_WEIGHTS = {
    'Success': 92, 'Fulfillment': 92, 'Abundance': 90, 'Completion': 90,
    'Hope': 88, 'Celebration': 88, 'Mastery': 88, 'Renewal': 88,
    'Opportunity': 86, 'Recognition': 86, 'Confidence': 86,
    'Growth': 85, 'Inspiration': 85, 'Harmony': 85, 'Leadership': 85,
    'Vision': 85, 'Partnership': 85, 'Nurturing': 85, 'Romance': 85,
    'Clarity': 84, 'Expansion': 84, 'Momentum': 84, 'Community': 84,
    'Generosity': 84, 'Stability': 84, 'Compassion': 84, 'Determination': 84,
    'Collaboration': 84, 'Power': 82, 'Wisdom': 82, 'Healing': 82,
    'Security': 82, 'Independence': 82, 'Consistency': 82, 'Discernment': 82,
    'Balance': 80, 'Resilience': 80, 'Patience': 80,
    'Action': 76, 'Maturity': 76, 'Intuition': 75, 'Transformation': 75,
    'Learning': 74, 'Discovery': 74, 'Strategy': 74, 'Journey': 72,
    'Emotion': 72, 'Recovery': 72, 'Perspective': 70, 'Change': 70,
    'Transition': 70, 'Sensitivity': 70, 'Decision': 70, 'Choices': 68,
    'Reflection': 68, 'Memory': 68,
    'Persistence': 58, 'Responsibility': 58, 'Endurance': 55,
    'Reset': 50, 'Challenge': 48, 'Ending': 46, 'Conflict': 45, 'Worry': 42
}

def get_card_category_for_trend(card_item: Any) -> str:
    if isinstance(card_item, dict) and card_item.get('category'):
        return card_item['category']
    card_name = card_item.get('name', card_item) if isinstance(card_item, dict) else str(card_item)
    card_match = next((c for c in TAROT if c.get('name') == card_name), None)
    return card_match.get('category', 'Reflection') if card_match else 'Reflection'

def compute_tarot_reading_score(reading_record: dict) -> int:
    cards = reading_record.get('cards')
    if not isinstance(cards, list):
        cards = []
    reading_obj = reading_record.get('reading')
    if not isinstance(reading_obj, dict):
        reading_obj = {}
    detailed_cards = reading_obj.get('cards', [])
    if not isinstance(detailed_cards, list):
        detailed_cards = []

    weights = []
    for c in cards:
        c_name = c.get('name', c) if isinstance(c, dict) else str(c)
        match = next((dc for dc in detailed_cards if isinstance(dc, dict) and dc.get('name') == c_name), None)
        cat = match.get('category') if (match and match.get('category')) else get_card_category_for_trend(c_name)
        weights.append(TAROT_CATEGORY_WEIGHTS.get(cat, 70))
    return int(round(sum(weights) / len(weights))) if weights else 70

def get_empty_life_trends():
    return {
        'status': 'empty',
        'has_readings': False,
        'is_single_reading': False,
        'total_readings': 0,
        'palm_count': 0,
        'tarot_count': 0,
        'latest_date': None,
        'latest_reading_date': None,
        'message': 'Your life trend analysis will appear after your first palm or Tarot reading.',
        'trend_points': [],
        'points': [],
        'indicators': [
            {'label': 'Total Sessions', 'value': 0, 'description': 'Completed palm and Tarot readings'},
            {'label': 'Palm Readings', 'value': 0, 'description': 'Biometric hand and line analyses'},
            {'label': 'Tarot Readings', 'value': 0, 'description': 'Symbolic card consultations'},
            {'label': 'Latest Activity', 'value': 'None', 'description': 'No recorded session timestamp'}
        ],
        'metrics': [
            {'id': 'life_path', 'icon': '◎', 'title': 'Life Path Analysis', 'value': 0, 'status': 'No Data', 'text': 'Direction and vocational focus derived from your recorded readings.'},
            {'id': 'opportunity', 'icon': '✦', 'title': 'Opportunity Identification', 'value': 0, 'status': 'No Data', 'text': 'Potential openings and creative possibilities from readings.'},
            {'id': 'challenge', 'icon': '△', 'title': 'Challenge Forecasting', 'value': 0, 'status': 'No Data', 'text': 'Areas that may require additional awareness and mindfulness.'},
            {'id': 'trend_monitoring', 'icon': '↗', 'title': 'Trend Monitoring', 'value': 0, 'status': 'No Data', 'text': 'Longitudinal trajectory across your recorded sessions.'},
            {'id': 'growth_potential', 'icon': '✧', 'title': 'Growth Potential', 'value': 0, 'status': 'No Data', 'text': 'Capacity for personal development grounded in line and card patterns.'}
        ],
        'primary_themes': [],
        'reflection_themes': [],
        'dominant_palm_traits': {},
        'areas_for_reflection': [],
        'reflection_summary': None,
        'personalized_summary': '',
        'scores': [],
        'months': []
    }

@app.get('/api/life-trends')
def life_trends(
    user_name: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):
    # Enforce authentic user resolution and scope
    auth_user = resolve_auth_user(authorization, x_auth_token)

    if auth_user:
        auth_name = auth_user.get('name', '').strip()
        auth_role = auth_user.get('role', '')

        # Block cross-user snooping unless user is administrator or consultant
        if isinstance(user_name, str) and user_name.strip() and user_name.strip().lower() != auth_name.lower():
            if auth_role not in ['Administrator', 'Spiritual Consultant']:
                raise HTTPException(
                    status_code=403,
                    detail="Forbidden: You cannot access reading history for another user."
                )
            target_user = user_name.strip().lower()
        else:
            target_user = auth_name.lower()
    else:
        # Backward compatibility for direct unit test calls (e.g. verify_repairs / test_suite)
        if not isinstance(user_name, str) or not user_name.strip():
            return get_empty_life_trends()
        target_user = user_name.strip().lower()

    # User-specific reading isolation
    user_palms = [
        p for p in PALM_READINGS
        if isinstance(p, dict) and p.get('user_name', '').strip().lower() == target_user
    ]
    user_tarots = [
        t for t in TAROT_READINGS
        if isinstance(t, dict) and t.get('user_name', '').strip().lower() == target_user
    ]

    total_palms = len(user_palms)
    total_tarots = len(user_tarots)
    total_readings = total_palms + total_tarots

    if total_readings == 0:
        return get_empty_life_trends()

    timeline = []

    # 1. Process genuine Palm Readings
    for p in user_palms:
        created = p.get('created_at', '')
        try:
            dt = datetime.fromisoformat(created)
            date_str = dt.strftime('%d %b %Y')
            timestamp = dt.timestamp()
        except Exception:
            date_str = 'Recent session'
            timestamp = 0

        features = p.get('features') or {}
        if not isinstance(features, dict):
            features = {}

        palm_score = p.get('palm_score')
        if palm_score is None:
            vals = [float(v) for v in features.values() if isinstance(v, (int, float))]
            palm_score = round(sum(vals) / len(vals)) if vals else 50
        try:
            palm_score = int(round(float(palm_score)))
        except (ValueError, TypeError):
            palm_score = 50

        feat_desc = ", ".join([f"{k}: {v}" for k, v in list(features.items())[:3]]) if features else "Lines detected"
        handedness = p.get('handedness', 'Hand')
        palm_shape = p.get('palm_shape', 'Natural')

        timeline.append({
            'id': f"palm-{p.get('id', len(timeline) + 1)}",
            'type': 'Palm Analysis',
            'timestamp': timestamp,
            'date': date_str,
            'label': f"{handedness} Palm ({palm_shape})",
            'score': palm_score,
            'metric_value': palm_score,
            'focus': 'Vitality & Line Balance',
            'detail': f"Hand shape: {palm_shape}. Lines: {feat_desc}",
            'summary': f"Hand shape: {palm_shape}. Lines: {feat_desc}",
            'tooltip': f"Palm Reading on {date_str} - Vitality Index {palm_score}% ({feat_desc})"
        })

    # 2. Process genuine Tarot Readings
    for t in user_tarots:
        created = t.get('created_at', '')
        try:
            dt = datetime.fromisoformat(created)
            date_str = dt.strftime('%d %b %Y')
            timestamp = dt.timestamp()
        except Exception:
            date_str = 'Recent session'
            timestamp = 0

        focus = t.get('focus', 'General')
        spread = t.get('spread', 'Tarot Spread')
        cards = t.get('cards') or []
        if not isinstance(cards, list):
            cards = []

        alignment_score = compute_tarot_reading_score(t)
        cards_preview = ", ".join([c.get('name', c) if isinstance(c, dict) else str(c) for c in cards[:3]]) if cards else "Cards drawn"

        timeline.append({
            'id': f"tarot-{t.get('id', len(timeline) + 1)}",
            'type': 'Tarot Reading',
            'timestamp': timestamp,
            'date': date_str,
            'label': f"{spread} ({focus})",
            'score': alignment_score,
            'metric_value': alignment_score,
            'focus': focus,
            'detail': f"Spread: {spread}. Cards: {cards_preview}",
            'summary': f"Spread: {spread}. Cards: {cards_preview}",
            'tooltip': f"Tarot Reading on {date_str} - Focus: {focus} ({cards_preview})"
        })

    # Chronological sort
    timeline.sort(key=lambda x: x['timestamp'])

    scores = [p['metric_value'] for p in timeline]
    months = [p['date'] for p in timeline]
    latest_item = timeline[-1]
    latest_score = scores[-1]
    is_single = (total_readings == 1)

    # 3. Themes and distribution
    theme_counts = {}
    for t in user_tarots:
        f = t.get('focus', 'General')
        theme_counts[f] = theme_counts.get(f, 0) + 1
    primary_themes = sorted([{'theme': k, 'count': v} for k, v in theme_counts.items()], key=lambda x: x['count'], reverse=True)
    if not primary_themes and user_palms:
        primary_themes = [{'theme': 'Vitality & Palmistry', 'count': len(user_palms)}]

    reflection_themes = [
        {'name': t['theme'], 'count': t['count'], 'sentiment': f"Focus of {t['count']} session{'s' if t['count'] > 1 else ''}"}
        for t in primary_themes
    ]

    # 4. Average Palm Traits
    avg_traits = {}
    if user_palms:
        trait_accum = {}
        for p in user_palms:
            for k, v in (p.get('features') or {}).items():
                if isinstance(v, (int, float)):
                    trait_accum.setdefault(k, []).append(float(v))
        avg_traits = {k: round(sum(v) / len(v), 1) for k, v in trait_accum.items()}

    # 5. Meaningful Metrics (Phase 3)
    # Metric 1: Life Path Analysis
    fate_scores = [float((p.get('features') or {}).get('Fate Line')) for p in user_palms if isinstance((p.get('features') or {}).get('Fate Line'), (int, float))]
    fate_avg = round(sum(fate_scores) / len(fate_scores), 1) if fate_scores else None
    career_tarots = [t for t in user_tarots if t.get('focus') == 'Career']
    career_scores = [compute_tarot_reading_score(t) for t in career_tarots]
    career_avg = round(sum(career_scores) / len(career_scores), 1) if career_scores else None

    if fate_avg is not None and career_avg is not None:
        lp_val = int(round((fate_avg + career_avg) / 2))
        lp_text = f"Synthesizes Fate Line clarity ({fate_avg}%) and {len(career_tarots)} vocational Tarot reading(s)."
        lp_status = f"{lp_val}% Grounded"
    elif fate_avg is not None:
        lp_val = int(round(fate_avg))
        lp_text = f"Derived from biometric Fate Line clarity ({fate_avg}%) across palm sessions."
        lp_status = f"{lp_val}% Palm Baseline"
    elif career_avg is not None:
        lp_val = int(round(career_avg))
        lp_text = f"Reflects {len(career_tarots)} vocational Tarot consultation(s) with focus on career direction."
        lp_status = f"{lp_val}% Tarot Reflection"
    else:
        lp_val = latest_score
        lp_text = "Direction and energy derived from your overall consultation patterns."
        lp_status = f"{lp_val}% General Alignment"

    # Metric 2: Opportunity Identification
    sun_scores = [float((p.get('features') or {}).get('Sun Line')) for p in user_palms if isinstance((p.get('features') or {}).get('Sun Line'), (int, float))]
    sun_avg = round(sum(sun_scores) / len(sun_scores), 1) if sun_scores else None
    opp_categories = {'Opportunity', 'Success', 'Hope', 'Abundance', 'Inspiration', 'Expansion', 'Celebration', 'Recognition'}
    total_opp_cards = sum(
        1 for t in user_tarots
        for c in (t.get('cards') or [])
        if get_card_category_for_trend(c) in opp_categories
    )
    total_cards_drawn = sum(len(t.get('cards') or []) for t in user_tarots)
    opp_ratio = (total_opp_cards / max(total_cards_drawn, 1)) if total_cards_drawn else 0

    if sun_avg is not None and total_cards_drawn > 0:
        opp_val = int(round((sun_avg + (opp_ratio * 100)) / 2))
        opp_text = f"Reflects Sun Line creativity ({sun_avg}%) and {total_opp_cards} opportunity cards drawn."
        opp_status = f"{opp_val}% Creative Flow"
    elif sun_avg is not None:
        opp_val = int(round(sun_avg))
        opp_text = f"Derived from Sun Line prominence ({sun_avg}%) indicating recognition and creative opportunity."
        opp_status = f"{opp_val}% Sun Line Index"
    elif total_cards_drawn > 0:
        opp_val = int(round(max(20, min(95, 50 + (opp_ratio * 50)))))
        opp_text = f"Identifies {total_opp_cards} constructive opportunity archetypes across Tarot sessions."
        opp_status = f"{opp_val}% Archetypal Opening"
    else:
        opp_val = max(20, min(90, int(round(latest_score * 0.95))))
        opp_text = "Potential openings and constructive possibilities derived from reading themes."
        opp_status = f"{opp_val}% Open"

    # Metric 3: Challenge Forecasting
    subtle_lines_count = sum(
        1 for p in user_palms
        for k, v in (p.get('features') or {}).items()
        if isinstance(v, (int, float)) and v < 28
    )
    total_lines_checked = sum(len(p.get('features') or {}) for p in user_palms)
    challenge_categories = {'Challenge', 'Conflict', 'Worry', 'Ending', 'Reset', 'Persistence', 'Endurance'}
    chal_cards_count = sum(
        1 for t in user_tarots
        for c in (t.get('cards') or [])
        if get_card_category_for_trend(c) in challenge_categories
    )
    total_elements = total_lines_checked + total_cards_drawn
    if total_elements > 0:
        chal_ratio = (subtle_lines_count + chal_cards_count) / total_elements
        chal_val = int(round(max(10, min(85, chal_ratio * 100))))
        chal_text = f"Identifies {subtle_lines_count + chal_cards_count} areas for conscious mindfulness across sessions."
        chal_status = "Moderate Attention" if chal_val >= 35 else "Clear Focus"
    else:
        chal_val = 25
        chal_text = "Areas that may require additional awareness and mindful self-reflection."
        chal_status = "Mindful Awareness"

    # Metric 4: Trend Monitoring
    if is_single:
        trend_val = latest_score
        trend_status = "Initial Baseline"
        trend_text = f"Initial session recorded on {latest_item['date']}. Longitudinal tracking begins with 2+ readings."
    else:
        delta = scores[-1] - scores[0]
        trend_val = max(15, min(95, int(round(50 + delta))))
        if delta > 2:
            trend_status = f"Ascending (+{int(round(delta))} pts)"
        elif delta < -2:
            trend_status = f"Reflective Focus ({int(round(delta))} pts)"
        else:
            trend_status = "Stable / Balanced"
        trend_text = f"Tracks momentum across {total_readings} sessions between {timeline[0]['date']} and {timeline[-1]['date']}."

    # Metric 5: Growth Potential
    life_scores = [float((p.get('features') or {}).get('Life Line')) for p in user_palms if isinstance((p.get('features') or {}).get('Life Line'), (int, float))]
    head_scores = [float((p.get('features') or {}).get('Head Line')) for p in user_palms if isinstance((p.get('features') or {}).get('Head Line'), (int, float))]
    vitality_elements = life_scores + head_scores
    if vitality_elements:
        vitality_avg = sum(vitality_elements) / len(vitality_elements)
        growth_val = int(round(vitality_avg))
        growth_text = f"Grounded in Life Line vitality ({round(sum(life_scores)/len(life_scores), 1) if life_scores else 'N/A'}%) and Head Line clarity."
        growth_status = f"{growth_val}% Vitality Capacity"
    else:
        growth_val = latest_score
        growth_text = "Capacity for personal development and reflective progress across consultations."
        growth_status = f"{growth_val}% Capacity"

    metrics = [
        {'id': 'life_path', 'icon': '◎', 'title': 'Life Path Analysis', 'value': lp_val, 'status': lp_status, 'text': lp_text},
        {'id': 'opportunity', 'icon': '✦', 'title': 'Opportunity Identification', 'value': opp_val, 'status': opp_status, 'text': opp_text},
        {'id': 'challenge', 'icon': '△', 'title': 'Challenge Forecasting', 'value': chal_val, 'status': chal_status, 'text': chal_text},
        {'id': 'trend_monitoring', 'icon': '↗', 'title': 'Trend Monitoring', 'value': trend_val, 'status': trend_status, 'text': trend_text},
        {'id': 'growth_potential', 'icon': '✧', 'title': 'Growth Potential', 'value': growth_val, 'status': growth_status, 'text': growth_text}
    ]

    # 6. Honest, Evidence-Based Summary (Phase 5)
    if is_single:
        msg = f"Single {latest_item['type']} recorded on {latest_item['date']}. More sessions will develop a longitudinal trend."
    else:
        msg = f"Trend based on {total_readings} dated sessions between {timeline[0]['date']} and {timeline[-1]['date']}."

    recurring_themes = [k for k, v in theme_counts.items() if v > 1]
    latest_focus = user_tarots[-1].get('focus') if user_tarots else 'Palmistry'

    career_summary = (
        "Your readings show a recurring focus on establishing clear vocational direction and disciplined momentum. "
        "Prioritize measurable milestones while remaining adaptable."
        if any(t.get('focus') == 'Career' for t in user_tarots) or (fate_avg and fate_avg >= 30)
        else "Take time to evaluate long-term goals and align current projects with your genuine values."
    )
    relationships_summary = (
        "Relationship patterns reflect the importance of authentic dialogue and clear boundaries. "
        "Trust your intuition when navigating complex interpersonal dynamics."
        if any(t.get('focus') == 'Relationships' for t in user_tarots)
        else "Cultivate balanced, supportive bonds and offer patience to those close to you."
    )
    growth_summary = (
        f"Sessions highlight self-reliance, curiosity, and embracing transition with confidence. "
        f"Grounded in {total_readings} recorded consultation(s) with focus on thoughtful personal discernment."
    )
    next_steps_summary = (
        "Engage in structured reflection after each reading. Use these insights as guidance for thoughtful decision-making."
    )

    summary = {
        'context': msg,
        'career': career_summary,
        'relationships': relationships_summary,
        'personal_growth': growth_summary,
        'next_steps': next_steps_summary
    }

    theme_mention = f"with recurring attention to {', '.join(recurring_themes)}" if recurring_themes else f"focusing on {latest_focus}"
    date_mention = f"spanning from {timeline[0]['date']} to {timeline[-1]['date']}" if not is_single else f"recorded on {timeline[0]['date']}"
    personalized_summary = (
        f"{msg} Your consultation records {date_mention} highlight an authentic personal journey {theme_mention}. "
        f"{career_summary} {relationships_summary}"
    )

    indicators = [
        {'label': 'Total Sessions', 'value': total_readings, 'description': 'Completed palm and Tarot readings'},
        {'label': 'Palm Readings', 'value': total_palms, 'description': 'Biometric hand and line analyses'},
        {'label': 'Tarot Readings', 'value': total_tarots, 'description': 'Symbolic card consultations'},
        {'label': 'Latest Activity', 'value': timeline[-1]['date'], 'description': 'Most recent session timestamp'}
    ]

    status = 'single' if is_single else 'trend'

    areas = []
    if any(t.get('focus') == 'Career' for t in user_tarots) or 'Fate Line' in avg_traits:
        areas.append({'area': 'Career & Professional Path', 'detail': 'Reflect on alignment between current efforts and long-term vocation.'})
    if any(t.get('focus') == 'Relationships' for t in user_tarots) or 'Heart Line' in avg_traits:
        areas.append({'area': 'Emotional Connections', 'detail': 'Maintain openness and honest communication in meaningful connections.'})
    if any(t.get('focus') == 'Personal Growth' for t in user_tarots) or 'Head Line' in avg_traits:
        areas.append({'area': 'Personal Growth & Awareness', 'detail': 'Ground decisions in self-reflection and practical steps forward.'})
    if 'Life Line' in avg_traits:
        areas.append({'area': 'Vitality & Well-being', 'detail': 'Balance ambition with rest and emotional restoration.'})
    if not areas:
        areas.append({'area': 'General Life Guidance', 'detail': 'Integrate reflective insights from recent sessions.'})

    return {
        'status': status,
        'has_readings': True,
        'is_single_reading': is_single,
        'total_readings': total_readings,
        'palm_count': total_palms,
        'tarot_count': total_tarots,
        'latest_date': timeline[-1]['date'],
        'latest_reading_date': timeline[-1]['date'],
        'message': msg,
        'trend_points': timeline,
        'points': timeline,
        'indicators': indicators,
        'metrics': metrics,
        'primary_themes': primary_themes,
        'reflection_themes': reflection_themes,
        'dominant_palm_traits': avg_traits,
        'areas_for_reflection': areas,
        'reflection_summary': summary,
        'personalized_summary': personalized_summary,
        'scores': scores,
        'months': months
    }

@app.get('/api/history')
def history(
    user_name: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):
    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user:
        auth_name = auth_user.get('name', '').strip()
        auth_role = auth_user.get('role', '')

        if isinstance(user_name, str) and user_name.strip() and user_name.strip().lower() != auth_name.lower():
            if auth_role not in ['Administrator', 'Spiritual Consultant']:
                raise HTTPException(
                    status_code=403,
                    detail="Forbidden: You cannot access reading history for another user."
                )
            target_user = user_name.strip().lower()
        else:
            target_user = auth_name.lower()
    else:
        if not isinstance(user_name, str) or not user_name.strip():
            return {'items': []}
        target_user = user_name.strip().lower()

    # User-specific reading history only
    matched_items = []

    # 1. Genuine Palm Readings from PALM_READINGS database
    user_palms = [
        p for p in PALM_READINGS
        if isinstance(p, dict) and p.get('user_name', '').strip().lower() == target_user
    ]
    # 2. Genuine Tarot Readings from TAROT_READINGS database
    user_tarots = [
        t for t in TAROT_READINGS
        if isinstance(t, dict) and t.get('user_name', '').strip().lower() == target_user
    ]

    # 3. Check READING_HISTORY entries tagged with this user
    for h in READING_HISTORY:
        if isinstance(h, dict) and h.get('user_name', '').strip().lower() == target_user:
            matched_items.append(dict(h))

    # Merge genuine readings from PALM_READINGS and TAROT_READINGS if not already present
    for p in user_palms:
        created = p.get('created_at', '')
        try:
            date_str = datetime.fromisoformat(created).strftime('%d %b %Y')
        except Exception:
            date_str = datetime.now().strftime('%d %b %Y')
        features = p.get('features', {})
        palm_score = p.get('palm_score')
        if palm_score is None:
            vals = [float(v) for v in features.values() if isinstance(v, (int, float))]
            palm_score = round(sum(vals) / len(vals)) if vals else 50

        already = any(
            m.get('type') == 'Palm Reading' and m.get('score') == f"{palm_score}%"
            for m in matched_items
        )
        if not already:
            matched_items.append({
                "id": f"palm-{p.get('id', len(matched_items) + 1)}",
                "type": "Palm Reading",
                "date": date_str,
                "score": f"{palm_score}%",
                "user_name": target_user,
                "summary": p.get('summary', "Palm lines detected and analyzed from the uploaded image.")
            })

    for t in user_tarots:
        created = t.get('created_at', '')
        try:
            date_str = datetime.fromisoformat(created).strftime('%d %b %Y')
        except Exception:
            date_str = datetime.now().strftime('%d %b %Y')
        tarot_score = compute_tarot_reading_score(t)
        spread = t.get('spread', 'Tarot')
        focus = t.get('focus', 'General')
        summary = f"{spread} reading focused on {focus}."
        already = any(
            m.get('type') == 'Tarot Reading' and m.get('summary') == summary
            for m in matched_items
        )
        if not already:
            matched_items.append({
                "id": f"tarot-{t.get('id', len(matched_items) + 1)}",
                "type": "Tarot Reading",
                "date": date_str,
                "score": f"{tarot_score}%",
                "user_name": target_user,
                "summary": summary
            })

    return {'items': matched_items}

@app.get('/api/role-capabilities')

def role_capabilities(role:str):

    capabilities={

      'User':['Palm image analysis','Interactive tarot reading','AI personality insights','Personalized recommendations','Life trend analysis','Reading history','PDF reports','Profile management'],

      'Tarot Reader':['Interactive tarot reading','Client reading sessions','Reading analytics','Session tracking','Report management','Profile management'],

      'Spiritual Consultant':['User trend analysis','AI insight review','Personalized guidance','Consultation insights','Guidance effectiveness','Reports and profile management'],

      'Administrator':['User management','Role and access management','Reading data oversight','Platform statistics','System information','Audit and administration tools']

    }

    return {'role':role,'capabilities':capabilities.get(role,[])}
# ============================================================
# SAVED TAROT READINGS
# ============================================================

@app.post('/api/tarot/readings')
def save_tarot_reading(
    request: TarotReadingSaveRequest,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):

    from datetime import datetime
    from fastapi import HTTPException

    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user:
        auth_role = auth_user.get('role', '')
        if auth_role not in ['Administrator', 'Spiritual Consultant', 'Tarot Reader']:
            effective_user = auth_user.get('name', request.user_name)
        else:
            effective_user = request.user_name or auth_user.get('name', 'User')
    else:
        effective_user = request.user_name or 'User'

    positions = SPREAD_POSITIONS.get(
        request.spread,
        SPREAD_POSITIONS['Three Card']
    )

    if len(request.cards) != len(positions):
        raise HTTPException(
            status_code=400,
            detail=f'{request.spread} requires {len(positions)} card(s).'
        )

    reading_id = max(
        [item.get('id', 0) for item in TAROT_READINGS] or [0]
    ) + 1

    record = {
        'id': reading_id,
        'user_name': effective_user,
        'focus': request.focus,
        'spread': request.spread,
        'cards': request.cards,
        'positions': positions,
        'reading': request.reading,
        'status': 'Completed',
        'created_at': datetime.now().isoformat()
    }

    TAROT_READINGS.append(record)
    save_tarot_readings()
    log_activity('tarot_reading_created', str(record['id']), 'success', {'spread': request.spread, 'cards_count': len(request.cards), 'user': effective_user}, actor=effective_user or 'User')

    # Ensure recorded in READING_HISTORY with effective_user
    reading_summary = f"{request.spread} reading focused on {request.focus}."
    existing_in_history = any(
        h.get('type') == 'Tarot Reading' and
        h.get('user_name', '').strip().lower() == effective_user.strip().lower() and
        h.get('summary') == reading_summary
        for h in READING_HISTORY[-5:]
    )
    if not existing_in_history:
        tarot_score = compute_tarot_reading_score(record)
        READING_HISTORY.append({
            "id": len(READING_HISTORY) + 1,
            "type": "Tarot Reading",
            "date": datetime.now().strftime("%d %b %Y"),
            "score": f"{tarot_score}%",
            "user_name": effective_user,
            "summary": reading_summary
        })
        save_reading_history()

    return {
        'success': True,
        'reading': record
    }


@app.get('/api/tarot/readings')
def get_tarot_readings(
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):
    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user and auth_user.get('role') == 'User':
        u_name = auth_user.get('name', '').strip().lower()
        return [
            reading for reading in reversed(TAROT_READINGS)
            if reading.get('user_name', '').strip().lower() == u_name
        ]
    return list(reversed(TAROT_READINGS))


@app.get('/api/tarot/readings/{reading_id}')
def get_tarot_reading(
    reading_id: int,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):

    from fastapi import HTTPException

    target = None
    for reading in TAROT_READINGS:
        if reading.get('id') == reading_id:
            target = reading
            break

    if not target:
        raise HTTPException(
            status_code=404,
            detail='Tarot reading not found.'
        )

    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user:
        auth_role = auth_user.get('role', '')
        auth_name = auth_user.get('name', '').strip().lower()
        auth_email = auth_user.get('email', '').strip().lower()
        owner = target.get('user_name', '').strip().lower()
        if auth_role not in ['Administrator', 'Spiritual Consultant', 'Tarot Reader']:
            if owner and owner not in [auth_name, auth_email]:
                raise HTTPException(
                    status_code=403,
                    detail="Forbidden: You cannot access another user's reading."
                )

    return target


@app.get('/api/tarot/readings/user/{user_name}')
def get_user_tarot_readings(
    user_name: str,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):
    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user:
        auth_role = auth_user.get('role', '')
        auth_name = auth_user.get('name', '').strip().lower()
        auth_email = auth_user.get('email', '').strip().lower()
        target_name = user_name.strip().lower()
        if auth_role not in ['Administrator', 'Spiritual Consultant']:
            if target_name not in [auth_name, auth_email]:
                raise HTTPException(
                    status_code=403,
                    detail="Forbidden: You cannot access reading history for another user."
                )

    return [
        reading
        for reading in reversed(TAROT_READINGS)
        if reading.get('user_name', '').strip().lower() == user_name.strip().lower()
    ]
@app.get('/api/admin/summary')
def admin_summary():
    role_counts = {'User': 0, 'Tarot Reader': 0, 'Spiritual Consultant': 0, 'Administrator': 0}
    for u in USERS.values():
        r = u.get('role', 'User')
        if r in role_counts:
            role_counts[r] += 1
        else:
            role_counts[r] = 1

    palm_count = len(PALM_READINGS)
    tarot_count = len(TAROT_READINGS)
    total_readings = palm_count + tarot_count

    appt_status_counts = {'Pending': 0, 'Accepted': 0, 'Declined': 0, 'Expired': 0}
    total_consultations = len(CONSULTATION_REQUESTS)
    for c in CONSULTATION_REQUESTS:
        st = c.get('status', 'Pending')
        if c.get('consultation_mode') == 'Appointment' and st == 'Pending' and is_appointment_expired(c):
            st = 'Expired'
        if st in appt_status_counts:
            appt_status_counts[st] += 1
        else:
            appt_status_counts[st] = 1

    active_readers = role_counts.get('Tarot Reader', 0) + role_counts.get('Spiritual Consultant', 0)

    return {
        'users': len(USERS),
        'users_by_role': role_counts,
        'palm_readings': palm_count,
        'tarot_readings': tarot_count,
        'readings': total_readings,
        'consultations': total_consultations,
        'appointments_by_status': appt_status_counts,
        'active_readers': active_readers,
        'system': 'Online'
    }

@app.get('/api/admin/system-reports')
def admin_system_reports():
    # 1. User demographic and role metrics from real USERS database
    total_users = len(USERS)
    users_by_role = {'User': 0, 'Tarot Reader': 0, 'Spiritual Consultant': 0, 'Administrator': 0}
    users_by_status = {'Active': 0, 'Inactive': 0}
    for u in USERS.values():
        r = u.get('role', 'User')
        if r in users_by_role:
            users_by_role[r] += 1
        else:
            users_by_role[r] = 1
        st = u.get('status', 'Active')
        if st in users_by_status:
            users_by_status[st] += 1
        else:
            users_by_status[st] = 1

    # 2. Reading metrics from real PALM_READINGS and TAROT_READINGS databases
    total_palm_readings = len(PALM_READINGS)
    total_tarot_readings = len(TAROT_READINGS)
    total_readings = total_palm_readings + total_tarot_readings

    palm_by_hand = {'Left Hand': 0, 'Right Hand': 0, 'Side Uncertain': 0}
    for p in PALM_READINGS:
        h = str(p.get('hand_side') or p.get('handedness') or '').lower()
        if 'left' in h:
            palm_by_hand['Left Hand'] += 1
        elif 'right' in h:
            palm_by_hand['Right Hand'] += 1
        else:
            palm_by_hand['Side Uncertain'] += 1

    # 3. Appointments & Consultations metrics from CONSULTATION_REQUESTS
    appointments = [c for c in CONSULTATION_REQUESTS if c.get('consultation_mode') == 'Appointment']
    total_appointments = len(appointments)
    questions = [c for c in CONSULTATION_REQUESTS if c.get('consultation_mode') != 'Appointment']
    total_questions = len(questions)

    appointments_by_status = {'Pending': 0, 'Accepted': 0, 'Declined': 0, 'Expired': 0}
    for a in appointments:
        st = a.get('status', 'Pending')
        if st == 'Pending' and is_appointment_expired(a):
            st = 'Expired'
        if st in appointments_by_status:
            appointments_by_status[st] += 1
        else:
            appointments_by_status[st] = 1

    # 4. Recent audit activity from real ACTIVITY_LOGS (sanitized to avoid secret leakage)
    sanitized_activity = []
    for item in ACTIVITY_LOGS[:20]:
        clean_item = dict(item)
        if isinstance(clean_item.get('details'), dict):
            clean_details = {
                k: v for k, v in clean_item['details'].items()
                if not any(x in k.lower() for x in ['password', 'token', 'secret', 'access_token', 'refresh_token'])
            }
            clean_item['details'] = clean_details
        sanitized_activity.append(clean_item)

    return {
        'generated_at': datetime.now(KOLKATA_TZ).isoformat(),
        'users': {
            'total': total_users,
            'by_role': users_by_role,
            'by_status': users_by_status
        },
        'readings': {
            'total': total_readings,
            'total_palm': total_palm_readings,
            'total_tarot': total_tarot_readings,
            'palm_by_hand': palm_by_hand
        },
        'consultations': {
            'total_all': len(CONSULTATION_REQUESTS),
            'total_appointments': total_appointments,
            'total_questions': total_questions,
            'appointments_by_status': appointments_by_status
        },
        'recent_activity': sanitized_activity
    }

@app.get('/api/admin/users')
def admin_users():
    items = []
    for email, u in USERS.items():
        items.append({
            'name': u.get('name', 'User'),
            'email': email,
            'role': u.get('role', 'User'),
            'status': u.get('status', 'Active'),
            'registered_at': u.get('registered_at', 'Registered'),
            'is_google': bool(u.get('google_id'))
        })
    return {'items': items}

class AdminUserCreateRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str
    status: str = 'Active'

@app.post('/api/admin/users')
def admin_create_user(req: AdminUserCreateRequest):
    email = req.email.strip().lower()
    if email in USERS:
        raise HTTPException(status_code=409, detail='An account with this email already exists.')
    if req.role not in {'User', 'Tarot Reader', 'Spiritual Consultant', 'Administrator'}:
        raise HTTPException(status_code=400, detail='Invalid role selected.')
    USERS[email] = {
        'name': req.name.strip(),
        'password': password_hash(req.password),
        'role': req.role,
        'status': req.status,
        'registered_at': datetime.now(KOLKATA_TZ).isoformat()
    }
    save_users()
    log_activity('admin_user_created', email, 'success', {'role': req.role, 'status': req.status}, actor='Administrator')
    return {'success': True, 'message': 'User created successfully', 'user': {'name': req.name, 'email': email, 'role': req.role, 'status': req.status}}

class AdminUserUpdateRequest(BaseModel):
    role: Optional[str] = None
    status: Optional[str] = None
    name: Optional[str] = None

@app.put('/api/admin/users/{email}')
def admin_update_user(email: str, req: AdminUserUpdateRequest):
    email = email.strip().lower()
    if email not in USERS:
        raise HTTPException(status_code=404, detail='User not found.')

    target = USERS[email]
    old_role = target.get('role', 'User')
    old_status = target.get('status', 'Active')

    # Guard: prevent removing or disabling the last active Administrator
    if old_role == 'Administrator':
        active_admins = [
            e for e, u in USERS.items()
            if u.get('role') == 'Administrator' and u.get('status', 'Active') == 'Active'
        ]
        if (req.role and req.role != 'Administrator') or (req.status and req.status == 'Disabled'):
            if len(active_admins) <= 1 and email in active_admins:
                raise HTTPException(status_code=400, detail='Cannot demote or disable the only active Administrator account.')

    if req.role:
        if req.role not in {'User', 'Tarot Reader', 'Spiritual Consultant', 'Administrator'}:
            raise HTTPException(status_code=400, detail='Invalid role.')
        target['role'] = req.role

    if req.status:
        if req.status not in {'Active', 'Disabled'}:
            raise HTTPException(status_code=400, detail='Invalid status.')
        target['status'] = req.status

    if req.name:
        target['name'] = req.name.strip()

    save_users()
    log_activity('admin_user_updated', email, 'success', {
        'old_role': old_role,
        'new_role': target.get('role'),
        'old_status': old_status,
        'new_status': target.get('status')
    }, actor='Administrator')
    return {'success': True, 'message': 'User updated successfully', 'user': target}

@app.delete('/api/admin/users/{email}')
def admin_delete_user(email: str):
    email = email.strip().lower()
    if email not in USERS:
        raise HTTPException(status_code=404, detail='User not found.')

    if USERS[email].get('role') == 'Administrator':
        active_admins = [e for e, u in USERS.items() if u.get('role') == 'Administrator']
        if len(active_admins) <= 1:
            raise HTTPException(status_code=400, detail='Cannot delete the only Administrator account.')

    del USERS[email]
    save_users()
    log_activity('admin_user_deleted', email, 'success', {}, actor='Administrator')
    return {'success': True, 'message': 'User deleted successfully'}

@app.get('/api/admin/roles')
def admin_roles():
    role_counts = {'User': 0, 'Tarot Reader': 0, 'Spiritual Consultant': 0, 'Administrator': 0}
    for u in USERS.values():
        r = u.get('role', 'User')
        role_counts[r] = role_counts.get(r, 0) + 1

    return {'items': [
        {
            'name': 'User',
            'user_count': role_counts.get('User', 0),
            'description': 'Receives personalized palmistry analysis, tarot readings, guidance, and appointment scheduling.'
        },
        {
            'name': 'Tarot Reader',
            'user_count': role_counts.get('Tarot Reader', 0),
            'description': 'Conducts tarot sessions, manages client appointments, interprets cards, and generates client reports.'
        },
        {
            'name': 'Spiritual Consultant',
            'user_count': role_counts.get('Spiritual Consultant', 0),
            'description': 'Reviews client questions and reading trends, conducts online consultations, and provides personalized life guidance.'
        },
        {
            'name': 'Administrator',
            'user_count': role_counts.get('Administrator', 0),
            'description': 'Manages platform accounts, role governance, system activity audit logs, and operational health monitoring.'
        }
    ]}

@app.get('/api/admin/readings')
def admin_readings():
    items = []
    # Actual Palm Readings
    for pr in reversed(PALM_READINGS):
        features = pr.get('features', {})
        feat_str = f"Score: {pr.get('palm_score', 0)}%"
        if features:
            top_lines = ", ".join([f"{k}: {v}" for k, v in list(features.items())[:2]])
            feat_str += f" ({top_lines})"
        items.append({
            'id': f"palm-{pr.get('id')}",
            'type': 'Palm Analysis',
            'user': pr.get('user_name', 'Client'),
            'date': pr.get('created_at', '')[:10],
            'score': feat_str,
            'summary': pr.get('summary', 'Palm line analysis')
        })

    # Actual Tarot Readings
    for tr in reversed(TAROT_READINGS):
        cards = tr.get('cards', [])
        c_str = f"{tr.get('spread', 'Spread')} ({tr.get('focus', 'General')})"
        if cards:
            c_str += f" - {len(cards)} Cards"
        items.append({
            'id': f"tarot-{tr.get('id')}",
            'type': 'Tarot Reading',
            'user': tr.get('user_name', 'Client'),
            'date': tr.get('created_at', '')[:10],
            'score': c_str,
            'summary': f"Cards: {', '.join(cards[:3])}" if cards else "Tarot reading"
        })

    return {'items': items}

@app.get('/api/admin/consultations')
def admin_consultations():
    items = []
    for c in reversed(CONSULTATION_REQUESTS):
        eff_status = c.get('status', 'Pending')
        if c.get('consultation_mode') == 'Appointment' and eff_status == 'Pending' and is_appointment_expired(c):
            eff_status = 'Expired'
        items.append({
            'id': c.get('id'),
            'user_name': c.get('user_name', 'Client'),
            'consultant_type': c.get('consultant_type', 'Consultant'),
            'consultant_name': c.get('consultant_name', ''),
            'focus': c.get('focus', 'General'),
            'consultation_mode': c.get('consultation_mode', 'Question'),
            'appointment_date': c.get('appointment_date', ''),
            'appointment_time': c.get('appointment_time', ''),
            'duration': c.get('duration', 30),
            'status': eff_status,
            'has_meeting': bool(c.get('meeting_url')),
            'meeting_url': c.get('meeting_url') if c.get('meeting_url') else None,
            'calendar_status': c.get('calendar_status', 'N/A'),
            'decline_reason': c.get('decline_reason', ''),
            'created_at': c.get('created_at', '')
        })
    return {'items': items}

@app.get('/api/admin/activity-logs')
def admin_activity_logs():
    return {'items': ACTIVITY_LOGS[:100]}

@app.get('/api/admin/system')
def admin_system():
    # Real health verifications
    storage_ok = USERS_FILE.exists() and CONSULTATIONS_FILE.exists() and PALM_READINGS_FILE.exists() and TAROT_READINGS_FILE.exists()

    model_path = Path(__file__).resolve().parent.parent / "models" / "hand_landmarker.task"
    model_status = f"Operational ({round(model_path.stat().st_size / (1024*1024), 1)} MB)" if model_path.exists() else "Model Missing"

    return {'items': [
        {'name': 'Backend API', 'value': 'Operational (FastAPI 0.115.6)'},
        {'name': 'JSON Data Storage', 'value': 'Operational (Read & Write Active)' if storage_ok else 'Storage Warning'},
        {'name': 'Google Meet Workflow', 'value': 'Manual Link Entry Active (Consultant pastes meet link; no OAuth required)'},
        {'name': 'MediaPipe Hand Model', 'value': model_status},
        {'name': 'Palm Dataset Integration', 'value': 'Standalone Heuristic / Landmark Pipeline (No custom 2,000-image dataset)'},
        {'name': 'Total Stored Readings', 'value': f"{len(PALM_READINGS) + len(TAROT_READINGS)} Verified Records"},
        {'name': 'Audit Activity Log', 'value': f"{len(ACTIVITY_LOGS)} System Events Logged"}
    ]}



def make_pdf(title, sections):
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm

    buf = BytesIO()

    c = canvas.Canvas(buf, pagesize=A4)

    w, h = A4
    y = h - 25 * mm

    c.setTitle(title)

    # Title
    c.setFont("Helvetica-Bold", 18)
    c.drawString(20 * mm, y, title)
    y -= 12 * mm

    for head, body in sections:

        # Section heading
        c.setFont("Helvetica-Bold", 12)
        c.drawString(20 * mm, y, head)
        y -= 7 * mm

        # Section content
        c.setFont("Helvetica", 10)

        for line in body.split("\n"):

            # Break long lines
            chunks = [
                line[i:i + 90]
                for i in range(0, len(line), 90)
            ]

            if not chunks:
                chunks = [""]

            for chunk in chunks:

                # New page if required
                if y < 20 * mm:
                    c.showPage()
                    y = h - 20 * mm
                    c.setFont("Helvetica", 10)

                c.drawString(22 * mm, y, chunk)
                y -= 5 * mm

        y -= 4 * mm

    c.save()

    return buf.getvalue()
# ============================================================
# TAROT READING PDF REPORT
# ============================================================

@app.get('/api/reports/tarot/{reading_id}.pdf')
def tarot_reading_report(
    reading_id: int,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):

    from fastapi import HTTPException

    # Find the saved Tarot reading
    record = next(
        (
            item
            for item in TAROT_READINGS
            if item.get('id') == reading_id
        ),
        None
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail='Tarot reading not found.'
        )

    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user:
        auth_role = auth_user.get('role', '')
        auth_name = auth_user.get('name', '').strip().lower()
        auth_email = auth_user.get('email', '').strip().lower()
        owner = record.get('user_name', '').strip().lower()
        if auth_role not in ['Administrator', 'Spiritual Consultant', 'Tarot Reader']:
            if owner and owner not in [auth_name, auth_email]:
                raise HTTPException(
                    status_code=403,
                    detail="Forbidden: You cannot access another user's report."
                )

    result = record.get('reading') or {}

    # Build card information
    card_lines = []

    saved_cards = record.get('cards', [])
    saved_positions = record.get('positions', [])

    for index, card in enumerate(saved_cards):

        position = (
            saved_positions[index]
            if index < len(saved_positions)
            else f'Card {index + 1}'
        )

        card_lines.append(
            f'{position}: {card}'
        )

        # Add individual card interpretation if available
        if index < len(result.get('cards', [])):

            card_result = result['cards'][index]

            if isinstance(card_result, dict):

                interpretation = card_result.get(
                    'interpretation',
                    ''
                )

                if interpretation:
                    card_lines.append(
                        interpretation
                    )

    sections = [

        (
            'Client',
            record.get(
                'user_name',
                'User'
            )
        ),

        (
            'Reading',
            f"{record.get('focus', 'General')} · "
            f"{record.get('spread', 'Tarot Reading')}"
        ),

        (
            'Selected Cards',
            '\n'.join(card_lines)
        ),

        (
            'Overall Interpretation',
            result.get(
                'overall',
                ''
            )
        ),

        (
            'Personality',
            result.get(
                'personality',
                ''
            )
        ),

        (
            'Emotional Nature',
            result.get(
                'emotions',
                ''
            )
        ),

        (
            'Strengths',
            result.get(
                'strengths',
                ''
            )
        ),

        (
            'Areas to Reflect On',
            result.get(
                'challenges',
                ''
            )
        ),

        (
            'Personal Guidance',
            result.get(
                'guidance',
                ''
            )
        ),

        (
            'Key Themes',
            ', '.join(
                result.get(
                    'themes',
                    []
                )
            )
        )
    ]

    pdf_content = make_pdf(
        'Tarot Reading Report',
        sections
    )

    return Response(
        content=pdf_content,
        media_type='application/pdf',
        headers={
            'Content-Disposition':
                f'attachment; filename="tarot-reading-{reading_id}.pdf"'
        }
    )
@app.get('/api/reports/{kind}.pdf')
def report(
    kind: str,
    user_name: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    x_auth_token: Optional[str] = Header(None, alias="X-Auth-Token")
):

    titles = {
        "palm": "Palmistry Reading Report",
        "tarot": "Tarot Reading Report",
        "personality": "AI Personality & Recommendation Report"
    }

    title = titles.get(
        kind,
        "AI Palmistry & Tarot Report"
    )

    auth_user = resolve_auth_user(authorization, x_auth_token)
    if auth_user:
        auth_name = auth_user.get('name', '').strip()
        auth_role = auth_user.get('role', '')
        if isinstance(user_name, str) and user_name.strip() and user_name.strip().lower() != auth_name.lower():
            if auth_role not in ['Administrator', 'Spiritual Consultant']:
                raise HTTPException(
                    status_code=403,
                    detail="Forbidden: You cannot access reports for another user."
                )
            target_user = user_name.strip().lower()
        else:
            target_user = auth_name.lower()
    else:
        target_user = user_name.strip().lower() if (isinstance(user_name, str) and user_name.strip()) else None

    # -------------------------
    # PALM REPORT
    # -------------------------
    if kind == "palm":
        target_palm = None
        if target_user:
            for p in reversed(PALM_READINGS):
                if p.get('user_name', '').strip().lower() == target_user:
                    target_palm = p
                    break

        if not target_palm:
            sections = [
                (
                    "Palm Analysis",
                    "No palm analysis is available yet for this user.\n"
                    "Please upload and analyze a palm image first."
                )
            ]
        else:
            features = target_palm.get("features", {})
            raw_hand = target_palm.get("handedness", "Unknown")
            if raw_hand in ["Right", "Left"]:
                handedness = f"{raw_hand} Hand"
            elif raw_hand == "Uncertain":
                handedness = "Hand detected (side uncertain)"
            else:
                handedness = raw_hand

            palm_shape = target_palm.get("palm_shape", "Natural")
            finger_structure = target_palm.get("finger_structure", "Detected from hand landmarks")

            line_text = "\n".join(
                f"{name}: {float(score):.1f}%"
                for name, score in features.items()
            )

            sections = [
                (
                    "Palm Features",
                    line_text if line_text else "No palm lines were detected."
                ),
                (
                    "Hand & Palm Structure",
                    f"Hand: {handedness}\n"
                    f"Palm shape: {palm_shape}\n"
                    f"Finger structure: {finger_structure}"
                )
            ]

    # -------------------------
    # TAROT REPORT
    # -------------------------
    elif kind == "tarot":
        target_tarot = None
        if target_user:
            for t in reversed(TAROT_READINGS):
                if t.get('user_name', '').strip().lower() == target_user:
                    target_tarot = t
                    break

        if not target_tarot:
            sections = [
                (
                    "Tarot Reading",
                    "No tarot reading is available yet for this user.\n"
                    "Please complete a tarot reading first."
                )
            ]
        else:
            reading = target_tarot.get('reading') or target_tarot
            card_lines = []
            for card in reading.get("cards", []):
                card_name = card.get('name', card) if isinstance(card, dict) else str(card)
                pos = card.get('position', 'Position') if isinstance(card, dict) else 'Card'
                card_lines.append(f"{pos}: {card_name}")

            interpretation_lines = []
            for card in reading.get("cards", []):
                card_name = card.get('name', 'Card') if isinstance(card, dict) else str(card)
                interp = card.get('interpretation', '') if isinstance(card, dict) else ''
                interpretation_lines.append(f"{card_name}: {interp}")

            sections = [
                (
                    "Reading Details",
                    f"Focus: {reading.get('focus', target_tarot.get('focus', 'General'))}\n"
                    f"Spread: {reading.get('spread', target_tarot.get('spread', 'Three Card'))}"
                ),
                (
                    "Selected Cards",
                    "\n".join(card_lines) if card_lines else "No cards selected."
                ),
                (
                    "Card Interpretations",
                    "\n".join(interpretation_lines) if interpretation_lines else "No interpretations available."
                ),
                (
                    "Overall Interpretation",
                    reading.get("overall", "No overall interpretation available.")
                ),
                (
                    "Personality",
                    reading.get("personality", "No personality insight available.")
                ),
                (
                    "Emotional Nature",
                    reading.get("emotions", "No emotional insight available.")
                ),
                (
                    "Strengths",
                    reading.get("strengths", "No strengths information available.")
                ),
                (
                    "Areas to Reflect On",
                    reading.get("challenges", "No challenge information available.")
                ),
                (
                    "Personal Guidance",
                    reading.get("guidance", "No guidance available.")
                ),
                (
                    "Key Themes",
                    ", ".join(reading.get("themes", []))
                )
            ]

    # -------------------------
    # PERSONALITY REPORT
    # -------------------------
    elif kind == "personality":
        target_palm = None
        if target_user:
            for p in reversed(PALM_READINGS):
                if p.get('user_name', '').strip().lower() == target_user:
                    target_palm = p
                    break

        if not target_palm:
            sections = [
                (
                    "Personality Overview",
                    "Complete a palm analysis first to generate personalized insights."
                )
            ]
        else:
            features = target_palm.get("features", {})
            scores = []
            for value in features.values():
                try:
                    scores.append(float(value))
                except Exception:
                    pass

            overall_score = (
                round(sum(scores) / len(scores), 1)
                if scores
                else 0
            )

            sections = [
                (
                    "Personality Overview",
                    f"Overall Insight Score: {overall_score}%\n\n"
                    "This profile is generated from your detected palm-line patterns."
                ),
                (
                    "Recommendations",
                    "Reflect on the patterns highlighted in your reading.\n"
                    "Use your strongest qualities consistently.\n"
                    "Set clear short-term goals.\n"
                    "Review your progress regularly."
                )
            ]

    else:

        sections = [
            (
                "Report",
                "Unknown report type."
            )
        ]

    return Response(
        content=make_pdf(title, sections),
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f'attachment; filename="{kind}-report.pdf"'
        }
    )