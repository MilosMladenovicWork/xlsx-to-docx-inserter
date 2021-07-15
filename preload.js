const { contextBridge, ipcRenderer } = require("electron");
const {
  writeFiles,
  saveFiles,
  savePDFFiles,
  getFileNameFromPath,
} = require("./src/utils/fileHandlers");

const {
  uploadDOCX,
  deleteDOCX,
} = require("./src/utils/docxHandlers");

const {
  getUploadedTemplates,
} = require("./src/utils/getTemplate");

contextBridge.exposeInMainWorld("electron", {
  writeFiles,
  saveFiles,
  savePDFFiles,
  uploadDOCX,
  deleteDOCX,
  getUploadedTemplates,
  getFileNameFromPath,
  ipcRenderer,
});
