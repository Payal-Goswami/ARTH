"""
Seed demo data for ARTH hackathon demo.
Run: python seed.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import AsyncSessionLocal, init_db
from app.core.security import hash_password
from app.models.user import User
from app.models.transaction import Transaction
from datetime import datetime, timezone, timedelta
import random


DEMO_TRANSACTIONS = [
    # Income
    {"amount": 85000, "type": "income", "category": "salary", "merchant": "Tech Corp", "description": "Monthly salary"},
    {"amount": 85000, "type": "income", "category": "salary", "merchant": "Tech Corp", "description": "Monthly salary"},
    {"amount": 85000, "type": "income", "category": "salary", "merchant": "Tech Corp", "description": "Monthly salary"},
    {"amount": 12000, "type": "income", "category": "investment", "merchant": "Zerodha", "description": "Mutual fund dividend"},
    # Expenses
    {"amount": 18000, "type": "expense", "category": "rent", "merchant": "Property Owner", "is_recurring": True},
    {"amount": 4500, "type": "expense", "category": "food", "merchant": "Swiggy"},
    {"amount": 3200, "type": "expense", "category": "food", "merchant": "Zomato"},
    {"amount": 2800, "type": "expense", "category": "food", "merchant": "BigBasket"},
    {"amount": 1200, "type": "expense", "category": "transport", "merchant": "Uber"},
    {"amount": 2200, "type": "expense", "category": "utilities", "merchant": "Airtel", "is_recurring": True},
    {"amount": 8500, "type": "expense", "category": "shopping", "merchant": "Amazon"},
    {"amount": 3500, "type": "expense", "category": "entertainment", "merchant": "Netflix + Prime"},
    {"amount": 5000, "type": "expense", "category": "healthcare", "merchant": "Apollo Pharmacy"},
    {"amount": 15000, "type": "investment", "category": "investment", "merchant": "Zerodha", "description": "SIP"},
    {"amount": 250000, "type": "expense", "category": "shopping", "merchant": "Unknown Merchant", "location": "International"},  # This will be flagged
]


async def seed():
    print("Initializing database...")
    await init_db()

    async with AsyncSessionLocal() as db:
        # Create demo user
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.email == "demo@arth.ai"))
        existing = result.scalar_one_or_none()

        if existing:
            print("Demo user already exists. Skipping seed.")
            return

        user = User(
            email="demo@arth.ai",
            full_name="Arjun Sharma",
            hashed_password=hash_password("demo1234"),
            phone="+91-9876543210",
            monthly_income=85000,
            risk_profile="moderate",
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        await db.flush()

        # Add transactions spread across last 3 months
        for i, tx_data in enumerate(DEMO_TRANSACTIONS):
            days_ago = random.randint(1, 90)
            tx = Transaction(
                user_id=user.id,
                amount=tx_data["amount"],
                type=tx_data["type"],
                category=tx_data["category"],
                merchant=tx_data.get("merchant"),
                description=tx_data.get("description"),
                is_recurring=tx_data.get("is_recurring", False),
                location=tx_data.get("location", "Mumbai, India"),
                fraud_score=0.9 if tx_data["amount"] > 100000 else 0.05,
                is_flagged=tx_data["amount"] > 100000,
                created_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
            )
            db.add(tx)

        await db.commit()
        print("✅ Demo data seeded!")
        print("   Email: demo@arth.ai")
        print("   Password: demo1234")


if __name__ == "__main__":
    asyncio.run(seed())
