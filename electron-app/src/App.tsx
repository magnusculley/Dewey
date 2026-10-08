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
        <button onClick={() => setRecording((recording) => !recording)}>
          <RecordingIcon
            width={48}
            height={48}
            viewBox="0 0 1024 1024"
            fill={recording ? "red" : "currentColor"}
          />
          {recording ? (
            <p>Currently recording!</p>
          ) : (
            <p>Click to start recording</p>
          )}

          <RecordingTimer recording={recording} setRecording={setRecording} />
        </button>
      </div>
    </>
  );
}

export default App;
