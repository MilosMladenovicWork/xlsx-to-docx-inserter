const { ipcRenderer } = require("electron");

const {
  writeDummy,
  writeFiles,
  saveFiles,
  savePDFFiles,
  uploadDOCX,
  deleteDOCX,
  getUploadedTemplates,
  getFileNameFromPath,
  checkXLSXColumnsWithRegex,
  checkXLSXRowColumnWithRegex,
  checkXLSX,
  getXLSXColumnNames,
} = require("../utils/write");

export interface ElectronPreloadFunctions {
  writeDummy: typeof writeDummy;
  writeFiles: typeof writeFiles;
  saveFiles: typeof saveFiles;
  savePDFFiles: typeof savePDFFiles;
  uploadDOCX: typeof uploadDOCX;
  deleteDOCX: typeof deleteDOCX;
  getUploadedTemplates: typeof getUploadedTemplates;
  getFileNameFromPath: typeof getFileNameFromPath;
  ipcRenderer: typeof ipcRenderer;
  checkXLSX: typeof checkXLSX;
  getXLSXColumnNames: typeof getXLSXColumnNames;
  checkXLSXColumnsWithRegex: typeof checkXLSXColumnsWithRegex;
  checkXLSXRowColumnWithRegex: typeof checkXLSXRowColumnWithRegex;
}
