from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.db.session import SessionLocal
from server.db.models import Profile
import json

router = APIRouter(prefix='/profile', tags=['profile'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('')
def get_profile(db: Session = Depends(get_db)):
    """获取用户资料"""
    profile = db.query(Profile).first()
    if not profile:
        return {
            "name": "",
            "research_area": "",
            "interests": [],
            "daily_hours": 4,
            "theory_ratio": 0.7
        }
    return json.loads(profile.json)

@router.post('')
def save_profile(data: dict, db: Session = Depends(get_db)):
    """保存用户资料"""
    profile = db.query(Profile).first()
    if profile:
        profile.json = json.dumps(data, ensure_ascii=False)
    else:
        profile = Profile(json=json.dumps(data, ensure_ascii=False))
        db.add(profile)
    db.commit()
    return {"status": "ok"}