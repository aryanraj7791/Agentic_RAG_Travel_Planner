"""Citation Formatter node — deduplicate, validate and format sources."""

from __future__ import annotations

from urllib.parse import urlparse

from app.agent.state import AgentState
from app.agent.tracing import append_trace


def _is_valid_url(url: str) -> bool:
    try:
        parsed = urlparse(url.strip())
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False


def _normalize_url(url: str) -> str:
    return url.strip().rstrip("/")


def format_citations(sources: list[str]) -> list[str]:
    """Deduplicate and validate citation URLs."""
    seen: set[str] = set()
    formatted: list[str] = []

    for raw in sources:
        if not raw or not isinstance(raw, str):
            continue
        url = _normalize_url(raw)
        if not _is_valid_url(url):
            continue
        key = url.lower()
        if key in seen:
            continue
        seen.add(key)
        formatted.append(url)

    return formatted[:15]


def _append_source_footer(reply: str, sources: list[str]) -> str:
    if not sources or "Sources:" in reply:
        return reply
    lines = ["", "---", "**Sources:**"]
    for i, url in enumerate(sources, 1):
        lines.append(f"{i}. {url}")
    return reply + "\n".join(lines)


async def citation_formatter_node(state: AgentState) -> dict:
    if not state.get("reply"):
        return {}

    raw_sources = state.get("sources", [])
    formatted = format_citations(raw_sources)
    reply = _append_source_footer(state.get("reply", ""), formatted)

    removed = len(raw_sources) - len(formatted)
    trace = append_trace(
        state,
        "Citation Formatter",
        detail=f"{len(formatted)} valid citations" + (f", {removed} removed" if removed else ""),
        metadata={"citation_count": len(formatted)},
    )

    return {**trace, "reply": reply, "sources": formatted}
