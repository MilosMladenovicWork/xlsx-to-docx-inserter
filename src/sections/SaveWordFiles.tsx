import { Grid, Button, makeStyles, CircularProgress } from "@material-ui/core";
import { Color } from "@material-ui/lab";
import { Save, Visibility } from "@material-ui/icons";
import Section from "../screens/components/Section";

export interface SaveWordFilesProps {
  generatingDOCX: boolean;
  setGeneratingDOCX: React.Dispatch<React.SetStateAction<boolean>>;
  setSavedDOCXFiles: React.Dispatch<React.SetStateAction<never[]>>;
  uploadedFiles: [] | string[];
  selectedTemplate: unknown;
  //
  setFileWrittingStatus: React.Dispatch<
    React.SetStateAction<{
      severity: Color | undefined;
      message: string | undefined;
    }>
  >;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
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

const SaveWordFiles = ({
  generatingDOCX,
  setGeneratingDOCX,
  setSavedDOCXFiles,
  setFileWrittingStatus,
  setSnackbarOpen,
  uploadedFiles,
  selectedTemplate,
  isOpen,
}: SaveWordFilesProps) => {
  const classes = useStyles();
  return (
    <Section isOpen={isOpen}>
      <Grid container spacing={2}>
        <Grid item>
          <Button
            startIcon={<Visibility />}
            variant="contained"
            color="secondary"
            onClick={async () => {
              const filePaths = await window.electron.savePreviewDOCX(
                uploadedFiles[0],
                selectedTemplate
              );

              if (filePaths && filePaths.length > 0) {
                await window.electron.openFile(filePaths[0]);
              }
            }}
          >
            Preview DOCX
          </Button>
        </Grid>
        <Grid item>
          <div className={classes.wrapper}>
            <Button
              variant="contained"
              disabled={generatingDOCX}
              onClick={async () => {
                setGeneratingDOCX(true);
                let savedFiles = await window.electron.saveFiles(
                  uploadedFiles,
                  selectedTemplate
                );
                setGeneratingDOCX(false);
                if (savedFiles && savedFiles.length > 0) {
                  setSavedDOCXFiles(savedFiles);
                  setFileWrittingStatus({
                    severity: "success",
                    message: `${savedFiles.length} files successfully saved`,
                  });
                  setSnackbarOpen(false);
                  setSnackbarOpen(true);
                }
              }}
              color="secondary"
              startIcon={<Save />}
            >
              Save Word Files
            </Button>
            {generatingDOCX && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </Grid>
      </Grid>
    </Section>
  );
};

export default SaveWordFiles;
