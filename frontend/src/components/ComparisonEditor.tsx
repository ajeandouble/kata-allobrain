import { Dispatch } from "react";
import { EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";

type ComparisonEditorProps = {
    setIsComparing: Dispatch<boolean>;
    comparisonEditorState: EditorState;
};

export default function ComparisonEditor({
    setIsComparing,
    comparisonEditorState,
}: ComparisonEditorProps) {
    return (
        <div className="comparison-view">
            <button className="note-editor__compare-close" onClick={() => setIsComparing(false)}>
                Close Comparison
            </button>
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
