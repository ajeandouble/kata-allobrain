from pydantic import BaseModel


class NoteResponse(BaseModel):
    name: str
    description: str
    content: str
