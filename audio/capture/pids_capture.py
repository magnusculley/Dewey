'''
import comtypes
from pycaw.pycaw import AudioUtilities
import platform


# change the channels to monochannel for mac
current_os = platform.system()
if current_os == "Darwin": # running on macOS
    pass

def get_active_audio_pids_mac():
    tapID = AudioObject

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
'''
import ctypes, ctypes.util, struct
from ctypes import c_uint32, byref

ca = ctypes.CDLL(ctypes.util.find_library("CoreAudio"))
fc = lambda s: struct.unpack(">I", s.encode())[0]

class Addr(ctypes.Structure):
    _fields_ = [("sel", c_uint32), ("scope", c_uint32), ("elem", c_uint32)]

def prop(obj, sel):
    a, size = Addr(fc(sel), fc("glob"), 0), c_uint32()
    ca.AudioObjectGetPropertyDataSize(obj, byref(a), 0, None, byref(size))
    buf = (c_uint32 * (size.value // 4))()
    ca.AudioObjectGetPropertyData(obj, byref(a), 0, None, byref(size), buf)
    return list(buf)

# object 1 = the system object; "prs#" = process list, "ppid" = PID, "piro" = is running output
pids = [prop(o, "ppid")[0] for o in prop(1, "prs#") if prop(o, "piro")[0]]
print(pids)
