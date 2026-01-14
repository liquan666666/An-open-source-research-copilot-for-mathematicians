from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.db.session import SessionLocal
from server.db.models import Roadmap
import json
from datetime import datetime, timedelta

router = APIRouter(prefix='/roadmap', tags=['roadmap'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/current')
def get_current_roadmap(db: Session = Depends(get_db)):
    """获取当前路线图"""
    roadmap = db.query(Roadmap).first()
    if not roadmap:
        return None
    return json.loads(roadmap.json)

@router.post('/generate')
def generate_roadmap(data: dict, db: Session = Depends(get_db)):
    """生成研究路线图"""
    topic = data.get('topic', '')
    weeks = data.get('weeks', 12)
    daily_hours = data.get('daily_hours', 4)
    theory_ratio = data.get('theory_ratio', 0.7)

    # 生成路线图结构
    start_date = datetime.now()
    phases = []

    # 第一阶段：文献调研和理论学习 (30%)
    phase1_weeks = int(weeks * 0.3)
    phases.append({
        "name": "阶段一：文献调研与理论准备",
        "weeks": phase1_weeks,
        "start_week": 1,
        "tasks": [
            "阅读领域内经典文献和最新研究",
            "整理相关概念和理论框架",
            "确定研究切入点和方法",
            "撰写文献综述报告"
        ]
    })

    # 第二阶段：问题建模和方法设计 (40%)
    phase2_weeks = int(weeks * 0.4)
    phases.append({
        "name": "阶段二：问题建模与方法设计",
        "weeks": phase2_weeks,
        "start_week": phase1_weeks + 1,
        "tasks": [
            "明确研究问题的数学表述",
            "设计解决方案或证明思路",
            "进行初步的理论分析",
            "小规模验证方法可行性"
        ]
    })

    # 第三阶段：深入研究和验证 (25%)
    phase3_weeks = int(weeks * 0.25)
    phases.append({
        "name": "阶段三：深入研究与结果验证",
        "weeks": phase3_weeks,
        "start_week": phase1_weeks + phase2_weeks + 1,
        "tasks": [
            "完成主要理论推导或计算",
            "进行充分的实验验证",
            "分析结果并优化方法",
            "整理研究数据和结论"
        ]
    })

    # 第四阶段：论文撰写 (5%)
    phase4_weeks = weeks - phase1_weeks - phase2_weeks - phase3_weeks
    phases.append({
        "name": "阶段四：论文撰写与投稿",
        "weeks": phase4_weeks,
        "start_week": phase1_weeks + phase2_weeks + phase3_weeks + 1,
        "tasks": [
            "撰写论文初稿",
            "修改和完善论文",
            "准备投稿材料",
            "提交并跟进审稿"
        ]
    })

    roadmap_data = {
        "topic": topic,
        "total_weeks": weeks,
        "daily_hours": daily_hours,
        "theory_ratio": theory_ratio,
        "created_at": start_date.isoformat(),
        "phases": phases
    }

    # 保存到数据库
    roadmap = db.query(Roadmap).first()
    if roadmap:
        roadmap.json = json.dumps(roadmap_data, ensure_ascii=False)
    else:
        roadmap = Roadmap(json=json.dumps(roadmap_data, ensure_ascii=False))
        db.add(roadmap)
    db.commit()

    return roadmap_data

@router.delete('/current')
def delete_roadmap(db: Session = Depends(get_db)):
    """删除当前路线图"""
    roadmap = db.query(Roadmap).first()
    if roadmap:
        db.delete(roadmap)
        db.commit()
        return {"status": "ok"}
    return {"status": "not_found"}