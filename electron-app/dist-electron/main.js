import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import require$$0$1 from "fs";
import require$$0 from "path";
import { EventEmitter } from "events";
import * as os from "os";
import path from "node:path";
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var bindings$1 = { exports: {} };
var sep = require$$0.sep || "/";
var fileUriToPath_1 = fileUriToPath;
function fileUriToPath(uri) {
  if ("string" != typeof uri || uri.length <= 7 || "file://" != uri.substring(0, 7)) {
    throw new TypeError("must pass in a file:// URI to convert to a file path");
  }
  var rest = decodeURI(uri.substring(7));
  var firstSlash = rest.indexOf("/");
  var host = rest.substring(0, firstSlash);
  var path2 = rest.substring(firstSlash + 1);
  if ("localhost" == host) host = "";
  if (host) {
    host = sep + sep + host;
  }
  path2 = path2.replace(/^(.+)\|/, "$1:");
  if (sep == "\\") {
    path2 = path2.replace(/\//g, "\\");
  }
  if (/^.+\:/.test(path2)) ;
  else {
    path2 = sep + path2;
  }
  return host + path2;
}
(function(module, exports) {
  var fs = require$$0$1, path2 = require$$0, fileURLToPath2 = fileUriToPath_1, join = path2.join, dirname = path2.dirname, exists = fs.accessSync && function(path22) {
    try {
      fs.accessSync(path22);
    } catch (e) {
      return false;
    }
    return true;
  } || fs.existsSync || path2.existsSync, defaults = {
    arrow: process.env.NODE_BINDINGS_ARROW || " → ",
    compiled: process.env.NODE_BINDINGS_COMPILED_DIR || "compiled",
    platform: process.platform,
    arch: process.arch,
    nodePreGyp: "node-v" + process.versions.modules + "-" + process.platform + "-" + process.arch,
    version: process.versions.node,
    bindings: "bindings.node",
    try: [
      // node-gyp's linked version in the "build" dir
      ["module_root", "build", "bindings"],
      // node-waf and gyp_addon (a.k.a node-gyp)
      ["module_root", "build", "Debug", "bindings"],
      ["module_root", "build", "Release", "bindings"],
      // Debug files, for development (legacy behavior, remove for node v0.9)
      ["module_root", "out", "Debug", "bindings"],
      ["module_root", "Debug", "bindings"],
      // Release files, but manually compiled (legacy behavior, remove for node v0.9)
      ["module_root", "out", "Release", "bindings"],
      ["module_root", "Release", "bindings"],
      // Legacy from node-waf, node <= 0.4.x
      ["module_root", "build", "default", "bindings"],
      // Production "Release" buildtype binary (meh...)
      ["module_root", "compiled", "version", "platform", "arch", "bindings"],
      // node-qbs builds
      ["module_root", "addon-build", "release", "install-root", "bindings"],
      ["module_root", "addon-build", "debug", "install-root", "bindings"],
      ["module_root", "addon-build", "default", "install-root", "bindings"],
      // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
      ["module_root", "lib", "binding", "nodePreGyp", "bindings"]
    ]
  };
  function bindings2(opts) {
    if (typeof opts == "string") {
      opts = { bindings: opts };
    } else if (!opts) {
      opts = {};
    }
    Object.keys(defaults).map(function(i2) {
      if (!(i2 in opts)) opts[i2] = defaults[i2];
    });
    if (!opts.module_root) {
      opts.module_root = exports.getRoot(exports.getFileName());
    }
    if (path2.extname(opts.bindings) != ".node") {
      opts.bindings += ".node";
    }
    var requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : commonjsRequire;
    var tries = [], i = 0, l = opts.try.length, n, b, err;
    for (; i < l; i++) {
      n = join.apply(
        null,
        opts.try[i].map(function(p) {
          return opts[p] || p;
        })
      );
      tries.push(n);
      try {
        b = opts.path ? requireFunc.resolve(n) : requireFunc(n);
        if (!opts.path) {
          b.path = n;
        }
        return b;
      } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND" && e.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(e.message)) {
          throw e;
        }
      }
    }
    err = new Error(
      "Could not locate the bindings file. Tried:\n" + tries.map(function(a) {
        return opts.arrow + a;
      }).join("\n")
    );
    err.tries = tries;
    throw err;
  }
  module.exports = exports = bindings2;
  exports.getFileName = function getFileName(calling_file) {
    var origPST = Error.prepareStackTrace, origSTL = Error.stackTraceLimit, dummy = {}, fileName;
    Error.stackTraceLimit = 10;
    Error.prepareStackTrace = function(e, st) {
      for (var i = 0, l = st.length; i < l; i++) {
        fileName = st[i].getFileName();
        if (fileName !== __filename) {
          if (calling_file) {
            if (fileName !== calling_file) {
              return;
            }
          } else {
            return;
          }
        }
      }
    };
    Error.captureStackTrace(dummy);
    dummy.stack;
    Error.prepareStackTrace = origPST;
    Error.stackTraceLimit = origSTL;
    var fileSchema = "file://";
    if (fileName.indexOf(fileSchema) === 0) {
      fileName = fileURLToPath2(fileName);
    }
    return fileName;
  };
  exports.getRoot = function getRoot(file) {
    var dir = dirname(file), prev;
    while (true) {
      if (dir === ".") {
        dir = process.cwd();
      }
      if (exists(join(dir, "package.json")) || exists(join(dir, "node_modules"))) {
        return dir;
      }
      if (prev === dir) {
        throw new Error(
          'Could not find module root given file: "' + file + '". Do you have a `package.json` file? '
        );
      }
      prev = dir;
      dir = join(dir, "..");
    }
  };
})(bindings$1, bindings$1.exports);
var bindingsExports = bindings$1.exports;
const bindings = /* @__PURE__ */ getDefaultExportFromCjs(bindingsExports);
const native = (() => {
  let native2;
  const projectName = "process-audio-capture";
  const bindingsName = "process-audio-capture";
  const options = {
    bindings: bindingsName
  };
  try {
    native2 = bindings({ ...options });
  } catch (error) {
    const root = bindings.getRoot(bindings.getFileName());
    const moduleRoot = require$$0.join(root, "/", "node_modules", "/", projectName);
    native2 = bindings({
      ...options,
      module_root: moduleRoot,
      try: [
        // node-gyp's linked version in the "build" dir
        ["module_root", "build", "bindings"],
        // node-waf and gyp_addon (a.k.a node-gyp)
        ["module_root", "build", "Debug", "bindings"],
        ["module_root", "build", "Release", "bindings"],
        // Debug files, for development (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Debug", "bindings"],
        ["module_root", "Debug", "bindings"],
        // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Release", "bindings"],
        ["module_root", "Release", "bindings"],
        // Legacy from node-waf, node <= 0.4.x
        ["module_root", "build", "default", "bindings"],
        // Production "Release" buildtype binary (meh...)
        ["module_root", "compiled", "version", "platform", "arch", "bindings"],
        // node-qbs builds
        ["module_root", "addon-build", "release", "install-root", "bindings"],
        ["module_root", "addon-build", "debug", "install-root", "bindings"],
        ["module_root", "addon-build", "default", "install-root", "bindings"],
        // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
        ["module_root", "lib", "binding", "nodePreGyp", "bindings"]
      ]
    });
  }
  return native2;
})();
class AudioCaptureStub extends EventEmitter {
  constructor() {
    super();
  }
  /** 是否正在捕获音频 */
  get isCapturing() {
    return false;
  }
  set isCapturing(_value) {
  }
  /**
   * 当前平台是否支持音频捕获
   *
   * 仅支持
   * - macOS 14.4+
   * - Windows 10+
   * - Linux 不支持
   */
  isPlatformSupported() {
    return false;
  }
  /** 检查音频捕获权限状态 */
  checkPermission() {
    return { status: "authorized" };
  }
  /** 请求音频捕获权限 */
  requestPermission() {
    return Promise.resolve({ status: "authorized" });
  }
  /** 获取可捕获音频的进程列表 */
  getProcessList() {
    return [];
  }
  /** 开始捕获指定进程的音频 */
  startCapture(_pid, _callback) {
    return false;
  }
  /** 停止捕获 */
  stopCapture() {
    return false;
  }
}
class AudioCapture extends AudioCaptureStub {
  constructor() {
    super();
    this.addon = new native.AudioCaptureAddon();
  }
  get isCapturing() {
    return this.addon.isCapturing();
  }
  isPlatformSupported() {
    const platform = os.platform();
    const { majorVersion, minorVersion } = this.getOsVersion();
    if (platform === "darwin") {
      return majorVersion >= 24 || majorVersion === 23 && minorVersion >= 4;
    }
    if (platform === "win32") {
      return majorVersion >= 10;
    }
    return false;
  }
  checkPermission() {
    return this.addon.checkPermission();
  }
  requestPermission() {
    return new Promise((resolve) => {
      this.addon.requestPermission((result) => {
        resolve(result);
      });
    });
  }
  getProcessList() {
    const permission = this.checkPermission();
    if (permission.status !== "authorized") {
      throw new Error("没有音频捕获权限");
    }
    return this.addon.getProcessList();
  }
  startCapture(pid, callback) {
    const permission = this.checkPermission();
    if (permission.status !== "authorized") {
      throw new Error("没有音频捕获权限");
    }
    try {
      const result = this.addon.startCapture(pid, (audioData) => {
        callback == null ? void 0 : callback(audioData);
        this.emit("audio-data", audioData);
      });
      if (result) {
        this.emit("capturing", true);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
  stopCapture() {
    if (!this.isCapturing) {
      return false;
    }
    const result = this.addon.stopCapture();
    if (result) {
      this.emit("capturing", false);
    }
    return result;
  }
  getOsVersion() {
    try {
      const osRelease = os.release();
      const version = osRelease.split(".");
      const majorVersion = parseInt(version[0], 10) || 0;
      const minorVersion = parseInt(version[1], 10) || 0;
      return { majorVersion, minorVersion };
    } catch (error) {
      return { majorVersion: 0, minorVersion: 0 };
    }
  }
}
let audioCapture;
if (process.platform === "darwin" || process.platform === "win32") {
  audioCapture = new AudioCapture();
} else {
  audioCapture = new AudioCaptureStub();
}
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
ipcMain.handle("get-running-processes", async () => {
  try {
    const processes = await audioCapture.getProcessList();
    return processes.map((proc) => ({
      pid: proc.pid,
      name: proc.name
    }));
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
