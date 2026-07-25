"""Extension points for future enhancements without changing core architecture.

Hook into these stubs when adding:
- Lightweight reranking (bge-reranker via hosted API)
- Redis caching
- LangSmith tracing
- PDF / calendar export
- Multilingual support
- Voice interaction
- Interactive maps
"""

from __future__ import annotations

from typing import Any


async def rerank_results(query: str, docs: list[dict], *, limit: int = 10) -> list[dict]:
    """Optional reranking — currently passthrough (RRF only)."""
    return docs[:limit]


async def cache_get(key: str) -> Any | None:
    """Redis cache lookup — not enabled."""
    return None


async def cache_set(key: str, value: Any, ttl: int = 3600) -> None:
    """Redis cache write — not enabled."""
    return None


def trace_to_langsmith(traces: list[dict]) -> None:
    """Forward traces to LangSmith when LANGCHAIN_TRACING_V2=true."""
    return None
