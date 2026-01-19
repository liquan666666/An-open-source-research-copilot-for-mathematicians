"""AI service for intelligent features using OpenAI or Anthropic Claude."""
import os
from typing import Optional, Dict, Any, List
from enum import Enum
import httpx
from server.settings import settings


class AIProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class AIService:
    """Unified AI service supporting both OpenAI and Anthropic."""

    def __init__(self):
        self.openai_api_key = settings.openai_api_key
        self.anthropic_api_key = settings.anthropic_api_key

        # Determine which provider to use
        if self.anthropic_api_key:
            self.provider = AIProvider.ANTHROPIC
            self.api_key = self.anthropic_api_key
        elif self.openai_api_key:
            self.provider = AIProvider.OPENAI
            self.api_key = self.openai_api_key
        else:
            self.provider = None
            self.api_key = None

    def is_available(self) -> bool:
        """Check if AI service is available."""
        return self.api_key is not None

    async def generate_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 2000,
        temperature: float = 0.7
    ) -> Optional[str]:
        """
        Generate AI completion using the configured provider.

        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt for context
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature (0-1)

        Returns:
            Generated text or None if service unavailable
        """
        if not self.is_available():
            return None

        try:
            if self.provider == AIProvider.ANTHROPIC:
                return await self._anthropic_completion(
                    prompt, system_prompt, max_tokens, temperature
                )
            elif self.provider == AIProvider.OPENAI:
                return await self._openai_completion(
                    prompt, system_prompt, max_tokens, temperature
                )
        except Exception as e:
            print(f"AI generation error: {e}")
            return None

    async def _anthropic_completion(
        self,
        prompt: str,
        system_prompt: Optional[str],
        max_tokens: int,
        temperature: float
    ) -> str:
        """Generate completion using Anthropic Claude API."""
        async with httpx.AsyncClient() as client:
            headers = {
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }

            data = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }

            if system_prompt:
                data["system"] = system_prompt

            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=data,
                timeout=60.0
            )
            response.raise_for_status()

            result = response.json()
            return result["content"][0]["text"]

    async def _openai_completion(
        self,
        prompt: str,
        system_prompt: Optional[str],
        max_tokens: int,
        temperature: float
    ) -> str:
        """Generate completion using OpenAI API."""
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            data = {
                "model": "gpt-4-turbo-preview",
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature
            }

            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=60.0
            )
            response.raise_for_status()

            result = response.json()
            return result["choices"][0]["message"]["content"]


# Global AI service instance
ai_service = AIService()
