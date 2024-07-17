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
	NoteVersion,
	GetNoteVersionsRes,
} from '../types/NoteTypes';

export const useNotes = () => {
	const [notes, setNotes] = useState<NotesObj>({});
	const [notesVersions, setNotesVersions] = useState<{
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

	const fetchNoteVersions = useCallback(async (noteId: string) => {
		if (!notesVersions[noteId]) {
			const versions: NoteVersion[] = (await getNoteVersions({
				params: { id: noteId },
			})) as NoteVersion[];
			setNotesVersions((prevVersions) => ({
				...prevVersions,
				[noteId]: versions,
			}));
			console.log('fetchNoteVersions', {
				...notesVersions,
				[noteId]: versions,
			});
		}
	}, []);

	useEffect(() => {
		if (currNoteId) {
			fetchNoteVersions(currNoteId);
		}
	}, [currNoteId, fetchNoteVersions]);

	const createNote = async (body: PostNoteReq['body']) => {
		const resNote = await postNote({ body });
		if (resNote) {
			const newNote: Note = {
				id: resNote.id,
				title: resNote.title,
				content: resNote.content,
				created_at: resNote.created_at,
				updated_at: resNote.updated_at,
			};
			setNotes((prevNotes) => ({
				[resNote.id]: newNote,
				...prevNotes,
			}));
			const resNoteVersion: GetNoteVersionsRes = await getNoteVersions({
				params: { id: resNote.id },
			});
			const newVersion: NoteVersion = {
				note_id: resNoteVersion.id,
				title: resNoteVersion.title,
				content: resNoteVersion.content,
				version: 1,
				created_at: resNoteVersion.created_at,
				updated_at: resNoteVersion.updated_at,
			};
			setNotesVersions((prevVersions) => ({
				...prevVersions,
				[resNote.id]: [newVersion],
			}));
			return newNote;
		}
	};

	const addNoteVersion = async (noteId: string, body: PostNoteReq['body']) => {
		const res = await patchNote({ params: { id: noteId }, body });
		console.log({ noteId, res });
		if (res) {
			const newVersion: NoteVersion = {
				id: res.version_id,
				title: res.title,
				content: res.content,
				version: res.version,
				created_at: res.created_at,
				updated_at: res.updated_at,
			};
			setNotesVersions((prevVersions) => ({
				...prevVersions,
				[noteId]: [newVersion, ...(prevVersions[noteId] || [])],
			}));
			console.log({
				[noteId]: [...(notesVersions[noteId] || []), 'maPUTAINDEBITE'],
			});

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
		notesVersions,
		fetchNoteVersions,
		createNote,
		addNoteVersion,
	};
};
