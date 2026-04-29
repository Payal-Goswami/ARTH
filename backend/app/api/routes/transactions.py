from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionResponse, TransactionSummary
from app.services.financial.transaction_service import add_transaction, get_transactions, get_summary

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tx = await add_transaction(db, current_user, data)
    return tx


@router.get("/", response_model=List[TransactionResponse])
async def list_transactions(
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_transactions(db, current_user.id, limit, offset)


@router.get("/summary", response_model=TransactionSummary)
async def transaction_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_summary(db, current_user.id)
