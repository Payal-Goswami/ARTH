"""
Behavioral AI Fraud & Identity Engine
Detects anomalies using: typing patterns, device fingerprint, location, timing.
Uses Isolation Forest (sklearn) + Gemini for explanation.
"""
import numpy as np
from typing import List, Dict, Optional, Any
from sklearn.ensemble import IsolationForest
from app.services.ai.gemini import generate_json
from app.schemas.ai import FraudCheckResponse


SYSTEM_PROMPT = """You are ARTH's Behavioral Security AI.
You analyze behavioral biometrics and flag anomalies for fraud prevention.
Be precise and explain your risk assessment clearly."""


def _extract_features(behavioral: Dict) -> np.ndarray:
    """Convert raw behavioral data into ML feature vector."""
    features = []

    # Typing pattern features
    typing = behavioral.get("typing_pattern") or []
    if typing and len(typing) >= 3:
        features.extend([
            float(np.mean(typing)),
            float(np.std(typing)),
            float(np.min(typing)),
            float(np.max(typing)),
        ])
    else:
        features.extend([100.0, 30.0, 50.0, 200.0])  # defaults

    # Mouse pattern features
    mouse = behavioral.get("mouse_pattern") or []
    if mouse and len(mouse) >= 3:
        features.extend([
            float(np.mean(mouse)),
            float(np.std(mouse)),
        ])
    else:
        features.extend([500.0, 100.0])

    # Touch features (mobile)
    touch = behavioral.get("touch_pattern") or []
    if touch and len(touch) >= 2:
        features.extend([float(np.mean(touch)), float(np.std(touch))])
    else:
        features.extend([50.0, 15.0])

    return np.array(features, dtype=float)


def _compute_anomaly_score(
    current: np.ndarray,
    history: List[np.ndarray],
) -> float:
    """Use Isolation Forest on historical behavioral vectors."""
    if len(history) < 5:
        return 0.1  # not enough data — assume normal

    X = np.array(history)
    model = IsolationForest(n_estimators=50, contamination=0.1, random_state=42)
    model.fit(X)

    # score_samples returns negative: more negative = more anomalous
    raw = model.score_samples([current])[0]
    # Map to 0..1 (higher = more anomalous)
    score = 1 - (raw + 0.5)  # rough normalisation
    return float(np.clip(score, 0.0, 1.0))


def _risk_level(score: float) -> str:
    if score < 0.3: return "low"
    if score < 0.6: return "medium"
    if score < 0.8: return "high"
    return "critical"


async def analyze_behavior(
    behavioral: Dict,
    historical_logs: List[Dict],
) -> FraudCheckResponse:
    """Full behavioral fraud pipeline."""

    current_vec = _extract_features(behavioral)
    history_vecs = [_extract_features(log) for log in historical_logs if log]

    anomaly_score = _compute_anomaly_score(current_vec, history_vecs)
    risk = _risk_level(anomaly_score)
    is_anomalous = anomaly_score >= 0.6

    # ── Gemini explanation ──
    prompt = f"""
Behavioral biometric analysis results:
- Anomaly Score: {anomaly_score:.2f} (0=normal, 1=highly anomalous)
- Risk Level: {risk}
- Device: {behavioral.get('device_fingerprint', 'unknown')}
- Location: {behavioral.get('location', 'unknown')}
- Historical sessions analyzed: {len(historical_logs)}
- Typing pattern deviation: {'high' if anomaly_score > 0.6 else 'normal'}

Provide response in this JSON:
{{
  "flagged_reason": "one-sentence reason if anomalous, null if normal",
  "recommendations": ["security recommendation 1", "recommendation 2"]
}}
"""
    ai_data = await generate_json(prompt, SYSTEM_PROMPT)

    return FraudCheckResponse(
        anomaly_score=round(anomaly_score, 3),
        is_anomalous=is_anomalous,
        risk_level=risk,
        flagged_reason=ai_data.get("flagged_reason") if is_anomalous else None,
        recommendations=ai_data.get("recommendations", ["Continue monitoring"]),
    )


async def check_transaction_fraud(transaction: Dict, user_history: List[Dict]) -> Dict:
    """Quick transaction-level fraud check."""
    amount = transaction.get("amount", 0)
    category = transaction.get("category", "")
    location = transaction.get("location", "")

    # Statistical anomaly
    past_amounts = [t["amount"] for t in user_history if t.get("type") == "expense"]
    if past_amounts:
        mean_amt = np.mean(past_amounts)
        std_amt = np.std(past_amounts) or 1
        z_score = abs(amount - mean_amt) / std_amt
        fraud_score = min(z_score / 5.0, 1.0)  # z>5 → score=1
    else:
        fraud_score = 0.1

    # Location anomaly (simple: if first time seeing location)
    past_locations = [t.get("location") for t in user_history if t.get("location")]
    if location and past_locations and location not in past_locations:
        fraud_score = min(fraud_score + 0.2, 1.0)

    return {
        "fraud_score": round(float(fraud_score), 3),
        "is_flagged": fraud_score > 0.7,
    }
