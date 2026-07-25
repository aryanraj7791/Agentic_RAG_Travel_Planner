"""LiteLLM wrapper for Gemini 2.5 Flash — no local LLM loaded."""



from __future__ import annotations



import asyncio

import json

import os

from typing import Any



import litellm

from litellm.exceptions import RateLimitError , ServiceUnavailableError



from app.config import get_settings


_FALLBACK_MODEL = "gemini-3-flash-preview"


def _resolve_model(raw_model: str) -> str:
    """Ensure the model string is prefixed correctly for LiteLLM's Gemini routing."""
    name = raw_model.split("/")[-1] if "/" in raw_model else raw_model
    aliases = {
        "gemini-2.5-flash": "gemini-3.5-flash",
        "gemini-2.0-flash": "gemini-3.5-flash",
    }
    return aliases.get(name, name)


async def chat_completion(
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.3,
    max_tokens: int = 2048,
    max_retries: int = 3,
) -> str:
    """Call Gemini via LiteLLM and return assistant text with retry + fallback-model logic."""
    settings = get_settings()

    # Try the primary model first, then the fallback model if primary is exhausted
    models_to_try = [_resolve_model(settings.llm_model), _FALLBACK_MODEL]

    last_exc: Exception | None = None

    for model in models_to_try:
        for attempt in range(max_retries):
            try:
                response = await litellm.acompletion(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    custom_llm_provider="gemini",
                    max_tokens=max_tokens,
                    api_key=settings.gemini_api_key,
                )
                return response.choices[0].message.content or ""

            except (RateLimitError, ServiceUnavailableError) as e:
                last_exc = e
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt * 5  # 5s, 10s, 20s
                    print(f"{type(e).__name__} on {model}. Retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                    await asyncio.sleep(wait_time)
                else:
                    print(f"Exhausted retries on {model}, trying next model if available")
                    # falls out of inner loop, outer loop moves to next model

            except Exception as e:
                print(f"RAW LITELLM ERROR: {type(e).__name__}: {e}")
                raise  # non-retryable error, bail out immediately

    # If we reach here, every model + every retry attempt failed
    raise last_exc



async def chat_completion_json(messages, *, temperature=0.2, max_retries=3) -> dict[str, Any]:
    settings = get_settings()
    models_to_try = [_resolve_model(settings.llm_model), _FALLBACK_MODEL]

    for model in models_to_try:
        for attempt in range(max_retries):
            try:
                response = await litellm.acompletion(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    custom_llm_provider="gemini",
                    response_format={"type": "json_object"},
                    max_tokens=4096,
                    api_key=settings.gemini_api_key,
                )
                content = response.choices[0].message.content or "{}"
                return json.loads(content)
            except (RateLimitError, ServiceUnavailableError) as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt * 5
                    print(f"{type(e).__name__} on {model}. Retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                    await asyncio.sleep(wait_time)
                else:
                    print(f"Exhausted retries on {model}, trying next model if available")
            except Exception as e:
                print(f"RAW LITELLM ERROR: {type(e).__name__}: {e}")
                raise
    raise ServiceUnavailableError("All models exhausted", llm_provider="gemini", model=models_to_try[0])
