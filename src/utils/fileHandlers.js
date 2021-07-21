const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const Excel = require("exceljs");
var toPdf = require("office-to-pdf");
const RegexParser = require("regex-parser");

const fs = require("fs");
const path = require("path");
const { ipcRenderer, shell } = require("electron");

function errorHandler(error) {
  console.log(JSON.stringify({ error: error }));

  if (error.properties && error.properties.errors instanceof Array) {
    const errorMessages = error.properties.errors
      .map(function (error) {
        return error.properties.explanation;
      })
      .join("\n");
    console.log("errorMessages", errorMessages);
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
  const worksheet = workbook.getWorksheet();
  let firstValidColumn;
  let firstValidRow;
  let columnNames;

  const filesToWrite = [];
  const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
  const folderName = "templates";

  const templatesFolder = path.join(directoryPath, folderName);

  worksheet.eachRow(function (row, rowNumber) {
    const rowValues = row.values;

    if (firstValidColumn === undefined) {
      const indexOfValidColumn = rowValues.findIndex((value) => value != null);
      if (indexOfValidColumn !== -1) {
        firstValidColumn = indexOfValidColumn;
      }
    }
    if (firstValidRow === undefined) {
      if (rowValues.some((value) => value != null)) {
        firstValidRow = rowNumber;
      }
    }
    if (firstValidRow === rowNumber) {
      columnNames = rowValues;
      const nonNullCells = rowValues.filter((cell) => cell != null);
      nonNullCells.forEach((cell) => (replaceData[cell] = undefined));
    }

    if (firstValidRow < rowNumber && rowValues[firstValidColumn]) {
      rowValues.forEach((cell, index) => {
        const columnValue = columnNames[index];
        if (index >= firstValidColumn && columnValue !== undefined) {
          replaceData[columnValue] = cell;
        }
      });

      // Load the docx file as binary content
      var content = fs.readFileSync(
        path.resolve(
          __dirname,
          path.join(templatesFolder, `${templateName}.docx`)
        ),
        "binary"
      );

      let zip = new PizZip(content);
      let doc;
      doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
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
            `${templateName} ${rowValues[firstValidColumn]}.docx`
          ),
          buf
        );
        filesToWrite.push(writtenFile);
      } catch (error) {
        // Catch compilation errors (errors caused by the compilation of the template: misplaced tags)
        errorHandler(error);
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

const writeFile = async (path, data) =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, data, (error) => {
      if (error) reject(error);

      resolve(path);
    });
  });

const readFile = async (path, encoding = null) =>
  new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (error, data) => {
      if (error) reject(error);
      resolve(data);
    });
  });

const writeFiles = async (filesPath, folder, templateName) => {
  const workbook = new Excel.Workbook();

  const files = [];

  for (const filePath of filesPath) {
    await workbook.xlsx.readFile(filePath);
    const fileName = path.parse(filePath).name;

    let replaceData = {};

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

const convertDOCXToPDF = async (filePaths, folder) => {
  const promises = [];

  for (let i = 0; i < filePaths.length; i++) {
    const wordBuffer = await readFile(filePaths[i]);

    try {
      const pdfBuffer = await toPdf(wordBuffer);
      promises.push(
        writeFile(
          folder + `/${getFileNameFromPath(filePaths[i])}.pdf`,
          pdfBuffer
        )
      );
    } catch (e) {
      console.log(e);
    }
  }

  return promises;
};

const savePDFFiles = async (filePaths) => {
  const folder = await ipcRenderer.invoke("folderDialog");
  if (folder.filePaths.length > 0) {
    const writtenFiles = await convertDOCXToPDF(filePaths, folder.filePaths[0]);
    return writtenFiles;
  }
};

const getFileNameFromPath = (filePath) => {
  return path.parse(filePath).name;
};

const getFirstValidColumn = async (filePath) => {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet();
  let firstValidColumn;

  worksheet.eachRow(function (row) {
    const rowValues = row.values;

    if (firstValidColumn === undefined) {
      const indexOfValidColumn = rowValues.findIndex((value) => value != null);
      if (indexOfValidColumn !== -1) {
        firstValidColumn = indexOfValidColumn;
      }
    }
  });

  return firstValidColumn;
};

const getFirstValidRow = async (filePath) => {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet();
  let firstValidRow;

  worksheet.eachRow(function (row, rowNumber) {
    const rowValues = row.values;

    if (firstValidRow === undefined) {
      if (rowValues.some((value) => value != null)) {
        firstValidRow = rowNumber;
      }
    }
  });

  return firstValidRow;
};

const savePreviewPDF = async (docxFilePath) => {
  const folder = await ipcRenderer.invoke("folderDialog");

  if (folder.filePaths.length > 0) {
    try {
      const pdfFiles = await convertDOCXToPDF(
        [docxFilePath],
        folder.filePaths[0]
      );
      return pdfFiles;
    } catch (error) {
      // Catch compilation errors (errors caused by the compilation of the template: misplaced tags)
      errorHandler(error);
    }
  }
};

const savePreviewDOCX = async (filePath, templateName) => {
  const firstValidColumn = await getFirstValidColumn(filePath);
  const firstValidRow = await getFirstValidRow(filePath);

  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet();

  const columnNames = await worksheet.getRow(firstValidRow);
  const dataRow = await worksheet.getRow(firstValidRow + 1);

  let replaceData = {};

  if (firstValidRow !== undefined) {
    dataRow.values.forEach((cell, index) => {
      const columnName = columnNames.values[index];
      if (index >= firstValidColumn && columnName !== undefined) {
        replaceData[columnName] = cell;
      }
    });

    const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
    const folderName = "templates";
    const templatesFolder = path.join(directoryPath, folderName);

    // Load the docx file as binary content
    var content = fs.readFileSync(
      path.resolve(
        __dirname,
        path.join(templatesFolder, `${templateName}.docx`)
      ),
      "binary"
    );

    let zip = new PizZip(content);
    let doc;
    doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
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

    const folder = await ipcRenderer.invoke("folderDialog");

    try {
      const wordFile = await writeFile(
        path.resolve(
          folder.filePaths[0],
          `${templateName} ${dataRow.values[firstValidColumn]}.docx`
        ),
        buf
      );

      return [wordFile];
    } catch (e) {
      console.log(e);
    }
  }
};

const openFile = async (item) => {
  try {
    const path = await item;
    await shell.openPath(path);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  writeFiles,
  saveFiles,
  savePDFFiles,
  getFileNameFromPath,
  readFile,
  openFile,
  savePreviewPDF,
  savePreviewDOCX,
  getFirstValidRow,
  getFirstValidColumn
};
