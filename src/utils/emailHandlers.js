const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { ipcRenderer } = require("electron");
const previewEmailPackage = require("preview-email");

const {
  readFile,
  getFirstValidColumn,
  getFirstValidRow,
} = require("./fileHandlers");
const Excel = require("exceljs");
const RegexParser = require("regex-parser");
const { getConfigurationJSON } = require("./configurationHandlers");

const previewEmail = async (
  emailFrom,
  emailTo,
  emailSubject,
  selectedEmailTextTemplate,
  selectedEmailHTMLTemplate,
  xlsxFile
) => {
  try {
    const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
    const emailTextFolderName = "emailTextTemplates";

    const emailTextTemplatesFolder = path.join(
      directoryPath,
      emailTextFolderName
    );

    const text = await readFile(
      path.join(emailTextTemplatesFolder, selectedEmailTextTemplate + ".txt"),
      "utf8"
    );

    const emailHTMLFolderName = "emailHTMLTemplates";

    const emailHTMLTemplatesFolder = path.join(
      directoryPath,
      emailHTMLFolderName
    );

    const html = await readFile(
      path.join(emailHTMLTemplatesFolder, selectedEmailHTMLTemplate + ".html"),
      "utf8"
    );

    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(xlsxFile);
    const worksheet = workbook.getWorksheet();
    let firstValidColumn = await getFirstValidColumn(xlsxFile);
    let firstValidRow = await getFirstValidRow(xlsxFile);

    const columnNames = worksheet.getRow(firstValidRow).values;
    const firstRowWithData = worksheet.getRow(firstValidRow + 1).values;

    const emailText = await replaceEmailTemplatePlaceholders(
      text,
      firstRowWithData,
      firstValidColumn,
      columnNames
    );
    const htmlText = await replaceEmailTemplatePlaceholders(
      html,
      firstRowWithData,
      firstValidColumn,
      columnNames
    );
    const emailFromProcessed = await replaceEmailTemplatePlaceholders(
      emailFrom,
      firstRowWithData,
      firstValidColumn,
      columnNames
    );
    const emailToProcessed = await replaceEmailTemplatePlaceholders(
      emailTo,
      firstRowWithData,
      firstValidColumn,
      columnNames
    );
    const emailSubjectProcessed = await replaceEmailTemplatePlaceholders(
      emailSubject,
      firstRowWithData,
      firstValidColumn,
      columnNames
    );

    const message = {
      from: emailFromProcessed, // sender address
      to: emailToProcessed, // list of receivers
      subject: emailSubjectProcessed, // Subject line
      text: emailText, // plain text body
      html: htmlText, // html body
    };

    previewEmailPackage(message);

    return message;
  } catch (e) {
    console.log(e);
  }
};

