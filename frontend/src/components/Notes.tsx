import { useState, useEffect } from 'react';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import Header from './Header';
import { getAllNotes } from '../api/notes';

export default function Notes() {
	const [showSidebar, setShowSidebar] = useState(true);
	const [currNoteId, setCurrNoteId] = useState('');
	const [notes, setNotes] = useState([]);

	useEffect(() => {
		(async () => {
			const notes = await getAllNotes();
			setNotes(notes);
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
					<NoteEditor />
				</div>
			</div>
		</div>
	);
}
