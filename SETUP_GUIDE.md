# 论文搜索与支付功能配置指南

## 新功能概述

本次更新添加了以下重要功能：

### 1. 真实论文搜索功能
- ✅ **arXiv 论文搜索**：直接搜索 arXiv 预印本论文
- ✅ **SCI 期刊论文搜索**：通过 Crossref API 搜索已发表的学术期刊论文
- ✅ **多数据源支持**：可选择单独搜索或同时搜索两个数据源
- ✅ **详细论文信息**：包含标题、作者、摘要、引用次数、DOI等

### 2. Stripe 真实支付集成
- ✅ **Stripe Checkout**：安全的在线支付流程
- ✅ **多种支付方式**：支持信用卡、支付宝、微信支付
- ✅ **订阅管理**：月度、年度、终身三种订阅计划
- ✅ **支付验证**：自动验证支付状态并激活订阅
- ✅ **Webhook 支持**：处理支付成功、订阅更新等事件

---

## 配置步骤

### 第一步：配置 Stripe 支付

#### 1.1 创建 Stripe 账户
1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/register)
2. 注册并完成账户设置
3. 在测试模式下获取 API 密钥

#### 1.2 创建产品和价格
在 Stripe Dashboard 中：

1. 进入 **Products** → **Create product**
2. 创建三个产品：

**月度订阅**
- 名称：Monthly Subscription
- 价格：29 CNY / month
- 类型：Recurring
- 复制生成的 Price ID (格式：`price_xxxxx`)

**年度订阅**
- 名称：Yearly Subscription
- 价格：299 CNY / year
- 类型：Recurring
- 复制生成的 Price ID

**终身会员**
- 名称：Lifetime Membership
- 价格：999 CNY
- 类型：One-time
- 复制生成的 Price ID

#### 1.3 设置 Webhook
1. 在 Stripe Dashboard 进入 **Developers** → **Webhooks**
2. 点击 **Add endpoint**
3. 输入 Webhook URL：`https://your-domain.com/payments/webhook`
4. 选择以下事件：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. 保存后复制 Signing secret (格式：`whsec_xxxxx`)

---

### 第二步：配置环境变量

#### 2.1 后端环境变量（API）

复制 `.env.example` 为 `.env`：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```bash
# Stripe 配置
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx  # 从 Stripe Dashboard 获取
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx      # Webhook signing secret

# Stripe 价格 ID
STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx          # 月度订阅价格 ID
STRIPE_PRICE_YEARLY=price_xxxxxxxxxxxxx           # 年度订阅价格 ID
STRIPE_PRICE_LIFETIME=price_xxxxxxxxxxxxx         # 终身会员价格 ID

# CORS 配置
CORS_ORIGINS=http://localhost:3000,https://your-domain.com

# 数据库配置
DB_PATH=/data/mrp.db
```

#### 2.2 前端环境变量（Web）

在 `apps/web/` 目录下创建 `.env.local`：
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

编辑 `apps/web/.env.local` 文件：
```bash
# API 后端地址
NEXT_PUBLIC_API_BASE=http://localhost:8000

# Stripe 公钥
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx  # 从 Stripe Dashboard 获取
```

---

### 第三步：安装依赖

#### 3.1 后端依赖
后端依赖已在 Dockerfile 中配置，包括：
- `arxiv` - arXiv 论文搜索
- `stripe` - Stripe 支付集成
- `httpx` - HTTP 客户端（用于 Crossref API）

如果使用 Docker，依赖会自动安装。

如果本地运行，需要手动安装：
```bash
pip install arxiv stripe httpx
```

#### 3.2 前端依赖
```bash
cd apps/web
npm install
```

新增依赖：
- `@stripe/stripe-js` - Stripe JavaScript SDK

---

### 第四步：运行项目

#### 4.1 使用 Docker Compose（推荐）
```bash
docker-compose up -d
```

#### 4.2 本地运行

**启动后端 API：**
```bash
cd apps/api
uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```

**启动前端 Web：**
```bash
cd apps/web
npm run dev
```

---

### 第五步：测试功能

#### 5.1 测试论文搜索
1. 访问 `http://localhost:3000/papers`
2. 选择数据源（全部来源 / arXiv / SCI 期刊）
3. 输入搜索关键词，如 "quantum computing" 或 "deep learning"
4. 点击搜索按钮
5. 查看搜索结果，包含论文详情、下载链接等

