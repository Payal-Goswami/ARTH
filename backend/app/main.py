from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import structlog

from app.core.config import settings
from app.core.database import init_db
from app.api import api_router

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("arth_startup", env=settings.APP_ENV)
    await init_db()
    log.info("database_initialized")
    yield
    log.info("arth_shutdown")


app = FastAPI(
    title="ARTH — AI Financial Intelligence",
    description="Predict • Explain • Protect | The brain of next-generation banking.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ───────────────────────────────────────────────────────────────────
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
