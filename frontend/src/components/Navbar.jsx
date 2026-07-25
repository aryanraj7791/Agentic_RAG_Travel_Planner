import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { Link as RouterLink } from "react-router-dom";

export default function Navbar() {
  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "primary.main" }}>
      <Toolbar>
        <FlightTakeoffIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Travel Planner
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            component={RouterLink}
            to="/chat"
            sx={{ borderColor: "rgba(255,255,255,0.5)" }}
          >
            Start Planning
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
