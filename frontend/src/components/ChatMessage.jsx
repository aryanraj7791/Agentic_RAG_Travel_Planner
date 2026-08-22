import { Box, Paper, Typography, Avatar } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ItineraryView from "./planner/ItineraryView";

export default function ChatMessage({ role, content }) {
  const isUser = role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        mb: { xs: 2.5, md: 3 },
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? "secondary.main" : "primary.main",
          width: 36,
          height: 36,
          flexShrink: 0,
        }}
      >
        {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
      </Avatar>
      <Paper
        component="article"
        elevation={0}
        sx={{
          p: { xs: 1.75, sm: 2.25 },
          maxWidth: isUser ? { xs: "86%", sm: "72%" } : "calc(100% - 52px)",
          minWidth: 0,
          bgcolor: isUser ? "secondary.main" : "background.paper",
          color: isUser ? "secondary.contrastText" : "text.primary",
          border: isUser ? "none" : "1px solid",
          borderColor: "divider",
          borderRadius: isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
          boxShadow: isUser ? "none" : 1,
          animation: "messageIn 0.2s ease both",
          "@keyframes messageIn": {
            from: { opacity: 0, transform: "translateY(5px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
          "& p": { mt: 0, mb: 1.25 },
          "& p:last-child": { mb: 0 },
          "& ul, & ol": { pl: 2.5, my: 1.25 },
          "& li": { mb: 0.5 },
          "& strong": { fontWeight: 700 },
          "& blockquote": {
            m: 0,
            pl: 1.5,
            borderLeft: "3px solid",
            borderColor: isUser ? "rgba(255, 255, 255, 0.65)" : "secondary.main",
            color: isUser ? "inherit" : "text.secondary",
          },
          "& pre": {
            overflowX: "auto",
            p: 1.25,
            borderRadius: 1,
            bgcolor: isUser ? "rgba(0, 0, 0, 0.12)" : "background.default",
          },
          "& code": { overflowWrap: "anywhere" },
          "& table": {
            display: "block",
            width: "100%",
            overflowX: "auto",
            borderCollapse: "collapse",
            my: 1.25,
          },
          "& th, & td": {
            textAlign: "left",
            verticalAlign: "top",
            p: 0.75,
            borderBottom: "1px solid",
            borderColor: isUser ? "rgba(255, 255, 255, 0.3)" : "divider",
          },
        }}
      >
        {isUser ? (
          <Typography variant="body1" sx={{ color: "inherit" }}>{content}</Typography>
        ) : (
          <ItineraryView content={content} />
        )}
      </Paper>
    </Box>
  );
}
