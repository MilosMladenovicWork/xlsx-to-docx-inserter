import { Grid, Button, makeStyles, CircularProgress } from "@material-ui/core";
import { Color } from "@material-ui/lab";
import { Save, Visibility } from "@material-ui/icons";
import Section from "../screens/components/Section";
import { StatusType } from "../screens/Convert";
import ValidationWrapper from "../screens/components/ValidationWrapper";

export interface SavePDFProps {
  generatingPDF: boolean;
  setGeneratingPDF: React.Dispatch<React.SetStateAction<boolean>>;
  generatingPreviewPDF: boolean;
  setGeneratingPreviewPDF: React.Dispatch<React.SetStateAction<boolean>>;
  setSavedPDFFiles: React.Dispatch<React.SetStateAction<string[]>>;
  setFileWrittingStatus: React.Dispatch<
    React.SetStateAction<{
      severity: Color | undefined;
      message: string | undefined;
    }>
  >;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setwritePDFStatuses: React.Dispatch<React.SetStateAction<StatusType[]>>;
  setPreviewPDFStatuses: React.Dispatch<React.SetStateAction<StatusType[]>>;
  // setUploadedPDFFiles: React.Dispatch<React.SetStateAction<string[]>>;
  writePDFStatuses: StatusType[];
  previewPDFStatuses: StatusType[];
  savedDOCXFiles: never[];
  isOpen: boolean;
}

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
  }),
  { name: "ChooseTemplate" }
);

const SavePDF = ({
  generatingPDF,
  generatingPreviewPDF,
  setGeneratingPDF,
  setGeneratingPreviewPDF,
  setSavedPDFFiles,
  setFileWrittingStatus,
  setwritePDFStatuses,
  setPreviewPDFStatuses,
  setSnackbarOpen,
  writePDFStatuses,
  previewPDFStatuses,
  savedDOCXFiles,
  isOpen,
}: SavePDFProps) => {
  const classes = useStyles();

  const checkPDFWrite = (pdfFiles: string[]) => {
    const statuses = [];

    if (pdfFiles && pdfFiles.length === 0) {
      statuses.push({
        label: "Convert error",
        valid: false,
        message:
          "Please install libre office and insert path to the soffice executable in your system Path environmental variable (example C:\\Program Files\\LibreOffice\\program)",
      });
    }
    if (pdfFiles && pdfFiles.length > 0) {
      statuses.push({
        label: "PDF Files saved successfuly",
        valid: true,
        message: `${pdfFiles.length} PDF files are saved succesfuly`,
      });
    }
    setwritePDFStatuses(statuses);
  };

  const checkPDFPreview = (filePaths: string[]) => {
    const statuses = [];

    if (filePaths && filePaths.length === 0) {
      statuses.push({
        label: "Preview error",
        valid: false,
        message:
          "Please install libre office and insert path to the soffice executable in your system Path environmental variable (example C:\\Program Files\\LibreOffice\\program)",
      });
    }
    setPreviewPDFStatuses(statuses);
  };

  const savePDFValid = () => {
    const statuseValidArray = writePDFStatuses.map((status) => status.valid);
    const hasFalseStatus = statuseValidArray.some((item) => item === false);

    if (statuseValidArray.length === 0) {
      return "neutral";
    }

    if (hasFalseStatus) return "error";
    else if (!hasFalseStatus) return "success";
    else return "neutral";
  };

  const previewPDFValid = () => {
    const statuseValidArray = previewPDFStatuses.map((status) => status.valid);
    const hasFalseStatus = statuseValidArray.some((item) => item === false);

    if (statuseValidArray.length === 0) {
      return "neutral";
    }

    if (hasFalseStatus) return "error";
    else return "neutral";
  };
  console.log(previewPDFValid());
  return (
    <Section isOpen={isOpen}>
      <Grid container spacing={2}>
        <Grid item>
          <ValidationWrapper isValid={previewPDFValid()}>
            <div className={classes.wrapper}>
              <Button
                startIcon={<Visibility />}
                disabled={generatingPreviewPDF}
                variant="contained"
                color="secondary"
                onClick={async () => {
                  setGeneratingPreviewPDF(true);
                  const filePaths = await window.electron.savePreviewPDF(
                    savedDOCXFiles[0]
                  );

                  setGeneratingPreviewPDF(false);
                  checkPDFPreview(filePaths);

                  if (filePaths && filePaths.length > 0) {
                    await window.electron.openFile(filePaths[0]);
                  }
                }}
              >
                Preview PDF
              </Button>
              {generatingPreviewPDF && (
                <CircularProgress
                  size={24}
                  className={classes.buttonProgress}
                />
              )}
            </div>
          </ValidationWrapper>
        </Grid>
        <Grid item>
          <ValidationWrapper isValid={savePDFValid()}>
            <div className={classes.wrapper}>
              <Button
                variant="contained"
                disabled={generatingPDF}
                onClick={async () => {
                  setGeneratingPDF(true);
                  let savedFiles = await window.electron.savePDFFiles(
                    savedDOCXFiles
                  );
                  checkPDFWrite(savedFiles);
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
          </ValidationWrapper>
        </Grid>
      </Grid>
    </Section>
  );
};

export default SavePDF;
