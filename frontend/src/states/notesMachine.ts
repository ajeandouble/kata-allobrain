import { setup, createMachine, assign, fromPromise } from "xstate";
import { Note, NotesObj } from "../types/notes.type";
import { getAllNotes } from "../api/notes.api";

export interface NotesContext {
    isLeftPanelCollapsed: boolean;
    selectedNoteId: string | undefined;
    notes: NotesObj
}

export type NotesEvent =
    | { type: "TOGGLE_PANEL" }
    | { type: "SELECT_NOTE"; id: string }
    | { type: "CLOSE_NOTE" };

export default setup({
    types: {
        context: {} as NotesContext
    },
    actors: {
        getAllUsers: fromPromise(async () => {
            const notes = (await getAllNotes()) as unknown;
            const notesObj = (notes as Note[]).reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {} as NotesObj);
            return notesObj;
        })
    }
}).createMachine<NotesContext, NotesEvent>({
    /** @xstate-layout N4IgpgJg5mDOIC5QDsD2AXMBRCBLdqATgHS4QA2YAxACoDyA4gwDJYD6ACgIIByWzAbQAMAXUSgADqlj5cqZOJAAPRABYATABoQAT0QBGAGwB2YgGZDATgAcq60MPr9Zy-oC+b7Wkw58RUhTUAMr8WADCNGw8dDRYwmJIIFIy6HIKiSoITobmZgCslqqWxmb6quXW1tp6WXlmxBrFeUJFlkKlxsYeXhjYeAQkkLLIULSMLOzcfIKiismy8oqZZsaWxOqWVvqFeduuVboGncSWdfp5hoZ1edbnXZ4g3n1+g-24I1QhrBFRMXGziXmqUWGUQZlsJ1sGiK7WM6na1UQt2IzSEaJul0MlVO3UevV8A2IQ1SHzCzDoIV+sXic2kC3SoEy6nU9Q2WM6+Q0FmciIQ5xyxSulmK+icLnOHgeaAgcEUTwJRFpKTSS0QAFpDLyNcQ0bq9fr7j0fP1-GRKEr6aqENZTKp9KsrPZVuprGZeeoscRrMzNqsLqo4dZcfKTa9hlALcCGco1GV1lYbk5LOC2oZVO7Vg0HGYhMZyi08-bJW4gA */
    id: "noteEditor",
    initial: "loading",
    context: {
        isLeftPanelCollapsed: false,
        selectedNoteId: undefined,
        notes: {},
    },
    states: {
        loading: {
            invoke: {
                id: "getAllNotes",
                src: getAllNotes,
                onDone: {
                    target: "idle", actions: assign({ notes: (_, evt) => evt.data })
                },
                onError: {

                },
            },
        },
        loadingNotesFailure: { on: { RETRY: "loading" } },
        idle: {
            on: {
                TOGGLE_PANEL: {
                    actions: assign({
                        isLeftPanelCollapsed: ({ context }) => !context.isLeftPanelCollapsed,
                    }),
                },
                SELECT_NOTE: {
                    target: "editing",
                    actions: assign({
                        selectedNoteId: ({ event }) => event.id
                    }),
                },
            },
        },
        editing: {
            on: {
                TOGGLE_PANEL: {
                    actions: assign({
                        isLeftPanelCollapsed: ({ context }) => !context.isLeftPanelCollapsed,
                    }),
                },
                SELECT_NOTE: {
                    actions: assign({
                        selectedNoteId: ({ event }) => event.id
                    }),
                },
                CLOSE_NOTE: {
                    target: "idle",
                    actions: assign({
                        selectedNoteId: null,
                    }),
                },
            },
        },
    },
});