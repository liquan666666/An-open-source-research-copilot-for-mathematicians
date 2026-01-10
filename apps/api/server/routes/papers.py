from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import feedparser
import requests
import re
import os
from pathlib import Path

from server.db.session import SessionLocal
from server.db.models import Paper

router = APIRouter(prefix='/papers')

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schemas
class PaperSearch(BaseModel):
    query: str
    max_results: int = 10
    category: Optional[str] = None  # e.g., "math.GT", "math.AT"

class PaperUpdate(BaseModel):
    focus: Optional[bool] = None
    focus_pages: Optional[str] = None

class PaperResponse(BaseModel):
    id: int
    ext_id: str
    title: str
    authors: str
    year: int
    arxiv_url: str
    pdf_url: str
    local_path: str
    focus: bool
    focus_pages: str

    class Config:
        from_attributes = True

# Helper function to search arXiv
def search_arxiv(query: str, max_results: int = 10, category: Optional[str] = None):
    """Search arXiv using their API"""
    base_url = "http://export.arxiv.org/api/query"

    # Build search query
    search_query = query
    if category:
        search_query = f"cat:{category} AND ({query})"

    params = {
        "search_query": search_query,
        "start": 0,
        "max_results": max_results,
        "sortBy": "submittedDate",
        "sortOrder": "descending"
    }

    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        feed = feedparser.parse(response.content)

        papers = []
        for entry in feed.entries:
            # Extract arXiv ID from entry.id
            arxiv_id = entry.id.split('/abs/')[-1]

            # Extract year from published date
            year = int(entry.published[:4]) if hasattr(entry, 'published') else 2024

            # Get authors
            authors = ', '.join([author.name for author in entry.authors]) if hasattr(entry, 'authors') else 'Unknown'

            papers.append({
                'ext_id': arxiv_id,
                'title': entry.title.replace('\n', ' ').strip(),
                'authors': authors,
                'year': year,
                'arxiv_url': entry.id,
                'pdf_url': entry.id.replace('/abs/', '/pdf/') + '.pdf',
                'summary': entry.summary.replace('\n', ' ').strip() if hasattr(entry, 'summary') else ''
            })

        return papers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"arXiv search failed: {str(e)}")

# POST /papers/search - Search arXiv for papers
@router.post('/search')
def search_papers(search: PaperSearch):
    """Search arXiv for papers matching the query"""
    papers = search_arxiv(search.query, search.max_results, search.category)
    return papers

# POST /papers - Add a paper to the library
@router.post('', response_model=PaperResponse)
def add_paper(ext_id: str = Query(..., description="arXiv ID"), db: Session = Depends(get_db)):
    """Add a paper to the library by arXiv ID"""
    # Check if paper already exists
    existing = db.query(Paper).filter(Paper.ext_id == ext_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Paper already in library")

    # Fetch paper details from arXiv
    try:
        papers = search_arxiv(f"id:{ext_id}", max_results=1)
        if not papers:
            raise HTTPException(status_code=404, detail="Paper not found on arXiv")

        paper_data = papers[0]
        paper = Paper(
            ext_id=paper_data['ext_id'],
            title=paper_data['title'],
            authors=paper_data['authors'],
            year=paper_data['year'],
            arxiv_url=paper_data['arxiv_url'],
            pdf_url=paper_data['pdf_url'],
            local_path='',
            focus=False,
            focus_pages=''
        )

        db.add(paper)
        db.commit()
        db.refresh(paper)

        return paper
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add paper: {str(e)}")

# GET /papers - Get all papers in the library
@router.get('', response_model=list[PaperResponse])
def get_papers(
    focus_only: bool = Query(False, description="Return only focus papers"),
    db: Session = Depends(get_db)
):
    """Get all papers in the library"""
    query = db.query(Paper)
    if focus_only:
        query = query.filter(Paper.focus == True)

    papers = query.order_by(Paper.year.desc()).all()
    return papers

# GET /papers/{paper_id} - Get a specific paper
@router.get('/{paper_id}', response_model=PaperResponse)
def get_paper(paper_id: int, db: Session = Depends(get_db)):
    """Get a specific paper by ID"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper

# PATCH /papers/{paper_id} - Update paper (focus, reading range)
@router.patch('/{paper_id}', response_model=PaperResponse)
def update_paper(paper_id: int, update: PaperUpdate, db: Session = Depends(get_db)):
    """Update paper focus status and reading range"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    if update.focus is not None:
        paper.focus = update.focus
    if update.focus_pages is not None:
        # Validate format: "1-20" or "1-20,30-40"
        if update.focus_pages and not re.match(r'^(\d+-\d+)(,\d+-\d+)*$', update.focus_pages):
            raise HTTPException(status_code=400, detail="Invalid focus_pages format. Use '1-20' or '1-20,30-40'")
        paper.focus_pages = update.focus_pages

    db.commit()
    db.refresh(paper)
    return paper

# POST /papers/{paper_id}/download - Download PDF for a paper
@router.post('/{paper_id}/download')
def download_paper_pdf(paper_id: int, db: Session = Depends(get_db)):
    """Download PDF for a paper to local storage"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    # Create pdfs directory if it doesn't exist
    pdf_dir = Path('/app/data/pdfs')
    pdf_dir.mkdir(parents=True, exist_ok=True)

    # Generate filename
    safe_id = paper.ext_id.replace('/', '_').replace('\\', '_')
    pdf_filename = f"{safe_id}.pdf"
    pdf_path = pdf_dir / pdf_filename

    # Check if already downloaded
    if pdf_path.exists():
        paper.local_path = str(pdf_path)
        db.commit()
        return {"message": "PDF already exists", "path": str(pdf_path)}

    # Download PDF
    try:
        response = requests.get(paper.pdf_url, timeout=60, stream=True)
        response.raise_for_status()

        # Save to file
        with open(pdf_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        # Update paper record
        paper.local_path = str(pdf_path)
        db.commit()

        return {"message": "PDF downloaded successfully", "path": str(pdf_path), "size_mb": round(pdf_path.stat().st_size / (1024 * 1024), 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download PDF: {str(e)}")

# GET /papers/storage/stats - Get storage statistics
@router.get('/storage/stats')
def get_storage_stats(db: Session = Depends(get_db)):
    """Get PDF storage statistics"""
    papers = db.query(Paper).all()

    total_papers = len(papers)
    downloaded_papers = sum(1 for p in papers if p.local_path)

    # Calculate total size
    total_size = 0
    for paper in papers:
        if paper.local_path:
            try:
                pdf_path = Path(paper.local_path)
                if pdf_path.exists():
                    total_size += pdf_path.stat().st_size
            except Exception:
                pass

    return {
        'total_papers': total_papers,
        'downloaded_papers': downloaded_papers,
        'pending_downloads': total_papers - downloaded_papers,
        'total_size_mb': round(total_size / (1024 * 1024), 2),
        'avg_size_mb': round(total_size / (1024 * 1024) / downloaded_papers, 2) if downloaded_papers > 0 else 0
    }

# DELETE /papers/{paper_id} - Remove a paper from library
@router.delete('/{paper_id}')
def delete_paper(paper_id: int, delete_pdf: bool = False, db: Session = Depends(get_db)):
    """Remove a paper from the library"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    # Delete PDF if requested and exists
    if delete_pdf and paper.local_path:
        try:
            pdf_path = Path(paper.local_path)
            if pdf_path.exists():
                pdf_path.unlink()
        except Exception:
            pass  # Ignore errors in PDF deletion

    db.delete(paper)
    db.commit()
    return {"message": "Paper deleted successfully"}
