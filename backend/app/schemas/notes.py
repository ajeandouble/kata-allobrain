from pydantic import BaseModel, Field

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


class PutNoteResponse(BaseModel):
    title: str
    content: str
