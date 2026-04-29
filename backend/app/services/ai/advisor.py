"""
ARTH AI Financial Advisor — Conversational Gemini-powered chat.
"""
from typing import List, Dict
from app.services.ai.gemini import chat_with_history
from app.schemas.ai import ChatResponse

GEMINI_CONNECTION_FALLBACK = "I'm having trouble connecting right now. Please try again in a moment."

COMMON_FALLBACKS = {
    "how can i improve my credit score": {
        "reply": (
            "You can improve your credit score by paying every EMI and credit card bill on time, "
            "keeping credit utilisation below 30%, avoiding too many loan or card applications, "
            "and maintaining older credit accounts responsibly. If you have overdue payments, clear "
            "them first because repayment history has the biggest impact on your CIBIL profile."
        ),
        "suggestions": ["Show my credit score", "Check spending risks", "Plan next 6 months"],
    },
    "analyse my spending patterns": {
        "reply": (
            "Start by grouping your expenses into needs, lifestyle spends, debt payments, and savings. "
            "Watch for repeated small UPI/card spends, subscriptions, food delivery, shopping, and late "
            "fees because these quietly reduce monthly surplus. A healthy pattern is to keep essentials "
            "predictable, cap lifestyle spends, and move savings at the start of the month."
        ),
        "suggestions": ["Simulate next 6 months", "Find biggest risk", "Improve savings"],
    },
    "what is my biggest financial risk": {
        "reply": (
            "Your biggest financial risk is usually a low emergency buffer combined with high recurring "
            "expenses or debt obligations. If one income disruption can affect rent, EMIs, bills, or basic "
            "needs, build an emergency fund of 3-6 months of expenses before taking higher-risk investments."
        ),
        "suggestions": ["Simulate next 6 months", "Analyse my spending patterns", "Check for fraud alerts"],
    },
    "show my credit score": {
        "reply": (
            "Your credit score module estimates credit health from your transaction behaviour and profile. "
            "For a real lender-grade CIBIL score, check your official credit report. To improve the estimate, "
            "add recent transactions, income, recurring bills, EMIs, and repayment activity."
        ),
        "suggestions": ["How can I improve my credit score?", "Analyse my spending patterns", "Simulate next 6 months"],
    },
    "simulate next 6 months": {
        "reply": (
            "For the next 6 months, focus on monthly cash-flow stability: project income, fixed expenses, "
            "variable spends, debt payments, and target savings. If expenses grow faster than income for even "
            "2-3 months, reduce discretionary spends early and keep a separate emergency buffer."
        ),
        "suggestions": ["Analyse my spending patterns", "What is my biggest financial risk?", "Improve savings"],
    },
    "check for fraud alerts": {
        "reply": (
            "Review recent transactions for unfamiliar merchants, unusual amounts, duplicate debits, new devices, "
            "sudden location changes, and failed login or OTP attempts. If anything looks suspicious, freeze the "
            "card/account access, change passwords, revoke unknown devices, and report it to your bank immediately."
        ),
        "suggestions": ["Analyse my spending patterns", "What is my biggest financial risk?", "Secure my account"],
    },
}

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


def _normalize_message(message: str) -> str:
    return message.lower().strip().rstrip("?.!")


async def chat(message: str, history: List[Dict[str, str]]) -> ChatResponse:
    raw = await chat_with_history(message, history, SYSTEM_PROMPT)

    if raw == GEMINI_CONNECTION_FALLBACK:
        fallback = COMMON_FALLBACKS.get(_normalize_message(message))
        if fallback:
            return ChatResponse(
                reply=fallback["reply"],
                suggestions=fallback["suggestions"],
            )

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
