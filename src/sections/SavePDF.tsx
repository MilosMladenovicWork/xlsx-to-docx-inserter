import { Grid, Button, makeStyles, CircularProgress } from "@material-ui/core";
import { Color } from "@material-ui/lab";
import { Save, Visibility } from "@material-ui/icons";
import Section from "../screens/components/Section";

export interface SavePDFProps {
  generatingPDF: boolean;
  setGeneratingPDF: React.Dispatch<React.SetStateAction<boolean>>;
  generatingPreviewPDF: boolean;
  setGeneratingPreviewPDF: React.Dispatch<React.SetStateAction<boolean>>;
  setSavedPDFFiles: React.Dispatch<React.SetStateAction<never[]>>;
  setFileWrittingStatus: React.Dispatch<
    React.SetStateAction<{
      severity: Color | undefined;
      message: string | undefined;
    }>
  >;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
  setSnackbarOpen,
  savedDOCXFiles,
  isOpen,
}: SavePDFProps) => {
  const classes = useStyles();
  return (
    <Section isOpen={isOpen}>
      <Grid container spacing={2}>
        <Grid item>
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

                if (filePaths && filePaths.length > 0) {
                  await window.electron.openFile(filePaths[0]);
                }
              }}
            >
              Preview PDF
            </Button>
            {generatingPreviewPDF && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </Grid>
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
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </Grid>
      </Grid>
    </Section>
  );
};

export default SavePDF;
