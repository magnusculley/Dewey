import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dewey from '../assets/Dewey.png';
import RecordingIcon from "../assets/recording.svg?react";
import RecordingTimer from "../RecordingTimer";
import AudioCaptureSelect from "../AudioCaptureSelect";
import "../AudioCaptureSelect.css";
import "../Home.css";

function Home() {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  

  return (
    <>
      <h1>Dewey</h1>
      <img src={Dewey} alt="Dewey Logo" width="200" />
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
      <div className="SelectDiv">
        <AudioCaptureSelect />
      </div>
      <button onClick={() => navigate("/transcript")}>
        Open Transcript Page (blank for now)
      </button>
    </>
  );
}
export default Home;
