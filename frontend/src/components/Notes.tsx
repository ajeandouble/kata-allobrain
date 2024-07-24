// import { useState, useCallback } from "react";
// import NotesList from "./NotesList";
// import NoteEditor from "./NoteEditor";
// import { Note } from "../types/notes.type";
// import { useNotesContext } from "../context/NotesContext";
// import { throttle } from "../utils";
// import { createMachine, assign } from "xstate";
import { useContext } from "react";
import NotesReactContext from "../context/NotesContext";
import NotesList from "./NotesList";

export default function Notes() {
    // const [showSidebar, setShowSidebar] = useState(true);

    // const handleNewNote = async () => {
    //     const newNote: Note | undefined = await createNote({
    //         title: "Untitled Note",
    //         content: "",
    //     });
    //     if (newNote) setCurrNoteId(newNote.id);
    // };

    // const onNewNoteClick = useCallback(throttle(handleNewNote, 1000), []);

    const [state, send] = useContext(NotesReactContext);

    return (
        <div className="notes">
            <img
                className="notes__sidebar-toggle"
                src="/burger-menu.svg"
                onClick={() => send({ type: "TOGGLE_PANEL" })}
            ></img>
            <img
                hidden={state.context.isLeftPanelCollapsed}
                className="notes__sidebar-new-note"
                src="/new-note.svg"
                // eslint-disable-next-line react-hooks/exhaustive-deps
                // onClick={onNewNoteClick}
            ></img>
            <div className="notes-container">
                <div
                    className={`notes-container__sidebar${
                        state.context.isLeftPanelCollapsed ? " hidden" : ""
                    }`}
                >
                    <div className="notes-header">
                        <h3>Notes</h3>
                    </div>
                    <NotesList />
                </div>
                <div className="notes-container__content">
                    Editor
                    {/* {!!currNoteId && notesVersions[currNoteId] && <NoteEditor />} */}
                </div>
            </div>
        </div>
    );
}
