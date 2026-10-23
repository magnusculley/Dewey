import uvicorn
from capture import pids_capture
from fastapi import FastAPI
from pydantic import BaseModel
from capture.app_capture import AppCapture
from capture.mic_capture import MicCapture

class SelectedProcess(BaseModel):
    pid: int

app = FastAPI()
app_capture = AppCapture()
mic_capture = MicCapture()
selected_pid: int | None = None


@app.get("/audio-pids")
def get_audio_pids():
    return pids_capture.get_active_audio_pids()

@app.post("/set-selected-pid")
def set_selected_pid(request: SelectedProcess):
    app_capture.set_active_pid(request.pid)
    return {"pid": request.pid, "status": "selected"}

@app.post("/recording/start")
def start_recording():
    app_capture.start_capture()
    mic_capture.start_capture()
    print("Start recording")
    return {"status": "recording started"}


@app.post("/recording/stop")
def stop_recording():
    app_capture.stop_capture()
    mic_capture.stop_capture()
    print("Stop recording")
    return {"status": "recording stopped"}

#has to be guarded and at the end of file
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
