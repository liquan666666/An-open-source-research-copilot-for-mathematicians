from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from server.routes import profile, topics, papers, roadmap, tasks, checkins
from server.db.init_db import init_db
from server.settings import settings
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app with enhanced documentation
app = FastAPI(
    title="MathResearchPilot API",
    description="""
    An open-source research execution system for mathematicians.

    This API helps turn vague research ideas into executable, supervised,
    and explainable daily research tasks.

    ## Features

    * **Profile Management**: Create and manage researcher profiles
    * **Topic Recommendations**: Get research topic suggestions based on profile
    * **Paper Library**: Search arXiv and manage paper collections
    * **Research Roadmaps**: Generate structured research plans
    * **Daily Tasks**: Automatic task generation and tracking
    * **Check-ins**: Monitor progress and track time spent
    """,
    version="0.3.0",
    contact={
        "name": "MathResearchPilot",
        "url": "https://github.com/liquan666666/An-open-source-research-copilot-for-mathematicians",
    },
    license_info={
        "name": "MIT License",
    },
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")

    # Process request
    response = await call_next(request)

    # Log response
    process_time = time.time() - start_time
    logger.info(f"Response: {response.status_code} - Time: {process_time:.3f}s")

    return response


# Custom exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed messages"""
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation Error",
            "errors": exc.errors(),
            "body": str(exc.body) if hasattr(exc, 'body') else None
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors"""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal Server Error",
            "message": str(exc)
        },
    )


# Startup event
@app.on_event("startup")
def startup():
    """Initialize database and log startup"""
    logger.info("Starting MathResearchPilot API...")
    try:
        init_db(settings.db_path)
        logger.info(f"Database initialized at {settings.db_path}")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


# Shutdown event
@app.on_event("shutdown")
def shutdown():
    """Log shutdown"""
    logger.info("Shutting down MathResearchPilot API...")


# Health check endpoint
@app.get("/health", tags=["system"])
def health_check():
    """Check if the API is running"""
    return {"status": "healthy", "version": "0.3.0"}


# Root endpoint
@app.get("/", tags=["system"])
def root():
    """API root endpoint with basic information"""
    return {
        "message": "MathResearchPilot API",
        "version": "0.3.0",
        "docs": "/docs",
        "health": "/health"
    }


# Include routers
app.include_router(profile.router)
app.include_router(topics.router)
app.include_router(papers.router)
app.include_router(roadmap.router)
app.include_router(tasks.router)
app.include_router(checkins.router)
