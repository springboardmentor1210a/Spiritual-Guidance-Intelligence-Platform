from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Reading, User, UserProfile


router = APIRouter(
    prefix="/api/consultant",
    tags=["Spiritual Consultant"],
)


# ---------------------------------------------------------------------------
# Role access
# ---------------------------------------------------------------------------

def require_consultant(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="This account is inactive.")

    if str(current_user.role).lower() != "consultant":
        raise HTTPException(
            status_code=403,
            detail="Spiritual Consultant access is required for this workspace.",
        )

    return current_user


# ---------------------------------------------------------------------------
# Persistent consultant workspace tables
#
# These are created safely with IF NOT EXISTS. Existing users/readings are
# never deleted or recreated. They add the human-review/outcome layer that the
# original Reading model does not contain.
# ---------------------------------------------------------------------------

def ensure_consultant_tables(db: Session) -> None:
    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS consultant_feedback (
                id SERIAL PRIMARY KEY,
                reading_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                helpful BOOLEAN,
                rating INTEGER,
                comment TEXT,
                follow_up_due_at TIMESTAMP NULL,
                follow_up_completed BOOLEAN NOT NULL DEFAULT FALSE,
                action_completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )

    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS consultant_reviews (
                id SERIAL PRIMARY KEY,
                reading_id INTEGER NOT NULL UNIQUE,
                consultant_id INTEGER NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                edited_text TEXT NULL,
                flag_reason TEXT NULL,
                reviewed_at TIMESTAMP NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )

    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS consultant_notes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                consultant_id INTEGER NOT NULL,
                note TEXT NOT NULL,
                follow_up_at TIMESTAMP NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )

    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS consultant_actions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                consultant_id INTEGER NOT NULL,
                reading_id INTEGER NULL,
                action_text TEXT NOT NULL,
                due_at TIMESTAMP NULL,
                completed BOOLEAN NOT NULL DEFAULT FALSE,
                completed_at TIMESTAMP NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )

    # Existing databases may already contain consultant_reviews created by an
    # earlier version of the consultant workspace. CREATE TABLE IF NOT EXISTS
    # does not alter an existing table, so add any newer nullable columns
    # safely. This preserves every existing review and reading.
    for statement in (
        "ALTER TABLE consultant_reviews ADD COLUMN IF NOT EXISTS flag_reason TEXT NULL",
        "ALTER TABLE consultant_reviews ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP NULL",
        "ALTER TABLE consultant_reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE consultant_reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    ):
        db.execute(text(statement))

    # Older consultant_feedback tables may also lack newer workflow fields.
    for statement in (
        "ALTER TABLE consultant_feedback ADD COLUMN IF NOT EXISTS helpful BOOLEAN",
        "ALTER TABLE consultant_feedback ADD COLUMN IF NOT EXISTS rating INTEGER",
        "ALTER TABLE consultant_feedback ADD COLUMN IF NOT EXISTS comment TEXT",
        "ALTER TABLE consultant_feedback ADD COLUMN IF NOT EXISTS follow_up_due_at TIMESTAMP NULL",
        "ALTER TABLE consultant_feedback ADD COLUMN IF NOT EXISTS follow_up_completed BOOLEAN NOT NULL DEFAULT FALSE",
        "ALTER TABLE consultant_feedback ADD COLUMN IF NOT EXISTS action_completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0",
        "ALTER TABLE consultant_feedback ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE consultant_feedback ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    ):
        db.execute(text(statement))

    db.commit()


# ---------------------------------------------------------------------------
# Scoring engine
#
# Architecture source:
# Insight Score =
# Palm Analysis Confidence (30%)
# Tarot Interpretation Relevance (25%)
# Personality Alignment (20%)
# User Context Relevance (15%)
# Reading Consistency (10%)
#
# The dashboard additionally exposes:
# - Reading confidence
# - Guidance relevance
# - Self-development score
#
# These are explainable heuristics over saved profile/reading text. They are
# not clinical, scientific, or predictive measurements.
# ---------------------------------------------------------------------------

STOP_WORDS = {
    "the", "and", "for", "with", "that", "this", "from", "your", "you",
    "are", "was", "were", "have", "has", "into", "about", "what", "when",
    "where", "will", "would", "could", "should", "their", "they", "them",
    "then", "than", "there", "here", "only", "also", "very", "more",
    "some", "such", "just", "like", "life", "reading", "tarot", "palm",
    "reflection", "reflective", "card", "cards", "interpretation",
}

THEME_KEYWORDS = {
    "career": {
        "career", "work", "job", "professional", "business", "leadership",
        "achievement", "project", "skill", "study", "education",
    },
    "relationships": {
        "relationship", "partner", "love", "family", "connection",
        "friendship", "communication", "emotional",
    },
    "wellbeing": {
        "wellbeing", "wellness", "balance", "calm", "mindfulness",
        "meditation", "rest", "energy", "self-care",
    },
    "growth": {
        "growth", "learning", "development", "confidence", "self-discovery",
        "practice", "habit", "change", "progress",
    },
    "finance": {
        "money", "finance", "financial", "income", "resources", "investment",
        "debt", "budget",
    },
    "change": {
        "change", "transition", "new", "beginning", "ending", "direction",
        "future", "opportunity", "decision",
    },
}


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def tokens(value: Any) -> set[str]:
    words = re.findall(r"[a-zA-Z][a-zA-Z'-]{2,}", clean_text(value).lower())
    return {
        word
        for word in words
        if word not in STOP_WORDS
    }


def overlap_score(left: Any, right: Any, baseline: float = 50.0) -> float:
    a = tokens(left)
    b = tokens(right)

    if not a or not b:
        return baseline

    overlap = len(a & b)
    union = len(a | b)

    if union == 0:
        return baseline

    return round(min(100.0, 100.0 * overlap / union * 2.2), 1)


def normalize_dt(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is not None:
        return value.replace(tzinfo=None)
    return value


def profile_text(profile: UserProfile | None) -> str:
    if not profile:
        return ""

    return " ".join(
        clean_text(getattr(profile, field, ""))
        for field in (
            "age_group",
            "interests",
            "spiritual_goals",
            "reading_preferences",
            "bio",
        )
    )


def reading_text(reading: Reading | None) -> str:
    if not reading:
        return ""

    return " ".join(
        clean_text(getattr(reading, field, ""))
        for field in (
            "title",
            "input_summary",
            "result_text",
        )
    )


def theme_scores(text_value: str) -> dict[str, int]:
    source = clean_text(text_value).lower()
    result = {}

    for theme, words in THEME_KEYWORDS.items():
        result[theme] = sum(
            1 for word in words
            if word in source
        )

    return result


def palm_confidence(reading: Reading) -> float:
    raw = getattr(reading, "palm_insights_json", None)

    if raw:
        try:
            parsed = json.loads(raw)
            values = []

            if isinstance(parsed, list):
                for item in parsed:
                    if isinstance(item, dict):
                        value = item.get("confidence")
                        if value is not None:
                            try:
                                number = float(value)
                                if number <= 1:
                                    number *= 100
                                values.append(number)
                            except (TypeError, ValueError):
                                pass

            if values:
                return round(
                    max(0, min(100, sum(values) / len(values))),
                    1,
                )
        except (TypeError, ValueError, json.JSONDecodeError):
            pass

    if reading.reading_type == "palm":
        return 65.0 if clean_text(reading.result_text) else 25.0

    # Palm confidence is not applicable to a tarot-only reading, so use a
    # neutral midpoint rather than pretending a palm model ran.
    return 50.0


def tarot_relevance(
    reading: Reading,
    profile: UserProfile | None,
) -> float:
    question = clean_text(reading.input_summary)
    result = clean_text(reading.result_text)
    context = profile_text(profile)

    if not result:
        return 25.0

    question_score = overlap_score(question, result, 50)
    context_score = overlap_score(context, result, 50)

    if reading.reading_type == "tarot":
        return round(
            min(100, question_score * 0.65 + context_score * 0.35),
            1,
        )

    return round(
        min(100, question_score * 0.35 + context_score * 0.65),
        1,
    )


def personality_alignment(
    reading: Reading,
    profile: UserProfile | None,
) -> float:
    context = profile_text(profile)

    if not context:
        return 50.0

    result = clean_text(reading.result_text)

    base = overlap_score(context, result, 50)

    goals = clean_text(getattr(profile, "spiritual_goals", ""))
    interests = clean_text(getattr(profile, "interests", ""))

    goal_score = overlap_score(goals, result, 50)
    interest_score = overlap_score(interests, result, 50)

    return round(
        min(100, base * 0.4 + goal_score * 0.3 + interest_score * 0.3),
        1,
    )


def context_relevance(
    reading: Reading,
    profile: UserProfile | None,
) -> float:
    if not profile:
        return 50.0

    question = clean_text(reading.input_summary)
    context = profile_text(profile)

    return overlap_score(question, context, 50)


def consistency_score(
    reading: Reading,
    readings: list[Reading],
) -> float:
    others = [
        item for item in readings
        if item.id != reading.id
    ]

    if not others:
        return 50.0

    current_themes = theme_scores(reading_text(reading))
    current = {
        key for key, value in current_themes.items()
        if value > 0
    }

    if not current:
        return 50.0

    matches = 0

    for item in others[:12]:
        item_themes = theme_scores(reading_text(item))
        item_set = {
            key for key, value in item_themes.items()
            if value > 0
        }

        if current & item_set:
            matches += 1

    return round(
        min(100, 45 + (matches / min(12, len(others))) * 55),
        1,
    )


def guidance_relevance(
    reading: Reading,
    profile: UserProfile | None,
) -> float:
    result = clean_text(reading.result_text)
    context = profile_text(profile)

    if not result:
        return 20.0

    action_words = {
        "reflect", "practice", "choose", "review", "journal", "learn",
        "communicate", "plan", "consider", "develop", "try", "create",
        "focus", "notice", "set", "take", "build",
    }

    result_words = tokens(result)
    action_hits = len(result_words & action_words)

    action_component = min(100, 35 + action_hits * 5)
    context_component = overlap_score(result, context, 50)

    return round(
        min(100, action_component * 0.45 + context_component * 0.55),
        1,
    )


def self_development_score(
    reading: Reading,
    profile: UserProfile | None,
) -> float:
    result = clean_text(reading.result_text).lower()

    growth_terms = {
        "growth", "learning", "practice", "habit", "confidence",
        "self-awareness", "self-discovery", "mindfulness", "reflection",
        "development", "goal", "action", "journal", "consistency",
    }

    hits = sum(
        1 for term in growth_terms
        if term in result
    )

    context = profile_text(profile)
    context_score = overlap_score(
        " ".join(growth_terms),
        context,
        50,
    )

    return round(
        min(100, 35 + hits * 6 + context_score * 0.25),
        1,
    )


def score_reading(
    reading: Reading,
    profile: UserProfile | None,
    readings: list[Reading],
) -> dict[str, float]:
    palm = palm_confidence(reading)
    tarot = tarot_relevance(reading, profile)
    personality = personality_alignment(reading, profile)
    context = context_relevance(reading, profile)
    consistency = consistency_score(reading, readings)

    overall = (
        palm * 0.30
        + tarot * 0.25
        + personality * 0.20
        + context * 0.15
        + consistency * 0.10
    )

    reading_confidence = (
        palm * 0.55
        + tarot * 0.45
    )

    guidance = guidance_relevance(reading, profile)
    self_dev = self_development_score(reading, profile)

    return {
        "palm_analysis_confidence": round(palm, 1),
        "tarot_interpretation_relevance": round(tarot, 1),
        "personality_alignment": round(personality, 1),
        "user_context_relevance": round(context, 1),
        "reading_consistency": round(consistency, 1),
        "reading_confidence": round(reading_confidence, 1),
        "guidance_relevance": round(guidance, 1),
        "self_development": round(self_dev, 1),
        "overall_insight_score": round(min(100, overall), 1),
    }


# ---------------------------------------------------------------------------
# Sensitive-topic detection
# ---------------------------------------------------------------------------

SENSITIVE_GROUPS = {
    "health": {
        "health", "medical", "doctor", "diagnosis", "disease", "medicine",
        "symptom", "illness", "pregnancy",
    },
    "financial": {
        "money", "financial", "finance", "debt", "loan", "investment",
        "stock", "income", "bank", "property",
    },
    "relationship_crisis": {
        "abuse", "violence", "divorce", "separation", "betrayal",
        "crisis", "toxic", "domestic",
    },
    "distress": {
        "suicide", "self-harm", "self harm", "kill myself", "hopeless",
        "panic attack", "severe anxiety", "overwhelmed",
    },
}


def sensitive_flags(reading: Reading) -> list[str]:
    text_value = reading_text(reading).lower()
    flags = []

    for group, words in SENSITIVE_GROUPS.items():
        if any(word in text_value for word in words):
            flags.append(group)

    return flags


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

def all_readings(db: Session) -> list[Reading]:
    return (
        db.query(Reading)
        .order_by(Reading.created_at.desc())
        .all()
    )


def users_for_readings(
    db: Session,
    readings: list[Reading],
) -> dict[int, User]:
    ids = {item.user_id for item in readings}
    if not ids:
        return {}

    users = (
        db.query(User)
        .filter(User.id.in_(ids))
        .all()
    )
    return {item.id: item for item in users}


def profiles_for_users(
    db: Session,
    user_ids: set[int],
) -> dict[int, UserProfile]:
    if not user_ids:
        return {}

    profiles = (
        db.query(UserProfile)
        .filter(UserProfile.user_id.in_(user_ids))
        .all()
    )
    return {item.user_id: item for item in profiles}


def review_rows(db: Session) -> dict[int, dict[str, Any]]:
    rows = db.execute(
        text(
            """
            SELECT id, reading_id, consultant_id, status,
                   edited_text, flag_reason, reviewed_at
            FROM consultant_reviews
            """
        )
    ).mappings().all()

    return {
        int(row["reading_id"]): dict(row)
        for row in rows
    }


def feedback_rows(db: Session) -> list[dict[str, Any]]:
    return [
        dict(row)
        for row in db.execute(
            text(
                """
                SELECT *
                FROM consultant_feedback
                ORDER BY created_at DESC
                """
            )
        ).mappings().all()
    ]


def action_rows(db: Session) -> list[dict[str, Any]]:
    return [
        dict(row)
        for row in db.execute(
            text(
                """
                SELECT *
                FROM consultant_actions
                ORDER BY created_at DESC
                """
            )
        ).mappings().all()
    ]


def reading_payload(
    reading: Reading,
    user: User | None,
    profile: UserProfile | None,
    readings: list[Reading],
    reviews: dict[int, dict[str, Any]],
) -> dict[str, Any]:
    score = score_reading(reading, profile, readings)
    flags = sensitive_flags(reading)
    review = reviews.get(reading.id)

    return {
        "id": reading.id,
        "user_id": reading.user_id,
        "client_name": user.full_name if user else f"User {reading.user_id}",
        "client_email": user.email if user else "",
        "reading_type": reading.reading_type,
        "title": reading.title,
        "input_summary": reading.input_summary,
        "result_text": reading.result_text,
        "result_preview": clean_text(reading.result_text)[:520],
        "created_at": (
            normalize_dt(reading.created_at).isoformat()
            if reading.created_at
            else None
        ),
        "sensitive_flags": flags,
        "needs_attention": bool(flags),
        "review": {
            "status": review["status"] if review else "pending",
            "edited_text": review["edited_text"] if review else None,
            "flag_reason": review["flag_reason"] if review else None,
            "reviewed_at": (
                normalize_dt(review["reviewed_at"]).isoformat()
                if review and review.get("reviewed_at")
                else None
            ),
        },
        "scores": score,
    }


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class FeedbackRequest(BaseModel):
    reading_id: int
    helpful: bool | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)
    follow_up_due_at: datetime | None = None


class ReviewRequest(BaseModel):
    status: str = Field(pattern="^(pending|approved|flagged)$")
    edited_text: str | None = Field(default=None, max_length=20000)
    flag_reason: str | None = Field(default=None, max_length=1000)


class NoteRequest(BaseModel):
    user_id: int
    note: str = Field(min_length=1, max_length=3000)
    follow_up_at: datetime | None = None


class ActionRequest(BaseModel):
    user_id: int
    reading_id: int | None = None
    action_text: str = Field(min_length=1, max_length=1000)
    due_at: datetime | None = None


class ActionCompleteRequest(BaseModel):
    completed: bool


# ---------------------------------------------------------------------------
# Daily reading activity (last N days)
# ---------------------------------------------------------------------------

@router.get("/activity")
def consultant_activity(
    days: int = Query(default=15, ge=1, le=90),
    current_user: User = Depends(require_consultant),
    db: Session = Depends(get_db),
):
    """Return one activity point per calendar day, including days with zero readings."""
    today = datetime.now().date()
    first_day = today - timedelta(days=days - 1)
    counts: Counter = Counter()

    # Use the same Reading model/data source as the consultant dashboard so
    # this endpoint cannot drift from the dashboard's actual saved readings.
    for reading in all_readings(db):
        created = normalize_dt(reading.created_at)
        if created is None:
            continue
        reading_day = created.date()
        if first_day <= reading_day <= today:
            counts[reading_day.isoformat()] += 1

    items = []
    for offset in range(days):
        day = first_day + timedelta(days=offset)
        key = day.isoformat()
        items.append({
            "date": key,
            "day": day.strftime("%a"),
            "label": day.strftime("%d %b"),
            "count": int(counts.get(key, 0)),
        })

    return {"days": days, "items": items}


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

@router.get("/dashboard")
def consultant_dashboard(
    reading_type: str = Query(default="", max_length=20),
    search: str = Query(default="", max_length=120),
    from_date: str = Query(default="", max_length=20),
    to_date: str = Query(default="", max_length=20),
    current_user: User = Depends(require_consultant),
    db: Session = Depends(get_db),
):
    ensure_consultant_tables(db)

    readings = all_readings(db)
    users = users_for_readings(db, readings)
    profiles = profiles_for_users(db, set(users))

    # Filters are intentionally applied in Python so the dashboard remains
    # compatible with existing naive/aware PostgreSQL timestamp rows.
    filtered = []

    start = None
    end = None

    try:
        if from_date:
            start = datetime.fromisoformat(from_date)
        if to_date:
            end = datetime.fromisoformat(to_date) + timedelta(days=1)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid date filter.")

    for item in readings:
        created = normalize_dt(item.created_at)

        if reading_type and item.reading_type != reading_type:
            continue

        user = users.get(item.user_id)
        needle = search.strip().lower()

        if needle:
            searchable = " ".join(
                [
                    user.full_name if user else "",
                    user.email if user else "",
                    clean_text(item.title),
                    clean_text(item.input_summary),
                    clean_text(item.result_text),
                ]
            ).lower()

            if needle not in searchable:
                continue

        if start and created and created < start:
            continue

        if end and created and created >= end:
            continue

        filtered.append(item)

    reviews = review_rows(db)
    feedback = feedback_rows(db)
    actions = action_rows(db)

    payloads = [
        reading_payload(
            item,
            users.get(item.user_id),
            profiles.get(item.user_id),
            readings,
            reviews,
        )
        for item in filtered
    ]

    score_names = [
        "personality_alignment",
        "reading_confidence",
        "guidance_relevance",
        "self_development",
        "overall_insight_score",
    ]

    score_averages = {}
    for name in score_names:
        values = [
            float(item["scores"][name])
            for item in payloads
            if item["scores"].get(name) is not None
        ]
        score_averages[name] = (
            round(sum(values) / len(values), 1)
            if values
            else 0
        )

    unique_clients = {item.user_id for item in filtered}

    feedback_for_filtered = [
        row for row in feedback
        if int(row["reading_id"]) in {item.id for item in filtered}
    ]

    helpful_ratings = [
        row for row in feedback_for_filtered
        if row["rating"] is not None
    ]

    helpful_count = sum(
        1 for row in feedback_for_filtered
        if row["helpful"] is True
    )

    feedback_rate = (
        round(helpful_count / len(feedback_for_filtered) * 100, 1)
        if feedback_for_filtered
        else 0
    )

    action_for_clients = [
        row for row in actions
        if int(row["user_id"]) in unique_clients
    ]

    completed_actions = sum(
        1 for row in action_for_clients
        if row["completed"]
    )

    action_completion_rate = (
        round(completed_actions / len(action_for_clients) * 100, 1)
        if action_for_clients
        else 0
    )

    pending_reviews = [
        item for item in payloads
        if item["review"]["status"] == "pending"
    ]

    flagged_reviews = [
        item for item in payloads
        if item["review"]["status"] == "flagged"
        or item["needs_attention"]
    ]

    attention = [
        item for item in payloads
        if item["needs_attention"]
    ]

    client_counts = Counter(item.user_id for item in filtered)
    client_trends = []

    for user_id, count in client_counts.most_common(20):
        user = users.get(user_id)
        client_readings = [
            item for item in filtered
            if item.user_id == user_id
        ]

        themes = Counter()
        questions = []

        for item in client_readings:
            for theme, value in theme_scores(reading_text(item)).items():
                if value:
                    themes[theme] += value

            summary = clean_text(item.input_summary)
            if summary:
                questions.append(summary[:160])

        client_scores = [
            score_reading(item, profiles.get(user_id), readings)
            for item in client_readings
        ]

        average_insight = (
            round(
                sum(item["overall_insight_score"] for item in client_scores)
                / len(client_scores),
                1,
            )
            if client_scores
            else 0
        )

        client_trends.append(
            {
                "user_id": user_id,
                "name": user.full_name if user else f"User {user_id}",
                "email": user.email if user else "",
                "reading_count": count,
                "palm_count": sum(
                    1 for item in client_readings
                    if item.reading_type == "palm"
                ),
                "tarot_count": sum(
                    1 for item in client_readings
                    if item.reading_type == "tarot"
                ),
                "average_insight_score": average_insight,
                "top_themes": [
                    {"theme": key, "count": value}
                    for key, value in themes.most_common(4)
                ],
                "recurring_questions": questions[:5],
                "last_activity": (
                    normalize_dt(client_readings[0].created_at).isoformat()
                    if client_readings and client_readings[0].created_at
                    else None
                ),
            }
        )

    theme_counter = Counter()
    for item in filtered:
        for theme, value in theme_scores(reading_text(item)).items():
            theme_counter[theme] += value

    monthly = []
    now = datetime.now()
    first = datetime(now.year, now.month, 1)

    for offset in range(-5, 1):
        index = first.year * 12 + first.month - 1 + offset
        year = index // 12
        month = index % 12 + 1
        month_start = datetime(year, month, 1)

        next_index = index + 1
        next_year = next_index // 12
        next_month = next_index % 12 + 1
        month_end = datetime(next_year, next_month, 1)

        month_items = [
            item for item in filtered
            if (
                normalize_dt(item.created_at)
                and month_start <= normalize_dt(item.created_at) < month_end
            )
        ]

        monthly.append(
            {
                "key": f"{year:04d}-{month:02d}",
                "label": month_start.strftime("%b"),
                "total": len(month_items),
                "palm": sum(
                    1 for item in month_items
                    if item.reading_type == "palm"
                ),
                "tarot": sum(
                    1 for item in month_items
                    if item.reading_type == "tarot"
                ),
            }
        )

    return {
        "workspace": "Spiritual Consultant",
        "filters": {
            "reading_type": reading_type,
            "search": search,
            "from_date": from_date,
            "to_date": to_date,
        },
        "metrics": {
            "clients": len(unique_clients),
            "readings": len(filtered),
            "palm_readings": sum(
                1 for item in filtered
                if item.reading_type == "palm"
            ),
            "tarot_readings": sum(
                1 for item in filtered
                if item.reading_type == "tarot"
            ),
            "pending_review": len(pending_reviews),
            "needs_attention": len(attention),
            "feedback_count": len(feedback_for_filtered),
            "helpful_rate": feedback_rate,
            "action_completion_rate": action_completion_rate,
            "strong_guidance_count": sum(
                1 for item in payloads
                if item["scores"]["guidance_relevance"] >= 70
            ),
        },
        "scoring": {
            "weights": {
                "palm_analysis_confidence": 30,
                "tarot_interpretation_relevance": 25,
                "personality_alignment": 20,
                "user_context_relevance": 15,
                "reading_consistency": 10,
            },
            "averages": score_averages,
        },
        "guidance_effectiveness": {
            "feedback_count": len(feedback_for_filtered),
            "helpful_count": helpful_count,
            "helpful_rate": feedback_rate,
            "action_count": len(action_for_clients),
            "completed_actions": completed_actions,
            "action_completion_rate": action_completion_rate,
            "follow_ups_due": sum(
                1
                for row in feedback_for_filtered
                if row["follow_up_due_at"]
                and normalize_dt(row["follow_up_due_at"]) <= datetime.now()
                and not row["follow_up_completed"]
            ),
        },
        # Individual feedback records power the consultant's client-impact
        # timeline and written-comments view. Keep them scoped to readings
        # currently visible in this dashboard response.
        "feedback_items": [
            {
                "id": row.get("id"),
                "reading_id": row.get("reading_id"),
                "helpful": row.get("helpful"),
                "rating": row.get("rating"),
                "comment": row.get("comment"),
                "created_at": row.get("created_at"),
                "updated_at": row.get("updated_at"),
                "follow_up_due_at": row.get("follow_up_due_at"),
                "follow_up_completed": row.get("follow_up_completed", False),
            }
            for row in sorted(
                feedback_for_filtered,
                key=lambda item: normalize_dt(item.get("created_at")) or datetime.min,
                reverse=True,
            )
        ],
        "monthly_activity": monthly,
        "themes": [
            {"theme": key, "count": value}
            for key, value in theme_counter.most_common(8)
        ],
        "client_trends": client_trends,
        "latest_readings": payloads[:12],
        "review_queue": pending_reviews[:12],
        "attention_queue": attention[:12],
        "flagged_reviews": flagged_reviews[:12],
        "privacy": {
            "email_visible_to_role": True,
            "note": "Client data is available only after server-side Consultant role validation.",
        },
        "scoring_note": (
            "Scores are explainable heuristic indicators derived from saved "
            "profile and reading text. They are not clinical, scientific, "
            "diagnostic, or predictive measurements."
        ),
        "outcome_note": (
            "Guidance effectiveness becomes outcome-based only when clients "
            "submit helpfulness feedback, follow-up check-ins, or action completion."
        ),
    }


# ---------------------------------------------------------------------------
# Client drill-down
# ---------------------------------------------------------------------------

@router.get("/clients/{user_id}")
def consultant_client(
    user_id: int,
    current_user: User = Depends(require_consultant),
    db: Session = Depends(get_db),
):
    ensure_consultant_tables(db)

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Client not found.")

    readings = (
        db.query(Reading)
        .filter(Reading.user_id == user_id)
        .order_by(Reading.created_at.desc())
        .all()
    )

    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .first()
    )

    users = {user.id: user}
    profiles = {user_id: profile} if profile else {}
    reviews = review_rows(db)

    items = [
        reading_payload(
            item,
            users[user.id],
            profiles.get(user_id),
            readings,
            reviews,
        )
        for item in readings
    ]

    themes = Counter()
    questions = []

    for item in readings:
        for theme, value in theme_scores(reading_text(item)).items():
            themes[theme] += value

        if clean_text(item.input_summary):
            questions.append(clean_text(item.input_summary)[:180])

    feedback = [
        row for row in feedback_rows(db)
        if int(row["user_id"]) == user_id
    ]

    actions = [
        row for row in action_rows(db)
        if int(row["user_id"]) == user_id
    ]

    return {
        "client": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "active": bool(user.is_active),
            "created_at": (
                normalize_dt(user.created_at).isoformat()
                if user.created_at
                else None
            ),
        },
        "profile": {
            "age_group": getattr(profile, "age_group", None),
            "interests": getattr(profile, "interests", None),
            "spiritual_goals": getattr(profile, "spiritual_goals", None),
            "reading_preferences": getattr(profile, "reading_preferences", None),
        },
        "summary": {
            "readings": len(readings),
            "palm": sum(
                1 for item in readings if item.reading_type == "palm"
            ),
            "tarot": sum(
                1 for item in readings if item.reading_type == "tarot"
            ),
            "feedback": len(feedback),
            "actions": len(actions),
            "completed_actions": sum(
                1 for item in actions if item["completed"]
            ),
        },
        "themes": [
            {"theme": key, "count": value}
            for key, value in themes.most_common(8)
        ],
        "recurring_questions": questions[:12],
        "readings": items,
        "feedback": feedback,
        "actions": actions,
    }


