"""
POST /api/edit

Natural-language scene editing pipeline:
  1. Gemini parses the instruction → EditOperation (intent, no coordinates)
  2. scene_engine resolves geometry deterministically → applies the edit
  3. spatial_validator checks constraints → returns updated WorldcraftScene

Gemini is NEVER the authoritative source of geometric validity (SRS §8.2).
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from models.scene_schema import WorldcraftScene, EditOperation
from services.gemini_service import parse_edit_instruction, explain_scene_instruction
from services.scene_engine import apply_edit

logger = logging.getLogger(__name__)
router = APIRouter(tags=["edit"])


class EditRequest(BaseModel):
    scene_id: str
    instruction: str
    current_scene: WorldcraftScene


class EditResponse(BaseModel):
    scene: WorldcraftScene
    changeDescription: str          # camelCase to match TypeScript frontend
    edit_operation: Optional[dict] = None
    explanation: Optional[str] = None


@router.post("/edit", response_model=EditResponse)
async def edit_scene(body: EditRequest):
    if not body.instruction.strip():
        raise HTTPException(status_code=422, detail="Instruction cannot be empty.")

    # Step 1 — Gemini: text → structured intent
    edit_op: Optional[EditOperation] = None
    try:
        edit_op = await parse_edit_instruction(body.instruction, body.current_scene)
    except Exception as exc:
        logger.warning("Gemini parse failed (%s); using keyword fallback.", exc)

    # Step 2 — deterministic scene engine: apply + validate
    updated_scene, change_desc = apply_edit(
        scene=body.current_scene,
        edit_op=edit_op,
        raw_instruction=body.instruction,
    )

    # Step 3 — Gemini: generate a plain-English explanation (optional, non-blocking)
    explanation: Optional[str] = None
    try:
        explanation = await explain_scene_instruction(
            body.instruction,
            change_desc,
            updated_scene.validation.messages if updated_scene.validation else [],
        )
    except Exception:
        pass  # explanation is cosmetic — never block on it

    return EditResponse(
        scene=updated_scene,
        changeDescription=change_desc,
        edit_operation=edit_op.model_dump() if edit_op else None,
        explanation=explanation,
    )
