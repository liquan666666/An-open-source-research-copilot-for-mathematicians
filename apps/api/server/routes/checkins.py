from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.db.session import SessionLocal
from server.db.models import CheckIn, Task

router = APIRouter(prefix='/checkins', tags=['checkins'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post('')
def create_checkin(checkin_data: dict, db: Session = Depends(get_db)):
    """创建打卡记录"""
    task_id = checkin_data.get('task_id')
    minutes = checkin_data.get('minutes', 0)
    note = checkin_data.get('note', '')
    status = checkin_data.get('status', 'completed')

    # 验证任务是否存在
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return {"status": "error", "message": "Task not found"}

    # 创建打卡记录
    checkin = CheckIn(
        task_id=task_id,
        minutes=minutes,
        note=note,
        status=status
    )
    db.add(checkin)

    # 更新任务状态
    if status == 'completed':
        task.status = 'done'
    elif status == 'blocked':
        task.status = 'blocked'

    db.commit()

    return {"status": "ok", "id": checkin.id}

@router.get('/task/{task_id}')
def get_task_checkins(task_id: int, db: Session = Depends(get_db)):
    """获取某任务的所有打卡记录"""
    checkins = db.query(CheckIn).filter(CheckIn.task_id == task_id).all()
    return [{
        "id": c.id,
        "task_id": c.task_id,
        "minutes": c.minutes,
        "note": c.note,
        "status": c.status
    } for c in checkins]

@router.get('/recent')
def get_recent_checkins(limit: int = 20, db: Session = Depends(get_db)):
    """获取最近的打卡记录"""
    checkins = db.query(CheckIn).order_by(CheckIn.id.desc()).limit(limit).all()
    result = []

    for c in checkins:
        task = db.query(Task).filter(Task.id == c.task_id).first()
        result.append({
            "id": c.id,
            "task_id": c.task_id,
            "task_title": task.title if task else "Unknown",
            "task_date": task.date if task else "",
            "minutes": c.minutes,
            "note": c.note,
            "status": c.status
        })

    return result