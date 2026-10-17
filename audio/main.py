import uvicorn
from capture import pids_capture
from fastapi import FastAPI
from pydantic import BaseModel

class SelectedProcess(BaseModel):
    pid: int

app = FastAPI()
selected_pid: int | None = None


@app.get("/audio-pids")
def get_audio_pids():
    return pids_capture.get_active_audio_pids_windows()

@app.post("/set-selected-pid")
def set_selected_pid(request: SelectedProcess):
    global selected_pid
    selected_pid = request.pid
    return {"pid": request.pid, "status": "selected"}

#has to be guarded and at the end of file
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)