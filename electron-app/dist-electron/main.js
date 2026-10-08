import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { exec } from "child_process";
import { promisify } from "util";
import path from "node:path";
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
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
app.whenReady().then(createWindow);
const execAsync = promisify(exec);
ipcMain.handle("get-running-processes", async () => {
  try {
    const { stdout } = await execAsync("tasklist /FO CSV /NH");
    const lines = stdout.trim().split("\r\n");
    const processMap = /* @__PURE__ */ new Map();
    for (const line of lines) {
      const parts = line.split('","').map((part) => part.replace(/"/g, ""));
      if (parts.length >= 2) {
        const name = parts[0];
        const pid = parseInt(parts[1], 10);
        if (!isNaN(pid) && pid > 4 && name !== "System Idle Process" && name !== "System") {
          processMap.set(pid, name);
        }
      }
    }
    return Array.from(processMap.entries()).map(([pid, name]) => ({ pid, name })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Failed to fetch processes:", error);
    return [];
  }
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
