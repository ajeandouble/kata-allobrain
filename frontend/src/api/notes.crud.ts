import { NoteVersion } from "../types/notes.type";
import { getAllNoteVersions } from "./notes.api";

// TODO: memoize
export const readNoteVersions = async (noteId: string) => {
    const versions: NoteVersion[] | undefined = (await getAllNoteVersions({ params: { id: noteId } })) as NoteVersion[];
    return versions;
};
