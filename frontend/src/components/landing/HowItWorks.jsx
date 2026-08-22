import { Box, Container, Typography } from "@mui/material";

const STEPS = [
  {
    n: "01",
    title: "Understand",
    desc: "Your destination, preferences, constraints, and intent are read from what you actually asked.",
  },
  {
    n: "02",
    title: "Research",
    desc: "Relevant travel knowledge and live information are gathered to support the plan.",
  },
  {
    n: "03",
    title: "Plan",
    desc: "The planner turns that context into a personalized itinerary you can refine.",
  },
  {
    n: "04",
    title: "Ground",
    desc: "Sources stay attached so recommendations remain transparent and traceable.",
  },
];

export default function HowItWorks() {
  return (
    <Box
      component="section"
      aria-labelledby="how-heading"
      sx={{ py: { xs: 6, md: 8 } }}
    >
      <Container maxWidth="lg">
        <Typography id="how-heading" variant="h2" sx={{ mb: 1 }}>
          How your trip comes together
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 5, maxWidth: 520 }}>
          From your question to a grounded itinerary, in four product steps.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
            gap: { xs: 2.5, md: 2 },
          }}
        >
          {STEPS.map((step, index) => (
            <Box
              key={step.n}
              sx={{
                position: "relative",
                p: 2.5,
                pr: { md: 3 },
                borderTop: "2px solid",
                borderColor: "secondary.main",
              }}
            >
              {index < STEPS.length - 1 && (
                <Box
                  aria-hidden
                  sx={{
                    display: { xs: "none", md: "block" },
                    position: "absolute",
                    top: 18,
                    right: 0,
                    width: 12,
                    height: 2,
                    bgcolor: "divider",
                  }}
                />
              )}
              <Typography
                variant="overline"
                sx={{ color: "secondary.main", fontWeight: 700 }}
              >
                {step.n}
              </Typography>
              <Typography variant="h5" component="h3" sx={{ mt: 0.5, mb: 1 }}>
                {step.title}
              </Typography>
              <Typography variant="body2">{step.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
