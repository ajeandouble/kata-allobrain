import { setup, assign, fromPromise, createActor } from "xstate";
import { Note, NotesObj, NotesVersionsObj, NoteVersion } from "../types/notes.type";
import { deleteNote, getAllNotes, getAllNoteVersions, patchNote, postNote } from "../api/notes.api";
import { notify, notifyError, ERROR_MSGS } from "../services/toast";

export interface NotesContext {
    selectedNoteId: string | null;
    notes: NotesObj;
    notesVersions: NotesVersionsObj;
    selectedNoteVersion: number | null;
    selectedNoteTitle: string;
    draftContent: string;
    noteToDeleteId: string | null;
}

// TODO: Use `as const` "enum"
export type NotesEvent =
    | { type: "SELECT_NOTE"; id: string }
    | { type: "CLOSE_NOTE" }
    | { type: "ADD_NOTE" }
    | { type: "DELETE_NOTE"; id: string }
    | { type: "UPDATE_NOTE_TITLE"; title: string }
    | { type: "ADD_NOTE_VERSION"; content?: string; title?: string }
    | { type: "SELECT_PREVIOUS_VERSION"; version: number; draftContent: string }
    | { type: "SELECT_DRAFT" }
    | { type: "COMPARE_PREVIOUS_VERSION" };

