import os
import platform
import time
import wave
from typing import Callable

import sounddevice as sd

#class MicCapture:
#fields: current_os, channel_num, sample_rate, wav_file, wav_path, session_dir, chunk_index, frames_in_chunk, chunk_start, on_chunk
#methods: start_capture(session_dir, chunk_seconds, on_chunk), stop_capture

class MicCapture:
    def __init__(self):
        self.current_os = platform.system()
        self.channel_num = 2
        if self.current_os == "Darwin": # running on macOS
            self.channel_num = 1
        self.sample_rate = 16000  # 16kHz
        self.wav_file: wave.Wave_write | None = None
        self.wav_path: str = ""
        self.capture_stream: sd.InputStream | None = None
        self.session_dir: str = ""
        self.chunk_index: int = 0 # number of the chunk file currently being written
        self.frames_in_chunk: int = 0 # audio frames written to that file so far
        self.chunk_start: float = 0.0 # clock time when that file's first audio arrived
        self.on_chunk: Callable[[str, float], None] | None = None

    def start_capture(self, session_dir: str, chunk_seconds: float, on_chunk: Callable[[str, float], None]) -> None:
        if self.capture_stream is not None:
            return

        self.session_dir = session_dir
        self.on_chunk = on_chunk
        self.chunk_index = 0
        self.open_chunk()
        frames_per_chunk = self.sample_rate * chunk_seconds

        def on_audio(indata, frame_count, time_info, status) -> None:
            if status:
                print(f"Microphone capture status: {status}")
            if self.frames_in_chunk == 0:
                self.chunk_start = time.time() # clock time when this chunk's first audio arrived
            self.wav_file.writeframes(indata.tobytes())
            self.frames_in_chunk += frame_count
            # Once a file has enough seconds of audio, close it, and open the next one
            if self.frames_in_chunk >= frames_per_chunk:
                self.close_chunk()
                self.open_chunk()

        stream = None
        try:
            stream = sd.InputStream(
                samplerate=self.sample_rate,
                channels=self.channel_num,
                dtype="int16",
                callback=on_audio,
            )
            self.capture_stream = stream
            stream.start()
        except Exception:
            if stream is not None:
                stream.close()
            self.capture_stream = None
            self.close_chunk()
            raise

    def open_chunk(self) -> None:
        os.makedirs(self.session_dir, exist_ok=True)
        self.wav_path = os.path.join(self.session_dir, f"mic_{self.chunk_index:04d}.wav")
        self.wav_file = wave.open(self.wav_path, "wb")
        self.wav_file.setnchannels(self.channel_num)
        self.wav_file.setsampwidth(2)
        self.wav_file.setframerate(self.sample_rate)
        self.frames_in_chunk = 0

    def close_chunk(self) -> None:
        self.wav_file.close()
        self.wav_file = None
        self.chunk_index += 1
        if self.frames_in_chunk > 0:
            self.on_chunk(self.wav_path, self.chunk_start) # finished file, go to the transcription queue

    def stop_capture(self):
        if self.capture_stream is not None:
            self.capture_stream.stop()
            self.capture_stream.close()
            self.capture_stream = None
        if self.wav_file is not None:
            self.close_chunk() # the last, shorter chunk
