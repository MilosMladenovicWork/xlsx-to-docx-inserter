const { contextBridge, ipcRenderer } = require("electron");
const {
  writeDummy,
  writeFiles,
  saveFiles,
  savePDFFiles,
  uploadDOCX,
  deleteDOCX,
  getUploadedTemplates,
  getFileNameFromPath,
} = require("./src/utils/write");

contextBridge.exposeInMainWorld("electron", {
  writeDummy,
  writeFiles,
  saveFiles,
  savePDFFiles,
  uploadDOCX,
  deleteDOCX,
  getUploadedTemplates,
  getFileNameFromPath,
  ipcRenderer,
});
