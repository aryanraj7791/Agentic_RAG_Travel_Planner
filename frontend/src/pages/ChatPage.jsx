import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatMessage from "../components/ChatMessage";
import RecommendationsPanel from "../components/RecommendationsPanel";
import SourcesPanel from "../components/SourcesPanel";
import ExecutionTracePanel from "../components/ExecutionTracePanel";
import { sendChat } from "../services/api";

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastResponse, setLastResponse] = useState(null);

  const sendTurn = async (text, history) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const updated = [...history, { role: "user", content: trimmed }];
    setMessages(updated);
    setLoading(true);
    setError("");
    setLastResponse(null);

    try {
      const data = await sendChat(updated);
      setMessages([...updated, { role: "assistant", content: data.reply }]);
      setLastResponse(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reach the travel planner API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const prompt = location.state?.initialPrompt;
    const requestId = location.state?.requestId;
    if (typeof prompt !== "string" || !prompt.trim() || !requestId) return;

    const lockKey = `chat-handoff:${requestId}`;
    if (sessionStorage.getItem(lockKey)) return;
    sessionStorage.setItem(lockKey, "1");

    navigate("/chat", { replace: true, state: {} });
    void sendTurn(prompt, []);
    // Landing handoff runs once per requestId; sendTurn is stable for this mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await sendTurn(text, messages);
  };

  const handleNewChat = () => {
    setMessages([]);
    setLastResponse(null);
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Plan Your Trip
        </Typography>
        <Button startIcon={<RefreshIcon />} onClick={handleNewChat} variant="outlined" size="small">
          New Chat
        </Button>
      </Box>

      <Paper elevation={1} sx={{ p: 3, minHeight: 420, borderRadius: 3, mb: 2 }}>
        {messages.length === 0 && (
          <Typography color="text.secondary" textAlign="center" sx={{ mt: 8 }}>
            Ask me about destinations, itineraries, weather, currency, or travel tips.
            <br />
            Example: &quot;Plan a 5-day trip to Jaipur in December&quot;
          </Typography>
        )}

        {messages.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
        ))}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {lastResponse && !loading && (
          <>
            <RecommendationsPanel recommendations={lastResponse.recommendations} />
            <SourcesPanel sources={lastResponse.sources} />
            <ExecutionTracePanel traces={lastResponse.execution_traces} />
            {lastResponse.end_of_conversation && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Your travel plan is complete. Start a new chat for another trip.
              </Alert>
            )}
          </>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Describe your travel plans..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || lastResponse?.end_of_conversation}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !input.trim() || lastResponse?.end_of_conversation}
          sx={{ px: 3 }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Container>
  );
}
