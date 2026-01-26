"""AI-powered recommendation engine."""
from fastapi import APIRouter, HTTPException, Depends, status, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session

from server.db.models import User, SavedPaper, ResearchInterest, Task
from server.auth.dependencies import get_current_user, get_db
from server.services.ai_service import ai_service


router = APIRouter(prefix="/ai/recommendations", tags=["ai-recommendations"])


class PaperRecommendation(BaseModel):
    """Recommended paper."""
    title: str
    reasoning: str
    search_keywords: List[str]
    estimated_difficulty: str
    relevance_score: float = Field(ge=0.0, le=1.0)


class TaskRecommendation(BaseModel):
    """Recommended learning task."""
    title: str
    description: str
    priority: str  # high, medium, low
    estimated_hours: int
    prerequisites: List[str]
    resources: List[str]


class RecommendationsResponse(BaseModel):
    """Combined recommendations response."""
    papers: List[PaperRecommendation]
    tasks: List[TaskRecommendation]
    next_steps: List[str]


@router.get("/papers", response_model=List[PaperRecommendation])
async def get_paper_recommendations(
    count: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized paper recommendations based on:
    - User's research interests
    - Previously saved papers
    - Current learning level
    """
    if not ai_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured"
        )

    # Get user context
    interests = db.query(ResearchInterest).filter(
        ResearchInterest.user_id == current_user.id
    ).order_by(ResearchInterest.priority.desc()).all()

    saved_papers = db.query(SavedPaper).filter(
        SavedPaper.user_id == current_user.id
    ).order_by(SavedPaper.saved_at.desc()).limit(10).all()

    if not interests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please add research interests first to get recommendations"
        )

    # Build context for AI
    interests_text = "\n".join([
        f"- {i.topic} ({i.level}, priority: {i.priority}): {i.description or 'No description'}"
        for i in interests[:5]
    ])

    papers_text = ""
    if saved_papers:
        papers_text = "\n".join([
            f"- {p.title} ({p.source})"
            for p in saved_papers[:5]
        ])

    system_prompt = """You are an expert mathematical research advisor.
Recommend relevant research papers based on the user's interests and background.
Respond ONLY with valid JSON as an array of paper recommendations:
[
    {
        "title": "Suggested paper title or topic",
        "reasoning": "Why this paper is relevant",
        "search_keywords": ["keyword1", "keyword2"],
        "estimated_difficulty": "beginner|intermediate|advanced",
        "relevance_score": 0.95
    }
]"""

    user_prompt = f"""Recommend {count} research papers for a user with these interests:

Research Interests:
{interests_text}

Recently saved papers:
{papers_text if papers_text else "None yet"}

Provide {count} paper recommendations as JSON array."""

    try:
        result = await ai_service.generate_completion(
            prompt=user_prompt,
            system_prompt=system_prompt,
            max_tokens=2000,
            temperature=0.7
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate recommendations"
            )

        # Parse JSON
        import json
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        elif "```" in result:
            result = result.split("```")[1].split("```")[0].strip()

        recommendations = json.loads(result)

        return [PaperRecommendation(**rec) for rec in recommendations[:count]]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation generation failed: {str(e)}"
        )


@router.get("/tasks", response_model=List[TaskRecommendation])
async def get_task_recommendations(
    count: int = Query(5, ge=1, le=10),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized learning task recommendations based on:
    - Research interests
    - Completed tasks
    - Current knowledge level
    """
    if not ai_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured"
        )

    # Get user context
    interests = db.query(ResearchInterest).filter(
        ResearchInterest.user_id == current_user.id
    ).all()

    completed_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "completed"
    ).order_by(Task.completed_at.desc()).limit(10).all()

    pending_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status.in_(["pending", "in_progress"])
    ).all()

    if not interests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please add research interests first"
        )

    # Build context
    interests_text = "\n".join([
        f"- {i.topic} ({i.level}): {i.description or ''}"
        for i in interests
    ])

    completed_text = ""
    if completed_tasks:
        completed_text = "\n".join([
            f"- {t.title}"
            for t in completed_tasks[:5]
        ])

    system_prompt = """You are an expert mathematical learning advisor.
Recommend specific learning tasks to help the user progress in their research interests.
Respond ONLY with valid JSON as an array:
[
    {
        "title": "Clear, actionable task title",
        "description": "Detailed description of what to do",
        "priority": "high|medium|low",
        "estimated_hours": 5,
        "prerequisites": ["prerequisite1", "prerequisite2"],
        "resources": ["resource1", "resource2"]
    }
]"""

    user_prompt = f"""Recommend {count} learning tasks for a researcher with:

Research Interests:
{interests_text}

Recently completed tasks:
{completed_text if completed_text else "None yet"}

Current pending tasks: {len(pending_tasks)}

Provide {count} actionable task recommendations as JSON array."""

    try:
        result = await ai_service.generate_completion(
            prompt=user_prompt,
            system_prompt=system_prompt,
            max_tokens=2000,
            temperature=0.7
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate task recommendations"
            )

        import json
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        elif "```" in result:
            result = result.split("```")[1].split("```")[0].strip()

        recommendations = json.loads(result)

        return [TaskRecommendation(**rec) for rec in recommendations[:count]]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Task recommendation failed: {str(e)}"
        )


@router.get("/complete", response_model=RecommendationsResponse)
async def get_complete_recommendations(
    paper_count: int = Query(3, ge=1, le=10),
    task_count: int = Query(3, ge=1, le=10),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get complete personalized recommendations including:
    - Recommended papers to read
    - Recommended learning tasks
    - Next steps in research journey
    """
    if not ai_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured"
        )

    # Get paper and task recommendations
    try:
        papers = await get_paper_recommendations(paper_count, current_user, db)
    except HTTPException:
        papers = []

    try:
        tasks = await get_task_recommendations(task_count, current_user, db)
    except HTTPException:
        tasks = []

    # Generate next steps
    interests = db.query(ResearchInterest).filter(
        ResearchInterest.user_id == current_user.id
    ).all()

    interests_text = "\n".join([
        f"- {i.topic} ({i.level})"
        for i in interests[:3]
    ])

    system_prompt = """You are a research mentor.
Provide 3-5 high-level strategic next steps for the researcher.
Respond ONLY with a JSON array of strings:
["Step 1: ...", "Step 2: ...", "Step 3: ..."]"""

    user_prompt = f"""Based on these research interests:
{interests_text}

What are the most important next steps for this researcher?
Provide 3-5 strategic recommendations as a JSON array."""

    try:
        result = await ai_service.generate_completion(
            prompt=user_prompt,
            system_prompt=system_prompt,
            max_tokens=800,
            temperature=0.6
        )

        import json
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        elif "```" in result:
            result = result.split("```")[1].split("```")[0].strip()

        next_steps = json.loads(result)
    except Exception:
        next_steps = [
            "Continue exploring your primary research interests",
            "Read and analyze recent papers in your field",
            "Work on practical implementation tasks"
        ]

    return RecommendationsResponse(
        papers=papers,
        tasks=tasks,
        next_steps=next_steps[:5]
    )
