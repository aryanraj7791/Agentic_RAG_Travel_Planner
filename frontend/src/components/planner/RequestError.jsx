import { Alert, Box, Button, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function RequestError({ error, onRetry, retrying }) {
  if (!error) return null;

  return (
    <Alert severity="error" role="alert" sx={{ mt: 1.5, alignItems: "flex-start" }}>
      <Typography variant="subtitle2" color="inherit" sx={{ mb: 0.25 }}>
        {error.title}
      </Typography>
      <Typography variant="body2" color="inherit">
        {error.detail}
      </Typography>
      <Box sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          disabled={retrying}
          aria-label="Retry the failed travel planning request"
        >
          Retry
        </Button>
      </Box>
    </Alert>
  );
}
