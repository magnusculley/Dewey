from pycaw.pycaw import AudioUtilities

def get_active_audio_pids_windows() -> list[tuple[str, int]]:
    active_pids = []
    sessions = AudioUtilities.GetAllSessions()
    
    for session in sessions:
        if  session.Process:
            active_pids.append((session.Process.name(), session.Process.pid))
            
    return active_pids