from datetime import datetime, timedelta, timezone
import csv
import io
import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Reading, User


router = APIRouter(prefix="/api/tarot-reader", tags=["Tarot Reader"])


def utc_naive(value: datetime | None) -> datetime | None:
    """Return datetimes in one comparable form: naive UTC."""
    if value is None:
        return None
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


def require_tarot_reader(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    if str(current_user.role or "").lower() != "tarot_reader":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tarot Reader access is required.",
        )

    return current_user


def parse_tarot_input(reading: Reading) -> dict:
    raw = reading.input_summary or ""
    try:
        value = json.loads(raw)
        if isinstance(value, dict):
            return value
    except (TypeError, ValueError, json.JSONDecodeError):
        pass
    return {}


def tarot_readings(db: Session):
    return (
        db.query(Reading)
        .filter(Reading.reading_type == "tarot")
        .order_by(Reading.created_at.desc())
        .all()
    )


def month_shift(month_start: datetime, offset: int) -> datetime:
    total = month_start.year * 12 + (month_start.month - 1) + offset
    year = total // 12
    month = (total % 12) + 1
    return month_start.replace(year=year, month=month)


def report_payload(reading: Reading, user: User | None = None) -> dict:
    data = parse_tarot_input(reading)
    cards = data.get("cards") if isinstance(data.get("cards"), list) else []

    return {
        "id": reading.id,
        "user_id": reading.user_id,
        "user_name": user.full_name if user else "Unknown user",
        "user_email": user.email if user else "",
        "title": reading.title,
        "reading_type": "tarot",
        "spread": data.get("spread") or "Custom spread",
        "question": data.get("question") or "General reflection",
        "cards": cards,
        "orientations": data.get("orientations") if isinstance(data.get("orientations"), list) else [],
        "input_summary": reading.input_summary,
        "result_text": reading.result_text or "",
        "result_preview": (reading.result_text or "")[:360],
        "created_at": utc_naive(reading.created_at).isoformat() if reading.created_at else None,
    }


@router.get("/dashboard")
def tarot_reader_dashboard(
    current_user: User = Depends(require_tarot_reader),
    db: Session = Depends(get_db),
):
    del current_user

    readings = tarot_readings(db)
    user_ids = sorted({item.user_id for item in readings})

    users = (
        db.query(User)
        .filter(User.id.in_(user_ids))
        .all()
        if user_ids
        else []
    )
    user_map = {user.id: user for user in users}

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    current_month = now.replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )
    next_month = month_shift(current_month, 1)
    previous_30 = now - timedelta(days=30)

    this_month = sum(
        1
        for item in readings
        if item.created_at
        and utc_naive(item.created_at) >= current_month
        and utc_naive(item.created_at) < next_month
    )

    last_30 = sum(
        1
        for item in readings
        if item.created_at and utc_naive(item.created_at) >= previous_30
    )

    # A session is a user's tarot activity on one calendar day.
    session_keys = {
        (
            item.user_id,
            utc_naive(item.created_at).date().isoformat(),
        )
        for item in readings
        if item.created_at
    }

    user_reading_counts = {}
    user_last_reading = {}

    card_counts = {}
    spread_counts = {}

    for item in readings:
        user_reading_counts[item.user_id] = (
            user_reading_counts.get(item.user_id, 0) + 1
        )

        if (
            item.user_id not in user_last_reading
            or (
                item.created_at
                and utc_naive(item.created_at) > user_last_reading[item.user_id]
            )
        ):
            user_last_reading[item.user_id] = utc_naive(item.created_at)

        data = parse_tarot_input(item)

        cards = data.get("cards") if isinstance(data.get("cards"), list) else []
        for card in cards:
            if isinstance(card, dict):
                name = str(card.get("card") or "").strip()
            else:
                name = str(card).strip()
            if name:
                card_counts[name] = card_counts.get(name, 0) + 1

        spread = str(data.get("spread") or "Custom spread").strip()
        spread_counts[spread] = spread_counts.get(spread, 0) + 1

    monthly = []
    first_month = month_shift(current_month, -5)

    for offset in range(6):
        start = month_shift(first_month, offset)
        end = month_shift(start, 1)

        count = sum(
            1
            for item in readings
            if item.created_at
            and utc_naive(item.created_at) >= start
            and utc_naive(item.created_at) < end
        )

        monthly.append(
            {
                "key": start.strftime("%Y-%m"),
                "label": start.strftime("%b"),
                "readings": count,
            }
        )

    recent_reports = [
        report_payload(item, user_map.get(item.user_id))
        for item in readings[:8]
    ]

    engagement = []
    for user_id, count in sorted(
        user_reading_counts.items(),
        key=lambda pair: (-pair[1], pair[0]),
    )[:8]:
        user = user_map.get(user_id)
        engagement.append(
            {
                "user_id": user_id,
                "user_name": user.full_name if user else "Unknown user",
                "user_email": user.email if user else "",
                "reading_count": count,
                "last_reading": (
                    user_last_reading[user_id].isoformat()
                    if user_last_reading.get(user_id)
                    else None
                ),
            }
        )

    sessions = []
    for user_id, date_value in sorted(
        session_keys,
        key=lambda pair: pair[1],
        reverse=True,
    )[:8]:
        user = user_map.get(user_id)
        day_readings = [
            item
            for item in readings
            if item.user_id == user_id
            and item.created_at
            and utc_naive(item.created_at).date().isoformat() == date_value
        ]
        sessions.append(
            {
                "session_key": f"{user_id}-{date_value}",
                "user_id": user_id,
                "user_name": user.full_name if user else "Unknown user",
                "date": date_value,
                "reading_count": len(day_readings),
                "last_activity": (
                    max(utc_naive(item.created_at) for item in day_readings).isoformat()
                    if day_readings
                    else None
                ),
            }
        )

    return {
        "metrics": {
            "total_tarot_readings": len(readings),
            "unique_users": len(user_ids),
            "this_month": this_month,
            "last_30_days": last_30,
            "sessions": len(session_keys),
            "average_readings_per_user": (
                round(len(readings) / len(user_ids), 1)
                if user_ids
                else 0
            ),
        },
        "monthly_activity": monthly,
        "top_cards": [
            {"card": name, "count": count}
            for name, count in sorted(
                card_counts.items(),
                key=lambda pair: (-pair[1], pair[0]),
            )[:8]
        ],
        "spread_mix": [
            {"spread": name, "count": count}
            for name, count in sorted(
                spread_counts.items(),
                key=lambda pair: (-pair[1], pair[0]),
            )
        ],
        "engagement": engagement,
        "sessions": sessions,
        "recent_reports": recent_reports,
    }


