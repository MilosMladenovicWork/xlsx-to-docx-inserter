import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      light: "#1D3557",
      dark: "#1D3555",
      main: "#1D3555",
    },
    secondary: {
      light: "#A8DADC",
      dark: "#A8DADC",
      main: "#A8DADC",
    },
    background: {
      default: "#0F1B2B",
      paper: "#1D3557",
    },
  },
});

export default theme;