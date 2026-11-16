import { useState } from "react";
import { useNavigate } from "react-router-dom";

import RecordingIcon from "../assets/recording.svg?react";
import RecordingTimer from "../RecordingTimer";
import AudioCaptureSelect from "../AudioCaptureSelect";

function Home() {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [isPidSelected, setIsPidSelected] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

        <RecordingTimer recording={recording} setRecording={setRecording} isPidSelected={isPidSelected} isLoading={isLoading} />
      </div>
      <div className="card">
        <AudioCaptureSelect setIsPidSelected={setIsPidSelected} setIsLoading={setIsLoading} isLoading={isLoading} />
      </div>
      <button onClick={() => navigate("/transcript")}>
        Open Transcript Page (blank for now)
      </button>
    </>
  );
}
export default Home;
