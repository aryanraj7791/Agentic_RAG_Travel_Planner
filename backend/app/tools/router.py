"""Tool Router — dispatches to individual external tool functions."""

from __future__ import annotations

from typing import Any

from app.tools.external import (
    calculate_distance,
    convert_currency,
    get_visa_info,
    get_weather,
    search_flights,
    search_hotels,
    search_places,
    web_search,
)


async def invoke_tool(
    tool_name: str,
    *,
    query: str,
    city: str = "",
    args: dict[str, Any] | None = None,
) -> dict | None:
    """Invoke a single tool by name. Returns None for unknown tools."""
    args = args or {}

    if tool_name == "weather":
        target = args.get("city") or city
        return await get_weather(target) if target else None

    if tool_name == "currency":
        return await convert_currency(
            float(args.get("amount", 100)),
            args.get("from", "USD"),
            args.get("to", "INR"),
        )

    if tool_name in ("maps", "distance"):
        return await calculate_distance(
            args.get("origin", city or "Delhi"),
            args.get("destination", args.get("dest", "Agra")),
        )

    if tool_name == "places":
        return await search_places(args.get("query", query), args.get("city", city))

    if tool_name == "flights":
        return await search_flights(
            args.get("origin", ""),
            args.get("destination", city),
            args.get("date", ""),
        )

    if tool_name == "hotels":
        return await search_hotels(args.get("city", city), args.get("query", "hotels"))

    if tool_name == "visa":
        return await get_visa_info(
            args.get("country", city),
            args.get("nationality", args.get("from_country", "")),
        )

    if tool_name == "web_search":
        return await web_search(args.get("query", query))

    return None
