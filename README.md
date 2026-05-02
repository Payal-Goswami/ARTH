# ARTH - AI Financial Intelligence Platform

ARTH is an AI-powered financial intelligence platform for personal banking and financial wellness. It combines transaction tracking, predictive simulations, explainable credit insights, fraud-risk checks, and an AI financial advisor in one full-stack application.

## Highlights

- AI Financial Twin for balance forecasting and what-if spending simulations
- Explainable AI credit scoring with factors, reasons, and improvement actions
- Behavioral fraud checks using device, location, typing, mouse, and touch signals
- Transaction-level fraud scoring when new transactions are added
- AI chat advisor powered by Google Gemini
- React dashboard backed by a FastAPI REST API

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, TypeScript, Tailwind CSS, Radix UI, Framer Motion, Recharts |
| Backend | FastAPI, Python 3.11, SQLAlchemy, Alembic, Pydantic |
| Database | PostgreSQL or Supabase Postgres |
| AI and ML | Google Gemini, NumPy, pandas, scikit-learn |
| Auth | JWT access and refresh tokens, bcrypt password hashing |
| Deployment | Render backend config, Vercel-ready frontend |
| Local Dev | Docker Compose or manual setup |

## Project Structure

```text
arth/
|-- backend/
|   |-- app/
|   |   |-- api/routes/       # Auth, transactions, and AI endpoints
|   |   |-- core/             # Config, database, security, dependencies
|   |   |-- models/           # SQLAlchemy models
|   |   |-- schemas/          # Pydantic schemas
|   |   `-- services/         # Auth, financial, and AI services
|   |-- alembic/              # Database migrations
|   |-- seed.py               # Optional demo data seeder
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |   |-- components/       # Reusable UI and dashboard components
|   |   |-- lib/              # API client and utilities
|   |   |-- pages/            # Landing, auth, dashboard, and feature pages
|   |   |-- store/            # Zustand auth state
|   |   `-- types/            # TypeScript interfaces
|   `-- package.json
|-- docker-compose.yml        # Local PostgreSQL + backend + frontend
|-- render.yaml               # Render deployment config for the backend
|-- setup.sh                  # Linux/macOS setup helper
`-- README.md
```

## Pages and Features

| Page | Features |
| --- | --- |
| Landing | Product overview and entry points |
| Login/Register | User authentication |
| Dashboard | Cash-flow overview, recent transactions, quick navigation |
| Transactions | Add transactions, view history, see fraud flags |
| Financial Twin | Run future balance and spending simulations |
| Credit Score | View explainable score factors, reasons, and improvements |
| Fraud Shield | Submit behavioral data for anomaly detection |
| AI Advisor | Chat with a Gemini-powered financial advisor |

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL, Supabase, or Docker
- Google Gemini API key

## Environment Variables

Create environment files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Important backend values:

```env
APP_NAME=ARTH
APP_ENV=development
DEBUG=true
SECRET_KEY=change_this_to_a_long_random_string
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DATABASE
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Important frontend values:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=ARTH
```

## Run Locally Manually

### Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

```bash
# Linux/macOS
source venv/bin/activate

# Windows PowerShell
.\venv\Scripts\Activate.ps1
```

Install dependencies and start the API:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Optional seed data:

```bash
python seed.py
```

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

## How the AI Works

### Financial Twin

The backend aggregates transaction history, projects future balances, applies scenario overrides, and uses Gemini to produce narrative insights and recommendations.

### Explainable Credit

The credit engine computes weighted financial factors, normalizes the result into a credit-style score, and uses Gemini to explain reasons, improvements, and what-if scenarios.

### Behavioral Fraud Detection

The fraud engine converts behavioral signals into feature vectors and uses scikit-learn Isolation Forest when enough history exists. Gemini is used to explain the risk result.

### Transaction Fraud Check

Every new transaction is compared with recent user history. Unusual amounts or locations increase `fraud_score`, and high-risk transactions are saved with `is_flagged = true`.

## Deployment Notes

- The backend includes `render.yaml` for Render deployment.
- Set production environment variables in the hosting dashboard instead of committing `.env` files.
- The frontend can be deployed to Vercel or any static host after running `npm run build`.
- Update `ALLOWED_ORIGINS` in production to include the deployed frontend URL.
- Update `VITE_API_BASE_URL` in production to point to the deployed backend API.

## Useful Commands

Frontend production build:

```bash
cd frontend
npm run build
```

Frontend lint:

```bash
cd frontend
npm run lint
```

Backend development server:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

## Team

Built for a hackathon by Team P2✨(ARTH)
