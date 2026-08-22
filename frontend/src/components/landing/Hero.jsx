import { useState } from "react";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate } from "react-router-dom";
import SuggestedPrompts from "./SuggestedPrompts";
import { startPlanning } from "./startPlanning";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=70";

export default function Hero() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    startPlanning(navigate, prompt);
  };

  return (
    <Box
      component="section"
      aria-labelledby="hero-heading"
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 5, md: 8 },
        pb: { xs: 6, md: 9 },
        animation: "landingFade 0.55s ease both",
        "@keyframes landingFade": {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "none" },
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
            gap: { xs: 4, md: 6 },
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: "secondary.main", letterSpacing: "0.12em" }}
            >
              AI travel assistant
            </Typography>
            <Typography id="hero-heading" variant="h1" sx={{ mt: 1, mb: 2 }}>
              Plan your next adventure with AI.
            </Typography>
            <Typography
              variant="subtitle1"
              component="p"
              color="text.secondary"
              sx={{ maxWidth: 520, mb: 3.5, fontWeight: 400, lineHeight: 1.65 }}
            >
              Tell us where you want to go, how you like to travel, and what
              matters to you. Get a personalized, research-grounded trip plan
              built around you.
            </Typography>

            <Paper
              component="form"
              onSubmit={handleSubmit}
              elevation={1}
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                display: "flex",
                alignItems: "flex-end",
                gap: 1,
                borderRadius: 3,
              }}
            >
              <TextField
                fullWidth
                multiline
                maxRows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Plan a 5-day trip to Goa under ₹40,000..."
                aria-label="Where do you want to go?"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "transparent",
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                  },
                  "& .MuiOutlinedInput-input": {
                    py: 1.25,
                    fontSize: "1.05rem",
                  },
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    startPlanning(navigate, prompt);
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                aria-label="Start planning with this prompt"
                sx={{ flexShrink: 0, minWidth: { xs: 48, sm: 56 }, px: { xs: 1.5, sm: 2.5 } }}
              >
                <SendIcon />
              </Button>
            </Paper>

            <SuggestedPrompts onSelect={setPrompt} />
          </Box>

          <Box
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: 3,
              aspectRatio: { xs: "16 / 9", md: "4 / 5" },
              maxHeight: { xs: 220, sm: 380, md: 460 },
              mx: { sm: "auto", md: 0 },
              width: "100%",
            }}
          >
            <Box
              component="img"
              src={HERO_IMAGE}
              alt="Calm lake and mountains at sunrise, suggesting a thoughtful journey"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.5s ease",
                "&:hover": { transform: "scale(1.03)" },
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
