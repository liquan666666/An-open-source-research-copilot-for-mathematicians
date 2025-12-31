from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routes import profile, topics, papers, roadmap, tasks, checkins
from server.db.init_db import init_db
from server.settings import settings

app = FastAPI(title="MathResearchPilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db(settings.db_path)

app.include_router(profile.router)
app.include_router(topics.router)
app.include_router(papers.router)
app.include_router(roadmap.router)
app.include_router(tasks.router)
app.include_router(checkins.router)
