const fs = require("fs");
const path = require("path");

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


  module.exports = {
    getUploadedTemplates,
  };
  