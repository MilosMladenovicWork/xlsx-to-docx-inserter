const { contextBridge, ipcRenderer } = require("electron");
const {
  writeFiles,
  saveFiles,
  savePDFFiles,
  getFileNameFromPath,
  openFile,
  savePreviewPDF,
  savePreviewDOCX,
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

const {
  previewEmail,
  uploadEmailText,
  deleteEmailText,
  uploadEmailHTML,
  deleteEmailHTML,
  getEmailHTMLTemplates,
  getEmailTextTemplates,
} = require("./src/utils/emailHandlers");

contextBridge.exposeInMainWorld("electron", {
  writeFiles,
  saveFiles,
  openFile,
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
  savePreviewPDF,
  savePreviewDOCX,
  previewEmail,
  uploadEmailText,
  deleteEmailText,
  uploadEmailHTML,
  deleteEmailHTML,
  getEmailHTMLTemplates,
  getEmailTextTemplates,
  ipcRenderer,
});
