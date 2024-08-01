import { useState } from "react";
import { NoteVersion } from "../types/notes.type";
import { notesActor } from "../states/notesMachine";
import { useSelector } from "@xstate/react";

// type NoteVersionDropDownProps = {
//     versions: NoteVersion[];
//     currentVersion: number | undefined;
//     onSelect: Dispatch<number>;
//     setIsComparing: Dispatch<boolean>;
// };

export default function NoteVersionsDropDown({ handlePreviousVersionSelect }) {
    const [showDropdown, setShowDropdown] = useState(false);

    const selectedNoteId = useSelector(notesActor, (state) => state.context.selectedNoteId);
    const allNotesVersions = useSelector(notesActor, (state) => state.context.notesVersions);
    const notesVersions = allNotesVersions[selectedNoteId];

    const onNoteVersionClick = (versionIdx) => {
        if (versionIdx === -1) {
            notesActor.send({ type: "SELECT_DRAFT" });
        } else {
            handlePreviousVersionSelect(versionIdx);
        }
        setShowDropdown(false);
    };

    return (
        <div className="note-version-dropdown" onMouseLeave={() => setShowDropdown(false)}>
            <button
                onMouseEnter={() => setShowDropdown(true)}
                onClick={() => setShowDropdown(!showDropdown)}
            >
                {showDropdown && notesVersions.length > 1 ? (
                    "Versions"
                ) : (
                    <span>
                        <i>Last saved at:&nbsp;</i>
                        {`${new Date(notesVersions[0].created_at).toLocaleString()}`}
                    </span>
                )}
            </button>
            {showDropdown && (
                <ul className="note-version-dropdown__list">
                    {notesVersions.length > 1 && (
                        <li key={"draft"} onClick={() => onNoteVersionClick(-1)}>
                            <b>Draft</b>
                        </li>
                    )}
                    {notesVersions.toSpliced(-1).map((version: NoteVersion, versionIdx: number) => (
                        <li key={version.id} onClick={() => onNoteVersionClick(versionIdx)}>
                            {new Date(version.created_at).toLocaleString()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
