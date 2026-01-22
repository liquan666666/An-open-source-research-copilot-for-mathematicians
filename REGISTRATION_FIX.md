# 注册功能修复报告

## 问题诊断

### 根本原因
应用服务未启动，导致注册功能无法正常工作：
- API 服务器（端口 8000）未运行
- 前端服务器（端口 3000）未运行
- 数据库未初始化

## 解决方案

### 1. 环境适配
由于 Docker 在当前环境不可用，采用直接运行方案：
- ✅ Python 3.11.14 (已安装)
- ✅ Node.js v22.22.0 (已安装)
- ✅ npm 10.9.4 (已安装)

### 2. 依赖安装

#### API 依赖 (Python)
遇到的问题：
- `sgmllib3k` 包与 setuptools 68.1.2 存在兼容性问题
- `bcrypt` 5.0.0 与 `passlib` 存在兼容性问题

解决方案：
```bash
# 安装核心依赖（使用 --no-build-isolation）
pip3 install --no-build-isolation fastapi uvicorn[standard] pydantic \
  "pydantic[email]" sqlalchemy "python-jose[cryptography]" \
  "passlib[bcrypt]" python-multipart httpx stripe requests

# 手动安装 sgmllib3k
wget https://files.pythonhosted.org/packages/9e/bd/3704a8c3e0942d711c1299ebf7b9091930adae6675d7c8f476a7ce48653c/sgmllib3k-1.0.0.tar.gz
tar -xzf sgmllib3k-1.0.0.tar.gz
cp sgmllib3k-1.0.0/sgmllib.py /usr/local/lib/python3.11/dist-packages/

# 降级 bcrypt 到兼容版本
pip3 install "bcrypt<4.1.0,>=4.0.0" --force-reinstall

# 安装 arxiv（跳过依赖）
pip3 install arxiv --no-deps
```

#### 前端依赖 (Node.js)
```bash
cd apps/web
npm install
```

### 3. 数据库初始化
```bash
cd apps/api
mkdir -p ./data
python3 -c "from server.db.init_db import init_db; from server.settings import settings; init_db(settings.db_path)"
```

创建的表：
- users (用户表)
- profiles (用户资料)
- papers (论文)
- research_interests (研究兴趣)
- tasks (任务)
- checkins (签到)
- saved_papers (收藏论文)
- roadmaps (路线图)
- subscriptions (订阅)
- user_activities (用户活动)
- roadmap_stages (路线图阶段)
- roadmap_items (路线图项目)

### 4. 服务启动

#### API 服务器
```bash
cd apps/api
uvicorn server.main:app --host 0.0.0.0 --port 8000
```
- 地址: http://localhost:8000
- API 文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

#### 前端服务器
```bash
cd apps/web
npm run dev
```
- 地址: http://localhost:3000
- 注册页面: http://localhost:3000/auth/register
- 登录页面: http://localhost:3000/auth/login

## 功能验证

### 注册测试
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

响应：
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "bearer"
}
```

### 数据库验证
用户成功创建：
- ID: 1
- 邮箱: test@example.com
- 姓名: Test User
- 状态: 活跃
- 创建时间: 2026-01-22 11:13:11

自动创建 14 天试用订阅：
- 订阅 ID: 1
- 计划: trial
- 状态: active
- 开始日期: 2026-01-22
- 结束日期: 2026-02-05

## 使用说明

### 启动服务
1. 启动 API 服务器：
   ```bash
   cd /home/user/An-open-source-research-copilot-for-mathematicians/apps/api
   uvicorn server.main:app --host 0.0.0.0 --port 8000
   ```

2. 启动前端服务器（新终端）：
   ```bash
   cd /home/user/An-open-source-research-copilot-for-mathematicians/apps/web
   npm run dev
   ```

### 访问应用
- 前端: http://localhost:3000
- 注册: http://localhost:3000/auth/register
- 登录: http://localhost:3000/auth/login
- API 文档: http://localhost:8000/docs

### 注册新用户
1. 访问 http://localhost:3000/auth/register
2. 填写表单：
   - 姓名：任意名字
   - 邮箱：有效的邮箱地址
   - 密码：至少 8 个字符
3. 点击"创建账号"
4. 成功后自动跳转到首页

## 技术细节

### 密码加密
- 算法: bcrypt
- 库: passlib with bcrypt backend
- 版本: bcrypt 4.0.1 (兼容性修复)

### JWT 认证
- Access Token: 30 分钟过期
- Refresh Token: 7 天过期
- 算法: HS256

### 数据库
- 类型: SQLite
- 位置: `./data/mrp.sqlite`
- ORM: SQLAlchemy 2.0

## 遇到的主要问题及解决方案

### 问题 1: sgmllib3k 安装失败
**错误**: `AttributeError: install_layout`

**原因**: setuptools 68.1.2 版本的兼容性问题

**解决**: 手动下载并复制 sgmllib.py 文件到 site-packages

### 问题 2: bcrypt 版本不兼容
**错误**: `ValueError: password cannot be longer than 72 bytes`

**原因**: bcrypt 5.0.0 与 passlib 不兼容

**解决**: 降级到 bcrypt 4.0.1

### 问题 3: cryptography PanicException
**错误**: `pyo3_runtime.PanicException: Python API call failed`

**原因**: 系统 cryptography 41.0.7 版本过旧

**解决**: 升级到 cryptography 46.0.3

## 状态总结

✅ 所有依赖已安装
✅ 数据库已初始化
✅ API 服务器正常运行
✅ 前端服务器正常运行
✅ 注册功能测试通过
✅ 用户数据正确保存
✅ JWT 令牌正常生成
✅ 试用订阅自动创建

## 后续建议

1. **生产环境部署**
   - 更改 SECRET_KEY (不要使用默认值)
   - 配置 CORS_ORIGINS 为实际前端域名
   - 使用 PostgreSQL 替代 SQLite
   - 配置反向代理 (Nginx)

2. **安全加固**
   - 启用 HTTPS
   - 配置速率限制
   - 添加邮箱验证
   - 实施密码强度策略

3. **监控和日志**
   - 配置日志聚合
   - 添加性能监控
   - 设置错误报警

4. **依赖管理**
   - 创建虚拟环境
   - 锁定依赖版本
   - 定期更新安全补丁

---

**修复完成时间**: 2026-01-22
**测试状态**: 全部通过 ✅
