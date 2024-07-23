import React, { createContext, useContext } from "react";
import { useNotes } from "../hooks/useNotes";
import {
    GetNoteVersionRes,
    PatchNoteRes,
    Note,
    NotesObj,
    NoteVersion,
    PostNoteReq,
} from "../types/notes.type";

type NotesContextType = {
    notes: NotesObj;
    notesVersions: Record<string, NoteVersion[]>;
    currNoteId: string;
    setCurrNoteId: (id: string) => void;
    createNote: (body: PostNoteReq["body"]) => Promise<Note | undefined>;
    addNoteVersion: (
        noteId: string,
        body: PostNoteReq["body"]
    ) => Promise<[PatchNoteRes, GetNoteVersionRes] | undefined>;
    removeNote: (noteId: string) => Promise<void>;
};

const NotesContext = createContext<NotesContextType | null>(null);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const notesData = useNotes();

    return <NotesContext.Provider value={notesData}>{children}</NotesContext.Provider>;
};

export const useNotesContext = () => {
    const context = useContext(NotesContext);
    if (!context) {
        throw new Error("useNotesContext must be used within a NotesProvider");
    }
    return context;
};
