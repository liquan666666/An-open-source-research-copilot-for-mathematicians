from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from server.db.session import get_db
from server.db.models import Roadmap, Profile
from server.schemas import RoadmapCreate, RoadmapResponse
from datetime import datetime, timedelta
import json

router = APIRouter(prefix='/roadmap', tags=['roadmap'])


def generate_roadmap(topic: str, duration_weeks: int, theory_ratio: float, profile_data: dict) -> dict:
    """
    Generate a research roadmap with milestones.
    This is a simplified implementation. In production, this could:
    - Use AI/LLM to generate more sophisticated roadmaps
    - Analyze existing literature to suggest concrete steps
    - Consider researcher's background and preferences
    """
    milestones = []
    start_date = datetime.now()

    # Calculate theory vs computation weeks
    theory_weeks = int(duration_weeks * theory_ratio)
    computation_weeks = duration_weeks - theory_weeks

    # Phase 1: Literature Review (first 20-30% of duration)
    review_weeks = max(1, duration_weeks // 4)
    milestones.append({
        "phase": "Literature Review",
        "week_start": 1,
        "week_end": review_weeks,
        "objectives": [
            f"Survey recent papers on {topic}",
            "Identify key definitions and theorems",
            "Review mathematical background and prerequisites",
            "Build bibliography of core references"
        ],
        "deliverables": [
            "Annotated bibliography",
            "Summary of state-of-the-art"
        ],
        "type": "theory"
    })

    # Phase 2: Theory Development
    if theory_weeks > 0:
        theory_start = review_weeks + 1
        theory_end = theory_start + max(1, theory_weeks - review_weeks)

        milestones.append({
            "phase": "Theoretical Framework",
            "week_start": theory_start,
            "week_end": min(theory_end, duration_weeks),
            "objectives": [
                f"Develop theoretical framework for {topic}",
                "Formulate key definitions and propositions",
                "Prove preliminary results",
                "Identify conjectures and open problems"
            ],
            "deliverables": [
                "Draft of theoretical results",
                "Proof sketches and formal proofs"
            ],
            "type": "theory"
        })

    # Phase 3: Computation/Implementation
    if computation_weeks > 0:
        comp_start = theory_end + 1 if theory_weeks > 0 else review_weeks + 1
        comp_end = comp_start + computation_weeks

        milestones.append({
            "phase": "Computational Exploration",
            "week_start": comp_start,
            "week_end": min(comp_end, duration_weeks),
            "objectives": [
                f"Implement computational methods for {topic}",
                "Run numerical experiments and simulations",
                "Validate theoretical predictions",
                "Analyze computational results"
            ],
            "deliverables": [
                "Working code implementation",
                "Experimental results and visualizations"
            ],
            "type": "computation"
        })

    # Phase 4: Synthesis and Writing (last 20% of duration)
    writing_weeks = max(1, duration_weeks // 5)
    writing_start = duration_weeks - writing_weeks + 1

    milestones.append({
        "phase": "Synthesis and Writing",
        "week_start": writing_start,
        "week_end": duration_weeks,
        "objectives": [
            "Synthesize theoretical and computational results",
            "Write research paper or report",
            "Prepare presentations and visualizations",
            "Refine proofs and arguments"
        ],
        "deliverables": [
            "Draft research paper",
            "Presentation slides",
            "Final report"
        ],
        "type": "mixed"
    })

    roadmap_data = {
        "topic": topic,
        "duration_weeks": duration_weeks,
        "theory_ratio": theory_ratio,
        "start_date": start_date.isoformat(),
        "end_date": (start_date + timedelta(weeks=duration_weeks)).isoformat(),
        "milestones": milestones,
        "profile": {
            "name": profile_data.get("name", ""),
            "msc_codes": profile_data.get("msc_codes", []),
            "keywords": profile_data.get("keywords", [])
        }
    }

    return roadmap_data


@router.post('', status_code=201)
def create_roadmap(request: RoadmapCreate, db: Session = Depends(get_db)):
    """Create a new research roadmap"""
    # Get profile
    profile = db.query(Profile).filter(Profile.id == request.profile_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail=f"Profile {request.profile_id} not found")

    profile_data = json.loads(profile.json)

    # Generate roadmap
    try:
        roadmap_data = generate_roadmap(
            request.topic,
            request.duration_weeks,
            request.theory_ratio,
            profile_data
        )

        # Save to database
        db_roadmap = Roadmap(json=json.dumps(roadmap_data))
        db.add(db_roadmap)
        db.commit()
        db.refresh(db_roadmap)

        return {
            "id": db_roadmap.id,
            "topic": request.topic,
            "milestones": roadmap_data["milestones"],
            "created_at": roadmap_data["start_date"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating roadmap: {str(e)}")


@router.get('/current')
def get_current_roadmap(db: Session = Depends(get_db)):
    """Get the most recent roadmap"""
    roadmap = db.query(Roadmap).order_by(Roadmap.id.desc()).first()

    if not roadmap:
        raise HTTPException(status_code=404, detail="No roadmap found. Please create one first.")

    roadmap_data = json.loads(roadmap.json)

    return {
        "id": roadmap.id,
        "topic": roadmap_data.get("topic", ""),
        "duration_weeks": roadmap_data.get("duration_weeks", 0),
        "theory_ratio": roadmap_data.get("theory_ratio", 0.5),
        "start_date": roadmap_data.get("start_date", ""),
        "end_date": roadmap_data.get("end_date", ""),
        "milestones": roadmap_data.get("milestones", []),
        "profile": roadmap_data.get("profile", {})
    }


@router.get('/{roadmap_id}')
def get_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    """Get a specific roadmap by ID"""
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()

    if not roadmap:
        raise HTTPException(status_code=404, detail=f"Roadmap {roadmap_id} not found")

    roadmap_data = json.loads(roadmap.json)

    return {
        "id": roadmap.id,
        "topic": roadmap_data.get("topic", ""),
        "duration_weeks": roadmap_data.get("duration_weeks", 0),
        "theory_ratio": roadmap_data.get("theory_ratio", 0.5),
        "start_date": roadmap_data.get("start_date", ""),
        "end_date": roadmap_data.get("end_date", ""),
        "milestones": roadmap_data.get("milestones", []),
        "profile": roadmap_data.get("profile", {})
    }


@router.delete('/{roadmap_id}', status_code=204)
def delete_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    """Delete a roadmap"""
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()

    if not roadmap:
        raise HTTPException(status_code=404, detail=f"Roadmap {roadmap_id} not found")

    db.delete(roadmap)
    db.commit()

    return None
