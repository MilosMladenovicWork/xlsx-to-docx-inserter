import { Grid, Typography, makeStyles } from "@material-ui/core";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
export interface SectionProps {
  children: ReactNode;
  title?: string;
  isOpen: boolean;
  hasDivider?: boolean;
  className?: string;
}

const useStyles = makeStyles(
  (theme) => ({
    root: {},
    divider: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4),
      opacity: 0.1,
    },
    visibleDivider: {
      borderBottom: `1px solid ${theme.palette.secondary.main}`,
    },
    listTitle: { color: theme.palette.text.primary },
  }),
  { name: "Section" }
);

const Section = ({
  isOpen,
  children,
  title,
  hasDivider = true,
}: SectionProps) => {
  const classes = useStyles();
  return (
    // animate presence initial and exit
    // isOpen render children
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
        >
          <Grid item className={classes.root}>
            {title && isOpen && (
              <Typography
                className={classes.listTitle}
                variant="h6"
                gutterBottom
              >
                {title}
              </Typography>
            )}
            {children}
            {
              <div
                className={clsx(classes.divider, {
                  [classes.visibleDivider]: hasDivider && isOpen,
                })}
              ></div>
            }
          </Grid>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Section;
