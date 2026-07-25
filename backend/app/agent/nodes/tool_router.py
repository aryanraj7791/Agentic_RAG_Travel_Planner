"""Tool Router — parallel invocation with per-tool timeout."""

from __future__ import annotations

import asyncio

from app.agent.nodes.helpers import extract_last_user_message
from app.agent.state import AgentState
from app.agent.tracing import append_trace
from app.tools.router import invoke_tool

_TOOL_TIMEOUT = 6
_MAX_TOOLS = 2


async def _run_tool(call: dict, *, query: str, city: str) -> dict | None:
    tool_name = call.get("tool", "")
    args = call.get("args", {})
    try:
        data = await asyncio.wait_for(
            invoke_tool(tool_name, query=query, city=city, args=args),
            timeout=_TOOL_TIMEOUT,
        )
        if data is None:
            return None
        return {"tool": tool_name, "data": data}
    except Exception:
        return {"tool": tool_name, "data": {"error": "timeout or unavailable"}}


async def tool_router_node(state: AgentState) -> dict:
    if state.get("reply") or state.get("needs_clarification"):
        return {}

    query = state.get("user_query") or extract_last_user_message(state)
    city = state.get("city", "")
    planned = (state.get("tools_to_invoke") or [])[:_MAX_TOOLS]

    if not planned:
        trace = append_trace(state, "Tool Router", detail="No tools required", metadata={"tools": []})
        return {**trace, "tool_results": []}

    results_raw = await asyncio.gather(
        *[_run_tool(call, query=query, city=city) for call in planned]
    )
    results = [r for r in results_raw if r is not None]
    invoked = [r["tool"] for r in results]

    extra_sources: list[str] = []
    for r in results:
        data = r.get("data", {})
        if data.get("source"):
            extra_sources.append(data["source"])
        for item in data.get("results", []) + data.get("flights", []) + data.get("hotels", []):
            if isinstance(item, dict) and item.get("url"):
                extra_sources.append(item["url"])

    merged_sources = list(set(state.get("sources", []) + extra_sources))
    trace = append_trace(
        state,
        "Tool Router",
        detail=f"Invoked: {', '.join(invoked) if invoked else 'none'} (parallel, max {_MAX_TOOLS})",
        metadata={"tools": invoked},
    )
    return {**trace, "tool_results": results, "sources": merged_sources}
