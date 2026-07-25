"""Cloud-based query embeddings — no local models loaded at runtime.

Document embeddings are generated offline with bge-m3 during ingestion.
At query time, Gemini Embedding API is preferred; Hugging Face Inference
API is used as fallback when vectors must match bge-m3 in Qdrant.
"""

from __future__ import annotations

import httpx

from app.config import get_settings

_http_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(timeout=30.0)
    return _http_client


async def _embed_via_gemini(text: str) -> list[float] | None:
    settings = get_settings()
    api_key = settings.gemini_api_key
    if not api_key:
        return None

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/"
        f"models/{settings.embedding_model}:embedContent"
    )
    params = {"key": api_key}
    payload = {
        "model": f"models/{settings.embedding_model}",
        "content": {"parts": [{"text": text}]},
    }

    try:
        resp = await _get_client().post(url, params=params, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["embedding"]["values"]
    except Exception:
        return None


async def _embed_via_huggingface(text: str) -> list[float] | None:
    settings = get_settings()
    api_key = settings.hf_inference_api_key
    if not api_key:
        return None

    url = (
        "https://api-inference.huggingface.co/pipeline/"
        "feature-extraction/BAAI/bge-m3"
    )
    headers = {"Authorization": f"Bearer {api_key}"}

    try:
        resp = await _get_client().post(url, headers=headers, json={"inputs": text})
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, list) and data and isinstance(data[0], list):
            vectors = data[0] if isinstance(data[0][0], list) else data
            dim = len(vectors[0])
            pooled = [0.0] * dim
            for vec in vectors:
                for i, v in enumerate(vec):
                    pooled[i] += v
            n = len(vectors)
            return [v / n for v in pooled]
        return None
    except Exception:
        return None


async def embed_query(text: str) -> tuple[list[float] | None, str]:
    """Return (embedding vector, provider used). Provider is 'none' if unavailable."""
    settings = get_settings()

    if settings.embedding_provider == "gemini":
        vector = await _embed_via_gemini(text)
        if vector:
            return vector, "gemini"
        vector = await _embed_via_huggingface(text)
        return (vector, "huggingface") if vector else (None, "none")

    vector = await _embed_via_huggingface(text)
    if vector:
        return vector, "huggingface"
    vector = await _embed_via_gemini(text)
    return (vector, "gemini") if vector else (None, "none")
