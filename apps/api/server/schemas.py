"""Pydantic schemas for API request/response validation"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


# Profile schemas
class ProfileCreate(BaseModel):
    name: str = Field(..., description="Researcher name")
    msc_codes: List[str] = Field(default=[], description="Mathematics Subject Classification codes")
    keywords: List[str] = Field(default=[], description="Research keywords")
    interests: str = Field(default="", description="Research interests description")
    theory_preference: float = Field(default=0.5, ge=0.0, le=1.0, description="Theory vs computation preference (0=computation, 1=theory)")


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    msc_codes: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    interests: Optional[str] = None
    theory_preference: Optional[float] = Field(None, ge=0.0, le=1.0)


class ProfileResponse(BaseModel):
    id: int
    name: str
    msc_codes: List[str]
    keywords: List[str]
    interests: str
    theory_preference: float

    class Config:
        from_attributes = True


# Paper schemas
class PaperSearch(BaseModel):
    query: str = Field(..., description="Search query")
    max_results: int = Field(default=10, ge=1, le=100)


class PaperCreate(BaseModel):
    ext_id: str
    title: str
    authors: str
    year: int
    arxiv_url: str
    pdf_url: str = ""


class PaperUpdate(BaseModel):
    focus: Optional[bool] = None
    focus_pages: Optional[str] = Field(None, description="Page ranges to focus on, e.g. '1-5,10-15'")


class PaperResponse(BaseModel):
    id: int
    ext_id: str
    title: str
    authors: str
    year: int
    arxiv_url: str
    pdf_url: str
    local_path: str
    focus: bool
    focus_pages: str

    class Config:
        from_attributes = True


# Topic schemas
class TopicRecommendRequest(BaseModel):
    profile_id: int
    num_topics: int = Field(default=5, ge=1, le=20)


class TopicResponse(BaseModel):
    title: str
    description: str
    relevance_score: float
    related_papers: List[str] = []


# Roadmap schemas
class RoadmapCreate(BaseModel):
    profile_id: int
    topic: str
    duration_weeks: int = Field(default=4, ge=1, le=52)
    theory_ratio: float = Field(default=0.5, ge=0.0, le=1.0)


class RoadmapResponse(BaseModel):
    id: int
    profile_id: int
    topic: str
    milestones: List[dict]
    created_at: str

    class Config:
        from_attributes = True


# Task schemas
class TaskCreate(BaseModel):
    title: str
    kind: str = Field(..., description="Task type: 'theory' or 'computation'")
    description: str = ""
    definition_of_done: str = ""
    related_papers: List[int] = Field(default=[], description="List of paper IDs")
    estimated_hours: float = Field(default=2.0, ge=0.1, le=24.0)


class TaskUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Status: 'todo', 'in_progress', 'done', 'blocked'")
    override_theory_ratio: Optional[float] = Field(None, ge=0.0, le=1.0)


class TaskResponse(BaseModel):
    id: int
    date: str
    title: str
    status: str
    kind: str
    description: str
    definition_of_done: str
    related_papers: List[int]
    estimated_hours: float

    class Config:
        from_attributes = True


# CheckIn schemas
class CheckInCreate(BaseModel):
    task_id: int
    minutes: int = Field(..., ge=0, description="Time spent in minutes")
    note: str = Field(default="", description="Progress note or blocker description")
    status: str = Field(..., description="Status after check-in: 'progress', 'done', 'blocked'")


class CheckInResponse(BaseModel):
    id: int
    task_id: int
    minutes: int
    note: str
    status: str

    class Config:
        from_attributes = True
