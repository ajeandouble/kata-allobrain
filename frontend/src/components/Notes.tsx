import { useState, useCallback } from "react";
import NotesList from "./NotesList";
import NoteEditor from "./NoteEditor";
import { Note } from "../types/notes.type";
import { useNotesContext } from "../context/NotesContext";
import { throttle } from "../utils";

export default function Notes() {
    const { currNoteId, setCurrNoteId, createNote, notesVersions } = useNotesContext();
    const [showSidebar, setShowSidebar] = useState(true);

    const handleNewNote = async () => {
        const newNote: Note | undefined = await createNote({
            title: "Untitled Note",
            content: "",
        });
        if (newNote) setCurrNoteId(newNote.id);
    };

    const onNewNoteClick = useCallback(throttle(handleNewNote, 1000), []);

    return (
        <div className="notes">
            <img
                className="notes__sidebar-toggle"
                src="/burger-menu.svg"
                onClick={() => setShowSidebar((prevState) => !prevState)}
            ></img>
            <img
                hidden={!showSidebar}
                className="notes__sidebar-new-note"
                src="/new-note.svg"
                // eslint-disable-next-line react-hooks/exhaustive-deps
                onClick={onNewNoteClick}
            ></img>
            <div className="notes-container">
                <div className={`notes-container__sidebar${!showSidebar ? " hidden" : ""}`}>
                    {" "}
                    <div className="notes-header">
                        <h3>Notes</h3>
                    </div>
                    <NotesList />
                </div>
                <div className="notes-container__content">
                    {!!currNoteId && notesVersions[currNoteId] && <NoteEditor />}
                </div>
            </div>
        </div>
    );
}
