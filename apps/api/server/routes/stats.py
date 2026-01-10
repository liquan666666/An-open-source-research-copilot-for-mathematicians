from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import json

from server.db.session import SessionLocal
from server.db.models import Task, CheckIn, Paper

router = APIRouter(prefix='/stats')

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# GET /stats/overview - Get overall statistics
@router.get('/overview')
def get_overview_stats(db: Session = Depends(get_db)):
    """Get overall statistics overview"""

    # Task statistics
    total_tasks = db.query(Task).count()
    completed_tasks = db.query(Task).filter(Task.status == 'done').count()
    in_progress_tasks = db.query(Task).filter(Task.status == 'in_progress').count()

    # Paper statistics
    total_papers = db.query(Paper).count()
    focus_papers = db.query(Paper).filter(Paper.focus == True).count()

    # Check-in statistics
    total_checkins = db.query(CheckIn).count()
    total_minutes = db.query(func.sum(CheckIn.minutes)).scalar() or 0
    total_hours = round(total_minutes / 60, 1)

    # Calculate completion rate
    completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0

    return {
        'tasks': {
            'total': total_tasks,
            'completed': completed_tasks,
            'in_progress': in_progress_tasks,
            'pending': total_tasks - completed_tasks - in_progress_tasks,
            'completion_rate': completion_rate
        },
        'papers': {
            'total': total_papers,
            'focus': focus_papers
        },
        'time': {
            'total_minutes': total_minutes,
            'total_hours': total_hours,
            'total_checkins': total_checkins
        }
    }

# GET /stats/daily - Get daily activity statistics
@router.get('/daily')
def get_daily_stats(days: int = 30, db: Session = Depends(get_db)):
    """Get daily statistics for the past N days"""

    # Calculate date range
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days - 1)

    # Get all tasks in range
    tasks = db.query(Task).filter(
        Task.date >= start_date.isoformat(),
        Task.date <= end_date.isoformat()
    ).all()

    # Group by date
    daily_stats = {}
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.isoformat()
        day_tasks = [t for t in tasks if t.date == date_str]

        # Get check-ins for this day
        task_ids = [t.id for t in day_tasks]
        day_checkins = db.query(CheckIn).filter(CheckIn.task_id.in_(task_ids)).all() if task_ids else []

        daily_stats[date_str] = {
            'date': date_str,
            'total_tasks': len(day_tasks),
            'completed_tasks': len([t for t in day_tasks if t.status == 'done']),
            'theory_tasks': len([t for t in day_tasks if t.kind == 'theory']),
            'computation_tasks': len([t for t in day_tasks if t.kind == 'computation']),
            'total_minutes': sum(c.minutes for c in day_checkins),
            'checkins': len(day_checkins)
        }

        current_date += timedelta(days=1)

    return {
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'days': days,
        'daily_data': list(daily_stats.values())
    }

# GET /stats/weekly - Get weekly summary
@router.get('/weekly')
def get_weekly_stats(weeks: int = 4, db: Session = Depends(get_db)):
    """Get weekly statistics for the past N weeks"""

    # Calculate date range
    end_date = datetime.now().date()
    start_date = end_date - timedelta(weeks=weeks)

    # Get all tasks in range
    tasks = db.query(Task).filter(
        Task.date >= start_date.isoformat(),
        Task.date <= end_date.isoformat()
    ).all()

    # Group by week
    weekly_stats = []
    for week_num in range(weeks):
        week_start = end_date - timedelta(weeks=weeks - week_num)
        week_end = week_start + timedelta(days=6)

        week_tasks = [
            t for t in tasks
            if week_start.isoformat() <= t.date <= week_end.isoformat()
        ]

        # Get check-ins for this week
        task_ids = [t.id for t in week_tasks]
        week_checkins = db.query(CheckIn).filter(CheckIn.task_id.in_(task_ids)).all() if task_ids else []

        weekly_stats.append({
            'week': week_num + 1,
            'start_date': week_start.isoformat(),
            'end_date': week_end.isoformat(),
            'total_tasks': len(week_tasks),
            'completed_tasks': len([t for t in week_tasks if t.status == 'done']),
            'theory_tasks': len([t for t in week_tasks if t.kind == 'theory']),
            'computation_tasks': len([t for t in week_tasks if t.kind == 'computation']),
            'total_hours': round(sum(c.minutes for c in week_checkins) / 60, 1),
            'checkins': len(week_checkins)
        })

    return {
        'weeks': weeks,
        'weekly_data': weekly_stats
    }

# GET /stats/productivity - Get productivity metrics
@router.get('/productivity')
def get_productivity_stats(db: Session = Depends(get_db)):
    """Get productivity metrics"""

    # Get all completed tasks with check-ins
    completed_tasks = db.query(Task).filter(Task.status == 'done').all()

    theory_minutes = 0
    computation_minutes = 0
    theory_count = 0
    computation_count = 0

    for task in completed_tasks:
        checkins = db.query(CheckIn).filter(CheckIn.task_id == task.id).all()
        task_minutes = sum(c.minutes for c in checkins)

        if task.kind == 'theory':
            theory_minutes += task_minutes
            theory_count += 1
        else:
            computation_minutes += task_minutes
            computation_count += 1

    # Calculate averages
    avg_theory_minutes = round(theory_minutes / theory_count) if theory_count > 0 else 0
    avg_computation_minutes = round(computation_minutes / computation_count) if computation_count > 0 else 0

    # Theory/computation ratio
    total_minutes = theory_minutes + computation_minutes
    theory_ratio = round(theory_minutes / total_minutes, 2) if total_minutes > 0 else 0.5

    return {
        'theory': {
            'total_hours': round(theory_minutes / 60, 1),
            'tasks_completed': theory_count,
            'avg_minutes_per_task': avg_theory_minutes
        },
        'computation': {
            'total_hours': round(computation_minutes / 60, 1),
            'tasks_completed': computation_count,
            'avg_minutes_per_task': avg_computation_minutes
        },
        'ratio': {
            'theory_ratio': theory_ratio,
            'computation_ratio': round(1 - theory_ratio, 2)
        }
    }
