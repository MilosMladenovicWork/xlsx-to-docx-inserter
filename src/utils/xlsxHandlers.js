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

// TODO: make this function work on its own for check columns functionality
const checkXLSXRowColumnWithRegex = (cellRegexes, row, rowNum, statuses) => {
  // cellRegex array of objects that has keys columnNum and regex
  if (cellRegexes && cellRegexes.length > 0) {
    row.eachCell((cell, columnNum) => {
      cellRegexes.forEach((cellReg) => {
        if (columnNum === cellReg.colNum) {
          const validData = RegexParser(cellReg.regex).test(cell.text);
          if (!validData) {
            statuses.push({
              label: "Not valid cell data.",
              valid: false,
              message: `Data in cell at row ${rowNum} in column ${columnNum} is not valid according to regex ${cellReg.regex}`,
            });
          }
        }
      });
    });
  }
};

const checkXLSXColumnsWithRegex = async (filesPath, cellRegexes) => {
  const workbook = new Excel.Workbook();

  const statuses = [];

  for (const filePath of filesPath) {
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet();

    let firstValidRow;
    let firstValidColumn;

    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      const rowValues = row.values;

      if (firstValidRow !== undefined && firstValidColumn !== undefined) {
        checkXLSXRowColumnWithRegex(cellRegexes, row, rowNumber, statuses);
      }

      if (firstValidColumn === undefined) {
        const indexOfValidColumn = rowValues.findIndex(
          (value) => value != null
        );
        if (indexOfValidColumn !== -1) {
          firstValidColumn = indexOfValidColumn;
        }
      }

      if (firstValidRow === undefined) {
        if (rowValues.some((value) => value != null)) {
          firstValidRow = rowNumber;
        }
      }
    });
  }

  if (statuses.length === 0) {
    statuses.push({
      label: "Valid data in columns",
      valid: true,
      message: "Data in specified columns matches specified regexes!",
    });
  }

  return statuses;
};

const getXLSXColumnNames = async (filesPath) => {
  const workbook = new Excel.Workbook();

  let columns = [];

  for (const filePath of filesPath) {
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet();

    let firstValidColumn;
    let firstValidRow;

    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      const rowValues = row.values;

      if (firstValidColumn === undefined) {
        const indexOfValidColumn = rowValues.findIndex(
          (value) => value != null
        );
        if (indexOfValidColumn !== -1) {
          firstValidColumn = indexOfValidColumn;

          // make array of column indexes to compare with other rows arrays
          row.eachCell((cell, columnNum) => {
            columns.push({ name: cell.text, colNum: columnNum });
          });
        }
      }
      if (firstValidRow === undefined) {
        if (rowValues.some((value) => value != null)) {
          firstValidRow = rowNumber;
        }
      }
    });
  }

  return columns;
};

module.exports = {
  checkXLSX,
  checkXLSXRowColumnWithRegex,
  checkXLSXColumnsWithRegex,
  getXLSXColumnNames,
};
