import queue
import threading

# FIFO queue for finished chunk files
chunk_queue = queue.Queue()


def enqueue_chunk(wav_path: str) -> None:
    chunk_queue.put(wav_path)


def __worker() -> None:
    while True:
        wav_path = chunk_queue.get()
        try:
            # Transcribe here
            print(f"Chunk ready for transcription: {wav_path}")
        except Exception as error:
            print(f"Transcription failed for {wav_path}: {error}")
        finally:
            chunk_queue.task_done() # Removes chunk from queue


def start_worker() -> None:
    threading.Thread(target=__worker, daemon=True).start()
