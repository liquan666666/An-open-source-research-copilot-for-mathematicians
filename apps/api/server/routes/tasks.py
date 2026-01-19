"""Task management routes."""
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from server.db.models import Task, User
from server.auth.dependencies import get_current_user, get_db


router = APIRouter(prefix="/tasks", tags=["tasks"])


# Pydantic models
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=256)
    description: Optional[str] = None
    priority: str = Field(default="medium", pattern="^(high|medium|low)$")
    status: str = Field(default="pending", pattern="^(pending|in_progress|completed)$")
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=256)
    description: Optional[str] = None
    priority: Optional[str] = Field(None, pattern="^(high|medium|low)$")
    status: Optional[str] = Field(None, pattern="^(pending|in_progress|completed)$")
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    priority: str
    status: str
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskStats(BaseModel):
    total: int
    pending: int
    in_progress: int
    completed: int
    high_priority: int
    medium_priority: int
    low_priority: int
    overdue: int


@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    status: Optional[str] = Query(None, pattern="^(pending|in_progress|completed)$"),
    priority: Optional[str] = Query(None, pattern="^(high|medium|low)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all tasks for the current user.

    Supports filtering by status and priority.
    """
    query = db.query(Task).filter(Task.user_id == current_user.id)

    # Apply filters
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)

    # Order by: high priority first, then by creation date
    priority_order = {
        'high': 1,
        'medium': 2,
        'low': 3
    }

    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()

    # Sort in Python to respect priority order
    tasks.sort(key=lambda t: (
        priority_order.get(t.priority, 4),
        t.status != 'pending',  # Pending tasks first
        -t.created_at.timestamp()  # Newer tasks first
    ))

    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new task.
    """
    new_task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        status=task_data.status,
        due_date=task_data.due_date
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@router.get("/stats", response_model=TaskStats)
async def get_task_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get task statistics for the current user.
    """
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()

    total = len(tasks)
    pending = sum(1 for t in tasks if t.status == "pending")
    in_progress = sum(1 for t in tasks if t.status == "in_progress")
    completed = sum(1 for t in tasks if t.status == "completed")

    high_priority = sum(1 for t in tasks if t.priority == "high")
    medium_priority = sum(1 for t in tasks if t.priority == "medium")
    low_priority = sum(1 for t in tasks if t.priority == "low")

    # Count overdue tasks (not completed and past due date)
    now = datetime.utcnow()
    overdue = sum(
        1 for t in tasks
        if t.status != "completed" and t.due_date and t.due_date < now
    )

    return TaskStats(
        total=total,
        pending=pending,
        in_progress=in_progress,
        completed=completed,
        high_priority=high_priority,
        medium_priority=medium_priority,
        low_priority=low_priority,
        overdue=overdue
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific task by ID.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a task.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update fields
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    # Update timestamp
    task.updated_at = datetime.utcnow()

    # If status changed to completed, set completed_at
    if task_data.status == "completed" and task.completed_at is None:
        task.completed_at = datetime.utcnow()
    elif task_data.status and task_data.status != "completed":
        task.completed_at = None

    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a task.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return None


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a task as completed.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.status = "completed"
    task.completed_at = datetime.utcnow()
    task.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(task)

    return task


@router.patch("/{task_id}/uncomplete", response_model=TaskResponse)
async def uncomplete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a task as not completed.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.status = "pending"
    task.completed_at = None
    task.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(task)

    return task


# Legacy endpoints for backward compatibility
@router.post('/today')
def today():
    """Legacy endpoint - returns empty list."""
    return []


@router.delete('/today')
def reset():
    """Legacy endpoint - returns empty dict."""
    return {}
