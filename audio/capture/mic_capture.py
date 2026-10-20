import platform

import sounddevice as sd
from scipy.io.wavfile import write

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
        self.recording = None

    def start_capture(self, duration: int = 5):
        self.recording = sd.rec(int(duration * self.sample_rate), samplerate=self.sample_rate, channels=self.channel_num)
        sd.wait()
        write('../output/mic_output.wav', self.sample_rate, self.recording)

    def stop_capture(self):
        if self.recording is not None:
            sd.stop()
            self.recording = None
