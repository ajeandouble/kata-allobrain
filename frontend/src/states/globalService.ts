import { setup, assign, fromPromise, createActor } from "xstate";
import { Note, NotesObj, NotesVersionsObj, NoteVersion } from "../types/notes.type";
import { getAllNotes, getAllNoteVersions } from "../api/notes.api";

/* Editor Machine */
const editorMachine = setup({

}).createMachine({
    id: "editorMachine",
    initial: "editing",
    context: {
        content: "",
    },
    states: {
        editing: {
            invoke: {
                src: (input) => { console.log(input); return input; },
                onDone: { actions: (a) => console.log(a) }
            }
        }
    }
});

const editorActor = createActor(editorMachine).start();


/* Notes Machine */

export interface NotesContext {
    selectedNoteId: string | undefined;
    notes: NotesObj;
    notesVersions: NotesVersionsObj;
}

export type NotesEvent =
    | { type: "SELECT_NOTE"; id: string }
    | { type: "CLOSE_NOTE" };

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
            return (await getAllNoteVersions({ params: { id } })) as NoteVersion[];
        })
    },
}).createMachine<NotesContext, NotesEvent>({
    /** @xstate-layout N4IgpgJg5mDOIC5QDsD2AXOBZAhgYwAsBLZMAOgBtUcISoBiCVUskgN1QGtyAzMdQgEEKFAHIY4AbQAMAXUSgADqlhF0RZgpAAPRADYArACYyB6QHYAHAYDMlm0aMBGACw2ANCACeiJzYOmRjYuLgCcVg4uTqFGAL6xnmiYsLiEJORUNHT0YABOuai5ZIoUOOg8hQC2ZHwCBMJiErAy8kggyqrqmm26CC7SoaYGLuZOlubG5uahep4+CJZOZGGhq0YGY1N+evGJTanELJm0yFDiyQBiOEQUAK65YPQASgCiACpPAJotWh1qGsgtL0jFEyEZFuDwTY7NI7HNfKDQk49HpzOtzP1pCEDLsQElsPhDuQiBAKI8AMovAAyLwAwm8APqiADybxePzafy6gJ6iFC0LI5lh0TWhkclnhCEcg0sAyRBgVTmk4x2CTx+0J6Uo1BOZwkADU8qpmLBGMxicgONwavxCOcwIbcsbkM05L8VP9uqBevybILhasYmLwZKNpZBXobFiXEY9NI9C5LLj8SlNUcdXR7Y7nabaVTmZSmaz2W7OR7uUC+aEAgqRgmonp+a5JX4-f5UdYDKsVQZVXtkgctZB-qd6HmCy8i2yOUpywDKwgxaYLNY7A5nG5JeKyOFDJZHE4psMbMmNWkWMP1KPKTT6VOS61Z5157zF8Zl1ZbPYD5vvIgbOYfq2AmsrGCiTYuPEapoBAcBaCmg6kO6z5ejoiAALSzH+CCYWQ0j4QRhEEc4p4DmmGQZqcyGejy3r-u+MwDI2ljVoG5gtsEeEEX4vZRPYkakQS54UVkpz2rAVw3PcYDURWr4xi2MbLMioywuENiRk4OLQWeRKsKSMllihtFoQsLgBEYAYsfGCY2E4W7mWCwrWCCu5RIJqbCdqol6pg2YAvARk0QuTiHnoQx1pYLh6LGsYeNhiaDAYLGJrWZi2HEOlkV5l50LJL50X09jLOZwRCliCrOJKAHhdIfhYlGhihFFmXxEAA */
    id: "notesMachine",
    initial: "loading",
    context: {
        selectedNoteId: undefined,
        notes: {},
        notesVersions: {}
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
            },
        },
        loadingNoteVersions: {
            invoke: {
                id: "fetchNoteVersions",
                src: "getNoteVersions",
                input: ({ context: { selectedNoteId } }) => ({ selectedNoteId }),
                onDone: {
                    target: "editing", actions: assign({ notesVersions: ({ event: { output } }) => output })
                },
            },
            on: {
                CLOSE_NOTE: {
                    target: "idle",
                    actions: assign({ selectedNoteId: null, }),
                }
            }
        },
        editing: {
            // invoke: {
            //     id: "editorMachine",
            //     src: editorMachine,
            //     input: ({ context: { selectedNoteId, notesVersions } }) => ({ noteVersions: notesVersions[selectedNoteId] }),
            // },
            on: {
                CLOSE_NOTE: {
                    target: "idle",
                    actions: assign({
                        selectedNoteId: null,
                    }),
                },
                SELECT_NOTE: {
                    target: "loadingNoteVersions",
                    actions: assign({ selectedNoteId: ({ event }) => event.id })
                },
            },
        }
    },
});


const notesActor = createActor(notesMachine).start();

export { notesActor, editorActor };