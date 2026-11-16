import { useNavigate } from "react-router-dom";
import { useState } from "react";

function ApiDummyPage() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState("OpenAI");
  const [apiKey, setApiKey] = useState("");
  const [verified, setVerified] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const providers = ["OpenAI", "Anthropic", "Gemini"];

  const verifyApiKey = async () => {
    setIsVerifying(true);
    setError("");
    setVerified(false);
    setModels([]);
    setSelectedModel("");

    try {
      const APIresponse = await window.ipcRenderer.invoke(
        "verify-api-key",
        provider,
        apiKey.trim(),
      );
      console.log("API key verification response:", APIresponse);
      if (APIresponse.verified !== true) {
        setError("The API key could not be verified.");
        return;
      }

      setVerified(true);
      const modelResponse = await window.ipcRenderer.invoke(
        "get-models"
      );
      const modelNames = modelResponse.map((model: { id: string }) => model.id);
      setModels(modelNames);
    } catch (verifyError) {
      console.error("Failed to load models:", verifyError);
      setError("Could not load models.");
    } finally {
      setIsVerifying(false);
    }
  };

  const selectProvider = (nextProvider: string) => {
    setProvider(nextProvider);
    setApiKey("");
    setVerified(false);
    setModels([]);
    setSelectedModel("");
    setError("");
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
            {providers.map((providerName) => (
              <option key={providerName} value={providerName}>
                {providerName}
              </option>
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
                setModels([]);
                setSelectedModel("");
                setError("");
              }}
            />
            <button
              type="button"
              onClick={() => void verifyApiKey()}
              disabled={!apiKey.trim() || isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify key"}
            </button>
          </div>
          <span
            className={`api-key-status${verified ? " is-verified" : ""}`}
            role="status"
          >
            {verified ? "Key verified" : "Key has not been verified"}
          </span>
          {error && (
            <span className="api-key-error" role="alert">
              {error}
            </span>
          )}
        </div>

        <label className="api-field" htmlFor="api-model">
          Model
          <select
            id="api-model"
            value={selectedModel}
            onChange={async (event) => {
              const model = event.target.value;
              setSelectedModel(model);
              await window.ipcRenderer.invoke("set-model", model);
            }}
            disabled={!verified}
          >
            {!verified && <option value="">Verify your API key first</option>}
            {verified &&
              models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
          </select>
        </label>
      </section>
    </main>
  );
}

export default ApiDummyPage;
