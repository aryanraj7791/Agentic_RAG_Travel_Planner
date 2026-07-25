"""Hybrid retrieval: BM25 keyword + Qdrant semantic search with reciprocal rank fusion."""

from __future__ import annotations

from app.retrieval.bm25_store import bm25_search
from app.retrieval.embedding_api import embed_query
from app.retrieval.qdrant_store import semantic_search

RRF_K = 60


def _reciprocal_rank_fusion(
    result_lists: list[list[dict]],
    *,
    limit: int = 10,
) -> list[dict]:
    """Merge ranked lists using RRF — no reranker model loaded (memory-safe)."""
    scores: dict[str, float] = {}
    docs: dict[str, dict] = {}

    for results in result_lists:
        for rank, doc in enumerate(results):
            doc_id = doc["id"]
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (RRF_K + rank + 1)
            if doc_id not in docs:
                docs[doc_id] = doc

    merged = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:limit]
    output = []
    for doc_id, rrf_score in merged:
        item = docs[doc_id].copy()
        item["rrf_score"] = rrf_score
        output.append(item)
    return output


async def hybrid_retrieve(
    query: str,
    *,
    limit: int = 10,
    city: str | None = None,
) -> tuple[list[dict], dict]:
    """Run BM25 + semantic search, merge with RRF. Returns (docs, trace_metadata)."""
    bm25_results = bm25_search(query, limit=limit)

    semantic_results: list[dict] = []
    embedding_provider = "none"
    query_vector, embedding_provider = await embed_query(query)
    if query_vector:
        semantic_results = await semantic_search(
            query_vector, limit=limit, city_filter=city
        )

    trace = {
        "bm25_count": len(bm25_results),
        "semantic_count": len(semantic_results),
        "embedding_provider": embedding_provider,
        "fusion": "rrf",
    }

    if not semantic_results and bm25_results:
        return bm25_results[:limit], {**trace, "rrf_count": len(bm25_results[:limit])}
    if not bm25_results and semantic_results:
        return semantic_results[:limit], {**trace, "rrf_count": len(semantic_results[:limit])}
    if not bm25_results and not semantic_results:
        return [], {**trace, "rrf_count": 0}

    fused = _reciprocal_rank_fusion([bm25_results, semantic_results], limit=limit)
    return fused, {**trace, "rrf_count": len(fused)}
