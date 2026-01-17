# Math Research Pilot API

数学研究助手后端 API 服务

## 功能特性

### 论文搜索 API

支持从多个数据源搜索学术论文:

- **arXiv**: 物理、数学、计算机科学等领域的预印本论文
- **Crossref**: SCI 期刊论文检索

#### API 端点

```
GET /papers/search
```

#### 参数

- `query` (必填): 搜索关键词
- `source` (可选): 数据源选择 - `all` (默认), `arxiv`, 或 `crossref`
- `max_results` (可选): 最大返回结果数 (默认: 20, 范围: 1-100)
- `sort_by` (可选): 排序方式 - `relevance` (默认) 或 `date`

#### 示例

```bash
# 搜索所有数据源
curl "http://localhost:8000/papers/search?query=quantum+computing&source=all&max_results=20"

# 仅搜索 arXiv
curl "http://localhost:8000/papers/search?query=machine+learning&source=arxiv&max_results=10"

# 仅搜索 SCI 期刊
curl "http://localhost:8000/papers/search?query=deep+learning&source=crossref&max_results=15"
```

#### 响应格式

```json
{
  "success": true,
  "total": 20,
  "query": "quantum computing",
  "source": "all",
  "papers": [
    {
      "id": "...",
      "title": "论文标题",
      "authors": "作者1, 作者2",
      "year": 2024,
      "venue": "arXiv",
      "abstract": "论文摘要...",
      "tags": ["cs.AI", "quant-ph"],
      "downloadUrl": "https://arxiv.org/pdf/...",
      "arxivId": "...",
      "doi": "...",
      "citations": 0,
      "source": "arxiv",
      "url": "https://arxiv.org/abs/..."
    }
  ]
}
```

## 安装依赖

```bash
pip install -r requirements.txt
```

## 运行服务

```bash
cd apps/api
uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

## 注意事项

### arXiv API

arXiv API 有时可能会遇到 CDN 配置问题。如果 arXiv 搜索暂时不可用,Crossref 搜索仍然可以正常工作。

### Crossref API

Crossref API 用于搜索 SCI 期刊论文,包含引用次数信息。API 请求需要设置适当的 User-Agent。

## 技术栈

- **FastAPI**: Web 框架
- **httpx**: 异步 HTTP 客户端
- **SQLAlchemy**: ORM
- **Stripe**: 支付集成
