const fs = require("fs");
const path = require("path");
const { ipcRenderer } = require("electron");
const mammoth = require("mammoth");
const { readFile } = require("./fileHandlers");

const uploadDOCX = async () => {
  const files = await ipcRenderer.invoke("uploadDOCX");
  return new Promise(async (resolve, reject) => {
    //joining path of directory
    const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
    const folderName = "templates";

    const templatesFolder = path.join(directoryPath, folderName);

    if (!fs.existsSync(templatesFolder)) {
      fs.mkdirSync(templatesFolder, {
        recursive: true,
      });
    }

    files.forEach((filePath) => {
      fs.copyFile(
        filePath,
        path.join(templatesFolder, path.basename(filePath)),
        (err) => {
          if (err) throw err;

          console.log("file has been copied");
        }
      );
    });
    resolve(files.map((file) => path.parse(file).name));
  });
};

const deleteDOCX = (fileName) => {
  return new Promise(async (resolve, reject) => {
    const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
    const folderName = "templates";

    const templatesFolder = path.join(directoryPath, folderName);
    //passsing directoryPath and callback function
    fs.readdir(templatesFolder, function (err, files) {
      //handling error
      if (err) {
        console.log("Unable to scan directory: " + err);
        return reject();
      }
      const fileToDelete = files.find(
        (file) => path.parse(file).name === fileName
      );

      if (fileToDelete) {
        fs.unlink(path.join(templatesFolder, fileToDelete), (err) => {
          if (err) reject();
          resolve(fileName);
        });
      }
    });
  });
};

const getDOCXPlaceholders = async (file) => {
  const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
  const folderName = "templates";

  const templatesFolder = path.join(directoryPath, folderName);

  const wordBuffer = await readFile(path.join(templatesFolder, file + ".docx"));

  try {
    const text = (await mammoth.extractRawText({ buffer: wordBuffer })).value;
    let placeholders = text.match(/\{(.*?)\}/g);
    if (placeholders) {
      placeholders = placeholders.map((string) =>
        string.replace("{", "").replace("}", "")
      );

      return placeholders;
    }
    return [];
  } catch (e) {
    console.log(e);
  }
};

const checkDOCXPlaceholders = (placeholders, columnNames) => {
  const statuses = [];

  const columnsExistingOverPlaceholders = columnNames.filter(
    (value) => !placeholders.includes(value)
  );

  const placeholdersExistingOverColumns = placeholders.filter(
    (value) => !columnNames.includes(value)
  );

  columnsExistingOverPlaceholders.forEach((columnName) =>
    statuses.push({
      label: "Placeholder missing in DOCX",
      valid: "warning",
      message: `Column ${columnName} in XLSX file doesn't have its pair in template you choose. Please remove column from XLSX file or insert placeholder with name ${columnName} between {} in DOCX template.`,
    })
  );

  placeholdersExistingOverColumns.forEach((placeholder) => {
    statuses.push({
      label: "Column missing in XLSX",
      valid: false,
      message: `Placeholder ${placeholder} in DOCX template file doesn't have its pair in XLSX file you uploaded. Please add column in XLSX file with name ${placeholder} or remove placeholders that are between {} in DOCX template.`,
    });
  });

  if (statuses.length === 0) {
    statuses.push({
      label: "DOCX and XLSX match",
      valid: true,
      message: `Column names in XLSX file completely match placeholders in DOCX file! You can proceed.`,
    });
  }

  return statuses;
};

module.exports = {
  uploadDOCX,
  deleteDOCX,
  checkDOCXPlaceholders,
  getDOCXPlaceholders,
};
