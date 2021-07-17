const Excel = require("exceljs");
const RegexParser = require("regex-parser");

const path = require("path");

const checkXLSX = async (filesPath, cellRegexes) => {
  const workbook = new Excel.Workbook();

  const statuses = [];

  for (const filePath of filesPath) {
    const fileName = path.parse(filePath).name;
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet();

    let firstValidColumn;
    let firstValidRow;
    let filledColumnsIndexes = [];

    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      const rowValues = row.values;

      checkXLSXColumnWithRegex(cellRegexes, row, rowNumber, statuses);

      if (firstValidColumn === undefined) {
        const indexOfValidColumn = rowValues.findIndex(
          (value) => value != null
        );
        if (indexOfValidColumn !== -1) {
          firstValidColumn = indexOfValidColumn;

          // make array of column indexes to compare with other rows arrays
          row.eachCell((cell, columnNum) => {
            filledColumnsIndexes.push(columnNum);
          });
        }
      }
      if (firstValidRow === undefined) {
        if (rowValues.some((value) => value != null)) {
          firstValidRow = rowNumber;
        }
      }

      if (firstValidColumn !== undefined && firstValidRow !== undefined) {
        const columnsWithValue = [];
        row.eachCell((cell, columnNum) => {
          columnsWithValue.push(columnNum);
        });

        const columnsWithoutValue = filledColumnsIndexes.filter(
          (value) => !columnsWithValue.includes(value)
        );

        columnsWithoutValue.forEach((columnWithoutValue) =>
          statuses.push({
            label: "No data in cell",
            valid: false,
            message: `No data present at column ${columnWithoutValue} on row ${rowNumber}! Please ensure that data is present.`,
          })
        );
      }
    });

    if (firstValidColumn === undefined || firstValidRow === undefined) {
      statuses.push({
        label: fileName,
        valid: false,
        message: "No valid rows or columns found! Check your excel file.",
      });
    }

    if (statuses.length === 0) {
      statuses.push({
        label: "Valid XLSX file",
        valid: true,
        message: "File you uploaded is valid. You can proceed.",
      });
    }

    return statuses;
  }
};

const checkXLSXColumnWithRegex = (cellRegexes, row, rowNum, statuses) => {
  // cellRegex array of objects that has keys columnNum and regex
  if (cellRegexes && cellRegexes.length > 0) {
    row.eachCell((cell, columnNum) => {
      cellRegexes.forEach((cellReg) => {
        console.log(columnNum, cellReg.colNum);
        if (columnNum === cellReg.colNum) {
          const validData = RegexParser(cellReg.regex).test(cell.text);
          if (!validData) {
            statuses.push({
              label: rowNum + "Not valid cell data.",
              valid: false,
              message: `Data in cell at row ${rowNum} in column ${columnNum} is not valid according to regex ${cellReg.regex}`,
            });
          }
        }
      });
    });
  }
};

module.exports = {
  checkXLSX,
  checkXLSXColumnWithRegex,
};
