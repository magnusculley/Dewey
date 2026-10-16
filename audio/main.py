import uvicorn
from capture import pids_capture
from fastapi import FastAPI
from capture.app_capture import capture_app_audio
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

class SelectedProcess(BaseModel):
    pid: int

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/audio-pids")
def get_audio_pids():
    return pids_capture.get_active_audio_pids_windows()

@app.post("/set-selected-pid")
def set_selected_pid(request: SelectedProcess):
    capture_app_audio(request.pid)  # blocks until capture ends
    return {"pid": request.pid, "status": "complete"}

#has to be guarded and at the end of file
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)