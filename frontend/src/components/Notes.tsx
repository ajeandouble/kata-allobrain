import { useState, useEffect, useCallback } from 'react';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import Header from './Header';
import { useNotes } from '../hooks/useNotes';
import { Note } from '../types/NoteTypes';

export default function Notes() {
	const [showSidebar, setShowSidebar] = useState(true);

	const {
		notes,
		currNoteId,
		setCurrNoteId,
		notesVersions,
		fetchNoteVersions,
		createNote,
		addNoteVersion,
	} = useNotes();

	// useEffect(() => {
	// 	(async () => {
	// 		if (currNoteId) fetchNoteVersions(currNoteId);
	// 	})();
	// }, [currNoteId, fetchNoteVersions]);

	const onNewNote = async () => {
		const newNote: Note | undefined = await createNote({
			title: 'Untitle Note',
			content: '',
		});
		console.log(newNote);
		if (newNote) setCurrNoteId(newNote.id);
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
					<NotesList
						notes={notes}
						currNoteId={currNoteId}
						setCurrNoteId={setCurrNoteId}
					/>
				</div>
				<div className="notes-container__content">
					{JSON.stringify({ bla: !!currNoteId })}
					{!!currNoteId && (
						<NoteEditor
							key={currNoteId}
							notes={notes}
							currNoteId={currNoteId}
							notesVersions={notesVersions}
							createNote={createNote}
							addNoteVersion={addNoteVersion}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
