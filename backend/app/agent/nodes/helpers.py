"""Shared helpers for LangGraph nodes."""

from __future__ import annotations

import re

from app.agent.state import AgentState

SAFETY_REFUSAL = (
    "I'm a travel planning assistant and can't help with that request. "
    "I can help you plan trips, find destinations, compare options, "
    "check weather, currency, and distances. What travel plans can I help with?"
)

OUT_OF_SCOPE_PATTERNS = [
    r"\b(medical|diagnos|prescri|doctor|symptom)\b",
    r"\b(illegal|hack|weapon|drug)\b",
    r"\b(financial advice|invest|stock|crypto)\b",
]

VALID_TOOLS = {
    "weather", "currency", "maps", "distance", "places",
    "flights", "hotels", "visa", "web_search",
}

_KNOWN_CITIES = [
    "jaipur", "goa", "manali", "delhi", "kochi", "mumbai", "bangalore",
    "chennai", "hyderabad", "kerala", "agra", "udaipur", "shimla",
    "pune", "kolkata", "varanasi", "amritsar", "srinagar", "leh",
]

_CITY_DISPLAY = {
    "goa": "Goa",
    "kochi": "Kochi",
    "kerala": "Kerala",
}


def extract_last_user_message(state: AgentState) -> str:
    for msg in reversed(state.get("messages", [])):
        if isinstance(msg, dict) and msg.get("role") == "user":
            return msg.get("content", "")
        if hasattr(msg, "type") and msg.type == "human":
            return msg.content
    return state.get("user_query", "")


def detect_city(text: str) -> str:
    lowered = text.lower()
    for city in _KNOWN_CITIES:
        if city in lowered:
            return _CITY_DISPLAY.get(city, city.title())
    return ""


def extract_travel_date(text: str) -> str:
    match = re.search(
        r"\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})\b",
        text,
        re.I,
    )
    return match.group(1) if match else ""


def format_history(messages: list, *, max_turns: int = 4) -> str:
    """Only recent turns for LLM context — latest query drives the answer."""
    lines = []
    for msg in messages[-max_turns * 2 :]:
        if isinstance(msg, dict):
            lines.append(f"{msg.get('role', 'user')}: {msg.get('content', '')}")
        elif hasattr(msg, "type"):
            role = "user" if msg.type == "human" else "assistant"
            lines.append(f"{role}: {msg.content}")
    return "\n".join(lines)


def format_context(docs: list[dict]) -> str:
    if not docs:
        return "No retrieved documents."
    parts = []
    for i, doc in enumerate(docs[:6], 1):
        parts.append(
            f"[{i}] {doc.get('title', 'Untitled')} ({doc.get('url', 'no url')})\n"
            f"{doc.get('text', '')[:600]}"
        )
    return "\n\n".join(parts)


def score_doc_relevance(doc: dict, query: str, city: str = "") -> float:
    qtokens = set(re.findall(r"\w+", query.lower())) - {"i", "a", "the", "to", "in", "on", "me", "my"}
    text = f"{doc.get('title', '')} {doc.get('text', '')} {doc.get('city', '')}".lower()
    overlap = sum(1 for t in qtokens if t in text)
    score = float(overlap)
    if city and doc.get("city", "").lower() == city.lower():
        score += 20.0
    score += doc.get("rrf_score", doc.get("score", 0)) * 0.1
    return score


def filter_relevant_docs(docs: list[dict], query: str, city: str = "") -> list[dict]:
    if not docs:
        return []
    scored = [(score_doc_relevance(d, query, city), d) for d in docs]
    scored.sort(key=lambda x: x[0], reverse=True)

    if city:
        city_docs = [(s, d) for s, d in scored if d.get("city", "").lower() == city.lower()]
        if city_docs:
            return [d for _, d in city_docs[:6]]

    # No KB doc for this city — return only docs with meaningful query overlap
    relevant = [(s, d) for s, d in scored if s >= 2.0]
    return [d for _, d in (relevant or scored[:1])[:6]]


def tools_for_query(query: str, city: str, intent: str) -> list[dict]:
    """Pick up to 2 tools based on the latest query keywords."""
    q = query.lower()
    tools: list[dict] = []

    if re.search(r"\bflight|airline|airport timing", q):
        tools.append({
            "tool": "flights",
            "args": {"origin": "", "destination": city, "date": extract_travel_date(query)},
        })
    if re.search(r"\bhotel|stay|accommodation|availability", q):
        tools.append({"tool": "hotels", "args": {"city": city, "query": "hotels"}})
    if re.search(r"\bvisa|e-visa", q):
        tools.append({"tool": "visa", "args": {"country": city or "India"}})
    if re.search(r"\bweather|temperature|rain", q) and city:
        tools.append({"tool": "weather", "args": {"city": city}})
    if re.search(r"\bplaces to visit|things to do|attractions|sightseeing", q) and city:
        tools.append({"tool": "places", "args": {"query": "tourist attractions", "city": city}})

    if not tools:
        if intent == "visa_info":
            tools.append({"tool": "visa", "args": {"country": city or "India"}})
        elif intent == "plan_trip" and city:
            tools.append({"tool": "weather", "args": {"city": city}})
        tools.append({"tool": "web_search", "args": {"query": query}})

    seen: set[str] = set()
    unique: list[dict] = []
    for t in tools:
        if t["tool"] not in seen:
            seen.add(t["tool"])
            unique.append(t)
    return unique[:2]
