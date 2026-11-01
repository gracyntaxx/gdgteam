"""
GET /api/health — liveness probe.
Returns reconstruction mode so the frontend knows whether Colab is active.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from config import settings
from services.colab_client import ping_colab

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    version: str
    reconstruction_mode: str
    colab_reachable: bool | None = None


@router.get("/health", response_model=HealthResponse)
async def health_check():
    colab_ok = None
    if settings.RECONSTRUCTION_MODE == "colab":
        colab_ok = await ping_colab()
    return HealthResponse(
        status="ok",
        version="0.2.0",
        reconstruction_mode=settings.RECONSTRUCTION_MODE,
        colab_reachable=colab_ok,
    )
