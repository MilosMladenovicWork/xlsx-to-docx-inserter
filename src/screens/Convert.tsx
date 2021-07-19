import { Grid, Snackbar, SnackbarCloseReason } from "@material-ui/core";
import { Alert, Color } from "@material-ui/lab";
import { useEffect, useState } from "react";
import { useUploadedTemplates } from "./UploadTemplates";

import UploadXSLX from "../sections/UploadXSLX";
import CheckData from "../sections/CheckData";
import AvailableColumns from "../sections/AvailableColumns";
import ChooseTemplate from "../sections/ChooseTemplate";
import SavePDF from "../sections/SavePDF";
import SaveWordFiles from "../sections/SaveWordFiles";
import StatusLogger from "./components/StatusLogger";

export interface StatusType {
  label: string;
  valid: boolean;
  message?: string;
}

// TODO: check if functions can be moved better
// TODO: check if some states can be moved in components

const Convert = () => {
  const [uploadedFiles, setUploadedFiles] = useState<[] | string[]>([]);
  const [XLSXUploadStatuses, setXLSXUploadStatuses] = useState<StatusType[]>(
    []
  );
  const [xlsxColumnNames, setXLSXColumnNames] = useState<
    { name: string; colNum: number }[]
  >([]);
  const [cellRegexes, setCellRegexes] = useState<
    { id?: string; regex?: string; colNum: number | undefined }[]
  >([{ id: undefined, regex: undefined, colNum: undefined }]);
  const [checkXLSXColumnsStatuses, setCheckXLSXColumnsStatuses] = useState<
    StatusType[]
  >([]);
  const [checkingXLSXColumns, setCheckingXLSXColumns] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [fileWrittingStatus, setFileWrittingStatus] = useState<{
    severity: Color | undefined;
    message: string | undefined;
  }>({
    severity: undefined,
    message: undefined,
  });
  const [generatingDOCX, setGeneratingDOCX] = useState(false);
  const [docxPlaceholders, setDocxPlaceholders] = useState<string[]>([]);
  const [savedDOCXFiles, setSavedDOCXFiles] = useState([]);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [savedPDFFiles, setSavedPDFFiles] = useState([]);

  const [uploadedTemplates, setUploadedTemplates] = useUploadedTemplates();

  const handleSnackbarClose = (
    event: React.SyntheticEvent<any, Event>,
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };

  const onUploadHandler = async () => {
    const files: string[] = await window.electron.ipcRenderer.invoke(
      "uploadXLSX"
    );

    const xlsxStatuses: StatusType[] = await window.electron.checkXLSX(files);

    setXLSXUploadStatuses(xlsxStatuses);
    // const files = await window.electron.ipcRenderer.invoke("uploadXLSX");
    setUploadedFiles((prevState) => [...new Set([...prevState, ...files])]);
  };

  const removeUploadedFile = (file: string) => {
    setUploadedFiles((prevState) =>
      prevState.filter((filePath) => filePath !== file)
    );
  };

  const handleCheckXLSXColumns = async () => {
    setCheckingXLSXColumns(true);

    const checkXLSXColumnsStatuses =
      await window.electron.checkXLSXColumnsWithRegex(
        uploadedFiles,
        cellRegexes
      );

    setCheckXLSXColumnsStatuses(checkXLSXColumnsStatuses);

    setCheckingXLSXColumns(false);
  };

  const handleSelectedTemplate = async (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    const placeholders = await window.electron.getDOCXPlaceholders(
      event.target.value
    );

    setDocxPlaceholders(placeholders);

    const docxStatuses = await window.electron.checkDOCXPlaceholders(
      placeholders,
      xlsxColumnNames.map((column) => column.name)
    );

    setSelectedTemplateStatuses(docxStatuses);

    setSelectedTemplate(event.target.value as string);
  };

  useEffect(() => {
    const setColumnNames = async () => {
      const columnNames = await window.electron.getXLSXColumnNames(
        uploadedFiles
      );
      setXLSXColumnNames(columnNames);
    };

    setColumnNames();
  }, [uploadedFiles]);

  const handleColumnSelection = (
    e: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    const targetName = e.target.name as string;
    const targetValue = e.target.value as number;
    const stateIndex = cellRegexes.findIndex((item) => item.id === targetName);
    if (stateIndex !== -1) {
      setCellRegexes((prevState) => {
        const newState = [...prevState];
        newState[stateIndex].colNum = targetValue;
        return newState;
      });
    } else {
      setCellRegexes((prevState) => {
        const newState = [
          ...prevState,
          { id: targetName, regex: undefined, colNum: targetValue },
        ];
        return newState;
      });
    }
  };

  return (
    <>
      <Grid container spacing={4}>
        <Grid item container direction="column" xs={12} spacing={2}>
          <UploadXSLX
            title="Upload data"
            uploadedFiles={uploadedFiles}
            removeUploadedFile={removeUploadedFile}
            onUploadHandler={onUploadHandler}
            isOpen={uploadedFiles.length > 0}
          />
          <AvailableColumns
            isOpen={uploadedFiles.length > 0}
            xlsxColumnNames={xlsxColumnNames}
          />
          <CheckData
            cellRegexes={cellRegexes}
            setCellRegexes={setCellRegexes}
            handleColumnSelection={handleColumnSelection}
            xlsxColumnNames={xlsxColumnNames}
            checkingXLSXColumns={checkingXLSXColumns}
            handleCheckXLSXColumns={handleCheckXLSXColumns}
            isOpen={uploadedFiles.length > 0}
          />
        </Grid>
        <Grid container item xs={12} direction="column" spacing={2}>
          <ChooseTemplate
            title="Choose template"
            handleSelectedTemplate={handleSelectedTemplate}
            selectedTemplate={selectedTemplate}
            uploadedTemplates={uploadedTemplates}
            isOpen={!!uploadedTemplates.length && uploadedFiles.length > 0}
          />

          <SaveWordFiles
            generatingDOCX={generatingDOCX}
            setGeneratingDOCX={setGeneratingDOCX}
            setSavedDOCXFiles={setSavedDOCXFiles}
            setFileWrittingStatus={setFileWrittingStatus}
            setSnackbarOpen={setSnackbarOpen}
            uploadedFiles={uploadedFiles}
            selectedTemplate={selectedTemplate}
            // TODO: Update this condition with better check if template is chosen
            isOpen={!!selectedTemplate && uploadedFiles.length > 0}
          />
          <SavePDF
            generatingPDF={generatingPDF}
            setGeneratingPDF={setGeneratingPDF}
            setSavedPDFFiles={setSavedPDFFiles}
            setFileWrittingStatus={setFileWrittingStatus}
            setSnackbarOpen={setSnackbarOpen}
            savedDOCXFiles={savedDOCXFiles}
            // TODO: Update this condition with better check if template is chosen
            isOpen={!!selectedTemplate && uploadedFiles.length > 0}
          />
        </Grid>
        {uploadedFiles.length > 0 && selectedTemplate && (
          <Grid container item xs={12} direction="column" spacing={2}>
            <Grid item>
              <div className={classes.wrapper}>
                <Button
                  variant="contained"
                  disabled={generatingPDF}
                  onClick={async () => {
                    setGeneratingPDF(true);
                    let savedFiles = await window.electron.savePDFFiles(
                      savedDOCXFiles
                    );
                    setGeneratingPDF(false);
                    if (savedFiles && savedFiles.length > 0) {
                      setSavedPDFFiles(savedFiles);
                      setFileWrittingStatus({
                        severity: "success",
                        message: `${savedFiles.length} files successfully saved`,
                      });
                      setSnackbarOpen(false);
                      setSnackbarOpen(true);
                    }
                  }}
                  color="secondary"
                  component="label"
                  startIcon={<Save />}
                >
                  Save PDF Files
                </Button>
                {generatingPDF && (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                )}
              </div>
            </Grid>
          </Grid>
        )}
        <Button
          onClick={async () => {
            await window.electron.openFile(savedPDFFiles[0]);
          }}
        >
          Preview PDF
        </Button>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert severity={fileWrittingStatus.severity}>
            {fileWrittingStatus.message}
          </Alert>
        </Snackbar>
      </Grid>
      <StatusLogger XLSXUploadStatuses={XLSXUploadStatuses} />
    </>
  );
};

export default Convert;
