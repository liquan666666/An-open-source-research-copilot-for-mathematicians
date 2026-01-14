from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.db.session import SessionLocal
from server.db.models import Paper
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import re

router = APIRouter(prefix='/papers', tags=['papers'])

# 中英文数学术语映射表
MATH_TERMS_ZH_TO_EN = {
    # 代数
    "代数": "algebra",
    "代数几何": "algebraic geometry",
    "群论": "group theory",
    "环论": "ring theory",
    "域论": "field theory",
    "线性代数": "linear algebra",
    "抽象代数": "abstract algebra",
    "交换代数": "commutative algebra",

    # 几何与拓扑
    "几何": "geometry",
    "拓扑": "topology",
    "微分几何": "differential geometry",
    "黎曼几何": "Riemannian geometry",
    "代数拓扑": "algebraic topology",
    "同伦": "homotopy",
    "流形": "manifold",

    # 分析
    "分析": "analysis",
    "实分析": "real analysis",
    "复分析": "complex analysis",
    "泛函分析": "functional analysis",
    "调和分析": "harmonic analysis",
    "傅里叶分析": "Fourier analysis",

    # 方程
    "微分方程": "differential equations",
    "偏微分方程": "partial differential equations",
    "常微分方程": "ordinary differential equations",

    # 数论
    "数论": "number theory",
    "解析数论": "analytic number theory",
    "代数数论": "algebraic number theory",
    "素数": "prime numbers",

    # 组合与图论
    "组合": "combinatorics",
    "图论": "graph theory",
    "组合优化": "combinatorial optimization",
    "染色": "coloring",

    # 概率与统计
    "概率": "probability",
    "概率论": "probability theory",
    "统计": "statistics",
    "随机过程": "stochastic processes",
    "马尔可夫": "Markov",

    # 计算与应用
    "数值分析": "numerical analysis",
    "计算数学": "computational mathematics",
    "优化": "optimization",
    "算法": "algorithms",
    "机器学习": "machine learning",

    # 其他
    "定理": "theorem",
    "证明": "proof",
    "猜想": "conjecture",
    "问题": "problem",
    "理论": "theory",
    "方法": "method",
    "模型": "model",
}

def translate_chinese_keywords(query: str) -> str:
    """将查询中的中文数学术语翻译成英文"""
    # 检测是否包含中文
    if not re.search(r'[\u4e00-\u9fff]', query):
        return query

    # 按长度降序排序，优先匹配长词组
    sorted_terms = sorted(MATH_TERMS_ZH_TO_EN.items(), key=lambda x: len(x[0]), reverse=True)

    translated_query = query
    for zh_term, en_term in sorted_terms:
        if zh_term in translated_query:
            translated_query = translated_query.replace(zh_term, en_term)

    return translated_query

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
        # 翻译中文关键词为英文
        translated_q = translate_chinese_keywords(q)
        query = urllib.parse.quote(translated_q)
        # 使用 HTTPS 而不是 HTTP
        url = f'https://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results={max_results}'

        # 添加超时和请求头
        req = urllib.request.Request(url, headers={'User-Agent': 'MathResearchPilot/1.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = response.read().decode('utf-8')

        root = ET.fromstring(data)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}

        results = []
        for entry in root.findall('atom:entry', ns):
            try:
                arxiv_id_elem = entry.find('atom:id', ns)
                if arxiv_id_elem is None:
                    continue
                arxiv_id = arxiv_id_elem.text.split('/abs/')[-1]

                title_elem = entry.find('atom:title', ns)
                if title_elem is None:
                    continue
                title = title_elem.text.strip().replace('\n', ' ')

                authors = []
                for author in entry.findall('atom:author', ns):
                    name = author.find('atom:name', ns)
                    if name is not None:
                        authors.append(name.text)

                published_elem = entry.find('atom:published', ns)
                published = published_elem.text[:4] if published_elem is not None else "2024"

                results.append({
                    "ext_id": arxiv_id,
                    "title": title,
                    "authors": ", ".join(authors) if authors else "Unknown",
                    "year": int(published),
                    "arxiv_url": f"https://arxiv.org/abs/{arxiv_id}",
                    "pdf_url": f"https://arxiv.org/pdf/{arxiv_id}.pdf"
                })
            except Exception as entry_error:
                # 跳过解析失败的条目
                continue

        return results
    except Exception as e:
        # 返回错误信息，但保持返回列表格式以便前端处理
        print(f"arXiv search error: {str(e)}")
        return []

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