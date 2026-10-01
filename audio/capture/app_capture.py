from proctap import ProcessAudioCapture
import wave
import numpy as np

# Open WAV file for writing
wav = wave.open("../output/app_output.wav", "wb")
wav.setnchannels(2)        # Stereo, might need to change to 1 for mono
wav.setsampwidth(2)        # 16-bit PCM
wav.setframerate(16000)    # 16 kHz

def on_audio(pcm_data: bytes, frame_count: int):
    # Backend provides float32, convert to int16 for WAV
    float_samples = np.frombuffer(pcm_data, dtype=np.float32)
    int16_samples = (np.clip(float_samples, -1.0, 1.0) * 32767).astype(np.int16)
    wav.writeframes(int16_samples.tobytes())

# PID will be input from user later, for now we can use a placeholder value
with ProcessAudioCapture(pid=12345, on_data=on_audio):
    input("Recording... Press Enter to stop.\n")

wav.close()
print("Saved to app_output.wav")
