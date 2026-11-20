import { useNavigate } from "react-router-dom";
import { useState } from "react";

function TranscriptPage() {
  const navigate = useNavigate();
  const [transcriptLines, setTranscriptLines] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const loadTranscript = async (file: File | undefined) => {
    if (!file) return;

    setError("");
    try {
      const contents = await file.text();
      setTranscriptLines(contents.split(/\r?\n/).filter((line) => line.trim().length > 0));
      setFileName(file.name);
    } catch (readError) {
      console.error("Failed to read transcript file:", readError);
      setError("The selected file could not be read. Please try another text file.");
      setTranscriptLines([]);
      setFileName("");
    }
  };

  return (
    <main className="transcript-page">
      <button onClick={() => navigate(-1)}>Back</button>
      <section className="transcript-controls">
        <label className="transcript-file-label" htmlFor="transcript-file">
          Transcript text file
          <input
            id="transcript-file"
            type="file"
            accept=".txt,text/plain"
            onChange={(event) => void loadTranscript(event.target.files?.[0])}
          />
        </label>
      </section>

      {error && <p className="transcript-error" role="alert">{error}</p>}

      <article className="transcript-content">
        <h1>Transcript Page</h1>
        {fileName && <p className="transcript-filename">{fileName}</p>}
        {transcriptLines.length > 0 ? (
          <div className="transcript-lines">
            {transcriptLines.map((line, index) => (
              <p className="transcript-line" key={`${index}-${line}`}>{line}</p>
            ))}
          </div>
        ) : (
          <p className="transcript-empty">Choose a text file to display its transcript, one line at a time.</p>
        )}
      </article>
    </main>
  );
}

export default TranscriptPage;
