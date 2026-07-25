import { Box, Paper, Typography, Avatar } from "@mui/material";
import ReactMarkdown from "react-markdown";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";

export default function ChatMessage({ role, content }) {
  const isUser = role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        flexDirection: isUser ? "row-reverse" : "row",
        mb: 2,
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? "secondary.main" : "primary.main",
          width: 36,
          height: 36,
        }}
      >
        {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
      </Avatar>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          maxWidth: "75%",
          bgcolor: isUser ? "secondary.light" : "background.paper",
          borderRadius: 2,
          "& p": { m: 0, mb: 1 },
          "& p:last-child": { mb: 0 },
        }}
      >
        {isUser ? (
          <Typography variant="body1">{content}</Typography>
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
      </Paper>
    </Box>
  );
}
