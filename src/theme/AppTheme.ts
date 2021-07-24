import { createMuiTheme } from "@material-ui/core/styles";

declare module "@material-ui/core/styles/createPalette" {
  interface Palette {
    tertiary: PaletteColor;
    quartenary: PaletteColor;
  }

  interface PaletteOptions {
    tertiary?: PaletteColorOptions;
    quartenary?: PaletteColorOptions;
  }
}

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
    tertiary: {
      light: "#307678",
      dark: "#307678",
      main: "#307678",
    },
    quartenary: {
      light: "#71c3c6",
      dark: "#71c3c6",
      main: "#71c3c6",
    },
  },
  overrides: {
    MuiSelect: {
      select: {
        minWidth: 170,
      },
    },
  },
});

export default theme;
