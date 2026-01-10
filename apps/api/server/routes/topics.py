from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json
import feedparser
import requests
from collections import Counter

from server.db.session import SessionLocal
from server.db.models import Profile, Paper

router = APIRouter(prefix='/topics')

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schemas
class TopicRecommendation(BaseModel):
    title: str
    description: str
    motivation: str
    related_papers: list[dict] = []
    difficulty: str  # "beginner", "intermediate", "advanced"
    theory_computation_mix: str  # "theory", "computation", "mixed"
    estimated_weeks: int

class RecommendRequest(BaseModel):
    focus_area: Optional[str] = None
    difficulty: Optional[str] = None
    max_results: int = 5

# Helper function to search arXiv by category and keywords
def search_arxiv_for_topics(msc_codes: list[str], keywords: list[str], max_results: int = 20):
    """Search arXiv to find trending topics based on user's interests"""
    base_url = "http://export.arxiv.org/api/query"

    # Map MSC codes to arXiv categories (simplified mapping)
    arxiv_categories = []
    for msc in msc_codes:
        if msc.startswith('57'):  # Manifolds and cell complexes
            arxiv_categories.append('math.GT')
        elif msc.startswith('58'):  # Global analysis
            arxiv_categories.append('math.DG')
        elif msc.startswith('55'):  # Algebraic topology
            arxiv_categories.append('math.AT')
        elif msc.startswith('14'):  # Algebraic geometry
            arxiv_categories.append('math.AG')
        elif msc.startswith('11'):  # Number theory
            arxiv_categories.append('math.NT')
        elif msc.startswith('60'):  # Probability
            arxiv_categories.append('math.PR')
        elif msc.startswith('62'):  # Statistics
            arxiv_categories.append('math.ST')

    if not arxiv_categories:
        arxiv_categories = ['math.GM']  # General mathematics

    # Build search query
    keyword_query = ' OR '.join(keywords[:3]) if keywords else 'mathematics'
    category_query = ' OR '.join([f'cat:{cat}' for cat in arxiv_categories[:2]])
    search_query = f'({keyword_query}) AND ({category_query})'

    params = {
        'search_query': search_query,
        'start': 0,
        'max_results': max_results,
        'sortBy': 'submittedDate',
        'sortOrder': 'descending'
    }

    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        feed = feedparser.parse(response.content)

        papers = []
        for entry in feed.entries:
            arxiv_id = entry.id.split('/abs/')[-1]
            year = int(entry.published[:4]) if hasattr(entry, 'published') else 2024
            authors = ', '.join([author.name for author in entry.authors]) if hasattr(entry, 'authors') else 'Unknown'

            papers.append({
                'ext_id': arxiv_id,
                'title': entry.title.replace('\n', ' ').strip(),
                'authors': authors,
                'year': year,
                'summary': entry.summary.replace('\n', ' ').strip() if hasattr(entry, 'summary') else ''
            })

        return papers
    except Exception:
        return []

