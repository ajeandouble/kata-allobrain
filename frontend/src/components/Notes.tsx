import NotesList from "./NotesList";
import { debounce as debounceFunc } from "../utils/";
import { useState, useCallback } from "react";
import { notesActor } from "../states/globalService";
import { useSelector } from "@xstate/react";
import NoteEditor from "./NoteEditor";

export default function Notes() {
    const [showSidePanel, setShowSidePanel] = useState(true);
    // const debounceSidePanel = useCallback(
    //     debounceFunc(() => setShowSidePanel((prev) => !prev), 0),
    //     []
    // );

    const handleCreateNote = () => {
        notesActor.send({ type: "ADD_NOTE" });
    };

    const isShowingEditor = useSelector(notesActor, (state) => state.matches("showingEditor"));
    const state = useSelector(notesActor, (state) => state);
    console.log(state.value);
    return (
        <div className="notes">
            <pre>{JSON.stringify(state, null, 2)}</pre>
            <img
                className="notes__sidebar-toggle"
                src="/burger-menu.svg"
                onClick={() => setShowSidePanel((prev) => !prev)}
            ></img>
            <img
                hidden={!showSidePanel}
                className="notes__sidebar-new-note"
                src="/new-note.svg"
                onClick={handleCreateNote}
            ></img>
            <div className="notes-container">
                <div className={`notes-container__sidebar${showSidePanel ? "" : " hidden"}`}>
                    <div className="notes-header">
                        <h3>Notes</h3>
                    </div>
                    <NotesList />
                </div>
                <div className="notes-container__content">{isShowingEditor && <NoteEditor />}</div>
                <pre>{JSON.stringify(state.value)}</pre>
            </div>
        </div>
    );
}
