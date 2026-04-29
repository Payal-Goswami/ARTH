from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime


# ─── Financial Twin ────────────────────────────────────────────────────────────

class SimulationRequest(BaseModel):
    months_ahead: int = Field(default=6, ge=1, le=24)
    scenario: Optional[Dict[str, Any]] = None  # custom overrides


class FutureSnapshot(BaseModel):
    month: str
    projected_balance: float
    projected_income: float
    projected_expense: float
    risk_level: str
    confidence: float


class SimulationResponse(BaseModel):
    snapshots: List[FutureSnapshot]
    overall_risk: str
    ai_summary: str
    recommendations: List[str]


# ─── Credit ────────────────────────────────────────────────────────────────────

class CreditScoreResponse(BaseModel):
    score: float
    grade: str  # A+, A, B, C, D
    factors: Dict[str, float]  # factor_name -> score
    reasons: List[str]
    improvements: List[str]
    ai_explanation: str
    what_if_scenarios: Dict[str, float]
    computed_at: datetime


class WhatIfRequest(BaseModel):
    scenario_type: str  # "pay_debt", "new_credit", "increase_income"
    parameters: Dict[str, Any]


# ─── Fraud & Behavioral ────────────────────────────────────────────────────────

class BehavioralData(BaseModel):
    session_id: Optional[str] = None
    device_fingerprint: Optional[str] = None
    ip_address: Optional[str] = None
    location: Optional[str] = None
    typing_pattern: Optional[List[float]] = None   # inter-key timings
    mouse_pattern: Optional[List[float]] = None
    touch_pattern: Optional[List[float]] = None


class FraudCheckResponse(BaseModel):
    anomaly_score: float
    is_anomalous: bool
    risk_level: str
    flagged_reason: Optional[str]
    recommendations: List[str]


# ─── Chat / AI Advisor ─────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str]
