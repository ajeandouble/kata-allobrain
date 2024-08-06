import NotesList from "./NotesList";
import { debounce as debounceFunc } from "../utils/";
import { useState, useCallback } from "react";
import { notesActor } from "../states/notesMachine";
import { useSelector } from "@xstate/react";
import NoteEditor from "./NoteEditor";

export default function Notes() {
    const isShowingEditor = useSelector(notesActor, (st) => st.matches("showingEditor"));
    const [showSidePanel, setShowSidePanel] = useState(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onNewNoteClick = useCallback(
        debounceFunc(() => handleNewNote(), 1000),
        []
    );

    const handleNewNote = () => notesActor.send({ type: "ADD_NOTE" });

    const state = useSelector(notesActor, (state) => state);
    console.log(state.value);
    return (
        <div className="notes">
            <img
                className="notes__sidebar-toggle"
                src="/burger-menu.svg"
                onClick={() => setShowSidePanel((prev) => !prev)}
            ></img>
            <img
                hidden={!showSidePanel}
                className="notes__sidebar-new-note"
                src="/new-note.svg"
                onClick={onNewNoteClick}
            ></img>
            <div className="notes-container">
                <div className={`notes-container__sidebar${showSidePanel ? "" : " hidden"}`}>
                    <div className="notes-header">
                        <h3>Notes.</h3>
                    </div>
                    <NotesList />
                </div>
                <div className="notes-container__content">{isShowingEditor && <NoteEditor />}</div>
            </div>
        </div>
    );
}
