from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from server.db.session import SessionLocal
from server.db.models import CheckIn, Task

router = APIRouter(prefix='/checkins')

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schemas
class CheckInCreate(BaseModel):
    task_id: int
    minutes: int
    note: str = ""
    status: str = "completed"  # "completed", "blocked", "in_progress"

class CheckInResponse(BaseModel):
    id: int
    task_id: int
    minutes: int
    note: str
    status: str

    class Config:
        from_attributes = True

# POST /checkins - Create a check-in
@router.post('', response_model=CheckInResponse)
def create_checkin(checkin_data: CheckInCreate, db: Session = Depends(get_db)):
    """Create a check-in for a task"""
    # Verify task exists
    task = db.query(Task).filter(Task.id == checkin_data.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Create check-in
    checkin = CheckIn(
        task_id=checkin_data.task_id,
        minutes=checkin_data.minutes,
        note=checkin_data.note,
        status=checkin_data.status
    )
    db.add(checkin)

    # Update task status based on check-in
    if checkin_data.status == "completed":
        task.status = "done"
    elif checkin_data.status == "in_progress":
        task.status = "in_progress"

    db.commit()
    db.refresh(checkin)

    return checkin

# GET /checkins - Get all check-ins (optionally filtered by task)
@router.get('', response_model=list[CheckInResponse])
def get_checkins(
    task_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all check-ins, optionally filtered by task ID"""
    query = db.query(CheckIn)
    if task_id:
        query = query.filter(CheckIn.task_id == task_id)

    checkins = query.all()
    return checkins

# GET /checkins/{checkin_id} - Get a specific check-in
@router.get('/{checkin_id}', response_model=CheckInResponse)
def get_checkin(checkin_id: int, db: Session = Depends(get_db)):
    """Get a specific check-in by ID"""
    checkin = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in not found")
    return checkin

# DELETE /checkins/{checkin_id} - Delete a check-in
@router.delete('/{checkin_id}')
def delete_checkin(checkin_id: int, db: Session = Depends(get_db)):
    """Delete a specific check-in"""
    checkin = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in not found")

    db.delete(checkin)
    db.commit()
    return {"message": "Check-in deleted successfully"}