# ---------------------------------------------------------------------------
# Review queue: read, edit, approve, flag
# ---------------------------------------------------------------------------

@router.get("/reviews")
def consultant_reviews(
    status_filter: str = Query(default="", max_length=20),
    current_user: User = Depends(require_consultant),
    db: Session = Depends(get_db),
):
    ensure_consultant_tables(db)

    readings = all_readings(db)
    users = users_for_readings(db, readings)
    profiles = profiles_for_users(db, set(users))
    reviews = review_rows(db)

    items = []

    for reading in readings:
        review = reviews.get(reading.id)

        status_value = review["status"] if review else "pending"

        if status_filter and status_value != status_filter:
            continue

        items.append(
            reading_payload(
                reading,
                users.get(reading.user_id),
                profiles.get(reading.user_id),
                readings,
                reviews,
            )
        )

    return {
        "items": items,
        "total": len(items),
    }


@router.patch("/reviews/{reading_id}")
def update_review(
    reading_id: int,
    payload: ReviewRequest,
    current_user: User = Depends(require_consultant),
    db: Session = Depends(get_db),
):
    ensure_consultant_tables(db)

    reading = (
        db.query(Reading)
        .filter(Reading.id == reading_id)
        .first()
    )

    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")

    edited = payload.edited_text.strip() if payload.edited_text else None

    if payload.status == "flagged" and not payload.flag_reason:
        raise HTTPException(
            status_code=422,
            detail="A reason is required when flagging a reading.",
        )

    existing = db.execute(
        text(
            """
            SELECT id
            FROM consultant_reviews
            WHERE reading_id = :reading_id
            """
        ),
        {"reading_id": reading_id},
    ).mappings().first()

    now = datetime.now()

    if existing:
        db.execute(
            text(
                """
                UPDATE consultant_reviews
                SET consultant_id = :consultant_id,
                    status = :status,
                    edited_text = :edited_text,
                    flag_reason = :flag_reason,
                    reviewed_at = :reviewed_at,
                    updated_at = CURRENT_TIMESTAMP
                WHERE reading_id = :reading_id
                """
            ),
            {
                "consultant_id": current_user.id,
                "status": payload.status,
                "edited_text": edited,
                "flag_reason": payload.flag_reason,
                "reviewed_at": now,
                "reading_id": reading_id,
            },
        )
    else:
        db.execute(
            text(
                """
                INSERT INTO consultant_reviews
                    (reading_id, consultant_id, status, edited_text,
                     flag_reason, reviewed_at)
                VALUES
                    (:reading_id, :consultant_id, :status, :edited_text,
                     :flag_reason, :reviewed_at)
                """
            ),
            {
                "reading_id": reading_id,
                "consultant_id": current_user.id,
                "status": payload.status,
                "edited_text": edited,
                "flag_reason": payload.flag_reason,
                "reviewed_at": now,
            },
        )

    # If the consultant approves an edited interpretation, the edited version
    # becomes the saved report text. This is the human-in-the-loop handoff.
    if payload.status == "approved" and edited:
        reading.result_text = edited

    db.commit()

    return {
        "reading_id": reading_id,
        "status": payload.status,
        "message": (
            "Reading approved and saved."
            if payload.status == "approved"
            else "Reading review updated."
        ),
    }


