"""Response Generator node."""

from __future__ import annotations

import json

from app.agent.nodes.fallback import build_rag_fallback
from app.agent.nodes.helpers import format_context, format_history
from app.agent.state import AgentState
from app.agent.tracing import append_trace
from app.llm.client import chat_completion, chat_completion_json


async def response_generator_node(state: AgentState) -> dict:
    if state.get("reply"):
        return {}

    plan = state.get("planner_plan", {})
    context = format_context(state.get("retrieved_docs", []))
    tools_ctx = json.dumps(state.get("tool_results", []), indent=2, default=str)[:4000]
    history = format_history(state.get("messages", []))

    system = (
        "You are an expert travel planning assistant. "
        "Follow the planner's response_strategy. "
        "Ground every fact in retrieved context and tool results. "
        "If information is missing, say so. "
        "For completed trip plans include a day-wise itinerary. "
        "Return JSON with keys: reply (markdown string), recommendations (array of "
        "{title, type, city, url} — empty while gathering info, 1-10 when ready), "
        "end_of_conversation (boolean — true only when the travel plan is complete)."
    )

    prompt = [
        {"role": "system", "content": system},
        {
            "role": "user",
            "content": (
                f"Planner strategy: {plan.get('response_strategy', '')}\n"
                f"Requires itinerary: {plan.get('requires_itinerary')}\n"
                f"Trip days: {plan.get('trip_days')}\n"
                f"Focus: {plan.get('focus_areas')}\n"
                f"Ready to finalize: {plan.get('ready_to_finalize')}\n\n"
                f"Intent: {state.get('intent')}\nCity: {state.get('city', '')}\n\n"
                f"Conversation:\n{history}\n\n"
                f"Retrieved knowledge:\n{context}\n\n"
                f"Tool results:\n{tools_ctx}\n\n"
                f"User query: {state.get('user_query')}"
            ),
        },
    ]

    try:
        parsed = await chat_completion_json(prompt)
        reply = parsed.get("reply", "")
        recommendations = parsed.get("recommendations", [])
        end = parsed.get("end_of_conversation", plan.get("ready_to_finalize", False))
    except Exception as exc:
        import logging
        logger = logging.getLogger(__name__)
        detail_msg = f"LLM unavailable ({type(exc).__name__})"
        if hasattr(exc, "response") and exc.response is not None:
            detail_msg += f": status={exc.response.status_code}, body={exc.response.text[:500]}"
            logger.error("Response Generator LLM call failed: %s", detail_msg)
        else:
            logger.exception("Response Generator LLM call failed")
        fallback = build_rag_fallback(state)
        trace = append_trace(
            state,
            "Response Generator",
            status="fallback",
            detail=f"LLM unavailable ({type(exc).__name__}), tool-first fallback for: {state.get('user_query', '')[:60]}",
        )
        return {
            **trace,
            "reply": fallback["reply"],
            "recommendations": fallback["recommendations"],
            "sources": fallback.get("sources") or list(set(state.get("sources", []))),
            "end_of_conversation": fallback["end_of_conversation"],
        }

    doc_sources = [d["url"] for d in state.get("retrieved_docs", []) if d.get("url")]
    raw_sources = list(set(state.get("sources", []) + doc_sources))

    trace = append_trace(
        state,
        "Response Generator",
        detail=f"recommendations={len(recommendations)}, end={end}",
    )
    return {
        **trace,
        "reply": reply,
        "recommendations": recommendations[:10],
        "sources": raw_sources,
        "end_of_conversation": end,
    }
