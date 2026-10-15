import uvicorn
from capture import pids_capture
from fastapi import FastAPI
from app_capture import set_active_pid

app = FastAPI()

@app.get("/audio-pids")
def get_audio_pids():
    return pids_capture.get_active_audio_pids_windows()

@app.post("/set-selected-pid")
def set_selected_pid(pid: int):
    set_active_pid(pid)

#has to be guarded and at the end of file
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)