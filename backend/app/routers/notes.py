from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas.notes import NoteResponse
from ..models.notes import Note as NoteModel
from ..database import session, get_db

# from ..models.notes import Notes

router = APIRouter()


@router.post("/notes/", response_model=NoteResponse)
async def post_note(
    title: str,
    content: str,
    db: Session = Depends(get_db),
):  # NOTE: is db param useful?
    note = NoteModel(title=title, content=content, updated=False)
    session.add(note)
    session.commit()
    return note
