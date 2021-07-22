import {
  makeStyles,
  FormControl,
  Input,
  Grid,
  Switch,
  InputAdornment,
  InputLabel,
  IconButton,
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { useEffect, useState } from "react";
import Section from "../screens/components/Section";
import theme from "../theme/AppTheme";

const useStyles = makeStyles(
  () => ({
    formControl: {
      minWidth: "100%",
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

  const [showPassword, setShowPassword] = useState(false);

  const [host, setHost] = useState("");
  const [port, setPort] = useState(0);
  const [secure, setSecure] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  useEffect(() => {
    const defaultHost = "smtp.asdada.asdada";
    const defaultPort = 123;
    const defaultSecure = false;
    const defaultUser = "defaultUser";
    const defaultPass = "defaultPass";

    setHost(defaultHost);
    setPort(defaultPort);
    setSecure(defaultSecure);
    setUser(defaultUser);
    setPass(defaultPass);
  }, []);

  return (
    <Grid container direction="column" sm>
      <Section isOpen title="Global Configurations" hasDivider={false}>
        <Grid container alignItems="flex-end" sm>
          <Grid item sm>
            <FormControl className={classes.formControl}>
              <InputLabel>Host</InputLabel>
              <Input
                fullWidth
                onChange={(e) => setHost(e.target.value)}
                value={host}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container alignItems="flex-end" sm>
          <Grid item sm>
            <FormControl className={classes.formControl}>
              <InputLabel>Port</InputLabel>
              <Input
                fullWidth
                type="number"
                onChange={(e) => setPort(+e.target.value)}
                value={port}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container alignItems="flex-end" sm>
          <Grid item sm>
            <FormControl className={classes.formControl}>
              <InputLabel>Secure</InputLabel>
              <Switch
                checked={secure}
                onChange={(e) => setSecure(e.target.checked)}
                color="primary"
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container alignItems="flex-end" sm>
          <Grid item sm>
            <FormControl className={classes.formControl}>
              <InputLabel>User</InputLabel>
              <Input
                fullWidth
                onChange={(e) => setUser(e.target.value)}
                value={user}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container alignItems="flex-end" sm>
          <Grid item sm>
            <FormControl className={classes.formControl}>
              <InputLabel>Password</InputLabel>
              <Input
                fullWidth
                onChange={(e) => setPass(e.target.value)}
                value={pass}
                type={showPassword ? "text" : "password"}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((prevState) => !prevState)}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Grid>
        </Grid>
      </Section>
    </Grid>
  );
};

export default UploadTemplates;
