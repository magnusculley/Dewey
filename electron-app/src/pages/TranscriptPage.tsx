import { useNavigate } from "react-router-dom";

function TranscriptPage() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}

export default TranscriptPage;
