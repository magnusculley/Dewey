import whisperx
import gc

device = "cuda" if whisperx.is_available() else "cpu"

audio_file = "audio/processing/audio.mp3"