# Generate topic recommendations based on recent papers
def generate_topics_from_papers(papers: list[dict], user_keywords: list[str], theory_ratio: float) -> list[TopicRecommendation]:
    """Generate research topic recommendations from arXiv papers"""

    topics = []

    # Analyze papers to extract common themes
    all_words = []
    for paper in papers:
        summary = paper.get('summary', '').lower()
        title = paper.get('title', '').lower()
        all_words.extend(summary.split() + title.split())

    # Find common mathematical terms (simplified)
    math_terms = ['cohomology', 'homology', 'manifold', 'topology', 'geometry', 'algebra',
                  'theorem', 'conjecture', 'proof', 'algorithm', 'computation', 'numerical',
                  'differential', 'integral', 'category', 'functor', 'space', 'group',
                  'ring', 'field', 'module', 'sheaf', 'bundle', 'complex']

    term_counts = Counter([word for word in all_words if word in math_terms])
    top_terms = term_counts.most_common(5)

    # Generate topics based on recent papers
    for i, paper in enumerate(papers[:5]):
        # Determine difficulty based on paper recency and complexity
        difficulty = 'intermediate'
        if 'elementary' in paper.get('summary', '').lower() or 'introduction' in paper.get('title', '').lower():
            difficulty = 'beginner'
        elif 'conjecture' in paper.get('summary', '').lower() or 'advanced' in paper.get('summary', '').lower():
            difficulty = 'advanced'

        # Determine theory/computation mix
        summary_lower = paper.get('summary', '').lower()
        is_computational = any(term in summary_lower for term in ['algorithm', 'computation', 'numerical', 'simulation', 'implementation'])
        is_theoretical = any(term in summary_lower for term in ['theorem', 'proof', 'conjecture', 'theory'])

        if is_computational and is_theoretical:
            mix = 'mixed'
        elif is_computational:
            mix = 'computation'
        else:
            mix = 'theory'

        # Generate topic based on paper
        topic = TopicRecommendation(
            title=f"Explore {top_terms[i % len(top_terms)][0].title()} in {user_keywords[0].title() if user_keywords else 'Mathematics'}",
            description=f"Investigate recent developments related to {paper['title'][:100]}...",
            motivation=f"This topic is actively researched as evidenced by recent publications. "
                      f"It connects to your interests in {', '.join(user_keywords[:2]) if user_keywords else 'mathematics'}.",
            related_papers=[{
                'ext_id': paper['ext_id'],
                'title': paper['title'],
                'year': paper['year']
            }],
            difficulty=difficulty,
            theory_computation_mix=mix,
            estimated_weeks=4 if difficulty == 'beginner' else 8 if difficulty == 'intermediate' else 12
        )

        topics.append(topic)

    # Add some curated topics based on user keywords
    if user_keywords:
        if 'topology' in [k.lower() for k in user_keywords]:
            topics.append(TopicRecommendation(
                title="Persistent Homology and Topological Data Analysis",
                description="Study the application of algebraic topology to data analysis, focusing on persistent homology and its computational aspects.",
                motivation="This is a hot area bridging pure mathematics and applications, with growing demand in ML and data science.",
                related_papers=[],
                difficulty='intermediate',
                theory_computation_mix='mixed',
                estimated_weeks=8
            ))

        if 'geometry' in [k.lower() for k in user_keywords]:
            topics.append(TopicRecommendation(
                title="Geometric Machine Learning",
                description="Explore the connections between differential geometry and machine learning, including manifold learning and geometric deep learning.",
                motivation="Combines classical geometry with modern ML techniques, offering both theoretical depth and practical applications.",
                related_papers=[],
                difficulty='advanced',
                theory_computation_mix='mixed',
                estimated_weeks=12
            ))

    return topics[:5]  # Return top 5 topics

# POST /topics/recommend - Recommend research topics
@router.post('/recommend', response_model=list[TopicRecommendation])
def recommend_topics(request: RecommendRequest, db: Session = Depends(get_db)):
    """Recommend research topics based on user profile and recent arXiv papers"""

    # Get user profile
    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please create a profile first.")

    profile_data = json.loads(profile.json)
    msc_codes = profile_data.get('msc_codes', [])
    keywords = profile_data.get('keywords', [])
    theory_ratio = profile_data.get('theory_ratio', 0.6)

    if not msc_codes and not keywords:
        raise HTTPException(status_code=400, detail="Please add MSC codes or keywords to your profile first.")

    # Search arXiv for recent papers in user's area
    papers = search_arxiv_for_topics(msc_codes, keywords, max_results=20)

    if not papers:
        # Return some default topics if no papers found
        return [
            TopicRecommendation(
                title="Foundational Study in Your Research Area",
                description="Build a strong foundation by reviewing classic results and techniques in your field.",
                motivation="Understanding foundational concepts is essential before tackling advanced problems.",
                related_papers=[],
                difficulty='beginner',
                theory_computation_mix='theory' if theory_ratio > 0.7 else 'mixed',
                estimated_weeks=6
            )
        ]

    # Generate topic recommendations
    topics = generate_topics_from_papers(papers, keywords, theory_ratio)

    # Filter by difficulty if specified
    if request.difficulty:
        topics = [t for t in topics if t.difficulty == request.difficulty]

    # Filter by focus area if specified
    if request.focus_area:
        topics = [t for t in topics if request.focus_area.lower() in t.title.lower() or
                 request.focus_area.lower() in t.description.lower()]

    return topics[:request.max_results]

# GET /topics/trending - Get trending topics in mathematics
@router.get('/trending')
def get_trending_topics(category: Optional[str] = None, db: Session = Depends(get_db)):
    """Get trending topics in mathematics from arXiv"""

    # Get general trending papers
    base_url = "http://export.arxiv.org/api/query"

    search_query = f'cat:{category}' if category else 'cat:math.GM OR cat:math.GT OR cat:math.AG'

    params = {
        'search_query': search_query,
        'start': 0,
        'max_results': 10,
        'sortBy': 'submittedDate',
        'sortOrder': 'descending'
    }

    try:
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        feed = feedparser.parse(response.content)

        trending = []
        for entry in feed.entries:
            trending.append({
                'title': entry.title.replace('\n', ' ').strip(),
                'summary': entry.summary.replace('\n', ' ').strip()[:200] + '...',
                'published': entry.published if hasattr(entry, 'published') else '',
                'arxiv_id': entry.id.split('/abs/')[-1]
            })

        return trending
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trending topics: {str(e)}")
