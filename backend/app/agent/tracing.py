"""Agent execution trace helpers for observability."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def append_trace(
    state: dict,
    step: str,
    *,
    status: str = "completed",
    detail: str = "",
    metadata: dict[str, Any] | None = None,
) -> dict:
    """Append a trace entry to agent state (return partial state update)."""
    traces = list(state.get("execution_traces", []))
    entry: dict[str, Any] = {
        "step": step,
        "status": status,
        "detail": detail,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if metadata:
        entry["metadata"] = metadata
    traces.append(entry)
    return {"execution_traces": traces}
