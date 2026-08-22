import { Box, CircularProgress, Typography } from "@mui/material";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import { useEffect, useState } from "react";

const STATUS_STEPS = [
  {
    after: 0,
    title: "Planning your trip...",
    detail: "Preparing a thoughtful response for your request.",
  },
  {
    after: 5,
    title: "Researching the best options...",
    detail: "Bringing together useful travel guidance for you.",
  },
  {
    after: 15,
    title: "Gathering travel details...",
    detail: "A good plan can take a little time to prepare.",
  },
  {
    after: 30,
    title: "Your trip is taking a little longer than usual.",
    detail: "Hang tight — the travel planner may be waking up.",
  },
];

export default function PlanningStatus() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const status = [...STATUS_STEPS].reverse().find((step) => elapsedSeconds >= step.after) || STATUS_STEPS[0];

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-atomic="true"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 2.25,
        px: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ position: "relative", display: "grid", placeItems: "center", width: 38, height: 38, flexShrink: 0 }}>
        <CircularProgress size={38} thickness={2.5} sx={{ color: "secondary.main" }} />
        <TravelExploreOutlinedIcon sx={{ fontSize: 17, color: "primary.main", position: "absolute" }} />
      </Box>
      <Box>
        <Typography variant="subtitle2" color="text.primary">
          {status.title}
        </Typography>
        <Typography variant="caption" component="p" sx={{ mt: 0.25 }}>
          {status.detail}
        </Typography>
      </Box>
    </Box>
  );
}
