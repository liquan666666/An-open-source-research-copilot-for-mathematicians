# API 参考文档

完整的 MathResearchPilot API 端点参考。

**基础 URL**: `http://localhost:8000`

**API 文档**: http://localhost:8000/docs (Swagger UI)

---

## 目录

- [认证](#认证) (6个端点)
- [用户资料](#用户资料) (9个端点)
- [任务管理](#任务管理) (9个端点)
- [打卡系统](#打卡系统) (7个端点)
- [论文搜索和收藏](#论文搜索和收藏) (7个端点)
- [统计分析](#统计分析) (5个端点)
- [数据导出](#数据导出) (5个端点)
- [AI 智能分析](#ai-智能分析) (3个端点)
- [AI 推荐引擎](#ai-推荐引擎) (3个端点)
- [AI 路线图生成](#ai-路线图生成) (4个端点)

**总计**: 57 个 API 端点

---

## 认证

所有需要认证的端点都需要在请求头中包含：
```
Authorization: Bearer <access_token>
```

### POST /auth/register
注册新用户

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "张三"
}
```

**响应**:
```json
{
  "access_token": "eyJ0eXAi...",
  "refresh_token": "eyJ0eXAi...",
  "token_type": "bearer"
}
```

### POST /auth/login
用户登录

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /auth/refresh
刷新访问令牌

**请求体**:
```json
{
  "refresh_token": "eyJ0eXAi..."
}
```

### GET /auth/me
获取当前用户信息

**需要认证**: ✅

**响应**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "张三",
  "created_at": "2026-01-19T10:00:00",
  "subscription": {
    "plan": "trial",
    "status": "active",
    "days_remaining": 14
  }
}
```

### POST /auth/logout
登出（客户端需清除令牌）

**需要认证**: ✅

### PUT /auth/change-password
修改密码

**需要认证**: ✅

**请求体**:
```json
{
  "current_password": "oldpass123",
  "new_password": "newpass456"
}
```

---

## 用户资料

### GET /profile
获取用户资料

**需要认证**: ✅

### PUT /profile
更新用户资料

**需要认证**: ✅

**请求体**:
```json
{
  "name": "李四",
  "email": "lisi@example.com"
}
```

### GET /profile/interests
获取研究兴趣列表

**需要认证**: ✅

**响应**:
```json
[
  {
    "id": 1,
    "topic": "深度学习",
    "description": "研究神经网络和深度学习算法",
    "level": "intermediate",
    "priority": "high",
    "created_at": "2026-01-19T10:00:00"
  }
]
```

### POST /profile/interests
添加研究兴趣

**需要认证**: ✅

**请求体**:
```json
{
  "topic": "强化学习",
  "description": "学习强化学习算法和应用",
  "level": "beginner",
  "priority": "medium"
}
```

### GET /profile/interests/{id}
获取单个研究兴趣

**需要认证**: ✅

### PUT /profile/interests/{id}
更新研究兴趣

**需要认证**: ✅

### DELETE /profile/interests/{id}
删除研究兴趣

**需要认证**: ✅

### GET /profile/subscription
获取订阅信息

**需要认证**: ✅

---

## 任务管理

### GET /tasks
获取任务列表

**需要认证**: ✅

**查询参数**:
- `status`: pending | in_progress | completed
- `priority`: high | medium | low
- `skip`: 分页偏移 (默认: 0)
- `limit`: 每页数量 (默认: 100)

**响应**:
```json
[
  {
    "id": 1,
    "title": "阅读 Attention Is All You Need",
    "description": "理解 Transformer 架构",
    "priority": "high",
    "status": "in_progress",
    "due_date": "2026-01-25T00:00:00",
    "completed_at": null,
    "created_at": "2026-01-19T10:00:00",
    "updated_at": "2026-01-19T10:00:00"
  }
]
```

### POST /tasks
创建新任务

**需要认证**: ✅

**请求体**:
```json
{
  "title": "实现注意力机制",
  "description": "用 PyTorch 实现基础的注意力层",
  "priority": "high",
  "status": "pending",
  "due_date": "2026-01-30T00:00:00"
}
```

### GET /tasks/stats
获取任务统计

**需要认证**: ✅

**响应**:
```json
{
  "total": 50,
  "pending": 20,
  "in_progress": 5,
  "completed": 25,
  "high_priority": 10,
  "medium_priority": 30,
  "low_priority": 10,
  "overdue": 3
}
```

### GET /tasks/{id}
获取单个任务

**需要认证**: ✅

### PUT /tasks/{id}
更新任务

**需要认证**: ✅

### DELETE /tasks/{id}
删除任务

**需要认证**: ✅

### PATCH /tasks/{id}/complete
标记任务为已完成

**需要认证**: ✅

### PATCH /tasks/{id}/uncomplete
取消完成状态

**需要认证**: ✅

---

## 打卡系统

### GET /checkins
获取打卡历史

**需要认证**: ✅

**查询参数**:
- `skip`: 分页偏移
- `limit`: 每页数量

**响应**:
```json
[
  {
    "id": 1,
    "date": "2026-01-19",
    "mood": "happy",
    "content": "今天完成了两篇论文的阅读",
    "difficulties": "理解公式推导有些困难",
    "tasks_completed": 3,
    "tasks_total": 5,
    "created_at": "2026-01-19T20:00:00"
  }
]
```

### POST /checkins
提交打卡

**需要认证**: ✅

**请求体**:
```json
{
  "mood": "happy",
  "content": "学习进展顺利",
  "difficulties": "",
  "tasks_completed": 3,
  "tasks_total": 5
}
```

### GET /checkins/today
获取今日打卡

**需要认证**: ✅

### GET /checkins/stats
获取打卡统计

**需要认证**: ✅

**响应**:
```json
{
  "total_checkins": 30,
  "current_streak": 7,
  "longest_streak": 15,
  "average_completion_rate": 68.5,
  "mood_distribution": {
    "happy": 15,
    "neutral": 10,
    "frustrated": 3,
    "tired": 2
  }
}
```

### GET /checkins/streak
获取连续打卡信息

**需要认证**: ✅

### GET /checkins/calendar/{year}/{month}
获取月度日历

**需要认证**: ✅

**响应**:
```json
{
  "year": 2026,
  "month": 1,
  "days": [
    {
      "date": "2026-01-19",
      "has_checkin": true,
      "mood": "happy"
    }
  ]
}
```

### DELETE /checkins/{id}
删除打卡

**需要认证**: ✅

---

## 论文搜索和收藏

### GET /papers/search
搜索学术论文

**查询参数**:
- `query`: 搜索关键词 (必需)
- `source`: arxiv | crossref | all (默认: all)
- `max_results`: 最大结果数 (默认: 20)
- `sort_by`: relevance | date (默认: relevance)

**响应**:
```json
{
  "success": true,
  "total": 25,
  "query": "attention mechanism",
  "source": "all",
  "papers": [
    {
      "id": "1706.03762",
      "title": "Attention Is All You Need",
      "authors": "Ashish Vaswani, Noam Shazeer, ...",
      "year": 2017,
      "venue": "arXiv",
      "abstract": "The dominant sequence transduction models...",
      "tags": ["cs.CL", "cs.LG"],
      "downloadUrl": "https://arxiv.org/pdf/1706.03762",
      "arxivId": "1706.03762",
      "doi": "",
      "citations": 0,
      "source": "arxiv",
      "url": "https://arxiv.org/abs/1706.03762"
    }
  ]
}
```

### GET /papers/saved
获取收藏的论文

**需要认证**: ✅

**查询参数**:
- `skip`: 分页偏移
- `limit`: 每页数量

### POST /papers/saved
收藏论文

**需要认证**: ✅

**请求体**:
```json
{
  "paper_id": "1706.03762",
  "title": "Attention Is All You Need",
  "authors": "Ashish Vaswani, et al.",
  "abstract": "The dominant sequence...",
  "source": "arxiv",
  "url": "https://arxiv.org/abs/1706.03762",
  "notes": "必读论文"
}
```

### GET /papers/saved/{id}
获取单个收藏

**需要认证**: ✅

### PUT /papers/saved/{id}/notes
更新论文笔记

**需要认证**: ✅

**请求体**:
```json
{
  "notes": "更新的笔记内容"
}
```

### DELETE /papers/saved/{id}
取消收藏

**需要认证**: ✅

### GET /papers/saved/check/{paper_id}
检查是否已收藏

**需要认证**: ✅

**响应**:
```json
{
  "is_saved": true,
  "saved_paper_id": 123
}
```

---

## 统计分析

### GET /stats/overview
获取全局统计概览

**需要认证**: ✅

**响应**:
```json
{
  "tasks": {
    "total": 50,
    "pending": 20,
    "in_progress": 5,
    "completed": 25,
    "overdue": 3
  },
  "checkins": {
    "total": 30,
    "current_streak": 7,
    "longest_streak": 15,
    "average_completion_rate": 68.5
  },
  "papers": {
    "total_saved": 45
  },
  "interests": {
    "total": 5
  }
}
```

### GET /stats/timeseries
获取时间序列数据

**需要认证**: ✅

**查询参数**:
- `days`: 天数 (默认: 30)

**响应**:
```json
{
  "dates": ["2026-01-01", "2026-01-02", ...],
  "checkins": [1, 0, 1, ...],
  "tasks_completed": [3, 2, 4, ...]
}
```

### GET /stats/achievements
获取成就和徽章

**需要认证**: ✅

**响应**:
```json
{
  "achievements": [
    {
      "id": "first_checkin",
      "name": "首次打卡",
      "description": "完成第一次打卡",
      "icon": "📅",
      "unlocked": true,
      "progress": 1,
      "target": 1,
      "unlocked_at": "2026-01-01T10:00:00"
    },
    {
      "id": "streak_7",
      "name": "坚持一周",
      "description": "连续打卡7天",
      "icon": "🔥",
      "unlocked": true,
      "progress": 7,
      "target": 7,
      "unlocked_at": "2026-01-07T10:00:00"
    }
  ],
  "total_unlocked": 5,
  "total_achievements": 10
}
```

### GET /stats/learning-progress
获取学习进度详情

**需要认证**: ✅

**响应**:
```json
{
  "weekly_completion_rate": 75.0,
  "average_daily_mood": "happy",
  "task_efficiency": {
    "average_completion_time_days": 3.5,
    "on_time_rate": 80.0
  },
  "recent_activity": {
    "last_7_days": {
      "checkins": 7,
      "tasks_completed": 12,
      "papers_saved": 3
    }
  }
}
```

### GET /stats/activity-heatmap
获取活动热力图数据

**需要认证**: ✅

**响应**:
```json
{
  "start_date": "2025-01-19",
  "end_date": "2026-01-19",
  "data": [
    {
      "date": "2026-01-19",
      "count": 5,
      "level": 3
    }
  ]
}
```

---

## 数据导出

### GET /export/json
导出完整数据 (JSON)

**需要认证**: ✅

**响应**: 包含所有用户数据的 JSON 文件

### GET /export/csv/tasks
导出任务 (CSV)

**需要认证**: ✅

**响应**: CSV 文件，包含中文表头

### GET /export/csv/checkins
导出打卡记录 (CSV)

**需要认证**: ✅

### GET /export/csv/papers
导出收藏论文 (CSV)

**需要认证**: ✅

### GET /export/csv/interests
导出研究兴趣 (CSV)

**需要认证**: ✅

---

## AI 智能分析

**注意**: 需要配置 `OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY`

### POST /ai/analysis/paper
分析任意论文

**需要认证**: ✅

**请求体**:
```json
{
  "title": "Attention Is All You Need",
  "abstract": "The dominant sequence transduction models...",
  "authors": "Ashish Vaswani, et al."
}
```

**响应**:
```json
{
  "summary": "本文提出了 Transformer 架构...",
  "key_concepts": [
    "Self-Attention",
    "Multi-Head Attention",
    "Position Encoding"
  ],
  "research_area": "深度学习 / 自然语言处理",
  "difficulty_level": "advanced",
  "methodology": "新型神经网络架构设计",
  "potential_applications": [
    "机器翻译",
    "文本生成"
  ],
  "recommended_prerequisites": [
    "神经网络基础",
    "序列模型"
  ]
}
```

### GET /ai/analysis/saved/{paper_id}
分析已收藏的论文

**需要认证**: ✅

**响应**:
```json
{
  "paper_id": 1,
  "title": "Attention Is All You Need",
  "analysis": {
    "summary": "...",
    "key_concepts": [...],
    ...
  }
}
```

### GET /ai/analysis/batch
批量分析论文

**需要认证**: ✅

**查询参数**:
- `limit`: 分析数量 (默认: 5, 最大: 10)

---

## AI 推荐引擎

### GET /ai/recommendations/papers
获取论文推荐

**需要认证**: ✅

**查询参数**:
- `count`: 推荐数量 (默认: 5)

**响应**:
```json
[
  {
    "title": "Neural Machine Translation by Jointly Learning to Align and Translate",
    "reasoning": "基于您对注意力机制的兴趣...",
    "search_keywords": ["attention", "seq2seq", "neural translation"],
    "estimated_difficulty": "intermediate",
    "relevance_score": 0.92
  }
]
```

### GET /ai/recommendations/tasks
获取任务推荐

**需要认证**: ✅

**查询参数**:
- `count`: 推荐数量 (默认: 5)

**响应**:
```json
[
  {
    "title": "实现简单的注意力机制",
    "description": "使用 PyTorch 从零构建注意力层...",
    "priority": "high",
    "estimated_hours": 8,
    "prerequisites": ["PyTorch 基础", "线性代数"],
    "resources": [
      "教程: PyTorch Attention",
      "论文: Attention Is All You Need"
    ]
  }
]
```

### GET /ai/recommendations/complete
获取综合推荐

**需要认证**: ✅

**查询参数**:
- `paper_count`: 论文推荐数量 (默认: 3)
- `task_count`: 任务推荐数量 (默认: 3)

**响应**:
```json
{
  "papers": [...],
  "tasks": [...],
  "next_steps": [
    "先掌握注意力机制，再学习 Transformer",
    "构建实践项目巩固理论理解",
    "加入学习小组进行同伴学习"
  ]
}
```

---

## AI 路线图生成

### POST /ai/roadmap/generate
生成自定义学习路线图

**需要认证**: ✅

**请求体**:
```json
{
  "topic": "深度强化学习",
  "current_level": "beginner",
  "target_level": "advanced",
  "weekly_hours": 15,
  "specific_goals": "构建游戏 AI 智能体"
}
```

**响应**:
```json
{
  "title": "深度强化学习精通之路",
  "description": "从初学者到高级的全面学习旅程...",
  "duration_weeks": 24,
  "stages": [
    {
      "stage_number": 1,
      "title": "基础阶段",
      "description": "建立数学和编程基础",
      "start_week": 1,
      "end_week": 6,
      "items": [
        {
          "title": "线性代数复习",
          "description": "掌握向量、矩阵、特征值...",
          "estimated_hours": 20,
          "resources": [
            "书籍: Linear Algebra and Its Applications",
            "课程: MIT OCW 18.06"
          ]
        }
      ]
    }
  ]
}
```

### POST /ai/roadmap/save
保存路线图到数据库

**需要认证**: ✅

**请求体**:
```json
{
  "roadmap": {
    "title": "...",
    "description": "...",
    "duration_weeks": 24,
    "stages": [...]
  }
}
```

**响应**:
```json
{
  "success": true,
  "roadmap_id": 1,
  "message": "路线图保存成功"
}
```

### POST /ai/roadmap/from-interest/{interest_id}
基于研究兴趣生成路线图

**需要认证**: ✅

**查询参数**:
- `weekly_hours`: 每周学习时间 (默认: 10)

### POST /ai/roadmap/auto-generate
批量生成路线图

**需要认证**: ✅

**查询参数**:
- `max_roadmaps`: 最大生成数量 (默认: 3)

**响应**: 路线图数组

---

## 错误响应

所有端点在出错时返回标准错误格式：

```json
{
  "detail": "错误详细信息"
}
```

**常见状态码**:
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源未找到
- `500`: 服务器内部错误
- `503`: 服务不可用（如 AI 服务未配置）

---

## 认证令牌生命周期

- **Access Token**: 30 分钟
- **Refresh Token**: 7 天

建议：
1. 将 tokens 存储在 httpOnly cookies 或 secure storage
2. Access token 过期时使用 refresh token 获取新的 token pair
3. Refresh token 过期时需要重新登录

---

## 使用限制

### 分页
- 默认: skip=0, limit=50
- 最大: limit=100

### AI 功能
- 批量分析: 最多 10 篇论文
- 路线图生成: 最多 3 个同时生成

---

## 开发工具

### Swagger UI
http://localhost:8000/docs

交互式 API 文档，可以直接测试所有端点。

### ReDoc
http://localhost:8000/redoc

美化的 API 文档。

### 测试示例

```bash
# 注册
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"测试用户"}'

# 登录
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 获取用户信息（需要 token）
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 搜索论文
curl -X GET "http://localhost:8000/papers/search?query=attention%20mechanism&source=all&max_results=10"
```

---

## 版本信息

**当前版本**: 1.0.0-rc1

**最后更新**: 2026-01-19

**状态**: 所有后端功能已完成 ✅

查看完整实施进度: [实施进度.md](./实施进度.md)
