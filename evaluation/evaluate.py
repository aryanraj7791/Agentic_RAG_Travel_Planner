"""RAG evaluation using RAGAS metrics — run locally, not in production."""

from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path

from app.retrieval.hybrid import hybrid_retrieve

RESULTS_DIR = Path(__file__).resolve().parent / "results"


SAMPLE_QUESTIONS = [
    {"question": "What is the best time to visit Jaipur?", "city": "Jaipur"},
    {"question": "Tell me about Goa beaches", "city": "Goa"},
    {"question": "How do I get an India tourist visa?", "city": "India"},
]


async def evaluate_retrieval() -> dict:
    results = []
    for item in SAMPLE_QUESTIONS:
        docs, meta = await hybrid_retrieve(item["question"], limit=5, city=item.get("city"))
        results.append(
            {
                "question": item["question"],
                "retrieved_count": len(docs),
                "top_titles": [d.get("title") for d in docs[:3]],
                "sources": [d.get("url") for d in docs if d.get("url")],
                "retrieval_meta": meta,
            }
        )
    return {"retrieval_eval": results}


def run_ragas_if_available(dataset_path: Path) -> dict:
    try:
        from ragas import evaluate
        from ragas.metrics import answer_relevancy, faithfulness
        from datasets import Dataset
    except ImportError:
        return {"ragas": "skipped — install evaluation/requirements.txt"}

    if not dataset_path.exists():
        return {"ragas": f"skipped — no dataset at {dataset_path}"}

    with open(dataset_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    ds = Dataset.from_list(data)
    result = evaluate(ds, metrics=[faithfulness, answer_relevancy])
    return {"ragas": dict(result)}


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", default=str(RESULTS_DIR / "eval_dataset.json"))
    args = parser.parse_args()

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

    report = await evaluate_retrieval()
    report.update(run_ragas_if_available(Path(args.dataset)))

    out = RESULTS_DIR / "eval_report.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, default=str)

    print(json.dumps(report, indent=2, default=str))
    print(f"\nReport saved to {out}")


if __name__ == "__main__":
    asyncio.run(main())
