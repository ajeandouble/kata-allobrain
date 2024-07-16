from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import cast, String
from ..schemas.notes import (
    PutNoteRequest,
    PutNoteResponse,
    PostNoteRequest,
    PostNoteResponse,
)
from ..models.notes import Note as NoteModel, NoteVersion as NoteVersionModel
from sqlalchemy.dialects.postgresql import UUID
from ..database import session, get_db
from typing import List
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/")
async def get_all_notes(db: Session = Depends(get_db)):
    all_notes = db.query(NoteModel).all()
    return all_notes


@router.get("/{id}")
async def get_note(id: str, db: Session = Depends(get_db)):
    note = db.query(NoteModel).filter(NoteModel.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.post("/", response_model=PostNoteResponse)
async def post_note(
    note: PostNoteRequest,
    db: Session = Depends(get_db),
):
    note = NoteModel(**note.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)

    version = NoteVersionModel(
        note_id=note.id, title=note.title, content=note.content, version=1
    )
    db.add(version)
    db.commit()

    return {
        "id": str(note.id),
        "title": note.title,
        "content": note.content,
    }


@router.patch("/{id}", response_model=PutNoteResponse)
async def update_note(
    id: str, updated_note: PutNoteRequest, db: Session = Depends(get_db)
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
        return JSONResponse(status_code=status.HTTP_200_OK, content={})

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

    return note


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
