const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const url = require('url');

let mainWindow;

const createWindow = () => {
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, "../build/index.html"),
      protocol: "file:",
      slashes: true,
    });

  mainWindow = new BrowserWindow({
    height: 768,
    width: 1024,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.loadURL(startUrl);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

ipcMain.handle("folderDialog", async () => {
  return await dialog.showOpenDialog({ properties: ["openDirectory"] });
});

ipcMain.handle("uploadXLSX", async () => {
  const files = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: ".xlsx", extensions: ["xlsx"] }],
  });
  return files.filePaths;
});

ipcMain.handle("uploadDOCX", async () => {
  const files = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: ".docx", extensions: ["docx"] }],
  });
  return files.filePaths;
});

ipcMain.handle("uploadEmailHTML", async () => {
  const files = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: ".html", extensions: ["html"] }],
  });
  return files.filePaths;
});

ipcMain.handle("uploadEmailText", async () => {
  const files = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: ".txt", extensions: ["txt"] }],
  });
  return files.filePaths;
});

ipcMain.handle("getAppDataDirectory", () => {
  return app.getPath("appData");
});

app.on("ready", createWindow);

app.on("activate", () => mainWindow === null && createWindow());

app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
