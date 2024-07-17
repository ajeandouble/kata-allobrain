import { useState, useRef, useEffect, Dispatch } from 'react';
import {
	EditorState,
	RichUtils,
	Modifier,
	convertToRaw,
	convertFromRaw,
} from 'draft-js';
import { Editor, SyntheticKeyboardEvent } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Note, NoteObj, NoteVersion, PostNoteReq } from '../types/NoteTypes';
const TAB_SIZE = 4;

type NoteEditorProps = {
	notes: NoteObj;
	currNoteId: string;
	createNote: (body: PostNoteReq['body']) => Promise<Note | undefined>;
	addNoteVersion: (
		noteId: string,
		body: PostNoteReq['body']
	) => Promise<NoteVersion | undefined>;
	notesVersions: Record<string, NoteVersion[]>;
};
export default function NoteEditor({
	notes,
	notesVersions,
	currNoteId,
	createNote,
	addNoteVersion,
}: NoteEditorProps) {
	console.log();
	const note = notes[currNoteId];
	console.log({ note });
	console.log({ note }, !!note?.content);

	const [editorState, setEditorState] = useState<EditorState>(
		note?.content
			? EditorState.createWithContent(convertFromRaw(JSON.parse(note.content)))
			: EditorState.createEmpty()
	);
	const latestVersion =
		notesVersions &&
		notesVersions[currNoteId] &&
		notesVersions[currNoteId][notesVersions[currNoteId].length - 1];
	useEffect(() => {
		if (latestVersion) {
			setEditorState(
				latestVersion?.content
					? EditorState.createWithContent(
							convertFromRaw(JSON.parse(latestVersion.content))
					  )
					: EditorState.createEmpty()
			);
		}
	}, [notesVersions, currNoteId]);

	const editorRef = useRef<Editor>(null);
	useEffect(() => {
		if (editorRef.current) {
			editorRef.current.focusEditor();
		}
	}, [editorState]);

	const onTab = (evt: React.KeyboardEvent) => {
		evt.preventDefault();
		const currentState = editorState;
		const newState = Modifier.replaceText(
			currentState.getCurrentContent(),
			currentState.getSelection(),
			Array(TAB_SIZE).fill(' ').join('')
		);
		setEditorState(
			EditorState.push(currentState, newState, 'insert-characters')
		);
	};

	const handleReturn = (_: SyntheticKeyboardEvent): boolean => {
		setEditorState(RichUtils.insertSoftNewline(editorState));
		return true;
	};

	const onSave = async () => {
		const rawContent = JSON.stringify(
			convertToRaw(editorState.getCurrentContent())
		);
		console.log(latestVersion.content, rawContent);
		if (
			latestVersion.content === rawContent &&
			latestVersion.title === latestVersion.title
		)
			return;
		const body: PostNoteReq['body'] = {
			title: note?.title || 'Untitled Note',
			content: rawContent,
		};
		if (!note?.id) {
			console.log('no note id');
			await createNote(body);
		} else {
			await addNoteVersion(note.id, body);
		}
	};

	const onKeyDown = (evt: React.KeyboardEvent) => {
		console.log({ onKeyDown, evt });
		if ((evt.metaKey || evt.ctrlKey) && evt.keyCode === 83) {
			evt.preventDefault();
			onSave();
		}
	};

	const onVersionSelect = (version: NoteVersion) => {
		setEditorState(
			EditorState.createWithContent(convertFromRaw(JSON.parse(version.content)))
		);
	};

	return (
		<div className="note-editor">
			<div className="note-editor__header">
				<div className="note-editor__header__versions">
					<button>
						Created at: {new Date(note?.created_at || '').toLocaleString()}
					</button>
					<div className="note-editor__header__dropdown">
						<ul>
							{notesVersions[currNoteId]?.map((version, index) => (
								<li key={index} onClick={() => onVersionSelect(version)}>
									{`Version ${version.version}: ${new Date(
										version.created_at
									).toLocaleString()}`}
								</li>
							))}
						</ul>
						{/* <pre>{JSON.stringify(notesVersions, null, 2)}</pre> */}
					</div>
				</div>
				<div className="note-editor__header__save">
					<button onClick={onSave}>Post</button>
				</div>
			</div>
			<h2 className="note-editor__title">{note?.title}</h2>
			<div className="note-editor__content" onKeyDown={onKeyDown}>
				<Editor
					ref={editorRef}
					editorState={editorState}
					onEditorStateChange={(newEditorState) =>
						setEditorState(newEditorState)
					}
					wrapperClassName="wrapper-class"
					editorClassName="editor-class"
					toolbarHidden={true}
					onTab={onTab}
					handleReturn={handleReturn}
				/>
			</div>
			<pre style={{ width: '80vw', maxWidth: '80vw' }}>
				{JSON.stringify(notesVersions[currNoteId], null, 2)}
			</pre>
		</div>
	);
}
