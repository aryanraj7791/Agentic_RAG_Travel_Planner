import {
  Box,
  Container,
  Paper,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatMessage from "../components/ChatMessage";
import PlannerHeader from "../components/planner/PlannerHeader";
import EmptyPlannerState from "../components/planner/EmptyPlannerState";
import ChatComposer from "../components/planner/ChatComposer";
import TripWorkspace from "../components/planner/TripWorkspace";
import PlanningStatus from "../components/planner/PlanningStatus";
import RequestError from "../components/planner/RequestError";
import { sendChat } from "../services/api";

function getRequestError(err) {
  if (err?.code === "ECONNABORTED" || /timeout/i.test(err?.message || "")) {
    return {
      title: "The trip planner is taking longer than expected.",
      detail: "You can retry without rewriting your request.",
    };
  }

  if (!err?.response || /network|cors/i.test(err?.message || "")) {
    return {
      title: "Couldn’t reach the travel planner.",
      detail: "The service may be waking up or temporarily unavailable. Please try again.",
    };
  }

  return {
    title: "Something went wrong while planning your trip.",
    detail: "Please retry your request in a moment.",
  };
}

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [failedRequest, setFailedRequest] = useState(null);

  const sendTurn = async (text, history) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const updated = [...history, { role: "user", content: trimmed }];
    setMessages(updated);
    setLoading(true);
    setError(null);
    setFailedRequest(null);
    setLastResponse(null);

    try {
      const data = await sendChat(updated);
      setMessages([...updated, { role: "assistant", content: data.reply }]);
      setLastResponse(data);
    } catch (err) {
      setError(getRequestError(err));
      setFailedRequest({ text: trimmed, history });
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
    setError(null);
    setFailedRequest(null);
    setInput("");
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStarterPrompt = (prompt) => {
    void sendTurn(prompt, messages);
  };

  const handleRetry = () => {
    if (!failedRequest || loading) return;
    void sendTurn(failedRequest.text, failedRequest.history);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
      <PlannerHeader
        onNewChat={handleNewChat}
        disabled={loading}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.65fr) minmax(300px, 0.8fr)" },
          gap: { xs: 3, lg: 4 },
          alignItems: "start",
        }}
      >
        <Box component="section" aria-label="Conversation" sx={{ minWidth: 0 }}>
          <Paper
            elevation={1}
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              minHeight: { xs: 320, md: 500 },
              borderRadius: 2,
            }}
          >
            {messages.length === 0 && !loading && (
              <EmptyPlannerState onSelect={handleStarterPrompt} disabled={loading} />
            )}

            {messages.map((msg, idx) => (
              <ChatMessage key={idx} role={msg.role} content={msg.content} />
            ))}

            {loading && <PlanningStatus />}

            {lastResponse?.end_of_conversation && !loading && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Your travel plan is complete. Start a new chat for another trip.
              </Alert>
            )}
          </Paper>

          <RequestError error={error} onRetry={handleRetry} retrying={loading} />

          <ChatComposer
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onSend={handleSend}
            disabled={loading || lastResponse?.end_of_conversation}
          />
        </Box>

        <TripWorkspace response={lastResponse} loading={loading} />
      </Box>
    </Container>
  );
}
