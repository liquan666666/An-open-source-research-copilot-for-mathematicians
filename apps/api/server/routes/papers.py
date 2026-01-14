from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.db.session import SessionLocal
from server.db.models import Paper
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

router = APIRouter(prefix='/papers', tags=['papers'])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('')
def get_papers(db: Session = Depends(get_db)):
    """获取已保存的论文"""
    papers = db.query(Paper).all()
    return [{
        "id": p.id,
        "ext_id": p.ext_id,
        "title": p.title,
        "authors": p.authors,
        "year": p.year,
        "arxiv_url": p.arxiv_url,
        "pdf_url": p.pdf_url,
        "focus": p.focus
    } for p in papers]

@router.get('/search')
def search_arxiv(q: str = Query(..., description="搜索关键词"), max_results: int = 10):
    """搜索 arXiv 论文"""
    try:
        query = urllib.parse.quote(q)
        url = f'http://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results={max_results}'

        with urllib.request.urlopen(url) as response:
            data = response.read().decode('utf-8')

        root = ET.fromstring(data)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}

        results = []
        for entry in root.findall('atom:entry', ns):
            arxiv_id = entry.find('atom:id', ns).text.split('/abs/')[-1]
            title = entry.find('atom:title', ns).text.strip()

            authors = []
            for author in entry.findall('atom:author', ns):
                name = author.find('atom:name', ns)
                if name is not None:
                    authors.append(name.text)

            published = entry.find('atom:published', ns).text[:4]

            results.append({
                "ext_id": arxiv_id,
                "title": title,
                "authors": ", ".join(authors),
                "year": int(published),
                "arxiv_url": f"https://arxiv.org/abs/{arxiv_id}",
                "pdf_url": f"https://arxiv.org/pdf/{arxiv_id}.pdf"
            })

        return results
    except Exception as e:
        return {"error": str(e)}

@router.post('')
def save_paper(paper: dict, db: Session = Depends(get_db)):
    """保存论文到库"""
    existing = db.query(Paper).filter(Paper.ext_id == paper['ext_id']).first()
    if existing:
        return {"status": "already_exists", "id": existing.id}

    new_paper = Paper(
        ext_id=paper['ext_id'],
        title=paper['title'],
        authors=paper['authors'],
        year=paper['year'],
        arxiv_url=paper['arxiv_url'],
        pdf_url=paper['pdf_url'],
        local_path="",
        focus=False
    )
    db.add(new_paper)
    db.commit()
    return {"status": "ok", "id": new_paper.id}

@router.delete('/{paper_id}')
def delete_paper(paper_id: int, db: Session = Depends(get_db)):
    """删除论文"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if paper:
        db.delete(paper)
        db.commit()
        return {"status": "ok"}
    return {"status": "not_found"}

@router.patch('/{paper_id}/focus')
def toggle_focus(paper_id: int, focus: bool, db: Session = Depends(get_db)):
    """标记/取消标记为重点论文"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if paper:
        paper.focus = focus
        db.commit()
        return {"status": "ok"}
    return {"status": "not_found"}