from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.db.session import SessionLocal
from server.db.models import Task
from datetime import datetime
import json

router = APIRouter(prefix='/tasks', tags=['tasks'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/today')
def get_today_tasks(db: Session = Depends(get_db)):
    """获取今日任务"""
    today = datetime.now().strftime('%Y-%m-%d')
    tasks = db.query(Task).filter(Task.date == today).all()
    return [{
        "id": t.id,
        "date": t.date,
        "title": t.title,
        "status": t.status,
        "kind": t.kind,
        "details": json.loads(t.json) if t.json else {}
    } for t in tasks]

@router.post('/today')
def create_task(task_data: dict, db: Session = Depends(get_db)):
    """创建今日任务"""
    today = datetime.now().strftime('%Y-%m-%d')

    new_task = Task(
        date=today,
        title=task_data.get('title', ''),
        status='todo',
        kind=task_data.get('kind', 'theory'),
        json=json.dumps(task_data.get('details', {}), ensure_ascii=False)
    )
    db.add(new_task)
    db.commit()

    return {"status": "ok", "id": new_task.id}

@router.patch('/{task_id}')
def update_task(task_id: int, updates: dict, db: Session = Depends(get_db)):
    """更新任务状态"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return {"status": "not_found"}

    if 'status' in updates:
        task.status = updates['status']
    if 'title' in updates:
        task.title = updates['title']
    if 'kind' in updates:
        task.kind = updates['kind']

    db.commit()
    return {"status": "ok"}

@router.delete('/{task_id}')
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """删除任务"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        db.delete(task)
        db.commit()
        return {"status": "ok"}
    return {"status": "not_found"}

@router.get('/history')
def get_task_history(db: Session = Depends(get_db)):
    """获取历史任务"""
    tasks = db.query(Task).order_by(Task.date.desc()).limit(50).all()
    return [{
        "id": t.id,
        "date": t.date,
        "title": t.title,
        "status": t.status,
        "kind": t.kind
    } for t in tasks]