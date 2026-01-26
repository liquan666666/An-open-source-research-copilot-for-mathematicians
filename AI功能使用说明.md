# AI 功能使用说明

## 概述

本应用集成了强大的 AI 功能，支持使用 **OpenAI** 或 **Anthropic Claude** API 来提供智能分析、推荐和规划服务。

---

## 配置 AI 服务

### 1. 设置 API 密钥

在 `.env` 文件中配置以下环境变量之一：

```bash
# 使用 Anthropic Claude (推荐)
ANTHROPIC_API_KEY=sk-ant-api03-xxx...

# 或使用 OpenAI
OPENAI_API_KEY=sk-xxx...
```

**优先级**：
- 如果同时配置两个，系统会优先使用 Anthropic Claude
- 如果都未配置，AI 功能将返回 503 错误

### 2. 验证配置

启动服务后，访问 http://localhost:8000/docs 查看 API 文档中的 AI 相关端点。

---

## 功能一：智能论文分析

### 端点列表

#### 1. 分析任意论文
```
POST /ai/analysis/paper
```

**请求体**：
```json
{
  "title": "Attention Is All You Need",
  "abstract": "The dominant sequence transduction models are based on complex...",
  "authors": "Ashish Vaswani, et al."
}
```

**响应**：
```json
{
  "summary": "This paper introduces the Transformer architecture...",
  "key_concepts": ["Attention Mechanism", "Self-Attention", "Multi-Head Attention"],
  "research_area": "Deep Learning / Natural Language Processing",
  "difficulty_level": "advanced",
  "methodology": "Novel neural network architecture design",
  "potential_applications": [
    "Machine Translation",
    "Text Generation"
  ],
  "recommended_prerequisites": [
    "Neural Networks Basics",
    "Sequence Models"
  ]
}
```

#### 2. 分析已收藏的论文
```
GET /ai/analysis/saved/{paper_id}
```

自动从数据库获取论文信息并分析。

#### 3. 批量分析
```
GET /ai/analysis/batch?limit=5
```

分析最近收藏的多篇论文（最多10篇）。

### 使用场景

- 快速了解论文核心内容
- 评估论文难度是否适合当前水平
- 识别需要的前置知识
- 发现论文的实际应用场景

---

## 功能二：智能推荐引擎

### 端点列表

#### 1. 论文推荐
```
GET /ai/recommendations/papers?count=5
```

**响应**：
```json
[
  {
    "title": "Neural Machine Translation by Jointly Learning to Align and Translate",
    "reasoning": "Based on your interest in attention mechanisms, this foundational paper...",
    "search_keywords": ["attention", "seq2seq", "neural translation"],
    "estimated_difficulty": "intermediate",
    "relevance_score": 0.92
  }
]
```

#### 2. 任务推荐
```
GET /ai/recommendations/tasks?count=5
```

**响应**：
```json
[
  {
    "title": "Implement a Simple Attention Mechanism",
    "description": "Build a basic attention layer from scratch using PyTorch...",
    "priority": "high",
    "estimated_hours": 8,
    "prerequisites": ["PyTorch Basics", "Linear Algebra"],
    "resources": [
      "Tutorial: PyTorch Attention",
      "Paper: Attention Is All You Need"
    ]
  }
]
```

#### 3. 综合推荐
```
GET /ai/recommendations/complete?paper_count=3&task_count=3
```

获取论文推荐、任务推荐和战略建议的组合。

**响应**：
```json
{
  "papers": [...],
  "tasks": [...],
  "next_steps": [
    "Focus on mastering attention mechanisms before moving to transformers",
    "Build practical projects to solidify theoretical understanding",
    "Join a study group or online community for peer learning"
  ]
}
```

### 使用场景

- 不知道接下来应该读什么论文
- 寻找实践项目想法
- 需要学习路径指导
- 发现相关研究领域

---

## 功能三：动态路线图生成

### 端点列表

#### 1. 自定义路线图生成
```
POST /ai/roadmap/generate
```

**请求体**：
```json
{
  "topic": "Deep Reinforcement Learning",
  "current_level": "beginner",
  "target_level": "advanced",
  "weekly_hours": 15,
  "specific_goals": "Build an AI agent for game playing"
}
```

**响应**（生成的学习路线图）：
```json
{
  "title": "Deep Reinforcement Learning Mastery Path",
  "description": "A comprehensive journey from beginner to advanced...",
  "duration_weeks": 24,
  "stages": [
    {
      "stage_number": 1,
      "title": "Foundations",
      "description": "Build strong mathematical and programming foundations",
      "start_week": 1,
      "end_week": 6,
      "items": [
        {
          "title": "Linear Algebra Review",
          "description": "Master vectors, matrices, eigenvalues...",
          "estimated_hours": 20,
          "resources": [
            "Book: Linear Algebra and Its Applications",
            "Course: MIT OCW 18.06"
          ]
        },
        {
          "title": "Python and NumPy Proficiency",
          "description": "Build strong Python programming skills...",
          "estimated_hours": 15,
          "resources": [
            "Course: Python for Data Science",
            "Tutorial: NumPy Official Docs"
          ]
        }
      ]
    },
    {
      "stage_number": 2,
      "title": "Core RL Concepts",
      "description": "Learn fundamental reinforcement learning theory",
      "start_week": 7,
      "end_week": 12,
      "items": [...]
    }
  ]
}
```

