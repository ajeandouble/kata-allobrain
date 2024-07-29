import { useState } from "react";
import { Note } from "../types/notes.type";
import { notesActor } from "../states/globalService";
import { useSelector } from "@xstate/react";

export default function NotesList() {
    console.log("rerender", NotesList.name);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [noteToDeleteId, setNoteToDeleteId] = useState("");

    const onDeleteClick = (noteId: string) => {
        setNoteToDeleteId(noteId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (noteToDeleteId) {
            console.log("remove Note");
            setShowDeleteModal(false);
            setNoteToDeleteId("");
        }
    };
    const notes = useSelector(notesActor, (st) => st.context.notes);
    const selectedNoteId = useSelector(notesActor, (st) => st.context.selectedNoteId);

    const ListItem = ({ note }: { note: Note }) => (
        <li
            key={note.id}
            className={`notes-list__item`}
            onClick={() => notesActor.send({ type: "SELECT_NOTE", id: note.id })}
        >
            <span className={`${selectedNoteId === note.id ? " selected" : ""}`}>{note.title}</span>
            <img
                src="/delete-note.svg"
                alt="Delete"
                className="notes-list__delete-icon"
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(note.id);
                }}
            />
        </li>
    );

    return (
        <>
            {/* <pre style={{ position: "fixed", color: "red" }}>
                {JSON.stringify(
                    { selectedNoteId: selectedNoteId ? selectedNoteId : "----", notes },
                    null,
                    2
                )}
            </pre> */}
            <div className="notes-list">
                <ul className="notes-list__list">
                    {Object.values(notes).map((n) => (
                        <ListItem key={n.id} note={n} />
                    ))}
                </ul>
            </div>
            {showDeleteModal && (
                <div className="delete-modal">
                    <p>Are you sure you want to delete this note?</p>
                    <button className="delete-modal__confirm" onClick={handleConfirmDelete}>
                        Yes, delete&nbsp;
                    </button>
                    <button
                        className="delete-modal__cancel"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </>
    );
}
