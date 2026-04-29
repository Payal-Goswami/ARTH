from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base


class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"
    INVESTMENT = "investment"


class TransactionCategory(str, enum.Enum):
    FOOD = "food"
    TRANSPORT = "transport"
    ENTERTAINMENT = "entertainment"
    UTILITIES = "utilities"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    SHOPPING = "shopping"
    RENT = "rent"
    SALARY = "salary"
    INVESTMENT = "investment"
    OTHER = "other"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String(20), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    merchant = Column(String(255), nullable=True)
    is_recurring = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)  # fraud flag
    fraud_score = Column(Float, default=0.0)
    location = Column(String(255), nullable=True)
    device_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="transactions")
