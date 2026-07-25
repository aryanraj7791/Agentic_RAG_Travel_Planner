"""Application settings loaded from environment variables."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # LLM
    gemini_api_key: str = ""
    llm_model: str = "gemini/gemini-2.5-flash"
    embedding_model: str = "text-embedding-004"
    embedding_provider: str = "gemini"  # gemini | huggingface
    hf_inference_api_key: str = ""

    # Qdrant Cloud
    qdrant_url: str = ""
    qdrant_api_key: str = ""
    qdrant_collection: str = "travel_knowledge"

    # MongoDB Atlas
    mongodb_uri: str = ""
    mongodb_db: str = "travel_planner"

    # External tools
    openweather_api_key: str = ""
    exchangerate_api_key: str = ""
    google_maps_api_key: str = ""
    tavily_api_key: str = ""

    # App
    cors_origins: str = "http://localhost:5173"
    chat_timeout_seconds: int = 300
    max_conversation_turns: int = 8

    # Paths
    data_dir: Path = Path(__file__).resolve().parent.parent / "data"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
