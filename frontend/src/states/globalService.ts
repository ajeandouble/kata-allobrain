import { setup, assign, fromPromise, createActor } from "xstate";
import { Note, NotesObj, NotesVersionsObj, NoteVersion } from "../types/notes.type";
import { getAllNotes, getAllNoteVersions, patchNote, postNote } from "../api/notes.api";

/* Notes Machine */

export interface NotesContext {
    selectedNoteId: string | undefined;
    notes: NotesObj;
    notesVersions: NotesVersionsObj;
    selectedNoteVersion: number,
    selectedNoteTitle: string
    draftContent: string
}

// TODO: Use `as const` "enum"
export type NotesEvent =
    | { type: "SELECT_NOTE"; id: string }
    | { type: "CLOSE_NOTE" }
    | { type: "ADD_NOTE" }
    | { type: "DELETE_NOTE" }
    | { type: "UPDATE_NOTE_TITLE" }
    | { type: "ADD_NOTE_VERSION" }
    | { type: "SELECT_PREVIOUS_VERSION" };

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
            const { selectedNoteId: id, selectedNoteTitle: title, draftContent: content }
                = input as { selectedNoteId: string, selectedNoteTitle: string, draftContent: string };
            const data = await patchNote({ params: { id }, body: { title, content } });
            console.log(data);
            return data;
        })
    }
}).createMachine<NotesContext, NotesEvent>({
    /** @xstate-layout N4IgpgJg5mDOIC5QDsD2AXOBZAhgYwAsBLZMAOgBtUcISoBiCVUskgN1QGtyAzMdQgEEKFAHIY4AbQAMAXUSgADqlhF0RZgpAAPRADYArACYyB6QHZzARgAcAFjtWL0mwBoQAT0Q2jJl0YBmcxtzAE4baT07AIBfGPc0TFhcQhJyKho6ejAAJxzUHLJFChx0HgKAWzI+AQJhMQlYGXkkEGVVdU1W3QQrPptTc2kjC3sA0IN3LwRzPQHpAxtQ4ICI1Ym4hMaU4hYM2mQocSSAMRwiCgBXHLB6ACUAUQAVO4BNZq12tQ1kLR6jRxkIw2Pp6WZWPTDCF6KbeYFkOzmAyLGxLZGhXybECJbD4XbkIgQCi3ADKDwAMg8AMJPAD6ogA8k8Hh9Wl9Or9uvojLDegErAEyMEDHYDMElrNRVicck8WlWETboIACLK+lMllyT4qb5dUA9Yy8qwGKzmMgYmxgozmEYLKXxbHbOUsGgHI4SRjMAnIDjcMiu45gVlKHUcv6IUXSMhBOwhAyhALSZYjSaeRDGvqmAIimwBQwBAsGPTSp2pF0QN2B7J5ApFEplSr+iuB4NtUM-cMIGPmoxiszLPR9AJ2I2is0mkYjKzRQJ2IwlpI7eX7OiBgBquVUzFgnpY7C4vH4hHXm5+TS1bPbep06cTdjI0jsVrmg4m5l5wPvRjmj8in5Bw4LriZbpNQlYSBuORbsgO65PkhTFKU5Q5FUNTHhBp7bq27IdlyvQYqEphWARYrSE4oowmmvS2IKvhFkWiLAiaQGyiBZCQN8hz0FS5IMmS6rMthV6cvqt6Pg+T42i+xFiryRaEWRkJPnOvbGuYLFLiwHHqFxZKUjSAkPLSa4PHcJIAJIMqIQkdLhom9Em97EVYRihHO1iOMOvIgkRoThH5YpDIEGnOuQ2lZHp1J0oygkXiGtnXj0NpGkYprRgEgQFqswK9iFbHhYcCrEvQACqAAKyqCMyhm0k85lPJSNm6iJN69DYBimNIXXSNmj56MsAq8no-JkJCiwGKs5jDmYVh5fi7G0DpUBFUqqo1SZZmWdZcVtglLU9LYHVmN1vVPgNARydmZDGtarl5oYTjFg6MqaWFi10GQlyKBApSrh6TB7j6B6fd9pRgC2O04Yl+iWtdIQZYxAL8pR0wTYRN1IrYj6osCc3ygVy1fT9S1VnBtaIQ2KEg8T4MSE1YZ4b4Jg+BEkRgpYNGptMDhWKNflRMseb8sieNae9hU3DwNywAQJ5QWeu7er6h61HL0Hni08XNZ2L5w1NAI2kjEIfn5CJTU4fmpalNii29nHLZL0uyxh8vbtW8F1khjZoc7mCQer9N2a14RRsEdgYr4NEgm4VGxmaeiucCPhucExpxM9qAQHAWgvaF2p7Z2AC0xG8oXHUh91leV3YtuUGBdD59reHZiYoSQj4qwmmCoreSMpiLG5xqhF1rmzRni6hXXmSHIGsBnBc1xgI3DP2XOvcDMsyKomi8aYuPwHzYSxLL0HB1Ph1fXmHOyP6zyVHxoRV-fgsIfGDX++sfNrp-ZgJ-Q-hHVXJgnagWMI4wMRGhNFGMixFcwt3hjbD+r0p7gT9phGCf99r6AFECYc2YBSWHDlYFKV0bRFmInMAEw8npbAnvlcWUBMGdlckaKI5pzbTmUlEWw6kkGTwJitJheFLBDUBBNAESZDCpwBLXARRNfozwkEI1ePV2FRAThlCIsY76oyCKNROJozAOFSmPWhB98YMLII7OAvswD+zPMo4OSYHyrEtIibhjhQhyTsFGFyGJDGPjnH0dOMQgA */
    id: "notesMachine",
    initial: "loading",
    context: {
        notes: {},
        selectedNoteId: null,
        notesVersions: {},
        selectedNoteVersion: null,
        selectedNoteTitle: "",
        draftContent: "",
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
            on: {
                SELECT_NOTE: {
                    target: "loadingNoteVersions",
                    actions: assign({ selectedNoteId: ({ event }) => event.id })
                },
                ADD_NOTE: {
                    target: "addingNote"
                }
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
                        draftContent: ({ event: { output } }) => output.content,
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
                    target: "showingEditor",
                    actions: assign({
                        notesVersions: ({ context, event: { output } }) =>
                            ({ ...context.notesVersions, [context.selectedNoteId]: output }),
                    })
                },
                onError: {}
            }
        },
        showingEditor: {
            initial: "editing",
            entry: assign({
                draftContent: ({ event: { output } }) => output[0].content,
                selectedNoteVersion: 0,
                selectedNoteTitle: ({ context }) => context.notes[context.selectedNoteId].title,
            }),
            on: {
                SELECT_NOTE: {
                    target: "loadingNoteVersions",
                    actions: assign({ selectedNoteId: ({ event }) => event.id }),
                    guard: ({ event, context }) => event.id !== context.selectedNoteId
                },
                CLOSE_NOTE: {
                    target: "idle",
                    actions: assign({
                        selectedNoteId: null,
                        selectNoteVersion: null,
                        selectedNoteTitle: "",
                        draftContent: ""
                    }),
                }
            },
            states: {
                initial: "editing",
                editing: {
                    on: {
                        UPDATE_NOTE_TITLE: {
                            target: "updatingNote",
                            actions: assign({ selectedNoteTitle: ({ event }) => event.title })
                        },
                        ADD_NOTE_VERSION: {
                            target: "updatingNote",
                            actions: assign({ draftContent: ({ event }) => event.content }),
                            guard: ({ event, context }) => event.content !== context.notesVersions[context.selectedNoteId][0].content
                            // TODO: add guard in case of no delta
                        },
                        SELECT_PREVIOUS_VERSION: {
                            target: "viewingPreviousVersion",
                            actions: assign({
                                selectedNoteVersion: ({ event }) => event.version,
                                draftContent: ({ event }) => event.draftContent
                            }),
                        }
                    }
                },
                viewingPreviousVersion: {
                    on: {
                        SELECT_DRAFT: {
                            target: "editing",
                            actions: assign({ selectedNoteVersion: 0 })
                        },
                        SELECT_PREVIOUS_VERSION: {
                            actions: assign({ selectedNoteVersion: ({ event }) => event.version }),
                        }
                    }
                },
                updatingNote: {
                    invoke: {
                        id: "updateNote",
                        src: "patchNote",
                        input: ({ context: { selectedNoteId, selectedNoteTitle, draftContent } }) =>
                            ({ selectedNoteId, selectedNoteTitle, draftContent }),
                        onDone: {
                            target: "refreshNoteVersions", actions: assign({
                                selectedNoteTitle: ({ event: { output: { title } } }) => title,
                                notes: ({ context, event: { output } }) =>
                                    ({ ...context.notes, [context.selectedNoteId]: output }),
                            })
                        },
                        onError: {
                            // TODO: error managment
                            target: "editing",
                            actions: assign({
                                selectedNoteTitle: ({ context }) => context.notes[context.selectedNoteId].title
                            })
                        }
                    }
                },
                refreshNoteVersions: {
                    invoke: {
                        id: "fetchNoteVersions",
                        src: "getNoteVersions",
                        input: ({ context: { selectedNoteId, notesVersions } }) => ({ selectedNoteId, notesVersions }),
                        onDone: {
                            target: "editing", actions: assign({
                                notesVersions: ({ context, event: { output } }) =>
                                    ({ ...context.notesVersions, [context.selectedNoteId]: output }),
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