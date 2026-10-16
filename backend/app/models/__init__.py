from app.models.role import Role
from app.models.user import User
from app.models.profile import Profile
from app.models.spiritual_goal import SpiritualGoal
from app.models.reading_preference import ReadingPreference
from app.models.spiritual_interest import SpiritualInterest
from app.models.user_spiritual_interest import UserSpiritualInterest
from app.models.reading_session import ReadingSession
from app.models.reading_report import ReadingReport
from app.models.ai_interpretation import AIInterpretation

# Milestone 3 models
from app.models.personality_intelligence import PersonalityIntelligence
from app.models.recommendation import Recommendation
from app.models.life_trend_analysis import LifeTrendAnalysis
from app.models.personalized_dashboard import PersonalizedDashboard
from app.models.appointment import (
    Appointment,
    AppointmentAvailability,
)

from app.models.user_notification import UserNotification

__all__ = [
    "Role",
    "User",
    "Profile",
    "SpiritualGoal",
    "ReadingPreference",
    "SpiritualInterest",
    "UserSpiritualInterest",
    "ReadingSession",
    "ReadingReport",
    "AIInterpretation",

    # Milestone 3
    "PersonalityIntelligence",
    "Recommendation",
    "LifeTrendAnalysis",
    "PersonalizedDashboard",
    "Appointment",
"AppointmentAvailability",
"UserNotification",
]