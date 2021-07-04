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
import { Description, Publish, Save, Delete } from "@material-ui/icons";
import { useState } from "react";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";

const useStyles = makeStyles(
  (theme) => ({
    list: {
      backgroundColor: theme.palette.background.paper,
    },
    listItem: { color: theme.palette.text.primary },
    listTitle: { color: theme.palette.text.primary },
  }),
  { name: "Convert" }
);

const Convert = () => {
  const classes = useStyles();
  const [uploadedFiles, setUploadedFiles] = useState([]);

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

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <AnimateSharedLayout>
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
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
            )}
          </AnimatePresence>
        </AnimateSharedLayout>
      </Grid>
      <Grid container item xs={12} spacing={2} wrap="wrap">
        <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              onClick={() => window.electron.saveFiles(uploadedFiles)}
              color="secondary"
              component="label"
              startIcon={<Save />}
            >
              Save Word Files
            </Button>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default Convert;
