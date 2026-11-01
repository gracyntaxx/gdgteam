"""
POST /api/design/alternatives  — FR-43: two design alternatives
POST /api/design/accessibility — FR-52, FR-58-60: accessibility analysis
POST /api/design/colors        — FR-45: color palette recommendations
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from models.scene_schema import WorldcraftScene
from services.gemini_service import (
    generate_design_alternatives,
    analyze_accessibility,
    generate_color_recommendation,
)

router = APIRouter(tags=["design"])


class DesignAlternativesRequest(BaseModel):
    scene: WorldcraftScene
    style_preference: str = "Modern"
    budget: Optional[float] = None
    items_to_retain: list[str] = []
    color_preference: Optional[str] = None


class AccessibilityRequest(BaseModel):
    scene: WorldcraftScene
    accessibility_needs: list[str] = ["general accessibility"]


class ColorRequest(BaseModel):
    scene: WorldcraftScene
    preference: str = "warm and inviting"


@router.post("/design/alternatives")
async def design_alternatives(body: DesignAlternativesRequest):
    """FR-43 — Generate two distinct interior design alternatives."""
    alternatives = await generate_design_alternatives(
        scene=body.scene,
        style_preference=body.style_preference,
        budget=body.budget,
        items_to_retain=body.items_to_retain,
        color_preference=body.color_preference,
    )
    return {"alternatives": alternatives}


@router.post("/design/accessibility")
async def accessibility_analysis(body: AccessibilityRequest):
    """FR-52, FR-58, FR-59, FR-60 — AI-assisted accessibility review.
    NOTE: Deterministic geometric checks take precedence over these suggestions (SRS §8.2).
    """
    result = await analyze_accessibility(
        scene=body.scene,
        accessibility_needs=body.accessibility_needs,
    )
    return result


@router.post("/design/colors")
async def color_recommendations(body: ColorRequest):
    """FR-45 — Color palette recommendations."""
    result = await generate_color_recommendation(
        scene=body.scene,
        preference=body.preference,
    )
    return result
