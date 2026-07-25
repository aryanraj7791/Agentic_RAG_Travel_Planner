"""LangGraph agent state definition."""

from __future__ import annotations

from typing import Annotated, Any, TypedDict

from langgraph.graph.message import add_messages


class AgentState(TypedDict, total=False):
    messages: Annotated[list, add_messages]
    user_query: str
    intent: str
    city: str
    tools_to_invoke: list[dict]
    needs_retrieval: bool
    retrieved_docs: list[dict]
    tool_results: list[dict]
    planner_plan: dict[str, Any]
    reply: str
    recommendations: list[dict]
    sources: list[str]
    end_of_conversation: bool
    needs_clarification: bool
    execution_traces: list[dict]
