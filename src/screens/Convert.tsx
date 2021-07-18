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
  Input,
  Chip,
  Hidden,
  Drawer,
  Divider,
} from "@material-ui/core";
import { Alert, Color } from "@material-ui/lab";
import { Description, Publish, Save, Delete } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import { useUploadedTemplates } from "./UploadTemplates";
import CollapsableListItem from "./components/CollapsableListItem";

const MotionDrawer = motion(Drawer);

export interface StatusType {
  label: string;
  valid: boolean;
  message?: string;
}

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
    drawerPaper: {
      maxWidth: "fit-content",
    },
    toolbar: theme.mixins.toolbar,
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
  const [checkingXLSXColumns, setCheckingXLSXColumns] = useState(false);
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

    setCheckingXLSXColumns(false);

    console.log(checkXLSXColumnsStatuses);
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

  const handleRegexInput: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    const targetName = e.target.name as string;
    const targetValue = e.target.value;
    const stateIndex = cellRegexes.findIndex((item) => item.id === targetName);
    if (stateIndex !== -1) {
      setCellRegexes((prevState) => {
        const newState = [...prevState];
        newState[stateIndex].regex = targetValue;
        return newState;
      });
      if (e.target.value === "" && cellRegexes.length > 1) {
        setCellRegexes((prevState) => {
          const newState = [...prevState];
          return newState.filter((item) => item.id !== targetName);
        });
      }
      if (cellRegexes.every((item) => item.regex)) {
        setCellRegexes((prevState) => {
          const newState = [...prevState];
          newState.push({ id: undefined, colNum: undefined, regex: undefined });
          return newState;
        });
      }
    } else {
      setCellRegexes((prevState) => {
        const newState = [...prevState];
        const stateIndex = cellRegexes.findIndex(
          (item) => item.id === undefined
        );
        newState[stateIndex].id = targetName;
        return newState;
      });
    }
  };

  return (
    <>
      <Grid container spacing={4}>
        <Grid item container direction="column" xs={12} spacing={2}>
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
          {uploadedFiles.length > 0 && (
            <Grid container item spacing={1}>
              <Grid item>
                <Typography>Available columns</Typography>
              </Grid>
              <Grid container item spacing={1}>
                {xlsxColumnNames &&
                  xlsxColumnNames.length > 0 &&
                  xlsxColumnNames.map(({ name, colNum }) => (
                    <Grid item>
                      <Chip
                        avatar={<Avatar>{colNum}</Avatar>}
                        label={name}
                        color={"primary"}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Grid>
          )}
          {uploadedFiles.length > 0 && (
            <Grid container item spacing={2}>
              <Grid item>
                <Typography>
                  Select column and insert regex to check if data is all right
                </Typography>
              </Grid>
              {cellRegexes.map((_data, index) => {
                return (
                  <Grid container item spacing={2}>
                    <Grid item>
                      <FormControl key={index} className={classes.formControl}>
                        <InputLabel>Check column</InputLabel>
                        <Select
                          onChange={handleColumnSelection}
                          name={`regexes${index}`}
                        >
                          {xlsxColumnNames &&
                            xlsxColumnNames.length > 0 &&
                            xlsxColumnNames.map(({ name, colNum }) => (
                              <MenuItem value={colNum} key={colNum}>
                                {name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item>
                      <FormControl key={index} className={classes.formControl}>
                        <InputLabel>With regex</InputLabel>
                        <Input
                          name={`regexes${index}`}
                          onChange={handleRegexInput}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                );
              })}
              <Grid item>
                {/* TODO: add logic to this button */}
                <Button
                  variant="contained"
                  color="secondary"
                  component="label"
                  startIcon={<Publish />}
                  disabled={checkingXLSXColumns}
                  onClick={handleCheckXLSXColumns}
                >
                  Check columns
                </Button>
              </Grid>
            </Grid>
          )}
        </Grid>
        <Grid container item xs={12} direction="column" spacing={2}>
          {!!uploadedTemplates.length && uploadedFiles.length > 0 && (
            <Grid item>
              <Typography
                className={classes.listTitle}
                variant="h6"
                gutterBottom
              >
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
      <Hidden xsDown implementation="css">
        <AnimateSharedLayout>
          <MotionDrawer
            layout
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
            anchor="right"
          >
            <div className={classes.toolbar} />
            <Divider />
            <List>
              {XLSXUploadStatuses.map(({ valid, label, message }) => (
                <CollapsableListItem
                  valid={valid}
                  label={label}
                  message={message}
                />
              ))}
            </List>
          </MotionDrawer>
        </AnimateSharedLayout>
      </Hidden>
    </>
  );
};

export default Convert;
