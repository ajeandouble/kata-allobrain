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
import { PostNoteReq, PatchNoteRes, GetNoteVersionRes } from "../types/NoteTypes";
import NoteVersionsDropDown from "./NoteVersionsDropDown";
import ComparisonEditor from "./ComparisonEditor";
import { useNotesContext } from "../context/NotesContext";
const TAB_SIZE = 4;
import React from "react";
import { diffWords } from "diff";

// TODO: move Comparison component

export default function NoteEditor() {
    const { notes, notesVersions, currNoteId, addNoteVersion } = useNotesContext();
    const [currVersion, setCurrVersion] = useState<number | undefined>(undefined);
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    const [title, setTitle] = useState("");
    const [isComparing, setIsComparing] = useState(false);
    const [comparisonEditorState, setComparisonEditorState] = useState<EditorState | null>(null);

    const handleCompareVersions = () => {
        if (isComparing) {
            setIsComparing(false);
            return;
        }
        if (currVersion !== undefined && currVersion !== 0) {
            const currentContent = JSON.parse(notesVersions[currNoteId][currVersion].content)
                .blocks[0].text;
            const latestContent = JSON.parse(notesVersions[currNoteId][0].content).blocks[0].text;

            const differences = diffWords(currentContent, latestContent);

            let comparisonText = "";
            const decorations: { start: number; end: number; style: string }[] = [];

            differences.forEach((part) => {
                const start = comparisonText.length;
                comparisonText += part.value;
                const end = comparisonText.length;

                if (part.added) {
                    decorations.push({
                        start,
                        end,
                        style: "HIGHLIGHT_ADDED",
                    });
                } else if (part.removed) {
                    decorations.push({
                        start,
                        end,
                        style: "HIGHLIGHT_REMOVED",
                    });
                }
            });

            let comparisonState = EditorState.createWithContent(
                ContentState.createFromText(comparisonText)
            );

            decorations.forEach((decoration) => {
                comparisonState = EditorState.push(
                    comparisonState,
                    Modifier.applyInlineStyle(
                        comparisonState.getCurrentContent(),
                        comparisonState.getSelection().merge({
                            anchorOffset: decoration.start,
                            focusOffset: decoration.end,
                        }),
                        decoration.style
                    ),
                    "change-inline-style"
                );
            });

            setComparisonEditorState(comparisonState);
            setIsComparing(true);
        }
    };

    useEffect(() => {
        const versionsLength = notesVersions[currNoteId].length;
        if (versionsLength) {
            setCurrVersion(0);
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
        const updatedNote: [PatchNoteRes, GetNoteVersionRes] | undefined = await addNoteVersion(
            currNoteId,
            body
        );
        if (updatedNote) {
            const [patchedNote, latestVersion] = updatedNote;
            const content = latestVersion.content;
            setCurrVersion(0);
            setTitle(patchedNote.title);
        }
    };

    const onKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
        if ((evt.metaKey || evt.ctrlKey) && evt.keyCode === 83) {
            evt.preventDefault();
            handleSave();
        }
    };

    const onVersionSelect = (versionIdx: number) => {
        const content = notesVersions[currNoteId][versionIdx].content;
        setEditorState(
            content
                ? EditorState.createWithContent(convertFromRaw(JSON.parse(content)))
                : EditorState.createEmpty()
        );
        setCurrVersion(versionIdx);
    };

    const onInputKeyDown = (evt: KeyboardEvent) => {
        if (evt.key === "Enter") {
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
                        setIsComparing={setIsComparing}
                    />
                    {currVersion !== undefined && currVersion !== 0 && (
                        <button
                            className="note-editor__compare-button"
                            onClick={handleCompareVersions}
                            hidden={isComparing}
                        >
                            Compare with latest version
                        </button>
                    )}
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
                {isComparing && comparisonEditorState ? (
                    <ComparisonEditor
                        setIsComparing={setIsComparing}
                        comparisonEditorState={comparisonEditorState}
                    />
                ) : (
                    <Editor
                        ref={editorRef}
                        editorState={editorState}
                        onEditorStateChange={(newEditorState) => {
                            if (currVersion === 0) setEditorState(newEditorState);
                        }}
                        wrapperClassName="wrapper-class"
                        editorClassName="editor-class"
                        toolbarHidden={true}
                        onTab={onTab}
                        handleReturn={handleReturn}
                    />
                )}
            </div>
        </div>
    );
}
