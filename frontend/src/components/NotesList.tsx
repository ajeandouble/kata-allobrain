import { Dispatch } from 'react';
import { Note, NotesObj } from '../types/NoteTypes';
import { useNotes } from '../hooks/useNotes';

type NotesListProps = {
	// notes: NotesObj;
	currNoteId: string;
	setCurrNoteId: Dispatch<string>;
};

export default function NotesList({
	currNoteId,
	setCurrNoteId,
}: NotesListProps) {
	const { notes } = useNotes();

	const ListItem = ({ note }: { note: Note }) => (
		<li
			key={note.id}
			className={`notes-list__item`}
			onClick={() => setCurrNoteId(note.id)}
		>
			<span className={`${currNoteId === note.id ? ' selected' : ''}`}>
				{note.title}
			</span>
		</li>
	);

	return (
		<div className="notes-list">
			{currNoteId}
			<ul className="notes-list__list">
				{Object.values(notes).map((n) => (
					<ListItem key={n.id} note={n} />
				))}
			</ul>
		</div>
	);
}
