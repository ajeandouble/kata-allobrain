import { useState, useEffect } from 'react';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import Header from './Header';
import { getAllNotes } from '../api/notes';
import { Note, NotesObj, GetNoteRes } from '../types/NoteTypes';

export default function Notes() {
	const [notes, setNotes] = useState<NotesObj>({});
	const [notesVersions, setNotesVersions] = useState<any[]>([]);
	const [currNoteId, setCurrNoteId] = useState('');
	const [showSidebar, setShowSidebar] = useState(true);

	useEffect(() => {
		(async () => {
			const notes: Note[] = (await getAllNotes()) as Note[];
			console.log(notes);
			const notesObj = notes.reduce(
				(acc, curr) =>
					({
						...acc,
						[curr.id]: curr,
					} as NotesObj),
				{}
			);
			setNotes(notesObj);
		})();
	}, []);

	return (
		<div className="notes">
			<img
				className="notes__sidebar-toggle"
				src="/burger-menu.svg"
				onClick={() => setShowSidebar((prevState) => !prevState)}
			></img>
			<img className="notes__sidebar-new-note" src="/new-note.svg"></img>
			<div className="notes-container">
				<div
					className={`notes-container__sidebar${!showSidebar ? ' hidden' : ''}`}
					style={{ maxWidth: showSidebar ? '100%' : '0%' }}
				>
					<Header />
					<NotesList
						notes={notes}
						currNoteId={currNoteId}
						setCurrNoteId={setCurrNoteId}
					/>
				</div>
				<div className="notes-container__content">
					{currNoteId in notes && <NoteEditor note={notes[currNoteId]} />}
				</div>
			</div>
		</div>
	);
}
