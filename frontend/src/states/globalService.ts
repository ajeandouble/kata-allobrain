import { setup, assign, fromPromise, createActor } from "xstate";
import { Note, NotesObj, NotesVersionsObj, NoteVersion } from "../types/notes.type";
import { getAllNotes, getAllNoteVersions, patchNote, postNote } from "../api/notes.api";

/* Notes Machine */

export interface NotesContext {
    selectedNoteId: string | undefined;
    notes: NotesObj;
    notesVersions: NotesVersionsObj;
    selectedNoteVersion: number,
    selectedNoteVersionContent: string,
    updatedNoteVersionContent: string
    selectedNoteTitle: string
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
            const { selectedNoteId: id } = input as { selectedNoteId: string };
            // if (id in notesVersions) return notesVersions[id]; // TODO: memoize later
            return (await getAllNoteVersions({ params: { id } })) as NoteVersion[];
        }),
        postNote: fromPromise(async () => {
            return (await postNote({ body: { title: "Untitled Note" } }));
        }),
        patchNote: fromPromise(async ({ input }) => {
            console.log({ input });
            const { selectedNoteId: id, selectedNoteTitle: title, updatedNoteVersionContent: content }
                = input as { selectedNoteId: string, selectedNoteTitle: string, updatedNoteVersionContent: string };
            const data = await patchNote({ params: { id }, body: { title, content } });
            console.log(data);
            return data;
        })
    }
}).createMachine<NotesContext, NotesEvent>({
    id: "notesMachine",
    initial: "loading",
    context: {
        notes: {},
        selectedNoteId: null,
        notesVersions: {},
        selectedNoteVersion: null,
        selectedNoteVersionContent: "",
        selectedNoteTitle: "",
        updatedNoteVersionContent: ""
    },
    on: {
        ADD_NOTE: {
            target: ".addingNote"
        }
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
                // ADD_NOTE: {
                //     target: "addingNote"
                // }
            },
        },
        addingNote: {
            invoke: {
                id: "addNote",
                src: "postNote",
                onDone: {
                    target: "loadingNoteVersions",
                    actions: assign({
                        notes: ({ context, event: { output } }) => ({ [output.id]: output, ...context.notes }),
                        selectedNoteId: ({ event: { output } }) => output.id,
                        selectedNoteVersion: ({ event: { output } }) => output.latest_version,
                        selectedNoteVersionContent: ({ event: { output } }) => output.content,
                        updatedNoteVersionContent: ({ event: { output } }) => output.content,
                        selectedNoteTitle: ({ event: { output } }) => output.title
                    })
                },
                onError: {}
            },
        },
        loadingNoteVersions: {
            invoke: {
                id: "fetchNoteVersions",
                src: "getNoteVersions",
                input: ({ context: { selectedNoteId, notesVersions } }) => ({ selectedNoteId, notesVersions }),
                onDone: {
                    target: "editing",
                    actions: assign({
                        notesVersions: ({ context, event: { output } }) =>
                            ({ ...context.notesVersions, [context.selectedNoteId]: output })
                    })
                },
                onError: {}
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
                selectedNoteVersionContent: ({ event: { output } }) => output[0].content,
                selectedNoteVersion: 0,
                selectedNoteTitle: ({ context }) => context.notes[context.selectedNoteId].title
            }),
            on: {
                CLOSE_NOTE: {
                    target: "idle",
                    actions: assign({
                        selectedNoteId: null,
                        selectedNoteVersionContent: "",
                        selectNoteVersion: null,
                        selectedNoteTitle: "",
                        updatedNoteVersionContent: ""
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
                            actions: assign({ updatedNoteVersionContent: ({ event }) => event.content })
                        },
                    }
                },
                updatingNote: {
                    invoke: {
                        id: "updateNote",
                        src: "patchNote",
                        input: ({ context: { selectedNoteId, selectedNoteTitle, updatedNoteVersionContent } }) =>
                            ({ selectedNoteId, selectedNoteTitle, updatedNoteVersionContent }),
                        onDone: {
                            target: "refreshNoteVersions", actions: assign({
                                selectedNoteTitle: ({ event: { output: { title } } }) => title,
                                notes: ({ context, event: { output } }) =>
                                    ({ ...context.notes, [context.selectedNoteId]: output }),
                            })
                        },
                        onError: {
                            // TODO: error managment
                            target: "idle",
                            actions: assign({
                                selectedNoteTitle: ({ context }) => context.notes[context.selectedNoteId].title
                            })
                        }
                    },
                    on: {
                        CLOSE_NOTE: {
                            target: "idle",
                            actions: assign({ selectedNoteId: null, }),
                        }
                    }
                },
                refreshNoteVersions: {
                    invoke: {
                        id: "fetchNoteVersions",
                        src: "getNoteVersions",
                        input: ({ context: { selectedNoteId, notesVersions } }) => ({ selectedNoteId, notesVersions }),
                        onDone: {
                            target: "idle", actions: assign({
                                notesVersions: ({ context, event: { output } }) =>
                                    ({ ...context.notesVersions, [context.selectedNoteId]: output })
                            })
                        },
                        onError: {}
                    }
                }
            }
        }
    }
});

const notesActor = createActor(notesMachine).start();

export { notesActor };