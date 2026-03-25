"""
Unified LLM provider abstraction for Gemini, OpenRouter, Groq, and xAI.

Provides a single generateText() function that routes to the configured provider.
"""

from __future__ import annotations

import asyncio
import json
from enum import Enum
from typing import Any, Dict, List, Optional

import httpx

from ...core.config import settings
from ...core.logger import logger


class LLMProvider(str, Enum):
    """Supported LLM providers."""

    GEMINI = "gemini"
    OPENROUTER = "openrouter"
    GROQ = "groq"
    XAI = "xai"


# ── Provider detection ────────────────────────────────────────────────────────


def _get_provider() -> LLMProvider:
    """
    Determine which LLM provider to use.

    Priority:
    1. LLM_PROVIDER environment variable if set
    2. Default to OpenRouter (free tier)
    3. Fallback chain: Gemini → Groq → xAI

    :return: LLMProvider enum value
    """
    # Explicit provider override
    provider_str = settings.LLM_PROVIDER
    if provider_str:
        try:
            return LLMProvider(provider_str.lower())
        except ValueError:
            logger.warning(
                f"Invalid LLM_PROVIDER '{provider_str}'. "
                f"Valid values: gemini, openrouter, groq, xai. Falling back to auto-detection."
            )

    # Priority 1: OpenRouter (free tier default)
    if settings.OPENROUTER_API_KEY:
        logger.info("Defaulting to OpenRouter provider (free tier)")
        return LLMProvider.OPENROUTER

    # Priority 2: Gemini
    if settings.GEMINI_API_KEY:
        logger.info("Defaulting to Gemini provider")
        return LLMProvider.GEMINI

    # Priority 3: Groq
    if settings.GROQ_API_KEY:
        logger.info("Defaulting to Groq provider")
        return LLMProvider.GROQ

    # Priority 4: xAI
    if settings.XAI_API_KEY:
        logger.info("Defaulting to xAI provider")
        return LLMProvider.XAI

    raise RuntimeError(
        "No LLM provider configured. Set LLM_PROVIDER and provide at least one API key: "
        "OPENROUTER_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, or XAI_API_KEY"
    )


# ── Model defaults per provider ───────────────────────────────────────────────


_DEFAULT_MODELS = {
    LLMProvider.GEMINI: "gemini-2.0-flash-exp",
    LLMProvider.OPENROUTER: "openrouter/free",  # Free tier model
    LLMProvider.GROQ: "llama-3.3-70b-versatile",  # Free tier model
    LLMProvider.XAI: "grok-beta",
}


def _get_model(provider: LLMProvider, override: Optional[str] = None) -> str:
    """
    Get the model name to use for a given provider.

    Priority:
    1. Explicit override parameter
    2. LLM_MODEL environment variable
    3. Provider default

    :param provider: LLM provider enum
    :param override: Optional explicit model override
    :return: Model name string
    """
    if override:
        return override
    if settings.LLM_MODEL:
        return settings.LLM_MODEL
    return _DEFAULT_MODELS[provider]


# ── Provider implementations ──────────────────────────────────────────────────


async def _generate_text_gemini(
    prompt: str,
    *,
    system_prompt: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: Optional[int] = None,
    json_mode: bool = False,
) -> str:
    """
    Generate text using Google Gemini API.

    Reference: https://ai.google.dev/api/rest/v1/models/generateContent
    """
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY not configured")

    model_name = _get_model(LLMProvider.GEMINI, model)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"

    # Build contents array
    contents: List[Dict[str, Any]] = []

    if system_prompt:
        # Gemini uses systemInstruction field, not a message in contents
        pass

    contents.append({"role": "user", "parts": [{"text": prompt}]})

    # Build generation config
    generation_config: Dict[str, Any] = {
        "temperature": temperature,
    }
    if max_tokens:
        generation_config["maxOutputTokens"] = max_tokens
    if json_mode:
        generation_config["responseMimeType"] = "application/json"

    payload: Dict[str, Any] = {
        "contents": contents,
        "generationConfig": generation_config,
    }

    # Add system instruction if provided
    if system_prompt:
        payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}

    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.post(
            url,
            headers={"Content-Type": "application/json"},
            params={"key": settings.GEMINI_API_KEY},
            json=payload,
        )
        response.raise_for_status()

    data = response.json()

    # Extract text from response
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as e:
        logger.error(f"Failed to parse Gemini response: {e}\n{data}")
        raise RuntimeError(f"Unexpected Gemini API response format: {e}")


