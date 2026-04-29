from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.behavioral import BehavioralLog
from app.models.credit import CreditProfile
from app.schemas.ai import (
    SimulationRequest, SimulationResponse,
    CreditScoreResponse,
    BehavioralData, FraudCheckResponse,
    ChatRequest, ChatResponse,
)
from app.services.ai.financial_twin import simulate_financial_future
from app.services.ai.credit_engine import compute_credit_score
from app.services.ai.fraud_engine import analyze_behavior
from app.services.ai.advisor import chat
from datetime import datetime, timezone

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])


# ─── Financial Twin ────────────────────────────────────────────────────────────

@router.post("/simulate", response_model=SimulationResponse)
async def simulate(
    request: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == current_user.id)
    )
    transactions = [
        {
            "amount": t.amount,
            "type": t.type,
            "category": t.category,
            "created_at": t.created_at.isoformat(),
        }
        for t in result.scalars().all()
    ]

    return await simulate_financial_future(
        transactions=transactions,
        months_ahead=request.months_ahead,
        monthly_income=current_user.monthly_income or 0,
        scenario_overrides=request.scenario,
    )


# ─── Credit Score ──────────────────────────────────────────────────────────────

@router.get("/credit-score", response_model=CreditScoreResponse)
async def credit_score(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == current_user.id)
    )
    transactions = [
        {
            "amount": t.amount,
            "type": t.type,
            "category": t.category,
            "is_flagged": t.is_flagged,
            "is_recurring": t.is_recurring,
            "created_at": t.created_at.isoformat(),
        }
        for t in result.scalars().all()
    ]

    score_response = await compute_credit_score(
        transactions=transactions,
        user_data={"monthly_income": current_user.monthly_income},
    )

    # Persist
    profile = CreditProfile(
        user_id=current_user.id,
        score=score_response.score,
        payment_history_score=score_response.factors.get("payment_history", 0),
        utilization_score=score_response.factors.get("utilization", 0),
        age_of_credit_score=score_response.factors.get("age_of_credit", 0),
        credit_mix_score=score_response.factors.get("credit_mix", 0),
        new_credit_score=score_response.factors.get("new_credit", 0),
        reasons=score_response.reasons,
        improvements=score_response.improvements,
        what_if_scenarios=score_response.what_if_scenarios,
        ai_explanation=score_response.ai_explanation,
    )
    db.add(profile)

    return score_response


# ─── Behavioral / Fraud ────────────────────────────────────────────────────────

@router.post("/fraud-check", response_model=FraudCheckResponse)
async def fraud_check(
    data: BehavioralData,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BehavioralLog)
        .where(BehavioralLog.user_id == current_user.id)
        .order_by(BehavioralLog.created_at.desc())
        .limit(20)
    )
    historical = [
        {
            "typing_pattern": log.typing_pattern,
            "mouse_pattern": log.mouse_pattern,
            "touch_pattern": log.touch_pattern,
        }
        for log in result.scalars().all()
    ]

    response = await analyze_behavior(data.model_dump(), historical)

    # Log current session
    log = BehavioralLog(
        user_id=current_user.id,
        session_id=data.session_id,
        device_fingerprint=data.device_fingerprint,
        ip_address=data.ip_address,
        location=data.location,
        typing_pattern=data.typing_pattern,
        mouse_pattern=data.mouse_pattern,
        touch_pattern=data.touch_pattern,
        anomaly_score=response.anomaly_score,
        is_anomalous=response.is_anomalous,
        risk_level=response.risk_level,
        flagged_reason=response.flagged_reason,
    )
    db.add(log)

    return response


# ─── AI Chat Advisor ───────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    history = [{"role": m.role, "content": m.content} for m in (request.history or [])]
    return await chat(request.message, history)
