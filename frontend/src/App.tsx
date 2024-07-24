import { useMachine } from "@xstate/react";
import "./App.css";
import Notes from "./components/Notes";
import NotesReactContext from "./context/NotesContext";
import notesMachine from "./states/notesMachine";

function App() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, send, service] = useMachine(notesMachine);

    return (
        <NotesReactContext.Provider value={[state, send, service]}>
            <Notes />
        </NotesReactContext.Provider>
    );
}

export default App;
