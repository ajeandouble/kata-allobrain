from pydantic import BaseModel, Field, UUID4
from datetime import datetime

NOTE_TITLE_MIN_LENGTH = 1
NOTE_TITLE_MAX_LENGTH = 80
CONTENT_MAX_LENGTH = 65536

# TODO: extend Base Class with created_at, updated_at


class PostNoteRequest(BaseModel):
    title: str = Field(min_length=NOTE_TITLE_MIN_LENGTH)
    content: str = Field(max_length=CONTENT_MAX_LENGTH)


class PostNoteResponse(BaseModel):
    id: UUID4
    title: str
    content: str
    created_at: datetime
    updated_at: datetime


class GetNoteResponse(BaseModel):
    id: UUID4
    title: str
    content: str
    created_at: datetime
    updated_at: datetime


class PatchNoteRequest(BaseModel):
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
