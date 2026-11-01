"""
WORLDCRAFT FastAPI Backend
AI & Geometry Service — Phase 2 core routes

Run with:
    cd backend
    uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import reconstruct, edit, products, health

app = FastAPI(
    title="WORLDCRAFT API",
    description="AI-powered 3D spatial intelligence and interior design backend",
    version="0.2.0",
)

# ---------------------------------------------------------------------------
# CORS — allow Next.js dev server and any additional origins in .env
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health.router, prefix="/api")
app.include_router(reconstruct.router, prefix="/api")
app.include_router(edit.router, prefix="/api")
app.include_router(products.router, prefix="/api")
