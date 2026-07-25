"""Safety Check node."""

from __future__ import annotations

import re

from app.agent.nodes.helpers import OUT_OF_SCOPE_PATTERNS, SAFETY_REFUSAL, extract_last_user_message
from app.agent.state import AgentState
from app.agent.tracing import append_trace

async def safety_check_node(state: AgentState) -> dict:

    query = extract_last_user_message(state)
    lowered = query.lower()

    for pattern in OUT_OF_SCOPE_PATTERNS:
        if re.search(pattern, lowered):
            trace = append_trace(
                state, "Safety Check", status="blocked", detail="Out-of-scope request detected"
            )
            return {
                **trace,
                "user_query": query,
                "reply": SAFETY_REFUSAL,
                "sources": [],
                "recommendations": [],
                "end_of_conversation": False,
                "needs_clarification": False,
            }

    trace = append_trace(state, "Safety Check", status="passed")

    return {**trace, "user_query": query}
