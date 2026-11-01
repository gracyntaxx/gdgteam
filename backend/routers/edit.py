"""
POST /api/edit

Accepts a natural-language instruction and the current ArchiTechScene.
Uses Gemini to parse the instruction into a structured edit operation,
applies it deterministically, then re-validates spatial constraints.
Falls back to a local keyword engine if Gemini is unavailable.
"""

import logging
from fastapi import APIRouter, HTTPException
from schemas import EditRequest, EditResponse
from services.scene_engine import apply_edit
from services.gemini_client import parse_instruction

logger = logging.getLogger(__name__)
router = APIRouter(tags=["edit"])


@router.post("/edit", response_model=EditResponse)
async def edit_scene(body: EditRequest):
    if not body.instruction.strip():
        raise HTTPException(status_code=422, detail="Instruction cannot be empty.")

    # Step 1 — interpret via Gemini (structured edit operation)
    try:
        edit_op = await parse_instruction(body.instruction, body.current_scene)
    except Exception as exc:
        logger.warning("Gemini parse failed (%s); falling back to keyword engine.", exc)
        edit_op = None  # scene_engine will use keyword fallback

    # Step 2 — apply deterministically and validate
    updated_scene, change_desc = apply_edit(
        scene=body.current_scene,
        edit_op=edit_op,
        raw_instruction=body.instruction,
    )

    return EditResponse(
        scene=updated_scene,
        changeDescription=change_desc,
        edit_operation=edit_op,
    )
