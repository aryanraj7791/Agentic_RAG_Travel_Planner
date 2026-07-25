"""Intent Analysis — heuristic-first, always keyed to the latest user message."""

from __future__ import annotations

import re

from app.agent.nodes.helpers import (
    detect_city,
    format_history,
    tools_for_query,
)
from app.agent.state import AgentState
from app.agent.tracing import append_trace
from app.llm.client import chat_completion_json


def _heuristic_intent(query: str) -> dict:
    q = query.lower()
    city = detect_city(query)

    if re.search(r"\bhotel|flight|availability|airline", q):
        return {
            "intent": "plan_trip",
            "city": city,
            "needs_clarification": not city,
            "clarification_question": "Which city are you traveling to?",
            "missing_fields": [] if city else ["destination"],
            "needs_retrieval": False,  # tools + web search are enough for unknown cities
        }

    if re.search(r"places to visit|things to do|attractions|sightseeing|visit .+ during", q):
        return {
            "intent": "get_info",
            "city": city,
            "needs_clarification": not city,
            "clarification_question": "Which destination are you asking about?",
            "missing_fields": [] if city else ["destination"],
            "needs_retrieval": True,
        }

    if any(re.search(p, q) for p in [r"plan\s+\d", r"\d+\s*[- ]?day", r"itinerary", r"plan a trip", r"want to visit"]):
        return {
            "intent": "plan_trip",
            "city": city,
            "needs_clarification": not city,
            "clarification_question": "Which destination would you like to plan the trip for?",
            "missing_fields": [] if city else ["destination"],
            "needs_retrieval": bool(city),
        }

    if re.search(r"best time|when to visit|weather", q):
        return {
            "intent": "get_info",
            "city": city,
            "needs_clarification": not city,
            "clarification_question": "Which destination are you asking about?",
            "missing_fields": [] if city else ["destination"],
            "needs_retrieval": True,
        }

    if re.search(r"visa|e-visa|tourist visa", q):
        return {
            "intent": "visa_info",
            "city": city or "India",
            "needs_clarification": False,
            "needs_retrieval": True,
        }

    if re.search(r"compare|vs|versus|which is better", q):
        return {
            "intent": "compare_options",
            "city": city,
            "needs_clarification": not city,
            "clarification_question": "Which destinations would you like to compare?",
            "missing_fields": [] if city else ["destination"],
            "needs_retrieval": True,
        }

    return {
        "intent": "get_info",
        "city": city,
        "needs_clarification": not city and not re.search(r"\b\w{4,}\b", q),
        "clarification_question": "Which destination are you asking about?",
        "missing_fields": [] if city else ["destination"],
        "needs_retrieval": bool(city),
    }


async def intent_analysis_node(state: AgentState) -> dict:
    if state.get("reply"):
        return {}

    query = state["user_query"]
    parsed = _heuristic_intent(query)
    source = "heuristic"

    # LLM only for ambiguous multi-turn follow-ups (skip on first-turn clear queries)
    user_turns = sum(
        1 for m in state.get("messages", [])
        if (isinstance(m, dict) and m.get("role") == "user")
        or (hasattr(m, "type") and m.type == "human")
    )
    if user_turns > 1 and not parsed.get("city") and len(query.split()) > 6:
        source = "llm"
        history = format_history(state.get("messages", []), max_turns=2)
        prompt = [
            {
                "role": "system",
                "content": (
                    "Analyze ONLY the latest travel query. Return compact JSON: "
                    "intent, city, needs_clarification, clarification_question, "
                    "missing_fields, needs_retrieval."
                ),
            },
            {"role": "user", "content": f"Recent context:\n{history}\n\nLatest query: {query}"},
        ]
        try:
            llm_parsed = await chat_completion_json(prompt)
            parsed = {**parsed, **{k: v for k, v in llm_parsed.items() if v}}
        except Exception:
            pass

    tools = tools_for_query(query, parsed.get("city", ""), parsed.get("intent", "get_info"))

    trace = append_trace(
        state,
        "Intent Analysis",
        detail=f"intent={parsed.get('intent')}, city={parsed.get('city', '')}, via={source}",
        metadata={"source": source, "tools": [t["tool"] for t in tools], "query": query[:80]},
    )

    return {
        **trace,
        "intent": parsed.get("intent", "get_info"),
        "city": parsed.get("city", ""),
        "needs_clarification": parsed.get("needs_clarification", False),
        "needs_retrieval": parsed.get("needs_retrieval", True),
        "tools_to_invoke": tools,
        "_clarification_question": parsed.get(
            "clarification_question",
            "Could you share more details about your trip?",
        ),
        "_missing_fields": parsed.get("missing_fields", []),
    }
