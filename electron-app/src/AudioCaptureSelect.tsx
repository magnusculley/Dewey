import { useState, useEffect } from "react";
import Select from "react-select";
import "./AudioCaptureSelect.css";

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
      <Select className="Select"
        options={processList.map((p) => ({
          value: p.pid,
          label: `${p.name} (PID: ${p.pid})`,
        }))}
        value={selectedPid ? { value: selectedPid, label: processList.find((p) => p.pid === selectedPid)?.name } : null}
        onChange={(option) => {
          if (option) handlePidChange(option.value);
        }}
        placeholder="--Select an audio source--"
      />
      <button>Start</button>
    </>
  );
}

export default AudioCaptureSelect;
