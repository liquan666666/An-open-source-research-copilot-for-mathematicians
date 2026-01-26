# 🚀 快速启动指南

## 方式一：使用 Docker（推荐）

### 1. 确保 Docker 已安装
```bash
# 检查 Docker
docker --version
docker-compose --version

# 如未安装，请访问: https://docs.docker.com/get-docker/
```

### 2. 启动服务
```bash
# 在项目根目录
cd /home/user/An-open-source-research-copilot-for-mathematicians

# 启动所有服务（首次启动会自动构建）
docker-compose up --build

# 或后台运行
docker-compose up -d --build
```

### 3. 访问应用
- **API 文档**: http://localhost:8000/docs （推荐从这里开始）
- **前端页面**: http://localhost:3000
- **健康检查**: http://localhost:8000/health

### 4. 停止服务
```bash
# 停止服务
docker-compose down

# 停止并清除数据
docker-compose down -v
```

---

## 方式二：使用虚拟环境（本地运行）

### 1. 创建虚拟环境
```bash
cd /home/user/An-open-source-research-copilot-for-mathematicians/apps/api

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate
```

### 2. 安装依赖
```bash
# 升级 pip
pip install --upgrade pip

# 安装依赖
pip install -r requirements.txt

# 如果遇到问题，安装核心依赖
pip install fastapi uvicorn sqlalchemy pydantic \
    'python-jose[cryptography]' 'passlib[bcrypt]' \
    python-multipart httpx stripe
```

### 3. 配置环境变量
```bash
# 复制配置文件
cp .env.example .env

# 编辑 .env（可选，添加 AI API 密钥）
nano .env
```

### 4. 启动后端 API
```bash
# 确保在 apps/api 目录
cd /home/user/An-open-source-research-copilot-for-mathematicians/apps/api

# 启动 API 服务器
uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. 启动前端（新终端）
```bash
cd /home/user/An-open-source-research-copilot-for-mathematicians/apps/web

# 安装依赖
npm install

# 启动前端
npm run dev
```

### 6. 访问应用
- **API 文档**: http://localhost:8000/docs
- **前端页面**: http://localhost:3000

---

## 方式三：仅运行后端 API（最快）

如果你只想测试 API 功能：

```bash
cd /home/user/An-open-source-research-copilot-for-mathematicians/apps/api

# 创建虚拟环境并激活
python3 -m venv venv
source venv/bin/activate

# 安装最小依赖
pip install fastapi uvicorn sqlalchemy pydantic httpx

# 创建配置文件
cp .env.example .env

# 启动 API
uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```

然后访问 http://localhost:8000/docs 即可使用所有 57 个 API 端点！

---

## 🎯 首次使用步骤

### 1. 注册账户
在 http://localhost:8000/docs 页面：
1. 找到 **POST /auth/register**
2. 点击 "Try it out"
3. 输入邮箱、密码、名字
4. 点击 "Execute"
5. 复制返回的 `access_token`

### 2. 设置认证
1. 点击页面右上角 **"Authorize"** 按钮
2. 输入: `Bearer 你的access_token`
3. 点击 "Authorize"

### 3. 开始使用
现在你可以测试所有 API 功能了！

---

## 📚 推荐工作流

### 基础功能（无需 AI）
1. **搜索论文**: GET /papers/search
2. **收藏论文**: POST /papers/saved
3. **创建任务**: POST /tasks
4. **每日打卡**: POST /checkins
5. **查看统计**: GET /stats/overview

### AI 功能（需要配置密钥）
1. **分析论文**: POST /ai/analysis/paper
2. **获取推荐**: GET /ai/recommendations/complete
3. **生成路线图**: POST /ai/roadmap/generate

---

## 🔧 常见问题

### Q: Docker 启动失败？
```bash
# 查看日志
docker-compose logs -f

# 重新构建
docker-compose build --no-cache
docker-compose up
```

### Q: 端口被占用？
```bash
# 检查 8000 端口
lsof -i :8000
# 或修改 docker-compose.yml 中的端口
```

### Q: API 返回 503（AI 功能）？
需要配置 AI API 密钥：
```bash
# 编辑 apps/api/.env
ANTHROPIC_API_KEY=sk-ant-xxx...
# 或
OPENAI_API_KEY=sk-xxx...
```

### Q: 如何重置数据？
```bash
# Docker 方式
docker-compose down -v
docker-compose up

# 本地方式
rm apps/api/data/mrp.sqlite
# 重启服务
```

---

## 📖 更多文档

- [完整使用指南](./QUICK_START.md)
- [API 参考文档](./API_REFERENCE.md)
- [AI 功能说明](./AI功能使用说明.md)
- [实施进度](./实施进度.md)

---

**祝你使用愉快！** 🎉

有问题随时查看文档或在 http://localhost:8000/docs 测试功能。
