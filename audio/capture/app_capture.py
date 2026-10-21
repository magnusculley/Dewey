from proctap import ProcessAudioCapture
import wave
import numpy as np
import os

# AppCapture Class
# fields: active_pid, wav_file
# methods: start_capture(), stop_capture(), set_active_pid(pid), __get_output_dir()

class AppCapture:
    def __init__(self):
        self.active_pid: int | None = None
        self.wav_file: wave.Wave_write | None = None
        self.wav_path: str = self.__get_output_dir()
        self.capture_stream: ProcessAudioCapture | None = None
        

    def set_active_pid(self, pid: int) -> None:
        self.active_pid = pid

    def start_capture(self) -> None:
        if self.active_pid is None:
            raise ValueError("Active PID is not set.")

        if self.capture_stream is not None:
            return
        # open WAV file for writing
        self.wav_file = wave.open(self.wav_path, "wb")
        self.wav_file.setnchannels(2)        # Stereo
        self.wav_file.setsampwidth(2)        # 16-bit PCM
        self.wav_file.setframerate(48000)    # 48 kHz, native windows audio sample rate

        def on_audio(pcm_data: bytes, frame_count: int) -> None:
            # Backend provides float32, convert to int16 for WAV
            float_samples = np.frombuffer(pcm_data, dtype=np.float32)
            int16_samples = (np.clip(float_samples, -1.0, 1.0) * 32767).astype(np.int16)
            self.wav_file.writeframes(int16_samples.tobytes())

        self.capture_stream = ProcessAudioCapture(pid=self.active_pid, on_data=on_audio)
        self.capture_stream.__enter__()
        print(f"Started capturing audio from PID {self.active_pid}. Saving to {self.wav_path}")

    def __get_output_dir(self) -> str:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.abspath(os.path.join(current_dir, "../output"))
        os.makedirs(output_dir, exist_ok=True)
        wav_dir = os.path.join(output_dir, "app_output.wav")
        return wav_dir


    def stop_capture(self) -> None:
        if self.capture_stream is not None:
            self.capture_stream.__exit__(None, None, None)
            self.capture_stream = None
            print(f"Stopped capturing audio from PID {self.active_pid}.")

        if self.wav_file is not None:
            self.wav_file.close()
            self.wav_file = None
            print("Saved to app_output.wav")
