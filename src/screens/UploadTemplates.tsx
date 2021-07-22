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
  ListItemSecondaryAction,
} from "@material-ui/core";
import { Description, Publish, Delete } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import { useEmailHTMLTemplates, useEmailTextTemplates } from "./Convert";
import ValidationWrapper from "./components/ValidationWrapper";

const useStyles = makeStyles(
  (theme) => ({
    root: {
      padding: theme.spacing(2),
    },
    list: {
      backgroundColor: theme.palette.background.paper,
      margin: theme.spacing(2, 0, 0, 0),
    },
    divider: {
      borderBottom: `1px solid ${theme.palette.secondary.main}`,
      margin: theme.spacing(5, 0, 0, 0),
    },
    listItem: { color: theme.palette.text.primary },
    listTitle: {
      color: theme.palette.text.primary,
      marginTop: theme.spacing(2),
    },
    buttonWrapper: {
      marginTop: theme.spacing(4),
    },
  }),
  { name: "Convert" }
);

export const useUploadedTemplates = (): [
  string[],
  React.Dispatch<React.SetStateAction<string[]>>
] => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  useEffect(() => {
    const getUploadedTemplates = async () => {
      const templates = await window.electron.getUploadedTemplates();
      setUploadedFiles(templates);
    };
    getUploadedTemplates();
  }, []);

  return [uploadedFiles, setUploadedFiles];
};

const UploadTemplates = () => {
  const classes = useStyles();

  const [uploadedFiles, setUploadedFiles] = useUploadedTemplates();
  const [uploadedEmailHTML, setUploadedEmailHTML] = useEmailHTMLTemplates();
  const [uploadedEmailText, setUploadedEmailText] = useEmailTextTemplates();

  const onUploadHandler = async () => {
    const files = await window.electron.uploadDOCX();
    setUploadedFiles((prevState) => [...new Set([...prevState, ...files])]);
  };

  const onDeleteHandler = async (fileName: string) => {
    const deletedFile = await window.electron.deleteDOCX(fileName);
    setUploadedFiles((prevState) =>
      prevState.filter((file) => file !== deletedFile)
    );
  };

  const onUploadEmailTextHandler = async () => {
    const files = await window.electron.uploadEmailText();
    setUploadedEmailText((prevState) => [...new Set([...prevState, ...files])]);
  };

  const onDeleteEmailTextHandler = async (fileName: string) => {
    const deletedFile = await window.electron.deleteEmailText(fileName);
    setUploadedEmailText((prevState) =>
      prevState.filter((file) => file !== deletedFile)
    );
  };

  const onUploadEmailHTMLHandler = async () => {
    const files = await window.electron.uploadEmailHTML();
    setUploadedEmailHTML((prevState) => [...new Set([...prevState, ...files])]);
  };

  const onDeleteEmailHTMLHandler = async (fileName: string) => {
    const deletedFile = await window.electron.deleteEmailHTML(fileName);
    setUploadedEmailHTML((prevState) =>
      prevState.filter((file) => file !== deletedFile)
    );
  };

  const emailTextValid = () => {
    if (uploadedEmailText.length > 0) return "success";
    else return "neutral";
  };
  const htmlEmailValid = () => {
    if (uploadedEmailHTML.length > 0) return "success";
    else return "neutral";
  };

  // TODO: add animations on buttons and add titles on each section

  return (
    <Grid container direction="column">
      {uploadedFiles.length > 0 && (
        <>
          <Typography className={classes.listTitle} variant="h6" gutterBottom>
            Uploaded data
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
                        primary={file}
                        primaryTypographyProps={{ noWrap: true }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => onDeleteHandler(file)}
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
        </>
      )}

      <ValidationWrapper className={classes.buttonWrapper} isValid="success">
        <Button
          variant="contained"
          onClick={onUploadHandler}
          color="secondary"
          component="label"
          startIcon={<Publish />}
        >
          Upload DOCX File
        </Button>
      </ValidationWrapper>
      <div className={classes.divider}></div>
      <Typography className={classes.listTitle} variant="h6" gutterBottom>
        Uploaded Text Document
      </Typography>
      {uploadedEmailText.length > 0 && (
        <List className={classes.list}>
          <AnimateSharedLayout>
            <AnimatePresence>
              {uploadedEmailText.map((file) => (
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
                      primary={file}
                      primaryTypographyProps={{ noWrap: true }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => onDeleteEmailTextHandler(file)}
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
      )}
      <ValidationWrapper
        className={classes.buttonWrapper}
        isValid={emailTextValid()}
      >
        <Button
          variant="contained"
          onClick={onUploadEmailTextHandler}
          color="secondary"
          component="label"
          startIcon={<Publish />}
        >
          Upload Email Text
        </Button>
      </ValidationWrapper>
      <div className={classes.divider}></div>

      <Typography className={classes.listTitle} variant="h6" gutterBottom>
        Upload Email HTML
      </Typography>

      {uploadedEmailHTML.length > 0 && (
        <List className={classes.list}>
          <AnimateSharedLayout>
            <AnimatePresence>
              {uploadedEmailHTML.map((file) => (
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
                      primary={file}
                      primaryTypographyProps={{ noWrap: true }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => onDeleteEmailHTMLHandler(file)}
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
      )}
      <ValidationWrapper
        className={classes.buttonWrapper}
        isValid={htmlEmailValid()}
      >
        <Button
          variant="contained"
          onClick={onUploadEmailHTMLHandler}
          color="secondary"
          component="label"
          startIcon={<Publish />}
        >
          Upload Email HTML
        </Button>
      </ValidationWrapper>
      <div className={classes.divider}></div>
    </Grid>
  );
};

export default UploadTemplates;
