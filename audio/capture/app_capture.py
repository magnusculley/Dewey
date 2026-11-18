from proctap import ProcessAudioCapture
import wave
import numpy as np
import os
from typing import Callable

# AppCapture Class
# fields: active_pid, wav_file, wav_path, capture_stream, session_dir, chunk_index, frames_in_chunk, sample_rate, on_chunk
# methods: start_capture(session_dir, chunk_seconds, on_chunk), stop_capture(), set_active_pid(pid)

class AppCapture:
    def __init__(self):
        self.active_pid: int | None = None
        self.wav_file: wave.Wave_write | None = None
        self.wav_path: str = ""
        self.capture_stream: ProcessAudioCapture | None = None
        self.session_dir: str = ""
        self.chunk_index: int = 0 # number of the next chunk file
        self.frames_in_chunk: int = 0 # audio frames written to the current file so far
        self.sample_rate: int = 48000 # assumes 48khz
        self.on_chunk: Callable[[str], None] | None = None


    def set_active_pid(self, pid: int) -> None:
        self.active_pid = pid

    def start_capture(self, session_dir: str, chunk_seconds: float, on_chunk: Callable[[str], None]) -> None:
        if self.active_pid is None:
            raise ValueError("Active PID is not set.")

        if self.capture_stream is not None:
            return

        self.session_dir = session_dir
        self.on_chunk = on_chunk
        self.chunk_index = 0

        def on_audio(pcm_data: bytes, frame_count: int) -> None:
            # Backend provides float32, convert to int16 for WAV
            float_samples = np.frombuffer(pcm_data, dtype=np.float32)
            int16_samples = (np.clip(float_samples, -1.0, 1.0) * 32767).astype(np.int16)

            # A chunk file is opened when its first audio arrives, so an app
            # that never plays leaves no empty file
            if self.wav_file is None:
                self.open_chunk()
            self.wav_file.writeframes(int16_samples.tobytes())
            self.frames_in_chunk += len(int16_samples) // 2 # stereo: 2 samples per frame

            # Once this file holds chunk_seconds of audio, close it and send it to transcription
            if self.frames_in_chunk >= self.sample_rate * chunk_seconds:
                self.close_chunk()

        self.capture_stream = ProcessAudioCapture(pid=self.active_pid, on_data=on_audio)
        self.capture_stream.__enter__()
        print(f"Started capturing audio from PID {self.active_pid}. Saving chunks to {session_dir}")

    def open_chunk(self) -> None:
        os.makedirs(self.session_dir, exist_ok=True)
        self.wav_path = os.path.join(self.session_dir, f"app_{self.chunk_index:04d}.wav")
        self.wav_file = wave.open(self.wav_path, "wb")
        self.wav_file.setnchannels(2) # Stereo
        self.wav_file.setsampwidth(2) # 16-bit PCM
        self.wav_file.setframerate(self.sample_rate)
        self.frames_in_chunk = 0

    def close_chunk(self) -> None:
        self.wav_file.close()
        self.wav_file = None
        self.chunk_index += 1
        self.on_chunk(self.wav_path) # finished file goes to the transcription queue

    def stop_capture(self) -> None:
        if self.capture_stream is not None:
            self.capture_stream.__exit__(None, None, None)
            self.capture_stream = None
            print(f"Stopped capturing audio from PID {self.active_pid}.")

        if self.wav_file is not None:
            self.close_chunk() # the last, shorter chunk
