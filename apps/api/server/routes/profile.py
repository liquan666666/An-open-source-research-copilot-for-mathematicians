"""User profile and research interests routes."""
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from server.db.models import User, ResearchInterest, Subscription
from server.auth.dependencies import get_current_user, get_db
from server.auth.password import hash_password


router = APIRouter(prefix="/profile", tags=["profile"])


# Pydantic models
class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None


class ProfileResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResearchInterestCreate(BaseModel):
    topic: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    level: str = Field(default="beginner", pattern="^(beginner|intermediate|advanced)$")
    priority: str = Field(default="medium", pattern="^(high|medium|low)$")


class ResearchInterestUpdate(BaseModel):
    topic: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    level: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced)$")
    priority: Optional[str] = Field(None, pattern="^(high|medium|low)$")


class ResearchInterestResponse(BaseModel):
    id: int
    user_id: int
    topic: str
    description: Optional[str]
    level: str
    priority: str
    created_at: datetime

    class Config:
        from_attributes = True


class SubscriptionResponse(BaseModel):
    id: int
    plan: str
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    days_remaining: Optional[int]

    class Config:
        from_attributes = True


@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's profile.
    """
    return current_user


@router.put("", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile.
    """
    # Check if email is being changed and if it's already in use
    if profile_data.email and profile_data.email != current_user.email:
        existing_user = db.query(User).filter(User.email == profile_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )

    # Update fields
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    current_user.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(current_user)

    return current_user


@router.get("/interests", response_model=List[ResearchInterestResponse])
async def get_research_interests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all research interests for the current user.
    """
    interests = (
        db.query(ResearchInterest)
        .filter(ResearchInterest.user_id == current_user.id)
        .order_by(ResearchInterest.created_at.desc())
        .all()
    )

    return interests


@router.post("/interests", response_model=ResearchInterestResponse, status_code=status.HTTP_201_CREATED)
async def create_research_interest(
    interest_data: ResearchInterestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new research interest.
    """
    new_interest = ResearchInterest(
        user_id=current_user.id,
        topic=interest_data.topic,
        description=interest_data.description,
        level=interest_data.level,
        priority=interest_data.priority
    )

    db.add(new_interest)
    db.commit()
    db.refresh(new_interest)

    return new_interest


@router.get("/interests/{interest_id}", response_model=ResearchInterestResponse)
async def get_research_interest(
    interest_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific research interest.
    """
    interest = (
        db.query(ResearchInterest)
        .filter(
            ResearchInterest.id == interest_id,
            ResearchInterest.user_id == current_user.id
        )
        .first()
    )

    if not interest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research interest not found"
        )

    return interest


@router.put("/interests/{interest_id}", response_model=ResearchInterestResponse)
async def update_research_interest(
    interest_id: int,
    interest_data: ResearchInterestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a research interest.
    """
    interest = (
        db.query(ResearchInterest)
        .filter(
            ResearchInterest.id == interest_id,
            ResearchInterest.user_id == current_user.id
        )
        .first()
    )

    if not interest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research interest not found"
        )

    # Update fields
    update_data = interest_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(interest, field, value)

    db.commit()
    db.refresh(interest)

    return interest


@router.delete("/interests/{interest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_research_interest(
    interest_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a research interest.
    """
    interest = (
        db.query(ResearchInterest)
        .filter(
            ResearchInterest.id == interest_id,
            ResearchInterest.user_id == current_user.id
        )
        .first()
    )

    if not interest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research interest not found"
        )

    db.delete(interest)
    db.commit()

    return None


@router.get("/subscription", response_model=Optional[SubscriptionResponse])
async def get_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's subscription information.
    """
    subscription = (
        db.query(Subscription)
        .filter(Subscription.user_id == current_user.id)
        .first()
    )

    if not subscription:
        return None

    # Calculate days remaining
    days_remaining = None
    if subscription.end_date:
        delta = subscription.end_date.date() - datetime.utcnow().date()
        days_remaining = delta.days if delta.days > 0 else 0

        # Update status if expired
        if days_remaining == 0 and subscription.status == "active":
            subscription.status = "expired"
            db.commit()
            db.refresh(subscription)

    response = SubscriptionResponse(
        id=subscription.id,
        plan=subscription.plan,
        status=subscription.status,
        start_date=subscription.start_date,
        end_date=subscription.end_date,
        days_remaining=days_remaining
    )

    return response


# Legacy endpoint for backward compatibility
@router.get("/legacy")
def get_legacy_profile():
    """Legacy endpoint - returns empty dict."""
    return {}
