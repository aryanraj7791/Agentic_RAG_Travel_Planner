import { Box, Chip, Typography } from "@mui/material";

export const STARTER_PROMPTS = [
  { label: "🌴 3 days in Goa", prompt: "Plan a 3-day trip to Goa" },
  { label: "🏔️ Budget trip to Manali", prompt: "Plan a budget trip to Manali" },
  { label: "🌊 5 days in Kerala", prompt: "Plan a 5-day trip to Kerala" },
  { label: "🇮🇩 7 days in Bali", prompt: "Plan a 7-day trip to Bali" },
];

export default function SuggestedPrompts({ onSelect }) {
  return (
    <Box sx={{ mt: 2.5 }}>
      <Typography variant="caption" sx={{ display: "block", mb: 1.25, fontWeight: 600 }}>
        Get started with
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {STARTER_PROMPTS.map((item) => (
          <Chip
            key={item.prompt}
            label={item.label}
            clickable
            onClick={() => onSelect(item.prompt)}
            variant="outlined"
            sx={{
              height: 36,
              px: 0.5,
              bgcolor: "background.paper",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
