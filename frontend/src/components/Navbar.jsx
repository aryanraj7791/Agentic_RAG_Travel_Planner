import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isPlanner = pathname === "/chat";

  return (
    <AppBar position="sticky">
      <Toolbar
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          gap: 1,
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          aria-label="Travel Planner home"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexGrow: 1,
            minWidth: 0,
            textDecoration: "none",
            color: "text.primary",
          }}
        >
          <Typography component="span" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" }, lineHeight: 1 }}>
            ✈️
          </Typography>
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Travel Planner
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
          <Button
            component={RouterLink}
            to="/"
            aria-current={isHome ? "page" : undefined}
            sx={{
              color: isHome ? "text.primary" : "text.secondary",
              fontWeight: isHome ? 700 : 500,
              borderRadius: 0,
              px: { xs: 1, sm: 1.5 },
              borderBottom: "2px solid",
              borderColor: isHome ? "secondary.main" : "transparent",
              "&:hover": {
                backgroundColor: "transparent",
                color: "text.primary",
              },
            }}
          >
            Home
          </Button>
          <Button
            component={RouterLink}
            to="/chat"
            variant={isPlanner ? "outlined" : "contained"}
            color="primary"
            aria-current={isPlanner ? "page" : undefined}
            sx={{
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Start Planning
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
