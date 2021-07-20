import {
  Button,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  makeStyles,
  IconButton,
  ListItemSecondaryAction,
} from "@material-ui/core";
import { Description, Publish, Delete } from "@material-ui/icons";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import Section from "../screens/components/Section";

export interface UploadXSLXProps {
  uploadedFiles: string[] | [];
  removeUploadedFile: (file: string) => void;
  onUploadHandler: () => Promise<void>;
  isOpen: boolean;
  title: string;
}

const useStyles = makeStyles(
  (theme) => ({
    root: {
      marginBottom: theme.spacing(2),
    },
    list: {
      backgroundColor: theme.palette.background.paper,
      maxHeight: '200px',
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: theme.palette.tertiary.main,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.secondary.main,
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: theme.palette.quartenary.main,
      },
      // support for Firefox
      scrollbarWidth: 'thin',
      scrollbarColor: `${theme.palette.secondary.main} rgba(0,0,0, 0)`,
    },
    listItem: { color: theme.palette.text.primary },
    listTitle: { color: theme.palette.text.primary },
    divider: {
      borderBottom: `1px solid ${theme.palette.secondary.main}`,
      margin: theme.spacing(5, 0, 0, 0),
    },
  }),
  { name: "UploadXSLX" }
);

const UploadXSLX = ({
  uploadedFiles,
  removeUploadedFile,
  onUploadHandler,
  isOpen,
  title,
}: UploadXSLXProps) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Section isOpen={isOpen} hasDivider={false} title={title}>
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
                      primary={window.electron.getFileNameFromPath(file)}
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
      </Section>
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
      <div className={classes.divider}></div>
    </div>
  );
};

export default UploadXSLX;
