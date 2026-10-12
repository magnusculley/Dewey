import { useState } from 'react'
import './App.css'

import RecordingIcon from "./assets/recording.svg?react";
import RecordingTimer from "./RecordingTimer";
import AudioCaptureSelect from './AudioCaptureSelect';
import Dewey from './assets/Dewey.png';

function App() {
  const [recording, setRecording] = useState(false);

  return (
    <>
      <h1>Dewey</h1>
      <div className="icon">
        <img src={Dewey} alt="Dewey Logo" width="128px" height="128px" />
      </div>
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
      <div className="card">
        <AudioCaptureSelect />
      </div>
    </>
  );
}

export default App;
