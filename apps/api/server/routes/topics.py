from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.db.session import SessionLocal
import random

router = APIRouter(prefix='/topics', tags=['topics'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 数学课题示例库
SAMPLE_TOPICS = [
    {"title": "代数几何中的模空间理论", "difficulty": "高", "keywords": ["代数几何", "模空间", "簇"], "description": "研究代数簇的模空间及其性质"},
    {"title": "偏微分方程的数值解法", "difficulty": "中", "keywords": ["偏微分方程", "数值分析", "有限元"], "description": "开发新的数值方法求解非线性偏微分方程"},
    {"title": "图论中的染色问题", "difficulty": "中", "keywords": ["图论", "染色", "组合"], "description": "研究特殊图类的色数和染色算法"},
    {"title": "随机过程的极限定理", "difficulty": "高", "keywords": ["概率论", "随机过程", "极限定理"], "description": "建立新的随机过程收敛性定理"},
    {"title": "拓扑空间的同伦理论", "difficulty": "高", "keywords": ["拓扑学", "同伦", "代数拓扑"], "description": "研究拓扑空间的同伦等价和同伦群"},
    {"title": "数论中的素数分布", "difficulty": "中", "keywords": ["数论", "素数", "解析数论"], "description": "研究素数在特定集合中的分布规律"},
    {"title": "泛函分析中的算子理论", "difficulty": "高", "keywords": ["泛函分析", "算子", "谱理论"], "description": "研究Banach空间上算子的谱性质"},
    {"title": "组合优化问题的算法设计", "difficulty": "中", "keywords": ["组合优化", "算法", "复杂度"], "description": "为NP-hard问题设计近似算法"},
]

@router.post('/recommend')
def recommend_topics(profile: dict, db: Session = Depends(get_db)):
    """根据用户资料推荐课题"""
    interests = profile.get('interests', [])
    research_area = profile.get('research_area', '')

    # 简单的推荐逻辑：根据关键词匹配
    scored_topics = []
    for topic in SAMPLE_TOPICS:
        score = 0
        # 匹配研究领域
        if research_area and research_area in topic['title']:
            score += 3
        # 匹配兴趣关键词
        for interest in interests:
            if any(interest in kw for kw in topic['keywords']):
                score += 2
            if interest in topic['description']:
                score += 1

        scored_topics.append({**topic, "score": score})

    # 按得分排序并返回前5个
    scored_topics.sort(key=lambda x: x['score'], reverse=True)
    return scored_topics[:5] if scored_topics[0]['score'] > 0 else SAMPLE_TOPICS[:5]