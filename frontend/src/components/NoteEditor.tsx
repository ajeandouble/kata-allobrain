import { useState, useRef, useEffect } from 'react';
import {
	EditorState,
	RichUtils,
	Modifier,
	convertToRaw,
	KeyBindingUtil,
	convertFromRaw,
} from 'draft-js';
import { Editor, SyntheticKeyboardEvent } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { postNote } from '../api/notes';
import { Note, PostNoteBodyReq } from '../types/NoteTypes';

const TAB_SIZE = 4;

export default function NoteEditor({ note }: { note: Note }) {
	const [editorState, setEditorState] = useState<EditorState>(
		EditorState.createWithContent(convertFromRaw(JSON.parse(note.content)))
	);
	console.log(NoteEditor.name);

	useEffect(() => {
		setEditorState(
			EditorState.createWithContent(convertFromRaw(JSON.parse(note.content)))
		);
	}, [note]);

	const editorRef = useRef<Editor>(null);
	useEffect(() => {
		if (editorRef.current) {
			editorRef.current.focusEditor();
		}
	}, [editorState]); // Adjust dependencies based on your specific needs

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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleReturn = (_: SyntheticKeyboardEvent): boolean => {
		setEditorState(RichUtils.insertSoftNewline(editorState));
		return true;
	};

	const onSave = async () => {
		const body: PostNoteBodyReq = {
			title: 'whateveras' + Math.random(),
			content: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
		};
		console.log(body);
		await postNote(body);
	};

	const onkeyDown = (evt: React.KeyboardEvent) => {
		if ((evt.metaKey || evt.ctrlKey) && evt.keyCode === 83) {
			evt.preventDefault(); // Prevent browser's default save behavior
			onSave(); // Call handlePost function to save note
		}
	};
	return (
		<div className="note-editor" onKeyDown={onkeyDown}>
			<div className="note-editor__header">
				<div className="note-editor__header__versions">
					<button>Header</button>
				</div>
				<div className="note-editor__header__save">
					<button onClick={onSave}>Post</button>
				</div>
			</div>
			<h2 className="note-editor__title">{note.title}</h2>
			<div className="note-editor__content">
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
			{/* <pre>{JSON.stringify(rawContentState)}</pre> */}
			{/* <pre>{JSON.stringify(editorState, null, 2)}</pre> */}
		</div>
	);
}
