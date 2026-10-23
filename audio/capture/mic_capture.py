import os
import platform
import wave

import sounddevice as sd

#class MicCapture:
#fields: current_os, channel_num, sample_rate
#methods: start_capture, stop_capture

class MicCapture:
    def __init__(self):
        self.current_os = platform.system()
        self.channel_num = 2
        if self.current_os == "Darwin": # running on macOS
            self.channel_num = 1
        self.sample_rate = 16000  # 16kHz
        self.wav_file: wave.Wave_write | None = None
        self.capture_stream: sd.InputStream | None = None
        current_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.abspath(os.path.join(current_dir, "../output"))
        os.makedirs(output_dir, exist_ok=True)
        self.wav_path = os.path.join(output_dir, "mic_output.wav")

    def start_capture(self) -> None:
        if self.capture_stream is not None:
            return

        wav_file = wave.open(self.wav_path, "wb")
        wav_file.setnchannels(self.channel_num)
        wav_file.setsampwidth(2)
        wav_file.setframerate(self.sample_rate)
        self.wav_file = wav_file

        def on_audio(indata, frame_count, time_info, status) -> None:
            if status:
                print(f"Microphone capture status: {status}")
            wav_file.writeframes(indata.tobytes())

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
            wav_file.close()
            self.wav_file = None
            raise

    def stop_capture(self):
        if self.capture_stream is not None:
            self.capture_stream.stop()
            self.capture_stream.close()
            self.capture_stream = None
        if self.wav_file is not None:
            self.wav_file.close()
            self.wav_file = None
