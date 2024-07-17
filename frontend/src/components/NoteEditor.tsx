import { useState, useRef, useEffect } from 'react';
import {
	EditorState,
	RichUtils,
	Modifier,
	convertToRaw,
	convertFromRaw,
} from 'draft-js';
import { Editor, SyntheticKeyboardEvent } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Note, NotesObj, NoteVersion, PostNoteReq } from '../types/NoteTypes';
const TAB_SIZE = 4;

type NoteEditorProps = {
	notes: NotesObj;
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
	const latestVersion =
		notesVersions && notesVersions[currNoteId] && notesVersions[currNoteId][0];
	console.log('WTF', notesVersions[currNoteId]?.length);
	const [title, setTitle] = useState(notes[currNoteId]?.title);

	console.log();

	console.log({ notesVersions });
	console.log({ latestVersion });
	const [editorState, setEditorState] = useState<EditorState>(
		latestVersion?.content
			? EditorState.createWithContent(
					convertFromRaw(JSON.parse(latestVersion.content))
			  )
			: EditorState.createEmpty()
	);

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
		) {
			return;
		}
		const body: PostNoteReq['body'] = {
			title: latestVersion?.title || 'Untitled Note',
			content: rawContent,
		};
		if (!latestVersion) {
			console.log('no note id');
			await createNote(body);
		} else {
			await addNoteVersion(currNoteId, body);
			console.log('FUCKKKKK');
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
			version?.content
				? EditorState.createWithContent(
						convertFromRaw(JSON.parse(version.content))
				  )
				: EditorState.createEmpty()
		);
		// setTitle(version.title);
	};

	return (
		<div className="note-editor">
			<div className="note-editor__header">
				<div className="note-editor__header__versions">
					<button>
						Created at: {!latestVersion && new Date().toLocaleString()}
					</button>
					<div className="note-editor__header__dropdown">
						<ul>
							{notesVersions[currNoteId]?.map((version, index) => (
								<li key={index} onClick={() => onVersionSelect(version)}>
									{/* {`Version ${version.version}: ${new Date(
										version.created_at
									).toLocaleString()}`} */}
									{version.version}
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
			<h2 className="note-editor__title">{title}</h2>
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
