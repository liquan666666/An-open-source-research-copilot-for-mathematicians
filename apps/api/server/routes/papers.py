from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from server.db.session import get_db
from server.db.models import Paper
from server.schemas import PaperSearch, PaperCreate, PaperUpdate, PaperResponse
import re
from typing import List

# Try to import feedparser, but make it optional
try:
    import feedparser
    FEEDPARSER_AVAILABLE = True
except ImportError:
    FEEDPARSER_AVAILABLE = False

router = APIRouter(prefix='/papers', tags=['papers'])


def search_arxiv(query: str, max_results: int = 10) -> List[dict]:
    """Search arXiv for papers matching the query"""
    if not FEEDPARSER_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="arXiv search is currently unavailable. The 'feedparser' library is not installed."
        )

    # Construct arXiv API query
    base_url = "http://export.arxiv.org/api/query?"
    search_query = f"search_query=all:{query}&start=0&max_results={max_results}&sortBy=relevance&sortOrder=descending"

    # Parse feed
    feed = feedparser.parse(base_url + search_query)

    results = []
    for entry in feed.entries:
        # Extract arXiv ID from entry.id
        arxiv_id = entry.id.split('/abs/')[-1]

        # Extract year from published date
        year = int(entry.published[:4]) if hasattr(entry, 'published') else 0

        # Get authors
        authors = ", ".join([author.name for author in entry.authors]) if hasattr(entry, 'authors') else ""

        # Construct URLs
        arxiv_url = f"https://arxiv.org/abs/{arxiv_id}"
        pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"

        results.append({
            "ext_id": arxiv_id,
            "title": entry.title.replace("\n", " ").strip(),
            "authors": authors,
            "year": year,
            "arxiv_url": arxiv_url,
            "pdf_url": pdf_url,
            "summary": entry.summary.replace("\n", " ").strip() if hasattr(entry, 'summary') else ""
        })

    return results


@router.post('/search')
def search_papers(search: PaperSearch):
    """Search arXiv for papers"""
    try:
        results = search_arxiv(search.query, search.max_results)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching arXiv: {str(e)}")


@router.get('', response_model=List[PaperResponse])
def list_papers(db: Session = Depends(get_db), focus_only: bool = Query(False)):
    """Get all papers in the library, optionally filter to focus papers only"""
    query = db.query(Paper)

    if focus_only:
        query = query.filter(Paper.focus == True)

    papers = query.order_by(Paper.year.desc(), Paper.id.desc()).all()
    return papers


@router.post('', response_model=PaperResponse, status_code=201)
def add_paper(paper: PaperCreate, db: Session = Depends(get_db)):
    """Add a paper to the library"""
    # Check if paper already exists
    existing = db.query(Paper).filter(Paper.ext_id == paper.ext_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Paper {paper.ext_id} already exists in library")

    db_paper = Paper(
        ext_id=paper.ext_id,
        title=paper.title,
        authors=paper.authors,
        year=paper.year,
        arxiv_url=paper.arxiv_url,
        pdf_url=paper.pdf_url,
        local_path="",
        focus=False,
        focus_pages=""
    )

    db.add(db_paper)
    db.commit()
    db.refresh(db_paper)

    return db_paper


@router.get('/{paper_id}', response_model=PaperResponse)
def get_paper(paper_id: int, db: Session = Depends(get_db)):
    """Get a specific paper by ID"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(status_code=404, detail=f"Paper {paper_id} not found")

    return paper


@router.put('/{paper_id}', response_model=PaperResponse)
def update_paper(paper_id: int, update: PaperUpdate, db: Session = Depends(get_db)):
    """Update paper metadata (focus status, focus pages)"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(status_code=404, detail=f"Paper {paper_id} not found")

    if update.focus is not None:
        paper.focus = update.focus

    if update.focus_pages is not None:
        # Validate page range format (e.g., "1-5,10-15")
        if update.focus_pages:
            pattern = r'^(\d+-\d+)(,\d+-\d+)*$'
            if not re.match(pattern, update.focus_pages):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid page range format. Use format like '1-5,10-15'"
                )
        paper.focus_pages = update.focus_pages

    db.commit()
    db.refresh(paper)

    return paper


@router.delete('/{paper_id}', status_code=204)
def delete_paper(paper_id: int, db: Session = Depends(get_db)):
    """Remove a paper from the library"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(status_code=404, detail=f"Paper {paper_id} not found")

    db.delete(paper)
    db.commit()

    return None
