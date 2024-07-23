import { useState } from "react";
import NotesList from "./NotesList";
import NoteEditor from "./NoteEditor";
import Header from "./Header";
import { Note } from "../types/NoteTypes";
import { useNotesContext } from "../context/NotesContext";
import debounce from "../utils/debounce";

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
                onClick={debounce(handleNewNote)} // THROTTLE instead of debounce
            ></img>
            <div className="notes-container">
                <div className={`notes-container__sidebar${!showSidebar ? " hidden" : ""}`}>
                    <Header />
                    <NotesList />
                </div>
                <div className="notes-container__content">
                    {!!currNoteId && notesVersions[currNoteId] && <NoteEditor />}
                </div>
            </div>
        </div>
    );
}