# ---------------------------------------------------------------------------
# Outcome feedback
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# User-side outcome feedback
# ---------------------------------------------------------------------------

@router.get("/feedback/me")
def get_my_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return feedback previously submitted by the logged-in user."""
    ensure_consultant_tables(db)

    rows = db.execute(
        text(
            """
            SELECT id, reading_id, user_id, helpful, rating, comment,
                   follow_up_due_at, follow_up_completed, created_at, updated_at
            FROM consultant_feedback
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            """
        ),
        {"user_id": current_user.id},
    ).mappings().all()

    return {"items": [dict(row) for row in rows]}


@router.post("/feedback/{reading_id}")
def submit_my_feedback(
    reading_id: int,
    payload: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save feedback for a reading owned by the logged-in user."""
    ensure_consultant_tables(db)

    if payload.reading_id != reading_id:
        raise HTTPException(status_code=422, detail="Reading ID does not match the request path.")

    reading = (
        db.query(Reading)
        .filter(
            Reading.id == reading_id,
            Reading.user_id == current_user.id,
        )
        .first()
    )

    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")

    existing = db.execute(
        text(
            """
            SELECT id
            FROM consultant_feedback
            WHERE reading_id = :reading_id
            ORDER BY id DESC
            LIMIT 1
            """
        ),
        {"reading_id": reading_id},
    ).mappings().first()

    values = {
        "helpful": payload.helpful,
        "rating": payload.rating,
        "comment": payload.comment,
        "follow_up_due_at": payload.follow_up_due_at,
    }

    if existing:
        db.execute(
            text(
                """
                UPDATE consultant_feedback
                SET helpful = :helpful,
                    rating = :rating,
                    comment = :comment,
                    follow_up_due_at = :follow_up_due_at,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id AND user_id = :user_id
                """
            ),
            {**values, "id": existing["id"], "user_id": current_user.id},
        )
    else:
        db.execute(
            text(
                """
                INSERT INTO consultant_feedback
                    (reading_id, user_id, helpful, rating, comment, follow_up_due_at)
                VALUES
                    (:reading_id, :user_id, :helpful, :rating, :comment, :follow_up_due_at)
                """
            ),
            {
                "reading_id": reading_id,
                "user_id": current_user.id,
                **values,
            },
        )

    db.commit()

    return {
        "ok": True,
        "reading_id": reading_id,
        "helpful": payload.helpful,
    }


