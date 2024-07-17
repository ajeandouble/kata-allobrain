/* eslint-disable no-empty */
const API_URL = import.meta.env.VITE_API_URL

async function getNote() { }

async function getAllNotes() {
    try {
        const res: Response = await fetch(`${API_URL}/notes/`);
        const data = await res.json()
        console.log(data)
        return data;
    } catch (err) {
        console.error(err);
    }
}

async function postNote() {
    try { } catch (err) { }
}

async function patchNote() {
    try { } catch (err) { }
}

async function deleteNote() {
    try { } catch (err) { }
}

export { getNote, getAllNotes, postNote, patchNote, deleteNote }