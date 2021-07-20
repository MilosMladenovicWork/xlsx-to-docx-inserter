import { List, makeStyles, Hidden, Divider, Drawer } from "@material-ui/core";

import { AnimateSharedLayout, motion } from "framer-motion";
import CollapsableListItem from "../components/CollapsableListItem";
import { StatusType } from "../Convert";

const MotionDrawer = motion(Drawer);

export interface ConsoleDrawerProps {
  XLSXUploadStatuses: StatusType[];
}

const useStyles = makeStyles(
  (theme) => ({
    drawerPaper: {
      maxWidth: "fit-content",
    },
    toolbar: theme.mixins.toolbar,
  }),
  { name: "ChooseTemplate" }
);

const ConsoleDrawer = ({
  XLSXUploadStatuses,
}: ConsoleDrawerProps) => {
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
  );
};

export default ConsoleDrawer;
