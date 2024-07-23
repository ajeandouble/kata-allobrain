import { useState, Dispatch } from "react";
import { NoteVersion } from "../types/NoteTypes";

type NoteVersionDropDownProps = {
    versions: NoteVersion[];
    onSelect: Dispatch<NoteVersion>;
    updateDate: string;
};

export default function NoteVersionsDropDown({
    versions,
    onSelect,
    updateDate,
}: NoteVersionDropDownProps) {
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSelect = (version: NoteVersion) => {
        onSelect(version);
        setShowDropdown(false);
    };

    return (
        <div className="note-version-dropdown" onMouseLeave={() => setShowDropdown(false)}>
            <button
                onMouseEnter={() => setShowDropdown(true)}
                onClick={() => setShowDropdown(!showDropdown)}
            >
                {showDropdown && versions.length > 1
                    ? "Versions"
                    : new Date(updateDate).toLocaleString()}
            </button>
            {showDropdown && (
                <ul className="note-version-dropdown__list">
                    {versions.length > 1 &&
                        versions.toSpliced(-1).map((version: NoteVersion) => (
                            <li key={version.version} onClick={() => handleSelect(version)}>
                                <b>{version.version}: </b>
                                {new Date(version.created_at).toLocaleString()}
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
}
