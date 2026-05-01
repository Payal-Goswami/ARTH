from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys

from app.core.config import settings
from app.core.database import init_db
from app.api import api_router

# Use standard logging so Render captures it
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger("arth")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("=== ARTH Backend Starting ===")
    log.info(f"Environment: {settings.APP_ENV}")
    log.info(f"Debug: {settings.DEBUG}")
    log.info(f"Database URL set: {'YES' if settings.DATABASE_URL else 'NO'}")
    log.info(f"Gemini key set: {'YES' if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != 'YOUR_GEMINI_API_KEY_HERE' else 'NO'}")

    try:
        await init_db()
        log.info("=== Database initialized successfully ===")
    except Exception as e:
        log.error(f"=== DATABASE INIT FAILED: {e} ===")
        log.error("Check your DATABASE_URL environment variable on Render.")
        # Don't crash — let the app start so /health still works for debugging
        # raise  <-- commented out intentionally

    yield
    log.info("=== ARTH Backend Shutting Down ===")


app = FastAPI(
    title="ARTH — AI Financial Intelligence",
    description="Predict • Explain • Protect",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": "ARTH",
        "tagline": "Predict • Explain • Protect",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "service": "arth-backend"}