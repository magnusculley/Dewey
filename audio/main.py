import uvicorn
from capture import pids_capture
from fastapi import FastAPI

app = FastAPI()

uvicorn.run(app, host="127.0.0.1", port=8000)

@app.get("/audio-pids")
def get_audio_pids():
    return pids_capture.get_active_audio_pids_windows()
