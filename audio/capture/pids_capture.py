import sys
import subprocess

def get_active_audio_pids_windows():
    #windows-specific imports & audio-pid select
    import comtypes
    from pycaw.pycaw import AudioUtilities

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


def get_active_audio_pids_macos():
    #mac-specific imports & audio-pid select
    import ctypes, ctypes.util, struct
    from ctypes import c_uint32, byref

    # load Apple's CoreAudio library so Python can call its C functions.
    core_audio = ctypes.CDLL(ctypes.util.find_library("CoreAudio"))

    def code(four_chars: str) -> int:
        """Turn a 4-letter Core Audio code like "ppid" into the 32-bit int C expects."""
        return struct.unpack(">I", four_chars.encode())[0]

    class PropAddress(ctypes.Structure):
        """Has to have a ctypes structure so that the numbers are laid out in memory as C core audio expects"""
        _fields_ = [("selector", c_uint32), ("scope", c_uint32), ("elem", c_uint32)]

    def get_property(obj_id, prop_code):
        addr = PropAddress(code(prop_code), code("glob"), 0)
        size = c_uint32()
        core_audio.AudioObjectGetPropertyDataSize(obj_id, byref(addr), 0, None, byref(size)) #gets the amount of bytes the answer takes
        answer = (c_uint32 * (size.value // 4))() #an empty buffer of a large enough size
        core_audio.AudioObjectGetPropertyData(obj_id, byref(addr), 0, None, byref(size), answer) #fills the buffer
        return list(answer)


    # 1 = the system object; "prs#" = process list, "ppid" = PID, "piro" = is running output
    process_objects = get_property(1, "prs#")
    active_processes = []
    for process_object in process_objects:
        output_is_running = get_property(process_object, "piro")[0]
        if output_is_running:
            pid = get_property(process_object, "ppid")[0]
            name = subprocess.run(["ps", "-p", str(pid), "-c", "-o", "comm="], capture_output=True, text=True).stdout.strip() #the '-c' replaces the whole process path with just the application name 
            
            active_processes.append({"pid": pid, "name": name})
    return active_processes

def get_active_audio_pids_linux():
    import re
    try:
        output = subprocess.run(
            ["pactl", "list", "sink-inputs"],
            capture_output=True,
            text=True,
            check=True,
        ).stdout
    except (FileNotFoundError, subprocess.CalledProcessError):
        return []

    active_processes = []
    seen_pids = set()

    for sink_input in output.split("Sink Input #")[1:]:
        name_match = re.search(r'application\.name = "([^"]+)"', sink_input)
        pid_match = re.search(r'application\.process\.id = "(\d+)"', sink_input)

        if not name_match or not pid_match:
            continue

        pid = int(pid_match.group(1))
        if pid in seen_pids:
            continue

        seen_pids.add(pid)
        active_processes.append({"pid": pid, "name": name_match.group(1)})

    return active_processes

#select audio-producing pids by os
def get_active_audio_pids():
    if sys.platform == "win32":
        return get_active_audio_pids_windows()
    elif sys.platform == "darwin":
        return get_active_audio_pids_macos()
    elif sys.platform.startswith("linux"):
        return get_active_audio_pids_linux()
    else:
        raise NotImplementedError(f"No audio PID detection for {sys.platform}")


