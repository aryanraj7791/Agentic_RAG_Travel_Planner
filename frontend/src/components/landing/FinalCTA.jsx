import { Box, Button, Container, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function FinalCTA() {
  return (
    <Box
      component="section"
      aria-labelledby="cta-heading"
      sx={{ py: { xs: 6, md: 9 }, px: 2 }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: "center",
            py: { xs: 5, md: 7 },
            px: { xs: 3, md: 5 },
            borderRadius: 3,
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Typography id="cta-heading" variant="h2" sx={{ color: "inherit", mb: 1.5 }}>
            Ready to plan your next adventure?
          </Typography>
          <Typography sx={{ opacity: 0.88, mb: 3.5, maxWidth: 440, mx: "auto" }}>
            Start with a destination, a dream, or simply a question.
          </Typography>
          <Button
            component={RouterLink}
            to="/chat"
            variant="contained"
            size="large"
            sx={{
              bgcolor: "background.paper",
              color: "primary.main",
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            Start Planning
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
