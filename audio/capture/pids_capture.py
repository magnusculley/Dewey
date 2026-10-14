import comtypes
from pycaw.pycaw import AudioUtilities

def get_active_audio_pids_windows():
    comtypes.CoInitialize()
    active_processes = []
    seen_pids = set()
    sessions = AudioUtilities.GetAllSessions()
    for session in sessions:
        if session.Process and session.ProcessId not in seen_pids:
            active_processes.append({"pid": session.ProcessId, "name": session.Process.name()})
            seen_pids.add(session.ProcessId)
    comtypes.CoUninitialize()
    return active_processes
