import "./App.css";
import Notes from "./components/Notes";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <>
            <Toaster />
            <Notes />
        </>
    );
}

export default App;
