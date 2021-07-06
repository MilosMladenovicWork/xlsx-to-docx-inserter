var PizZip = require("pizzip");
var Docxtemplater = require("docxtemplater");
const Excel = require("exceljs");

const fs = require("fs");
const path = require("path");
const { ipcRenderer } = require("electron");

const writeDummy = async () => {
  fs.writeFile("mynewfile3.txt", "Hello content!", function (err) {
    if (err) throw err;
    console.log("Saved!");
  });
};

function replaceErrors(key, value) {
  if (value instanceof Error) {
    return Object.getOwnPropertyNames(value).reduce(function (error, key) {
      error[key] = value[key];
      return error;
    }, {});
  }
  return value;
}

function errorHandler(error) {
  console.log(JSON.stringify({ error: error }, replaceErrors));

  if (error.properties && error.properties.errors instanceof Array) {
    const errorMessages = error.properties.errors
      .map(function (error) {
        return error.properties.explanation;
      })
      .join("\n");
    console.log("errorMessages", errorMessages);
    // errorMessages is a humanly readable message looking like this:
    // 'The tag beginning with "foobar" is unopened'
  }
  throw error;
}

const handleWorkbook = async function (
  workbook,
  replaceData,
  folder,
  fileName,
  templateName
) {
  var worksheet = workbook.getWorksheet();
  let firstValidColumn;
  let firstValidRow;
  let numberOfFields;
  let columnNames = [];

  const filesToWrite = [];

  worksheet.eachRow({ includeEmpty: true }, async function (row, rowNumber) {
    if (firstValidColumn === undefined) {
      firstValidColumn = row.values.findIndex((value) => value != null);
    }
    if (firstValidRow === undefined) {
      if (row.values.some((value) => value != null)) {
        firstValidRow = rowNumber;
      }
    }
    if (firstValidRow === rowNumber) {
      columnNames = row.values;
      const nonNullCells = row.values.filter((cell) => cell != null);
      nonNullCells.forEach((cell) => (replaceData[cell] = undefined));
    }
    if (firstValidRow < rowNumber) {
      row.values.forEach((cell, index) => {
        if (index >= firstValidColumn) {
          replaceData[columnNames[index]] = cell;
        }
      });

      // Load the docx file as binary content
      var content = fs.readFileSync(
        path.resolve(__dirname, `../../templates/${templateName}.docx`),
        "binary"
      );

      var zip = new PizZip(content);
      var doc;
      try {
        doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });
      } catch (error) {
        // Catch compilation errors (errors caused by the compilation of the template: misplaced tags)
        errorHandler(error);
      }

      //set the templateVariables
      doc.setData(replaceData);

      try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render();
      } catch (error) {
        // Catch rendering errors (errors relating to the rendering of the template: angularParser throws an error)
        errorHandler(error);
      }

      const buf = doc.getZip().generate({ type: "nodebuffer" });

      // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
      try {
        const writtenFile = writeFile(
          path.resolve(
            folder,
            `${fileName} ${row.values[firstValidColumn]}.docx`
          ),
          buf
        );
        filesToWrite.push(writtenFile);
      } catch (e) {
        errorHandler(e);
      }
    }
  });
  try {
    return Promise.all(filesToWrite);
  } catch (e) {
    errorHandler(e);
    return [];
  }
};

const writeFile = (path, data) =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, data, (error) => {
      if (error) reject(error);

      resolve(path);
    });
  });

const writeFiles = async (filesPath, folder, templateName) => {
  // The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).

  const workbook = new Excel.Workbook();

  const files = [];

  for (const filePath of filesPath) {
    const fileName = path.parse(filePath).name;

    let replaceData = {};

    await workbook.xlsx.readFile(filePath);

    try {
      let filesWritten = await handleWorkbook(
        workbook,
        replaceData,
        folder,
        fileName,
        templateName
      );
      files.push(filesWritten);
      return Promise.all(...files);
    } catch (e) {
      console.log(e);
      return e;
    }
  }
};

const saveFiles = async (filePaths, templateToUse) => {
  const folder = await ipcRenderer.invoke("folderDialog");
  if (folder.filePaths.length > 0) {
    const writtenFiles = await writeFiles(
      filePaths,
      folder.filePaths[0],
      templateToUse
    );
    return writtenFiles;
  }
};

const getUploadedTemplates = async () =>
  new Promise((resolve, reject) => {
    //joining path of directory
    const directoryPath = path.join(__dirname, "../../templates");
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
      //handling error
      if (err) {
        console.log("Unable to scan directory: " + err);
        return reject();
      }
      resolve(files.map((file) => path.parse(file).name));
    });
  });

const uploadDOCX = async () => {
  const files = await ipcRenderer.invoke("uploadDOCX");
  return new Promise((resolve, reject) => {
    //joining path of directory
    const directoryPath = path.join(__dirname, "../../templates");
    files.forEach((filePath) => {
      fs.copyFile(
        filePath,
        path.join(directoryPath, path.basename(filePath)),
        (err) => {
          if (err) throw err;

          console.log("file has been copied");
        }
      );
    });
    resolve(files.map((file) => path.parse(file).name));
  });
};

const getFileNameFromPath = (filePath) => {
  return path.parse(filePath).name;
};

const deleteDOCX = (fileName) => {
  return new Promise((resolve, reject) => {
    const directoryPath = path.join(__dirname, "../../templates");
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
      //handling error
      if (err) {
        console.log("Unable to scan directory: " + err);
        return reject();
      }
      const fileToDelete = files.find(
        (file) => path.parse(file).name === fileName
      );
      if (fileToDelete) {
        console.log(path.join(directoryPath, fileToDelete));
        fs.unlink(path.join(directoryPath, fileToDelete), (err) => {
          if (err) reject();
          resolve(fileName);
        });
      }
    });
  });
};

module.exports = {
  writeDummy,
  writeFiles,
  saveFiles,
  uploadDOCX,
  deleteDOCX,
  getFileNameFromPath,
  getUploadedTemplates,
};
