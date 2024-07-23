import { useState, useRef, useEffect, FocusEventHandler } from "react";
import { EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from "draft-js";
import { Editor, SyntheticKeyboardEvent } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {
    Note,
    NoteVersion,
    PostNoteReq,
    PatchNoteRes,
    GetNoteVersionRes,
} from "../types/NoteTypes";
import NoteVersionsDropDown from "./NoteVersionsDropDown";
import { useNotesContext } from "../context/NotesContext";
const TAB_SIZE = 4;

export default function NoteEditor() {
    const { notes, notesVersions, currNoteId, addNoteVersion } = useNotesContext();
    const [currVersion, setCurrentVersion] = useState<number | undefined>(undefined);
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    const [title, setTitle] = useState("");

    useEffect(() => {
        const versionsLength = notesVersions[currNoteId].length;
        if (versionsLength) {
            setCurrentVersion(0);
            const content = notesVersions[currNoteId][0].content;
            if (content) {
                const rawContent = JSON.parse(content);
                setEditorState(EditorState.createWithContent(convertFromRaw(rawContent)));
            } else {
                setEditorState(EditorState.createEmpty());
            }
            setTitle(notes[currNoteId].title);
        }
        if (editorRef.current) editorRef.current.focusEditor();
    }, [notes, notesVersions, currNoteId]);

    const editorRef = useRef<Editor>(null);

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
        if (!title || currVersion === undefined) return;
        console.log(handleSave.name);
        console.log(
            "WIUOQWIUEOIWUQE",
            currVersion,
            notesVersions[currNoteId][currVersion].content,
            notesVersions[currNoteId][currVersion].title
        );
        const rawContent = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        if (
            currVersion &&
            notesVersions[currNoteId][currVersion].content === rawContent &&
            notesVersions[currNoteId][currVersion].title === title
        ) {
            return;
        }
        const body: PostNoteReq["body"] = {
            title: title,
            content: rawContent,
        };
        console.log({ body });
        const updatedNote: [PatchNoteRes, GetNoteVersionRes] | undefined = await addNoteVersion(
            currNoteId,
            body
        );
        if (updatedNote) {
            const [patchedNote, latestVersion] = updatedNote;
            console.log(patchedNote, latestVersion);
            const content = latestVersion.content;
            console.log(content);
            setCurrentVersion(0);
            setTitle(patchedNote.title);
        }
    };

    const onKeyDown = (evt: React.KeyboardEvent) => {
        if ((evt.metaKey || evt.ctrlKey) && evt.keyCode === 83) {
            evt.preventDefault();
            handleSave();
        }
    };

    const onVersionSelect = (versionIdx: number) => {
        const content = notesVersions[currNoteId][versionIdx].content;
        console.log({ content });
        setEditorState(
            content
                ? EditorState.createWithContent(convertFromRaw(JSON.parse(content)))
                : EditorState.createEmpty()
        );
        setCurrentVersion(versionIdx);
    };

    const onInputKeyDown = (evt) => {
        console.log(evt.key);
        if (evt.key === "Enter") {
            console.log({ title });
            if (title.length === 0) {
                setTitle("Untitled Note");
            } else if (editorRef?.current) {
                editorRef.current.focusEditor();
            }
        }
    };

    return (
        <div className="note-editor">
            <div className="note-editor__header">
                <div className="note-editor__header__versions">
                    <NoteVersionsDropDown
                        versions={notesVersions[currNoteId]}
                        currentVersion={currVersion}
                        onSelect={onVersionSelect}
                    />
                </div>
            </div>{" "}
            <h2 className="note-editor__title">
                <input
                    value={title}
                    onChange={(evt) => setTitle(evt.target.value)}
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
