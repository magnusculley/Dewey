import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { spawn, ChildProcess } from "node:child_process";
import path from "node:path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let pythonProcess: ChildProcess | null = null;

function startFastAPIServer() {
  const scriptPath = path.join(process.env.APP_ROOT, "..", "audio", "main.py");
  
  pythonProcess = spawn("python", [scriptPath], { stdio: "inherit" });
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// 1. Start Python backend and open window on launch
app.whenReady().then(() => {
  startFastAPIServer();
  createWindow();
});

// 2. Terminate the Python server when Electron quits to avoid orphaned processes
app.on("will-quit", () => {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handler
ipcMain.handle("get-running-processes", async () => {
  //need retried because of race condition between electron and fastapi server booting up
  const maxRetries = 6;
  const retryDelayMs = 500;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch("http://127.0.0.1:8000/audio-pids", {
        method: "GET",
      });

      return await response.json();
    } catch (error) {
      if (attempt === maxRetries) {
        console.error("FastAPI unreachable after retries:", error);
        return [];
      }
      // Wait before retrying while the server finishes booting
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
});

ipcMain.handle("set-active-pid", async (event, pid: number) => {
  try {
    // Post PID to FastAPI backend to start audio capture
    const response = await fetch("http://127.0.0.1:8000/set-selected-pid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pid }),
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error setting active PID:", error);
    throw error;
  }
});
