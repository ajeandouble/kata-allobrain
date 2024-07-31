import { useEffect, useState } from "react";
import { ContentState, EditorState, Modifier } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { useSelector } from "@xstate/react";
import { notesActor } from "../states/globalService";
import { diffWords } from "diff";

export default function ComparisonEditor() {
    const selectedNoteVersion = useSelector(notesActor, (st) => st.context.selectedNoteVersion);
    const selectedNoteId = useSelector(notesActor, (state) => state.context.selectedNoteId);
    const allNotesVersions = useSelector(notesActor, (state) => state.context.notesVersions);
    const notesVersions = allNotesVersions[selectedNoteId];
    const [comparisonEditorState, setComparisonEditorState] = useState(null);
    const state = useSelector(notesActor, (st) => st); // FIXME: delete this after dbg!!!
    useEffect(() => {
        const currentContent = JSON.parse(notesVersions[selectedNoteVersion].content).blocks[0]
            .text;
        const latestContent = JSON.parse(notesVersions[0].content).blocks[0].text;

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
    }, [selectedNoteVersion]);

    return (
        <div className="comparison-view">
            <Editor
                editorState={comparisonEditorState}
                readOnly={true}
                toolbarHidden={true}
                customStyleMap={{
                    HIGHLIGHT_ADDED: {
                        backgroundColor: "#f200ff",
                    },
                    HIGHLIGHT_REMOVED: {
                        backgroundColor: "#068e00",
                        textDecoration: "line-through",
                    },
                }}
            />
        </div>
    );
}
