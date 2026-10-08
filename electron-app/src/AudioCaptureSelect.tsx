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

  const handlePidChange = (pid: number) => {
    setSelectedPid(pid);
    // Pass PID to python here
  };

  return (
    <>
      Loading: {loading}
      <select>
        <option value="">--Select an audio source--</option>
        {processList.map((p) => (
          <option value={p.pid}>
            {p.name} (PID: {p.pid})
          </option>
        ))}
      </select>
      <button>Start</button>
    </>
  );
}

export default AudioCaptureSelect;
