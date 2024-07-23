import {
    useState, useEffect,
} from "react";

import {
    postNote,
    getAllNotes,
    patchNote,
    deleteNote,
    getAllNoteVersions,
    getLatestNoteVersion
} from "../api/notes";
import {
    Note, NotesObj, NoteVersion,
    PostNoteReq,
    GetNoteRes,
} from "../types/NoteTypes";

export const useNotes = () => {
    const [notes, setNotes] = useState<NotesObj>({});
    const [notesVersions, setNotesVersions] = useState<{ [key: string]: NoteVersion[]; }>({});
    const [currNoteId, setCurrNoteId] = useState("");

    const fetchNotes = async () => {
        const notes = (await getAllNotes()) as unknown;
        if (!notes) return;
        const notesObj = (notes as Note[]).reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {} as NotesObj);
        setNotes(notesObj);
    };

    const fetchNoteVersions = async (noteId: string) => {
        if (!notesVersions[noteId]) {
            const versions: NoteVersion[] | undefined = (await getAllNoteVersions({ params: { id: noteId } })) as NoteVersion[];
            setNotesVersions((prevVersions) => ({ ...prevVersions, [noteId]: versions, }));
        }
    };

    useEffect(() => {
        if (currNoteId) {
            fetchNoteVersions(currNoteId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currNoteId]);

    const createNote = async (body: PostNoteReq["body"]) => {
        const resNote = await postNote({ body }) as GetNoteRes;
        try {
            if (!resNote)
                throw new Error("Can't create new Note");
            const newNote: Note = {
                id: resNote.id,
                title: resNote.title,
                created_at: resNote.created_at,
                updated_at: resNote.updated_at,
            };
            setNotes((prevNotes) => ({
                [resNote.id]: newNote,
                ...prevNotes,
            }));
            const resNoteVersion: any = await getLatestNoteVersion({
                params: { id: resNote.id },
            });
            if (!resNoteVersion) throw new Error("Can't get latest note version");

            setNotesVersions((prevVersions) => ({ ...prevVersions, [resNote.id]: [resNoteVersion as NoteVersion], }));
            return newNote;
        }
        catch (err) {
            console.error(err);
        }
    };

    const addNoteVersion = async (noteId: string, body: PostNoteReq["body"]) => {
        const resNote = await patchNote({ params: { id: noteId }, body });
        try {
            if (!resNote) throw new Error("Couldn't patch note");

            const resLatestNoteVersion = await getLatestNoteVersion({ params: { id: noteId } });
            if (!resLatestNoteVersion) throw new Error("Couldn't get latest note version");
            setNotes({ ...notes, [noteId]: { ...resNote } as Note });
            setNotesVersions((prevVersions) => {
                return ({
                    ...prevVersions,
                    [noteId]: [resLatestNoteVersion, ...(prevVersions[noteId] || [])],
                });
            });
            return [resNote, resLatestNoteVersion];
        }
        catch (err) {
            console.error(err);
        }
    };

    const removeNote = async (noteId: string) => {
        try {
            await deleteNote({ params: { id: noteId } });
            setNotes((prevNotes) => {
                const newNotes = { ...prevNotes };
                delete newNotes[noteId];
                return newNotes;
            });
            setNotesVersions((prevVersions) => {
                const newVersions = { ...prevVersions };
                delete newVersions[noteId];
                return newVersions;
            });
            if (currNoteId === noteId) {
                setCurrNoteId("");
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    return {
        currNoteId,
        setCurrNoteId,
        notes,
        notesVersions,
        fetchNoteVersions,
        createNote,
        addNoteVersion,
        removeNote,
    };
};