const notesMachine = setup({
    types: {
        context: {} as NotesContext,
        events: {} as NotesEvent,
    },
    actors: {
        getAllNotes: fromPromise(async () => {
            const notes = (await getAllNotes()) as Note[];
            return (notes as Note[]).reduce(
                (acc, curr) => ({ ...acc, [curr.id]: curr }),
                {} as NotesObj
            );
        }),
        getNoteVersions: fromPromise(async ({ input }) => {
            const { selectedNoteId: id } = input as { selectedNoteId: string };
            return (await getAllNoteVersions({ params: { id } })) as NoteVersion[];
        }),
        postNote: fromPromise(async () => {
            return await postNote({ body: { title: "Untitled Note" } });
        }),
        patchNote: fromPromise(async ({ input }) => {
            const {
                selectedNoteId: id,
                selectedNoteTitle: title,
                draftContent: content,
            } = input as {
                selectedNoteId: string;
                selectedNoteTitle: string;
                draftContent: string;
            };
            return await patchNote({ params: { id }, body: { title, content } });
        }),
        deleteNote: fromPromise(async ({ input }) => {
            const { noteToDeleteId: id } = input as { noteToDeleteId: string };
            return await deleteNote({ params: { id } });
        }),
    },
    actions: {
        notify: (_, params: { msg: string; options: unknown }) => {
            if (params.options) {
                notify(params.msg, params.options);
            } else {
                notify(params.msg);
            }
        },
    },
}).createMachine({
    id: "notesMachine",
    initial: "loading",
    context: {
        notes: {},
        selectedNoteId: null,
        notesVersions: {},
        selectedNoteVersion: null,
        selectedNoteTitle: "",
        draftContent: "",
        noteToDeleteId: null,
    },
    states: {
        loading: {
            invoke: {
                id: "fetchAllNotes",
                src: "getAllNotes",
                onDone: {
                    target: "idle",
                    actions: assign({ notes: ({ event: { output } }) => output }),
                },
                onError: {
                    target: "loadingFailure",
                    actions: () => notifyError(ERROR_MSGS.LOADING_NOTE),
                },
            },
        },
        loadingFailure: { after: { 3000: { target: "loading" } } },
        idle: {
            on: {
                SELECT_NOTE: {
                    target: "loadingNoteVersions",
                    actions: assign({ selectedNoteId: ({ event }) => event.id }),
                },
                ADD_NOTE: {
                    target: "addingNote",
                },
                DELETE_NOTE: {
                    target: "deletingNote",
                    actions: assign({ noteToDeleteId: ({ event }) => event.id }),
                },
            },
        },
        addingNote: {
            invoke: {
                id: "addNote",
                src: "postNote",
                onDone: {
                    target: "loadingNoteVersions",
                    actions: assign({
                        notes: ({ context, event: { output } }) => ({
                            ...(output?.id ? { [output.id]: output } : {}),
                            ...context.notes,
                        }),
                        selectedNoteId: ({ event: { output } }) => (output?.id ? output.id : null),
                        selectedNoteVersion: ({ event: { output } }) =>
                            output?.latest_version ? output.latest_version : null,
                        draftContent: ({ event: { output } }) =>
                            output?.content ? output.content : "",
                        selectedNoteTitle: ({ event: { output } }) =>
                            output?.title ? output.title : "",
                    }),
                },
                onError: {
                    target: "idle",
                    actions: () => notifyError(ERROR_MSGS.CREATING_NOTE),
                },
            },
        },
        loadingNoteVersions: {
            invoke: {
                id: "fetchNoteVersions",
                src: "getNoteVersions",
                input: ({ context: { selectedNoteId, notesVersions } }) => ({
                    selectedNoteId,
                    notesVersions,
                }),
                onDone: {
                    target: "showingEditor",
                    actions: [
                        assign({
                            notesVersions: ({ context, event: { output } }) =>
                                ({
                                    ...context.notesVersions,
                                    ...(context.selectedNoteId
                                        ? { [context.selectedNoteId]: output }
                                        : {}),
                                } as NotesVersionsObj),
                        }),
                        () => console.log("why the fuck is it succesfull"),
                    ],
                },
                onError: {
                    target: "idle",
                    actions: () => notifyError(ERROR_MSGS.LOADING_NOTE),
                },
            },
        },
        deletingNote: {
            invoke: {
                id: "removeNote",
                src: "deleteNote",
                input: ({ context: { noteToDeleteId } }) => ({ noteToDeleteId }),
                onDone: {
                    target: "idle",
                    actions: assign({
                        notes: ({ context }) =>
                            Object.fromEntries(
                                Object.entries(context.notes).filter(
                                    (e) => e[0] !== context.noteToDeleteId
                                )
                            ),
                        noteToDeleteId: null,
                    }),
                },
                onError: {
                    target: "idle",
                    actions: () => notifyError(ERROR_MSGS.DELETING_NOTE),
                },
            },
        },
        showingEditor: {
            initial: "editing",
            entry: assign({
                // @ts-expect-error: bad actions typing
                draftContent: ({ context, event: { output } }) => {
                    console.log({ context, output });
                    output[0]?.content;
                },
                selectedNoteVersion: -1,
                selectedNoteTitle: ({ context }) =>
                    context?.selectedNoteId &&
                    context.notes[context.selectedNoteId] &&
                    context.notes[context.selectedNoteId].title
                        ? context.notes[context.selectedNoteId].title
                        : context.selectedNoteTitle,
            }),
            on: {
                SELECT_NOTE: {
                    target: "loadingNoteVersions",
                    actions: [
                        assign({ selectedNoteId: ({ event }) => event.id }),
                        () => console.log("jumping to loadingNoteVersions"),
                    ],
                    guards: ({ event, context }) => event.id !== context.selectedNoteId,
                },
                ADD_NOTE: {
                    target: "addingNote",
                },
                CLOSE_NOTE: {
                    target: "idle",
                    actions: assign({
                        selectedNoteId: null,
                        selectedNoteVersion: -1,
                        selectedNoteTitle: "",
                        draftContent: "",
                    }),
                },
                DELETE_NOTE: {
                    target: ".deletingNote",
                    actions: assign({ noteToDeleteId: ({ event }) => event.id }),
                },
            },
            states: {
                editing: {
                    on: {
                        UPDATE_NOTE_TITLE: {
                            target: "updatingNote",
                            actions: assign({ selectedNoteTitle: ({ event }) => event.title }),
                        },
                        ADD_NOTE_VERSION: {
                            target: "updatingNote",
                            actions: assign({
                                draftContent: ({ event }) => (event?.content ? event.content : ""),
                            }),
                            guards: ({ event, context }) =>
                                event.content !==
                                context.notesVersions[context.selectedNoteId][0].content,
                        },
                        SELECT_PREVIOUS_VERSION: {
                            target: "viewingPreviousVersion",
                            actions: assign({
                                selectedNoteVersion: ({ event }) => event.version,
                                draftContent: ({ event }) => event.draftContent,
                            }),
                        },
                    },
                },
                viewingPreviousVersion: {
                    on: {
                        SELECT_DRAFT: {
                            target: "editing",
                            actions: assign({ selectedNoteVersion: -1 }),
                        },
                        SELECT_PREVIOUS_VERSION: {
                            actions: assign({ selectedNoteVersion: ({ event }) => event.version }),
                        },
                        COMPARE_PREVIOUS_VERSION: {
                            target: "comparingPreviousVersion",
                        },
                    },
                },
                comparingPreviousVersion: {
                    on: {
                        SELECT_DRAFT: {
                            target: "editing",
                            actions: assign({ selectedNoteVersion: -1 }),
                        },
                        SELECT_PREVIOUS_VERSION: {
                            actions: assign({ selectedNoteVersion: ({ event }) => event.version }),
                        },
                    },
                },
                updatingNote: {
                    invoke: {
                        id: "updateNote",
                        src: "patchNote",
                        input: ({
                            context: { selectedNoteId, selectedNoteTitle, draftContent },
                        }) => ({ selectedNoteId, selectedNoteTitle, draftContent }),
                        onDone: {
                            target: "refreshingNoteVersions",
                            actions: assign({
                                selectedNoteTitle: ({
                                    event: {
                                        // @ts-expect-error property title doesn't exist on unknown
                                        output: { title },
                                    },
                                }) => title,
                                // @ts-expect-error bad actions typing
                                notes: ({ context, event: { output } }) => ({
                                    ...context.notes,
                                    ...(context.selectedNoteId
                                        ? { [context.selectedNoteId]: output }
                                        : {}),
                                }),
                            }),
                        },
                        onError: {
                            target: "editing",
                            actions: [
                                assign({
                                    selectedNoteTitle: ({ context }) =>
                                        context.selectedNoteId
                                            ? context.notes[context.selectedNoteId].title
                                            : context.selectedNoteTitle,
                                }),
                                () => notifyError(ERROR_MSGS.UPDATING_NOTE),
                            ],
                        },
                    },
                },
                refreshingNoteVersions: {
                    invoke: {
                        id: "fetchNoteVersions",
                        src: "getNoteVersions",
                        input: ({ context: { selectedNoteId, notesVersions } }) => ({
                            selectedNoteId,
                            notesVersions,
                        }),
                        onDone: {
                            target: "editing",
                            actions: assign({
                                // @ts-expect-error bad actions typing
                                notesVersions: ({ context, event: { output } }) => ({
                                    ...context.notesVersions,
                                    ...(context.selectedNoteId
                                        ? { [context.selectedNoteId]: output }
                                        : {}),
                                }),
                            }),
                        },
                        onError: {
                            target: "editing",
                            actions: () => notifyError(ERROR_MSGS.LOADING_NOTE),
                        },
                    },
                },
                deletingNote: {
                    invoke: {
                        id: "removeNOte",
                        src: "deleteNote",
                        input: ({ context }) => context.noteToDeleteId,
                        onDone: {
                            target: "editing",
                            actions: assign({
                                notes: ({ context }) =>
                                    Object.fromEntries(
                                        Object.entries(context.notes).filter(
                                            (e) => e[0] !== context.noteToDeleteId
                                        )
                                    ),
                                noteToDeleteId: null,
                            }),
                        },
                    },
                },
            },
        },
    },
});

const notesActor = createActor(notesMachine).start();

export { notesActor };
