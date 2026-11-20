import { useEffect, useState } from "react";

export default function GoogleConnect() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // check whether user is already signed in
  useEffect(() => {
    window.ipcRenderer
      .invoke("google-status")
      .then((s: { connected: boolean }) => setConnected(s.connected))
      .catch((err) => console.error("Failed to check Google status", err));
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      await window.ipcRenderer.invoke("google-connect");
      setConnected(true);
    } catch (err) {
      console.error("Failed to connect Google account", err);
      setError("Couldn't connect your Google account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleConnect} disabled={loading || connected}>
        {loading
          ? "Waiting for Google…"
          : connected
            ? "Google Doc Saved"
            : "Select a document from your Google account"}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