#### 5.2 测试 Stripe 支付
1. 访问 `http://localhost:3000/pricing`
2. 点击任意订阅计划的"立即订阅"按钮
3. 系统会重定向到 Stripe Checkout 页面
4. 使用测试卡号进行支付：
   - 卡号：`4242 4242 4242 4242`
   - 到期日期：任意未来日期
   - CVC：任意 3 位数字
   - 邮编：任意邮编
5. 完成支付后自动跳转到支付成功页面
6. 订阅已激活，可以查看账户页面确认

---

## API 端点说明

### 论文搜索 API

**搜索论文**
```
GET /papers/search
```

参数：
- `query` (必需)：搜索关键词
- `source` (可选)：数据源，可选值 `all`, `arxiv`, `crossref`，默认 `all`
- `max_results` (可选)：最大结果数，默认 20，范围 1-100
- `sort_by` (可选)：排序方式，可选值 `relevance`, `date`，默认 `relevance`

示例：
```bash
curl "http://localhost:8000/papers/search?query=machine%20learning&source=all&max_results=10"
```

响应：
```json
{
  "success": true,
  "total": 10,
  "query": "machine learning",
  "source": "all",
  "papers": [
    {
      "id": "2301.12345",
      "title": "Paper Title",
      "authors": "Author 1, Author 2",
      "year": 2023,
      "venue": "arXiv",
      "abstract": "Paper abstract...",
      "tags": ["Machine Learning", "AI"],
      "downloadUrl": "https://arxiv.org/pdf/2301.12345.pdf",
      "arxivId": "2301.12345",
      "doi": "",
      "citations": 0,
      "source": "arxiv",
      "url": "https://arxiv.org/abs/2301.12345"
    }
  ]
}
```

### 支付 API

**创建 Checkout 会话**
```
POST /payments/create-checkout-session
```

请求体：
```json
{
  "plan": "monthly",
  "success_url": "https://your-domain.com/payment-success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "https://your-domain.com/pricing",
  "user_email": "user@example.com"
}
```

**获取会话详情**
```
GET /payments/session/{session_id}
```

**Webhook 处理**
```
POST /payments/webhook
```

**获取订阅计划**
```
GET /payments/plans
```

---

## 故障排除

### 问题 1：论文搜索失败
- 检查网络连接是否正常
- arXiv 和 Crossref API 可能有速率限制
- 查看后端日志了解具体错误

### 问题 2：Stripe 支付失败
- 确认环境变量配置正确
- 检查 Stripe API 密钥是否有效
- 确认价格 ID 与产品匹配
- 查看浏览器控制台和后端日志

### 问题 3：Webhook 不工作
- 本地开发需要使用 Stripe CLI 转发 webhook
- 生产环境确保 webhook URL 可公开访问
- 检查 webhook signing secret 是否正确

### 使用 Stripe CLI 测试 Webhook（本地开发）
```bash
# 安装 Stripe CLI
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 转发 webhook 到本地
stripe listen --forward-to localhost:8000/payments/webhook

# 触发测试事件
stripe trigger checkout.session.completed
```

---

## 生产环境部署

### 1. 切换到生产模式
将 Stripe 从测试模式切换到生产模式：
- 使用生产环境的 API 密钥 (`sk_live_xxx` 和 `pk_live_xxx`)
- 更新 Price IDs 为生产环境的产品价格
- 配置生产环境的 Webhook endpoint

### 2. 环境变量
确保生产环境设置了所有必需的环境变量

### 3. HTTPS
Stripe 要求生产环境必须使用 HTTPS

### 4. Webhook URL
确保 Webhook URL 可公开访问且使用 HTTPS

---

## 支持的支付方式

通过 Stripe，系统支持以下支付方式：
- 💳 国际信用卡（Visa、MasterCard、American Express等）
- 🟢 微信支付（WeChat Pay）
- 🔵 支付宝（Alipay）
- 🏦 银行转账（部分地区）

---

## 安全建议

1. ⚠️ **永远不要**将 API 密钥提交到版本控制
2. 🔒 使用环境变量管理敏感信息
3. ✅ 定期轮换 API 密钥
4. 🛡️ 验证所有 webhook 签名
5. 📊 监控 Stripe Dashboard 中的可疑活动

---

## 更多资源

- [Stripe 文档](https://stripe.com/docs)
- [arXiv API 文档](https://arxiv.org/help/api)
- [Crossref API 文档](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
- [Stripe 测试卡号](https://stripe.com/docs/testing)

---

如有问题，请查看项目 GitHub Issues 或联系技术支持。
