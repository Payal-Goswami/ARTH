from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0)
    type: str = Field(..., pattern="^(income|expense|transfer|investment)$")
    category: str
    description: Optional[str] = None
    merchant: Optional[str] = None
    is_recurring: bool = False
    location: Optional[str] = None
    device_id: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    type: str
    category: str
    description: Optional[str]
    merchant: Optional[str]
    is_recurring: bool
    is_flagged: bool
    fraud_score: float
    location: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionSummary(BaseModel):
    total_income: float
    total_expense: float
    net_savings: float
    top_categories: List[dict]
    monthly_trend: List[dict]
    flagged_count: int
