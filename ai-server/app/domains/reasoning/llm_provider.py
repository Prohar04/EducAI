"""
Unified LLM provider abstraction for Gemini, OpenRouter, and xAI.

Provides a single generateText() function that routes to the configured provider.
"""

from __future__ import annotations

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
    XAI = "xai"


# ── Provider detection ────────────────────────────────────────────────────────


def _get_provider() -> LLMProvider:
    """
    Determine which LLM provider to use.

    Priority:
    1. LLM_PROVIDER environment variable if set
    2. Default to Gemini for Bangladesh deployments
    3. Fallback to OpenRouter if Gemini not configured

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
                f"Valid values: gemini, openrouter, xai. Falling back to auto-detection."
            )

    # Bangladesh deployment detection (city/timezone/etc.) - for now use simple logic
    # Could be enhanced with more sophisticated detection
    if settings.GEMINI_API_KEY:
        logger.info("Defaulting to Gemini provider (Bangladesh deployment)")
        return LLMProvider.GEMINI

    # Fallback to OpenRouter
    if settings.OPENROUTER_API_KEY:
        logger.info("Defaulting to OpenRouter provider")
        return LLMProvider.OPENROUTER

    # Last resort: xAI if configured
    if settings.XAI_API_KEY:
        logger.info("Defaulting to xAI provider")
        return LLMProvider.XAI

    raise RuntimeError(
        "No LLM provider configured. Set LLM_PROVIDER and provide at least one API key: "
        "GEMINI_API_KEY, OPENROUTER_API_KEY, or XAI_API_KEY"
    )


# ── Model defaults per provider ───────────────────────────────────────────────


_DEFAULT_MODELS = {
    LLMProvider.GEMINI: "gemini-2.0-flash-exp",
    LLMProvider.OPENROUTER: "openai/gpt-4o-mini",
    LLMProvider.XAI: "grok-beta",
}


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

    model_name = model or _DEFAULT_MODELS[LLMProvider.GEMINI]
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

    model_name = model or _DEFAULT_MODELS[LLMProvider.OPENROUTER]
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

    model_name = model or _DEFAULT_MODELS[LLMProvider.XAI]
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
    """
    selected_provider = provider or _get_provider()

    logger.info(
        f"Generating text with {selected_provider.value} "
        f"(model={model or _DEFAULT_MODELS[selected_provider]}, "
        f"temp={temperature}, json={json_mode})"
    )

    if selected_provider == LLMProvider.GEMINI:
        return await _generate_text_gemini(
            prompt,
            system_prompt=system_prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=json_mode,
        )
    elif selected_provider == LLMProvider.OPENROUTER:
        return await _generate_text_openrouter(
            prompt,
            system_prompt=system_prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=json_mode,
        )
    elif selected_provider == LLMProvider.XAI:
        return await _generate_text_xai(
            prompt,
            system_prompt=system_prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=json_mode,
        )
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
