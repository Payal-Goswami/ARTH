"""
Explainable AI Credit System — XAI scoring with transparent reasoning.
Goes beyond CIBIL: explains WHY, shows HOW to improve.
"""
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.services.ai.gemini import generate_json
from app.schemas.ai import CreditScoreResponse


SYSTEM_PROMPT = """You are ARTH's Explainable Credit AI. 
You provide transparent, fair credit assessments with clear reasoning.
Your explanations must be actionable and educational.
Always respond with valid JSON."""


def _grade_from_score(score: float) -> str:
    if score >= 800: return "A+"
    if score >= 750: return "A"
    if score >= 700: return "B+"
    if score >= 650: return "B"
    if score >= 600: return "C"
    if score >= 550: return "D"
    return "F"


def _compute_raw_score(data: Dict) -> Dict[str, float]:
    """
    Compute credit sub-scores from financial data.
    Weights mirror FICO methodology.
    """
    weights = {
        "payment_history": 0.35,
        "utilization": 0.30,
        "age_of_credit": 0.15,
        "credit_mix": 0.10,
        "new_credit": 0.10,
    }

    # Payment history: ratio of on-time payments
    total_tx = max(data.get("total_transactions", 1), 1)
    flagged = data.get("flagged_transactions", 0)
    recurring_met = data.get("recurring_paid", 0)
    recurring_total = max(data.get("recurring_total", 1), 1)
    payment_score = (1 - flagged / total_tx) * (recurring_met / recurring_total) * 900

    # Utilization: expense-to-income ratio (lower = better)
    income = max(data.get("avg_monthly_income", 1), 1)
    expense = data.get("avg_monthly_expense", 0)
    utilization = min(expense / income, 1.0)
    utilization_score = (1 - utilization) * 900

    # Age of credit: longer = better, max benefit at 5 years
    months_active = data.get("months_active", 0)
    age_score = min(months_active / 60, 1.0) * 900

    # Credit mix: diversity of transaction types
    category_count = data.get("unique_categories", 1)
    mix_score = min(category_count / 8, 1.0) * 900

    # New credit: penalise sudden spikes in spending
    new_accounts = data.get("new_high_value_transactions", 0)
    new_score = max(0, (1 - new_accounts / 10)) * 900

    sub_scores = {
        "payment_history": round(payment_score, 1),
        "utilization": round(utilization_score, 1),
        "age_of_credit": round(age_score, 1),
        "credit_mix": round(mix_score, 1),
        "new_credit": round(new_score, 1),
    }

    overall = sum(sub_scores[k] * weights[k] for k in weights)
    # Normalise to 300–900 range
    overall = 300 + (overall / 900) * 600
    sub_scores["overall"] = round(overall, 1)
    return sub_scores


async def compute_credit_score(
    transactions: List[Dict],
    user_data: Dict,
) -> CreditScoreResponse:
    """Full XAI credit pipeline."""

    # ── Build aggregate data ──
    total = len(transactions)
    flagged = sum(1 for t in transactions if t.get("is_flagged"))
    recurring = [t for t in transactions if t.get("is_recurring")]
    incomes = [t["amount"] for t in transactions if t["type"] == "income"]
    expenses = [t["amount"] for t in transactions if t["type"] == "expense"]
    categories = set(t["category"] for t in transactions)
    high_value = [t for t in transactions if t["type"] == "expense" and t["amount"] > 50000]

    from datetime import datetime
    if transactions:
        oldest = min(transactions, key=lambda t: t["created_at"])
        from dateutil.relativedelta import relativedelta
        try:
            oldest_date = datetime.fromisoformat(oldest["created_at"])
            months_active = (datetime.now() - oldest_date).days // 30
        except Exception:
            months_active = 6
    else:
        months_active = 0

    aggregate = {
        "total_transactions": total,
        "flagged_transactions": flagged,
        "recurring_paid": len(recurring),
        "recurring_total": max(len(recurring), 1),
        "avg_monthly_income": sum(incomes) / max(months_active, 1),
        "avg_monthly_expense": sum(expenses) / max(months_active, 1),
        "months_active": months_active,
        "unique_categories": len(categories),
        "new_high_value_transactions": len(high_value),
    }

    scores = _compute_raw_score(aggregate)
    overall = scores.pop("overall")
    grade = _grade_from_score(overall)

    # ── Gemini XAI enrichment ──
    prompt = f"""
Credit assessment data:
- Credit Score: {overall:.0f}/900 (Grade: {grade})
- Payment History Score: {scores['payment_history']:.0f}/900
- Credit Utilization Score: {scores['utilization']:.0f}/900
- Age of Credit Score: {scores['age_of_credit']:.0f}/900
- Credit Mix Score: {scores['credit_mix']:.0f}/900
- New Credit Score: {scores['new_credit']:.0f}/900
- Months Active: {months_active}
- Flagged Transactions: {flagged}
- Monthly Income: ₹{aggregate['avg_monthly_income']:,.0f}
- Monthly Expense: ₹{aggregate['avg_monthly_expense']:,.0f}

Provide a response ONLY in this JSON format:
{{
  "explanation": "2-3 sentence plain-English explanation of this credit score",
  "reasons": ["reason 1 for the score", "reason 2", "reason 3"],
  "improvements": ["specific action to improve score", "action 2", "action 3"],
  "what_if_scenarios": {{
    "pay_all_bills_on_time_3_months": 45,
    "reduce_spending_by_20_percent": 30,
    "clear_flagged_transactions": 60,
    "diversify_spending_categories": 15
  }}
}}
The what_if_scenarios values represent estimated score increases.
"""
    ai_data = await generate_json(prompt, SYSTEM_PROMPT)

    return CreditScoreResponse(
        score=overall,
        grade=grade,
        factors=scores,
        reasons=ai_data.get("reasons", ["Insufficient data for detailed analysis"]),
        improvements=ai_data.get("improvements", ["Add more transaction history"]),
        ai_explanation=ai_data.get("explanation", "Score computed based on available financial data."),
        what_if_scenarios=ai_data.get("what_if_scenarios", {}),
        computed_at=datetime.now(timezone.utc),
    )
