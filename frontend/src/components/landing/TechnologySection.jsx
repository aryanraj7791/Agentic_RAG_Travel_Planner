import { Box, Container, Typography } from "@mui/material";

const STACK = ["LangGraph", "Hybrid RAG", "Qdrant", "Gemini", "FastAPI", "MongoDB"];

export default function TechnologySection() {
  return (
    <Box
      component="section"
      aria-labelledby="tech-heading"
      sx={{ py: { xs: 5, md: 7 } }}
    >
      <Container maxWidth="lg">
        <Typography
          id="tech-heading"
          variant="h3"
          sx={{ mb: 1, fontSize: { xs: "1.35rem", md: "1.5rem" } }}
        >
          Built on a powerful AI planning engine
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, maxWidth: 480 }}>
          The product you use is a travel assistant. The engine behind it is a production planning stack.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
          {STACK.map((name) => (
            <Box
              key={name}
              sx={{
                px: 1.75,
                py: 0.85,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                typography: "body2",
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {name}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
