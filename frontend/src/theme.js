import { createTheme } from "@mui/material/styles";

const NAVY = "#1E3A4C";
const TERRACOTTA = "#B85C38";
const LINEN = "#F6F3EE";
const INK = "#1A2332";
const MUTED = "#5C6570";
const BORDER = "#E6E1D8";
const SURFACE = "#FFFFFF";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: NAVY,
      light: "#2F5568",
      dark: "#152C3A",
      contrastText: SURFACE,
    },
    secondary: {
      main: TERRACOTTA,
      light: "#C97A5C",
      dark: "#93472A",
      contrastText: SURFACE,
    },
    background: {
      default: LINEN,
      paper: SURFACE,
    },
    text: {
      primary: INK,
      secondary: MUTED,
    },
    divider: BORDER,
    success: { main: "#3D6B5A" },
    warning: { main: "#C4922A" },
    error: { main: "#B42318" },
    info: { main: "#3D6B8A" },
    action: {
      hover: "rgba(30, 58, 76, 0.06)",
      selected: "rgba(30, 58, 76, 0.08)",
      focus: "rgba(30, 58, 76, 0.16)",
    },
  },
  shape: {
    borderRadius: 10,
  },
  spacing: 8,
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: "clamp(2rem, 4vw, 3rem)",
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: "-0.025em",
      color: INK,
    },
    h2: {
      fontSize: "clamp(1.625rem, 3vw, 2.25rem)",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
      color: INK,
    },
    h3: {
      fontSize: "clamp(1.375rem, 2.2vw, 1.75rem)",
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: "-0.015em",
      color: INK,
    },
    h4: {
      fontSize: "clamp(1.2rem, 1.8vw, 1.5rem)",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
      color: INK,
    },
    h5: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.35,
      color: INK,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: INK,
    },
    subtitle1: {
      fontSize: "1.0625rem",
      fontWeight: 500,
      lineHeight: 1.5,
      color: INK,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 600,
      lineHeight: 1.45,
      letterSpacing: "0.01em",
      color: MUTED,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.65,
      color: INK,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.6,
      color: MUTED,
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.45,
      color: MUTED,
    },
    overline: {
      fontSize: "0.6875rem",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: MUTED,
    },
    button: {
      fontSize: "0.9375rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0.01em",
      textTransform: "none",
    },
  },
  shadows: [
    "none",
    "0 1px 2px rgba(26, 35, 50, 0.05)",
    "0 2px 8px rgba(26, 35, 50, 0.06)",
    "0 4px 14px rgba(26, 35, 50, 0.07)",
    "0 8px 24px rgba(26, 35, 50, 0.08)",
    "0 12px 32px rgba(26, 35, 50, 0.09)",
    ...Array(19).fill("0 12px 32px rgba(26, 35, 50, 0.09)"),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        body: {
          backgroundColor: LINEN,
          color: INK,
        },
        ":focus-visible": {
          outline: `2px solid ${NAVY}`,
          outlineOffset: 2,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: "inherit",
      },
      styleOverrides: {
        root: {
          backgroundColor: SURFACE,
          color: INK,
          borderBottom: `1px solid ${BORDER}`,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
          "@media (min-width: 600px)": {
            minHeight: 68,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 16,
          paddingBlock: 8,
        },
        sizeLarge: {
          paddingInline: 20,
          paddingBlock: 10,
          fontSize: "1rem",
        },
        sizeSmall: {
          paddingInline: 12,
          paddingBlock: 6,
          fontSize: "0.8125rem",
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#152C3A",
          },
        },
        outlined: {
          borderColor: BORDER,
          color: INK,
          "&:hover": {
            borderColor: NAVY,
            backgroundColor: "rgba(30, 58, 76, 0.04)",
          },
        },
        text: {
          color: MUTED,
          "&:hover": {
            backgroundColor: "rgba(30, 58, 76, 0.06)",
            color: INK,
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: SURFACE,
        },
        outlined: {
          borderColor: BORDER,
        },
        elevation1: {
          boxShadow: "0 1px 2px rgba(26, 35, 50, 0.05)",
          border: `1px solid ${BORDER}`,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          boxShadow: "none",
          backgroundColor: SURFACE,
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          "&:hover": {
            borderColor: "#D4CEC4",
            boxShadow: "0 2px 8px rgba(26, 35, 50, 0.06)",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: SURFACE,
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: BORDER,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#C9C2B6",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: NAVY,
            borderWidth: 1.5,
          },
        },
        input: {
          paddingBlock: 12,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        outlined: {
          borderColor: BORDER,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: NAVY,
        },
      },
    },
  },
});

export default theme;
