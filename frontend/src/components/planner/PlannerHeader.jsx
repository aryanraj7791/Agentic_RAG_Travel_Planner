import { Box, Button, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function PlannerHeader({ onNewChat, disabled }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
        mb: { xs: 2.5, md: 3 },
      }}
    >
      <Box>
        <Typography variant="overline" sx={{ color: "secondary.main" }}>
          Travel planning workspace
        </Typography>
        <Typography variant="h3" component="h1" sx={{ mt: 0.25 }}>
          Your AI Travel Assistant
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Plan, refine, and explore your trip through conversation.
        </Typography>
      </Box>
      <Button
        startIcon={<RefreshIcon />}
        onClick={onNewChat}
        variant="outlined"
        size="small"
        disabled={disabled}
      >
        New chat
      </Button>
    </Box>
  );
}
