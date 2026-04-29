from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionSummary
from app.services.ai.fraud_engine import check_transaction_fraud
from collections import defaultdict


async def add_transaction(
    db: AsyncSession,
    user: User,
    data: TransactionCreate,
) -> Transaction:
    # Get history for fraud check
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user.id).limit(50)
    )
    history = [
        {"amount": t.amount, "type": t.type, "location": t.location}
        for t in result.scalars().all()
    ]

    fraud_result = await check_transaction_fraud(
        {"amount": data.amount, "type": data.type, "location": data.location, "category": data.category},
        history,
    )

    tx = Transaction(
        user_id=user.id,
        amount=data.amount,
        type=data.type,
        category=data.category,
        description=data.description,
        merchant=data.merchant,
        is_recurring=data.is_recurring,
        location=data.location,
        device_id=data.device_id,
        fraud_score=fraud_result["fraud_score"],
        is_flagged=fraud_result["is_flagged"],
    )
    db.add(tx)
    await db.flush()
    await db.refresh(tx)
    return tx


async def get_transactions(
    db: AsyncSession,
    user_id: int,
    limit: int = 50,
    offset: int = 0,
) -> List[Transaction]:
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


async def get_summary(db: AsyncSession, user_id: int) -> TransactionSummary:
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user_id)
    )
    transactions = result.scalars().all()

    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    flagged = sum(1 for t in transactions if t.is_flagged)

    # Category breakdown
    cat_totals: Dict[str, float] = defaultdict(float)
    for t in transactions:
        if t.type == "expense":
            cat_totals[t.category] += t.amount

    top_categories = [
        {"category": k, "amount": v}
        for k, v in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    # Monthly trend (last 6 months)
    monthly: Dict[str, Dict] = defaultdict(lambda: {"income": 0.0, "expense": 0.0})
    for t in transactions:
        m = t.created_at.strftime("%Y-%m")
        if t.type == "income":
            monthly[m]["income"] += t.amount
        elif t.type == "expense":
            monthly[m]["expense"] += t.amount

    monthly_trend = [
        {"month": k, **v}
        for k, v in sorted(monthly.items())[-6:]
    ]

    return TransactionSummary(
        total_income=total_income,
        total_expense=total_expense,
        net_savings=total_income - total_expense,
        top_categories=top_categories,
        monthly_trend=monthly_trend,
        flagged_count=flagged,
    )
