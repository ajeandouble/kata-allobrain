import { useState, Dispatch } from "react";
import { NoteVersion } from "../types/notes.type";
type NoteVersionDropDownProps = {
    versions: NoteVersion[];
    currentVersion: number | undefined;
    onSelect: Dispatch<number>;
    setIsComparing: Dispatch<boolean>;
};

export default function NoteVersionsDropDown() {
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSelect = (versionIdx: number) => {
        if (versionIdx === currentVersion) return;
        onSelect(versionIdx);
        setShowDropdown(false);
        setIsComparing(false);
    };

    return (
        <div className="note-version-dropdown" onMouseLeave={() => setShowDropdown(false)}>
            <button
                onMouseEnter={() => setShowDropdown(true)}
                onClick={() => setShowDropdown(!showDropdown)}
            >
                {showDropdown && versions.length > 1 ? (
                    "Versions"
                ) : (
                    <span>
                        <i>Last saved at: </i>
                        {`${!!versions && new Date(versions[0].created_at).toLocaleString()}`}
                    </span>
                )}
            </button>
            {showDropdown && (
                <ul className="note-version-dropdown__list">
                    {currentVersion !== undefined &&
                        versions.length > 1 &&
                        versions.toSpliced(-1).map((version: NoteVersion, versionIdx: number) => (
                            <li key={version.id} onClick={() => handleSelect(versionIdx)}>
                                <b>{versions.length - versionIdx - 1}: </b>
                                {new Date(version.created_at).toLocaleString()}
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
}
