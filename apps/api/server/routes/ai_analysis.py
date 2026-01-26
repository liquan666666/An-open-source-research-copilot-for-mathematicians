"""AI-powered paper analysis routes."""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Optional, List
from sqlalchemy.orm import Session

from server.db.models import User, SavedPaper
from server.auth.dependencies import get_current_user, get_db
from server.services.ai_service import ai_service


router = APIRouter(prefix="/ai/analysis", tags=["ai-analysis"])


class PaperAnalysisRequest(BaseModel):
    """Request model for paper analysis."""
    title: str = Field(..., min_length=1)
    abstract: str = Field(..., min_length=10)
    authors: Optional[str] = None


class PaperAnalysisResponse(BaseModel):
    """Response model for paper analysis."""
    summary: str
    key_concepts: List[str]
    research_area: str
    difficulty_level: str  # beginner, intermediate, advanced
    methodology: str
    potential_applications: List[str]
    recommended_prerequisites: List[str]


class SavedPaperAnalysisResponse(BaseModel):
    """Response for saved paper analysis."""
    paper_id: int
    title: str
    analysis: PaperAnalysisResponse


@router.post("/paper", response_model=PaperAnalysisResponse)
async def analyze_paper(
    paper: PaperAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze a research paper using AI.

    Extracts key information including:
    - Summary of the paper
    - Key concepts and terminology
    - Research area classification
    - Difficulty level assessment
    - Methodology used
    - Potential applications
    - Recommended prerequisites
    """
    if not ai_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY."
        )

    # Build the analysis prompt
    system_prompt = """You are an expert mathematical research assistant.
Analyze the provided research paper and extract key information in a structured format.
Respond ONLY with valid JSON matching this exact structure:
{
    "summary": "Brief 2-3 sentence summary",
    "key_concepts": ["concept1", "concept2", "concept3"],
    "research_area": "Primary research area",
    "difficulty_level": "beginner|intermediate|advanced",
    "methodology": "Main methodology used",
    "potential_applications": ["application1", "application2"],
    "recommended_prerequisites": ["prerequisite1", "prerequisite2"]
}"""

    user_prompt = f"""Analyze this research paper:

Title: {paper.title}
Authors: {paper.authors or 'Not provided'}

Abstract:
{paper.abstract}

Provide a structured analysis in JSON format."""

    try:
        # Get AI analysis
        result = await ai_service.generate_completion(
            prompt=user_prompt,
            system_prompt=system_prompt,
            max_tokens=1500,
            temperature=0.3
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate analysis"
            )

        # Parse JSON response
        import json
        # Extract JSON from markdown code blocks if present
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        elif "```" in result:
            result = result.split("```")[1].split("```")[0].strip()

        analysis_data = json.loads(result)

        return PaperAnalysisResponse(**analysis_data)

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse AI response: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get("/saved/{paper_id}", response_model=SavedPaperAnalysisResponse)
async def analyze_saved_paper(
    paper_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze a saved paper from the user's collection.
    """
    # Get saved paper
    paper = db.query(SavedPaper).filter(
        SavedPaper.id == paper_id,
        SavedPaper.user_id == current_user.id
    ).first()

    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved paper not found"
        )

    if not paper.abstract:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Paper has no abstract to analyze"
        )

    # Analyze the paper
    analysis_request = PaperAnalysisRequest(
        title=paper.title,
        abstract=paper.abstract,
        authors=paper.authors
    )

    analysis = await analyze_paper(analysis_request, current_user)

    return SavedPaperAnalysisResponse(
        paper_id=paper.id,
        title=paper.title,
        analysis=analysis
    )


@router.get("/batch", response_model=List[SavedPaperAnalysisResponse])
async def analyze_saved_papers_batch(
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze multiple saved papers in batch.
    Limited to prevent excessive API usage.
    """
    if not ai_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured"
        )

    # Get recent saved papers with abstracts
    papers = db.query(SavedPaper).filter(
        SavedPaper.user_id == current_user.id,
        SavedPaper.abstract.isnot(None)
    ).order_by(SavedPaper.saved_at.desc()).limit(min(limit, 10)).all()

    if not papers:
        return []

    results = []
    for paper in papers:
        try:
            analysis_request = PaperAnalysisRequest(
                title=paper.title,
                abstract=paper.abstract,
                authors=paper.authors
            )
            analysis = await analyze_paper(analysis_request, current_user)
            results.append(SavedPaperAnalysisResponse(
                paper_id=paper.id,
                title=paper.title,
                analysis=analysis
            ))
        except Exception as e:
            print(f"Failed to analyze paper {paper.id}: {e}")
            continue

    return results
