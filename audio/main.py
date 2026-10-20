import uvicorn
from capture import pids_capture
from fastapi import FastAPI
from pydantic import BaseModel
from capture.app_capture import AppCapture 

class SelectedProcess(BaseModel):
    pid: int

app = FastAPI()
app_capture = AppCapture()
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
    # try:
    #     app_capture.start_capture()
    # except Exception as e:
    #     pass
    print("Start recording")
    return {"status": "recording"}#, "pid": app_capture.active_pid*/}


@app.post("/recording/stop")
def stop_recording():
    # app_capture.stop_capture()
    print("Stop recording")
    return {"status": "stopped"}

#has to be guarded and at the end of file
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
