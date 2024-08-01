from typing import Optional
from pydantic import BaseModel, Field, UUID4, field_validator
from datetime import datetime

NOTE_TITLE_MIN_LENGTH = 1
NOTE_TITLE_MAX_LENGTH = 80
CONTENT_MAX_LENGTH = 65536


class PostNoteRequest(BaseModel):
    title: str = Field(min_length=NOTE_TITLE_MIN_LENGTH)


class PostNoteResponse(BaseModel):
    id: UUID4
    title: str
    latest_version: int
    created_at: datetime
    updated_at: datetime


class GetNoteResponse(BaseModel):
    id: UUID4
    title: str
    latest_version: int
    created_at: datetime
    updated_at: datetime


class PatchNoteRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_ge_min_len(cls, v: str) -> str:
        if len(v) < NOTE_TITLE_MIN_LENGTH:
            raise ValueError(f"length should be greather than {NOTE_TITLE_MIN_LENGTH}")
        return v

    @field_validator("content")
    @classmethod
    def content_le_max_len(cls, v: str) -> str:
        if len(v) > CONTENT_MAX_LENGTH:
            raise ValueError(
                f"length should be less or equal to {NOTE_TITLE_MIN_LENGTH}"
            )
        return v


class PatchNoteResponse(BaseModel):
    id: UUID4
    title: str
    latest_version: int
    created_at: datetime
    updated_at: datetime
