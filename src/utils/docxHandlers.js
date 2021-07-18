const fs = require("fs");
const path = require("path");
const { ipcRenderer } = require("electron");

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
        fs.unlink(path.join(directoryPath, fileToDelete), (err) => {
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
