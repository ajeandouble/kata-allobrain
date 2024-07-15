from sqlalchemy import Column, Integer, String, Boolean, UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Note(Base):
    __tablename__ = "notes"
    id = Column(UUID, primary_key=True)
    title = Column(String)
    content = Column(String)
    updated = Column(Boolean)
