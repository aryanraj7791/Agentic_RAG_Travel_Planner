import { Box, Button, Paper, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export default function ChatComposer({ value, onChange, onKeyDown, onSend, disabled }) {
  return (
    <Paper
      component="form"
      elevation={1}
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        p: 1,
        mt: 1.5,
        borderRadius: 2,
      }}
    >
      <TextField
        fullWidth
        multiline
        minRows={1}
        maxRows={4}
        placeholder="Ask about destinations, itineraries, budgets, weather, or anything about your trip..."
        aria-label="Ask the travel planner a question"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "transparent",
            "& fieldset": { border: "none" },
            "&:hover fieldset": { border: "none" },
            "&.Mui-focused fieldset": { border: "none" },
          },
          "& .MuiOutlinedInput-input": { py: 1 },
        }}
      />
      <Button
        type="submit"
        variant="contained"
        aria-label="Send message"
        disabled={disabled || !value.trim()}
        sx={{ minWidth: 44, width: 44, height: 44, p: 0, flexShrink: 0 }}
      >
        <SendIcon fontSize="small" />
      </Button>
    </Paper>
  );
}
