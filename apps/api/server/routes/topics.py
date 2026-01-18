from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix='/topics')


class ResearchInterest(BaseModel):
    """用户研究兴趣"""
    id: int
    topic: str
    description: str
    level: str  # "初学", "进阶", "专家"
    priority: int  # 1-5


class RecommendRequest(BaseModel):
    """推荐请求"""
    interests: List[ResearchInterest]


class TopicRecommendation(BaseModel):
    """课题推荐"""
    id: int
    title: str
    area: str
    difficulty: str
    description: str
    keywords: List[str]
    estimatedDuration: str
    papers: int
    interest: float
    relatedInterests: List[str]  # 关联的用户兴趣


# 课题数据库 - 按研究领域分类
TOPIC_DATABASE = {
    "拓扑学": [
        {
            "title": "拓扑空间中的不动点定理及其应用",
            "area": "拓扑学 · 泛函分析",
            "difficulty": "中等",
            "description": "研究非紧拓扑空间上的不动点定理，探索其在微分方程解的存在性证明中的应用。",
            "keywords": ["不动点定理", "拓扑空间", "微分方程"],
            "estimatedDuration": "3-4个月",
            "papers": 15
        },
        {
            "title": "同伦论在代数拓扑中的应用研究",
            "area": "代数拓扑 · 同伦论",
            "difficulty": "较难",
            "description": "深入研究同伦群的计算方法，探索其在纤维丛理论中的应用。",
            "keywords": ["同伦论", "代数拓扑", "纤维丛"],
            "estimatedDuration": "4-5个月",
            "papers": 22
        }
    ],
    "泛函分析": [
        {
            "title": "Banach空间中的算子理论",
            "area": "泛函分析 · 算子理论",
            "difficulty": "中等",
            "description": "研究Banach空间上有界线性算子的谱理论及其在量子力学中的应用。",
            "keywords": ["Banach空间", "算子理论", "谱理论"],
            "estimatedDuration": "3个月",
            "papers": 18
        }
    ],
    "图论": [
        {
            "title": "图神经网络在组合优化中的理论基础",
            "area": "图论 · 机器学习理论",
            "difficulty": "较难",
            "description": "从数学角度分析图神经网络求解NP难问题的近似能力，建立理论保证。",
            "keywords": ["图论", "神经网络", "组合优化"],
            "estimatedDuration": "4-6个月",
            "papers": 23
        },
        {
            "title": "超图的色数理论研究",
            "area": "图论 · 组合数学",
            "difficulty": "较难",
            "description": "研究超图着色问题的算法复杂性及概率方法应用。",
            "keywords": ["超图", "图着色", "组合优化"],
            "estimatedDuration": "4个月",
            "papers": 16
        }
    ],
    "概率论": [
        {
            "title": "高维概率分布的采样算法收敛性分析",
            "area": "概率论 · 统计学",
            "difficulty": "中等",
            "description": "研究Langevin动力学等采样算法在非凸情况下的收敛速度，改进现有界限。",
            "keywords": ["概率论", "MCMC", "收敛分析"],
            "estimatedDuration": "3个月",
            "papers": 18
        },
        {
            "title": "随机过程在金融数学中的应用",
            "area": "概率论 · 金融数学",
            "difficulty": "中等",
            "description": "应用随机微分方程建模期权定价，研究Black-Scholes模型的推广。",
            "keywords": ["随机过程", "期权定价", "金融数学"],
            "estimatedDuration": "3-4个月",
            "papers": 20
        }
    ],
    "机器学习": [
        {
            "title": "深度学习优化算法的收敛性理论",
            "area": "机器学习 · 优化理论",
            "difficulty": "较难",
            "description": "分析Adam、SGD等优化算法在非凸损失函数下的收敛性质。",
            "keywords": ["深度学习", "优化算法", "收敛理论"],
            "estimatedDuration": "4-5个月",
            "papers": 28
        },
        {
            "title": "生成对抗网络的数学基础",
            "area": "机器学习 · 概率论",
            "difficulty": "较难",
            "description": "从最优传输理论角度理解GAN的训练动态和模式崩溃问题。",
            "keywords": ["GAN", "最优传输", "生成模型"],
            "estimatedDuration": "4个月",
            "papers": 25
        }
    ],
    "微分几何": [
        {
            "title": "黎曼流形上的热核估计",
            "area": "微分几何 · 分析",
            "difficulty": "困难",
            "description": "研究非紧黎曼流形上的热方程解的渐近行为。",
            "keywords": ["黎曼几何", "热核", "几何分析"],
            "estimatedDuration": "5-6个月",
            "papers": 19
        }
    ],
    "代数": [
        {
            "title": "群表示论在量子计算中的应用",
            "area": "代数 · 量子计算",
            "difficulty": "较难",
            "description": "研究对称群和李群的表示在量子算法设计中的作用。",
            "keywords": ["群表示", "量子计算", "对称性"],
            "estimatedDuration": "4-5个月",
            "papers": 21
        }
    ],
    "数值分析": [
        {
            "title": "有限元方法的误差分析",
            "area": "数值分析 · 偏微分方程",
            "difficulty": "中等",
            "description": "研究椭圆型偏微分方程有限元离散的先验和后验误差估计。",
            "keywords": ["有限元", "误差分析", "PDE"],
            "estimatedDuration": "3-4个月",
            "papers": 17
        }
    ],
    "组合数学": [
        {
            "title": "加性组合学中的求和问题",
            "area": "组合数学 · 数论",
            "difficulty": "中等",
            "description": "研究整数集合的子集和问题及Erdős-Ginzburg-Ziv定理的推广。",
            "keywords": ["加性组合", "求和问题", "数论"],
            "estimatedDuration": "3个月",
            "papers": 14
        }
    ]
}