@router.get("/reports")
def tarot_reader_reports(
    search: str = Query(default="", max_length=120),
    spread: str = Query(default="", max_length=100),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(require_tarot_reader),
    db: Session = Depends(get_db),
):
    del current_user

    readings = tarot_readings(db)
    user_ids = sorted({item.user_id for item in readings})
    users = (
        db.query(User).filter(User.id.in_(user_ids)).all()
        if user_ids
        else []
    )
    user_map = {user.id: user for user in users}

    search_text = search.strip().lower()
    spread_text = spread.strip().lower()

    items = []

    for reading in readings:
        payload = report_payload(reading, user_map.get(reading.user_id))

        haystack = " ".join(
            [
                payload["user_name"],
                payload["user_email"],
                payload["question"],
                payload["spread"],
                " ".join(
                    [
                        str(card.get("card") if isinstance(card, dict) else card)
                        for card in payload["cards"]
                    ]
                ),
            ]
        ).lower()

        if search_text and search_text not in haystack:
            continue

        if spread_text and payload["spread"].lower() != spread_text:
            continue

        items.append(payload)

        if len(items) >= limit:
            break

    spreads = sorted(
        {
            report_payload(reading, user_map.get(reading.user_id))["spread"]
            for reading in readings
        }
    )

    return {
        "items": items,
        "total": len(items),
        "available_spreads": spreads,
    }


@router.get("/sessions")
def tarot_reader_sessions(
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(require_tarot_reader),
    db: Session = Depends(get_db),
):
    del current_user

    readings = tarot_readings(db)
    user_ids = sorted({item.user_id for item in readings})
    users = (
        db.query(User).filter(User.id.in_(user_ids)).all()
        if user_ids
        else []
    )
    user_map = {user.id: user for user in users}

    grouped = {}

    for item in readings:
        if not item.created_at:
            continue

        key = (item.user_id, utc_naive(item.created_at).date().isoformat())
        grouped.setdefault(key, []).append(item)

    items = []

    for (user_id, date_value), group in sorted(
        grouped.items(),
        key=lambda pair: max(
            utc_naive(item.created_at) for item in pair[1]
        ),
        reverse=True,
    )[:limit]:
        user = user_map.get(user_id)
        items.append(
            {
                "session_key": f"{user_id}-{date_value}",
                "user_id": user_id,
                "user_name": user.full_name if user else "Unknown user",
                "user_email": user.email if user else "",
                "date": date_value,
                "reading_count": len(group),
                "readings": [
                    {
                        "id": item.id,
                        "title": item.title,
                        "created_at": utc_naive(item.created_at).isoformat(),
                        "spread": report_payload(
                            item, user
                        )["spread"],
                    }
                    for item in sorted(
                        group,
                        key=lambda value: utc_naive(value.created_at),
                        reverse=True,
                    )
                ],
            }
        )

    return {"items": items, "total": len(items)}


@router.get("/reports/export")
def export_tarot_reports(
    search: str = Query(default="", max_length=120),
    current_user: User = Depends(require_tarot_reader),
    db: Session = Depends(get_db),
):
    del current_user

    readings = tarot_readings(db)
    user_ids = sorted({item.user_id for item in readings})
    users = (
        db.query(User).filter(User.id.in_(user_ids)).all()
        if user_ids
        else []
    )
    user_map = {user.id: user for user in users}

    search_text = search.strip().lower()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "Reading ID",
            "User",
            "Email",
            "Date",
            "Spread",
            "Question",
            "Cards",
        ]
    )

    for reading in readings:
        payload = report_payload(reading, user_map.get(reading.user_id))
        haystack = " ".join(
            [
                payload["user_name"],
                payload["user_email"],
                payload["spread"],
                payload["question"],
                " ".join(
                    [
                        str(card.get("card") if isinstance(card, dict) else card)
                        for card in payload["cards"]
                    ]
                ),
            ]
        ).lower()

        if search_text and search_text not in haystack:
            continue

        cards = []
        for card in payload["cards"]:
            if isinstance(card, dict):
                name = card.get("card") or "Unknown card"
                orientation = card.get("orientation") or "upright"
                cards.append(f"{name} ({orientation})")
            else:
                cards.append(str(card))

        writer.writerow(
            [
                payload["id"],
                payload["user_name"],
                payload["user_email"],
                payload["created_at"],
                payload["spread"],
                payload["question"],
                " | ".join(cards),
            ]
        )

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="tarot-reader-reports.csv"'
        },
    )
