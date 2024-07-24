from fastapi import APIRouter, Depends, HTTPException, Path
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
from uuid import UUID

router = APIRouter()


@router.post("/", status_code=201, response_model=PostNoteResponse)
async def create_note(
    note: PostNoteRequest,
    db: Session = Depends(get_db),
):
    new_note = NoteModel(title=note.title, latest_version=0)
    db.add(new_note)
    db.flush()
    new_version = NoteVersionModel(note_id=new_note.id, content="", version=0)
    db.add(new_version)
    db.commit()
    return new_note


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
async def read_note(id: UUID, db: Session = Depends(get_db)):
    note = db.query(NoteModel).filter(NoteModel.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.patch("/{id}", response_model=PatchNoteResponse | GetNoteResponse)
async def update_note(id: UUID, body: PatchNoteRequest, db: Session = Depends(get_db)):
    note = db.query(NoteModel).filter(NoteModel.id == id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")

    if body.title:
        note.title = body.title

    latest_version = int(note.latest_version) + 1
    note.latest_version = latest_version

    new_version = NoteVersionModel(
        note_id=note.id, content=body.content, version=latest_version
    )
    db.add(new_version)
    db.commit()

    return note


@router.delete("/{id}", status_code=204)
async def delete_note(id: UUID, db: Session = Depends(get_db)):
    note = db.query(NoteModel).filter(NoteModel.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail=f"Note with id {id} not found")

    db.query(NoteVersionModel).filter(NoteVersionModel.note_id == note.id).delete(
        synchronize_session=False
    )
    db.delete(note)
    db.commit()


@router.get("/{id}/versions")
async def get_note_versions(id: UUID, db: Session = Depends(get_db)):
    note = db.query(NoteModel).filter(NoteModel.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note_versions = (
        db.query(NoteVersionModel)
        .filter(NoteVersionModel.note_id == id)
        .order_by(NoteVersionModel.version.desc())
        .all()
    )

    if not note_versions:
        raise HTTPException(status_code=500)

    return note_versions


@router.get("/{id}/versions/latest")
async def get_latest_note_version(id: UUID, db: Session = Depends(get_db)):
    note = db.query(NoteModel).filter(NoteModel.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    latest_version = (
        db.query(NoteVersionModel)
        .filter(NoteVersionModel.note_id == id)
        .order_by(NoteVersionModel.version.desc())
        .limit(1)
        .first()
    )

    if not latest_version:
        raise HTTPException(status_code=500)

    return latest_version
