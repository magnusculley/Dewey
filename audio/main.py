import uvicorn
import comtypes
from capture import pids_capture
from fastapi import FastAPI

app = FastAPI()

@app.get("/audio-pids")
def get_audio_pids():
    return pids_capture.get_active_audio_pids_windows()

#has to be guarded and at the end of file
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)