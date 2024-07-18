from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import cast, String
from ..schemas.notes import (
    PostNoteRequest,
    PostNoteResponse,
    GetNoteResponse,
    PatchNoteRequest,
    PatchNoteResponse,
)
from ..models.notes import Note as NoteModel, NoteVersion as NoteVersionModel
from sqlalchemy.dialects.postgresql import UUID
from ..database import get_db
from typing import Optional
from fastapi.responses import JSONResponse

router = APIRouter()


@router.post("/", status_code=201, response_model=PostNoteResponse)
async def create_note(
    note: PostNoteRequest,
    db: Session = Depends(get_db),
):
    note = NoteModel(**note.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    version = NoteVersionModel(
        note_id=note.id, title=note.title, content=note.content, version=0
    )
    db.add(version)
    db.commit()

    return note


@router.get("/")
async def read_all_notes(
    skip: int = 0, limit: Optional[int] = None, db: Session = Depends(get_db)
):
    query = db.query(NoteModel).order_by(NoteModel.updated_at.desc())
    if limit:
        query = query.offset(skip).limit(limit)
    notes = query.all()
    return notes


@router.get("/{id}")
async def read_note(id: str, db: Session = Depends(get_db)):
    note = db.query(NoteModel).filter(NoteModel.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.patch("/{id}", response_model=PatchNoteResponse | GetNoteResponse)
async def update_note(
    id: str, updated_note: PatchNoteRequest, db: Session = Depends(get_db)
):
    note = db.query(NoteModel).filter(NoteModel.id == id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")

    should_update = False
    for field, val in updated_note:
        if getattr(note, field) != val:
            setattr(note, field, val)
            should_update = True

    if not should_update:
        return note

    db.commit()

    last_version = (
        db.query(NoteVersionModel)
        .filter(cast(NoteVersionModel.note_id, UUID) == note.id)
        .order_by(NoteVersionModel.version.desc())
        .first()
    )
    if not last_version:
        raise HTTPException(status_code=500)

    new_version = NoteVersionModel(
        note_id=note.id,
        title=note.title,
        content=note.content,
        version=last_version.version + 1,
    )
    db.add(new_version)
    db.commit()

    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "version_id": new_version.id,
        "version": new_version.version,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
    }


@router.delete("/{id}", status_code=204)
async def delete_note(id: str, db: Session = Depends(get_db)):
    note = db.query(NoteModel).filter(NoteModel.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail=f"Note with id {id} not found")

    # Delete all associated note versions
    db.query(NoteVersionModel).filter(NoteVersionModel.note_id == note.id).delete(
        synchronize_session=False
    )
    db.commit()

    # Delete the note itself
    db.delete(note)
    db.commit()


@router.get("/{id}/versions")
async def get_note_versions(id: str, db: Session = Depends(get_db)):
    note = (
        db.query(NoteVersionModel)
        .filter(cast(NoteVersionModel.note_id, UUID) == id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note_versions = (
        db.query(NoteVersionModel)
        .filter(cast(NoteVersionModel.note_id, UUID) == id)
        .order_by(NoteVersionModel.version.desc())
        .all()
    )

    if not note_versions:
        raise HTTPException(status_code=500)

    return note_versions
