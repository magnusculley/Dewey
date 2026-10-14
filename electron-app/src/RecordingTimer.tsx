import { useState, useEffect, useRef } from "react";

function RecordingTimer({
  recording,
  setRecording,
}: {
  recording: boolean;
  setRecording: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [time, setTime] = useState(0);
  const startRef = useRef<number | null>(null);
  const alreadyDoneRef = useRef(0); // How long it ran before paused

  useEffect(() => {
    if (!recording) return;
    startRef.current = Date.now();
    // Compute time elapsed from already done 
    const intervalId = setInterval(() => {
      setTime(alreadyDoneRef.current + Date.now() - startRef.current!);
    }, 200);

    return () => {
      clearInterval(intervalId);
      alreadyDoneRef.current += Date.now() - startRef.current!;
      setTime(alreadyDoneRef.current);
      startRef.current = null;
    };
  }, [recording]);

  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const startAndStop = () => {
    setRecording(!recording);
  };

  const reset = () => {
    alreadyDoneRef.current = 0;
    if (startRef.current !== null) startRef.current = Date.now(); // reset while running
    setTime(0);
    setRecording(false);
  };

  return (
    <div className="stopwatch-container">
      <p className="stopwatch-time">
        {hours}:{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </p>
      <div className="stopwatch-buttons">
        <button className="stopwatch-button" onClick={startAndStop}>
          {recording ? "Stop" : "Start"}
        </button>
        <button className="stopwatch-button" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default RecordingTimer;
