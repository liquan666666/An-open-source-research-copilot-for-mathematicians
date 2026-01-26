# An Open-Source Research Copilot for Mathematicians

**An AI-powered research assistant for mathematicians**

An open-source research execution system designed for mathematicians and researchers.
It helps turn vague research ideas into **executable, supervised, and explainable daily research tasks**.

> This is not a theorem prover.
> It is a comprehensive system for **doing mathematical research consistently** with AI-powered insights.

**🎉 Version 1.0.0-rc1 - All Backend Features Complete!**

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

### Core Research Management
- 📚 **Academic Paper Search** - Search arXiv and Crossref (SCI journals)
- ⭐ **Paper Collection** - Save and annotate research papers
- 📝 **Task Management** - Create, track, and prioritize research tasks
- ✅ **Daily Check-ins** - Track progress with mood and completion rates
- 🎯 **Research Interests** - Manage topics with difficulty levels and priorities

### AI-Powered Intelligence
- 🤖 **Smart Paper Analysis** - AI extracts key concepts, difficulty, methodology
- 💡 **Personalized Recommendations** - AI suggests papers and tasks based on your interests
- 🗺️ **Dynamic Roadmap Generation** - AI creates structured learning plans
- 📊 **Achievement System** - 10 badges to gamify your research journey

### Analytics & Insights
- 📈 **Statistics Dashboard** - Track tasks, check-ins, papers, and more
- 🔥 **Streak Tracking** - Monitor daily check-in streaks
- 📊 **Activity Heatmap** - GitHub-style visualization of your research activity
- 📉 **Time Series Analysis** - Visualize progress over time

### Data & Integration
- 💾 **Data Export** - Export all data as JSON or CSV
- 🔐 **User Authentication** - Secure JWT-based auth system
- 💳 **Stripe Integration** - Subscription management ready
- 🌐 **RESTful API** - 57 well-documented endpoints

---

## Typical Workflow

### For New Users

1. **Register & Setup** - Create account and add research interests
2. **Discover Papers** - Search arXiv and Crossref for relevant papers
3. **AI Analysis** - Let AI analyze papers to understand difficulty and concepts
4. **Get Recommendations** - Receive personalized paper and task suggestions
5. **Generate Roadmap** - AI creates a structured learning plan
6. **Daily Tasks** - Break down the roadmap into actionable daily tasks
7. **Track Progress** - Daily check-ins with mood and completion tracking
8. **View Achievements** - Unlock badges as you progress

### AI-Enhanced Research Loop

```
Research Interest → AI Recommendations → Paper Search
        ↓                                      ↓
  Roadmap Generation ← AI Analysis ← Save Papers
        ↓                                      ↓
   Create Tasks          →        Daily Check-ins
        ↓                                      ↓
   Track Stats          ←      Complete Tasks
```

---

## Quick Start

### Prerequisites

- Docker and Docker Compose
- (Optional) OpenAI or Anthropic API key for AI features

### Installation

```bash
# Clone repository
git clone https://github.com/liquan666666/An-open-source-research-copilot-for-mathematicians.git
cd An-open-source-research-copilot-for-mathematicians

# Configure environment (optional for AI features)
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env and add:
# ANTHROPIC_API_KEY=your-key  # or OPENAI_API_KEY=your-key

# Start all services
docker-compose up --build

# Access the application
# Web UI: http://localhost:3000
# API Docs: http://localhost:8000/docs
# Health Check: http://localhost:8000/health
```

### First Steps

1. **Register** - Create an account at http://localhost:8000/docs
2. **Explore API** - Try endpoints in the interactive Swagger UI
3. **Read Guide** - See [QUICK_START.md](./QUICK_START.md) for detailed walkthrough

📚 **Full Documentation:**
- [Quick Start Guide](./QUICK_START.md) - 10-minute tutorial
- [API Reference](./API_REFERENCE.md) - Complete endpoint documentation
- [AI Features Guide](./AI功能使用说明.md) - AI configuration and usage
- [Implementation Progress](./实施进度.md) - Development timeline

---

## Technology Stack

### Backend (100% Complete ✅)
- **Framework**: FastAPI (Python 3.11)
- **Database**: SQLAlchemy ORM with SQLite (PostgreSQL ready)
- **Authentication**: JWT tokens with bcrypt password hashing
- **AI Integration**: OpenAI GPT-4 & Anthropic Claude 3.5
- **External APIs**: arXiv, Crossref, Stripe

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context API

