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
  getDOCXPlaceholders,
  checkDOCXPlaceholders,
} = require("./src/utils/docxHandlers");

const {
  checkXLSX,
  checkXLSXRowColumnWithRegex,
  checkXLSXColumnsWithRegex,
  getXLSXColumnNames,
} = require("./src/utils/xlsxHandlers");

const { getUploadedTemplates } = require("./src/utils/getTemplate");

contextBridge.exposeInMainWorld("electron", {
  writeFiles,
  saveFiles,
  savePDFFiles,
  uploadDOCX,
  deleteDOCX,
  getUploadedTemplates,
  getFileNameFromPath,
  checkXLSX,
  checkXLSXColumnsWithRegex,
  checkXLSXRowColumnWithRegex,
  getXLSXColumnNames,
  getDOCXPlaceholders,
  checkDOCXPlaceholders,
  ipcRenderer,
});
