import { useState, useRef, useEffect } from "react";
import {
    EditorState,
    ContentState,
    Modifier,
    RichUtils,
    convertToRaw,
    convertFromRaw,
} from "draft-js";

import { Editor, SyntheticKeyboardEvent } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { PostNoteReq, PatchNoteRes, GetNoteVersionRes } from "../types/notes.type";
import NoteVersionsDropDown from "./NoteVersionsDropDown";
import ComparisonEditor from "./ComparisonEditor";
const TAB_SIZE = 4;
import React from "react";
import { diffWords } from "diff";
import { useSelector } from "@xstate/react";
import { notesActor } from "../states/globalService";
import { NoteVersions } from "../types/notes.type";

// TODO: move Comparison component

export default function NoteEditor() {
    console.log(NoteEditor.name);
    const inputTitleRef = useRef();
    const notesVersions = useSelector(notesActor, (st) => st.context.notesVersions);
    const selectedNoteId = useSelector(notesActor, (st) => st.context.selectedNoteId);
    const selectedNoteTitle = useSelector(notesActor, (st) => st.context.selectedNoteTitle);
    const [title, setTitle] = useState(selectedNoteTitle);
    const draftContent = useSelector(notesActor, (st) => st.context.draftContent);
    console.log({ draftContent });
    const [editorState, setEditorState] = useState(
        draftContent
            ? EditorState.createWithContent(convertFromRaw(JSON.parse(draftContent)))
            : EditorState.createEmpty()
    );
    const editorRef = useRef();
    const isViewingPrevVersion = useSelector(notesActor, (st) =>
        st.matches("showingEditor.viewingPreviousVersion")
    );
    const isComparingPrevVersion = useSelector(notesActor, (st) =>
        st.matches("showingEditor.comparingPreviousVersion")
    );

    const selectedNoteVersion = useSelector(notesActor, (st) => st.context.selectedNoteVersion);
    useEffect(() => {
        setTitle(selectedNoteTitle);
    }, [selectedNoteTitle]);

    useEffect(() => {
        const prevRawContent = notesVersions[selectedNoteId][selectedNoteVersion].content;
        if (prevRawContent) {
            setEditorState(
                EditorState.createWithContent(convertFromRaw(JSON.parse(prevRawContent)))
            );
        }
    }, [selectedNoteVersion]);

    // const { notes, notesVersions, currNoteId, addNoteVersion } = useNotesContext();
    // const [currVersion, setCurrVersion] = useState<number | undefined>(undefined);
    // const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    // const [title, setTitle] = useState("");
    // const [isComparing, setIsComparing] = useState(false);
    // const [comparisonEditorState, setComparisonEditorState] = useState<EditorState | null>(null);

    // const editorRef = useRef<Editor>(null);

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

    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const handleReturn = (_: SyntheticKeyboardEvent): boolean => {
    //     setEditorState(RichUtils.insertSoftNewline(editorState));
    //     return true;
    // };

    const onKeyDownSave = (evt: React.KeyboardEvent<HTMLDivElement>) => {
        if ((evt.metaKey || evt.ctrlKey) && evt.keyCode === 83) {
            evt.preventDefault();
            const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
            console.log("onKeyDownSave", { content });
            notesActor.send({ type: "ADD_NOTE_VERSION", content });
        }
    };

    const onInputKeyDown = (evt: React.SyntheticEvent<InputEvent>) => {
        // TODO: check good typescript typing
        if ("key" in evt && evt.key === "Enter" && evt.target.value) {
            notesActor.send({ type: "UPDATE_NOTE_TITLE", title: evt.target.value });
        }
    };

    const handlePreviousVersionSelect = (version: number) => {
        if (version === selectedNoteVersion) return; // FIXME: guarded already in state machine
        const draftContent = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        console.log("notesActor.send", draftContent);
        notesActor.send({
            type: "SELECT_PREVIOUS_VERSION",
            version,
            draftContent,
        });
    };

    const onCloseHistoryClick = () => notesActor.send({ type: "SELECT_DRAFT" });
    const onCompareVersionClick = () => notesActor.send({ type: "COMPARE_PREVIOUS_VERSION" });

    return (
        <div className="note-editor">
            <div className="note-editor__header">
                <div className="note-editor__header__versions">
                    <pre>
                        {JSON.stringify(
                            { isviewingPreviousVersion: isViewingPrevVersion },
                            null,
                            2
                        )}
                    </pre>
                    <NoteVersionsDropDown
                        handlePreviousVersionSelect={handlePreviousVersionSelect}
                    />
                    {(isViewingPrevVersion || isComparingPrevVersion) && (
                        <div className="note-editor__view-previous-note">
                            <button
                                className="note-editor__view-previous-note__close-history-button"
                                onClick={onCloseHistoryClick}
                            >
                                Close history
                            </button>
                            {!isComparingPrevVersion && (
                                <button
                                    className="note-editor__view-previous-note__compare-button"
                                    onClick={onCompareVersionClick}
                                >
                                    Compare with latest version
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>{" "}
            <h2 className="note-editor__title">
                <input
                    ref={inputTitleRef}
                    defaultValue={selectedNoteTitle}
                    value={title}
                    onChange={(evt) => setTitle(evt.target.value)}
                    // onKeyDown={onInputKeyDown}
                    // onChange={(evt) => setTitle(evt.target.value)}
                    // @ts-ignore
                    onKeyDown={onInputKeyDown}
                ></input>
                {/* </form> */}
            </h2>
            <div className="note-editor__content" onKeyDown={onKeyDownSave}>
                {isComparingPrevVersion ? (
                    <ComparisonEditor />
                ) : (
                    <Editor
                        ref={editorRef}
                        editorState={editorState}
                        onEditorStateChange={(newEditorState) =>
                            selectedNoteVersion === 0 && setEditorState(newEditorState)
                        }
                        wrapperClassName="wrapper-class"
                        editorClassName="editor-class"
                        toolbarHidden={true}
                        onTab={onTab}
                        // handleReturn={handleReturn}
                    />
                )}
            </div>
        </div>
    );
}
