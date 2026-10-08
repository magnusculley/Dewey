import { useState } from "react";
import RecordingIcon from "./assets/recording.svg?react";
import "./App.css";
import RecordingTimer from "./RecordingTimer";

function App() {
  const [recording, setRecording] = useState(false);

  return (
    <>
      <h1>Dewey</h1>
      <div className="card">
        <RecordingIcon
          width="48px"
          height="48px"
          fill={recording ? "red" : "currentColor"}
        />
        {recording ? (
          <p>Currently recording!</p>
        ) : (
          <p>Click to start recording</p>
        )}

        <RecordingTimer recording={recording} setRecording={setRecording} />
      </div>
    </>
  );
}

export default App;
