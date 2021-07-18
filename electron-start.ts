const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    height: 768,
    width: 1024,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.loadURL("http://localhost:3000");
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.openDevTools();
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

ipcMain.handle("getAppDataDirectory", () => {
  return app.getPath("appData");
});

app.on("ready", createWindow);

app.on("activate", () => mainWindow === null && createWindow());

app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
