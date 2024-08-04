import { useState } from "react";
import { Note } from "../types/notes.type";
import { notesActor } from "../states/notesMachine";
import { useSelector } from "@xstate/react";

export default function NotesList() {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [noteToDeleteId, setNoteToDeleteId] = useState("");
    const notes = useSelector(notesActor, (st) => st.context.notes);
    const selectedNoteId = useSelector(notesActor, (st) => st.context.selectedNoteId);

    const onDeleteIconClick = (noteId: string) => {
        setNoteToDeleteId(noteId);
        setShowDeleteModal(true);
    };

    const onDeleteConfirmBtnClick = () => {
        setShowDeleteModal(false);
        notesActor.send({ type: "DELETE_NOTE", id: noteToDeleteId });
        setNoteToDeleteId("");
    };

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
                    onDeleteIconClick(note.id);
                }}
                hidden={selectedNoteId === note.id}
            />
        </li>
    );

    return (
        <>
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
                    <button
                        className="delete-modal__confirm"
                        onClick={() => onDeleteConfirmBtnClick()}
                    >
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
