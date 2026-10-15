from typing import List, Literal, Optional
from pydantic import BaseModel

Category = Literal[
    "personality", "relationships", "career", "finance",
    "health_wellness", "personal_growth", "opportunities"
]


class Personality(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    behavioral_insights: List[str] = []
    development_tips: List[str] = []


class Challenge(BaseModel):
    theme: str
    timeframe: Literal["next_30_days", "next_3_months", "next_6_months"]
    description: str
    how_to_navigate: str


class Recommendation(BaseModel):
    category: Category
    title: str
    action: str
    linked_goal: Optional[str] = None


class Synthesis(BaseModel):
    summary: str
    personality: Personality
    challenges: List[Challenge]
    recommendations: List[Recommendation]