import { Note, NotesObj } from '../types/NoteTypes';
import { useEffect, Dispatch } from 'react';

type NotesListProps = {
	notes: NotesObj;
	currNoteId: string;
	setCurrNoteId: Dispatch<string>;
};

export default function NotesList({
	notes,
	currNoteId,
	setCurrNoteId,
}: NotesListProps) {
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
			<ul className="notes-list__list">
				{Object.values(notes).map((n) => (
					<ListItem key={n.id} note={n} />
				))}
			</ul>
		</div>
	);
}
