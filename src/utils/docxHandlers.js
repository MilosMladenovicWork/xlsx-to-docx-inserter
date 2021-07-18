const fs = require("fs");
const path = require("path");
const { ipcRenderer } = require("electron");

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

module.exports = {
  uploadDOCX,
  deleteDOCX,
};
