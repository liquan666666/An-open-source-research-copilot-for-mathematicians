from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from server.db.session import get_db
from server.db.models import Task, Roadmap, Paper
from server.schemas import TaskCreate, TaskUpdate, TaskResponse
from datetime import datetime, date
from typing import List
import json
import random

router = APIRouter(prefix='/tasks', tags=['tasks'])


def generate_daily_tasks(roadmap_data: dict, target_date: str, theory_ratio: float) -> List[dict]:
    """
    Generate daily tasks based on the current roadmap milestone.
    This is a simplified implementation. In production, this could:
    - Use AI/LLM to generate more context-aware tasks
    - Consider previous task completion history
    - Adapt difficulty based on researcher progress
    """
    milestones = roadmap_data.get("milestones", [])
    if not milestones:
        return []

    # Calculate which week we're in
    start_date = datetime.fromisoformat(roadmap_data.get("start_date", datetime.now().isoformat()))
    current_date = datetime.fromisoformat(target_date)
    weeks_elapsed = (current_date - start_date).days // 7 + 1

    # Find current milestone
    current_milestone = None
    for milestone in milestones:
        if milestone["week_start"] <= weeks_elapsed <= milestone["week_end"]:
            current_milestone = milestone
            break

    if not current_milestone:
        # Default to last milestone if we're past the end
        current_milestone = milestones[-1]

    # Generate tasks based on milestone phase
    tasks = []

    # Determine number of theory vs computation tasks
    num_tasks = 3  # Total tasks per day
    num_theory_tasks = round(num_tasks * theory_ratio)
    num_comp_tasks = num_tasks - num_theory_tasks

    phase = current_milestone.get("phase", "")
    objectives = current_milestone.get("objectives", [])

    # Generate theory tasks
    for i in range(num_theory_tasks):
        if i < len(objectives):
            base_objective = objectives[i]
        else:
            base_objective = objectives[0] if objectives else f"Work on {phase}"

        tasks.append({
            "title": f"Theory: {base_objective[:50]}{'...' if len(base_objective) > 50 else ''}",
            "kind": "theory",
            "description": base_objective,
            "definition_of_done": "Clear progress made and documented",
            "related_papers": [],
            "estimated_hours": 2.0
        })

    # Generate computation tasks
    for i in range(num_comp_tasks):
        if phase == "Literature Review":
            task_title = "Read and annotate key papers"
            description = "Review papers related to research topic, take notes on key theorems and methods"
            dod = "Notes and annotations completed for at least 2 papers"
        elif phase == "Theoretical Framework":
            task_title = "Verify theoretical calculations"
            description = "Use computational tools to verify theoretical predictions"
            dod = "Calculations verified and documented"
        elif phase == "Computational Exploration":
            task_title = "Implement and test algorithms"
            description = "Code and test computational methods"
            dod = "Working implementation with test cases"
        else:
            task_title = "Prepare visualizations and examples"
            description = "Create figures and computational examples for paper"
            dod = "At least 2 figures or examples completed"

        tasks.append({
            "title": task_title,
            "kind": "computation",
            "description": description,
            "definition_of_done": dod,
            "related_papers": [],
            "estimated_hours": 2.0
        })

    return tasks


