import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#e91e8c",
      light: "#ff6ec4",
      dark: "#b0006a",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1a1a2e",
      light: "#2d2d4e",
      dark: "#0d0d1a",
      contrastText: "#ffffff",
    },
    background: {
      default: "#1a1a2e",
      paper: "rgba(255,255,255,0.05)",
    },
    text: {
      primary: "#ffffff",
      secondary: "#ffb3d9",
    },
    success: { main: "#4caf50" },
    warning: { main: "#ff9800" },
    error: { main: "#f44336" },
    info: { main: "#e91e8c" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #e91e8c, #b0006a)",
          "&:hover": {
            background: "linear-gradient(135deg, #ff6ec4, #e91e8c)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(233,30,140,0.2)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "rgba(233,30,140,0.4)" },
            "&:hover fieldset": { borderColor: "#e91e8c" },
            "&.Mui-focused fieldset": { borderColor: "#e91e8c" },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "linear-gradient(180deg, #1a1a2e 0%, #2d0a2e 100%)",
          borderRight: "1px solid rgba(233,30,140,0.3)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #1a1a2e, #2d0a2e)",
          borderBottom: "1px solid rgba(233,30,140,0.3)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 8px",
          "&.Mui-selected": {
            background: "rgba(233,30,140,0.2)",
            borderLeft: "3px solid #e91e8c",
          },
          "&:hover": {
            background: "rgba(233,30,140,0.1)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: "linear-gradient(135deg, #1a1a2e, #2d0a2e)",
          border: "1px solid rgba(233,30,140,0.3)",
        },
      },
    },
  },
});

export default theme;
