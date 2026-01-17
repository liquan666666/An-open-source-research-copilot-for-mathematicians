from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
import arxiv
import httpx
from datetime import datetime

router = APIRouter(prefix='/papers')


@router.get('/search')
async def search_papers(
    query: str = Query(..., description="搜索关键词"),
    source: str = Query("all", description="论文来源: arxiv, crossref, 或 all"),
    max_results: int = Query(20, ge=1, le=100, description="最大返回结果数"),
    sort_by: str = Query("relevance", description="排序方式: relevance, date")
):
    """
    搜索学术论文
    - 支持arXiv论文搜索
    - 支持Crossref（SCI期刊）论文搜索
    """
    results = []

    try:
        # 搜索 arXiv 论文
        if source in ["arxiv", "all"]:
            arxiv_results = await search_arxiv(query, max_results)
            results.extend(arxiv_results)

        # 搜索 Crossref 论文（SCI期刊）
        if source in ["crossref", "all"]:
            crossref_results = await search_crossref(query, max_results)
            results.extend(crossref_results)

        # 根据相关度或日期排序
        if sort_by == "date":
            results.sort(key=lambda x: x.get("year", 0), reverse=True)

        return {
            "success": True,
            "total": len(results),
            "query": query,
            "source": source,
            "papers": results[:max_results]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")


async def search_arxiv(query: str, max_results: int) -> List[dict]:
    """搜索 arXiv 论文"""
    try:
        search = arxiv.Search(
            query=query,
            max_results=max_results,
            sort_by=arxiv.SortCriterion.Relevance
        )

        papers = []
        for result in search.results():
            papers.append({
                "id": result.entry_id.split('/')[-1],
                "title": result.title,
                "authors": ", ".join([author.name for author in result.authors]),
                "year": result.published.year,
                "venue": "arXiv",
                "abstract": result.summary,
                "tags": [cat for cat in result.categories],
                "downloadUrl": result.pdf_url,
                "arxivId": result.entry_id.split('/')[-1],
                "doi": result.doi if hasattr(result, 'doi') else "",
                "citations": 0,  # arXiv API 不提供引用数
                "source": "arxiv",
                "publishedDate": result.published.isoformat(),
                "url": result.entry_id
            })

        return papers

    except Exception as e:
        print(f"arXiv搜索错误: {e}")
        return []


async def search_crossref(query: str, max_results: int) -> List[dict]:
    """搜索 Crossref 论文（包括 SCI 期刊）"""
    try:
        async with httpx.AsyncClient() as client:
            # Crossref API endpoint
            url = "https://api.crossref.org/works"
            params = {
                "query": query,
                "rows": max_results,
                "select": "DOI,title,author,published,container-title,abstract,is-referenced-by-count,subject"
            }

            headers = {
                "User-Agent": "MathResearchPilot/1.0 (mailto:support@example.com)"
            }

            response = await client.get(url, params=params, headers=headers, timeout=10.0)
            response.raise_for_status()

            data = response.json()
            papers = []

            for item in data.get("message", {}).get("items", []):
                # 提取标题
                title_list = item.get("title", [])
                title = title_list[0] if title_list else "无标题"

                # 提取作者
                authors_list = item.get("author", [])
                authors = ", ".join([
                    f"{author.get('given', '')} {author.get('family', '')}".strip()
                    for author in authors_list
                ])

                # 提取发表日期
                published_date = item.get("published", {}).get("date-parts", [[None]])[0]
                year = published_date[0] if published_date and published_date[0] else 0

                # 提取期刊名称
                venue_list = item.get("container-title", [])
                venue = venue_list[0] if venue_list else "Unknown"

                # 提取摘要
                abstract = item.get("abstract", "摘要未提供")

                # 提取学科分类
                subjects = item.get("subject", [])

                papers.append({
                    "id": item.get("DOI", "").replace("/", "_"),
                    "title": title,
                    "authors": authors,
                    "year": year,
                    "venue": venue,
                    "abstract": abstract,
                    "tags": subjects[:5],  # 最多5个标签
                    "downloadUrl": f"https://doi.org/{item.get('DOI', '')}",
                    "arxivId": "",
                    "doi": item.get("DOI", ""),
                    "citations": item.get("is-referenced-by-count", 0),
                    "source": "crossref",
                    "publishedDate": f"{year}" if year else "",
                    "url": f"https://doi.org/{item.get('DOI', '')}"
                })

            return papers

    except Exception as e:
        print(f"Crossref搜索错误: {e}")
        return []


@router.get('/')
def lib():
    """获取论文列表（已弃用，使用 /search 替代）"""
    return {
        "message": "请使用 /papers/search 端点进行论文搜索",
        "deprecated": True
    }
