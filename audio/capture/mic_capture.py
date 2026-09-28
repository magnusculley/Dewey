import sounddevice as sd
from scipy.io.wavfile import write

sample_rate = 44100
duration = 5
my_recording = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=2)
sd.wait()
write('output.wav', sample_rate, my_recording)
