import { useState, useEffect, useCallback } from 'react';

import {
	getAllNotes,
	getNoteVersions,
	postNote,
	patchNote,
} from '../api/notes';
import {
	Note,
	NotesObj,
	PostNoteReq,
	PostNoteRes,
	NoteVersion,
} from '../types/NoteTypes';

export const useNotes = () => {
	const [notes, setNotes] = useState<NotesObj>({});
	const [noteVersions, setNoteVersions] = useState<{
		[key: string]: NoteVersion[];
	}>({});
	const [currNoteId, setCurrNoteId] = useState('');

	const fetchNotes = useCallback(async () => {
		const notes: Note[] = (await getAllNotes()) as Note[];
		const notesObj = notes.reduce(
			(acc, curr) => ({
				...acc,
				[curr.id]: curr,
			}),
			{} as NotesObj
		);
		setNotes(notesObj);
	}, []);

	const fetchNoteVersions = useCallback(
		async (noteId: string) => {
			if (!noteVersions[noteId]) {
				const versions: NoteVersion[] = (await getNoteVersions({
					params: { id: noteId },
				})) as NoteVersion[];
				setNoteVersions((prevVersions) => ({
					...prevVersions,
					[noteId]: versions,
				}));
			}
		},
		[noteVersions]
	);

	useEffect(() => {
		if (currNoteId) {
			fetchNoteVersions(currNoteId);
		}
	}, [currNoteId, fetchNoteVersions]);

	const createNote = async (body: PostNoteReq['body']) => {
		const response = await postNote({ body });
		if (response) {
			const newNote: Note = {
				id: response.id,
				title: response.title,
				content: response.content,
				created_at: response.created_at,
				updated_at: response.updated_at,
			};
			setNotes((prevNotes) => ({
				...prevNotes,
				[response.id]: newNote,
			}));
			const newVersion: NoteVersion = {
				note_id: response.id,
				title: response.title,
				content: response.content,
				version: 1,
			};
			setNoteVersions((prevVersions) => ({
				...prevVersions,
				[response.id]: [newVersion],
			}));
			return newNote;
		}
	};

	const addNoteVersion = async (noteId: string, body: PostNoteBodyReq) => {
		const response = await patchNote(noteId, null, body);
		if (response) {
			const newVersion: NoteVersion = {
				note_id: response.id,
				title: response.title,
				content: response.content,
				version: noteVersions[noteId].length + 1,
			};
			setNoteVersions((prevVersions) => ({
				...prevVersions,
				[noteId]: [...(prevVersions[noteId] || []), newVersion],
			}));
			return newVersion;
		}
	};

	useEffect(() => {
		fetchNotes();
	}, [fetchNotes]);

	return {
		currNoteId,
		setCurrNoteId,
		notes,
		noteVersions,
		fetchNoteVersions,
		createNote,
		addNoteVersion,
	};
};
