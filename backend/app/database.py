from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4
from sqlalchemy.orm import sessionmaker
import time
from .config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection(max_retries=10, wait_seconds=5):
    for _ in range(max_retries):
        try:
            with engine.connect() as connection:
                if connection:
                    print("Database connection established")
                    return True
        except Exception as e:
            print(f"Database connection failed: {e}")
            print(f"Retrying in {wait_seconds} seconds...")
            time.sleep(wait_seconds)
    return False


class BaseModel:
    """
    Augmented Base class for UUID-based models.
    """

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now())


Base = declarative_base(cls=BaseModel)
