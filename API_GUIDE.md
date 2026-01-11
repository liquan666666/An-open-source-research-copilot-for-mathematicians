# MathResearchPilot API Guide

## Overview

The MathResearchPilot API provides a RESTful interface for managing mathematical research workflows. This guide explains how to use each endpoint.

## Base URL

- Local development: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs` (Swagger UI)
- Alternative docs: `http://localhost:8000/redoc` (ReDoc)

## Quick Start Workflow

1. **Create a Profile** - Define your research interests
2. **Get Topic Recommendations** - Receive research topic suggestions
3. **Search Papers** - Find relevant papers on arXiv
4. **Create a Roadmap** - Generate a structured research plan
5. **Generate Tasks** - Get daily executable tasks
6. **Track Progress** - Use check-ins to monitor your work

---

## API Endpoints

### System Endpoints

#### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "version": "0.3.0"
}
```

---

### Profile Management

#### Create Profile
```bash
POST /profile
```

Request body:
```json
{
  "name": "Dr. Jane Smith",
  "msc_codes": ["11", "14"],
  "keywords": ["algebraic geometry", "number theory", "elliptic curves"],
  "interests": "Arithmetic geometry and connections to cryptography",
  "theory_preference": 0.7
}
```

Response:
```json
{
  "id": 1,
  "name": "Dr. Jane Smith",
  "msc_codes": ["11", "14"],
  "keywords": ["algebraic geometry", "number theory", "elliptic curves"],
  "interests": "Arithmetic geometry and connections to cryptography",
  "theory_preference": 0.7
}
```

#### Get Current Profile
```bash
GET /profile
```

#### Get Profile by ID
```bash
GET /profile/{profile_id}
```

#### Update Profile
```bash
PUT /profile/{profile_id}
```

Request body (all fields optional):
```json
{
  "keywords": ["algebraic geometry", "modular forms"],
  "theory_preference": 0.8
}
```

#### Delete Profile
```bash
DELETE /profile/{profile_id}
```

---

### Topic Recommendations

#### Get Recommended Topics
```bash
POST /topics/recommend
```

Request body:
```json
{
  "profile_id": 1,
  "num_topics": 5
}
```

Response:
```json
[
  {
    "title": "Algebraic geometry",
    "description": "Investigate algebraic geometry with focus on elliptic curves, modular forms",
    "relevance_score": 0.92,
    "related_papers": []
  },
  {
    "title": "Number theory conjectures",
    "description": "Explore recent developments in number theory conjectures",
    "relevance_score": 0.87,
    "related_papers": []
  }
]
```

#### Get MSC Categories
```bash
GET /topics/msc-categories
```

Returns a dictionary of Mathematics Subject Classification codes.

---

### Paper Management

#### Search arXiv
```bash
POST /papers/search
```

Request body:
```json
{
  "query": "elliptic curves cryptography",
  "max_results": 10
}
```

Response:
```json
{
  "results": [
    {
      "ext_id": "2301.12345",
      "title": "Elliptic Curves in Modern Cryptography",
      "authors": "Alice Smith, Bob Jones",
      "year": 2023,
      "arxiv_url": "https://arxiv.org/abs/2301.12345",
      "pdf_url": "https://arxiv.org/pdf/2301.12345.pdf",
      "summary": "This paper explores..."
    }
  ],
  "count": 10
}
```

#### Add Paper to Library
```bash
POST /papers
```

Request body:
```json
{
  "ext_id": "2301.12345",
  "title": "Elliptic Curves in Modern Cryptography",
  "authors": "Alice Smith, Bob Jones",
  "year": 2023,
  "arxiv_url": "https://arxiv.org/abs/2301.12345",
  "pdf_url": "https://arxiv.org/pdf/2301.12345.pdf"
}
```

#### List Papers
```bash
GET /papers?focus_only=false
```

Query parameters:
- `focus_only`: Boolean (default: false) - Filter to only focused papers

#### Get Paper by ID
```bash
GET /papers/{paper_id}
```

#### Update Paper
```bash
PUT /papers/{paper_id}
```

Request body:
```json
{
  "focus": true,
  "focus_pages": "1-5,10-15"
}
```

#### Delete Paper
```bash
DELETE /papers/{paper_id}
```

---

### Roadmap Management

#### Create Roadmap
```bash
POST /roadmap
```

Request body:
```json
{
  "profile_id": 1,
  "topic": "Elliptic curves in cryptography",
  "duration_weeks": 8,
  "theory_ratio": 0.6
}
```

Response:
```json
{
  "id": 1,
  "topic": "Elliptic curves in cryptography",
  "milestones": [
    {
      "phase": "Literature Review",
      "week_start": 1,
      "week_end": 2,
      "objectives": [
        "Survey recent papers on Elliptic curves in cryptography",
        "Identify key definitions and theorems"
      ],
      "deliverables": ["Annotated bibliography"],
      "type": "theory"
    }
  ],
  "created_at": "2024-01-15T00:00:00"
}
```

#### Get Current Roadmap
```bash
GET /roadmap/current
```

#### Get Roadmap by ID
```bash
GET /roadmap/{roadmap_id}
```

#### Delete Roadmap
```bash
DELETE /roadmap/{roadmap_id}
```

---

### Task Management

#### Generate Tasks
```bash
POST /tasks/generate?target_date=2024-01-15&theory_ratio=0.6
```

Query parameters (all optional):
- `target_date`: Date in YYYY-MM-DD format (default: today)
- `theory_ratio`: Float 0.0-1.0 (default: from roadmap)

Response:
```json
{
  "tasks": [
    {
      "id": 1,
      "date": "2024-01-15",
      "title": "Theory: Survey recent papers on Elliptic curves",
      "status": "todo",
      "kind": "theory",
      "description": "Survey recent papers on topic",
      "definition_of_done": "Clear progress made and documented",
      "related_papers": [],
      "estimated_hours": 2.0
    }
  ],
  "count": 3,
  "date": "2024-01-15"
}
```

#### Get Today's Tasks
```bash
GET /tasks/today
```

#### Get Tasks by Date
```bash
GET /tasks/date/2024-01-15
```

#### Update Task
```bash
PUT /tasks/{task_id}
```

Request body:
```json
{
  "status": "in_progress"
}
```

Valid statuses: `todo`, `in_progress`, `done`, `blocked`

#### Delete Today's Tasks
```bash
DELETE /tasks/today
```

#### Delete Task
```bash
DELETE /tasks/{task_id}
```

---

### Check-in Management

#### Create Check-in
```bash
POST /checkins
```

Request body:
```json
{
  "task_id": 1,
  "minutes": 90,
  "note": "Made good progress on literature review. Found 3 relevant papers.",
  "status": "progress"
}
```

Valid statuses: `progress`, `done`, `blocked`

Response:
```json
{
  "id": 1,
  "task_id": 1,
  "minutes": 90,
  "note": "Made good progress on literature review. Found 3 relevant papers.",
  "status": "progress"
}
```

#### List All Check-ins
```bash
GET /checkins?task_id=1
```

Query parameters (optional):
- `task_id`: Filter by task ID

#### Get Task Check-ins
```bash
GET /checkins/task/{task_id}
```

#### Get Task Statistics
```bash
GET /checkins/stats/{task_id}
```

Response:
```json
{
  "task_id": 1,
  "total_time_minutes": 180,
  "total_time_hours": 3.0,
  "total_checkins": 2,
  "status_breakdown": {
    "progress": 1,
    "done": 1
  },
  "notes": [
    {
      "minutes": 90,
      "note": "Made good progress...",
      "status": "progress"
    }
  ]
}
```

#### Get Daily Summary
```bash
GET /checkins/daily-summary?target_date=2024-01-15
```

Response:
```json
{
  "date": "2024-01-15",
  "total_tasks": 3,
  "total_time_minutes": 240,
  "total_time_hours": 4.0,
  "tasks_summary": [
    {
      "task_id": 1,
      "task_title": "Theory: Survey recent papers",
      "task_kind": "theory",
      "task_status": "done",
      "time_spent_minutes": 120,
      "checkin_count": 2
    }
  ]
}
```

#### Delete Check-in
```bash
DELETE /checkins/{checkin_id}
```

---

## Example Workflow with cURL

### 1. Create a profile
```bash
curl -X POST http://localhost:8000/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Smith",
    "msc_codes": ["11", "14"],
    "keywords": ["elliptic curves", "modular forms"],
    "interests": "Arithmetic geometry",
    "theory_preference": 0.7
  }'
