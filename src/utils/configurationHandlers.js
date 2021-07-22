const { ipcRenderer } = require("electron");
const path = require("path");
const { writeFile } = require("./fileHandlers");
const fs = require("fs");

const createConfiguration = (host, port, secure, auth) => {
  return JSON.stringify({
    host,
    port,
    secure,
    auth,
  });
};

const getConfigurationFolderPath = async () => {
  const directoryPath = await ipcRenderer.invoke("getAppDataDirectory");
  const folderName = "settings";

  const configurationFolder = path.join(directoryPath, folderName);

  return configurationFolder;
};

const saveConfiguration = async (jsonConfiguration) => {
  const configurationFolderPath = await getConfigurationFolderPath();

  if (!fs.existsSync(configurationFolderPath)) {
    fs.mkdirSync(configurationFolderPath, {
      recursive: true,
    });
  }

  const configurationPath = await writeFile(
    path.join(configurationFolderPath, "index.json"),
    jsonConfiguration
  );

  return configurationPath;
};

const getConfiguration = async () => {
  const configurationFolderPath = await getConfigurationFolderPath();

  if (!fs.existsSync(configurationFolderPath)) {
    fs.mkdirSync(configurationFolderPath, {
      recursive: true,
    });
  }

  const getFilePath = async () =>
    new Promise((resolve, reject) => {
      fs.readdir(configurationFolderPath, function (err, files) {
        //handling error
        if (err) {
          reject(err);
          console.log("Unable to scan directory: " + err);
        }
        const fileNames = files.map((file) => path.parse(file).name);

        let filePath;

        if (fileNames.findIndex((fileName) => fileName === "index") !== -1) {
          filePath = path.join(configurationFolderPath, "index.json");
        }

        resolve(filePath);
      });
    });

  return getFilePath();
};

module.exports = {
  createConfiguration,
  saveConfiguration,
  getConfiguration,
};
