from fastapi import APIRouter, Query, HTTPException, Depends, status
from typing import List, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import arxiv
import httpx
from datetime import datetime

from server.db.models import SavedPaper, User
from server.auth.dependencies import get_current_user, get_db, get_optional_user

router = APIRouter(prefix='/papers', tags=["papers"])


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


# Pydantic models for saved papers
class SavedPaperCreate(BaseModel):
    paper_id: str = Field(..., min_length=1)
    title: str
    authors: Optional[str] = None
    abstract: Optional[str] = None
    source: str = Field(..., pattern="^(arxiv|crossref)$")
    url: Optional[str] = None
    notes: Optional[str] = None


class SavedPaperUpdate(BaseModel):
    notes: Optional[str] = None


class SavedPaperResponse(BaseModel):
    id: int
    user_id: int
    paper_id: str
    title: str
    authors: Optional[str]
    abstract: Optional[str]
    source: str
    url: Optional[str]
    saved_at: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True


@router.get('/saved', response_model=List[SavedPaperResponse])
async def get_saved_papers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all saved papers for the current user.
    """
    papers = (
        db.query(SavedPaper)
        .filter(SavedPaper.user_id == current_user.id)
        .order_by(SavedPaper.saved_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return papers


@router.post('/saved', response_model=SavedPaperResponse, status_code=status.HTTP_201_CREATED)
async def save_paper(
    paper_data: SavedPaperCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save a paper to the user's collection.
    """
    # Check if paper is already saved
    existing = (
        db.query(SavedPaper)
        .filter(
            SavedPaper.user_id == current_user.id,
            SavedPaper.paper_id == paper_data.paper_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Paper already saved"
        )

    new_paper = SavedPaper(
        user_id=current_user.id,
        paper_id=paper_data.paper_id,
        title=paper_data.title,
        authors=paper_data.authors,
        abstract=paper_data.abstract,
        source=paper_data.source,
        url=paper_data.url,
        notes=paper_data.notes
    )

    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)

    return new_paper


@router.get('/saved/{paper_id}', response_model=SavedPaperResponse)
async def get_saved_paper(
    paper_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific saved paper.
    """
    paper = (
        db.query(SavedPaper)
        .filter(
            SavedPaper.id == paper_id,
            SavedPaper.user_id == current_user.id
        )
        .first()
    )

    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved paper not found"
        )

    return paper


@router.put('/saved/{paper_id}/notes', response_model=SavedPaperResponse)
async def update_paper_notes(
    paper_id: int,
    notes_data: SavedPaperUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update notes for a saved paper.
    """
    paper = (
        db.query(SavedPaper)
        .filter(
            SavedPaper.id == paper_id,
            SavedPaper.user_id == current_user.id
        )
        .first()
    )

    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved paper not found"
        )

    paper.notes = notes_data.notes
    db.commit()
    db.refresh(paper)

    return paper


@router.delete('/saved/{paper_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_paper(
    paper_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a paper from saved collection.
    """
    paper = (
        db.query(SavedPaper)
        .filter(
            SavedPaper.id == paper_id,
            SavedPaper.user_id == current_user.id
        )
        .first()
    )

    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved paper not found"
        )

    db.delete(paper)
    db.commit()

    return None


@router.get('/saved/check/{source_paper_id}')
async def check_if_saved(
    source_paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if a paper is saved by the current user.

    Returns: {"is_saved": boolean, "saved_paper_id": int or null}
    """
    saved_paper = (
        db.query(SavedPaper)
        .filter(
            SavedPaper.user_id == current_user.id,
            SavedPaper.paper_id == source_paper_id
        )
        .first()
    )

    return {
        "is_saved": saved_paper is not None,
        "saved_paper_id": saved_paper.id if saved_paper else None
    }


# Legacy endpoint
@router.get('/')
def lib():
    """获取论文列表（已弃用，使用 /search 或 /saved 替代）"""
    return {
        "message": "请使用 /papers/search 端点进行论文搜索，或使用 /papers/saved 获取收藏的论文",
        "deprecated": True
    }
