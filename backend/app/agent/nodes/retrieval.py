"""Hybrid Retrieval node — query-focused, skips irrelevant KB docs."""

from __future__ import annotations

from app.agent.nodes.helpers import extract_last_user_message, filter_relevant_docs
from app.agent.state import AgentState
from app.agent.tracing import append_trace
from app.extensions import rerank_results
from app.retrieval.hybrid import hybrid_retrieve


async def hybrid_retrieval_node(state: AgentState) -> dict:
    if state.get("reply") or state.get("needs_clarification"):
        return {}

    if not state.get("needs_retrieval", True):
        trace = append_trace(state, "Hybrid Retrieval", status="skipped", detail="Tools-only path")
        return {**trace, "retrieved_docs": [], "sources": state.get("sources", [])}

    query = state.get("user_query") or extract_last_user_message(state)
    city = state.get("city") or ""

    docs, meta = await hybrid_retrieve(query, limit=8, city=city or None)
    docs = await rerank_results(query, docs, limit=8)
    docs = filter_relevant_docs(docs, query, city)

    sources = list({d["url"] for d in docs if d.get("url")})
    trace = append_trace(
        state,
        "Hybrid Retrieval",
        detail=(
            f"BM25={meta['bm25_count']}, Semantic={meta['semantic_count']}, "
            f"filtered={len(docs)}, city={city or 'none'}"
        ),
        metadata={**meta, "filtered_count": len(docs)},
    )
    return {**trace, "retrieved_docs": docs, "sources": list(set(state.get("sources", []) + sources))}
