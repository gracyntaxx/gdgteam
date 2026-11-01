"""
WORLDCRAFT FastAPI Backend — main entry point
AI & Geometry Service (Phase 2)

Run locally (mock mode, no GPU):
    cd backend
    uvicorn main:app --reload --port 8000

Run with Colab GPU:
    Set COLAB_ENDPOINT_URL and RECONSTRUCTION_MODE=colab in .env, then restart.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import health, reconstruct, edit, products, design

app = FastAPI(
    title="WORLDCRAFT API",
    description="AI-powered 3D spatial intelligence and interior design backend",
    version="0.2.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ---------------------------------------------------------------------------
# CORS — allow Next.js dev server + any origins configured in .env
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers — all prefixed /api
# ---------------------------------------------------------------------------
app.include_router(health.router,      prefix="/api")
app.include_router(reconstruct.router, prefix="/api")
app.include_router(edit.router,        prefix="/api")
app.include_router(products.router,    prefix="/api")
app.include_router(design.router,      prefix="/api")