@router.post("/feedback")
def submit_feedback(
    payload: FeedbackRequest,
    current_user: User = Depends(require_consultant),
    db: Session = Depends(get_db),
):
    ensure_consultant_tables(db)

    reading = (
        db.query(Reading)
        .filter(Reading.id == payload.reading_id)
        .first()
    )

    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found.")

    existing = db.execute(
        text(
            """
            SELECT id
            FROM consultant_feedback
            WHERE reading_id = :reading_id
            ORDER BY id DESC
            LIMIT 1
            """
        ),
        {"reading_id": payload.reading_id},
    ).mappings().first()

    if existing:
        db.execute(
            text(
                """
                UPDATE consultant_feedback
                SET helpful = :helpful,
                    rating = :rating,
                    comment = :comment,
                    follow_up_due_at = :follow_up_due_at,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id
                """
            ),
            {
                "helpful": payload.helpful,
                "rating": payload.rating,
                "comment": payload.comment,
                "follow_up_due_at": payload.follow_up_due_at,
                "id": existing["id"],
            },
        )
    else:
        db.execute(
            text(
                """
                INSERT INTO consultant_feedback
                    (reading_id, user_id, helpful, rating, comment,
                     follow_up_due_at)
                VALUES
                    (:reading_id, :user_id, :helpful, :rating, :comment,
                     :follow_up_due_at)
                """
            ),
            {
                "reading_id": payload.reading_id,
                "user_id": reading.user_id,
                "helpful": payload.helpful,
                "rating": payload.rating,
                "comment": payload.comment,
                "follow_up_due_at": payload.follow_up_due_at,
            },
        )

    db.commit()

    return {"message": "Outcome feedback saved.", "reading_id": reading.id}


