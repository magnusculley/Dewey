from fastapi import FastAPI
import capture.pids_capture as pids_capture

app=FastAPI()

@app.get("/audio-pids")
def get_audio_pids():
    return pids_capture.get_active_audio_pids_windows()