// Common Types

type Note = {
    id: string,
    title: string,
    created_at: string,
    updated_at: string
}

type NotesObj = Record<string, Note>

type NoteVersion = {
    id?: string,
    title: string,
    content: string,
    version: number,
    note_id: string
    created_at: string
    updated_at: string
}

// Request Types

type GetNoteRes = {
    id: string,
    title: string,
    created_at: string,
    updated_at: string
}

type GetAllNotesRes = GetNoteRes[]

type PostNoteReq = {
    body: {
        title: string,
        content: string
    }
}

type PostNoteRes = {
    id: string
    title: string,
    version: number,
    created_at: string,
    updated_at: string,
}

type PatchNoteReq = {
    params: { id: string },
    body: {
        title: string,
        content: string,
    },
}

type PatchNoteRes = {
    id: string,
    title: string,
    version: number,
    created_at: string,
    updated_at: string
}

type DeleteNoteVersionReq = {
    params: { id: string };
}

type GetNoteVersionsReq = {
    params: {
        id: string
    }
}

type GetNoteVersionRes = {
    id: string,
    content: string,
    version: number,
    created_at: string,
    updated_at: string,
    note_id: string
};

type GetAllNoteVersionsRes = GetNoteVersionRes[]

// TODO: PatchNoteVersion Res
export type {
    Note, NotesObj, NoteVersion,
    PostNoteReq, PostNoteRes,
    GetNoteRes, GetAllNotesRes,
    PatchNoteReq, PatchNoteRes,
    DeleteNoteVersionReq,
    GetNoteVersionsReq, GetNoteVersionRes,
    GetAllNoteVersionsRes
};