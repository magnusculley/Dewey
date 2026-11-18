import os
import time

import uvicorn
import threading
from capture import pids_capture
from fastapi import FastAPI
from pydantic import BaseModel
from capture.app_capture import AppCapture
from capture.mic_capture import MicCapture
from processing import chunk_queue


class SelectedProcess(BaseModel):
    pid: int

CHUNK_SECONDS = 30  # length of each audio piece sent for transcription
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")

app = FastAPI()
app_capture = AppCapture()
mic_capture = MicCapture()
selected_pid: int | None = None
chunk_queue.start_worker() # transcribes finished chunks in the background while recording continues
recording_lock = threading.Lock()


@app.get("/audio-pids")
def get_audio_pids():
    return pids_capture.get_active_audio_pids()


@app.post("/set-selected-pid")
def set_selected_pid(request: SelectedProcess):
    app_capture.set_active_pid(request.pid)
    return {"pid": request.pid, "status": "selected"}


@app.post("/recording/start")
def start_recording():
    # outputs to output/<date>/app_0000.wav, mic_0000.wav, ...
    session_dir = os.path.join(OUTPUT_DIR, time.strftime("%Y%m%d-%H%M%S"))
    with recording_lock:
        # Mic capture has to start first
        mic_capture.start_capture(session_dir, CHUNK_SECONDS, chunk_queue.enqueue_chunk)
        try:
            app_capture.start_capture(session_dir, CHUNK_SECONDS, chunk_queue.enqueue_chunk)
        except Exception:
            # Stop mic if app capture fails
            mic_capture.stop_capture()
            raise
    print("Start recording")
    return {"status": "recording started"}




@app.post("/recording/stop")
def stop_recording():
    with recording_lock:
        app_capture.stop_capture()
        mic_capture.stop_capture()
    print("Stop recording")
    return {"status": "recording stopped"}


#has to be guarded and at the end of file
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)


