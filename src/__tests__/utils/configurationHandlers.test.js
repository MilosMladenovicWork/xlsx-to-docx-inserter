const {
  createConfiguration,
  saveConfiguration,
  getConfiguration,
} = require("../../utils/configurationHandlers");
const { ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");

const settingsPath =
  "C:\\Users\\G7\\Documents\\Development\\xlsx-to-docx-inserter\\settings\\index.json";

test("create configuration creates configuration", () => {
  expect(
    createConfiguration("ethereal", "smtp.ethereal.email", 587, false, {
      user: "user",
      pass: "pass",
    })
  ).toBe(
    '{"service":"ethereal","host":"smtp.ethereal.email","port":587,"secure":false,"auth":{"user":"user","pass":"pass"}}'
  );
});

test("save configuration saves configuration", async () => {
  ipcRenderer.invoke.mockResolvedValue(path.join(__dirname, "../../../"));
  const configuration = createConfiguration("smtp.ethereal.email", 587, false, {
    user: "user",
    pass: "pass",
  });

  await expect(saveConfiguration(configuration)).resolves.toEqual(settingsPath);

  expect.assertions(1);
});

test("get configuration returns path", async () => {
  ipcRenderer.invoke.mockResolvedValue(path.join(__dirname, "../../../"));

  await expect(getConfiguration()).resolves.toEqual(path.join(settingsPath));

  expect.assertions(1);
  await fs.rm(path.join(__dirname, "../../../settings"), { recursive: true });
});
