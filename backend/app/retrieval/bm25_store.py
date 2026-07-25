"""BM25 keyword index loaded lazily from offline-generated artifacts."""

from __future__ import annotations

import json
import pickle
import re
from pathlib import Path

from rank_bm25 import BM25Okapi

from app.config import get_settings

_bm25: BM25Okapi | None = None
_corpus: list[dict] | None = None


def _tokenize(text: str) -> list[str]:
    return re.findall(r"\w+", text.lower())


def _load_index() -> tuple[BM25Okapi | None, list[dict]]:
    global _bm25, _corpus
    if _bm25 is not None and _corpus is not None:
        return _bm25, _corpus

    settings = get_settings()
    data_dir = settings.data_dir
    index_path = data_dir / "bm25_index.pkl"
    corpus_path = data_dir / "corpus.json"

    if not index_path.exists() or not corpus_path.exists():
        _bm25, _corpus = None, []
        return _bm25, _corpus

    with open(index_path, "rb") as f:
        _bm25 = pickle.load(f)
    with open(corpus_path, "r", encoding="utf-8") as f:
        _corpus = json.load(f)

    return _bm25, _corpus


def bm25_search(query: str, *, limit: int = 8) -> list[dict]:
    """Keyword search over offline BM25 index."""
    bm25, corpus = _load_index()
    if bm25 is None or not corpus:
        return []

    tokens = _tokenize(query)
    if not tokens:
        return []

    scores = bm25.get_scores(tokens)
    ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)[:limit]

    results = []
    for idx, score in ranked:
        if score <= 0:
            continue
        doc = corpus[idx]
        results.append(
            {
                "id": doc.get("id", str(idx)),
                "score": float(score),
                "text": doc.get("text", ""),
                "title": doc.get("title", ""),
                "url": doc.get("url", ""),
                "city": doc.get("city", ""),
                "category": doc.get("category", ""),
                "source": "bm25",
            }
        )
    return results
