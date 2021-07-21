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
  getDOCXPlaceholders,
  checkDOCXPlaceholders,
  savePreviewPDF,
  openFile,
  savePreviewDOCX,
  sendEmails,
  uploadEmailText,
  deleteEmailText,
  uploadEmailHTML,
  deleteEmailHTML,
  getEmailHTMLTemplates,
  getEmailTextTemplates,
  previewEmail,
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
  getDOCXPlaceholders: typeof getDOCXPlaceholders;
  checkDOCXPlaceholders: typeof checkDOCXPlaceholders;
  openFile: typeof openFile;
  savePreviewPDF: typeof savePreviewPDF;
  savePreviewDOCX: typeof savePreviewDOCX;
  sendEmails: typeof sendEmails;
  uploadEmailText: typeof uploadEmailText;
  deleteEmailText: typeof deleteEmailText;
  uploadEmailHTML: typeof uploadEmailHTML;
  deleteEmailHTML: typeof deleteEmailHTML;
  getEmailHTMLTemplates: typeof getEmailHTMLTemplates;
  getEmailTextTemplates: typeof getEmailTextTemplates;
  previewEmail: typeof previewEmail;
}
