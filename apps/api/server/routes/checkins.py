from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from server.db.session import get_db
from server.db.models import CheckIn, Task
from server.schemas import CheckInCreate, CheckInResponse
from typing import List
import json

router = APIRouter(prefix='/checkins', tags=['checkins'])


@router.post('', response_model=CheckInResponse, status_code=201)
def create_checkin(checkin: CheckInCreate, db: Session = Depends(get_db)):
    """Record a check-in for a task"""
    # Verify task exists
    task = db.query(Task).filter(Task.id == checkin.task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail=f"Task {checkin.task_id} not found")

    # Validate status
    valid_statuses = ["progress", "done", "blocked"]
    if checkin.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    # Create check-in
    db_checkin = CheckIn(
        task_id=checkin.task_id,
        minutes=checkin.minutes,
        note=checkin.note,
        status=checkin.status
    )

    db.add(db_checkin)

    # Update task status based on check-in
    if checkin.status == "done":
        task.status = "done"
    elif checkin.status == "blocked":
        task.status = "blocked"
    elif checkin.status == "progress":
        task.status = "in_progress"

    db.commit()
    db.refresh(db_checkin)

    return db_checkin


@router.get('', response_model=List[CheckInResponse])
def list_checkins(
    task_id: int = Query(None, description="Filter by task ID"),
    db: Session = Depends(get_db)
):
    """Get all check-ins, optionally filtered by task"""
    query = db.query(CheckIn)

    if task_id is not None:
        query = query.filter(CheckIn.task_id == task_id)

    checkins = query.order_by(CheckIn.id.desc()).all()
    return checkins


@router.get('/task/{task_id}', response_model=List[CheckInResponse])
def get_task_checkins(task_id: int, db: Session = Depends(get_db)):
    """Get all check-ins for a specific task"""
    # Verify task exists
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")

    checkins = db.query(CheckIn).filter(CheckIn.task_id == task_id).order_by(CheckIn.id.asc()).all()
    return checkins


@router.get('/stats/{task_id}')
def get_task_stats(task_id: int, db: Session = Depends(get_db)):
    """Get statistics for a task based on check-ins"""
    # Verify task exists
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")

    # Get all check-ins for the task
    checkins = db.query(CheckIn).filter(CheckIn.task_id == task_id).all()

    if not checkins:
        return {
            "task_id": task_id,
            "total_time_minutes": 0,
            "total_checkins": 0,
            "status_breakdown": {},
            "notes": []
        }

    # Calculate statistics
    total_time = sum(c.minutes for c in checkins)
    status_counts = {}

    for checkin in checkins:
        status = checkin.status
        status_counts[status] = status_counts.get(status, 0) + 1

    notes = [{"minutes": c.minutes, "note": c.note, "status": c.status} for c in checkins]

    return {
        "task_id": task_id,
        "total_time_minutes": total_time,
        "total_time_hours": round(total_time / 60, 2),
        "total_checkins": len(checkins),
        "status_breakdown": status_counts,
        "notes": notes
    }


@router.get('/daily-summary')
def get_daily_summary(target_date: str = Query(None, description="Date in YYYY-MM-DD format"), db: Session = Depends(get_db)):
    """Get a summary of all check-ins for a specific date"""
    from datetime import date

    # Use provided date or today
    if target_date is None:
        target_date = date.today().isoformat()

    # Get all tasks for the date
    tasks = db.query(Task).filter(Task.date == target_date).all()

    if not tasks:
        return {
            "date": target_date,
            "total_tasks": 0,
            "total_time_minutes": 0,
            "tasks_summary": []
        }

    # Get check-ins for each task
    total_time = 0
    tasks_summary = []

    for task in tasks:
        checkins = db.query(CheckIn).filter(CheckIn.task_id == task.id).all()
        task_time = sum(c.minutes for c in checkins)
        total_time += task_time

        tasks_summary.append({
            "task_id": task.id,
            "task_title": task.title,
            "task_kind": task.kind,
            "task_status": task.status,
            "time_spent_minutes": task_time,
            "checkin_count": len(checkins)
        })

    return {
        "date": target_date,
        "total_tasks": len(tasks),
        "total_time_minutes": total_time,
        "total_time_hours": round(total_time / 60, 2),
        "tasks_summary": tasks_summary
    }


@router.delete('/{checkin_id}', status_code=204)
def delete_checkin(checkin_id: int, db: Session = Depends(get_db)):
    """Delete a check-in"""
    checkin = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()

    if not checkin:
        raise HTTPException(status_code=404, detail=f"CheckIn {checkin_id} not found")

    db.delete(checkin)
    db.commit()

    return None
