import { Grid, Typography, makeStyles } from "@material-ui/core";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface SectionProps {
  children: ReactNode;
  title?: string;
  isOpen: boolean;
  hasDivider?: boolean;
}

const useStyles = makeStyles(
  (theme) => ({
    root: {
      margin: theme.spacing(2, 0),
    },
    divider: {
      borderBottom: `1px solid ${theme.palette.secondary.main}`,
      margin: theme.spacing(5, 0, 8, 0),
    },
    listTitle: { color: theme.palette.text.primary },
  }),
  { name: "Section" }
);

const Section = ({ isOpen, children, title, hasDivider=true }: SectionProps) => {
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
            {hasDivider && isOpen && <div className={classes.divider}></div>}
          </Grid>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Section;
