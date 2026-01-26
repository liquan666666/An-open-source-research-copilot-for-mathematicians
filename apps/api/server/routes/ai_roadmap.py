"""AI-powered learning roadmap generation."""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from server.db.models import User, ResearchInterest, Roadmap, RoadmapStage, RoadmapItem
from server.auth.dependencies import get_current_user, get_db
from server.services.ai_service import ai_service


router = APIRouter(prefix="/ai/roadmap", tags=["ai-roadmap"])


class RoadmapItemData(BaseModel):
    """Single learning item in a roadmap."""
    title: str
    description: str
    estimated_hours: int
    resources: List[str]


class RoadmapStageData(BaseModel):
    """A stage in the learning roadmap."""
    stage_number: int
    title: str
    description: str
    start_week: int
    end_week: int
    items: List[RoadmapItemData]


class GeneratedRoadmap(BaseModel):
    """Complete generated roadmap."""
    title: str
    description: str
    duration_weeks: int
    stages: List[RoadmapStageData]


class RoadmapGenerationRequest(BaseModel):
    """Request for roadmap generation."""
    topic: str = Field(..., min_length=1, max_length=256)
    current_level: str = Field(..., pattern="^(beginner|intermediate|advanced)$")
    target_level: str = Field(..., pattern="^(beginner|intermediate|advanced)$")
    weekly_hours: int = Field(default=10, ge=1, le=40)
    specific_goals: Optional[str] = None


class SaveRoadmapRequest(BaseModel):
    """Request to save a generated roadmap."""
    roadmap: GeneratedRoadmap


@router.post("/generate", response_model=GeneratedRoadmap)
async def generate_roadmap(
    request: RoadmapGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a personalized learning roadmap using AI.

    Takes into account:
    - Research topic
    - Current knowledge level
    - Target knowledge level
    - Available weekly hours
    - Specific learning goals
    """
    if not ai_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY."
        )

    # Calculate estimated duration
    level_gaps = {
        ("beginner", "intermediate"): 12,
        ("beginner", "advanced"): 24,
        ("intermediate", "advanced"): 16,
        ("beginner", "beginner"): 8,
        ("intermediate", "intermediate"): 12,
        ("advanced", "advanced"): 16,
    }
    estimated_weeks = level_gaps.get(
        (request.current_level, request.target_level),
        12
    )

    system_prompt = """You are an expert educational curriculum designer for mathematics and research.
Create a detailed, structured learning roadmap.
Respond ONLY with valid JSON in this exact structure:
{
    "title": "Roadmap title",
    "description": "Overview of the learning journey",
    "duration_weeks": 12,
    "stages": [
        {
            "stage_number": 1,
            "title": "Stage title",
            "description": "What will be learned in this stage",
            "start_week": 1,
            "end_week": 4,
            "items": [
                {
                    "title": "Specific learning task",
                    "description": "Detailed description",
                    "estimated_hours": 10,
                    "resources": ["Book: Title", "Course: Name", "Paper: Title"]
                }
            ]
        }
    ]
}"""

    user_prompt = f"""Create a learning roadmap for:

Topic: {request.topic}
Current Level: {request.current_level}
Target Level: {request.target_level}
Weekly Hours Available: {request.weekly_hours}
{f'Specific Goals: {request.specific_goals}' if request.specific_goals else ''}

Design a {estimated_weeks}-week roadmap with 3-5 stages.
Each stage should have 3-6 specific learning items.
Include realistic time estimates and concrete resources.

Provide the complete roadmap as JSON."""

    try:
        result = await ai_service.generate_completion(
            prompt=user_prompt,
            system_prompt=system_prompt,
            max_tokens=3000,
            temperature=0.7
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate roadmap"
            )

        # Parse JSON
        import json
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        elif "```" in result:
            result = result.split("```")[1].split("```")[0].strip()

        roadmap_data = json.loads(result)

        return GeneratedRoadmap(**roadmap_data)

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse AI response: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Roadmap generation failed: {str(e)}"
        )


@router.post("/save", status_code=status.HTTP_201_CREATED)
async def save_generated_roadmap(
    request: SaveRoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save a generated roadmap to the database.
    """
    roadmap_data = request.roadmap

    # Create roadmap
    roadmap = Roadmap(
        user_id=current_user.id,
        title=roadmap_data.title,
        description=roadmap_data.description,
        duration_weeks=roadmap_data.duration_weeks,
        status="active"
    )
    db.add(roadmap)
    db.flush()  # Get roadmap ID

    # Create stages
    for stage_data in roadmap_data.stages:
        stage = RoadmapStage(
            roadmap_id=roadmap.id,
            stage_number=stage_data.stage_number,
            title=stage_data.title,
            description=stage_data.description,
            start_week=stage_data.start_week,
            end_week=stage_data.end_week,
            status="pending"
        )
        db.add(stage)
        db.flush()  # Get stage ID

        # Create items for this stage
        for item_data in stage_data.items:
            item = RoadmapItem(
                stage_id=stage.id,
                title=item_data.title,
                description=item_data.description,
                estimated_hours=item_data.estimated_hours,
                resources=", ".join(item_data.resources),  # Store as comma-separated
                completed=False
            )
            db.add(item)

    db.commit()
    db.refresh(roadmap)

    return {
        "success": True,
        "roadmap_id": roadmap.id,
        "message": "Roadmap saved successfully"
    }


@router.post("/from-interest/{interest_id}", response_model=GeneratedRoadmap)
async def generate_roadmap_from_interest(
    interest_id: int,
    weekly_hours: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a roadmap based on a specific research interest.
    """
    # Get the interest
    interest = db.query(ResearchInterest).filter(
        ResearchInterest.id == interest_id,
        ResearchInterest.user_id == current_user.id
    ).first()

    if not interest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research interest not found"
        )

    # Determine target level (one level up)
    level_progression = {
        "beginner": "intermediate",
        "intermediate": "advanced",
        "advanced": "advanced"
    }

    request = RoadmapGenerationRequest(
        topic=interest.topic,
        current_level=interest.level,
        target_level=level_progression.get(interest.level, "advanced"),
        weekly_hours=weekly_hours,
        specific_goals=interest.description
    )

    return await generate_roadmap(request, current_user)


@router.post("/auto-generate", response_model=List[GeneratedRoadmap])
async def auto_generate_roadmaps(
    max_roadmaps: int = 3,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Automatically generate roadmaps for user's top research interests.
    """
    if not ai_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured"
        )

    # Get top interests
    interests = db.query(ResearchInterest).filter(
        ResearchInterest.user_id == current_user.id
    ).order_by(ResearchInterest.priority.desc()).limit(max_roadmaps).all()

    if not interests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please add research interests first"
        )

    roadmaps = []
    for interest in interests:
        try:
            roadmap = await generate_roadmap_from_interest(
                interest.id,
                weekly_hours=10,
                current_user=current_user,
                db=db
            )
            roadmaps.append(roadmap)
        except Exception as e:
            print(f"Failed to generate roadmap for interest {interest.id}: {e}")
            continue

    return roadmaps
