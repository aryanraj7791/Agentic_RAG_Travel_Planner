import { Box, Container, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        py: 4,
        bgcolor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              ✈️ Travel Planner
            </Typography>
            <Typography variant="body2">Plan smarter. Travel better.</Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
            <Link component={RouterLink} to="/chat" underline="hover" color="text.primary" fontWeight={600}>
              Start Planning
            </Link>
            <Link
              href="https://github.com/aryanraj7791/Agentic_RAG_Travel_Planner"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="text.secondary"
            >
              GitHub
            </Link>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ display: "block", mt: 3 }}>
          Built with React · FastAPI · LangGraph · Gemini
        </Typography>
      </Container>
    </Box>
  );
}
