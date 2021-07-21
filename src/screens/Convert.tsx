import {
  Grid,
  Snackbar,
  SnackbarCloseReason,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Input,
} from "@material-ui/core";
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
import AvailablePlaceholders from "../sections/AvailablePlaceholders";

export interface StatusType {
  label: string;
  valid: boolean;
  message?: string;
}

export const useEmailTextTemplates = (): [
  string[],
  React.Dispatch<React.SetStateAction<string[]>>
] => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  useEffect(() => {
    const getUploadedTemplates = async () => {
      const templates = await window.electron.getEmailTextTemplates();
      setUploadedFiles(templates);
    };
    getUploadedTemplates();
  }, []);

  return [uploadedFiles, setUploadedFiles];
};

export const useEmailHTMLTemplates = (): [
  string[],
  React.Dispatch<React.SetStateAction<string[]>>
] => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  useEffect(() => {
    const getUploadedTemplates = async () => {
      const templates = await window.electron.getEmailHTMLTemplates();
      setUploadedFiles(templates);
    };
    getUploadedTemplates();
  }, []);

  return [uploadedFiles, setUploadedFiles];
};

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
  const [selectedTemplateStatuses, setSelectedTemplateStatuses] = useState<
    StatusType[]
  >([]);
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
  const [generatingPreviewPDF, setGeneratingPreviewPDF] = useState(false);
  const [savedPDFFiles, setSavedPDFFiles] = useState([]);

  const [uploadedTemplates, setUploadedTemplates] = useUploadedTemplates();
  const [emailTextTemplates, setEmailTextTemplates] = useEmailTextTemplates();
  const [emailHTMLTemplates, setEmailHTMLTemplates] = useEmailHTMLTemplates();

  const [emailFrom, setEmailFrom] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");

  const [selectedEmailTextTemplate, setSelectedEmailTextTemplate] =
    useState("");
  const [selectedEmailHTMLTemplate, setSelectedEmailHTMLTemplate] =
    useState("");

  const handleEmailFrom: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setEmailFrom(e.target.value);
  };

  const handleEmailTo: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setEmailTo(e.target.value);
  };

  const handleEmailSubject: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    setEmailSubject(e.target.value);
  };

  const handleEmailTextTemplate = (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    setSelectedEmailTextTemplate(event.target.value as string);
  };

  const handleEmailHTMLTemplate = (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    setSelectedEmailHTMLTemplate(event.target.value as string);
  };

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

    try {
      const checkXLSXColumnsStatuses =
        await window.electron.checkXLSXColumnsWithRegex(
          uploadedFiles,
          cellRegexes
        );

      setCheckXLSXColumnsStatuses(checkXLSXColumnsStatuses);
    } catch (e) {
      console.log(e);
    }

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
      <Grid container direction="column" sm>
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
        <ChooseTemplate
          title="Choose template"
          handleSelectedTemplate={handleSelectedTemplate}
          selectedTemplate={selectedTemplate}
          uploadedTemplates={uploadedTemplates}
          isOpen={!!uploadedTemplates.length && uploadedFiles.length > 0}
        />
        <AvailablePlaceholders
          docxPlaceholders={docxPlaceholders}
          isOpen={docxPlaceholders && docxPlaceholders.length > 0}
        />
        <SaveWordFiles
          generatingDOCX={generatingDOCX}
          setGeneratingDOCX={setGeneratingDOCX}
          setSavedDOCXFiles={setSavedDOCXFiles}
          setFileWrittingStatus={setFileWrittingStatus}
          setSnackbarOpen={setSnackbarOpen}
          uploadedFiles={uploadedFiles}
          selectedTemplate={selectedTemplate}
          isOpen={!!selectedTemplate && uploadedFiles.length > 0}
        />
        <SavePDF
          generatingPDF={generatingPDF}
          setGeneratingPDF={setGeneratingPDF}
          generatingPreviewPDF={generatingPreviewPDF}
          setGeneratingPreviewPDF={setGeneratingPreviewPDF}
          setSavedPDFFiles={setSavedPDFFiles}
          setFileWrittingStatus={setFileWrittingStatus}
          setSnackbarOpen={setSnackbarOpen}
          savedDOCXFiles={savedDOCXFiles}
          isOpen={
            !!selectedTemplate &&
            savedDOCXFiles.length > 0 &&
            uploadedFiles.length > 0
          }
        />
        {xlsxColumnNames && savedPDFFiles && savedPDFFiles.length > 0 && (
          <>
            <Typography>
              Use {} with column name between to insert data from that column
            </Typography>
            <FormControl>
              <InputLabel>Email from</InputLabel>
              <Input name="emailFrom" onChange={handleEmailFrom} />
            </FormControl>
            <FormControl>
              <InputLabel>Email to</InputLabel>
              <Input name="emailTo" onChange={handleEmailTo} />
            </FormControl>
            <FormControl>
              <InputLabel>Email from</InputLabel>
              <Input name="emailSubject" onChange={handleEmailSubject} />
            </FormControl>
            <FormControl>
              <InputLabel>Email text template</InputLabel>
              <Select
                onChange={handleEmailTextTemplate}
                value={selectedEmailTextTemplate}
              >
                {emailTextTemplates.map((name) => (
                  <MenuItem value={name} key={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Email html template</InputLabel>
              <Select
                onChange={handleEmailHTMLTemplate}
                value={selectedEmailHTMLTemplate}
              >
                {emailHTMLTemplates.map((name) => (
                  <MenuItem value={name} key={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
        {xlsxColumnNames &&
          savedPDFFiles &&
          savedPDFFiles.length > 0 &&
          emailFrom &&
          emailTo &&
          emailSubject &&
          selectedEmailTextTemplate &&
          selectedEmailTextTemplate && (
            <>
              <Button
                variant="contained"
                onClick={async () =>
                  await window.electron.previewEmail(
                    emailFrom,
                    emailTo,
                    emailSubject,
                    selectedEmailTextTemplate,
                    selectedEmailHTMLTemplate,
                    uploadedFiles[0]
                  )
                }
              >
                Preview emails
              </Button>
            </>
          )}
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
      <StatusLogger
        XLSXUploadStatuses={XLSXUploadStatuses}
        checkXLSXColumnsStatuses={checkXLSXColumnsStatuses}
        selectedTemplateStatuses={selectedTemplateStatuses}
        setCheckXLSXColumnsStatuses={setCheckXLSXColumnsStatuses}
      />
    </>
  );
};

export default Convert;