@router.post('/generate')
def generate_tasks(
    target_date: str = None,
    theory_ratio: float = None,
    db: Session = Depends(get_db)
):
    """
    Generate tasks for a specific date based on the current roadmap.
    If target_date is not provided, uses today's date.
    If theory_ratio is not provided, uses the roadmap's default ratio.
    """
    # Get current roadmap
    roadmap = db.query(Roadmap).order_by(Roadmap.id.desc()).first()

    if not roadmap:
        raise HTTPException(status_code=404, detail="No roadmap found. Please create a roadmap first.")

    roadmap_data = json.loads(roadmap.json)

    # Use provided date or today's date
    if target_date is None:
        target_date = date.today().isoformat()

    # Use provided theory ratio or roadmap default
    if theory_ratio is None:
        theory_ratio = roadmap_data.get("theory_ratio", 0.5)

    # Generate tasks
    try:
        tasks = generate_daily_tasks(roadmap_data, target_date, theory_ratio)

        # Save tasks to database
        saved_tasks = []
        for task_data in tasks:
            db_task = Task(
                date=target_date,
                title=task_data["title"],
                status="todo",
                kind=task_data["kind"],
                override_theory_ratio=theory_ratio if theory_ratio != roadmap_data.get("theory_ratio", 0.5) else -1.0,
                json=json.dumps(task_data)
            )
            db.add(db_task)
            db.commit()
            db.refresh(db_task)

            task_json = json.loads(db_task.json)
            saved_tasks.append({
                "id": db_task.id,
                "date": db_task.date,
                "title": db_task.title,
                "status": db_task.status,
                "kind": db_task.kind,
                "description": task_json.get("description", ""),
                "definition_of_done": task_json.get("definition_of_done", ""),
                "related_papers": task_json.get("related_papers", []),
                "estimated_hours": task_json.get("estimated_hours", 2.0)
            })

        return {"tasks": saved_tasks, "count": len(saved_tasks), "date": target_date}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating tasks: {str(e)}")


@router.get('/today')
def get_today_tasks(db: Session = Depends(get_db)):
    """Get all tasks for today"""
    today = date.today().isoformat()
    tasks = db.query(Task).filter(Task.date == today).all()

    result = []
    for task in tasks:
        task_json = json.loads(task.json)
        result.append({
            "id": task.id,
            "date": task.date,
            "title": task.title,
            "status": task.status,
            "kind": task.kind,
            "description": task_json.get("description", ""),
            "definition_of_done": task_json.get("definition_of_done", ""),
            "related_papers": task_json.get("related_papers", []),
            "estimated_hours": task_json.get("estimated_hours", 2.0)
        })

    return {"tasks": result, "count": len(result), "date": today}


@router.get('/date/{target_date}')
def get_tasks_by_date(target_date: str, db: Session = Depends(get_db)):
    """Get all tasks for a specific date (format: YYYY-MM-DD)"""
    tasks = db.query(Task).filter(Task.date == target_date).all()

    result = []
    for task in tasks:
        task_json = json.loads(task.json)
        result.append({
            "id": task.id,
            "date": task.date,
            "title": task.title,
            "status": task.status,
            "kind": task.kind,
            "description": task_json.get("description", ""),
            "definition_of_done": task_json.get("definition_of_done", ""),
            "related_papers": task_json.get("related_papers", []),
            "estimated_hours": task_json.get("estimated_hours", 2.0)
        })

    return {"tasks": result, "count": len(result), "date": target_date}


@router.put('/{task_id}')
def update_task(task_id: int, update: TaskUpdate, db: Session = Depends(get_db)):
    """Update task status or settings"""
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")

    if update.status is not None:
        valid_statuses = ["todo", "in_progress", "done", "blocked"]
        if update.status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        task.status = update.status

    if update.override_theory_ratio is not None:
        task.override_theory_ratio = update.override_theory_ratio

    db.commit()
    db.refresh(task)

    task_json = json.loads(task.json)
    return {
        "id": task.id,
        "date": task.date,
        "title": task.title,
        "status": task.status,
        "kind": task.kind,
        "description": task_json.get("description", ""),
        "definition_of_done": task_json.get("definition_of_done", ""),
        "related_papers": task_json.get("related_papers", []),
        "estimated_hours": task_json.get("estimated_hours", 2.0)
    }


@router.delete('/today', status_code=204)
def clear_today_tasks(db: Session = Depends(get_db)):
    """Clear all tasks for today"""
    today = date.today().isoformat()
    db.query(Task).filter(Task.date == today).delete()
    db.commit()
    return None


@router.delete('/{task_id}', status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a specific task"""
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")

    db.delete(task)
    db.commit()

    return None
