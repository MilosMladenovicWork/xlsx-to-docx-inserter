import {
  Button,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  makeStyles,
  Typography,
  IconButton,
  Select,
  MenuItem,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Snackbar,
  SnackbarCloseReason,
  CircularProgress,
} from "@material-ui/core";
import { Alert, Color } from "@material-ui/lab";
import { Description, Publish, Save, Delete } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import { useUploadedTemplates } from "./UploadTemplates";

const useStyles = makeStyles(
  (theme) => ({
    list: {
      backgroundColor: theme.palette.background.paper,
    },
    listItem: { color: theme.palette.text.primary },
    listTitle: { color: theme.palette.text.primary },
    formControl: {
      minWidth: 120,
    },
    wrapper: {
      position: "relative",
      display: "inline",
    },
    buttonSuccess: {
      backgroundColor: theme.palette.success.main,
    },
    buttonProgress: {
      color: theme.palette.primary.main,
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12,
    },
  }),
  { name: "Convert" }
);

const Convert = () => {
  const classes = useStyles();
  const [uploadedFiles, setUploadedFiles] = useState<[] | string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<unknown>("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [fileWrittingStatus, setFileWrittingStatus] = useState<{
    severity: Color | undefined;
    message: string | undefined;
  }>({
    severity: undefined,
    message: undefined,
  });
  const [generatingDOCX, setGeneratingDOCX] = useState(false);
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

    const xlsxStatus: { label: string; valid: boolean; message?: string }[] =
      await window.electron.checkXLSX(files);

    console.log(xlsxStatus);
    // const files = await window.electron.ipcRenderer.invoke("uploadXLSX");
    setUploadedFiles((prevState) => [...new Set([...prevState, ...files])]);
  };

  const removeUploadedFile = (file: string) => {
    setUploadedFiles((prevState) =>
      prevState.filter((filePath) => filePath !== file)
    );
  };

  const handleSelectedTemplate = (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    setSelectedTemplate(event.target.value);
  };

  useEffect(() => {
    if (uploadedTemplates.length) {
      setSelectedTemplate(uploadedTemplates[0]);
    }
  }, [uploadedTemplates]);

  return (
    <Grid container spacing={4}>
      <Grid item container direction="column" xs={12} md={6} spacing={2}>
        {uploadedFiles.length > 0 && (
          <Grid item>
            <AnimateSharedLayout>
              <AnimatePresence>
                <motion.div
                  initial={{
                    opacity: 0,
                    overflow: "hidden",
                  }}
                  animate={{
                    opacity: 1,
                    overflow: "hidden",
                  }}
                  exit={{
                    opacity: 0,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    className={classes.listTitle}
                    variant="h6"
                    gutterBottom
                  >
                    Upload data
                  </Typography>
                  <List className={classes.list}>
                    <AnimateSharedLayout>
                      <AnimatePresence>
                        {uploadedFiles.map((file) => (
                          <motion.div
                            key={file}
                            initial={{
                              maxHeight: 0,
                              opacity: 0,
                              overflow: "hidden",
                            }}
                            animate={{
                              maxHeight: 100,
                              opacity: 1,
                              overflow: "hidden",
                            }}
                            exit={{
                              maxHeight: 0,
                              opacity: 0,
                              overflow: "hidden",
                            }}
                            layout
                          >
                            <ListItem className={classes.listItem}>
                              <ListItemAvatar>
                                <Avatar>
                                  <Description />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={window.electron.getFileNameFromPath(
                                  file
                                )}
                                primaryTypographyProps={{ noWrap: true }}
                              />
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  aria-label="delete"
                                  onClick={() => removeUploadedFile(file)}
                                >
                                  <Delete />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </AnimateSharedLayout>
                  </List>
                </motion.div>
              </AnimatePresence>
            </AnimateSharedLayout>
          </Grid>
        )}
        <Grid item>
          <Button
            variant="contained"
            onClick={onUploadHandler}
            color="secondary"
            component="label"
            startIcon={<Publish />}
          >
            Upload XLSX File
          </Button>
        </Grid>
      </Grid>
      <Grid container item xs={12} md={6} direction="column" spacing={2}>
        {!!uploadedTemplates.length && uploadedFiles.length > 0 && (
          <Grid item>
            <Typography className={classes.listTitle} variant="h6" gutterBottom>
              Choose template
            </Typography>
            <FormControl className={classes.formControl}>
              <InputLabel>Template</InputLabel>
              <Select
                onChange={handleSelectedTemplate}
                value={selectedTemplate}
              >
                {uploadedTemplates.map((template) => (
                  <MenuItem value={template} key={template}>
                    {template}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        {uploadedFiles.length > 0 && selectedTemplate && (
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
                component="label"
                startIcon={<Save />}
              >
                Save Word Files
              </Button>
              {generatingDOCX && (
                <CircularProgress
                  size={24}
                  className={classes.buttonProgress}
                />
              )}
            </div>
          </Grid>
        )}
      </Grid>
      {uploadedFiles.length > 0 && selectedTemplate && (
        <Grid container item xs={12} md={6} direction="column" spacing={2}>
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
  );
};

export default Convert;
