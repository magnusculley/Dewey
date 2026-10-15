import { useState, useEffect } from "react";

interface SystemProcess {
  pid: number;
  name: string;
}

function AudioCaptureSelect() {
  const [processList, setProcessList] = useState<SystemProcess[]>([]);
  const [selectedPid, setSelectedPid] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      // Call the API in main.ts through preload.ts
      const process_list = await window.ipcRenderer.invoke(
        "get-running-processes",
      );
      setProcessList(process_list);
    } catch (error) {
      console.error("Failed to load processes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  const handlePidChange = async (pid: number) => {
    setSelectedPid(pid);
    // post selected PID to python backend
    const response = await fetch("http://127.0.0.1:8000/set-selected-pid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pid: selectedPid
      }),
    });
    const data = await response.json();
    console.log("Response from FastAPI:", data);
  }

  
  return (
    <>
      Loading: {loading}
      <select onChange={(e) => handlePidChange(Number(e.target.value))}>
        <option value="">--Select an audio source--</option>
        {processList.map((p) => (
          <option value={p.pid}>
            {p.name} (PID: {p.pid})
          </option>
        ))}
      </select>
    </>
  );
}

export default AudioCaptureSelect;
