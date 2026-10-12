import "./App.css";

import RecordingIcon from "./assets/recording.svg?react";
import RecordingTimer from "./RecordingTimer";
import AudioCaptureSelect from './AudioCaptureSelect';
import Dewey from './assets/Dewey.png';
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
