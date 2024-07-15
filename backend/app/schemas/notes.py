from pydantic import BaseModel


class Note(BaseModel):
    name: str
    description: str
    content: str
