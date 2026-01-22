from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, Text, Boolean, Float, DateTime
from datetime import datetime

class Base(DeclarativeBase): pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Profile(Base):
    __tablename__="profiles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    json: Mapped[str] = mapped_column(Text)

class Roadmap(Base):
    __tablename__="roadmaps"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    json: Mapped[str] = mapped_column(Text)

class Task(Base):
    __tablename__="tasks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date: Mapped[str] = mapped_column(String(16))
    title: Mapped[str] = mapped_column(String(256))
    status: Mapped[str] = mapped_column(String(32), default="todo")
    kind: Mapped[str] = mapped_column(String(16), default="theory")
    override_theory_ratio: Mapped[float] = mapped_column(Float, default=-1.0)
    json: Mapped[str] = mapped_column(Text)

class CheckIn(Base):
    __tablename__="checkins"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task_id: Mapped[int] = mapped_column(Integer)
    minutes: Mapped[int] = mapped_column(Integer)
    note: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16))

class Paper(Base):
    __tablename__="papers"
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
