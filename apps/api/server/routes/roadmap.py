from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import json

from server.db.session import SessionLocal
from server.db.models import Roadmap, Profile, Paper

router = APIRouter(prefix='/roadmap')

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schemas
class Milestone(BaseModel):
    week: int
    title: str
    description: str
    deliverables: list[str]
    theory_hours: int
    computation_hours: int

class WeekPlan(BaseModel):
    week: int
    start_date: str
    end_date: str
    goals: list[str]
    papers_to_read: list[str] = []
    experiments_to_run: list[str] = []
    status: str = "upcoming"  # "upcoming", "in_progress", "completed"

class RoadmapData(BaseModel):
    topic: str
    description: str
    start_date: str
    duration_weeks: int
    theory_computation_ratio: float
    milestones: list[Milestone]
    weekly_plans: list[WeekPlan]

class RoadmapResponse(BaseModel):
    id: int
    data: RoadmapData

class RoadmapCreate(BaseModel):
    topic: str
    description: str
    duration_weeks: int = 8
    theory_computation_ratio: Optional[float] = None

# Generate weekly plans from milestones
def generate_weekly_plans(start_date_str: str, duration_weeks: int, milestones: list[Milestone]) -> list[WeekPlan]:
    """Generate weekly plans based on milestones"""
    start_date = datetime.fromisoformat(start_date_str)
    weekly_plans = []

    for week in range(1, duration_weeks + 1):
        week_start = start_date + timedelta(weeks=week - 1)
        week_end = week_start + timedelta(days=6)

        # Find milestone for this week
        milestone = next((m for m in milestones if m.week == week), None)

        goals = []
        papers_to_read = []
        experiments_to_run = []

        if milestone:
            goals = [milestone.title] + milestone.deliverables
            # Distribute work based on theory/computation hours
            if milestone.theory_hours > 0:
                papers_to_read.append(f"Allocate {milestone.theory_hours}h for theoretical study")
            if milestone.computation_hours > 0:
                experiments_to_run.append(f"Allocate {milestone.computation_hours}h for computational work")
        else:
            goals = [f"Continue work on ongoing objectives"]

        weekly_plans.append(WeekPlan(
            week=week,
            start_date=week_start.date().isoformat(),
            end_date=week_end.date().isoformat(),
            goals=goals,
            papers_to_read=papers_to_read,
            experiments_to_run=experiments_to_run,
            status="upcoming"
        ))

    # Mark first week as in_progress
    if weekly_plans:
        weekly_plans[0].status = "in_progress"

    return weekly_plans

