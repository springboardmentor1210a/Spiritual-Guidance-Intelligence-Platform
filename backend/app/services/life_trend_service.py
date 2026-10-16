from sqlalchemy.orm import Session

from app.models.life_trend_analysis import LifeTrendAnalysis
from app.services.ai_interpretation_service import get_profile_for_reading


def _clamp_score(value):
    return max(0, min(100, int(round(value))))


def _build_demo_history(score, trend_index):
    """
    Creates deterministic demo historical signals.

    These values are simulated historical data for the
    Milestone 3 demonstration. They are not real historical
    measurements from previous user readings.
    """

    current = _clamp_score(score)

    patterns = [
        [-8, -5, -3, -1, 0],
        [-5, -8, -4, -2, 0],
        [-10, -6, -2, -4, 0],
        [-7, -3, -6, -2, 0],
    ]

    offsets = patterns[trend_index % len(patterns)]

    labels = [
        "6 weeks ago",
        "4 weeks ago",
        "3 weeks ago",
        "1 week ago",
        "Current",
    ]

    values = [
        _clamp_score(current + offset)
        for offset in offsets
    ]

    chart_data = [
        {
            "label": label,
            "value": value,
        }
        for label, value in zip(labels, values)
    ]

    past_score = values[0]
    present_score = values[-1]
    change = present_score - past_score

    return {
        "past_score": past_score,
        "present_score": present_score,
        "change": change,
        "chart_data": chart_data,
        "history_type": "demo_simulated",
    }


def _attach_historical_data(trends):
    enriched_trends = {}

    for index, (key, trend) in enumerate(trends.items()):
        trend_copy = dict(trend)

        history = _build_demo_history(
            trend_copy.get("score", 0),
            index,
        )

        trend_copy.update(history)

        enriched_trends[key] = trend_copy

    return enriched_trends


def generate_life_trends(
    db: Session,
    user_id: int,
    reading_session_id: int,
):
    row = (
        db.query(LifeTrendAnalysis)
        .filter_by(
            user_id=user_id,
            reading_session_id=reading_session_id,
        )
        .first()
    )

    if row:
        # Upgrade older Milestone 3 records that do not
        # yet contain historical trend information.
        needs_history = any(
            not isinstance(trend, dict)
            or "chart_data" not in trend
            or "past_score" not in trend
            or "present_score" not in trend
            for trend in (row.trends or {}).values()
        )

        if needs_history:
            row.trends = _attach_historical_data(row.trends or {})
            db.commit()
            db.refresh(row)

        return row

    profile = get_profile_for_reading(
        db,
        user_id,
        reading_session_id,
    )["life_trends"]

    trends = {
        key: value
        for key, value in profile.items()
        if key not in ("current_phase", "summary")
    }

    trends = _attach_historical_data(trends)

    row = LifeTrendAnalysis(
        user_id=user_id,
        reading_session_id=reading_session_id,
        current_phase=profile["current_phase"],
        trends=trends,
        summary=profile["summary"],
    )

    db.add(row)
    db.commit()
    db.refresh(row)

    return row