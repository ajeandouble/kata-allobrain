from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from ..database import engine, Base


class NoteVersion(Base):
    __tablename__ = "notes_versions"
    title = Column(String)
    content = Column(String)
    version = Column(Integer, nullable=False)
    note_id = Column(UUID(as_uuid=True), ForeignKey("notes.id"), nullable=False)
    note = relationship("Note", back_populates="note_versions")


class Note(Base):
    __tablename__ = "notes"
    title = Column(String)
    content = Column(String)
    note_versions = relationship(
        NoteVersion, back_populates="note", cascade="all, delete-orphan"
    )


Base.metadata.create_all(engine)
