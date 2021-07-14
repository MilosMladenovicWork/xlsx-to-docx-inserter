const { ipcRenderer } = require("electron");

const {
  writeDummy,
  writeFiles,
  saveFiles,
  uploadDOCX,
  deleteDOCX,
  getUploadedTemplates,
  getFileNameFromPath,
} = require("../utils/write");

export interface ElectronPreloadFunctions {
  writeDummy: typeof writeDummy;
  writeFiles: typeof writeFiles;
  saveFiles: typeof saveFiles;
  uploadDOCX: typeof uploadDOCX;
  deleteDOCX: typeof deleteDOCX;
  getUploadedTemplates: typeof getUploadedTemplates;
  getFileNameFromPath: typeof getFileNameFromPath;
  ipcRenderer: typeof ipcRenderer;
}
