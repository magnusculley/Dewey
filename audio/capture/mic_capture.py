import sounddevice as sd
from scipy.io.wavfile import write

sample_rate = 16000  # 16kHz
duration = 5 #will be changed when the user input is implemented
my_recording = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1) #Originally 2 channels, but mac is monochannel
sd.wait()
write('../output/mic_output.wav', sample_rate, my_recording)
