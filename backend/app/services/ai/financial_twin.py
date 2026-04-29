"""
AI Financial Twin — Predicts future financial states using ML + Gemini.
"""
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import numpy as np
from app.services.ai.gemini import generate_json, generate_text
from app.schemas.ai import SimulationResponse, FutureSnapshot


SYSTEM_PROMPT = """You are ARTH's AI Financial Twin engine. 
You simulate future financial scenarios based on user data.
Be precise, realistic, and actionable in your analysis.
Always respond with structured JSON when asked."""


def _compute_trend(values: List[float]) -> float:
    """Linear regression slope for trend detection."""
    if len(values) < 2:
        return 0.0
    x = np.arange(len(values), dtype=float)
    y = np.array(values, dtype=float)
    slope = np.polyfit(x, y, 1)[0]
    return float(slope)


def _categorize_risk(balance: float, income: float, expense: float) -> str:
    if income == 0:
        return "critical"
    savings_rate = (income - expense) / income
    if savings_rate < 0:
        return "critical"
    elif savings_rate < 0.1:
        return "high"
    elif savings_rate < 0.25:
        return "moderate"
    return "low"


async def simulate_financial_future(
    transactions: List[Dict],
    months_ahead: int,
    monthly_income: float,
    scenario_overrides: Optional[Dict] = None,
) -> SimulationResponse:
    """
    Core simulation engine:
    1. Analyse historical spending patterns
    2. Project forward with ML trend analysis
    3. Use Gemini to enrich with AI narrative
    """
    # ── Step 1: Aggregate historical data ──
    income_history, expense_history = [], []
    monthly_data: Dict[str, Dict] = {}

    for tx in transactions:
        month_key = tx["created_at"][:7]  # YYYY-MM
        if month_key not in monthly_data:
            monthly_data[month_key] = {"income": 0.0, "expense": 0.0}
        if tx["type"] == "income":
            monthly_data[month_key]["income"] += tx["amount"]
        elif tx["type"] in ("expense", "transfer"):
            monthly_data[month_key]["expense"] += tx["amount"]

    sorted_months = sorted(monthly_data.keys())
    for m in sorted_months:
        income_history.append(monthly_data[m]["income"])
        expense_history.append(monthly_data[m]["expense"])

    # ── Step 2: Compute trends ──
    avg_income = float(np.mean(income_history)) if income_history else monthly_income
    avg_expense = float(np.mean(expense_history)) if expense_history else avg_income * 0.7
    income_trend = _compute_trend(income_history)
    expense_trend = _compute_trend(expense_history)

    if scenario_overrides:
        avg_income = scenario_overrides.get("monthly_income", avg_income)
        avg_expense = scenario_overrides.get("monthly_expense", avg_expense)

    # ── Step 3: Project snapshots ──
    snapshots: List[FutureSnapshot] = []
    current_balance = 0.0  # relative to now

    for i in range(1, months_ahead + 1):
        proj_income = max(0, avg_income + income_trend * i)
        proj_expense = max(0, avg_expense + expense_trend * i)
        current_balance += proj_income - proj_expense

        future_date = datetime.now() + timedelta(days=30 * i)
        month_label = future_date.strftime("%B %Y")

        risk = _categorize_risk(current_balance, proj_income, proj_expense)
        confidence = max(0.5, 0.95 - i * 0.04)  # decays with time

        snapshots.append(FutureSnapshot(
            month=month_label,
            projected_balance=round(current_balance, 2),
            projected_income=round(proj_income, 2),
            projected_expense=round(proj_expense, 2),
            risk_level=risk,
            confidence=round(confidence, 2),
        ))

    # ── Step 4: Gemini AI enrichment ──
    prompt = f"""
Analyse this financial projection and provide insights:

Average Monthly Income: ₹{avg_income:,.0f}
Average Monthly Expense: ₹{avg_expense:,.0f}
Savings Rate: {((avg_income - avg_expense) / max(avg_income, 1)) * 100:.1f}%
Projected Balance after {months_ahead} months: ₹{snapshots[-1].projected_balance:,.0f}
Income Trend: {"↑ Growing" if income_trend > 0 else "↓ Declining" if income_trend < 0 else "→ Stable"}
Expense Trend: {"↑ Growing" if expense_trend > 0 else "↓ Declining" if expense_trend < 0 else "→ Stable"}

Respond ONLY with this JSON:
{{
  "summary": "2-3 sentence AI summary",
  "overall_risk": "low|moderate|high|critical",
  "recommendations": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
}}
"""
    ai_data = await generate_json(prompt, SYSTEM_PROMPT)

    return SimulationResponse(
        snapshots=snapshots,
        overall_risk=ai_data.get("overall_risk", "moderate"),
        ai_summary=ai_data.get("summary", "Simulation complete."),
        recommendations=ai_data.get("recommendations", []),
    )
