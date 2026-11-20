import "./App.css";

import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TranscriptPage from "./pages/TranscriptPage";
import ApiDummyPage from "./pages/api-dummy";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transcript" element={<TranscriptPage />} />
        <Route path="/api-page" element={<ApiDummyPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
