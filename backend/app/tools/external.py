"""External tool integrations — all API-based, no heavy local dependencies."""

from __future__ import annotations

import httpx

from app.config import get_settings

_http: httpx.AsyncClient | None = None


def _client() -> httpx.AsyncClient:
    global _http
    if _http is None:
        _http = httpx.AsyncClient(timeout=20.0)
    return _http


async def get_weather(city: str) -> dict:
    """Fetch current weather via OpenWeatherMap."""
    settings = get_settings()
    if not settings.openweather_api_key:
        return {"error": "Weather API not configured", "city": city}

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"q": city, "appid": settings.openweather_api_key, "units": "metric"}
    try:
        resp = await _client().get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
        return {
            "city": data.get("name", city),
            "temp_c": data["main"]["temp"],
            "feels_like_c": data["main"]["feels_like"],
            "description": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "source": f"https://openweathermap.org/city/{data.get('id', '')}",
        }
    except Exception as exc:
        return {"error": str(exc), "city": city}


async def convert_currency(amount: float, from_currency: str, to_currency: str) -> dict:
    """Convert currency via ExchangeRate-API."""
    settings = get_settings()
    if not settings.exchangerate_api_key:
        return {"error": "Currency API not configured"}

    url = f"https://v6.exchangerate-api.com/v6/{settings.exchangerate_api_key}/pair/{from_currency}/{to_currency}/{amount}"
    try:
        resp = await _client().get(url)
        resp.raise_for_status()
        data = resp.json()
        return {
            "amount": amount,
            "from": from_currency,
            "to": to_currency,
            "result": data.get("conversion_result"),
            "rate": data.get("conversion_rate"),
            "source": "https://www.exchangerate-api.com/",
        }
    except Exception as exc:
        return {"error": str(exc)}


async def calculate_distance(origin: str, destination: str) -> dict:
    """Calculate driving distance via Google Maps Distance Matrix API."""
    settings = get_settings()
    if not settings.google_maps_api_key:
        return {"error": "Google Maps API not configured"}

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": origin,
        "destinations": destination,
        "key": settings.google_maps_api_key,
        "units": "metric",
    }
    try:
        resp = await _client().get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
        element = data["rows"][0]["elements"][0]
        if element.get("status") != "OK":
            return {"error": element.get("status", "UNKNOWN"), "origin": origin, "destination": destination}
        return {
            "origin": origin,
            "destination": destination,
            "distance": element["distance"]["text"],
            "duration": element["duration"]["text"],
            "source": "https://developers.google.com/maps/documentation/distance-matrix",
        }
    except Exception as exc:
        return {"error": str(exc)}


async def search_places(query: str, city: str = "") -> dict:
    """Search places via Google Places Text Search API."""
    settings = get_settings()
    if not settings.google_maps_api_key:
        return {"error": "Google Places API not configured", "results": []}

    search_query = f"{query} in {city}" if city else query
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": search_query, "key": settings.google_maps_api_key}
    try:
        resp = await _client().get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
        results = []
        for place in data.get("results", [])[:5]:
            results.append(
                {
                    "name": place.get("name"),
                    "address": place.get("formatted_address"),
                    "rating": place.get("rating"),
                    "place_id": place.get("place_id"),
                    "url": f"https://www.google.com/maps/place/?q=place_id:{place.get('place_id')}",
                }
            )
        return {"query": search_query, "results": results, "source": "https://developers.google.com/maps/documentation/places/web-service"}
    except Exception as exc:
        return {"error": str(exc), "results": []}


async def web_search(query: str, *, max_results: int = 5) -> dict:
    """Web search via Tavily API."""
    settings = get_settings()
    if not settings.tavily_api_key:
        return {"error": "Web search API not configured", "results": []}

    url = "https://api.tavily.com/search"
    payload = {
        "api_key": settings.tavily_api_key,
        "query": query,
        "max_results": max_results,
        "include_answer": False,
    }
    try:
        resp = await _client().post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        results = [
            {"title": r.get("title"), "url": r.get("url"), "snippet": r.get("content", "")[:300]}
            for r in data.get("results", [])
        ]
        return {"query": query, "results": results}
    except Exception as exc:
        return {"error": str(exc), "results": []}


async def search_flights(origin: str, destination: str, date: str = "") -> dict:
    """Search flight options via web search."""
    if origin and destination:
        query = f"flights from {origin} to {destination} {date}".strip()
    elif destination:
        query = f"flights to {destination} {date}".strip()
    else:
        query = f"flight timings {date}".strip()
    data = await web_search(query, max_results=5)
    return {
        "origin": origin,
        "destination": destination,
        "date": date,
        "flights": data.get("results", []),
        "source": "https://www.google.com/travel/flights",
        "error": data.get("error"),
    }


async def search_hotels(city: str, query: str = "hotels") -> dict:
    """Search hotels via Google Places, falling back to web search."""
    if not city:
        return {"error": "City required for hotel search", "hotels": []}

    settings = get_settings()
    if settings.google_maps_api_key:
        places = await search_places(f"{query} {city}", city)
        if places.get("results"):
            return {
                "city": city,
                "hotels": places.get("results", []),
                "source": places.get("source", ""),
                "error": places.get("error"),
            }

    search_q = f"{query} in {city} availability"
    data = await web_search(search_q, max_results=5)
    return {
        "city": city,
        "hotels": data.get("results", []),
        "source": "https://www.trivago.com/",
        "error": data.get("error"),
    }


async def get_visa_info(country: str, nationality: str = "") -> dict:
    """Fetch visa requirements via web search."""
    if nationality:
        query = f"visa requirements for {nationality} citizens traveling to {country}"
    else:
        query = f"tourist visa requirements for {country}"
    data = await web_search(query, max_results=5)
    return {
        "country": country,
        "nationality": nationality,
        "results": data.get("results", []),
        "source": "https://www.iatatravelcentre.com/",
        "error": data.get("error"),
    }
