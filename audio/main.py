import uvicorn
from capture import pids_capture
from fastapi import FastAPI
from pydantic import BaseModel
from capture.app_capture import AppCapture
from capture.mic_capture import MicCapture
from processing.byok import LLM

class SelectedProcess(BaseModel):
    pid: int

class VerifyApiKeyRequest(BaseModel):
    provider: str
    api_key: str

app = FastAPI()
app_capture = AppCapture()
mic_capture = MicCapture()
LLM_instance = LLM()
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

@app.post("/processing/verify-api-key")
def verify_api_key(request: VerifyApiKeyRequest):
    verified = LLM_instance.set_and_verify_api_key(request.api_key, request.provider)
    print(verified)
    return {"verified": verified}

@app.get("/processing/get-models")
def get_models():
    try:
        models = LLM_instance.list_models()
        return models
    except RuntimeError as e:
        return {"error": str(e)}
    
@app.post("/processing/set-model")
def set_model(model_name: str):
    try:
        LLM_instance.set_model(model_name)
        return {"status": "model set", "model": model_name}
    except RuntimeError as e:
        return {"error": str(e)}

#has to be guarded and at the end of file
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)