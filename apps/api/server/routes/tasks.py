from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
import json

from server.db.session import SessionLocal
from server.db.models import Task, Profile, Paper, Roadmap

router = APIRouter(prefix='/tasks')

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schemas
class TaskCreate(BaseModel):
    title: str
    date: str  # Format: YYYY-MM-DD
    kind: str = "theory"  # "theory" or "computation"
    override_theory_ratio: float = -1.0
    details: dict = {}

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None  # "todo", "in_progress", "done"
    kind: Optional[str] = None
    override_theory_ratio: Optional[float] = None
    details: Optional[dict] = None

class TaskResponse(BaseModel):
    id: int
    date: str
    title: str
    status: str
    kind: str
    override_theory_ratio: float
    details: dict

    class Config:
        from_attributes = True

    @classmethod
    def from_db(cls, task: Task):
        details = json.loads(task.json) if task.json else {}
        return cls(
            id=task.id,
            date=task.date,
            title=task.title,
            status=task.status,
            kind=task.kind,
            override_theory_ratio=task.override_theory_ratio,
            details=details
        )

# GET /tasks - Get all tasks (optionally filtered by date)
@router.get('', response_model=list[TaskResponse])
def get_tasks(
    date_filter: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """Get all tasks, optionally filtered by date and status"""
    query = db.query(Task)

    if date_filter:
        query = query.filter(Task.date == date_filter)
    if status:
        query = query.filter(Task.status == status)

    tasks = query.order_by(Task.date.desc()).all()
    return [TaskResponse.from_db(task) for task in tasks]

# GET /tasks/today - Get today's tasks
@router.get('/today', response_model=list[TaskResponse])
def get_today_tasks(db: Session = Depends(get_db)):
    """Get today's tasks"""
    today = date.today().isoformat()
    tasks = db.query(Task).filter(Task.date == today).all()
    return [TaskResponse.from_db(task) for task in tasks]

# POST /tasks/today - Generate today's tasks
@router.post('/today', response_model=list[TaskResponse])
def generate_today_tasks(db: Session = Depends(get_db)):
    """Generate tasks for today based on roadmap and profile"""
    today = date.today().isoformat()

    # Check if today's tasks already exist
    existing = db.query(Task).filter(Task.date == today).first()
    if existing:
        raise HTTPException(status_code=400, detail="Today's tasks already exist. Use DELETE /tasks/today to reset.")

    # Get profile to determine theory/computation ratio
    profile = db.query(Profile).first()
    theory_ratio = 0.6  # default
    if profile:
        profile_data = json.loads(profile.json)
        theory_ratio = profile_data.get('theory_ratio', 0.6)

    # Get focus papers for context
    focus_papers = db.query(Paper).filter(Paper.focus == True).all()

    # Get roadmap for task suggestions
    roadmap = db.query(Roadmap).first()
    roadmap_data = {}
    if roadmap:
        roadmap_data = json.loads(roadmap.json)

    # Generate tasks (simple implementation - can be enhanced with AI)
    tasks_to_create = []

    # Theory task
    if theory_ratio > 0:
        theory_task = {
            'title': 'Read and analyze focus papers',
            'kind': 'theory',
            'details': {
                'description': 'Review focus papers and take notes on key concepts',
                'papers': [{'id': p.id, 'title': p.title, 'pages': p.focus_pages} for p in focus_papers],
                'dod': ['Read specified pages', 'Take structured notes', 'Identify key theorems or concepts']
            }
        }
        tasks_to_create.append(theory_task)

    # Computation task
    if theory_ratio < 1.0:
        comp_task = {
            'title': 'Work on computational experiments',
            'kind': 'computation',
            'details': {
                'description': 'Implement or run computational experiments related to research',
                'dod': ['Set up experiment', 'Run computations', 'Document results']
            }
        }
        tasks_to_create.append(comp_task)

    # Create tasks in database
    created_tasks = []
    for task_data in tasks_to_create:
        task = Task(
            date=today,
            title=task_data['title'],
            status='todo',
            kind=task_data['kind'],
            override_theory_ratio=-1.0,
            json=json.dumps(task_data['details'])
        )
        db.add(task)
        created_tasks.append(task)

    db.commit()

    # Refresh all tasks
    for task in created_tasks:
        db.refresh(task)

    return [TaskResponse.from_db(task) for task in created_tasks]

# DELETE /tasks/today - Reset today's tasks
@router.delete('/today')
def reset_today_tasks(db: Session = Depends(get_db)):
    """Delete all tasks for today"""
    today = date.today().isoformat()
    deleted = db.query(Task).filter(Task.date == today).delete()
    db.commit()
    return {"message": f"Deleted {deleted} tasks for today"}

# POST /tasks - Create a new task
@router.post('', response_model=TaskResponse)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    task = Task(
        date=task_data.date,
        title=task_data.title,
        status='todo',
        kind=task_data.kind,
        override_theory_ratio=task_data.override_theory_ratio,
        json=json.dumps(task_data.details)
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskResponse.from_db(task)

# GET /tasks/{task_id} - Get a specific task
@router.get('/{task_id}', response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific task by ID"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse.from_db(task)

# PATCH /tasks/{task_id} - Update a task
@router.patch('/{task_id}', response_model=TaskResponse)
def update_task(task_id: int, update: TaskUpdate, db: Session = Depends(get_db)):
    """Update a task's status, title, or details"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if update.title is not None:
        task.title = update.title
    if update.status is not None:
        if update.status not in ['todo', 'in_progress', 'done']:
            raise HTTPException(status_code=400, detail="Invalid status. Must be 'todo', 'in_progress', or 'done'")
        task.status = update.status
    if update.kind is not None:
        if update.kind not in ['theory', 'computation']:
            raise HTTPException(status_code=400, detail="Invalid kind. Must be 'theory' or 'computation'")
        task.kind = update.kind
    if update.override_theory_ratio is not None:
        task.override_theory_ratio = update.override_theory_ratio
    if update.details is not None:
        task.json = json.dumps(update.details)

    db.commit()
    db.refresh(task)
    return TaskResponse.from_db(task)

# DELETE /tasks/{task_id} - Delete a task
@router.delete('/{task_id}')
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a specific task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
