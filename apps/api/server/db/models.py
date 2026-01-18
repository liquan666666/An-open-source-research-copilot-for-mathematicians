from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Date
from datetime import datetime
from typing import Optional, List

class Base(DeclarativeBase):
    pass

# User and Authentication Models
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    research_interests: Mapped[List["ResearchInterest"]] = relationship("ResearchInterest", back_populates="user", cascade="all, delete-orphan")
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    checkins: Mapped[List["CheckIn"]] = relationship("CheckIn", back_populates="user", cascade="all, delete-orphan")
    saved_papers: Mapped[List["SavedPaper"]] = relationship("SavedPaper", back_populates="user", cascade="all, delete-orphan")
    roadmaps: Mapped[List["Roadmap"]] = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    subscription: Mapped[Optional["Subscription"]] = relationship("Subscription", back_populates="user", uselist=False)
    activities: Mapped[List["UserActivity"]] = relationship("UserActivity", back_populates="user", cascade="all, delete-orphan")

class ResearchInterest(Base):
    __tablename__ = "research_interests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    level: Mapped[str] = mapped_column(String(50), default="beginner")  # beginner/intermediate/advanced
    priority: Mapped[str] = mapped_column(String(50), default="medium")  # high/medium/low
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="research_interests")

# Task Management
class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(50), default="medium")  # high/medium/low
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending/in_progress/completed
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Legacy fields for backward compatibility
    date: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    kind: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    override_theory_ratio: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="tasks")

# Check-in System
class CheckIn(Base):
    __tablename__ = "checkins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    date: Mapped[datetime] = mapped_column(Date, nullable=False, index=True)
    mood: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # happy/neutral/frustrated/tired
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    difficulties: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tasks_completed: Mapped[int] = mapped_column(Integer, default=0)
    tasks_total: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Legacy fields for backward compatibility
    task_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="checkins")

# Saved Papers
class SavedPaper(Base):
    __tablename__ = "saved_papers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    paper_id: Mapped[str] = mapped_column(String(255), nullable=False)  # arXiv ID or DOI
    title: Mapped[str] = mapped_column(Text, nullable=False)
    authors: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    abstract: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False)  # arxiv/crossref
    url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    saved_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="saved_papers")

# Roadmap System
class Roadmap(Base):
    __tablename__ = "roadmaps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_weeks: Mapped[int] = mapped_column(Integer, default=12)
    status: Mapped[str] = mapped_column(String(50), default="active")  # active/completed/archived
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Legacy field for backward compatibility
    json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="roadmaps")
    stages: Mapped[List["RoadmapStage"]] = relationship("RoadmapStage", back_populates="roadmap", cascade="all, delete-orphan")

class RoadmapStage(Base):
    __tablename__ = "roadmap_stages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    roadmap_id: Mapped[int] = mapped_column(Integer, ForeignKey("roadmaps.id"), nullable=False)
    stage_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    start_week: Mapped[int] = mapped_column(Integer, nullable=False)
    end_week: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending/in_progress/completed

    # Relationships
    roadmap: Mapped["Roadmap"] = relationship("Roadmap", back_populates="stages")
    items: Mapped[List["RoadmapItem"]] = relationship("RoadmapItem", back_populates="stage", cascade="all, delete-orphan")

class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    stage_id: Mapped[int] = mapped_column(Integer, ForeignKey("roadmap_stages.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estimated_hours: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    resources: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    stage: Mapped["RoadmapStage"] = relationship("RoadmapStage", back_populates="items")

# Subscription Management
class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    plan: Mapped[str] = mapped_column(String(50), default="trial")  # trial/monthly/yearly/lifetime
    status: Mapped[str] = mapped_column(String(50), default="active")  # active/canceled/expired
    start_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="subscription")

# User Activity Tracking
class UserActivity(Base):
    __tablename__ = "user_activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type: Mapped[str] = mapped_column(String(100), nullable=False)  # page_view/search/task_complete/checkin
    activity_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="activities")

# Legacy Profile model (keeping for backward compatibility)
class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    json: Mapped[str] = mapped_column(Text)

# Legacy Paper model (keeping for backward compatibility)
class Paper(Base):
    __tablename__ = "papers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ext_id: Mapped[str] = mapped_column(String(64))
    title: Mapped[str] = mapped_column(Text)
    authors: Mapped[str] = mapped_column(Text)
    year: Mapped[int] = mapped_column(Integer)
    arxiv_url: Mapped[str] = mapped_column(Text)
    pdf_url: Mapped[str] = mapped_column(Text)
    local_path: Mapped[str] = mapped_column(Text)
    focus: Mapped[bool] = mapped_column(Boolean, default=False)
    focus_pages: Mapped[str] = mapped_column(String(64), default="")
