const fs = require("fs");
const path = require("path");
const { ipcRenderer } = require("electron");

const getUploadedTemplates = async () =>
  new Promise(async (resolve, reject) => {
    //joining path of directory
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
      resolve(files.map((file) => path.parse(file).name));
    });
  });


  module.exports = {
    getUploadedTemplates,
  };
  