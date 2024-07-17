import { GetNoteVersionsReq, PostNoteReq } from "../types/NoteTypes";
const API_URL = import.meta.env.VITE_API_URL;

async function getNote() { }

async function getAllNotes() {
    try {
        const res: Response = await fetch(`${API_URL}/notes/`);
        const data = await res.json();
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
    }
}

async function postNote(props: PostNoteReq) {
    const body = props.body;
    try {
        const req = new Request(`${API_URL}/notes/`, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(body)
        });
        const res: Response = await fetch(req);
        const data = await res.json();
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
    }
}

async function patchNote(props) {
    try { } catch (err) { }
}

async function deleteNote() {
    try { } catch (err) { }
}

async function getNoteVersions(props: GetNoteVersionsReq) {
    const { id } = props.params;
    try {
        const res: Response = await fetch(`${API_URL}/notes/${id}/versions`);
        const data = await res.json();
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
    }
}

export { postNote, getNote, getAllNotes, patchNote, deleteNote, getNoteVersions };