const sendEmails = async (
  emailFrom,
  emailTo,
  emailSubject,
  selectedEmailTextTemplate,
  selectedEmailHTMLTemplate,
  xlsxFile,
  pdfPaths
) => {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(xlsxFile);
  const worksheet = workbook.getWorksheet();

  let firstValidColumn;
  let firstValidRow;
  let columnNames;

  let replaceData = {};

  const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
  const emailTextFolderName = "emailTextTemplates";

  const emailTextTemplatesFolder = path.join(
    directoryPath,
    emailTextFolderName
  );

  const text = await readFile(
    path.join(emailTextTemplatesFolder, selectedEmailTextTemplate + ".txt"),
    "utf8"
  );

  const emailHTMLFolderName = "emailHTMLTemplates";

  const emailHTMLTemplatesFolder = path.join(
    directoryPath,
    emailHTMLFolderName
  );

  const html = await readFile(
    path.join(emailHTMLTemplatesFolder, selectedEmailHTMLTemplate + ".html"),
    "utf8"
  );

  const emailStatuses = [];

  worksheet.eachRow(function (row, rowNumber) {
    const rowValues = row.values;

    let pdfPath;

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

      pdfPath = pdfPaths.find((path) =>
        path.includes(rowValues[firstValidColumn])
      );

      const sendMail = async () => {
        const emailText = await replaceEmailTemplatePlaceholders(
          text,
          rowValues,
          firstValidColumn,
          columnNames
        );
        const htmlText = await replaceEmailTemplatePlaceholders(
          html,
          rowValues,
          firstValidColumn,
          columnNames
        );
        const emailFromProcessed = await replaceEmailTemplatePlaceholders(
          emailFrom,
          rowValues,
          firstValidColumn,
          columnNames
        );
        const emailToProcessed = await replaceEmailTemplatePlaceholders(
          emailTo,
          rowValues,
          firstValidColumn,
          columnNames
        );
        const emailSubjectProcessed = await replaceEmailTemplatePlaceholders(
          emailSubject,
          rowValues,
          firstValidColumn,
          columnNames
        );

        const message = {
          from: emailFromProcessed, // sender address
          to: emailToProcessed, // list of receivers
          subject: emailSubjectProcessed, // Subject line
          text: emailText, // plain text body
          html: htmlText, // html body
          attachments: [
            {
              filename: path.basename(pdfPath),
              path: pdfPath,
              contentType: "application/pdf",
            },
          ],
        };

        previewEmailPackage(message);

        const configurationJSON = await getConfigurationJSON();

        if (configurationJSON !== undefined) {
          const {
            service,
            host,
            port,
            secure,
            auth: { user, pass },
          } = JSON.parse(configurationJSON);
          console.log(JSON.parse(configurationJSON));
          let transporter = nodemailer.createTransport({
            service,
            host,
            port: port === 0 ? undefined : port,
            secure, // true for 465, false for other ports
            auth: {
              user, // generated ethereal user
              pass, // generated ethereal password
            },
          });

          // send mail with defined transport object
          return transporter.sendMail(message);
        }
      };

      emailStatuses.push(sendMail());
    }
  });
  try {
    return Promise.all(emailStatuses);
  } catch (e) {
    console.log(e);
  }
};

const replaceEmailTemplatePlaceholders = (
  placeholderFile,
  rowValues,
  firstValidColumn,
  columnNames
) => {
  let replaceData = {};

  rowValues.forEach((cell, index) => {
    const columnValue = columnNames[index];
    if (index >= firstValidColumn && columnValue !== undefined) {
      replaceData[columnValue] = cell.text ?? cell;
    }
  });

  let file = placeholderFile;

  Object.keys(replaceData).forEach((columnName) => {
    file = file.replace(
      RegexParser(`/{${columnName}}/g`),
      replaceData[columnName]
    );
  });

  try {
    return file;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

const uploadEmailHTML = async () => {
  const files = await ipcRenderer.invoke("uploadEmailHTML");
  return new Promise(async (resolve, reject) => {
    //joining path of directory
    const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
    const folderName = "emailHTMLTemplates";

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

const deleteEmailHTML = (fileName) => {
  return new Promise(async (resolve, reject) => {
    const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
    const folderName = "emailHTMLTemplates";

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

const uploadEmailText = async () => {
  const files = await ipcRenderer.invoke("uploadEmailText");
  return new Promise(async (resolve, reject) => {
    //joining path of directory
    const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
    const folderName = "emailTextTemplates";

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

const deleteEmailText = (fileName) => {
  return new Promise(async (resolve, reject) => {
    const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
    const folderName = "emailTextTemplates";

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

const getEmailHTMLTemplates = async () =>
  new Promise(async (resolve, reject) => {
    //joining path of directory
    const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
    const folderName = "emailHTMLTemplates";

    const templatesFolder = path.join(directoryPath, folderName);

    //passsing directoryPath and callback function
    fs.readdir(templatesFolder, function (err, files) {
      //handling error
      if (err) {
        console.log("Unable to scan directory: " + err);
        return reject();
      }
      resolve(files.map((file) => path.parse(file).name));
    });
  });

const getEmailTextTemplates = async () =>
  new Promise(async (resolve, reject) => {
    //joining path of directory
    const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
    const folderName = "emailTextTemplates";

    const templatesFolder = path.join(directoryPath, folderName);

    //passsing directoryPath and callback function
    fs.readdir(templatesFolder, function (err, files) {
      //handling error
      if (err) {
        console.log("Unable to scan directory: " + err);
        return reject();
      }
      resolve(files.map((file) => path.parse(file).name));
    });
  });

module.exports = {
  previewEmail,
  uploadEmailText,
  deleteEmailText,
  uploadEmailHTML,
  deleteEmailHTML,
  getEmailHTMLTemplates,
  getEmailTextTemplates,
  sendEmails,
};
