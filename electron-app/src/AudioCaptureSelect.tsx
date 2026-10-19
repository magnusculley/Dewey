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
    // send selected PID to electron backend
    try {
      const response = await window.ipcRenderer.invoke("set-active-pid", pid);
      console.log("Set active PID response:", response);
    } catch (error) {
      console.error("Failed to set active PID", error);
    }
  }

  return (
    <>
      Loading: {loading}
      <select onChange={(e) => handlePidChange(Number(e.target.value))}>
        <option value="" key="default">--Select an audio source--</option>
        {processList.map((p) => (
          <option value={p.pid} key={p.pid}>
            {p.name} (PID: {p.pid})
          </option>
        ))}
      </select>
    </>
  );
}

export default AudioCaptureSelect;
