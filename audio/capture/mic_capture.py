import sounddevice as sd
from scipy.io.wavfile import write
import platform

# change the channels to monochannel for mac
current_os = platform.system()
channel_num = 2
if current_os == "Darwin": # running on macOS
    channel_num = 1

sample_rate = 16000  # 16kHz
duration = 5 #will be changed when the user input is implemented
my_recording = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=channel_num)
sd.wait()
write('../output/mic_output.wav', sample_rate, my_recording)
