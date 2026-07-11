import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CreateGame from "./pages/CreateGame";
import Projects from "./pages/Projects";
import Library from "./pages/Library";
import Assistant from "./pages/Assistant";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateGame />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/library" element={<Library />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;