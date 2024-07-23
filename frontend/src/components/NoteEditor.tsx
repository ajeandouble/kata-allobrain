import { useState, useRef, useEffect, FocusEventHandler } from "react";
import { EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from "draft-js";
import { Editor, SyntheticKeyboardEvent } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { NoteVersion, PostNoteReq } from "../types/NoteTypes";
import NoteVersionsDropDown from "./NoteVersionsDropDown";
import { useNotesContext } from "../context/NotesContext";
const TAB_SIZE = 4;

export default function NoteEditor() {
    const { notes, notesVersions, currNoteId, addNoteVersion } = useNotesContext();
    const latestVersion =
        notesVersions && notesVersions[currNoteId] && notesVersions[currNoteId][0];
    const [title, setTitle] = useState(notes[currNoteId]?.title);
    const [currentVersion, setCurrentVersion] = useState<NoteVersion | undefined>(undefined);
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());

    useEffect(() => {
        if (latestVersion?.content) {
            const content = JSON.parse(latestVersion.content);
            setEditorState(EditorState.createWithContent(convertFromRaw(content)));
            setCurrentVersion(latestVersion);
            setTitle(latestVersion.title);
        } else {
            setEditorState(EditorState.createEmpty());
        }
    }, [latestVersion, notesVersions, currNoteId]);

    const editorRef = useRef<Editor>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (editorRef.current && latestVersion?.version > 0) {
            console.log("AAAA", latestVersion);
            editorRef.current.focusEditor();
        } else if (latestVersion && titleInputRef.current) {
            console.log("BBB", latestVersion);
            titleInputRef.current.focus();
            titleInputRef.current.setSelectionRange(0, titleInputRef.current.value.length);
        }
    }, [latestVersion]);

    const onBlur = (_: FocusEventHandler): void => {
        if (editorRef.current && latestVersion?.version > 0) editorRef.current.focusEditor();
        else if (titleInputRef.current) titleInputRef.current.focus();
    };

    const onTab = (evt: React.KeyboardEvent) => {
        evt.preventDefault();
        const currentState = editorState;
        const newState = Modifier.replaceText(
            currentState.getCurrentContent(),
            currentState.getSelection(),
            Array(TAB_SIZE).fill(" ").join("")
        );
        setEditorState(EditorState.push(currentState, newState, "insert-characters"));
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleReturn = (_: SyntheticKeyboardEvent): boolean => {
        setEditorState(RichUtils.insertSoftNewline(editorState));
        return true;
    };

    const handleSave = async () => {
        if (!title) return;

        const rawContent = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        if (currentVersion?.content === rawContent && currentVersion.title === title) {
            return;
        }
        const body: PostNoteReq["body"] = {
            title: title,
            content: rawContent,
        };
        const newVersion: NoteVersion | undefined = await addNoteVersion(currNoteId, body);
        if (newVersion) setCurrentVersion(newVersion);
    };

    const onKeyDown = (evt: React.KeyboardEvent) => {
        if ((evt.metaKey || evt.ctrlKey) && evt.keyCode === 83) {
            evt.preventDefault();
            handleSave();
        }
    };

    const onVersionSelect = (version: NoteVersion) => {
        setEditorState(
            version?.content
                ? EditorState.createWithContent(convertFromRaw(JSON.parse(version.content)))
                : EditorState.createEmpty()
        );
        setTitle(version.title);
        setCurrentVersion(version);
    };

    const handleTitleUpdate = async () => {
        if (title.length === 0) {
            setTitle("Untitled Note");
            return;
        }
        if (currentVersion?.title === title) return;

        const rawContent = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        const body: PostNoteReq["body"] = {
            title,
            content: rawContent,
        };
        const newVersion = await addNoteVersion(currNoteId, body);
        if (newVersion) setCurrentVersion(newVersion);
        if (editorRef.current) editorRef.current.focusEditor();
    };

    const onInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleTitleUpdate();
    };

    return (
        <div className="note-editor">
            <div className="note-editor__header">
                <div className="note-editor__header__versions">
                    <NoteVersionsDropDown
                        versions={notesVersions[currNoteId]}
                        onSelect={onVersionSelect}
                        updateDate={currentVersion?.updated_at}
                    />
                </div>
            </div>
            <h2 className="note-editor__title">
                <input
                    ref={titleInputRef}
                    value={title}
                    onChange={(evt) => setTitle(evt.target.value)}
                    onBlur={onBlur}
                    onKeyDown={onInputKeyDown}
                ></input>
            </h2>
            <div className="note-editor__content" onKeyDown={onKeyDown}>
                <Editor
                    ref={editorRef}
                    editorState={editorState}
                    onEditorStateChange={(newEditorState) => {
                        setEditorState(newEditorState);
                    }}
                    wrapperClassName="wrapper-class"
                    editorClassName="editor-class"
                    toolbarHidden={true}
                    onTab={onTab}
                    handleReturn={handleReturn}
                />
            </div>
        </div>
    );
}
