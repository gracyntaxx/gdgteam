"""
services/gemini_client.py

Calls Gemini to convert a free-text instruction into a structured
edit operation dict.  The scene is sent as context so Gemini knows
what objects exist and their current positions.

Returns None on failure so the scene_engine can apply its keyword fallback.
"""

import json
import logging
from typing import Optional

from google import genai
from google.genai import types as genai_types

from config import settings
from schemas import ArchiTechScene

logger = logging.getLogger(__name__)

# Re-use a single client instance
_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured.")
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


_SYSTEM_PROMPT = """
You are the WORLDCRAFT spatial intelligence engine.
Given a user instruction and a JSON scene description, return ONLY a JSON
object describing the edit operation.  Do NOT add markdown fences.

The JSON must follow this schema exactly:
{
  "action": "move_object" | "change_color" | "remove_object" | "add_object" | "update_material",
  "target_object_id": "<id of the object to act on, or null>",
  "new_position": {"x": float, "y": float, "z": float} | null,
  "new_rotation": {"x": float, "y": float, "z": float} | null,
  "new_color": "<hex string>" | null,
  "new_material": "<material name>" | null,
  "wall_color": "<hex string>" | null,
  "floor_color": "<hex string>" | null,
  "accent_wall_color": "<hex string>" | null,
  "description": "<one-sentence human-readable summary of the change>"
}

Rules:
- Only populate fields relevant to the action; set others to null.
- Object IDs come from the scene JSON provided.  Use exact IDs.
- Positions are in metres, Y is up.
- Room dimensions: width=5.4m, length=6.2m, height=2.8m (unless scene differs).
- Do not invent object IDs that are not in the scene.
""".strip()


async def parse_instruction(
    instruction: str,
    scene: ArchiTechScene,
) -> Optional[dict]:
    """
    Returns a structured edit-op dict or None on failure.
    """
    client = _get_client()

    # Compact scene summary sent to Gemini (full scene is verbose)
    scene_summary = {
        "room": {
            "type": scene.room.type,
            "dimensions": scene.room.dimensions.model_dump(),
            "wallColor": scene.room.wallColor,
            "floorColor": scene.room.floorColor,
            "accentWallColor": scene.room.accentWallColor,
        },
        "objects": [
            {
                "id": o.id,
                "type": o.type,
                "name": o.name,
                "position": o.position.model_dump(),
                "rotation": o.rotation.model_dump(),
                "dimensions": o.dimensions.model_dump(),
            }
            for o in scene.objects
        ],
    }

    user_message = (
        f"Instruction: {instruction}\n\n"
        f"Current scene:\n{json.dumps(scene_summary, indent=2)}"
    )

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=user_message,
            config=genai_types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                temperature=0.1,
                max_output_tokens=512,
            ),
        )
        raw = response.text.strip()
        # Strip accidental markdown fences
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception as exc:
        logger.warning("Gemini instruction parse failed: %s", exc)
        return None