#### 2. 保存路线图
```
POST /ai/roadmap/save
```

将生成的路线图保存到数据库，与用户账户关联。

#### 3. 基于研究兴趣生成
```
POST /ai/roadmap/from-interest/{interest_id}?weekly_hours=10
```

根据用户已添加的研究兴趣自动生成路线图。

#### 4. 批量生成
```
POST /ai/roadmap/auto-generate?max_roadmaps=3
```

为用户的前 N 个研究兴趣自动生成路线图。

### 使用场景

- 开始学习新的研究方向
- 制定系统的学习计划
- 了解从初学到精通需要多长时间
- 获取学习资源推荐（书籍、课程、论文）

---

## API 使用费用估算

### Anthropic Claude (推荐)

使用 **Claude 3.5 Sonnet**：
- 输入：$3 / 百万 tokens
- 输出：$15 / 百万 tokens

**单次操作估算**：
- 论文分析：~$0.02-0.05
- 推荐生成：~$0.03-0.06
- 路线图生成：~$0.05-0.10

**月度估算**（中度使用）：
- 每天 5 次论文分析：~$3-7.5
- 每周 2 次推荐：~$2-5
- 每月 2 次路线图：~$0.2-0.4
- **总计**：~$5-13/月

### OpenAI GPT-4

使用 **GPT-4 Turbo**：
- 输入：$10 / 百万 tokens
- 输出：$30 / 百万 tokens

**单次操作估算**：
- 论文分析：~$0.05-0.12
- 推荐生成：~$0.08-0.15
- 路线图生成：~$0.12-0.25

**月度估算**（中度使用）：
- **总计**：~$15-35/月

---

## 最佳实践

### 1. 合理使用批量操作

批量分析虽然方便，但会消耗更多 API 调用：
- ✅ 推荐：一次分析 3-5 篇最重要的论文
- ❌ 避免：一次分析所有收藏的论文

### 2. 缓存结果

如果分析过的论文，建议将结果保存为笔记，避免重复分析。

### 3. 渐进式使用路线图

- 先生成一个主题的路线图
- 保存到数据库
- 根据实际学习进度调整
- 完成后再生成下一个

### 4. 组合使用功能

理想的工作流程：
1. 搜索并收藏相关论文
2. 使用 AI 分析了解论文内容
3. 获取个性化推荐
4. 生成系统学习路线图
5. 根据路线图创建任务
6. 定期打卡追踪进度

---

## 故障排查

### 问题：返回 503 错误

**原因**：未配置 API 密钥

**解决**：
```bash
# 在 .env 文件中添加
ANTHROPIC_API_KEY=your-key-here
# 或
OPENAI_API_KEY=your-key-here

# 重启服务
docker-compose restart api
```

### 问题：JSON 解析失败

**原因**：AI 响应格式不符合预期

**解决**：
- 这是偶发问题，重试通常可以解决
- 系统会自动尝试从 markdown 代码块中提取 JSON
- 如果持续失败，可能需要调整 temperature 参数（降低随机性）

### 问题：响应时间长

**原因**：AI API 调用需要时间

**说明**：
- 论文分析：通常 5-15 秒
- 推荐生成：通常 8-20 秒
- 路线图生成：通常 10-30 秒
- 这是正常的 AI 处理时间

---

## 隐私和安全

### 数据处理

- ✅ 所有论文内容仅用于分析，不会永久存储在 AI 服务提供商
- ✅ 用户的研究兴趣和任务信息仅用于生成个性化推荐
- ✅ 分析结果可以选择保存到本地数据库

### API 密钥安全

- ✅ 永远不要将 API 密钥提交到 Git
- ✅ 使用 `.env` 文件存储密钥
- ✅ 定期轮换 API 密钥
- ✅ 设置 API 使用限额

---

## 总结

AI 功能为研究助手增添了强大的智能化能力：

1. **论文分析**：快速理解复杂论文，识别关键概念
2. **智能推荐**：个性化推荐论文和学习任务
3. **路线图生成**：系统化的学习计划，从初学到精通

配置简单，使用方便，费用可控。立即配置 API 密钥，开启智能学习之旅！

**下一步**：
- 阅读 `实施进度.md` 了解完整功能列表
- 访问 http://localhost:8000/docs 查看完整 API 文档
- 开始使用 AI 功能提升研究效率！
