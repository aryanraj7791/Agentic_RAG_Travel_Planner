"""Fallback response — tool-first when KB has no match for the requested city."""

from __future__ import annotations

import re


def _format_web_results(results: list[dict], *, heading: str) -> list[str]:
    lines = [f"### {heading}"]
    for item in results[:5]:
        title = item.get("title") or item.get("name") or "Result"
        url = item.get("url", "")
        snippet = item.get("snippet") or item.get("address") or ""
        line = f"- **{title}**"
        if snippet:
            line += f": {snippet[:120]}"
        if url:
            line += f" ([source]({url}))"
        lines.append(line)
    return lines


def build_rag_fallback(state: dict) -> dict:
    query = state.get("user_query", "")
    city = state.get("city", "")
    intent = state.get("intent", "get_info")
    docs = state.get("retrieved_docs", [])
    tool_results = state.get("tool_results", [])

    lines: list[str] = []
    recommendations: list[dict] = []
    sources: list[str] = []

    # Priority 1: tool results (always query-specific)
    for tr in tool_results:
        tool = tr.get("tool")
        data = tr.get("data", {})

        if tool == "flights" and data.get("flights"):
            lines.extend(_format_web_results(data["flights"], heading=f"Flight options for {city or 'your route'}"))
        elif tool == "hotels" and data.get("hotels"):
            lines.extend(_format_web_results(data["hotels"], heading=f"Hotels in {city}"))
        elif tool == "web_search" and data.get("results"):
            lines.extend(_format_web_results(data["results"], heading=f"Search results for your query"))
        elif tool == "weather" and data.get("temp_c"):
            lines.append(
                f"**Weather in {data.get('city', city)}:** {data.get('temp_c')}°C, "
                f"{data.get('description', '')}"
            )
        elif tool == "places" and data.get("results"):
            lines.extend(_format_web_results(data["results"], heading=f"Places in {city}"))

        if data.get("source"):
            sources.append(data["source"])
        for item in data.get("results", []) + data.get("flights", []) + data.get("hotels", []):
            if isinstance(item, dict) and item.get("url"):
                sources.append(item["url"])
                recommendations.append({
                    "title": item.get("title") or item.get("name", "Travel option"),
                    "type": tool or "general",
                    "city": city,
                    "url": item["url"],
                })

    # Priority 2: KB docs only if they match the requested city
    city_docs = [d for d in docs if city and d.get("city", "").lower() == city.lower()]
    relevant_docs = city_docs or docs[:1] if docs else []

    if relevant_docs and city_docs:
        top = relevant_docs[0]
        lines.insert(0, f"## {top.get('title', city)}")
        lines.insert(1, "")
        lines.insert(2, top.get("text", "")[:500])
        if top.get("url"):
            sources.append(top["url"])
        for d in relevant_docs[:3]:
            recommendations.append({
                "title": d.get("title", ""),
                "type": d.get("category", "destination"),
                "city": d.get("city", city),
                "url": d.get("url", ""),
            })

    if not lines:
        return {
            "reply": (
                f"I couldn't find detailed information for **{city or 'your destination'}** right now. "
                f"For your query: *{query[:100]}* — please try again shortly or check the sources below."
            ),
            "recommendations": recommendations[:8],
            "sources": list(dict.fromkeys(sources))[:12],
            "end_of_conversation": False,
        }

    header = f"Here's what I found for **{city or 'your trip'}**"
    if re.search(r"\b\d{1,2}\s+\w+\s+\d{4}\b", query):
        header += f" ({extract_date_from_query(query)})"
    lines.insert(0, header)
    lines.insert(1, "")

    return {
        "reply": "\n".join(lines),
        "recommendations": [r for r in recommendations if r.get("title")][:8],
        "sources": list(dict.fromkeys(sources))[:12],
        "end_of_conversation": intent == "plan_trip" and bool(city) and bool(lines),
    }


def extract_date_from_query(query: str) -> str:
    match = re.search(
        r"\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})\b",
        query,
        re.I,
    )
    return match.group(1) if match else ""
