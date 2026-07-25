"""Offline document ingestion — run locally, never in deployed backend.

Pipeline: collect → clean → chunk → embed (BAAI/bge-m3) → upload to Qdrant Cloud
         → build BM25 index artifacts for backend/data/
"""

from __future__ import annotations

import argparse
import json
import pickle
import re
import uuid
from pathlib import Path

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from rank_bm25 import BM25Okapi

# Heavy ML deps only in ingestion environment
from FlagEmbedding import BGEM3FlagModel

ROOT = Path(__file__).resolve().parent
RAW_DIR = ROOT / "data" / "raw"
OUTPUT_DIR = ROOT / "output"
BACKEND_DATA = ROOT.parent / "backend" / "data"

CHUNK_SIZE = 500
CHUNK_OVERLAP = 80


def load_raw_documents() -> list[dict]:
    docs: list[dict] = []
    for path in sorted(RAW_DIR.glob("**/*.json")):
        with open(path, "r", encoding="utf-8") as f:
            items = json.load(f)
            if isinstance(items, list):
                docs.extend(items)
            else:
                docs.append(items)
    return docs


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s.,!?;:'\"()-]", "", text)
    return text.strip()


def chunk_document(doc: dict) -> list[dict]:
    text = clean_text(doc.get("text", ""))
    if not text:
        return []

    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + CHUNK_SIZE, len(words))
        chunk_text = " ".join(words[start:end])
        chunks.append(
            {
                "id": str(uuid.uuid4()),
                "text": chunk_text,
                "title": doc.get("title", ""),
                "url": doc.get("url", ""),
                "city": doc.get("city", ""),
                "category": doc.get("category", "destination"),
            }
        )
        if end == len(words):
            break
        start = end - CHUNK_OVERLAP

    return chunks


def embed_chunks(model: BGEM3FlagModel, chunks: list[dict]) -> list[list[float]]:
    texts = [c["text"] for c in chunks]
    embeddings = model.encode(texts, batch_size=12)["dense_vecs"]
    return [vec.tolist() for vec in embeddings]


def upload_to_qdrant(
    chunks: list[dict],
    vectors: list[list[float]],
    *,
    qdrant_url: str,
    qdrant_api_key: str,
    collection: str,
    recreate: bool = False,
) -> None:
    client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    dim = len(vectors[0])

    if recreate:
        client.recreate_collection(
            collection_name=collection,
            vectors_config=qmodels.VectorParams(size=dim, distance=qmodels.Distance.COSINE),
        )

    points = []
    for chunk, vector in zip(chunks, vectors):
        points.append(
            qmodels.PointStruct(
                id=chunk["id"],
                vector=vector,
                payload={
                    "text": chunk["text"],
                    "title": chunk["title"],
                    "url": chunk["url"],
                    "city": chunk["city"],
                    "category": chunk["category"],
                },
            )
        )

    batch_size = 64
    for i in range(0, len(points), batch_size):
        client.upsert(collection_name=collection, points=points[i : i + batch_size])


def build_bm25_artifacts(chunks: list[dict], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    tokenized = [re.findall(r"\w+", c["text"].lower()) for c in chunks]
    bm25 = BM25Okapi(tokenized)

    with open(output_dir / "bm25_index.pkl", "wb") as f:
        pickle.dump(bm25, f)
    with open(output_dir / "corpus.json", "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(description="Offline travel knowledge ingestion")
    parser.add_argument("--qdrant-url", required=True)
    parser.add_argument("--qdrant-api-key", required=True)
    parser.add_argument("--collection", default="travel_knowledge")
    parser.add_argument("--recreate", action="store_true")
    parser.add_argument("--skip-qdrant", action="store_true", help="Only build BM25 artifacts")
    args = parser.parse_args()

    print("Loading raw documents...")
    raw_docs = load_raw_documents()
    if not raw_docs:
        raise SystemExit(f"No documents found in {RAW_DIR}. Add JSON files first.")

    print(f"Chunking {len(raw_docs)} documents...")
    all_chunks: list[dict] = []
    for doc in raw_docs:
        all_chunks.extend(chunk_document(doc))
    print(f"Created {len(all_chunks)} chunks")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_DIR / "chunks.json", "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    print("Building BM25 index artifacts...")
    BACKEND_DATA.mkdir(parents=True, exist_ok=True)
    build_bm25_artifacts(all_chunks, BACKEND_DATA)
    build_bm25_artifacts(all_chunks, OUTPUT_DIR)

    if args.skip_qdrant:
        print("Skipping Qdrant upload (--skip-qdrant)")
        return

    print("Loading bge-m3 model (local only — not used in deployed backend)...")
    model = BGEM3FlagModel("BAAI/bge-m3", use_fp16=True)

    print("Generating embeddings...")
    vectors = embed_chunks(model, all_chunks)

    print("Uploading to Qdrant Cloud...")
    upload_to_qdrant(
        all_chunks,
        vectors,
        qdrant_url=args.qdrant_url,
        qdrant_api_key=args.qdrant_api_key,
        collection=args.collection,
        recreate=args.recreate,
    )
    print("Ingestion complete.")


if __name__ == "__main__":
    main()
