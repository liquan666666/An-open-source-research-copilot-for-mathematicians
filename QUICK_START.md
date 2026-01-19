# 快速开始指南

10 分钟上手 MathResearchPilot - 数学研究助手

---

## 📋 目录

1. [系统要求](#系统要求)
2. [安装和启动](#安装和启动)
3. [首次使用](#首次使用)
4. [核心功能演示](#核心功能演示)
5. [配置 AI 功能](#配置-ai-功能)
6. [常见问题](#常见问题)

---

## 系统要求

- Docker 和 Docker Compose
- 至少 2GB 可用内存
- （可选）OpenAI 或 Anthropic API 密钥用于 AI 功能

---

## 安装和启动

### 1. 克隆仓库

```bash
git clone <repository-url>
cd An-open-source-research-copilot-for-mathematicians
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp apps/api/.env.example apps/api/.env

# 编辑 .env 文件（可选）
nano apps/api/.env
```

**基础配置**（无需修改即可启动）：
```bash
# 数据库
MRP_DB_PATH=./data/mrp.sqlite

# CORS
CORS_ORIGINS=http://localhost:3000

# JWT 密钥（生产环境请更换）
SECRET_KEY=your-secret-key-change-this-in-production
```

**AI 功能配置**（可选）：
```bash
# Anthropic Claude (推荐)
ANTHROPIC_API_KEY=sk-ant-api03-xxx...

# 或 OpenAI
OPENAI_API_KEY=sk-xxx...
```

### 3. 启动服务

```bash
# 构建并启动所有服务
docker-compose up --build

# 或后台运行
docker-compose up -d --build
```

**等待服务启动** (~30-60秒)

### 4. 验证安装

打开浏览器访问：

- **前端**: http://localhost:3000
- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

看到以下响应表示成功：
```json
{
  "status": "healthy"
}
```

---

## 首次使用

### 步骤 1: 注册账户

**方式 A: 使用 API 文档（推荐）**

1. 访问 http://localhost:8000/docs
2. 找到 **POST /auth/register** 端点
3. 点击 "Try it out"
4. 填写注册信息：
   ```json
   {
     "email": "你的邮箱@example.com",
     "password": "密码至少8位",
     "name": "你的名字"
   }
   ```
5. 点击 "Execute"
6. 复制响应中的 `access_token`

**方式 B: 使用 curl**

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "测试用户"
  }'
```

### 步骤 2: 获取认证令牌

注册成功后，响应中会包含：
```json
{
  "access_token": "eyJ0eXAi...",
  "refresh_token": "eyJ0eXAi...",
  "token_type": "bearer"
}
```

**复制 `access_token`**，在 Swagger UI 中点击右上角的 **"Authorize"** 按钮，输入：
```
Bearer eyJ0eXAi...你的token...
```

现在你可以访问所有需要认证的端点了！

---

## 核心功能演示

### 1. 搜索学术论文

**在 Swagger UI 中**:

1. 找到 **GET /papers/search**
2. Try it out
3. 参数:
   - `query`: attention mechanism
   - `source`: all
   - `max_results`: 10
4. Execute

**响应示例**:
```json
{
  "success": true,
  "total": 25,
  "papers": [
    {
      "title": "Attention Is All You Need",
      "authors": "Ashish Vaswani, et al.",
      "year": 2017,
      "abstract": "...",
      "downloadUrl": "https://arxiv.org/pdf/1706.03762"
    }
  ]
}
```

### 2. 收藏论文

**POST /papers/saved**:
```json
{
  "paper_id": "1706.03762",
  "title": "Attention Is All You Need",
  "authors": "Ashish Vaswani, et al.",
  "abstract": "摘要内容...",
  "source": "arxiv",
  "url": "https://arxiv.org/abs/1706.03762",
  "notes": "Transformer 的开创性论文"
}
```

### 3. 添加研究兴趣

**POST /profile/interests**:
```json
{
  "topic": "深度学习",
  "description": "学习神经网络和深度学习算法",
  "level": "intermediate",
  "priority": "high"
}
```

### 4. 创建学习任务

**POST /tasks**:
```json
{
  "title": "阅读 Attention Is All You Need",
  "description": "理解 Transformer 架构的核心思想",
  "priority": "high",
  "status": "pending",
  "due_date": "2026-01-30T00:00:00"
}
```

### 5. 每日打卡

**POST /checkins**:
```json
{
  "mood": "happy",
  "content": "今天学习了注意力机制，收获很大！",
  "difficulties": "公式推导部分还需要多看几遍",
  "tasks_completed": 2,
  "tasks_total": 5
}
```

### 6. 查看统计数据

**GET /stats/overview** - 查看全局统计

**GET /stats/achievements** - 查看解锁的成就

**GET /stats/activity-heatmap** - 查看活动热力图

---

## 配置 AI 功能

### 步骤 1: 获取 API 密钥

**选项 A: Anthropic Claude (推荐)**

1. 访问 https://console.anthropic.com/
2. 注册账户
3. 获取 API 密钥

**选项 B: OpenAI**

1. 访问 https://platform.openai.com/
2. 注册账户
3. 获取 API 密钥

### 步骤 2: 配置密钥

编辑 `apps/api/.env`:
```bash
# 使用 Anthropic (推荐，更便宜)
ANTHROPIC_API_KEY=sk-ant-api03-你的密钥

# 或使用 OpenAI
OPENAI_API_KEY=sk-你的密钥
```

### 步骤 3: 重启服务

```bash
docker-compose restart api
```

### 步骤 4: 测试 AI 功能

#### 4.1 智能论文分析

**POST /ai/analysis/paper**:
```json
{
  "title": "Attention Is All You Need",
  "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
  "authors": "Ashish Vaswani, et al."
}
```

**AI 将返回**:
- 论文摘要
- 关键概念
- 研究领域
- 难度评估
- 方法论分析
- 潜在应用
- 前置知识推荐

#### 4.2 个性化推荐

**GET /ai/recommendations/complete**

AI 将基于你的研究兴趣推荐：
- 相关论文（带搜索关键词）
- 学习任务（带时间估算和资源）
- 战略性学习建议

#### 4.3 生成学习路线图

**POST /ai/roadmap/generate**:
```json
{
  "topic": "深度学习",
  "current_level": "beginner",
  "target_level": "intermediate",
  "weekly_hours": 10,
  "specific_goals": "能够实现和训练基础的神经网络模型"
}
```

AI 将生成：
- 完整的学习计划（通常 12-16 周）
- 分阶段的学习目标
- 具体的学习项目
- 时间估算
- 推荐资源（书籍、课程、论文）

#### 4.4 保存路线图

将生成的路线图保存到数据库：

**POST /ai/roadmap/save**

---

## 完整工作流示例

### 场景：学习注意力机制

#### 1. 添加研究兴趣
```bash
POST /profile/interests
{
  "topic": "注意力机制",
  "level": "beginner",
  "priority": "high"
}
```

#### 2. 生成学习路线图
```bash
POST /ai/roadmap/from-interest/1
```

#### 3. 搜索相关论文
```bash
GET /papers/search?query=attention mechanism
```

#### 4. 收藏重点论文
```bash
POST /papers/saved
```

#### 5. AI 分析论文
```bash
POST /ai/analysis/saved/1
```

#### 6. 根据路线图创建任务
```bash
POST /tasks
{
  "title": "理解 Self-Attention 机制",
  "priority": "high",
  "due_date": "2026-01-25T00:00:00"
}
```

#### 7. 每日学习和打卡
```bash
POST /checkins
{
  "mood": "happy",
  "content": "学习了 Self-Attention 的数学原理",
  "tasks_completed": 1,
  "tasks_total": 3
}
```

#### 8. 完成任务
```bash
PATCH /tasks/1/complete
```

#### 9. 查看成就
```bash
GET /stats/achievements
```

#### 10. 导出数据
```bash
GET /export/json
```

---

## 常见问题

### Q: 如何查看所有 API 端点？

A: 访问 http://localhost:8000/docs 查看交互式 API 文档，或查看 [API_REFERENCE.md](./API_REFERENCE.md)

### Q: Token 过期了怎么办？

A: 使用 refresh token 获取新的 access token：

```bash
POST /auth/refresh
{
  "refresh_token": "你的refresh_token"
}
```

### Q: AI 功能返回 503 错误？

A: 这表示未配置 AI API 密钥。在 `.env` 文件中添加 `ANTHROPIC_API_KEY` 或 `OPENAI_API_KEY`，然后重启服务。

### Q: 如何重置数据库？

A: 删除数据库文件并重启：

```bash
docker-compose down
rm apps/api/data/mrp.sqlite
docker-compose up -d
```

### Q: AI 功能费用如何？

A: 参考 [AI功能使用说明.md](./AI功能使用说明.md) 中的成本估算。

中度使用（每天 5 次论文分析）：
- Anthropic Claude: ~$5-13/月
- OpenAI GPT-4: ~$15-35/月

### Q: 可以不使用 AI 功能吗？

A: 可以！所有核心功能（论文搜索、任务管理、打卡、统计）都不需要 AI API。只有以下功能需要 AI：
- 智能论文分析
- 个性化推荐
- 动态路线图生成

### Q: 如何导出所有数据？

A: 使用数据导出功能：

```bash
# 导出完整 JSON
GET /export/json

# 或分类导出 CSV
GET /export/csv/tasks
GET /export/csv/checkins
GET /export/csv/papers
GET /export/csv/interests
```

### Q: 前端在哪里？

A: 前端应用在 http://localhost:3000

目前前端还在使用演示数据。完整的前端集成工作预计需要 20-30 小时。

### Q: 如何停止服务？

A:
```bash
# 停止服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

---

## 下一步

### 探索更多功能

1. **查看完整 API 文档**: [API_REFERENCE.md](./API_REFERENCE.md)
2. **了解 AI 功能**: [AI功能使用说明.md](./AI功能使用说明.md)
3. **查看实施进度**: [实施进度.md](./实施进度.md)
4. **阅读功能说明**: [功能使用说明.md](./功能使用说明.md)

### 推荐学习路径

1. ✅ **完成快速开始**（你已经在这里了！）
2. 📚 使用论文搜索和收藏功能
3. ✏️ 创建任务和每日打卡
4. 🎯 添加研究兴趣
5. 🤖 配置 AI 功能，获得个性化推荐
6. 🗺️ 生成学习路线图
7. 📊 查看统计数据和成就
8. 💾 导出你的学习数据

---

## 技术支持

遇到问题？

1. 查看 [常见问题](#常见问题) 部分
2. 检查 Docker 日志: `docker-compose logs -f api`
3. 访问 API 文档测试: http://localhost:8000/docs
4. 查看完整文档目录

---

## 总结

恭喜！你已经完成快速开始指南。

现在你可以：
- ✅ 搜索和收藏学术论文
- ✅ 管理学习任务
- ✅ 每日打卡追踪进度
- ✅ 查看统计数据和成就
- ✅ 使用 AI 分析论文（如果已配置）
- ✅ 获得个性化推荐
- ✅ 生成学习路线图
- ✅ 导出所有数据

开始你的数学研究之旅吧！🚀

---

**版本**: 1.0.0-rc1
**最后更新**: 2026-01-19
**状态**: 后端功能 100% 完成 ✅
