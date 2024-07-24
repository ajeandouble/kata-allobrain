// import { useNotesContext } from "../context/NotesContext";
import { useContext } from "react";
import { Note } from "../types/notes.type";
import NotesReactContext from "../context/NotesContext";
import { NotesContext, NotesEvent } from "../states/notesMachine.ts"; // TODO: separate types to provide encapsulation

export default function NotesList() {
    // const { notes, currNoteId, setCurrNoteId, removeNote } = useNotesContext();

    // const [showDeleteModal, setShowDeleteModal] = useState(false);
    // const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

    // const handleDeleteClick = (noteId: string) => {
    //     setNoteToDelete(noteId);
    //     setShowDeleteModal(true);
    // };

    // const handleConfirmDelete = () => {
    //     if (noteToDelete) {
    //         removeNote(noteToDelete);
    //         setShowDeleteModal(false);
    //         setNoteToDelete(null);
    //     }
    // };
    const [state, send] = useContext(NotesReactContext);

    const ListItem = ({ note }: { note: Note }) => (
        <li
            key={note.id}
            className={`notes-list__item`}
            onClick={() => send({ type: "SELECT_NOTE", id: note.id })}
        >
            <span className={`${state.context.selectedNoteId === note.id ? " selected" : ""}`}>
                {note.title}
            </span>
            <img
                src="/delete-note.svg"
                alt="Delete"
                className="notes-list__delete-icon"
                onClick={(e) => {
                    e.stopPropagation();
                    // handleDeleteClick(note.id);
                }}
            />
        </li>
    );

    return (
        <>
            <pre style={{ position: "fixed" }}>{JSON.stringify(state, null, 2)}</pre>
            <div className="notes-list">
                <ul className="notes-list__list">
                    {Object.values(state.context.notes).map((n) => (
                        <ListItem key={n.id} note={n} />
                    ))}
                </ul>
            </div>
            {/* {showDeleteModal && (
                <div className="delete-modal">
                    <p>Are you sure you want to delete this note?</p>
                    <button className="delete-modal__confirm" onClick={handleConfirmDelete}>
                        Yes, delete&nbsp;
                    </button>
                    <button
                        className="delete-modal__cancel"
                        // onClick={() => setShowDeleteModal(false)}
                    >
                        Cancel
                    </button>
                </div>
            )} */}
        </>
    );
}
