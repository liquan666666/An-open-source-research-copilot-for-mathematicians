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

# Helper function to analyze user history
def analyze_user_history(db: Session):
    """Analyze user's historical task completion patterns"""
    # Get last 30 days of tasks
    thirty_days_ago = (date.today() - timedelta(days=30)).isoformat()
    recent_tasks = db.query(Task).filter(Task.date >= thirty_days_ago).all()

    if not recent_tasks:
        return {
            'avg_theory_ratio': 0.6,
            'avg_completion_rate': 0.0,
            'preferred_task_type': 'theory',
            'avg_tasks_per_day': 2,
            'patterns': []
        }

    # Calculate actual theory/computation ratio from history
    theory_count = sum(1 for t in recent_tasks if t.kind == 'theory')
    total_count = len(recent_tasks)
    actual_theory_ratio = theory_count / total_count if total_count > 0 else 0.6

    # Calculate completion rate
    completed_count = sum(1 for t in recent_tasks if t.status == 'done')
    completion_rate = completed_count / total_count if total_count > 0 else 0.0

    # Find preferred task type based on completion
    theory_completed = sum(1 for t in recent_tasks if t.kind == 'theory' and t.status == 'done')
    comp_completed = sum(1 for t in recent_tasks if t.kind == 'computation' and t.status == 'done')
    theory_total = sum(1 for t in recent_tasks if t.kind == 'theory')
    comp_total = sum(1 for t in recent_tasks if t.kind == 'computation')

    theory_success = theory_completed / theory_total if theory_total > 0 else 0
    comp_success = comp_completed / comp_total if comp_total > 0 else 0

    preferred_type = 'theory' if theory_success >= comp_success else 'computation'

    # Calculate average tasks per day
    unique_dates = set(t.date for t in recent_tasks)
    avg_tasks_per_day = len(recent_tasks) / len(unique_dates) if unique_dates else 2

    return {
        'avg_theory_ratio': actual_theory_ratio,
        'avg_completion_rate': completion_rate,
        'preferred_task_type': preferred_type,
        'avg_tasks_per_day': min(int(avg_tasks_per_day) + 1, 4),  # Cap at 4 tasks
        'theory_success_rate': theory_success,
        'comp_success_rate': comp_success
    }

# POST /tasks/today - Generate today's tasks with intelligent recommendations
@router.post('/today', response_model=list[TaskResponse])
def generate_today_tasks(db: Session = Depends(get_db)):
    """Generate intelligent tasks for today based on history, roadmap, and profile"""
    today = date.today().isoformat()

    # Check if today's tasks already exist
    existing = db.query(Task).filter(Task.date == today).first()
    if existing:
        raise HTTPException(status_code=400, detail="Today's tasks already exist. Use DELETE /tasks/today to reset.")

    # Analyze user history for intelligent recommendations
    history = analyze_user_history(db)

    # Get profile
    profile = db.query(Profile).first()
    target_theory_ratio = 0.6  # default
    if profile:
        profile_data = json.loads(profile.json)
        target_theory_ratio = profile_data.get('theory_ratio', 0.6)

    # Adjust ratio based on historical performance
    # If user consistently completes one type better, suggest slightly more of that type
    adjusted_ratio = target_theory_ratio
    if history['theory_success_rate'] > history['comp_success_rate'] + 0.2:
        adjusted_ratio = min(target_theory_ratio + 0.1, 1.0)
    elif history['comp_success_rate'] > history['theory_success_rate'] + 0.2:
        adjusted_ratio = max(target_theory_ratio - 0.1, 0.0)

    # Get focus papers
    focus_papers = db.query(Paper).filter(Paper.focus == True).all()

    # Get roadmap and find current week's goals
    roadmap = db.query(Roadmap).first()
    current_week_goals = []
    if roadmap:
        roadmap_data = json.loads(roadmap.json)
        # Find current week based on start date
        start_date_obj = datetime.fromisoformat(roadmap_data['start_date'])
        days_since_start = (datetime.now().date() - start_date_obj.date()).days
        current_week = (days_since_start // 7) + 1

        for week_plan in roadmap_data.get('weekly_plans', []):
            if week_plan['week'] == current_week:
                current_week_goals = week_plan.get('goals', [])
                break

    # Generate tasks based on history and roadmap
    tasks_to_create = []
    num_tasks = history['avg_tasks_per_day']

    # Calculate how many theory vs computation tasks
    num_theory_tasks = round(num_tasks * adjusted_ratio)
    num_comp_tasks = num_tasks - num_theory_tasks

    # Generate theory tasks
    for i in range(num_theory_tasks):
        if i == 0 and focus_papers:
            # Primary theory task: focus papers
            theory_task = {
                'title': 'Read and analyze focus papers',
                'kind': 'theory',
                'details': {
                    'description': 'Review focus papers and take notes on key concepts',
                    'papers': [{'id': p.id, 'title': p.title, 'pages': p.focus_pages} for p in focus_papers[:2]],
                    'dod': ['Read specified pages', 'Take structured notes', 'Identify key theorems or concepts'],
                    'roadmap_goals': current_week_goals[:2] if current_week_goals else []
                }
            }
        else:
            # Secondary theory tasks based on roadmap
            theory_task = {
                'title': current_week_goals[i] if i < len(current_week_goals) else 'Review theoretical concepts',
                'kind': 'theory',
                'details': {
                    'description': 'Study theoretical aspects of your research topic',
                    'dod': ['Review key definitions', 'Work through examples', 'Connect to research question'],
                    'roadmap_goals': [current_week_goals[i]] if i < len(current_week_goals) else []
                }
            }
        tasks_to_create.append(theory_task)

    # Generate computation tasks
    for i in range(num_comp_tasks):
        if i == 0:
            comp_task = {
                'title': 'Work on computational experiments',
                'kind': 'computation',
                'details': {
                    'description': 'Implement or run computational experiments related to research',
                    'dod': ['Set up experiment environment', 'Run computations', 'Document results'],
                    'roadmap_goals': [g for g in current_week_goals if 'computation' in g.lower() or 'implement' in g.lower()][:2]
                }
            }
        else:
            comp_task = {
                'title': 'Code review and testing',
                'kind': 'computation',
                'details': {
                    'description': 'Review and test existing computational code',
                    'dod': ['Review code quality', 'Run test cases', 'Document edge cases']
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