# 关键词相似度映射
KEYWORD_SIMILARITY = {
    "拓扑": ["拓扑学", "拓扑空间", "同伦", "代数拓扑", "几何"],
    "代数": ["代数", "群论", "环论", "表示论", "李群"],
    "分析": ["泛函分析", "实分析", "复分析", "调和分析", "微分方程"],
    "几何": ["微分几何", "黎曼几何", "代数几何", "拓扑", "流形"],
    "概率": ["概率论", "随机过程", "统计", "测度论"],
    "机器学习": ["深度学习", "神经网络", "优化", "统计学习"],
    "优化": ["最优化", "凸优化", "组合优化", "算法"],
    "图论": ["图", "网络", "组合"],
    "数论": ["整数", "素数", "模算术", "加性组合"]
}


def calculate_interest_score(topic_keywords: List[str], user_interest: ResearchInterest) -> float:
    """计算课题与用户兴趣的匹配度"""
    score = 0.0

    # 直接匹配用户兴趣主题
    user_topic_lower = user_interest.topic.lower()
    for keyword in topic_keywords:
        if keyword.lower() in user_topic_lower or user_topic_lower in keyword.lower():
            score += 3.0

    # 检查关键词相似度
    for main_keyword, related_keywords in KEYWORD_SIMILARITY.items():
        if main_keyword.lower() in user_topic_lower:
            for topic_kw in topic_keywords:
                if any(rel.lower() in topic_kw.lower() for rel in related_keywords):
                    score += 1.5

    # 根据用户兴趣优先级加权
    score *= (user_interest.priority / 3.0)

    return min(score, 10.0)


def find_matching_topics(interests: List[ResearchInterest]) -> List[dict]:
    """根据用户兴趣查找匹配的课题"""
    all_topics = []

    for user_interest in interests:
        # 遍历所有领域的课题
        for area, topics in TOPIC_DATABASE.items():
            for topic in topics:
                # 计算匹配度
                combined_keywords = [area] + topic["keywords"]
                score = calculate_interest_score(combined_keywords, user_interest)

                if score > 0:
                    topic_copy = topic.copy()
                    topic_copy["match_score"] = score
                    topic_copy["related_interest"] = user_interest.topic
                    all_topics.append(topic_copy)

    # 如果没有匹配的课题，返回默认推荐
    if not all_topics:
        return get_default_recommendations()

    # 按匹配度排序并去重
    all_topics.sort(key=lambda x: x["match_score"], reverse=True)

    # 去重（保留匹配度最高的）
    seen_titles = set()
    unique_topics = []
    for topic in all_topics:
        if topic["title"] not in seen_titles:
            seen_titles.add(topic["title"])
            unique_topics.append(topic)

    return unique_topics[:5]  # 返回前5个最匹配的课题


def get_default_recommendations() -> List[dict]:
    """获取默认推荐（当用户没有设置兴趣时）"""
    default_topics = []
    for area, topics in list(TOPIC_DATABASE.items())[:3]:
        if topics:
            topic = topics[0].copy()
            topic["match_score"] = 7.0
            topic["related_interest"] = "通用推荐"
            default_topics.append(topic)
    return default_topics


@router.post('/recommend')
def recommend_topics(request: RecommendRequest) -> List[TopicRecommendation]:
    """
    根据用户研究兴趣推荐课题
    """
    try:
        if not request.interests:
            # 没有研究兴趣，返回默认推荐
            matched_topics = get_default_recommendations()
        else:
            # 根据用户兴趣查找匹配的课题
            matched_topics = find_matching_topics(request.interests)

        # 构建推荐结果
        recommendations = []
        for idx, topic in enumerate(matched_topics):
            rec = TopicRecommendation(
                id=idx + 1,
                title=topic["title"],
                area=topic["area"],
                difficulty=topic["difficulty"],
                description=topic["description"],
                keywords=topic["keywords"],
                estimatedDuration=topic["estimatedDuration"],
                papers=topic["papers"],
                interest=round(topic.get("match_score", 7.0), 1),
                relatedInterests=[topic.get("related_interest", "")]
            )
            recommendations.append(rec)

        return recommendations

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"推荐失败: {str(e)}")
