from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class BehavioralLog(Base):
    __tablename__ = "behavioral_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String(255), nullable=True)
    device_fingerprint = Column(String(255), nullable=True)
    ip_address = Column(String(64), nullable=True)
    location = Column(String(255), nullable=True)
    typing_pattern = Column(JSON, nullable=True)     # keystroke timings
    mouse_pattern = Column(JSON, nullable=True)      # mouse movement features
    touch_pattern = Column(JSON, nullable=True)      # touch events (mobile)
    anomaly_score = Column(Float, default=0.0)       # 0.0 = normal, 1.0 = anomalous
    is_anomalous = Column(Boolean, default=False)
    risk_level = Column(String(20), default="low")   # low / medium / high / critical
    flagged_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="behavioral_logs")
