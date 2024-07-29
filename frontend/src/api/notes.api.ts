import { GetNoteRes, PostNoteRes, GetNoteVersionsReq, PostNoteReq, PatchNoteReq, PatchNoteRes, DeleteNoteVersionReq, GetNoteVersionRes, GetAllNoteVersionsRes, GetAllNotesRes } from "../types/notes.type";
import ky from 'ky';

const API_URL = import.meta.env.VITE_API_URL;

async function getNote() { }

async function getAllNotes(): Promise<GetNoteRes[] | undefined> {
    console.log(getAllNotes.name);
    const data: GetAllNotesRes = await ky.get(`${API_URL}/notes/`).json();
    console.log({ data });
    return data;
}

async function postNote(props: PostNoteReq): Promise<PostNoteRes | undefined> {
    const body = props.body;
    try {
        const data = await ky.post(`${API_URL}/notes/`, { json: body }).json();
        return data as PostNoteRes;
    } catch (err) {
        console.error(err);
    }
}

async function patchNote(props: PatchNoteReq) {
    const { params, body } = props;
    const { id } = params;
    try {
        const data = await ky.patch(`${API_URL}/notes/${id}`, { json: body }).json();
        return data as PatchNoteRes;
    } catch (err) { console.error(err); }
}

async function deleteNote(props: DeleteNoteVersionReq) {
    try {
        const { id } = props.params;
        await ky.delete(`${API_URL}/notes/${id}`);
    } catch (err) {
        console.error(err);
    }
}

async function getAllNoteVersions(props: GetNoteVersionsReq): Promise<GetAllNoteVersionsRes | undefined> {
    const { id } = props.params;
    try {
        const data = await ky.get(`${API_URL}/notes/${id}/versions`).json();
        return data as GetAllNoteVersionsRes;
    } catch (err) {
        console.error(err);
    }
}
async function getLatestNoteVersion(props: GetNoteVersionsReq): Promise<GetNoteVersionRes | undefined> {
    const { id } = props.params;
    try {
        const data = await ky.get(`${API_URL}/notes/${id}/versions/latest`).json();
        return data as GetNoteVersionRes;
    } catch (err) {
        console.error(err);
    }
}

export { postNote, getNote, getAllNotes, patchNote, deleteNote, getAllNoteVersions, getLatestNoteVersion };