import { useState, Dispatch } from "react";
import { NoteVersion } from "../types/NoteTypes";

type NoteVersionDropDownProps = {
    versions: NoteVersion[];
    currentVersion: number;
    onSelect: Dispatch<number>;
};

export default function NoteVersionsDropDown({
    versions,
    currentVersion,
    onSelect,
}: NoteVersionDropDownProps) {
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSelect = (versionIdx: number) => {
        onSelect(versionIdx);
        setShowDropdown(false);
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
