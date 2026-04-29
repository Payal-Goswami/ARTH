from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class CreditProfile(Base):
    __tablename__ = "credit_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Float, nullable=False)  # 300–900
    payment_history_score = Column(Float, default=0.0)
    utilization_score = Column(Float, default=0.0)
    age_of_credit_score = Column(Float, default=0.0)
    credit_mix_score = Column(Float, default=0.0)
    new_credit_score = Column(Float, default=0.0)
    reasons = Column(JSON, default=list)          # list of reason strings
    improvements = Column(JSON, default=list)     # list of action items
    what_if_scenarios = Column(JSON, default=dict)
    ai_explanation = Column(Text, nullable=True)
    computed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="credit_profiles")
