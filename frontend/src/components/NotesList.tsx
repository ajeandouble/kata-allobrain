import { Dispatch } from 'react';

type NotesListProps = {
	notes: [];
	currNoteId: string;
	setCurrNoteId: Dispatch<string>;
};
export default function NotesList({
	notes,
	currNoteId,
	setCurrNoteId,
}: NotesListProps) {
	const ListItem = ({ note }: { note: any }) => (
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
				{notes.map((n) => (
					<ListItem key={n.id} note={n} />
				))}
			</ul>
		</div>
	);
}
