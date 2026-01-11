from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from server.db.session import get_db
from server.db.models import Profile
from server.schemas import ProfileCreate, ProfileUpdate, ProfileResponse
import json

router = APIRouter(prefix='/profile', tags=['profile'])


@router.post('', response_model=ProfileResponse, status_code=201)
def create_profile(profile: ProfileCreate, db: Session = Depends(get_db)):
    """Create a new researcher profile"""
    profile_data = {
        "name": profile.name,
        "msc_codes": profile.msc_codes,
        "keywords": profile.keywords,
        "interests": profile.interests,
        "theory_preference": profile.theory_preference
    }

    db_profile = Profile(json=json.dumps(profile_data))
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    return ProfileResponse(
        id=db_profile.id,
        **profile_data
    )


@router.get('', response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    """Get the current profile (returns the most recent one)"""
    profile = db.query(Profile).order_by(Profile.id.desc()).first()

    if not profile:
        raise HTTPException(status_code=404, detail="No profile found. Please create one first.")

    profile_data = json.loads(profile.json)
    return ProfileResponse(
        id=profile.id,
        **profile_data
    )


@router.get('/{profile_id}', response_model=ProfileResponse)
def get_profile_by_id(profile_id: int, db: Session = Depends(get_db)):
    """Get a specific profile by ID"""
    profile = db.query(Profile).filter(Profile.id == profile_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail=f"Profile {profile_id} not found")

    profile_data = json.loads(profile.json)
    return ProfileResponse(
        id=profile.id,
        **profile_data
    )


@router.put('/{profile_id}', response_model=ProfileResponse)
def update_profile(profile_id: int, update: ProfileUpdate, db: Session = Depends(get_db)):
    """Update an existing profile"""
    db_profile = db.query(Profile).filter(Profile.id == profile_id).first()

    if not db_profile:
        raise HTTPException(status_code=404, detail=f"Profile {profile_id} not found")

    profile_data = json.loads(db_profile.json)

    # Update only provided fields
    update_dict = update.model_dump(exclude_unset=True)
    profile_data.update(update_dict)

    db_profile.json = json.dumps(profile_data)
    db.commit()
    db.refresh(db_profile)

    return ProfileResponse(
        id=db_profile.id,
        **profile_data
    )


@router.delete('/{profile_id}', status_code=204)
def delete_profile(profile_id: int, db: Session = Depends(get_db)):
    """Delete a profile"""
    profile = db.query(Profile).filter(Profile.id == profile_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail=f"Profile {profile_id} not found")

    db.delete(profile)
    db.commit()

    return None
