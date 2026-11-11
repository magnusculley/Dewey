import { useNavigate } from "react-router-dom";
import { useState } from "react";

function ApiDummyPage() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState("OpenAI");
  const [apiKey, setApiKey] = useState("");
  const [verified, setVerified] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");

  const modelsByProvider: Record<string, string[]> = {
    OpenAI: ["gpt-3.5-turbo", "gpt-4"],
  };

  const selectProvider = (nextProvider: string) => {
    setProvider(nextProvider);
    setApiKey("");
    setVerified(false);
    setSelectedModel("");
  };

  const verifyApiKey = () => {
    if (apiKey.trim()) {
      setVerified(true);
      setSelectedModel(modelsByProvider[provider][0]);
    }
  };

  return (
    <main className="api-page">
      <button onClick={() => navigate(-1)}>Back</button>
      <section className="api-settings" aria-labelledby="api-settings-title">
        <h1 id="api-settings-title">API settings</h1>
        <label className="api-field" htmlFor="api-provider">
          Provider
          <select
            id="api-provider"
            value={provider}
            onChange={(event) => selectProvider(event.target.value)}
          >
            {Object.keys(modelsByProvider).map((providerName) => (
              <option key={providerName} value={providerName}>{providerName}</option>
            ))}
          </select>
        </label>

        <div className="api-field">
          <label htmlFor="api-key">API key</label>
          <div className="api-key-row">
            <input
              id="api-key"
              type="password"
              autoComplete="off"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(event) => {
                setApiKey(event.target.value);
                setVerified(false);
                setSelectedModel("");
              }}
            />
            <button type="button" onClick={verifyApiKey} disabled={!apiKey.trim()}>
              Verify key
            </button>
          </div>
          <span className={`api-key-status${verified ? " is-verified" : ""}`} role="status">
            {verified ? "Key verified (demo only)" : "Key has not been verified"}
          </span>
        </div>

        <label className="api-field" htmlFor="api-model">
          Model
          <select
            id="api-model"
            value={selectedModel}
            onChange={(event) => setSelectedModel(event.target.value)}
            disabled={!verified}
          >
            {!verified && <option value="">Verify your API key first</option>}
            {verified && modelsByProvider[provider].map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </label>
      </section>

    </main>
  );
}

export default ApiDummyPage;
