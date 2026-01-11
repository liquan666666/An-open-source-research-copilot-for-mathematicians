# An Open-Source Research Copilot for Mathematicians

**An explainable research copilot for mathematicians**

An open-source research execution system designed for mathematicians.  
It helps turn vague research ideas into **executable, supervised, and explainable daily research tasks**.

> This is not a theorem prover.  
> It is a system for **doing mathematical research consistently**.

---

## Why this project?

Most existing research tools focus on:
- what a theorem says
- which papers are relevant

However, real mathematical research often struggles with:
- not knowing what to do today
- reading papers without a concrete plan
- getting stuck without structured feedback
- invisible or unmeasurable progress

**This project focuses on research execution, not just information retrieval.**

---

## Key Features

- 🎯 Research topic recommendation based on researcher profile
- 📚 arXiv-based paper search and open-access (OA) download
- ⭐ Focus papers with user-defined reading page ranges
- 🧭 Hybrid theory / computation research roadmaps
- 📅 Daily executable research tasks with Definition of Done (DoD)
- 🎚 Automatic and manual control of theory/computation task ratio
- 🔍 Fully explainable task → paper → page → source linkage

---

## Typical Workflow

1. Define your research profile (MSC, keywords, preferences)
2. Receive recommended research topics
3. Generate a research roadmap
4. Select focus papers and annotate reading ranges
5. Receive daily executable research tasks
6. Check in progress and continuously refine your research direction

---

## Quick Start (Docker)

```bash
git clone https://github.com/liquan666666/An-open-source-research-copilot-for-mathematicians.git
cd An-open-source-research-copilot-for-mathematicians
docker compose up --build
```

After starting, access:
- Web UI: http://localhost:3000
- API Docs: http://localhost:8000/docs
- API: http://localhost:8000

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│              http://localhost:3000                   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│              Backend API (FastAPI)                   │
│              http://localhost:8000                   │
│  ┌───────────────────────────────────────────────┐  │
│  │  Profile → Topics → Roadmap → Tasks → Checkins │ │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│              Database (SQLite)                       │
│              /app/data/mrp.sqlite                    │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│              External APIs                           │
│              arXiv.org (paper search)                │
└─────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Core Functionality

- **Profile Management**: `POST /profile`, `GET /profile`, `PUT /profile/{id}`
- **Topic Recommendations**: `POST /topics/recommend`
- **Paper Library**: `POST /papers/search`, `GET /papers`, `POST /papers`
- **Roadmap Generation**: `POST /roadmap`, `GET /roadmap/current`
- **Task Management**: `POST /tasks/generate`, `GET /tasks/today`
- **Progress Tracking**: `POST /checkins`, `GET /checkins/daily-summary`

For detailed API documentation, see [API_GUIDE.md](./API_GUIDE.md) or visit http://localhost:8000/docs

---

## Example Usage

### 1. Create a Research Profile

```bash
curl -X POST http://localhost:8000/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Smith",
    "msc_codes": ["11", "14"],
    "keywords": ["elliptic curves", "modular forms"],
    "interests": "Arithmetic geometry and its applications",
    "theory_preference": 0.7
  }'
```

### 2. Get Topic Recommendations

```bash
curl -X POST http://localhost:8000/topics/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": 1,
    "num_topics": 5
  }'
```

### 3. Search arXiv for Papers

```bash
curl -X POST http://localhost:8000/papers/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "elliptic curves cryptography",
    "max_results": 10
  }'
```

### 4. Create a Research Roadmap

```bash
curl -X POST http://localhost:8000/roadmap \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": 1,
    "topic": "Elliptic curves in modern cryptography",
    "duration_weeks": 8,
    "theory_ratio": 0.6
  }'
```

### 5. Generate Daily Tasks

```bash
curl -X POST http://localhost:8000/tasks/generate
```

### 6. Record Progress

```bash
curl -X POST http://localhost:8000/checkins \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": 1,
    "minutes": 120,
    "note": "Completed literature review of 3 key papers",
    "status": "done"
  }'
```

---

## Project Structure

```
An-open-source-research-copilot-for-mathematicians/
├── apps/
│   ├── api/                    # Backend API (FastAPI)
│   │   ├── server/
│   │   │   ├── db/            # Database models and session
│   │   │   ├── routes/        # API endpoints
│   │   │   ├── main.py        # FastAPI application
│   │   │   ├── schemas.py     # Pydantic models
│   │   │   └── settings.py    # Configuration
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── web/                    # Frontend (Next.js)
│       ├── app/
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml
├── API_GUIDE.md               # Detailed API documentation
├── README.md                  # This file
└── .gitignore
```

---

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: Database ORM
- **Pydantic**: Data validation
- **feedparser**: arXiv API integration
- **SQLite**: Lightweight database

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type-safe JavaScript
- **React 18**: UI library

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

---

## Development

### Backend Development

```bash
cd apps/api
pip install -r requirements.txt
uvicorn server.main:app --reload
```

### Frontend Development

```bash
cd apps/web
npm install
npm run dev
```

---

## Configuration

### Environment Variables

Backend (apps/api):
- `MRP_DB_PATH`: Database file path (default: `./data/mrp.sqlite`)
- `CORS_ORIGINS`: Allowed CORS origins (default: `http://localhost:3000`)

Frontend (apps/web):
- `NEXT_PUBLIC_API_BASE`: API base URL (default: `http://localhost:8000`)

---

## Version History

### v0.3.0 (Current)
- ✅ Full API implementation with all core features
- ✅ Profile management (create, read, update, delete)
- ✅ Topic recommendation based on MSC codes and keywords
- ✅ arXiv paper search and library management
- ✅ Research roadmap generation with milestones
- ✅ Automatic daily task generation
- ✅ Progress tracking with check-ins
- ✅ Enhanced error handling and logging
- ✅ Comprehensive API documentation
- ✅ Health check and monitoring endpoints

### v0.2.0
- Initial public release with web UI and API structure
- Basic project skeleton

---

## Roadmap

### Phase 1 (Current)
- [x] Core API functionality
- [x] Basic task generation
- [x] arXiv integration
- [ ] Enhanced frontend UI with forms and dashboards

### Phase 2 (Future)
- [ ] AI-powered task generation using LLMs
- [ ] Smart paper recommendations
- [ ] Collaborative features
- [ ] Advanced analytics and insights
- [ ] PDF processing and annotation
- [ ] Citation network analysis

### Phase 3 (Long-term)
- [ ] Integration with proof assistants
- [ ] Community knowledge base
- [ ] Research group management
- [ ] Publication pipeline support

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- Mathematics Subject Classification (MSC) maintained by zbMATH and MathSciNet
- arXiv.org for providing open access to research papers
- The mathematical research community for inspiration

---

## Support

- Documentation: [API_GUIDE.md](./API_GUIDE.md)
- Issues: [GitHub Issues](https://github.com/liquan666666/An-open-source-research-copilot-for-mathematicians/issues)
- API Docs: http://localhost:8000/docs (when running)

---

## Citation

If you use this tool in your research, please cite:

```bibtex
@software{mathresearchpilot2024,
  title = {MathResearchPilot: An Open-Source Research Copilot for Mathematicians},
  author = {Your Name},
  year = {2024},
  url = {https://github.com/liquan666666/An-open-source-research-copilot-for-mathematicians}
}
```
