"""
GET /api/health — liveness probe used by the frontend and Colab notebook
to confirm the FastAPI server is running.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    version: str
    reconstruction_mode: str


@router.get("/health", response_model=HealthResponse)
async def health_check():
    from config import settings
    return HealthResponse(
        status="ok",
        version="0.2.0",
        reconstruction_mode=settings.RECONSTRUCTION_MODE,
    )
