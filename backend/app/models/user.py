from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    phone = Column(String(20), nullable=True)
    monthly_income = Column(Float, nullable=True)
    risk_profile = Column(String(50), default="moderate")  # conservative / moderate / aggressive
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    transactions = relationship("Transaction", back_populates="user", lazy="selectin")
    credit_profiles = relationship("CreditProfile", back_populates="user", lazy="selectin")
    behavioral_logs = relationship("BehavioralLog", back_populates="user", lazy="selectin")
