"""Statistics and analytics routes."""
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional, Any
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from server.db.models import User, Task, CheckIn, SavedPaper, ResearchInterest, UserActivity
from server.auth.dependencies import get_current_user, get_db


router = APIRouter(prefix="/stats", tags=["statistics"])


# Pydantic models
class OverviewStats(BaseModel):
    user_since_days: int
    total_checkins: int
    total_tasks: int
    completed_tasks: int
    saved_papers: int
    research_interests: int
    current_streak: int
    task_completion_rate: float


class ActivityData(BaseModel):
    date: str
    tasks_completed: int
    checkins: int
    papers_saved: int


class TimeSeriesStats(BaseModel):
    period: str  # daily, weekly, monthly
    data: List[ActivityData]


class Achievement(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    unlocked: bool
    unlocked_at: Optional[datetime] = None
    progress: int  # 0-100
    target: int


class LearningProgress(BaseModel):
    total_study_days: int
    total_study_hours: float
    papers_read: int
    tasks_completed: int
    knowledge_areas: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]


@router.get("/overview", response_model=OverviewStats)
async def get_overview_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get overview statistics for the current user.

    Returns key metrics like days since registration, total checkins,
    tasks, papers, etc.
    """
    # Calculate days since registration
    user_since = datetime.utcnow() - current_user.created_at
    user_since_days = user_since.days

    # Count checkins
    total_checkins = db.query(func.count(CheckIn.id)).filter(
        CheckIn.user_id == current_user.id
    ).scalar() or 0

    # Count tasks
    total_tasks = db.query(func.count(Task.id)).filter(
        Task.user_id == current_user.id
    ).scalar() or 0

    completed_tasks = db.query(func.count(Task.id)).filter(
        Task.user_id == current_user.id,
        Task.status == "completed"
    ).scalar() or 0

    # Count saved papers
    saved_papers = db.query(func.count(SavedPaper.id)).filter(
        SavedPaper.user_id == current_user.id
    ).scalar() or 0

    # Count research interests
    research_interests = db.query(func.count(ResearchInterest.id)).filter(
        ResearchInterest.user_id == current_user.id
    ).scalar() or 0

    # Calculate current streak
    checkins = db.query(CheckIn.date).filter(
        CheckIn.user_id == current_user.id
    ).order_by(CheckIn.date.desc()).all()

    current_streak = 0
    if checkins:
        dates = [c.date for c in checkins]
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

    # Calculate task completion rate
    task_completion_rate = (
        (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    )

    return OverviewStats(
        user_since_days=user_since_days,
        total_checkins=total_checkins,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        saved_papers=saved_papers,
        research_interests=research_interests,
        current_streak=current_streak,
        task_completion_rate=round(task_completion_rate, 2)
    )


@router.get("/timeseries", response_model=TimeSeriesStats)
async def get_timeseries_stats(
    period: str = Query("daily", pattern="^(daily|weekly|monthly)$"),
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get time series statistics.

    Returns activity data over time (tasks, checkins, papers).
    """
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    # Get all checkins in date range
    checkins = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id,
        CheckIn.date >= start_date,
        CheckIn.date <= end_date
    ).all()

    # Get all tasks completed in date range
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.completed_at >= start_date,
        Task.completed_at <= end_date
    ).all()

    # Get all papers saved in date range
    papers = db.query(SavedPaper).filter(
        SavedPaper.user_id == current_user.id,
        SavedPaper.saved_at >= start_date,
        SavedPaper.saved_at <= end_date
    ).all()

    # Build daily data
    data = []
    current_date = start_date

    while current_date <= end_date:
        # Count checkins for this date
        checkins_count = sum(1 for c in checkins if c.date == current_date)

        # Count tasks completed on this date
        tasks_count = sum(
            1 for t in tasks
            if t.completed_at and t.completed_at.date() == current_date
        )

        # Count papers saved on this date
        papers_count = sum(
            1 for p in papers
            if p.saved_at.date() == current_date
        )

        data.append(ActivityData(
            date=current_date.isoformat(),
            tasks_completed=tasks_count,
            checkins=checkins_count,
            papers_saved=papers_count
        ))

        current_date += timedelta(days=1)

    return TimeSeriesStats(
        period=period,
        data=data
    )


