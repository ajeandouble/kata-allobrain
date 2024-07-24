from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from ..database import engine, Base


class Note(Base):
    __tablename__ = "notes"
    title = Column(String)
    latest_version = Column(Integer)
    note_versions = relationship("NoteVersion", backref="note")


class NoteVersion(Base):
    __tablename__ = "notes_versions"
    content = Column(String)
    version = Column(Integer, nullable=False)
    note_id = Column(UUID(as_uuid=True), ForeignKey("notes.id"), nullable=False)


Base.metadata.create_all(engine)
