# ARTH — AI Financial Intelligence Platform

> **Predict • Explain • Protect** — The brain of next-generation banking.

ARTH is a fully AI-powered financial intelligence platform that doesn't just track money — it **predicts, explains, and protects** user finances in real time.

---

## 🏗️ Architecture

```
arth/
├── backend/          # FastAPI (Python) — AI/ML + REST API
├── frontend/         # React + Vite + Tailwind + shadcn/ui
└── docs/             # Architecture diagrams & documentation
```

## ⚙️ Core Modules

| Module | Description |
|---|---|
| 🧠 AI Financial Twin | Simulates future balance, spending impact, risk scenarios |
| 🎯 Explainable AI Credit | XAI credit scoring with actionable improvement plans |
| 🕵️ Behavioral Fraud Engine | Biometric anomaly detection — typing, device, location |

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or Supabase)
- Google Gemini API Key

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Fill in your credentials
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env      # Fill in your credentials
npm run dev
```

## 🔐 Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required variables.

## 📡 API Documentation

Once running, visit: `http://localhost:8000/docs`

---

Built for hackathon by Team P2 (ARTH).