async def _generate_text_openrouter(
    prompt: str,
    *,
    system_prompt: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: Optional[int] = None,
    json_mode: bool = False,
) -> str:
    """
    Generate text using OpenRouter API (OpenAI-compatible).

    Reference: https://openrouter.ai/docs#quick-start
    """
    if not settings.OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY not configured")

    model_name = _get_model(LLMProvider.OPENROUTER, model)
    url = "https://openrouter.ai/api/v1/chat/completions"

    messages: List[Dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload: Dict[str, Any] = {
        "model": model_name,
        "messages": messages,
        "temperature": temperature,
    }

    if max_tokens:
        payload["max_tokens"] = max_tokens

    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.post(
            url,
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()

    data = response.json()

    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as e:
        logger.error(f"Failed to parse OpenRouter response: {e}\n{data}")
        raise RuntimeError(f"Unexpected OpenRouter API response format: {e}")


async def _generate_text_groq(
    prompt: str,
    *,
    system_prompt: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: Optional[int] = None,
    json_mode: bool = False,
) -> str:
    """
    Generate text using Groq API (OpenAI-compatible).

    Reference: https://console.groq.com/docs/quickstart
    """
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not configured")

    model_name = _get_model(LLMProvider.GROQ, model)
    url = "https://api.groq.com/openai/v1/chat/completions"

    messages: List[Dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload: Dict[str, Any] = {
        "model": model_name,
        "messages": messages,
        "temperature": temperature,
    }

    if max_tokens:
        payload["max_tokens"] = max_tokens

    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.post(
            url,
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()

    data = response.json()

    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as e:
        logger.error(f"Failed to parse Groq response: {e}\n{data}")
        raise RuntimeError(f"Unexpected Groq API response format: {e}")


async def _generate_text_xai(
    prompt: str,
    *,
    system_prompt: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: Optional[int] = None,
    json_mode: bool = False,
) -> str:
    """
    Generate text using xAI Grok API (OpenAI-compatible).

    Important: xAI uses Authorization: Bearer <key>, not X-API-Key

    Reference: https://docs.x.ai/api
    """
    if not settings.XAI_API_KEY:
        raise RuntimeError("XAI_API_KEY not configured")

    model_name = _get_model(LLMProvider.XAI, model)
    url = "https://api.x.ai/v1/chat/completions"

    messages: List[Dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload: Dict[str, Any] = {
        "model": model_name,
        "messages": messages,
        "temperature": temperature,
    }

    if max_tokens:
        payload["max_tokens"] = max_tokens

    if json_mode:
        # xAI supports response_format like OpenAI
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.post(
            url,
            headers={
                # IMPORTANT: xAI uses Bearer token, not X-API-Key
                "Authorization": f"Bearer {settings.XAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()

    data = response.json()

    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as e:
        logger.error(f"Failed to parse xAI response: {e}\n{data}")
        raise RuntimeError(f"Unexpected xAI API response format: {e}")


# ── Public API ────────────────────────────────────────────────────────────────


class RateLimitError(Exception):
    """Raised when API rate limit is exceeded."""

    pass


async def _generate_with_retry(
    provider_func,
    *,
    max_retries: int = 3,
    **kwargs,
) -> str:
    """
    Wrapper to handle rate limiting with exponential backoff.

    :param provider_func: Async function to call (provider-specific)
    :param max_retries: Maximum number of retry attempts
    :param kwargs: Arguments to pass to provider_func
    :return: Generated text
    :raises RateLimitError: If rate limit persists after all retries
    """
    for attempt in range(max_retries):
        try:
            return await provider_func(**kwargs)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:  # Rate limit
                if attempt < max_retries - 1:
                    # Exponential backoff: 1s, 2s, 4s
                    wait_time = 2 ** attempt
                    logger.warning(
                        f"Rate limit hit (attempt {attempt + 1}/{max_retries}). "
                        f"Retrying in {wait_time}s..."
                    )
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    # Out of retries
                    raise RateLimitError(
                        "Rate limit exceeded. Please try again in a minute."
                    )
            else:
                # Non-rate-limit error, re-raise immediately
                raise


async def generate_text(
    prompt: str,
    *,
    system_prompt: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: Optional[int] = None,
    json_mode: bool = False,
    provider: Optional[LLMProvider] = None,
) -> str:
    """
    Generate text using the configured LLM provider.

    :param prompt: User prompt to send to the model
    :param system_prompt: Optional system prompt (instructions)
    :param model: Optional model name override (provider-specific)
    :param temperature: Sampling temperature (0.0 = deterministic, 1.0 = creative)
    :param max_tokens: Maximum tokens to generate
    :param json_mode: If True, request JSON output from the model
    :param provider: Optional provider override (defaults to auto-detection)
    :return: Generated text content
    :raises RuntimeError: If no provider is configured or API call fails
    :raises RateLimitError: If rate limit is exceeded after retries
    """
    selected_provider = provider or _get_provider()
    model_to_use = _get_model(selected_provider, model)

    logger.info(
        f"Generating text with {selected_provider.value} "
        f"(model={model_to_use}, temp={temperature}, json={json_mode})"
    )

    common_kwargs = {
        "prompt": prompt,
        "system_prompt": system_prompt,
        "model": model,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "json_mode": json_mode,
    }

    if selected_provider == LLMProvider.GEMINI:
        return await _generate_with_retry(_generate_text_gemini, **common_kwargs)
    elif selected_provider == LLMProvider.OPENROUTER:
        return await _generate_with_retry(_generate_text_openrouter, **common_kwargs)
    elif selected_provider == LLMProvider.GROQ:
        return await _generate_with_retry(_generate_text_groq, **common_kwargs)
    elif selected_provider == LLMProvider.XAI:
        return await _generate_with_retry(_generate_text_xai, **common_kwargs)
    else:
        raise ValueError(f"Unsupported provider: {selected_provider}")


def parse_json_response(content: str) -> Any:
    """
    Parse JSON from LLM response, handling markdown code blocks.

    :param content: Raw content from LLM
    :return: Parsed JSON object (dict or list)
    :raises json.JSONDecodeError: If content is not valid JSON
    """
    content = content.strip()

    # Remove markdown code blocks if present
    if content.startswith("```"):
        parts = content.split("```")
        if len(parts) >= 2:
            content = parts[1]
            # Remove language identifier (e.g., "json")
            if content.lower().startswith("json"):
                content = content[4:]

    content = content.strip()
    return json.loads(content)


# ── Chat API for multi-turn conversations ─────────────────────────────────────


async def generate_chat_response(
    messages: List[Dict[str, str]],
    *,
    system_prompt: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.7,  # Higher default for chat
    max_tokens: Optional[int] = None,
    provider: Optional[LLMProvider] = None,
) -> Dict[str, Any]:
    """
    Generate a chat response for multi-turn conversations.

    This function is optimized for chatbot interactions and supports conversation history.

    :param messages: List of message dicts with 'role' and 'content' keys
                     Example: [{"role": "user", "content": "Hello"}]
    :param system_prompt: Optional system prompt for the chatbot personality
    :param model: Optional model name override
    :param temperature: Sampling temperature (0.0-1.0), default 0.7 for chat
    :param max_tokens: Maximum tokens to generate
    :param provider: Optional provider override
    :return: Dict with 'text' (response content) and 'citations' (empty list for now)
    :raises RateLimitError: If rate limit is exceeded
    """
    selected_provider = provider or _get_provider()

    # Build prompt from messages
    conversation = []
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            conversation.append(f"User: {content}")
        elif role == "assistant":
            conversation.append(f"Assistant: {content}")

    # Combine into a single prompt for single-turn providers (Gemini)
    # For multi-turn providers (OpenRouter, Groq, xAI), we'll call their chat endpoints directly
    conversation_text = "\n\n".join(conversation)

    try:
        response_text = await generate_text(
            prompt=conversation_text,
            system_prompt=system_prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            provider=selected_provider,
        )

        return {
            "text": response_text,
            "citations": [],  # Placeholder for future citation support
        }
    except RateLimitError:
        # Re-raise rate limit errors with user-friendly message
        raise RateLimitError("Rate limit reached. Try again in a minute.")
