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
  CircularProgress,
  makeStyles,
} from "@material-ui/core";
import { Alert, Color } from "@material-ui/lab";
import { useEffect, useState } from "react";
import { useUploadedTemplates } from "./UploadTemplates";
import clsx from 'clsx';

import UploadXSLX from "../sections/UploadXSLX";
import CheckData from "../sections/CheckData";
import AvailableColumns from "../sections/AvailableColumns";
import ChooseTemplate from "../sections/ChooseTemplate";
import SavePDF from "../sections/SavePDF";
import SaveWordFiles from "../sections/SaveWordFiles";
import StatusLogger from "./components/StatusLogger";
import AvailablePlaceholders from "../sections/AvailablePlaceholders";
import { Email, Visibility } from "@material-ui/icons";

export interface StatusType {
  label: string;
  valid: boolean | "warning";
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

const useStyles = makeStyles(
  (theme) => ({
    wrapper: {
      position: "relative",
      display: "inline",
    },
    buttonProgress: {
      color: theme.palette.secondary.main,
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12,
    },
    content: {
      width: "calc(100% - 272px)",
    }
  }),
  { name: "Convert" }
);

const Convert = () => {
  const classes = useStyles();

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

  const [uploadedTemplates] = useUploadedTemplates();
  const [emailTextTemplates] = useEmailTextTemplates();
  const [emailHTMLTemplates] = useEmailHTMLTemplates();

  const [emailFrom, setEmailFrom] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");

  const [selectedEmailTextTemplate, setSelectedEmailTextTemplate] =
    useState("");
  const [selectedEmailHTMLTemplate, setSelectedEmailHTMLTemplate] =
    useState("");
  const [sendingEmails, setSendingEmails] = useState(false);
  const [receivedEmailStatuses, setReceivedEmailStatuses] = useState<
    StatusType[]
  >([]);

  const [uploadedDOCXTemplatesStatuses, setUploadedDOCXTemplatesStatuses] =
    useState<StatusType[]>([]);

  const [
    uploadedEmailTextTemplatesStatuses,
    setUploadedEmailTextTemplatesStatuses,
  ] = useState<StatusType[]>([]);

  const [
    uploadedEmailHTMLTemplatesStatuses,
    setUploadedEmailHTMLTemplatesStatuses,
  ] = useState<StatusType[]>([]);

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

    setXLSXUploadStatuses(xlsxStatuses === undefined ? [] : xlsxStatuses);

    // check if templates are there
    const uploadedDOCXTemplates: StatusType[] =
      await window.electron.getUploadedTemplates();
    const uploadedEmailTextTemplates: StatusType[] =
      await window.electron.getEmailTextTemplates();
    const uploadedEmailHTMLTemplates: StatusType[] =
      await window.electron.getEmailTextTemplates();

    if (uploadedDOCXTemplates.length === 0) {
      setUploadedDOCXTemplatesStatuses([
        {
          label: "Template missing",
          valid: false,
          message: `Please upload DOCX Templates in Upload templates section before proceeding.`,
        },
      ]);
    } else {
      setUploadedDOCXTemplatesStatuses([]);
    }
    if (uploadedEmailTextTemplates.length === 0) {
      setUploadedEmailTextTemplatesStatuses([
        {
          label: "Template missing",
          valid: false,
          message: `Please upload Email Text Templates in Upload templates section before proceeding.`,
        },
      ]);
    } else {
      setUploadedEmailTextTemplatesStatuses([]);
    }
    if (uploadedEmailHTMLTemplates.length === 0) {
      setUploadedEmailHTMLTemplatesStatuses([
        {
          label: "Template missing",
          valid: false,
          message: `Please upload Email HTML Templates in Upload templates section before proceeding.`,
        },
      ]);
    } else {
      setUploadedEmailHTMLTemplatesStatuses([]);
    }

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
      <Grid container direction="column">
        <UploadXSLX
          title="Upload data"
          uploadedFiles={uploadedFiles}
          removeUploadedFile={removeUploadedFile}
          onUploadHandler={onUploadHandler}
          isOpen={true}
          xlsxUploadStatuses={XLSXUploadStatuses}
        />
        <AvailableColumns
          isOpen={
            !XLSXUploadStatuses.some((status) => status.valid === false) &&
            uploadedFiles.length > 0
          }
          xlsxColumnNames={xlsxColumnNames}
        />
        <CheckData
          cellRegexes={cellRegexes}
          setCellRegexes={setCellRegexes}
          handleColumnSelection={handleColumnSelection}
          xlsxColumnNames={xlsxColumnNames}
          checkingXLSXColumns={checkingXLSXColumns}
          handleCheckXLSXColumns={handleCheckXLSXColumns}
          checkXLSXColumnsStatuses={checkXLSXColumnsStatuses}
          isOpen={
            !XLSXUploadStatuses.some((status) => status.valid === false) &&
            uploadedFiles.length > 0
          }
        />
        <ChooseTemplate
          title="Choose template"
          selectedTemplateStatuses={selectedTemplateStatuses}
          handleSelectedTemplate={handleSelectedTemplate}
          selectedTemplate={selectedTemplate}
          uploadedTemplates={uploadedTemplates}
          isOpen={
            !!uploadedTemplates.length &&
            uploadedFiles.length > 0 &&
            !XLSXUploadStatuses.some((status) => status.valid === false) &&
            !checkXLSXColumnsStatuses.some((status) => status.valid === false)
          }
        />
        <AvailablePlaceholders
          docxPlaceholders={docxPlaceholders}
          isOpen={
            !!selectedTemplate &&
            uploadedFiles.length > 0 &&
            !selectedTemplateStatuses.some((status) => status.valid === false)
          }
        />
        <SaveWordFiles
          generatingDOCX={generatingDOCX}
          setGeneratingDOCX={setGeneratingDOCX}
          setSavedDOCXFiles={setSavedDOCXFiles}
          setFileWrittingStatus={setFileWrittingStatus}
          setSnackbarOpen={setSnackbarOpen}
          uploadedFiles={uploadedFiles}
          selectedTemplate={selectedTemplate}
          isOpen={
            !!selectedTemplate &&
            uploadedFiles.length > 0 &&
            !selectedTemplateStatuses.some((status) => status.valid === false)
          }
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
              Use {"{}"} with column name between to insert data from that
              column
            </Typography>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <FormControl>
                  <InputLabel>Email from</InputLabel>
                  <Input
                    placeholder="John Doe <john@doe.com>"
                    name="emailFrom"
                    onChange={handleEmailFrom}
                  />
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl>
                  <InputLabel>Email to</InputLabel>
                  <Input
                    placeholder="{Email}"
                    name="emailTo"
                    onChange={handleEmailTo}
                  />
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl>
                  <InputLabel>Subject</InputLabel>
                  <Input
                    placeholder="Some subject text"
                    name="emailSubject"
                    onChange={handleEmailSubject}
                  />
                </FormControl>
              </Grid>
              <Grid item>
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
              </Grid>
              <Grid item>
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
              </Grid>
              {emailFrom &&
                emailTo &&
                emailSubject &&
                selectedEmailTextTemplate &&
                selectedEmailTextTemplate && (
                  <Grid container item spacing={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Visibility />}
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
                        Preview email
                      </Button>
                    </Grid>
                    <Grid item>
                      <div className={classes.wrapper}>
                        <Button
                          variant="contained"
                          color="secondary"
                          disabled={sendingEmails}
                          startIcon={<Email />}
                          onClick={async () => {
                            setSendingEmails(true);
                            try {
                              const receivedEmailStatuses =
                                await window.electron.sendEmails(
                                  emailFrom,
                                  emailTo,
                                  emailSubject,
                                  selectedEmailTextTemplate,
                                  selectedEmailHTMLTemplate,
                                  uploadedFiles[0],
                                  savedPDFFiles
                                );

                              setReceivedEmailStatuses([]);

                              if (receivedEmailStatuses) {
                                receivedEmailStatuses.forEach(
                                  (status: {
                                    accepted: string[];
                                    rejected: string[];
                                  }) => {
                                    if (status.accepted[0] !== undefined) {
                                      setReceivedEmailStatuses((prevState) => [
                                        ...prevState,
                                        {
                                          label: "Email sent",
                                          valid: true,
                                          message: `Email sent to email: ${status.accepted[0]}`,
                                        },
                                      ]);
                                    }
                                    if (status.rejected[0] !== undefined) {
                                      setReceivedEmailStatuses((prevState) => [
                                        ...prevState,
                                        {
                                          label: "Email not sent",
                                          valid: false,
                                          message: `Email is not sent to email: ${status.accepted[0]}`,
                                        },
                                      ]);
                                    }
                                  }
                                );
                              }

                              setSendingEmails(false);
                            } catch (e) {
                              console.log(e);
                              setSendingEmails(false);
                              setReceivedEmailStatuses([
                                {
                                  label: "Emails not sent",
                                  valid: false,
                                  message: `Possible reason: invalid email settings, check your email settings in Settings section. Error details: ${e}`,
                                },
                              ]);
                            }
                          }}
                        >
                          Send emails
                        </Button>
                        {sendingEmails && (
                          <CircularProgress
                            size={24}
                            className={classes.buttonProgress}
                          />
                        )}
                      </div>
                    </Grid>
                  </Grid>
                )}
            </Grid>
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
        uploadedDOCXTemplatesStatuses={uploadedDOCXTemplatesStatuses}
        uploadedEmailTextTemplatesStatuses={uploadedEmailTextTemplatesStatuses}
        uploadedEmailHTMLTemplatesStatuses={uploadedEmailHTMLTemplatesStatuses}
        checkXLSXColumnsStatuses={checkXLSXColumnsStatuses}
        selectedTemplateStatuses={selectedTemplateStatuses}
        setCheckXLSXColumnsStatuses={setCheckXLSXColumnsStatuses}
        receivedEmailStatuses={receivedEmailStatuses}
      />
    </>
  );
};

export default Convert;
