// Common Types

type Note = {
    id: string,
    title: string,
    content: string,
    created_at: string,
    updated_at: string
}

type NotesObj = Record<string, Note>

type NoteVersion = {
    id?: string,
    title: string,
    content: string,
    version: number,
    created_at: string
    updated_at: string
    note_id?: string
}

// Request Types

type GetNoteRes = {
    id: string,
    title: string,
    content: string,
    created_at: string,
    updated_at: string
}


type PostNoteReq = {
    body: {
        title: string,
        content: string
    }
}

type PostNoteRes = {
    id: string
    title: string,
    content: string,
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

type DeleteNoteVersionReq = {
    params: { id: string };
}

type GetNoteVersionsReq = {
    params: {
        id: string
    }
}

type GetNoteVersionsRes = {
    id?: string,
    title: string,
    content: string,
    version: number,
    created_at: string,
    updated_at: string,
    note_id?: string
};

// TODO: PatchNoteVersion Res
export type {
    Note, NotesObj, NoteVersion, PostNoteReq, PostNoteRes, GetNoteRes, PatchNoteReq, DeleteNoteVersionReq, GetNoteVersionsReq, GetNoteVersionsRes
};