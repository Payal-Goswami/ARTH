from fastapi import APIRouter
from app.api.routes.auth import router as auth_router
from app.api.routes.transactions import router as tx_router
from app.api.routes.ai import router as ai_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(tx_router)
api_router.include_router(ai_router)
