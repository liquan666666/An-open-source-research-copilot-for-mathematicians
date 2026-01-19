"""Data export routes."""
import csv
import io
import json
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from server.db.models import User, Task, CheckIn, SavedPaper, ResearchInterest, Subscription
from server.auth.dependencies import get_current_user, get_db


router = APIRouter(prefix="/export", tags=["export"])


@router.get("/json")
async def export_json(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export all user data as JSON.

    Returns a complete export of all user data including profile,
    tasks, checkins, papers, interests, and subscription.
    """
    # Get all user data
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    checkins = db.query(CheckIn).filter(CheckIn.user_id == current_user.id).all()
    papers = db.query(SavedPaper).filter(SavedPaper.user_id == current_user.id).all()
    interests = db.query(ResearchInterest).filter(ResearchInterest.user_id == current_user.id).all()
    subscription = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()

    # Build export data
    export_data = {
        "export_date": datetime.utcnow().isoformat(),
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "created_at": current_user.created_at.isoformat(),
        },
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "priority": t.priority,
                "status": t.status,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "completed_at": t.completed_at.isoformat() if t.completed_at else None,
                "created_at": t.created_at.isoformat(),
            }
            for t in tasks
        ],
        "checkins": [
            {
                "id": c.id,
                "date": c.date.isoformat(),
                "mood": c.mood,
                "content": c.content,
                "difficulties": c.difficulties,
                "tasks_completed": c.tasks_completed,
                "tasks_total": c.tasks_total,
                "created_at": c.created_at.isoformat(),
            }
            for c in checkins
        ],
        "saved_papers": [
            {
                "id": p.id,
                "paper_id": p.paper_id,
                "title": p.title,
                "authors": p.authors,
                "abstract": p.abstract,
                "source": p.source,
                "url": p.url,
                "notes": p.notes,
                "saved_at": p.saved_at.isoformat(),
            }
            for p in papers
        ],
        "research_interests": [
            {
                "id": i.id,
                "topic": i.topic,
                "description": i.description,
                "level": i.level,
                "priority": i.priority,
                "created_at": i.created_at.isoformat(),
            }
            for i in interests
        ],
        "subscription": {
            "plan": subscription.plan,
            "status": subscription.status,
            "start_date": subscription.start_date.isoformat(),
            "end_date": subscription.end_date.isoformat() if subscription.end_date else None,
        } if subscription else None,
        "statistics": {
            "total_tasks": len(tasks),
            "completed_tasks": sum(1 for t in tasks if t.status == "completed"),
            "total_checkins": len(checkins),
            "total_papers": len(papers),
            "total_interests": len(interests),
        }
    }

    # Convert to JSON string
    json_str = json.dumps(export_data, ensure_ascii=False, indent=2)

    # Return as downloadable file
    return Response(
        content=json_str,
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=research_copilot_export_{datetime.utcnow().strftime('%Y%m%d')}.json"
        }
    )


@router.get("/csv/tasks")
async def export_tasks_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export tasks as CSV.
    """
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        "ID", "标题", "描述", "优先级", "状态",
        "截止日期", "完成时间", "创建时间"
    ])

    # Write data
    for t in tasks:
        writer.writerow([
            t.id,
            t.title,
            t.description or "",
            t.priority,
            t.status,
            t.due_date.isoformat() if t.due_date else "",
            t.completed_at.isoformat() if t.completed_at else "",
            t.created_at.isoformat(),
        ])

    # Return as downloadable file
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=tasks_{datetime.utcnow().strftime('%Y%m%d')}.csv"
        }
    )


@router.get("/csv/checkins")
async def export_checkins_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export checkins as CSV.
    """
    checkins = db.query(CheckIn).filter(CheckIn.user_id == current_user.id).order_by(CheckIn.date.desc()).all()

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        "ID", "日期", "心情", "内容", "困难",
        "完成任务数", "总任务数", "完成率"
    ])

    # Write data
    for c in checkins:
        completion_rate = (
            (c.tasks_completed / c.tasks_total * 100) if c.tasks_total > 0 else 0
        )
        writer.writerow([
            c.id,
            c.date.isoformat(),
            c.mood,
            c.content or "",
            c.difficulties or "",
            c.tasks_completed,
            c.tasks_total,
            f"{completion_rate:.1f}%",
        ])

    # Return as downloadable file
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=checkins_{datetime.utcnow().strftime('%Y%m%d')}.csv"
        }
    )


@router.get("/csv/papers")
async def export_papers_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export saved papers as CSV.
    """
    papers = db.query(SavedPaper).filter(SavedPaper.user_id == current_user.id).order_by(SavedPaper.saved_at.desc()).all()

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        "ID", "论文ID", "标题", "作者", "来源",
        "URL", "笔记", "收藏时间"
    ])

    # Write data
    for p in papers:
        writer.writerow([
            p.id,
            p.paper_id,
            p.title,
            p.authors or "",
            p.source,
            p.url or "",
            p.notes or "",
            p.saved_at.isoformat(),
        ])

    # Return as downloadable file
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=papers_{datetime.utcnow().strftime('%Y%m%d')}.csv"
        }
    )


@router.get("/csv/interests")
async def export_interests_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export research interests as CSV.
    """
    interests = db.query(ResearchInterest).filter(
        ResearchInterest.user_id == current_user.id
    ).order_by(ResearchInterest.created_at.desc()).all()

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        "ID", "课题", "描述", "水平", "优先级", "添加时间"
    ])

    # Write data
    for i in interests:
        writer.writerow([
            i.id,
            i.topic,
            i.description or "",
            i.level,
            i.priority,
            i.created_at.isoformat(),
        ])

    # Return as downloadable file
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=interests_{datetime.utcnow().strftime('%Y%m%d')}.csv"
        }
    )
