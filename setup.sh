#!/usr/bin/env bash
# ARTH Quick Setup Script
# Usage: ./setup.sh

set -e

GREEN='\033[0;32m'
GOLD='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GOLD}"
echo "  ╔═══════════════════════════════════╗"
echo "  ║   ARTH — AI Financial Intelligence  ║"
echo "  ║   Predict • Explain • Protect       ║"
echo "  ╚═══════════════════════════════════╝"
echo -e "${NC}"

# Backend setup
echo -e "${CYAN}[1/4] Setting up backend...${NC}"
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GOLD}  ⚠  Created backend/.env — please fill in your credentials!${NC}"
fi
cd ..

# Frontend setup
echo -e "${CYAN}[2/4] Setting up frontend...${NC}"
cd frontend
npm install --silent
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GOLD}  ⚠  Created frontend/.env — please fill in VITE_API_BASE_URL if needed${NC}"
fi
cd ..

echo -e "${GREEN}"
echo "  ✅ Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Edit backend/.env with your credentials:"
echo "     - DATABASE_URL (PostgreSQL or Supabase)"
echo "     - GEMINI_API_KEY"
echo "     - SECRET_KEY"
echo ""
echo "  2. Start backend:   cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  3. (Optional) Seed: cd backend && python seed.py"
echo "  4. Start frontend:  cd frontend && npm run dev"
echo ""
echo "  📖 API docs: http://localhost:8000/docs"
echo "  🌐 App:      http://localhost:5173"
echo -e "${NC}"
