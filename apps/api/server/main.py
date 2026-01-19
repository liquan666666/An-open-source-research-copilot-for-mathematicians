from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routes import auth, profile, topics, papers, roadmap, tasks, checkins, payments, stats, export
from server.db.init_db import init_db
from server.settings import settings

app = FastAPI(
    title="MathResearchPilot API",
    description="API for Mathematical Research Copilot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db(settings.db_path)

# Health check endpoint
@app.get("/")
def root():
    return {
        "message": "MathResearchPilot API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(topics.router)
app.include_router(papers.router)
app.include_router(roadmap.router)
app.include_router(tasks.router)
app.include_router(checkins.router)
app.include_router(payments.router)
app.include_router(stats.router)
app.include_router(export.router)
