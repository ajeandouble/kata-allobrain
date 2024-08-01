import { toast } from "react-hot-toast";

export const notify = (msg: string, options = {}) => toast.error(msg, { position: "top-right", ...options });
export const notifySuccess = (msg: string, options = {}) => toast.error(msg, { position: "top-right", ...options });
export const notifyError = (msg: string, options = {}) => toast.error(msg, { position: "top-right", ...options });

export const ERROR_MSG = {
    LOADING_NOTES: "Error loading Notes",
    LOADING_NOTE: "Error loading Note",
    CREATING_NOTE: "Error loading Note",
    UPDATING_NOTE: "Error updating Note",
    DELETING_NOTE: "Error deleting Note"
} as const;