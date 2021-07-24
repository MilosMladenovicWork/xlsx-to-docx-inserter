const {
  previewEmail: previewEmailFunction,
} = require("../../utils/emailHandlers");
const path = require("path");
const { ipcRenderer } = require("electron");

jest.mock("preview-email");
const previewEmailPackage = require("preview-email");

const email = {
  from: "Company {Partner} <company@company.com>",
  to: "{Email}",
  subject: "Subject for {Naziv proizvoda}",
  text: "emailTextTemplate",
  html: "emailHTMLTemplate",
  xlsx: path.resolve(
    __dirname,
    "../fixtures/Baza podataka primer - email.xlsx"
  ),
};

test("preview email is created", async () => {
  expect.assertions(1);
  ipcRenderer.invoke.mockResolvedValue(path.resolve(__dirname, "../fixtures"));
  previewEmailPackage.mockImplementation(() => undefined);

  try {
    const mail = await previewEmailFunction(
      email.from,
      email.to,
      email.subject,
      email.text,
      email.html,
      email.xlsx
    );

    expect(mail).toStrictEqual({
      from: "Company Tehnomedia  <company@company.com>",
      html: `<html><p>milos.handstand.mladenovic@gmail.com</p><b>Test</b></html>`,
      subject: "Subject for Veš mašina",
      text: `milos.handstand.mladenovic@gmail.com Test`,
      to: "milos.handstand.mladenovic@gmail.com",
    });
  } catch (e) {
    console.log(e);
  }
});