```

### 2. Get topic recommendations
```bash
curl -X POST http://localhost:8000/topics/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": 1,
    "num_topics": 3
  }'
```

### 3. Search for papers
```bash
curl -X POST http://localhost:8000/papers/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "elliptic curves",
    "max_results": 5
  }'
```

### 4. Create a roadmap
```bash
curl -X POST http://localhost:8000/roadmap \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": 1,
    "topic": "Elliptic curves and cryptography",
    "duration_weeks": 6,
    "theory_ratio": 0.6
  }'
```

### 5. Generate tasks for today
```bash
curl -X POST http://localhost:8000/tasks/generate
```

### 6. Get today's tasks
```bash
curl http://localhost:8000/tasks/today
```

### 7. Record a check-in
```bash
curl -X POST http://localhost:8000/checkins \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": 1,
    "minutes": 120,
    "note": "Completed literature review",
    "status": "done"
  }'
```

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `204`: No Content (successful deletion)
- `400`: Bad Request
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

---

## Best Practices

1. **Always create a profile first** - The system needs a profile to generate meaningful recommendations and roadmaps.

2. **Use the workflow sequence** - Follow the natural flow: Profile → Topics → Roadmap → Tasks → Check-ins.

3. **Regular check-ins** - Record your progress regularly to get accurate time tracking and progress monitoring.

4. **Adjust theory ratio** - Experiment with different theory/computation ratios to find what works best for your research style.

5. **Focus papers** - Mark important papers as "focused" and specify page ranges for efficient reading.

6. **Clean up old tasks** - Use `DELETE /tasks/today` to clear completed tasks before generating new ones.

---

## Development Notes

- The API uses SQLite for data storage
- arXiv search is rate-limited by arXiv's API
- Task generation uses simple heuristics (in production, could use AI/LLM)
- Topic recommendations are based on MSC codes (could be enhanced with ML models)

For more details, visit the interactive API documentation at `/docs`.
