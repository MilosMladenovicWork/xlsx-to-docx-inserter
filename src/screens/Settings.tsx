import {
  Button,
  Grid,
  makeStyles,
  FormControl,
  Input,
  InputLabel,
} from "@material-ui/core";
import { Save,} from "@material-ui/icons";
import { useEffect, useState } from "react";
import Section from "../screens/components/Section";
import theme from "../theme/AppTheme";

const useStyles = makeStyles(
  () => ({
    formControl: {
      minWidth: '100%',
      paddingRight: theme.spacing(2),
    },
    button: {
      minWidth: 160,
    },
  }),
  { name: "Convert" }
);

// TODO: change loading button
const UploadTemplates = () => {
  const classes = useStyles();

  const [email, setEmail] = useState("");
  useEffect(() => {
    const defaultEmail = '@email';
    setEmail(defaultEmail);
  }, []);

  console.log(email)

  return (
    <Grid container direction="column" sm>
      <Section isOpen title="Global Configurations" hasDivider={false}>
        <Grid container alignItems="flex-end" sm>
          <Grid item sm>
            <FormControl className={classes.formControl}>
              <InputLabel>Email</InputLabel>
              <Input fullWidth onChange={(e) => setEmail(e.target.value)} value={email} />
            </FormControl>
          </Grid>
          <Grid item xs="auto">
            <Button
              className={classes.button}
              fullWidth
              variant="contained"
              color="secondary"
              component="label"
              startIcon={<Save />}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Section>
    </Grid>
  );
};

export default UploadTemplates;
