import * as fs from "fs";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import Excel from "exceljs";

import * as path from "path";
import { ipcRenderer } from "electron";

const writeDummy = async () => {
  fs.writeFile("mynewfile3.txt", "Hello content!", function (err) {
    if (err) throw err;
    console.log("Saved!");
  });
};

function errorHandler(error: any) {
  console.log(JSON.stringify({ error: error }));

  if (error.properties && error.properties.errors instanceof Array) {
    const errorMessages = error.properties.errors
      .map(function (error: any) {
        return error.properties.explanation;
      })
      .join("\n");
    console.log("errorMessages", errorMessages);
  }
  throw error;
}

type ColumnNames =
  | (Excel.CellValue[] & {
      [key: string]: string | undefined;
    })
  | (Excel.CellValue[] & {
      [key: number]: string | undefined;
    })
  | [];

const handleWorkbook = async function (
  workbook: Excel.Workbook,
  replaceData: {
    [key: string]: Excel.CellValue | undefined;
  },
  folder: string,
  fileName: string,
  templateName: string
) {
  var worksheet = workbook.getWorksheet(0);
  let firstValidColumn: number;
  let firstValidRow: number;
  let columnNames: ColumnNames = [];

  const filesToWrite: Promise<unknown>[] = [];

  worksheet.eachRow({ includeEmpty: true }, async function (row, rowNumber) {
    const rowValues = row.values as ColumnNames;

    if (firstValidColumn) {
      firstValidColumn = rowValues.findIndex((value) => value != null);
    }
    if (firstValidRow === undefined) {
      if (rowValues.some((value) => value != null)) {
        firstValidRow = rowNumber;
      }
    }
    if (firstValidRow === rowNumber) {
      columnNames = rowValues;
      const nonNullCells = rowValues.filter((cell) => cell != null);
      nonNullCells.forEach((cell) => (replaceData[cell as string] = undefined));
    }
    if (firstValidRow < rowNumber) {
      rowValues.forEach((cell, index) => {
        const columnValue = columnNames[index];
        if (index >= firstValidColumn && columnValue !== undefined) {
          replaceData[columnValue as string] = cell;
        }
      });

      // Load the docx file as binary content
      var content = fs.readFileSync(
        path.resolve(__dirname, `../../templates/${templateName}.docx`),
        "binary"
      );

      let zip = new PizZip(content);
      let doc;
      try {
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
        const writtenFile = writeFile(
          path.resolve(
            folder,
            `${fileName} ${rowValues[firstValidColumn]}.docx`
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

const writeFile = (path: string, data: string | NodeJS.ArrayBufferView) =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, data, (error) => {
      if (error) reject(error);

      resolve(path);
    });
  });

const writeFiles = async (
  filesPath: string[],
  folder: string,
  templateName: string
) => {
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
      return Promise.all([...files]);
    } catch (e) {
      console.log(e);
      return e;
    }
  }
};

const saveFiles = async (filePaths: string[], templateToUse: string) => {
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
      console.log(files);
      resolve(files.map((file) => path.parse(file).name));
    });
  });

const uploadDOCX = async () => {
  const files: string[] = await ipcRenderer.invoke("uploadDOCX");
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

const getFileNameFromPath = (filePath: string) => {
  return path.parse(filePath).name;
};

const deleteDOCX = (fileName: string) => {
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
