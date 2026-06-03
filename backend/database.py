"""
Database configuration module.
Sets up SQLAlchemy engine and session factory for SQLite.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file stored alongside the backend code
DATABASE_URL = "sqlite:///./plant_data.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite with FastAPI
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependency that provides a database session per request.
    Ensures the session is closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Create all tables in the database.
    Called once at application startup.
    """
    from models import (  # noqa: F401
        SensorReading,
        AIDiagnosis,
        WateringHistory,
        Alert,
        PlantSettings,
    )

    Base.metadata.create_all(bind=engine)
