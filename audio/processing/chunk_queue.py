import queue
import threading

# FIFO queue for finished chunk files: (wav path, start time)
chunk_queue = queue.Queue()


def enqueue_chunk(wav_path: str, start_time: float) -> None:
    chunk_queue.put((wav_path, start_time))


def __worker() -> None:
    while True:
        wav_path, start_time = chunk_queue.get()
        try:
            # Transcription stuff here
            # start_time is when the chunk audio arrived, hopefully useful to lineup audio
            print(f"Chunk ready for transcription: {wav_path}, epoch time: {start_time}")
        except Exception as error:
            print(f"Transcription failed for {wav_path}: {error}")
        finally:
            chunk_queue.task_done() # Removes chunk from queue


def start_worker() -> None:
    threading.Thread(target=__worker, daemon=True).start()
