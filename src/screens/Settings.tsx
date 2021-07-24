import {
  makeStyles,
  FormControl,
  Input,
  Grid,
  Switch,
  InputAdornment,
  InputLabel,
  IconButton,
  Typography,
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { useCallback, useEffect, useState } from "react";
import Section from "../screens/components/Section";
import theme from "../theme/AppTheme";

const useStyles = makeStyles(
  () => ({
    formControl: {
      minWidth: "100%",
      paddingRight: theme.spacing(2),
      marginBottom: theme.spacing(4),
    },
    switchControl: {
      marginBottom: theme.spacing(4),
    },
    switchLabel: {
      color: "rgba(255, 255, 255, 0.7)",
    },
    numberInput: {
      "& input": {
        "&::-webkit-outer-spin-button": {
          "-webkit-appearance": "none",
        },
        "&::-webkit-inner-spin-button": {
          "-webkit-appearance": "none",
        },
      },
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
  const [service, setService] = useState("");
  const [port, setPort] = useState(0);
  const [secure, setSecure] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  useEffect(() => {
    const getConfiguration = async () => {
      const configurationJSON = await window.electron.getConfigurationJSON();
      if (configurationJSON) {
        const configurationObject = JSON.parse(configurationJSON);
        const {
          host,
          service,
          port,
          secure,
          auth: { user, pass },
        } = configurationObject;
        setHost(host);
        setService(service);
        setPort(port);
        setSecure(secure);
        setUser(user);
        setPass(pass);
      }
    };
    getConfiguration();
  }, []);

  const saveConfiguration = useCallback(
    async (service, host, port, secure, user, pass) => {
      const configuration = await window.electron.createConfiguration(
        service,
        host,
        port,
        secure,
        { user, pass }
      );
      window.electron.saveConfiguration(configuration);
    },
    []
  );

  return (
    <Grid container direction="column">
      <Section isOpen title="Global Configurations" hasDivider={false}>
        <Grid container>
          <Grid item>
            <FormControl className={classes.formControl}>
              <InputLabel>Service</InputLabel>
              <Input
                onChange={(e) => {
                  setService(e.target.value);
                  saveConfiguration(
                    e.target.value,
                    host,
                    port,
                    secure,
                    user,
                    pass
                  );
                }}
                value={service}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item>
            <FormControl className={classes.formControl}>
              <InputLabel>Host</InputLabel>
              <Input
                fullWidth
                onChange={(e) => {
                  setHost(e.target.value);
                  saveConfiguration(
                    service,
                    e.target.value,
                    port,
                    secure,
                    user,
                    pass
                  );
                }}
                value={host}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item>
            <FormControl className={classes.formControl}>
              <InputLabel>Port</InputLabel>
              <Input
                className={classes.numberInput}
                fullWidth
                type="number"
                onChange={(e) => {
                  saveConfiguration(
                    service,
                    host,
                    +e.target.value,
                    secure,
                    user,
                    pass
                  );
                  setPort(+e.target.value);
                }}
                value={port}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item>
            <FormControl className={classes.switchControl}>
              <Typography variant="caption" className={classes.switchLabel}>
                Secure
              </Typography>
              <Switch
                checked={secure}
                onChange={(e) => {
                  saveConfiguration(
                    service,
                    host,
                    port,
                    e.target.checked,
                    user,
                    pass
                  );
                  setSecure(e.target.checked);
                }}
                color="primary"
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item>
            <FormControl className={classes.formControl}>
              <InputLabel>User</InputLabel>
              <Input
                fullWidth
                onChange={(e) => {
                  saveConfiguration(
                    service,
                    host,
                    port,
                    secure,
                    e.target.value,
                    pass
                  );
                  setUser(e.target.value);
                }}
                value={user}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item>
            <FormControl className={classes.formControl}>
              <InputLabel>Password</InputLabel>
              <Input
                fullWidth
                onChange={(e) => {
                  saveConfiguration(
                    service,
                    host,
                    port,
                    secure,
                    user,
                    e.target.value
                  );
                  setPass(e.target.value);
                }}
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
