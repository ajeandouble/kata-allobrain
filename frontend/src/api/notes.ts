import { GetNoteVersionsReq, PostNoteReq, PatchNoteReq, DeleteNoteVersionReq } from "../types/NoteTypes";

const API_URL = import.meta.env.VITE_API_URL;

async function getNote() { }

async function getAllNotes() {
    try {
        const res: Response = await fetch(`${API_URL}/notes/`);
        const data = await res.json();
        if (res.status !== 200) throw new Error("Error getting Notes");
        return data;
    } catch (err) {
        console.error(err);
    }
}

async function postNote(props: PostNoteReq) {
    const body = props.body;
    try {
        const req = new Request(`${API_URL}/notes/`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify(body)
        });
        const res: Response = await fetch(req);
        const data = await res.json();
        if (res.status !== 201) throw new Error("Error creating Note");
        return data;
    } catch (err) {
        console.error(err);
    }
}

async function patchNote(props: PatchNoteReq) {
    const { params, body } = props;
    const { id } = params;
    try {
        const req = new Request(`${API_URL}/notes/${id}`, {
            headers: { "Content-Type": "application/json" },
            method: "PATCH",
            body: JSON.stringify(body)
        });
        const res: Response = await fetch(req);
        const data = await res.json();
        if (res.status !== 200) throw new Error("Error patching Note");
        return data;
    } catch (err) { console.error(err); }
}

async function deleteNote(props: DeleteNoteVersionReq) {
    const { id } = props.params;
    const req = new Request(`${API_URL}/notes/${id}`, {
        method: "DELETE",
    });
    const res: Response = await fetch(req);
    if (res.status !== 204) throw new Error("Can't delete Note");
}

async function getNoteVersions(props: GetNoteVersionsReq) {
    const { id } = props.params;
    try {
        const res: Response = await fetch(`${API_URL}/notes/${id}/versions`);
        const data = await res.json();
        if (res.status !== 200) throw new Error("Error getting Note versions");
        return data;
    } catch (err) {
        console.error(err);
    }
}

export { postNote, getNote, getAllNotes, patchNote, deleteNote, getNoteVersions };