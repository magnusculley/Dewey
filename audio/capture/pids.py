from pycaw.pycaw import AudioUtilities

def get_active_audio_pids_windows():
    active_pids = set()
    sessions = AudioUtilities.GetAllSessions()
    
    for session in sessions:
        if  session.Process:
            active_pids.add(session.Process.pid)
            
    return list(active_pids)

print("Audio PIDs:", get_active_audio_pids_windows())