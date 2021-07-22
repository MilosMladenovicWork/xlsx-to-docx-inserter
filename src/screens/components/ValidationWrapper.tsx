import { Box, makeStyles } from "@material-ui/core";
import { Cancel, CheckCircle, Error } from "@material-ui/icons";
import { ReactNode } from "react";
import theme from "../../theme/AppTheme";

export interface ValidationWrapperProps {
  children: ReactNode;
  isValid?: "success" | "error" | "warning" | "neutral";
}

const useStyles = makeStyles(
  () => ({
    root: {
      display: "flex",
    },
    iconWrapper: {
      paddingLeft: theme.spacing(1),
      fontSize: "32px",
      display: "flex",
      alignItems: "flex-end",
    },
  }),
  { name: "Convert" }
);

const ValidationWrapper = ({ children, isValid }: ValidationWrapperProps) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {children}
      <Box color={`${isValid}.main`} className={classes.iconWrapper}>
        {isValid === "success" && (
          <CheckCircle  fontSize="inherit" />
        )}
        {isValid === "error" && <Cancel fontSize="inherit" />}
        {isValid === "warning" && <Error fontSize="inherit" />}
      </Box>
    </div>
  );
};

export default ValidationWrapper;
