"""Clarification Decision node."""

from __future__ import annotations

from app.agent.state import AgentState
from app.agent.tracing import append_trace


async def clarification_decision_node(state: AgentState) -> dict:
    if state.get("reply"):
        return {}

    if state.get("needs_clarification"):
        missing = state.get("_missing_fields", [])
        detail = f"Missing: {', '.join(missing)}" if missing else "Insufficient trip details"
        trace = append_trace(state, "Clarification Decision", status="clarify", detail=detail)
        return {
            **trace,
            "reply": state.get("_clarification_question", "Could you share more details about your trip?"),
            "recommendations": [],
            "sources": [],
            "end_of_conversation": False,
        }

    trace = append_trace(state, "Clarification Decision", status="proceed")

    return trace
