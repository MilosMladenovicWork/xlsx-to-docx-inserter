import {
  makeStyles,
  useTheme,
  Divider,
  AppBar,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Grid,
} from "@material-ui/core";
import { Mail, Publish, Settings } from "@material-ui/icons";
import MenuIcon from "@material-ui/icons/Menu";
import React from "react";
import PropTypes from "prop-types";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: 60,
      flexShrink: 0,
    },
    [theme.breakpoints.up("md")]: {
      width: 240,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${60}px)`,
      marginLeft: 60,
    },
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${240}px)`,
      marginLeft: 240,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  rootDrawer: {
    "&::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: theme.palette.tertiary.main,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.secondary.main,
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: theme.palette.quartenary.main,
    },
  },
  drawerPaper: {
    overflow: "hidden",
    [theme.breakpoints.up("sm")]: {
      width: 60,
    },
    [theme.breakpoints.up("md")]: {
      width: 240,
    },
  },
  listItem: {
    marginBottom: theme.spacing(2),
    maxHeight: '48px',
  },
  content: {
    marginTop: theme.mixins.toolbar.minHeight + 10,
    padding: theme.spacing(4, 3),
    height: `calc(100vh - ${Number(theme.mixins.toolbar.minHeight) + 10}px)`,
    overflowY: "auto",
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(4, 5),
    },
    "&::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: theme.palette.tertiary.main,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.secondary.main,
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: theme.palette.quartenary.main,
    },
  },
  contentWithStatusLogger: {
    [theme.breakpoints.up("sm")]: {
      width: "calc(100% - 244px)",
    },
    [theme.breakpoints.up("md")]: {
      width: "calc(100% - 512px)",
    },
  },
}));

function ResponsiveDrawer(props) {
  const { window, children } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const { pathname } = useLocation();

  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <Divider />
      <List>
        <Link to="/">
          <ListItem
            className={classes.listItem}
            button
            selected={pathname === "/"}
          >
            <ListItemIcon>
              <Mail />
            </ListItemIcon>
            <ListItemText primary={"Create emails"} />
          </ListItem>
        </Link>
        <Link to="/upload-templates">
          <ListItem
            className={classes.listItem}
            button
            selected={pathname === "/upload-templates"}
          >
            <ListItemIcon>
              <Publish />
            </ListItemIcon>
            <ListItemText className={classes.listItemText} primary={"Upload templates"} />
          </ListItem>
        </Link>
        <Link to="/settings">
          <ListItem
            className={classes.listItem}
            button
            selected={pathname === "/settings"}
          >
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary={"Settings"} />
          </ListItem>
        </Link>
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            XLSX to Email
          </Typography>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            disablePortal
            container={container}
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              root: classes.rootDrawer,
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <Grid
        container
        className={clsx(classes.content, {
          [classes.contentWithStatusLogger]: pathname === "/",
        })}
      >
        {children}
      </Grid>
    </div>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default ResponsiveDrawer;
