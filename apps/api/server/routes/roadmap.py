from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix='/roadmap')


class Topic(BaseModel):
    """课题信息"""
    id: int
    title: str
    area: str
    difficulty: str
    keywords: List[str]


class LearningItem(BaseModel):
    """学习项"""
    title: str
    description: str
    resources: List[str]
    duration: str


class Phase(BaseModel):
    """学习阶段"""
    id: int
    week: str
    title: str
    description: str
    icon: str
    color: str
    learningItems: List[LearningItem]


class RoadmapRequest(BaseModel):
    """路线图请求"""
    topic: Topic


@router.post('/generate')
def generate_roadmap(request: RoadmapRequest) -> List[Phase]:
    """根据选择的课题生成个性化研究路线图"""
    try:
        topic = request.topic
        phases = []

        # 第1-2周: 基础知识补充
        area_books = {
            "拓扑": ["《基础拓扑学讲义》- 尤承业", "Topology - James Munkres"],
            "泛函分析": ["《泛函分析》- 夏道行", "Functional Analysis - Walter Rudin"],
            "图论": ["《图论》- Bondy & Murty", "Introduction to Graph Theory - Douglas West"],
            "概率": ["《概率论基础》- 李贤平", "Probability Theory - Durrett"],
            "机器学习": ["《统计学习方法》- 李航", "Pattern Recognition and Machine Learning - Bishop"],
            "代数": ["《近世代数》- 张禾瑞", "Abstract Algebra - Dummit & Foote"],
            "几何": ["《微分几何讲义》- 陈省身", "Riemannian Geometry - Do Carmo"]
        }

        resources = []
        for key in area_books:
            if key in topic.area or any(key in kw for kw in topic.keywords):
                resources = area_books[key]
                break
        if not resources:
            resources = ["相关领域基础教材", "在线课程资源"]

        phases.append(Phase(
            id=0,
            week="第 1-2 周",
            title="基础知识补充",
            description=f"建立{topic.area}研究所需的基础理论框架",
            icon="📚",
            color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            learningItems=[
                LearningItem(
                    title=f"{topic.area}基础理论",
                    description=f"学习{topic.area}的核心概念、定义和基本定理",
                    resources=resources + ["MIT OpenCourseWare", "Coursera 相关课程"],
                    duration="7-10天"
                ),
                LearningItem(
                    title="数学工具准备",
                    description="掌握研究所需的数学分析和证明技巧",
                    resources=["《数学分析》教材", "相关在线资源"],
                    duration="4-7天"
                )
            ]
        ))

        # 第3-4周: 文献调研
        phases.append(Phase(
            id=1,
            week="第 3-4 周",
            title="文献调研与精读",
            description=f"深入阅读{topic.title}相关的核心论文，理解研究前沿",
            icon="🔍",
            color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            learningItems=[
                LearningItem(
                    title="经典论文研读",
                    description=f"精读{topic.area}领域内3-5篇奠基性论文，理解{', '.join(topic.keywords[:2])}的核心思想",
                    resources=[
                        f"arXiv.org 搜索: {topic.keywords[0]}",
                        "Google Scholar 引用追踪",
                        "MathSciNet 数学文献数据库"
                    ],
                    duration="10天"
                ),
                LearningItem(
                    title="最新进展跟踪",
                    description=f"关注{topic.title}近3年的重要工作和技术突破",
                    resources=["订阅相关期刊", "关注领域顶尖学者", "参与在线研讨会"],
                    duration="4天"
                )
            ]
        ))

        # 第5-6周: 问题定位
        phases.append(Phase(
            id=2,
            week="第 5-6 周",
            title="问题定位与方法学习",
            description="确定具体研究问题，学习必要的研究方法",
            icon="🎯",
            color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            learningItems=[
                LearningItem(
                    title="研究问题细化",
                    description=f"将{topic.title}拆解为可处理的子问题，评估可行性",
                    resources=["与导师或同行讨论", "问题分解方法论"],
                    duration="5天"
                ),
                LearningItem(
                    title=f"{topic.keywords[0]}专门技术学习",
                    description=f"深入学习{topic.keywords[0]}相关的专门数学技术",
                    resources=[f"专题教材: {topic.keywords[0]}", "技术报告和综述文章"],
                    duration="9天"
                )
            ]
        ))

        # 第7-8周: 初步探索
        phases.append(Phase(
            id=3,
            week="第 7-8 周",
            title="初步探索与实验",
            description="开始理论推导或数值实验，验证初步想法",
            icon="🧪",
            color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            learningItems=[
                LearningItem(
                    title="理论推导尝试",
                    description=f"尝试对{topic.title}中的关键问题进行理论分析和证明",
                    resources=["LaTeX 论文写作工具", "定理证明技巧参考"],
                    duration="10天"
                ),
                LearningItem(
                    title="数值验证（如适用）",
                    description="通过计算机实验验证理论结果的正确性",
                    resources=["Python/MATLAB", "数值计算库"],
                    duration="4天"
                )
            ]
        ))

        # 第9-12周: 深入研究
        phases.append(Phase(
            id=4,
            week="第 9-12 周",
            title="深入研究与成果产出",
            description="完成核心研究工作，撰写论文或报告",
            icon="✍️",
            color="linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            learningItems=[
                LearningItem(
                    title="核心定理证明",
                    description=f"完成{topic.title}的主要理论结果证明",
                    resources=["定理证明策略", "反例构造方法"],
                    duration="14天"
                ),
                LearningItem(
                    title="论文撰写",
                    description="整理研究成果，撰写学术论文或研究报告",
                    resources=["学术论文写作指南", "LaTeX 模板", "arXiv 预印本平台"],
                    duration="14天"
                )
            ]
        ))

        return phases

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成路线图失败: {str(e)}")


@router.get('/current')
def cur():
    return {"message": "请使用 /roadmap/generate 端点"}
