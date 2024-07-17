// Common Types

type Note = {
    id: string,
    title: string,
    content: string,
    created_at: string,
    updated_at: string
}

type NotesObj = Record<string, Note>

// Request Types

type GetNoteRes = {
    id: string,
    title: string,
    content: string,
    created_at: string,
    updated_at: string
}


type PostNoteBodyReq = {
    title: string,
    content: string
}

export type { Note, NotesObj, GetNoteRes, PostNoteBodyReq };