import { NoteVersion } from "../types/notes.type";
import ky from "ky";

const notesVersionsCache = new Map<string, NoteVersion[]>();
const urlPattern = /notes\/(?<id>[^/]+)$/;

const cachedKy = ky.extend({
    hooks: {
        beforeRequest: [
            async (request) => {
                const cacheKey = new URL(request.url).pathname;
                if (request.method.toUpperCase() === "GET" && notesVersionsCache.has(cacheKey)) {
                    return new Response(JSON.stringify(notesVersionsCache.get(cacheKey)), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            },
        ],
        afterResponse: [
            async (request, _options, response) => {
                if (response.ok) {
                    const cacheKey = new URL(request.url).pathname;
                    const data = await response.json();
                    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method.toUpperCase())) {
                        const match = cacheKey.match(urlPattern);
                        if (match && match.groups && match.groups.id) {
                            const noteId = match.groups.id;
                            notesVersionsCache.delete(`/notes/${noteId}`);
                            notesVersionsCache.delete(`/notes/${noteId}/versions`);
                        }
                    }
                    else {
                        notesVersionsCache.set(cacheKey, data);
                    }
                }
            },
        ],
    },
});

export default cachedKy;