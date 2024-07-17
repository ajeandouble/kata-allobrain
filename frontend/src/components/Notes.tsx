import { useState, useEffect, useCallback } from 'react';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import Header from './Header';
import { getAllNotes, postNote, getNoteVersions } from '../api/notes';
import { Note, NotesObj, NoteVersion } from '../types/NoteTypes';
import { useNotes } from '../hooks/useNotes';

export default function Notes() {
	const { currNoteId, setCurrNoteId, fetchNoteVersions, createNote } =
		useNotes();
	const [showSidebar, setShowSidebar] = useState(true);

	useEffect(() => {
		fetchNoteVersions(currNoteId);
	}, [currNoteId, fetchNoteVersions]);

	const onNewNote = () => {
		createNote({ title: 'Untitle Note', content: '' });
	};

	return (
		<div className="notes">
			<img
				className="notes__sidebar-toggle"
				src="/burger-menu.svg"
				onClick={() => setShowSidebar((prevState) => !prevState)}
			></img>
			<img
				className="notes__sidebar-new-note"
				src="/new-note.svg"
				onClick={onNewNote}
			></img>
			<div className="notes-container">
				<div
					className={`notes-container__sidebar${!showSidebar ? ' hidden' : ''}`}
					style={{ maxWidth: showSidebar ? '100%' : '0%' }}
				>
					<Header />
					<NotesList currNoteId={currNoteId} setCurrNoteId={setCurrNoteId} />
				</div>
				<div className="notes-container__content">
					{currNoteId}
					{currNoteId && <NoteEditor currNoteId={currNoteId} />}
				</div>
			</div>
		</div>
	);
}