### DevOps
- **Containerization**: Docker & Docker Compose
- **API Documentation**: Swagger UI / ReDoc

---

## API Overview

### Authentication (6 endpoints)
- User registration, login, token refresh
- Password management
- Profile access

### Research Management (31 endpoints)
- **Papers**: Search, save, annotate (7 endpoints)
- **Tasks**: CRUD, filtering, completion (9 endpoints)
- **Check-ins**: Daily tracking, streaks, calendar (7 endpoints)
- **Profile**: User info, research interests (9 endpoints)

### AI Intelligence (10 endpoints)
- **Analysis**: Smart paper analysis (3 endpoints)
- **Recommendations**: Papers, tasks, strategies (3 endpoints)
- **Roadmaps**: AI-generated learning plans (4 endpoints)

### Analytics & Export (10 endpoints)
- **Statistics**: Overview, achievements, heatmap (5 endpoints)
- **Export**: JSON and CSV data export (5 endpoints)

**Total: 57 REST API endpoints**

---

## Project Status

### ✅ Completed (v1.0.0-rc1)

All four implementation stages are complete:

1. **Infrastructure** (100%)
   - 11 database models
   - JWT authentication system
   - Environment configuration

2. **Core Features** (100%)
   - Task management with priorities
   - Daily check-in system
   - Paper search and collection
   - User profile and interests

3. **AI Intelligence** (100%)
   - Smart paper analysis
   - Personalized recommendations
   - Dynamic roadmap generation
   - Statistics and achievements

4. **Enhancements** (100%)
   - Data export (JSON/CSV)
   - Stripe payment integration
   - Comprehensive API documentation

### 📊 Statistics
- **Code**: ~4,260 lines of production code
- **API Endpoints**: 57 endpoints
- **Data Models**: 11 models
- **Development Time**: ~29 hours
- **Completion**: 100% (backend)

### 🚧 In Progress
- Frontend integration with real APIs (~20-30 hours)
- End-to-end testing (~10-15 hours)

---

## AI Features

### Configuration

Add to `apps/api/.env`:
```bash
# Option 1: Anthropic Claude (Recommended - cheaper)
ANTHROPIC_API_KEY=sk-ant-api03-xxx...

# Option 2: OpenAI GPT-4
OPENAI_API_KEY=sk-xxx...
```

### Cost Estimate (Monthly, moderate use)
- **Anthropic Claude**: ~$5-13/month
- **OpenAI GPT-4**: ~$15-35/month

### Capabilities
- 📄 **Paper Analysis**: Extract key concepts, assess difficulty, identify prerequisites
- 💡 **Smart Recommendations**: Suggest relevant papers and learning tasks
- 🗺️ **Roadmap Generation**: Create structured 12-24 week learning plans

---

## Development

### Project Structure
```
An-open-source-research-copilot-for-mathematicians/
├── apps/
│   ├── api/                    # FastAPI backend
│   │   ├── server/
│   │   │   ├── routes/        # 57 API endpoints
│   │   │   ├── db/            # Database models
│   │   │   ├── auth/          # JWT authentication
│   │   │   └── services/      # AI service layer
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── web/                    # Next.js frontend
├── docs/                       # Documentation
├── docker-compose.yml
└── README.md
```

### Running Tests
```bash
# API health check
curl http://localhost:8000/health

# Interactive API testing
open http://localhost:8000/docs
```

### Database Migrations
```bash
# Reset database
docker-compose down
rm apps/api/data/mrp.sqlite
docker-compose up -d
```

---

## Contributing

Contributions are welcome! Areas for improvement:

1. **Frontend Integration** - Connect UI to all backend APIs
2. **Testing** - Add unit and integration tests
3. **Performance** - Optimize database queries
4. **Features** - Additional AI capabilities
5. **Documentation** - Tutorials and examples

---

## License

[Add your license here]

---

## Acknowledgments

- arXiv API for academic paper access
- Crossref API for SCI journal metadata
- OpenAI and Anthropic for AI capabilities
- FastAPI and Next.js communities

---

## Contact & Support

- **Documentation**: See [docs](./docs) folder
- **API Docs**: http://localhost:8000/docs
- **Issues**: [GitHub Issues](https://github.com/liquan666666/An-open-source-research-copilot-for-mathematicians/issues)

---

**Version**: 1.0.0-rc1
**Status**: Backend 100% Complete ✅
**Last Updated**: 2026-01-19
