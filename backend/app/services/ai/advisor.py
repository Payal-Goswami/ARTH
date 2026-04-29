"""
ARTH AI Financial Advisor — Conversational Gemini-powered chat.
"""
from typing import List, Dict
from app.services.ai.gemini import chat_with_history
from app.schemas.ai import ChatResponse

SYSTEM_PROMPT = """You are ARTH, an expert AI Financial Advisor. 
Your personality: calm, knowledgeable, empathetic, concise.
You help users understand their finances, improve credit scores, avoid fraud, and plan for the future.
Always give actionable advice in simple language. Use Indian financial context (₹, CIBIL, UPI, etc.).
Keep responses under 200 words unless deep analysis is requested.
End each response with 2-3 quick follow-up suggestion buttons (as JSON array in your response).

Always respond in this format:
<reply>Your main response here</reply>
<suggestions>["suggestion 1", "suggestion 2", "suggestion 3"]</suggestions>
"""


async def chat(message: str, history: List[Dict[str, str]]) -> ChatResponse:
    raw = await chat_with_history(message, history, SYSTEM_PROMPT)

    # Parse structured response
    reply = raw
    suggestions = ["Show my credit score", "Simulate next 6 months", "Check for fraud alerts"]

    import re
    reply_match = re.search(r"<reply>(.*?)</reply>", raw, re.DOTALL)
    sugg_match = re.search(r"<suggestions>(.*?)</suggestions>", raw, re.DOTALL)

    if reply_match:
        reply = reply_match.group(1).strip()
    if sugg_match:
        import json
        try:
            suggestions = json.loads(sugg_match.group(1).strip())
        except Exception:
            pass

    return ChatResponse(reply=reply, suggestions=suggestions)
