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

def search_arxiv_api(query: str, max_results: int = 10):
    """搜索 arXiv 论文"""
    try:
        encoded_query = urllib.parse.quote(query)
        url = f'https://export.arxiv.org/api/query?search_query=all:{encoded_query}&start=0&max_results={max_results}'

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
                    "ext_id": f"arxiv:{arxiv_id}",
                    "title": title,
                    "authors": ", ".join(authors) if authors else "Unknown",
                    "year": int(published),
                    "arxiv_url": f"https://arxiv.org/abs/{arxiv_id}",
                    "pdf_url": f"https://arxiv.org/pdf/{arxiv_id}.pdf",
                    "source": "arXiv"
                })
            except Exception:
                continue

        return results
    except Exception as e:
        print(f"arXiv search error: {str(e)}")
        return []

def search_semantic_scholar_api(query: str, max_results: int = 10):
    """搜索 Semantic Scholar（包含 SCI、中国论文等）"""
    try:
        import json
        encoded_query = urllib.parse.quote(query)
        # 添加 citationCount 和 influentialCitationCount 字段
        url = f'https://api.semanticscholar.org/graph/v1/paper/search?query={encoded_query}&limit={max_results}&fields=paperId,title,authors,year,venue,externalIds,openAccessPdf,citationCount,influentialCitationCount'

        req = urllib.request.Request(url, headers={'User-Agent': 'MathResearchPilot/1.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))

        results = []
        for paper in data.get('data', []):
            try:
                paper_id = paper.get('paperId', '')
                title = paper.get('title', 'Untitled')

                authors_list = paper.get('authors', [])
                authors = ", ".join([a.get('name', 'Unknown') for a in authors_list[:5]])

                year = paper.get('year', 2024)
                venue = paper.get('venue', '')
                citation_count = paper.get('citationCount', 0)
                influential_citation_count = paper.get('influentialCitationCount', 0)

                # 构建链接
                s2_url = f"https://www.semanticscholar.org/paper/{paper_id}"

                # 获取 PDF 链接
                pdf_url = ""
                open_access = paper.get('openAccessPdf')
                if open_access and open_access.get('url'):
                    pdf_url = open_access['url']

                # 获取外部 ID
                external_ids = paper.get('externalIds', {})
                arxiv_id = external_ids.get('ArXiv', '')
                doi = external_ids.get('DOI', '')

                # 优先使用 arXiv 或 DOI 链接
                main_url = s2_url
                if arxiv_id:
                    main_url = f"https://arxiv.org/abs/{arxiv_id}"
                elif doi:
                    main_url = f"https://doi.org/{doi}"

                results.append({
                    "ext_id": f"s2:{paper_id}",
                    "title": title,
                    "authors": authors if authors else "Unknown",
                    "year": year if year else 2024,
                    "arxiv_url": main_url,
                    "pdf_url": pdf_url if pdf_url else main_url,
                    "source": f"Semantic Scholar{' ('+venue+')' if venue else ''}",
                    "citation_count": citation_count,
                    "influential_citation_count": influential_citation_count
                })
            except Exception:
                continue

        return results
    except Exception as e:
        print(f"Semantic Scholar search error: {str(e)}")
        return []

@router.get('/search')
def search_papers(
    q: str = Query(..., description="搜索关键词"),
    max_results: int = 10,
    source: str = Query("all", description="数据源: arxiv, semantic, all"),
    sort_by: str = Query("relevance", description="排序方式: relevance, citations, year")
):
    """搜索论文（支持多数据源和排序）"""
    try:
        # 翻译中文关键词为英文
        translated_q = translate_chinese_keywords(q)

        results = []

        # 根据选择的数据源搜索
        if source in ["arxiv", "all"]:
            arxiv_results = search_arxiv_api(translated_q, max_results)
            # 为 arXiv 论文添加默认引用数（无法获取）
            for paper in arxiv_results:
                paper['citation_count'] = 0
                paper['influential_citation_count'] = 0
            results.extend(arxiv_results)

        if source in ["semantic", "all"]:
            semantic_results = search_semantic_scholar_api(translated_q, max_results)
            results.extend(semantic_results)

        # 去重（基于标题相似度）
        seen_titles = set()
        unique_results = []
        for paper in results:
            title_lower = paper['title'].lower()
            if title_lower not in seen_titles:
                seen_titles.add(title_lower)
                unique_results.append(paper)

        # 排序
        if sort_by == "citations":
            # 按引用数降序排序
            unique_results.sort(key=lambda x: x.get('citation_count', 0), reverse=True)
        elif sort_by == "year":
            # 按年份降序排序（最新的在前）
            unique_results.sort(key=lambda x: x.get('year', 0), reverse=True)
        # relevance 保持原始搜索结果顺序

        return unique_results[:max_results * 2]  # 返回更多结果
    except Exception as e:
        print(f"Paper search error: {str(e)}")
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