from proctap import ProcessAudioCapture
import wave
import numpy as np

def capture_app_audio(active_pid: int) -> None:
# Open WAV file for writing
    with wave.open("../output/app_output.wav", "wb") as wav:
        wav.setnchannels(2)        # Stereo
        wav.setsampwidth(2)        # 16-bit PCM
        wav.setframerate(48000)    # 48 kHz, native windows audio sample rate

        def on_audio(pcm_data: bytes, frame_count: int) -> None:
            
            # Backend provides float32, convert to int16 for WAV
            float_samples = np.frombuffer(pcm_data, dtype=np.float32)
            int16_samples = (np.clip(float_samples, -1.0, 1.0) * 32767).astype(np.int16)
            wav.writeframes(int16_samples.tobytes())

        with ProcessAudioCapture(pid=active_pid, on_data=on_audio):
            input("Recording... Press Enter to stop.\n")

    wav.close()
    print("Saved to app_output.wav")
