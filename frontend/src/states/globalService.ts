import { setup, assign, fromPromise, createActor } from "xstate";
import { Note, NotesObj, NotesVersionsObj, NoteVersion } from "../types/notes.type";
import { getAllNotes, getAllNoteVersions, patchNote } from "../api/notes.api";

/* Notes Machine */

export interface NotesContext {
    selectedNoteId: string | undefined;
    notes: NotesObj;
    notesVersions: NotesVersionsObj;
    selectedNoteVersion: number,
    selectedNoteVersionContent: string,
    updatedNoteContent: string
}

export type NotesEvent =
    | { type: "SELECT_NOTE"; id: string }
    | { type: "CLOSE_NOTE" }
    | { type: "ADD_NOTE" }
    | { type: "DELETE_NOTE" }
    | { type: "UPDATE_NOTE_TITLE" }
    | { type: "ADD_NOTE_VERSION" };

const notesMachine = setup({
    types: {
        context: {} as NotesContext
    },
    actors: {
        getAllNotes: fromPromise(async () => {
            const notes = (await getAllNotes()) as Note[];
            return (notes as Note[]).reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {} as NotesObj);
        }),
        getNoteVersions: fromPromise(async ({ input }) => {
            const { selectedNoteId: id, notesVersions } = input as { selectedNoteId: string, notesVersions: NotesVersionsObj };
            if (id in notesVersions) return notesVersions[id];
            return (await getAllNoteVersions({ params: { id } })) as NoteVersion[];
        }),
        patchNote: fromPromise(async ({ input }) => {
            const { selectedNoteId: id, selectedNoteTitle: title, selectedNoteContent: content }
                = input as { selectedNoteId: string, selectedNoteTitle: string, selectedNoteContent: string };
            const data = await patchNote({ params: { id }, body: { title, content } });
            console.log(data);
            return data;
        })
    }
}).createMachine<NotesContext, NotesEvent>({
    /** @xstate-layout N4IgpgJg5mDOIC5QDsD2AXOBZAhgYwAsBLZMAOgBtUcISoBiCVUskgN1QGtyAzMdQgEEKFAHIY4AbQAMAXUSgADqlhF0RZgpAAPRADY9AJjIBWaQHYAHIfPmTlqwE4AjABoQAT0TOAzCdOGPgAsPnYAvmHuaJiwuIQk5FQ0dPRgAE5pqGlkihQ46DxZALZkfAIEwmISsDLySCDKquqa9boIQdKOpiZB5tI29k7Seu5eCJbOphFR1XHELEm0yFDiMQBiOEQUAK5pYPQASgCiACoHAJq1Wo1qGshabYZBk4YThnomhoOWjsOj3s8yC4DCY9EFHM8OkZpiBoth8PNyEQIBR9gBlI4AGSOAGETgB9UQAeRORyu9RuzXurUQEJ8ZD6PmcHS+Dh+bk8iEMhi6lk6lg+TJMdk+MLhsQRCUo1CWKwkADV0qpmLBGMwkcgONxSvxCKswIq0srkDU5NcVLcWqA2nSGdImSzvi5-ggTM5LAyjI5fkKRc4xbNJQsZXR9YbjaqcZiiRjCSSyWaKRaqQ9vNJpP4TD0+gM2c7OQhfPS-HpbNJLD5K1X-ZFYYH4ixILdlvQozGjnHSeSlMm7qmEAZjGYrDY7HmOWNuR7HOZBc5HNYgoZ3ZYAzE5lKm+oWxjsXjOwm6j2mn2aQOjKYLNZbE6J4hQvSTD4wTYJsKs4YIrW0BA4FpxRupDmieVo6IgAC0IwFpBa7wg2iQhsswGWtS1r3p8QJ6J0nxjkMUFjL4QSwRK8HSskyz6rAGxbLsYDISmZ5Li6zLGM8IJghCzLDJ+371oirAonRSYgahYHjFmZCGPaXGsk4d4IE8-hST4nRBEEi7LpYq68euQYIeRcqYOGdzwMJKH9s4zizt0vT9LhPwus+9JBF6PrOO+oo6XB-FbnQ9GnmhrohGQlnmFJuZyS6T7GM+QQfm+fpfmEQA */
    id: "notesMachine",
    initial: "loading",
    context: {
        notes: {},
        selectedNoteId: null,
        notesVersions: {},
        selectedNoteVersion: null,
        selectedNoteContent: "",
        selectedNoteTitle: "",
        updatedNoteContent: ""
    },
    states: {
        loading: {
            invoke: {
                id: "fetchAllNotes",
                src: "getAllNotes",
                onDone: {
                    target: "idle", actions: assign({ notes: ({ event: { output } }) => output })
                },
                onError: {

                },
            },
        },
        loadingNotesFailure: { on: { RETRY: "loading" } },
        idle: {
            entry: assign({ content: () => "" }),
            on: {
                SELECT_NOTE: {
                    target: "loadingNoteVersions",
                    actions: assign({ selectedNoteId: ({ event }) => event.id })
                },
            },
        },
        loadingNoteVersions: {
            invoke: {
                id: "fetchNoteVersions",
                src: "getNoteVersions",
                input: ({ context: { selectedNoteId, notesVersions } }) => ({ selectedNoteId, notesVersions }),
                onDone: {
                    target: "editing", actions: assign({
                        notesVersions: ({ context, event: { output } }) =>
                            ({ ...context.notesVersions, [context.selectedNoteId]: output })
                    })
                },
                onError: {
                }
            },
            on: {
                CLOSE_NOTE: {
                    target: "idle",
                    actions: assign({ selectedNoteId: null, }),
                }
            }
        },
        editing: {
            initial: "idle",
            entry: assign({
                selectedNoteContent: ({ event: { output } }) => output[0].content,
                selectedNoteVersion: 0,
                selectedNoteTitle: ({ context }) => context.notes[context.selectedNoteId].title
            }),
            on: {
                CLOSE_NOTE: {
                    target: "idle",
                    actions: assign({
                        selectedNoteId: null,
                        selectedNoteContent: "",
                        selectNoteVersion: null,
                        selectedNoteTitle: "",
                        updatedNoteContent: ""
                    }),
                },
                SELECT_NOTE: {
                    target: "loadingNoteVersions",
                    actions: assign({ selectedNoteId: ({ event }) => event.id }),
                    guard: ({ event, context }) => event.id !== context.selectedNoteId
                },
            },
            states: {
                initial: "idle",
                idle: {
                    on: {
                        UPDATE_NOTE_TITLE: {
                            target: "updatingNote",
                            actions: assign({ selectedNoteTitle: ({ event }) => event.title })
                        },
                        ADD_NOTE_VERSION: {
                            target: "updatingNote",
                            actions: assign({ updatedNoteContent: ({ event }) => event.content })
                        },
                    },
                },
                updatingNote: {
                    invoke: {
                        id: "updateNote",
                        src: "patchNote",
                        input: ({ context: { selectedNoteId, selectedNoteTitle, updatedNoteContent } }) =>
                            ({ selectedNoteId, selectedNoteTitle, updatedNoteContent }),
                        onDone: {
                            target: "idle", actions: assign({
                                selectedNoteTitle: ({ event: { output: { title } } }) => title,
                                notes: ({ context, event: { output } }) =>
                                    ({ ...context.notes, [context.selectedNoteId]: output })
                            })
                        },
                        onError: {
                            target: "idle",
                            actions: assign({
                                selectedNoteTitle: ({ context }) => context.notes[context.selectedNoteId].title
                            })
                        }
                    },
                },
                updatingNoteTitleFailure: {},
                updatingNoteVersions: {},
            }
        }
    }
});


const notesActor = createActor(notesMachine).start();

export { notesActor };