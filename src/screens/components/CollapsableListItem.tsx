import { useState } from "react";
import { Collapse, Grid, ListItem, makeStyles } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import { StatusType } from "../Convert";
import { Alert, AlertTitle } from "@material-ui/lab";
import clsx from "clsx";

type CollapsableListItemProps = StatusType;

const useStyles = makeStyles(
  (theme) => ({
    root: {
      transition: "0.6s",
      width: 150,
      [theme.breakpoints.up("md")]: {
        width: 240,
      },
    },
    active: {
      width: 300,
      [theme.breakpoints.up("md")]: {
        width: 400,
      },
    },
    message: {
      width: "100%",
    },
    gridContainer: {
      flexWrap: "nowrap",
    },
  }),
  { name: "ColapsableListItem" }
);

const CollapsableListItem = ({
  valid,
  message,
  label,
}: CollapsableListItemProps) => {
  const [open, setOpen] = useState(false);

  const classes = useStyles();

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <ListItem button onClick={handleClick}>
      <Alert
        className={clsx(classes.root, { [classes.active]: open })}
        classes={{ message: classes.message }}
        severity={valid === "warning" ? "warning" : valid ? "success" : "error"}
      >
        <AlertTitle>
          <Grid
            className={classes.gridContainer}
            container
            justify="space-between"
          >
            <Grid item>{label}</Grid>
            <Grid item>
              {message && (open ? <ExpandLess /> : <ExpandMore />)}
            </Grid>
          </Grid>
        </AlertTitle>
        {message && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            {message}
          </Collapse>
        )}
      </Alert>
    </ListItem>
  );
};

export default CollapsableListItem;
