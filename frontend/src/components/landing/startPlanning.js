/**
 * Hands a landing-page prompt to the existing /chat planner.
 * Empty prompt opens the planner without sending a message.
 */
export function startPlanning(navigate, prompt) {
  const text = typeof prompt === "string" ? prompt.trim() : "";
  if (!text) {
    navigate("/chat");
    return;
  }

  navigate("/chat", {
    state: {
      initialPrompt: text,
      requestId: crypto.randomUUID(),
    },
  });
}