@router.get("/achievements", response_model=List[Achievement])
async def get_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user achievements and badges.

    Returns a list of achievements with unlock status.
    """
    # Get user stats
    total_checkins = db.query(func.count(CheckIn.id)).filter(
        CheckIn.user_id == current_user.id
    ).scalar() or 0

    completed_tasks = db.query(func.count(Task.id)).filter(
        Task.user_id == current_user.id,
        Task.status == "completed"
    ).scalar() or 0

    saved_papers = db.query(func.count(SavedPaper.id)).filter(
        SavedPaper.user_id == current_user.id
    ).scalar() or 0

    research_interests = db.query(func.count(ResearchInterest.id)).filter(
        ResearchInterest.user_id == current_user.id
    ).scalar() or 0

    # Calculate current streak
    checkins = db.query(CheckIn.date).filter(
        CheckIn.user_id == current_user.id
    ).order_by(CheckIn.date.desc()).all()

    current_streak = 0
    if checkins:
        dates = [c.date for c in checkins]
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

    # Get first checkin date for unlock dates
    first_checkin = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id
    ).order_by(CheckIn.date.asc()).first()

    first_task = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "completed"
    ).order_by(Task.completed_at.asc()).first()

    first_paper = db.query(SavedPaper).filter(
        SavedPaper.user_id == current_user.id
    ).order_by(SavedPaper.saved_at.asc()).first()

    # Define achievements
    achievements = [
        Achievement(
            id="first_checkin",
            name="首次打卡",
            description="完成第一次打卡",
            icon="📅",
            unlocked=total_checkins >= 1,
            unlocked_at=first_checkin.created_at if first_checkin else None,
            progress=min(total_checkins, 1),
            target=1
        ),
        Achievement(
            id="checkin_week",
            name="一周坚持",
            description="连续打卡 7 天",
            icon="🔥",
            unlocked=current_streak >= 7,
            unlocked_at=None,  # Would need to track this
            progress=min(current_streak, 7),
            target=7
        ),
        Achievement(
            id="checkin_month",
            name="月度冠军",
            description="连续打卡 30 天",
            icon="🏆",
            unlocked=current_streak >= 30,
            unlocked_at=None,
            progress=min(current_streak, 30),
            target=30
        ),
        Achievement(
            id="task_beginner",
            name="任务新手",
            description="完成 10 个任务",
            icon="✅",
            unlocked=completed_tasks >= 10,
            unlocked_at=None,
            progress=min(completed_tasks, 10),
            target=10
        ),
        Achievement(
            id="task_expert",
            name="任务专家",
            description="完成 100 个任务",
            icon="🎯",
            unlocked=completed_tasks >= 100,
            unlocked_at=None,
            progress=min(completed_tasks, 100),
            target=100
        ),
        Achievement(
            id="paper_collector",
            name="论文收藏家",
            description="收藏 50 篇论文",
            icon="📚",
            unlocked=saved_papers >= 50,
            unlocked_at=None,
            progress=min(saved_papers, 50),
            target=50
        ),
        Achievement(
            id="paper_master",
            name="论文大师",
            description="收藏 200 篇论文",
            icon="🎓",
            unlocked=saved_papers >= 200,
            unlocked_at=None,
            progress=min(saved_papers, 200),
            target=200
        ),
        Achievement(
            id="researcher",
            name="研究者",
            description="添加 5 个研究兴趣",
            icon="🔬",
            unlocked=research_interests >= 5,
            unlocked_at=None,
            progress=min(research_interests, 5),
            target=5
        ),
        Achievement(
            id="first_task",
            name="开始行动",
            description="完成第一个任务",
            icon="🚀",
            unlocked=completed_tasks >= 1,
            unlocked_at=first_task.completed_at if first_task else None,
            progress=min(completed_tasks, 1),
            target=1
        ),
        Achievement(
            id="first_paper",
            name="知识积累",
            description="收藏第一篇论文",
            icon="📖",
            unlocked=saved_papers >= 1,
            unlocked_at=first_paper.saved_at if first_paper else None,
            progress=min(saved_papers, 1),
            target=1
        ),
    ]

    return achievements


@router.get("/learning-progress", response_model=LearningProgress)
async def get_learning_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed learning progress.

    Returns study time, papers read, knowledge areas, etc.
    """
    # Calculate total study days (days with checkins)
    total_study_days = db.query(func.count(func.distinct(CheckIn.date))).filter(
        CheckIn.user_id == current_user.id
    ).scalar() or 0

    # Estimate study hours from checkins
    # Assume each checkin represents study time based on tasks completed
    checkins = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id
    ).all()

    total_study_hours = sum(
        (c.tasks_completed / max(c.tasks_total, 1)) * 2  # Estimate 2 hours per session
        for c in checkins
    )

    # Count papers read (saved papers)
    papers_read = db.query(func.count(SavedPaper.id)).filter(
        SavedPaper.user_id == current_user.id
    ).scalar() or 0

    # Count tasks completed
    tasks_completed = db.query(func.count(Task.id)).filter(
        Task.user_id == current_user.id,
        Task.status == "completed"
    ).scalar() or 0

    # Get knowledge areas from research interests
    interests = db.query(ResearchInterest).filter(
        ResearchInterest.user_id == current_user.id
    ).all()

    knowledge_areas = [
        {
            "topic": interest.topic,
            "level": interest.level,
            "priority": interest.priority,
            "added_at": interest.created_at.isoformat()
        }
        for interest in interests
    ]

    # Get recent activity (last 10 items)
    recent_activity = []

    # Recent checkins
    recent_checkins = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id
    ).order_by(CheckIn.date.desc()).limit(5).all()

    for c in recent_checkins:
        recent_activity.append({
            "type": "checkin",
            "date": c.date.isoformat(),
            "data": {
                "mood": c.mood,
                "tasks_completed": c.tasks_completed,
                "tasks_total": c.tasks_total
            }
        })

    # Recent completed tasks
    recent_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "completed"
    ).order_by(Task.completed_at.desc()).limit(5).all()

    for t in recent_tasks:
        recent_activity.append({
            "type": "task_completed",
            "date": t.completed_at.isoformat() if t.completed_at else None,
            "data": {
                "title": t.title,
                "priority": t.priority
            }
        })

    # Sort by date
    recent_activity.sort(
        key=lambda x: x["date"] if x["date"] else "",
        reverse=True
    )

    return LearningProgress(
        total_study_days=total_study_days,
        total_study_hours=round(total_study_hours, 1),
        papers_read=papers_read,
        tasks_completed=tasks_completed,
        knowledge_areas=knowledge_areas,
        recent_activity=recent_activity[:10]
    )


@router.get("/activity-heatmap")
async def get_activity_heatmap(
    year: int = Query(..., ge=2020, le=2030),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get activity heatmap data for a specific year.

    Returns daily activity counts for visualization.
    """
    start_date = date(year, 1, 1)
    end_date = date(year, 12, 31)

    # Get all checkins for the year
    checkins = db.query(CheckIn.date, func.count(CheckIn.id).label('count')).filter(
        CheckIn.user_id == current_user.id,
        CheckIn.date >= start_date,
        CheckIn.date <= end_date
    ).group_by(CheckIn.date).all()

    # Convert to dict
    checkin_map = {c.date.isoformat(): c.count for c in checkins}

    # Build heatmap data
    heatmap_data = []
    current_date = start_date

    while current_date <= end_date:
        date_str = current_date.isoformat()
        heatmap_data.append({
            "date": date_str,
            "count": checkin_map.get(date_str, 0),
            "level": min(checkin_map.get(date_str, 0), 4)  # 0-4 levels for visualization
        })
        current_date += timedelta(days=1)

    return {
        "year": year,
        "data": heatmap_data
    }
