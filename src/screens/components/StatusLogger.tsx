import { List, makeStyles, Hidden, Divider, Drawer } from "@material-ui/core";

import { AnimateSharedLayout, motion } from "framer-motion";
import CollapsableListItem from "./CollapsableListItem";
import { StatusType } from "../Convert";

const MotionDrawer = motion(Drawer);

export interface StatusLoggerProps {
  XLSXUploadStatuses: StatusType[];
  setCheckXLSXColumnsStatuses: React.Dispatch<
    React.SetStateAction<StatusType[]>
  >;
  checkXLSXColumnsStatuses: StatusType[];
  selectedTemplateStatuses: StatusType[];
  receivedEmailStatuses: StatusType[];
  uploadedDOCXTemplatesStatuses: StatusType[];
  uploadedEmailTextTemplatesStatuses: StatusType[];
  uploadedEmailHTMLTemplatesStatuses: StatusType[];
}

const useStyles = makeStyles(
  (theme) => ({
    drawerPaper: {
      maxWidth: "fit-content",
    },
    list: {
      "&::-webkit-scrollbar": {
        width: "6px",
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: theme.palette.tertiary.main,
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: theme.palette.secondary.main,
        borderRadius: "3px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        backgroundColor: theme.palette.quartenary.main,
      },
    },
    toolbar: theme.mixins.toolbar,
  }),
  { name: "ChooseTemplate" }
);

const StatusLogger = ({
  XLSXUploadStatuses,
  checkXLSXColumnsStatuses,
  selectedTemplateStatuses,
  receivedEmailStatuses,
  uploadedDOCXTemplatesStatuses,
  uploadedEmailTextTemplatesStatuses,
  uploadedEmailHTMLTemplatesStatuses,
}: StatusLoggerProps) => {
  const classes = useStyles();
  return (
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
            {XLSXUploadStatuses &&
              checkXLSXColumnsStatuses &&
              selectedTemplateStatuses &&
              [
                ...XLSXUploadStatuses,
                ...uploadedDOCXTemplatesStatuses,
                ...uploadedEmailTextTemplatesStatuses,
                ...uploadedEmailHTMLTemplatesStatuses,
                ...checkXLSXColumnsStatuses,
                ...selectedTemplateStatuses,
                ...receivedEmailStatuses,
              ].map(({ valid, label, message }) => (
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
  );
};

export default StatusLogger;
