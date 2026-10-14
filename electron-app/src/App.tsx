import "./App.css";

import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TranscriptPage from "./pages/TranscriptPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transcript" element={<TranscriptPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
