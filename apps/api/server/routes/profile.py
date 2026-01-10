from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json

from server.db.session import SessionLocal
from server.db.models import Profile

router = APIRouter(prefix='/profile')

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schemas
class ProfileData(BaseModel):
    msc_codes: list[str] = []
    keywords: list[str] = []
    theory_ratio: float = 0.6
    preferences: dict = {}
    name: Optional[str] = None
    institution: Optional[str] = None
    research_interests: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    data: ProfileData

    class Config:
        from_attributes = True

# GET /profile - Get the current profile (assumes single user for now)
@router.get('', response_model=Optional[ProfileResponse])
def get_profile(db: Session = Depends(get_db)):
    """Get the user's research profile"""
    profile = db.query(Profile).first()
    if not profile:
        return None

    data = json.loads(profile.json)
    return ProfileResponse(id=profile.id, data=ProfileData(**data))

# POST /profile - Create or update profile
@router.post('', response_model=ProfileResponse)
def create_or_update_profile(profile_data: ProfileData, db: Session = Depends(get_db)):
    """Create or update the user's research profile"""
    profile = db.query(Profile).first()

    json_data = profile_data.model_dump_json()

    if profile:
        # Update existing profile
        profile.json = json_data
    else:
        # Create new profile
        profile = Profile(json=json_data)
        db.add(profile)

    db.commit()
    db.refresh(profile)

    data = json.loads(profile.json)
    return ProfileResponse(id=profile.id, data=ProfileData(**data))

# PUT /profile - Update profile (alias for POST)
@router.put('', response_model=ProfileResponse)
def update_profile(profile_data: ProfileData, db: Session = Depends(get_db)):
    """Update the user's research profile"""
    return create_or_update_profile(profile_data, db)

# DELETE /profile - Delete profile
@router.delete('')
def delete_profile(db: Session = Depends(get_db)):
    """Delete the user's research profile"""
    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    db.delete(profile)
    db.commit()
    return {"message": "Profile deleted successfully"}
