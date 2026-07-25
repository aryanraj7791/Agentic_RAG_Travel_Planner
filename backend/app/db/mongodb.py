"""Lazy MongoDB Atlas client — chat logs, preferences, itineraries, feedback."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings

_client: AsyncIOMotorClient | None = None


def get_mongo_client() -> AsyncIOMotorClient | None:
    global _client
    settings = get_settings()
    if not settings.mongodb_uri:
        return None
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000)
    return _client


def get_database() -> AsyncIOMotorDatabase | None:
    client = get_mongo_client()
    if client is None:
        return None
    return client[get_settings().mongodb_db]


def _timestamped(doc: dict[str, Any]) -> dict[str, Any]:
    return {**doc, "created_at": datetime.now(timezone.utc)}


async def log_chat_interaction(payload: dict[str, Any]) -> None:
    try:
        db = get_database()
        if db is None:
            return
        await db.chat_logs.insert_one(_timestamped(payload))
    except Exception:
        pass  # Never block chat response on DB errors


async def save_user_preferences(user_id: str, preferences: dict[str, Any]) -> None:
    try:
        db = get_database()
        if db is None:
            return
        await db.user_preferences.update_one(
            {"user_id": user_id},
            {"$set": {**preferences, "updated_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
    except Exception:
        pass


async def save_itinerary(payload: dict[str, Any]) -> None:
    try:
        db = get_database()
        if db is None:
            return
        await db.saved_itineraries.insert_one(_timestamped(payload))
    except Exception:
        pass


async def save_feedback(payload: dict[str, Any]) -> None:
    try:
        db = get_database()
        if db is None:
            return
        await db.feedback.insert_one(_timestamped(payload))
    except Exception:
        pass
