"""Lazy Qdrant Cloud client for semantic vector search."""

from __future__ import annotations

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from app.config import get_settings

_client: QdrantClient | None = None


def get_qdrant_client() -> QdrantClient | None:
    """Return cached Qdrant client or None if not configured."""
    global _client
    settings = get_settings()
    if not settings.qdrant_url:
        return None
    if _client is None:
        _client = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key or None,
            timeout=15,
        )
    return _client


async def semantic_search(
    query_vector: list[float],
    *,
    limit: int = 8,
    city_filter: str | None = None,
) -> list[dict]:
    """Search Qdrant collection by vector similarity."""
    client = get_qdrant_client()
    if client is None:
        return []

    settings = get_settings()
    query_filter = None
    if city_filter:
        query_filter = qmodels.Filter(
            must=[
                qmodels.FieldCondition(
                    key="city",
                    match=qmodels.MatchText(text=city_filter),
                )
            ]
        )

    try:
        results = client.search(
            collection_name=settings.qdrant_collection,
            query_vector=query_vector,
            query_filter=query_filter,
            limit=limit,
            with_payload=True,
        )
    except Exception:
        return []

    docs = []
    for hit in results:
        payload = hit.payload or {}
        docs.append(
            {
                "id": str(hit.id),
                "score": hit.score,
                "text": payload.get("text", ""),
                "title": payload.get("title", ""),
                "url": payload.get("url", ""),
                "city": payload.get("city", ""),
                "category": payload.get("category", ""),
                "source": "semantic",
            }
        )
    return docs
