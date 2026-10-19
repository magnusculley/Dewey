from proctap import ProcessAudioCapture
import wave
import numpy as np

# AppCapture Class
# fields: active_pid, wav_file
# methods: start_capture(), stop_capture(), set_active_pid(pid)

class AppCapture:
    def __init__(self):
        self.active_pid: int | None = None
        self.wav_file: wave.Wave_write | None = None

    def set_active_pid(self, pid: int) -> None:
        self.active_pid = pid

    def start_capture(self) -> None:
        if self.active_pid is None:
            raise ValueError("Active PID is not set.")
        # open WAV file for writing
        self.wav_file = wave.open("../output/app_output.wav", "wb")
        self.wav_file.setnchannels(2)        # Stereo
        self.wav_file.setsampwidth(2)        # 16-bit PCM
        self.wav.setframerate(48000)    # 48 kHz, native windows audio sample rate

        def on_audio(pcm_data: bytes, frame_count: int) -> None:
            # Backend provides float32, convert to int16 for WAV
            float_samples = np.frombuffer(pcm_data, dtype=np.float32)
            int16_samples = (np.clip(float_samples, -1.0, 1.0) * 32767).astype(np.int16)
            self.wav.writeframes(int16_samples.tobytes())

        with ProcessAudioCapture(pid=self.active_pid, on_data=on_audio):
            input("Recording... Press Enter to stop.\n")

    def stop_capture(self) -> None:
        if self.wav_file is not None:
            self.wav_file.close()
            self.wav_file = None
            print("Saved to app_output.wav")
