"""Check-in system routes."""
from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from server.db.models import CheckIn, User
from server.auth.dependencies import get_current_user, get_db


router = APIRouter(prefix="/checkins", tags=["checkins"])


# Pydantic models
class CheckInCreate(BaseModel):
    date: Optional[date] = None  # Defaults to today
    mood: str = Field(..., pattern="^(happy|neutral|frustrated|tired)$")
    content: Optional[str] = None
    difficulties: Optional[str] = None
    tasks_completed: int = Field(default=0, ge=0)
    tasks_total: int = Field(default=0, ge=0)


class CheckInResponse(BaseModel):
    id: int
    user_id: int
    date: date
    mood: str
    content: Optional[str]
    difficulties: Optional[str]
    tasks_completed: int
    tasks_total: int
    created_at: datetime

    class Config:
        from_attributes = True


class CheckInStats(BaseModel):
    total_checkins: int
    current_streak: int
    longest_streak: int
    average_completion_rate: float
    mood_distribution: dict


class CheckInCalendar(BaseModel):
    year: int
    month: int
    days: List[dict]  # List of {day: int, has_checkin: bool, mood: str}


@router.get("", response_model=List[CheckInResponse])
async def get_checkins(
    skip: int = Query(0, ge=0),
    limit: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get check-in history for the current user.

    Returns check-ins ordered by date (most recent first).
    """
    checkins = (
        db.query(CheckIn)
        .filter(CheckIn.user_id == current_user.id)
        .order_by(CheckIn.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return checkins


@router.post("", response_model=CheckInResponse, status_code=status.HTTP_201_CREATED)
async def create_checkin(
    checkin_data: CheckInCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new check-in.

    If date is not provided, uses today's date.
    Only one check-in per day is allowed.
    """
    checkin_date = checkin_data.date or date.today()

    # Check if check-in already exists for this date
    existing = (
        db.query(CheckIn)
        .filter(
            CheckIn.user_id == current_user.id,
            CheckIn.date == checkin_date
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Check-in already exists for {checkin_date}"
        )

    new_checkin = CheckIn(
        user_id=current_user.id,
        date=checkin_date,
        mood=checkin_data.mood,
        content=checkin_data.content,
        difficulties=checkin_data.difficulties,
        tasks_completed=checkin_data.tasks_completed,
        tasks_total=checkin_data.tasks_total
    )

    db.add(new_checkin)
    db.commit()
    db.refresh(new_checkin)

    return new_checkin


@router.get("/today", response_model=Optional[CheckInResponse])
async def get_today_checkin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get today's check-in if it exists.

    Returns None if no check-in for today.
    """
    today = date.today()

    checkin = (
        db.query(CheckIn)
        .filter(
            CheckIn.user_id == current_user.id,
            CheckIn.date == today
        )
        .first()
    )

    return checkin


@router.get("/stats", response_model=CheckInStats)
async def get_checkin_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get check-in statistics for the current user.

    Includes:
    - Total check-ins
    - Current streak
    - Longest streak
    - Average completion rate
    - Mood distribution
    """
    checkins = (
        db.query(CheckIn)
        .filter(CheckIn.user_id == current_user.id)
        .order_by(CheckIn.date.desc())
        .all()
    )

    total_checkins = len(checkins)

    # Calculate streaks
    current_streak = 0
    longest_streak = 0

    if checkins:
        # Sort by date ascending for streak calculation
        sorted_checkins = sorted(checkins, key=lambda c: c.date)
        dates = [c.date for c in sorted_checkins]

        # Calculate current streak
        today = date.today()
        yesterday = today - timedelta(days=1)

        if today in dates or yesterday in dates:
            streak = 1
            current_date = today if today in dates else yesterday

            for i in range(1, len(dates)):
                expected_date = current_date - timedelta(days=i)
                if expected_date in dates:
                    streak += 1
                else:
                    break

            current_streak = streak

        # Calculate longest streak
        if dates:
            temp_streak = 1
            longest_streak = 1

            for i in range(1, len(dates)):
                if (dates[i] - dates[i-1]).days == 1:
                    temp_streak += 1
                    longest_streak = max(longest_streak, temp_streak)
                else:
                    temp_streak = 1

    # Calculate average completion rate
    completion_rates = [
        (c.tasks_completed / c.tasks_total * 100) if c.tasks_total > 0 else 0
        for c in checkins
    ]
    average_completion_rate = (
        sum(completion_rates) / len(completion_rates)
        if completion_rates else 0
    )

    # Mood distribution
    mood_counts = {}
    for c in checkins:
        mood_counts[c.mood] = mood_counts.get(c.mood, 0) + 1

    return CheckInStats(
        total_checkins=total_checkins,
        current_streak=current_streak,
        longest_streak=longest_streak,
        average_completion_rate=round(average_completion_rate, 2),
        mood_distribution=mood_counts
    )


@router.get("/streak")
async def get_checkin_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current check-in streak.

    Returns the number of consecutive days with check-ins.
    """
    checkins = (
        db.query(CheckIn)
        .filter(CheckIn.user_id == current_user.id)
        .order_by(CheckIn.date.desc())
        .all()
    )

    if not checkins:
        return {"current_streak": 0, "last_checkin": None}

    dates = sorted([c.date for c in checkins], reverse=True)
    today = date.today()
    yesterday = today - timedelta(days=1)

    # Check if there's a check-in today or yesterday
    if dates[0] != today and dates[0] != yesterday:
        return {"current_streak": 0, "last_checkin": dates[0].isoformat()}

    streak = 1
    current_date = dates[0]

    for i in range(1, len(dates)):
        expected_date = current_date - timedelta(days=1)
        if dates[i] == expected_date:
            streak += 1
            current_date = dates[i]
        else:
            break

    return {
        "current_streak": streak,
        "last_checkin": dates[0].isoformat()
    }


@router.get("/calendar/{year}/{month}", response_model=CheckInCalendar)
async def get_checkin_calendar(
    year: int,
    month: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get check-in calendar for a specific month.

    Returns a calendar with check-in status for each day.
    """
    # Validate month
    if month < 1 or month > 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Month must be between 1 and 12"
        )

    # Get all check-ins for the month
    checkins = (
        db.query(CheckIn)
        .filter(
            CheckIn.user_id == current_user.id,
            extract('year', CheckIn.date) == year,
            extract('month', CheckIn.date) == month
        )
        .all()
    )

    # Create a map of date -> check-in
    checkin_map = {c.date.day: c for c in checkins}

    # Get number of days in the month
    if month == 12:
        next_month = date(year + 1, 1, 1)
    else:
        next_month = date(year, month + 1, 1)

    last_day = (next_month - timedelta(days=1)).day

    # Build calendar
    days = []
    for day in range(1, last_day + 1):
        has_checkin = day in checkin_map
        mood = checkin_map[day].mood if has_checkin else None

        days.append({
            "day": day,
            "has_checkin": has_checkin,
            "mood": mood
        })

    return CheckInCalendar(
        year=year,
        month=month,
        days=days
    )


@router.delete("/{checkin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_checkin(
    checkin_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a check-in.
    """
    checkin = (
        db.query(CheckIn)
        .filter(
            CheckIn.id == checkin_id,
            CheckIn.user_id == current_user.id
        )
        .first()
    )

    if not checkin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Check-in not found"
        )

    db.delete(checkin)
    db.commit()

    return None


# Legacy endpoint for backward compatibility
@router.post("/legacy")
def legacy_checkin(p: dict):
    """Legacy endpoint - returns the posted dict."""
    return p
