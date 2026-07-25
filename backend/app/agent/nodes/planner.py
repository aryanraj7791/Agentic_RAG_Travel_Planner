"""Travel Planner Agent — rule-based orchestration (no LLM call)."""

from __future__ import annotations

import re

from app.agent.state import AgentState
from app.agent.tracing import append_trace


def _extract_trip_days(query: str) -> int:
    match = re.search(r"(\d+)\s*[- ]?day", query.lower())
    return int(match.group(1)) if match else 0


def _build_plan(state: AgentState) -> dict:
    intent = state.get("intent", "get_info")
    query = state.get("user_query", "")
    city = state.get("city", "")
    has_docs = bool(state.get("retrieved_docs"))
    has_tools = bool(state.get("tool_results"))
    trip_days = _extract_trip_days(query)
    user_turns = sum(
        1 for m in state.get("messages", [])
        if (isinstance(m, dict) and m.get("role") == "user")
        or (hasattr(m, "type") and m.type == "human")
    )

    requires_itinerary = intent == "plan_trip" or trip_days > 0
    ready = requires_itinerary and bool(city) and trip_days > 0 and (has_docs or has_tools)
    if intent == "get_info" and city and has_docs:
        ready = user_turns >= 1

    if requires_itinerary:
        strategy = (
            f"Create a {trip_days or 'multi'}-day itinerary for {city or 'the destination'} "
            "using retrieved knowledge and tool results. Include day-wise plan and practical tips."
        )
        focus = ["sightseeing", "food", "logistics"]
    elif intent == "compare_options":
        strategy = "Compare travel options with pros/cons using tool results and retrieved context."
        focus = ["comparison", "budget", " convenience"]
    elif intent == "visa_info":
        strategy = "Explain visa requirements with cited sources from retrieval and visa tool results."
        focus = ["visa", "documents"]
    else:
        strategy = "Answer the travel question concisely using retrieved context and tool results."
        focus = ["general"]

    return {
        "requires_itinerary": requires_itinerary,
        "trip_days": trip_days,
        "focus_areas": focus,
        "include_comparison": intent == "compare_options",
        "response_strategy": strategy,
        "ready_to_finalize": ready,
    }


async def planner_agent_node(state: AgentState) -> dict:
    if state.get("reply") or state.get("needs_clarification"):
        return {}

    plan = _build_plan(state)
    trace = append_trace(
        state,
        "Planner Agent",
        detail=f"strategy={plan['response_strategy'][:80]}",
        metadata={"requires_itinerary": plan["requires_itinerary"], "mode": "rule-based"},
    )
    return {**trace, "planner_plan": plan}
