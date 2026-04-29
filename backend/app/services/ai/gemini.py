"""
Central Gemini AI service — wraps google-generativeai for all ARTH AI modules.
"""
import json
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from app.core.config import settings
import structlog

log = structlog.get_logger()

genai.configure(api_key=settings.GEMINI_API_KEY)

GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 2048,
}

SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]


def _get_model(system_instruction: Optional[str] = None):
    kwargs = {
        "model_name": settings.GEMINI_MODEL,
        "generation_config": GENERATION_CONFIG,
        "safety_settings": SAFETY_SETTINGS,
    }
    if system_instruction:
        kwargs["system_instruction"] = system_instruction
    return genai.GenerativeModel(**kwargs)


def _to_gemini_role(role: str) -> str:
    if role == "assistant":
        return "model"
    return role


async def generate_text(prompt: str, system: Optional[str] = None) -> str:
    """Simple single-turn generation."""
    try:
        model = _get_model(system)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        log.error("gemini_error", error=str(e))
        return "AI service temporarily unavailable. Please try again."


async def generate_json(prompt: str, system: Optional[str] = None) -> dict:
    """Generate and parse JSON response."""
    json_system = (system or "") + "\n\nYou MUST respond with valid JSON only. No markdown, no explanation."
    try:
        model = _get_model(json_system)
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Strip markdown fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[-1]
            text = text.rsplit("```", 1)[0]
        return json.loads(text)
    except json.JSONDecodeError:
        log.error("gemini_json_parse_error", raw=text)
        return {}
    except Exception as e:
        log.error("gemini_error", error=str(e))
        return {}


async def chat_with_history(
    message: str,
    history: List[Dict[str, str]],
    system: Optional[str] = None,
) -> str:
    """Multi-turn chat with conversation history."""
    try:
        model = _get_model(system)
        chat = model.start_chat(
            history=[
                {"role": _to_gemini_role(h["role"]), "parts": [h["content"]]}
                for h in history
            ]
        )
        response = chat.send_message(message)
        return response.text
    except Exception as e:
        log.error("gemini_chat_error", error=str(e))
        return "I'm having trouble connecting right now. Please try again in a moment."