# Generate milestones based on topic and duration
def generate_milestones(topic: str, duration_weeks: int, theory_ratio: float) -> list[Milestone]:
    """Generate research milestones for the roadmap"""
    milestones = []

    # Calculate hours per week (assuming 20 hours/week of research)
    hours_per_week = 20
    theory_hours = int(hours_per_week * theory_ratio)
    comp_hours = hours_per_week - theory_hours

    # Phase 1: Literature Review & Foundation (first 25% of timeline)
    phase1_weeks = max(1, duration_weeks // 4)
    milestones.append(Milestone(
        week=phase1_weeks,
        title="Complete Literature Review",
        description=f"Review key papers and establish theoretical foundation for {topic}",
        deliverables=[
            "Summary of key papers",
            "Identification of research gap",
            "List of relevant techniques and methods"
        ],
        theory_hours=theory_hours + 5,
        computation_hours=comp_hours - 5
    ))

    # Phase 2: Method Development (25%-50%)
    phase2_weeks = duration_weeks // 2
    milestones.append(Milestone(
        week=phase2_weeks,
        title="Develop Research Methodology",
        description="Design and validate the research approach",
        deliverables=[
            "Formal problem statement",
            "Proposed methodology",
            "Initial theoretical results or algorithm design"
        ],
        theory_hours=theory_hours,
        computation_hours=comp_hours
    ))

    # Phase 3: Implementation & Experiments (50%-75%)
    phase3_weeks = (duration_weeks * 3) // 4
    milestones.append(Milestone(
        week=phase3_weeks,
        title="Execute Research Plan",
        description="Implement methods and conduct experiments/proofs",
        deliverables=[
            "Implementation of methods",
            "Experimental results or theoretical proofs",
            "Analysis of findings"
        ],
        theory_hours=theory_hours - 5,
        computation_hours=comp_hours + 5
    ))

    # Phase 4: Write-up & Refinement (75%-100%)
    milestones.append(Milestone(
        week=duration_weeks,
        title="Complete Research Documentation",
        description="Write up results and prepare for presentation/publication",
        deliverables=[
            "Draft paper or report",
            "Polished results and visualizations",
            "Future work and conclusions"
        ],
        theory_hours=theory_hours,
        computation_hours=comp_hours
    ))

    return milestones

# POST /roadmap - Create a new roadmap
@router.post('', response_model=RoadmapResponse)
def create_roadmap(roadmap_req: RoadmapCreate, db: Session = Depends(get_db)):
    """Create a new research roadmap"""

    # Delete existing roadmap (single user system for now)
    existing = db.query(Roadmap).all()
    for r in existing:
        db.delete(r)

    # Get user profile for theory/computation ratio
    profile = db.query(Profile).first()
    theory_ratio = 0.6  # default
    if profile:
        profile_data = json.loads(profile.json)
        theory_ratio = profile_data.get('theory_ratio', 0.6)

    # Override with user-specified ratio if provided
    if roadmap_req.theory_computation_ratio is not None:
        theory_ratio = roadmap_req.theory_computation_ratio

    # Generate milestones
    start_date = datetime.now().date().isoformat()
    milestones = generate_milestones(
        roadmap_req.topic,
        roadmap_req.duration_weeks,
        theory_ratio
    )

    # Generate weekly plans
    weekly_plans = generate_weekly_plans(
        start_date,
        roadmap_req.duration_weeks,
        milestones
    )

    # Create roadmap data
    roadmap_data = RoadmapData(
        topic=roadmap_req.topic,
        description=roadmap_req.description,
        start_date=start_date,
        duration_weeks=roadmap_req.duration_weeks,
        theory_computation_ratio=theory_ratio,
        milestones=milestones,
        weekly_plans=weekly_plans
    )

    # Save to database
    roadmap = Roadmap(json=roadmap_data.model_dump_json())
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    return RoadmapResponse(id=roadmap.id, data=roadmap_data)

# GET /roadmap/current - Get the current roadmap
@router.get('/current')
def get_current_roadmap(db: Session = Depends(get_db)):
    """Get the current research roadmap"""
    roadmap = db.query(Roadmap).first()
    if not roadmap:
        return None

    data = json.loads(roadmap.json)
    return RoadmapResponse(id=roadmap.id, data=RoadmapData(**data))

# PATCH /roadmap/week/{week_num} - Update week status
@router.patch('/week/{week_num}')
def update_week_status(week_num: int, status: str, db: Session = Depends(get_db)):
    """Update the status of a specific week"""
    roadmap = db.query(Roadmap).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="No roadmap found")

    if status not in ['upcoming', 'in_progress', 'completed']:
        raise HTTPException(status_code=400, detail="Invalid status")

    data = json.loads(roadmap.json)
    roadmap_data = RoadmapData(**data)

    # Update week status
    for week_plan in roadmap_data.weekly_plans:
        if week_plan.week == week_num:
            week_plan.status = status
            break
    else:
        raise HTTPException(status_code=404, detail=f"Week {week_num} not found")

    # Save updated roadmap
    roadmap.json = roadmap_data.model_dump_json()
    db.commit()

    return {"message": f"Week {week_num} status updated to {status}"}

# GET /roadmap/progress - Get overall progress
@router.get('/progress')
def get_roadmap_progress(db: Session = Depends(get_db)):
    """Get overall roadmap progress statistics"""
    roadmap = db.query(Roadmap).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="No roadmap found")

    data = json.loads(roadmap.json)
    roadmap_data = RoadmapData(**data)

    total_weeks = len(roadmap_data.weekly_plans)
    completed_weeks = sum(1 for w in roadmap_data.weekly_plans if w.status == 'completed')
    in_progress_weeks = sum(1 for w in roadmap_data.weekly_plans if w.status == 'in_progress')

    completed_milestones = 0
    for milestone in roadmap_data.milestones:
        week_plan = next((w for w in roadmap_data.weekly_plans if w.week == milestone.week), None)
        if week_plan and week_plan.status == 'completed':
            completed_milestones += 1

    progress_percentage = (completed_weeks / total_weeks * 100) if total_weeks > 0 else 0

    return {
        'total_weeks': total_weeks,
        'completed_weeks': completed_weeks,
        'in_progress_weeks': in_progress_weeks,
        'progress_percentage': round(progress_percentage, 1),
        'total_milestones': len(roadmap_data.milestones),
        'completed_milestones': completed_milestones,
        'current_week': completed_weeks + in_progress_weeks,
        'start_date': roadmap_data.start_date,
        'topic': roadmap_data.topic
    }

# DELETE /roadmap - Delete the current roadmap
@router.delete('')
def delete_roadmap(db: Session = Depends(get_db)):
    """Delete the current research roadmap"""
    roadmap = db.query(Roadmap).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="No roadmap found")

    db.delete(roadmap)
    db.commit()
    return {"message": "Roadmap deleted successfully"}
