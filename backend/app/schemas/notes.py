from pydantic import BaseModel, Field, UUID4
from datetime import datetime

NOTE_TITLE_MIN_LENGTH = 5
NOTE_TITLE_MAX_LENGTH = 5000


class PostNoteRequest(BaseModel):
    title: str = Field(min_length=NOTE_TITLE_MIN_LENGTH)
    content: str = Field()


class PostNoteResponse(BaseModel):
    id: str
    title: str
    content: str


class PutNoteRequest(BaseModel):
    title: str = Field(min_length=NOTE_TITLE_MIN_LENGTH)
    content: str = Field()


class PatchNoteResponse(BaseModel):
    id: UUID4
    version_id: UUID4
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    version: int
