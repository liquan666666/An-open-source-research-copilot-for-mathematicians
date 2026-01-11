from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from server.db.session import get_db
from server.db.models import Profile
from server.schemas import TopicRecommendRequest, TopicResponse
from typing import List
import json
import random

router = APIRouter(prefix='/topics', tags=['topics'])


def generate_topic_recommendations(profile_data: dict, num_topics: int) -> List[TopicResponse]:
    """
    Generate research topic recommendations based on profile.
    This is a simplified implementation. In production, this could use:
    - ML models trained on mathematical research data
    - arXiv paper analysis
    - Citation network analysis
    - Collaboration with external recommendation services
    """
    msc_codes = profile_data.get("msc_codes", [])
    keywords = profile_data.get("keywords", [])
    interests = profile_data.get("interests", "")

    # MSC Code to topic mapping (simplified examples)
    msc_topic_map = {
        "03": ["Logic and model theory", "Set theory applications", "Proof theory foundations"],
        "05": ["Combinatorial structures", "Graph theory problems", "Discrete optimization"],
        "11": ["Number theory conjectures", "Diophantine equations", "Analytic number theory"],
        "14": ["Algebraic geometry", "Scheme theory", "Moduli spaces"],
        "18": ["Category theory", "Homological algebra", "Topos theory"],
        "35": ["Partial differential equations", "Nonlinear PDEs", "Elliptic equations"],
        "46": ["Functional analysis", "Operator theory", "Banach spaces"],
        "53": ["Differential geometry", "Riemannian manifolds", "Geometric flows"],
        "60": ["Probability theory", "Stochastic processes", "Random matrices"],
        "68": ["Computational complexity", "Algorithm design", "Theoretical computer science"],
    }

    # Generate topics based on MSC codes
    candidate_topics = []

    for msc in msc_codes:
        # Extract first 2 digits of MSC code
        msc_prefix = msc[:2] if len(msc) >= 2 else msc

        if msc_prefix in msc_topic_map:
            for topic_name in msc_topic_map[msc_prefix]:
                # Generate topic with keywords if available
                keyword_str = ", ".join(keywords[:3]) if keywords else ""
                if keyword_str:
                    description = f"Investigate {topic_name.lower()} with focus on {keyword_str}"
                else:
                    description = f"Explore recent developments in {topic_name.lower()}"

                candidate_topics.append({
                    "title": topic_name,
                    "description": description,
                    "msc_code": msc_prefix,
                    "relevance_score": random.uniform(0.7, 0.95)
                })

    # If we have keywords but no MSC codes, generate generic topics
    if not candidate_topics and keywords:
        for keyword in keywords[:5]:
            candidate_topics.append({
                "title": f"Research in {keyword}",
                "description": f"Explore fundamental questions and recent advances in {keyword}",
                "msc_code": "",
                "relevance_score": random.uniform(0.6, 0.85)
            })

    # If still no topics, provide default recommendations
    if not candidate_topics:
        default_topics = [
            {
                "title": "Interdisciplinary mathematical research",
                "description": "Explore connections between different areas of mathematics",
                "msc_code": "",
                "relevance_score": 0.5
            },
            {
                "title": "Computational methods in pure mathematics",
                "description": "Develop computational approaches to classical mathematical problems",
                "msc_code": "",
                "relevance_score": 0.5
            }
        ]
        candidate_topics.extend(default_topics)

    # Sort by relevance and return top N
    candidate_topics.sort(key=lambda x: x["relevance_score"], reverse=True)
    selected_topics = candidate_topics[:num_topics]

    # Convert to TopicResponse format
    results = []
    for topic in selected_topics:
        results.append(TopicResponse(
            title=topic["title"],
            description=topic["description"],
            relevance_score=topic["relevance_score"],
            related_papers=[]  # Could be populated by searching arXiv
        ))

    return results


@router.post('/recommend', response_model=List[TopicResponse])
def recommend_topics(request: TopicRecommendRequest, db: Session = Depends(get_db)):
    """
    Recommend research topics based on researcher profile
    """
    # Get profile
    profile = db.query(Profile).filter(Profile.id == request.profile_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail=f"Profile {request.profile_id} not found")

    # Parse profile data
    profile_data = json.loads(profile.json)

    # Generate recommendations
    try:
        topics = generate_topic_recommendations(profile_data, request.num_topics)
        return topics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


@router.get('/msc-categories')
def get_msc_categories():
    """Get a list of common MSC (Mathematics Subject Classification) categories"""
    categories = {
        "03": "Mathematical logic and foundations",
        "05": "Combinatorics",
        "06": "Order, lattices, ordered algebraic structures",
        "08": "General algebraic systems",
        "11": "Number theory",
        "12": "Field theory and polynomials",
        "13": "Commutative algebra",
        "14": "Algebraic geometry",
        "15": "Linear and multilinear algebra; matrix theory",
        "16": "Associative rings and algebras",
        "17": "Nonassociative rings and algebras",
        "18": "Category theory; homological algebra",
        "19": "K-theory",
        "20": "Group theory and generalizations",
        "22": "Topological groups, Lie groups",
        "26": "Real functions",
        "28": "Measure and integration",
        "30": "Functions of a complex variable",
        "31": "Potential theory",
        "32": "Several complex variables and analytic spaces",
        "33": "Special functions",
        "34": "Ordinary differential equations",
        "35": "Partial differential equations",
        "37": "Dynamical systems and ergodic theory",
        "39": "Difference and functional equations",
        "40": "Sequences, series, summability",
        "41": "Approximations and expansions",
        "42": "Harmonic analysis on Euclidean spaces",
        "43": "Abstract harmonic analysis",
        "44": "Integral transforms, operational calculus",
        "45": "Integral equations",
        "46": "Functional analysis",
        "47": "Operator theory",
        "49": "Calculus of variations and optimal control",
        "51": "Geometry",
        "52": "Convex and discrete geometry",
        "53": "Differential geometry",
        "54": "General topology",
        "55": "Algebraic topology",
        "57": "Manifolds and cell complexes",
        "58": "Global analysis, analysis on manifolds",
        "60": "Probability theory and stochastic processes",
        "62": "Statistics",
        "65": "Numerical analysis",
        "68": "Computer science",
        "70": "Mechanics of particles and systems",
        "74": "Mechanics of deformable solids",
        "76": "Fluid mechanics",
        "78": "Optics, electromagnetic theory",
        "80": "Classical thermodynamics, heat transfer",
        "81": "Quantum theory",
        "82": "Statistical mechanics, structure of matter",
        "83": "Relativity and gravitational theory",
        "85": "Astronomy and astrophysics",
        "86": "Geophysics",
        "90": "Operations research, mathematical programming",
        "91": "Game theory, economics, social and behavioral sciences",
        "92": "Biology and other natural sciences",
        "93": "Systems theory; control",
        "94": "Information and communication, circuits"
    }

    return {"categories": categories}