@router.patch("/feedback/{feedback_id}/follow-up")
def complete_follow_up(
    feedback_id: int,
    current_user: User = Depends(require_consultant),
    db: Session = Depends(get_db),
):
    ensure_consultant_tables(db)

    result = db.execute(
        text(
            """
            UPDATE consultant_feedback
            SET follow_up_completed = TRUE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
            """
        ),
        {"id": feedback_id},
    )

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Follow-up not found.")

    db.commit()

    return {"message": "Follow-up marked complete."}


# ---------------------------------------------------------------------------
# Consultant notes
# ---------------------------------------------------------------------------

@router.post("/notes")
def create_note(
    payload: NoteRequest,
    current_user: User = Depends(require_consultant),
    db: Session = Depends(get_db),
):
    ensure_consultant_tables(db)

    user = db.query(User).filter(User.id == payload.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Client not found.")

    db.execute(
        text(
            """
            INSERT INTO consultant_notes
                (user_id, consultant_id, note, follow_up_at)
            VALUES
                (:user_id, :consultant_id, :note, :follow_up_at)
            """
        ),
        {
            "user_id": payload.user_id,
            "consultant_id": current_user.id,
            "note": payload.note,
            "follow_up_at": payload.follow_up_at,
        },
    )

    db.commit()

    return {"message": "Private consultant note saved."}


@router.get("/notes/{user_id}")
def get_notes(
    user_id: int,
    current_user: User = Depends(require_consultant),
    db: Session = Depends(get_db),
):
    ensure_consultant_tables(db)

    rows = db.execute(
        text(
            """
            SELECT id, user_id, consultant_id, note, follow_up_at, created_at
            FROM consultant_notes
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            """
        ),
        {"user_id": user_id},
    ).mappings().all()

    return {"items": [dict(row) for row in rows]}


# ---------------------------------------------------------------------------
# Recommended-action completion
# ---------------------------------------------------------------------------

@router.post("/actions")
def create_action(
    payload: ActionRequest,
    current_user: User = Depends(require_consultant),
    db: Session = Depends(get_db),
):
    ensure_consultant_tables(db)

    user = db.query(User).filter(User.id == payload.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Client not found.")

    db.execute(
        text(
            """
            INSERT INTO consultant_actions
                (user_id, consultant_id, reading_id, action_text, due_at)
            VALUES
                (:user_id, :consultant_id, :reading_id, :action_text, :due_at)
            """
        ),
        {
            "user_id": payload.user_id,
            "consultant_id": current_user.id,
            "reading_id": payload.reading_id,
            "action_text": payload.action_text,
            "due_at": payload.due_at,
        },
    )

    db.commit()

    return {"message": "Action assigned to client."}


@router.patch("/actions/{action_id}")
def set_action_completion(
    action_id: int,
    payload: ActionCompleteRequest,
    current_user: User = Depends(require_consultant),
    db: Session = Depends(get_db),
):
    ensure_consultant_tables(db)

    db.execute(
        text(
            """
            UPDATE consultant_actions
            SET completed = :completed,
                completed_at = CASE
                    WHEN :completed = TRUE THEN CURRENT_TIMESTAMP
                    ELSE NULL
                END
            WHERE id = :id
            """
        ),
        {
            "completed": payload.completed,
            "id": action_id,
        },
    )

    db.commit()

    return {"message": "Action status updated."}


# ---------------------------------------------------------------------------
# Export-friendly report endpoint
# ---------------------------------------------------------------------------

@router.get("/export")
def consultant_export(
    current_user: User = Depends(require_consultant),
    db: Session = Depends(get_db),
):
    ensure_consultant_tables(db)

    readings = all_readings(db)
    users = users_for_readings(db, readings)
    profiles = profiles_for_users(db, set(users))
    reviews = review_rows(db)

    return {
        "generated_at": datetime.now().isoformat(),
        "items": [
            reading_payload(
                item,
                users.get(item.user_id),
                profiles.get(item.user_id),
                readings,
                reviews,
            )
            for item in readings
        ],
    }
