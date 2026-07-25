"""Build BM25 artifacts from ingestion sample data without embedding model."""

import json
import pickle
import re
import uuid
from pathlib import Path

from rank_bm25 import BM25Okapi

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "ingestion" / "data" / "raw" / "destinations.json"
OUT = ROOT / "backend" / "data"


def main():
    with open(RAW, "r", encoding="utf-8") as f:
        docs = json.load(f)

    chunks = []
    for doc in docs:
        words = doc["text"].split()
        chunks.append(
            {
                "id": str(uuid.uuid4()),
                "text": doc["text"],
                "title": doc["title"],
                "url": doc["url"],
                "city": doc["city"],
                "category": doc["category"],
            }
        )

    OUT.mkdir(parents=True, exist_ok=True)
    tokenized = [re.findall(r"\w+", c["text"].lower()) for c in chunks]
    bm25 = BM25Okapi(tokenized)

    with open(OUT / "bm25_index.pkl", "wb") as f:
        pickle.dump(bm25, f)
    with open(OUT / "corpus.json", "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    print(f"Wrote BM25 artifacts to {OUT} ({len(chunks)} chunks)")


if __name__ == "__main__":
    main()
