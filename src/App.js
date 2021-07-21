import "./App.css";
import { Box, makeStyles } from "@material-ui/core";
import ResponsiveDrawer from "./ResponsiveDrawer";
import Convert from "./screens/Convert";
import { HashRouter, Route } from "react-router-dom";
import UploadTemplates from "./screens/UploadTemplates";
import Settings from "./screens/Settings";


const useStyles = makeStyles(
  (theme) => ({
    root: {
      overflow: "hidden",
      height: '100vh',
      backgroundColor: theme.palette.background.default,
    },
  }),
  { name: "App" }
);

function App() {
  const classes = useStyles();

  return (
    <Box width="100vw" height="100vh" className={classes.root}>
      <HashRouter>
        <ResponsiveDrawer>
          <Route path="/" exact component={Convert} />
          <Route path="/upload-templates" component={UploadTemplates} />
          <Route path="/settings" component={Settings} />
        </ResponsiveDrawer>
      </HashRouter>
    </Box>
  );
}

export default App;
