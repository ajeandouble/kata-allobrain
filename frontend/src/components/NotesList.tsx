import { Note, NotesObj } from "../types/NoteTypes";
import { useState, Dispatch } from "react";

type NotesListProps = {
    notes: NotesObj;
    currNoteId: string;
    setCurrNoteId: Dispatch<string>;
    removeNote: (id: string) => void;
};

export default function NotesList({
    notes,
    currNoteId,
    setCurrNoteId,
    removeNote,
}: NotesListProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

    const handleDeleteClick = (noteId: string) => {
        setNoteToDelete(noteId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (noteToDelete) {
            removeNote(noteToDelete);
            setShowDeleteModal(false);
            setNoteToDelete(null);
        }
    };
    console.log(NotesList.name, { notes });
    const ListItem = ({ note }: { note: Note }) => (
        <li key={note.id} className={`notes-list__item`} onClick={() => setCurrNoteId(note.id)}>
            <span className={`${currNoteId === note.id ? " selected" : ""}`}>{note.title}</span>
            <img
                src="/delete-note.svg"
                alt="Delete"
                className="notes-list__delete-icon"
                onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(note.id);
                }}
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
                    <button onClick={handleConfirmDelete}>Yes, delete</button>
                    <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
                </div>
            )}
        </>
    );
}
