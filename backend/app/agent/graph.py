"""LangGraph workflow — refined 8-node pipeline."""

from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from app.agent.nodes import (
    citation_formatter_node,
    clarification_decision_node,
    hybrid_retrieval_node,
    intent_analysis_node,
    planner_agent_node,
    response_generator_node,
    safety_check_node,
    tool_router_node,
)
from app.agent.state import AgentState


def _route_after_safety(state: AgentState) -> str:
    return "done" if state.get("reply") else "intent"


def _route_after_clarification(state: AgentState) -> str:
    return "done" if state.get("reply") or state.get("needs_clarification") else "retrieve"


def build_agent_graph():
    graph = StateGraph(AgentState)

    graph.add_node("safety_check", safety_check_node)
    graph.add_node("intent_analysis", intent_analysis_node)
    graph.add_node("clarification_decision", clarification_decision_node)
    graph.add_node("hybrid_retrieval", hybrid_retrieval_node)
    graph.add_node("tool_router", tool_router_node)
    graph.add_node("planner_agent", planner_agent_node)
    graph.add_node("response_generator", response_generator_node)
    graph.add_node("citation_formatter", citation_formatter_node)

    graph.add_edge(START, "safety_check")
    graph.add_conditional_edges(
        "safety_check", _route_after_safety, {"intent": "intent_analysis", "done": END}
    )
    graph.add_edge("intent_analysis", "clarification_decision")
    graph.add_conditional_edges(
        "clarification_decision",
        _route_after_clarification,
        {"retrieve": "hybrid_retrieval", "done": END},
    )
    graph.add_edge("hybrid_retrieval", "tool_router")
    graph.add_edge("tool_router", "planner_agent")
    graph.add_edge("planner_agent", "response_generator")
    graph.add_edge("response_generator", "citation_formatter")
    graph.add_edge("citation_formatter", END)

    return graph.compile()


_agent_graph = None


def get_agent_graph():
    global _agent_graph
    if _agent_graph is None:
        _agent_graph = build_agent_graph()
    return _agent_graph
