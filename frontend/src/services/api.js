import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 300000,
  headers: { "Content-Type": "application/json" },
});

export async function sendChat(messages) {
  const { data } = await api.post("/chat", { messages });
  return data;
}

export async function checkHealth() {
  const { data } = await api.get("/health");
  return data;
}
