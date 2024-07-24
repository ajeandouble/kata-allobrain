import "./App.css";
import Notes from "./components/Notes";
import { NotesProvider } from "./context/NotesContext";
function App() {
    return (
        <NotesProvider>
            <Notes />
        </NotesProvider>
    );
}

export default App;
