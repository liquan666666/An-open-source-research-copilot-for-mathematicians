from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from server.settings import settings

engine = create_engine(f"sqlite:///{settings.db_path}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Session:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
