import React from "react";
import { useState, useRef, useEffect } from "react";
import { EditorState, Modifier, convertToRaw, convertFromRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import NoteVersionsDropDown from "./NoteVersionsDropDown";
import ComparisonEditor from "./ComparisonEditor";
import { notesActor } from "../states/notesMachine";
import { useSelector } from "@xstate/react";

const TAB_SIZE = 4;

export default function NoteEditor() {
    const inputTitleRef = useRef();
    const notesVersions = useSelector(notesActor, (st) => st.context.notesVersions);
    const selectedNoteId = useSelector(notesActor, (st) => st.context.selectedNoteId);
    const selectedNoteTitle = useSelector(notesActor, (st) => st.context.selectedNoteTitle);
    const [title, setTitle] = useState(selectedNoteTitle);
    const draftContent = useSelector(notesActor, (st) => st.context.draftContent);
    const [editorState, setEditorState] = useState(
        draftContent
            ? EditorState.createWithContent(convertFromRaw(JSON.parse(draftContent)))
            : EditorState.createEmpty()
    );
    const editorRef = useRef(null);
    const isViewingPrevVersion = useSelector(notesActor, (st) =>
        // @ts-expect-error: matches arg is typed never
        st.matches("showingEditor.viewingPreviousVersion")
    );
    const isComparingPrevVersion = useSelector(notesActor, (st) =>
        // @ts-expect-error: matches arg is typed never
        st.matches("showingEditor.comparingPreviousVersion")
    );

    const selectedNoteVersion = useSelector(notesActor, (st) => st.context.selectedNoteVersion);
    useEffect(() => {
        setTitle(selectedNoteTitle);
    }, [selectedNoteTitle]);

    useEffect(() => {
        if (selectedNoteVersion === -1) {
            if (draftContent) {
                setEditorState(
                    EditorState.createWithContent(convertFromRaw(JSON.parse(draftContent)))
                );
            } else {
                setEditorState(EditorState.createEmpty());
            }
        } else {
            const prevRawContent = notesVersions[selectedNoteId][selectedNoteVersion].content;
            if (prevRawContent) {
                setEditorState(
                    EditorState.createWithContent(convertFromRaw(JSON.parse(prevRawContent)))
                );
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedNoteVersion]);

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

    const onKeyDownSave = (evt: React.KeyboardEvent<HTMLDivElement>) => {
        if ((evt.metaKey || evt.ctrlKey) && evt.keyCode === 83) {
            evt.preventDefault();
            const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
            notesActor.send({ type: "ADD_NOTE_VERSION", content });
        }
    };

    const onInputKeyDown = (evt: React.ChangeEvent<HTMLInputElement>) => {
        if ("key" in evt && evt.key === "Enter" && evt.target.value) {
            notesActor.send({ type: "UPDATE_NOTE_TITLE", title: evt.target.value });
            editorRef!.current!.focusEditor();
        }
    };

    const handlePreviousVersionSelect = (version: number) => {
        if (version === selectedNoteVersion) return;

        const draftContent = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        notesActor.send({
            type: "SELECT_PREVIOUS_VERSION",
            version,
            draftContent,
        });
    };

    const onCloseHistoryClick = () => notesActor.send({ type: "SELECT_DRAFT" });
    const onCompareVersionClick = () => notesActor.send({ type: "COMPARE_PREVIOUS_VERSION" });
    const onEditorCloseClick = () => notesActor.send({ type: "CLOSE_NOTE" });

    return (
        <div className="note-editor">
            <div className="note-editor__header">
                <div className="note-editor__header__versions">
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
                <img
                    className="note-editor__header__close-editor"
                    src="/close-editor.svg"
                    onClick={onEditorCloseClick}
                ></img>
            </div>
            <h2 className="note-editor__title">
                <input
                    ref={inputTitleRef}
                    defaultValue={selectedNoteTitle}
                    value={title}
                    onChange={(evt) => setTitle(evt.target.value)}
                    disabled={isComparingPrevVersion}
                    // @ts-expect-error: React typing for input events
                    onKeyDown={onInputKeyDown}
                ></input>
            </h2>
            <div className="note-editor__content" onKeyDown={onKeyDownSave}>
                {isComparingPrevVersion ? (
                    <ComparisonEditor />
                ) : (
                    <Editor
                        ref={editorRef}
                        editorState={editorState}
                        onEditorStateChange={(newEditorState) =>
                            selectedNoteVersion === -1 && setEditorState(newEditorState)
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
