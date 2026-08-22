import { Box, Button, Typography } from "@mui/material";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";

const STARTER_PROMPTS = [
  "Plan a 3-day trip to Goa",
  "Plan a budget trip to Manali",
  "What should I know before visiting Bali?",
];

export default function EmptyPlannerState({ onSelect, disabled }) {
  return (
    <Box
      sx={{
        display: "grid",
        placeItems: "center",
        minHeight: { xs: 300, md: 390 },
        py: 4,
        textAlign: "center",
      }}
    >
      <Box sx={{ maxWidth: 500 }}>
        <Box
          aria-hidden
          sx={{
            width: 48,
            height: 48,
            mx: "auto",
            mb: 2,
            display: "grid",
            placeItems: "center",
            borderRadius: 2,
            color: "primary.main",
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <ExploreOutlinedIcon />
        </Box>
        <Typography variant="h4" component="h2" sx={{ mb: 1 }}>
          Where would you like to go?
        </Typography>
        <Typography variant="body2" sx={{ maxWidth: 410, mx: "auto", mb: 3 }}>
          Tell me your destination, dates, budget, or travel style. I&apos;ll help you build the plan.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1 }}>
          {STARTER_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              variant="outlined"
              size="small"
              onClick={() => onSelect(prompt)}
              disabled={disabled}
            >
              {prompt}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
