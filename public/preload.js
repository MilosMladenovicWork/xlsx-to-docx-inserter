const { contextBridge, ipcRenderer } = require("electron");
const {
  writeFiles,
  saveFiles,
  savePDFFiles,
  getFileNameFromPath,
  openFile,
  savePreviewPDF,
  savePreviewDOCX,
} = require("./shared/utils/fileHandlers");

const {
  uploadDOCX,
  deleteDOCX,
  getDOCXPlaceholders,
  checkDOCXPlaceholders,
} = require("./shared/utils/docxHandlers");

const {
  checkXLSX,
  checkXLSXRowColumnWithRegex,
  checkXLSXColumnsWithRegex,
  getXLSXColumnNames,
} = require("./shared/utils/xlsxHandlers");

const {
  createConfiguration,
  getConfiguration,
  saveConfiguration,
  getConfigurationJSON,
} = require("./shared/utils/configurationHandlers");

const { getUploadedTemplates } = require("./shared/utils/getTemplate");

const {
  previewEmail,
  uploadEmailText,
  deleteEmailText,
  uploadEmailHTML,
  deleteEmailHTML,
  getEmailHTMLTemplates,
  getEmailTextTemplates,
  sendEmails,
} = require("./shared/utils/emailHandlers");

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
  sendEmails,
  createConfiguration,
  getConfiguration,
  saveConfiguration,
  getConfigurationJSON,
  ipcRenderer,
});
