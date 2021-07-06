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
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
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
  }),
  { name: "Convert" }
);

const Convert = () => {
  const classes = useStyles();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [filesWritten, setFilesWritten] = useState(false);
  const [fileWrittingStatus, setFileWrittingStatus] = useState({
    severity: undefined,
    message: undefined,
  });

  const [uploadedTemplates, setUploadedTemplates] = useUploadedTemplates();

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };

  const onUploadHandler = async () => {
    const files = await window.electron.ipcRenderer.invoke("uploadXLSX");
    // const files = await window.electron.ipcRenderer.invoke("uploadXLSX");
    setUploadedFiles((prevState) => [...new Set([...prevState, ...files])]);
  };

  const removeUploadedFile = (file) => {
    setUploadedFiles((prevState) =>
      prevState.filter((filePath) => filePath !== file)
    );
  };

  const handleSelectedTemplate = (event) => {
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
        {uploadedFiles.length > 0 && uploadedTemplates.length && (
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
            <Button
              variant="contained"
              onClick={async () => {
                let savedFiles = await window.electron.saveFiles(
                  uploadedFiles,
                  selectedTemplate
                );
                console.log(savedFiles.length);
                if (savedFiles.length > 0) {
                  setSnackbarOpen(true);
                  setFilesWritten(savedFiles.length);
                  setFileWrittingStatus({
                    severity: "success",
                    message: `${savedFiles.length} Files successfully saved`,
                  });
                }
              }}
              color="secondary"
              component="label"
              startIcon={<Save />}
            >
              Save Word Files
            </Button>
          </Grid>
        )}
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={fileWrittingStatus.severity}
        >
          {fileWrittingStatus.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default Convert;
