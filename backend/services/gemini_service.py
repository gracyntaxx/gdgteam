"""
Gemini Service — §6.4 model adapter for Gemini API.

Responsibilities:
- FR-24: Intent extraction from natural-language instructions
- FR-25: Structured edit request production
- FR-43: Two design alternative generation
- FR-45: Color recommendations
- FR-46: Furniture arrangement advice
- FR-52: Design review
- FR-58: Accessibility-aware layout suggestions
- FR-59: Elderly/child-friendly considerations
- FR-60: Emergency access analysis

Uses google-genai SDK (current SDK as of Nov 2026).
All calls are async-wrapped. Gemini is NEVER the authoritative source
of geometric validity — that remains with the deterministic validator.
"""

from __future__ import annotations
import json
import re
import asyncio
from functools import partial
from typing import Optional

from google import genai
from google.genai import types as genai_types

from config import settings
from models.scene_schema import WorldcraftScene, EditOperation


# Initialise client once
_client = genai.Client(api_key=settings.GEMINI_API_KEY)
_MODEL = settings.GEMINI_MODEL

# ---------------------------------------------------------------------------
# Internal helper
# ---------------------------------------------------------------------------

def _extract_json(text: str) -> dict:
    """Pull the first JSON object from a Gemini text response."""
    match = re.search(r"\{[\s\S]+\}", text)
    if not match:
        raise ValueError(f"No JSON found in Gemini response: {text[:300]}")
    return json.loads(match.group())


def _scene_summary(scene: WorldcraftScene) -> str:
    """Compact text summary of scene for prompt context."""
    objs = [
        f"- {o.name} (id={o.id}, type={o.type}, "
        f"pos=({o.position.x:.2f},{o.position.y:.2f},{o.position.z:.2f}), "
        f"dim={o.dimensions.width:.2f}×{o.dimensions.depth:.2f}×{o.dimensions.height:.2f}m)"
        for o in scene.objects
    ]
    return (
        f"Room: {scene.room.type}, "
        f"{scene.room.dimensions.width}m × {scene.room.dimensions.length}m × "
        f"{scene.room.dimensions.height}m\n"
        + "\n".join(objs)
    )


async def _generate(prompt: str) -> str:
    """Run a Gemini generate call in a thread (SDK is sync)."""
    loop = asyncio.get_event_loop()
    fn = partial(
        _client.models.generate_content,
        model=_MODEL,
        contents=prompt,
        config=genai_types.GenerateContentConfig(
            temperature=0.2,
            max_output_tokens=2048,
        ),
    )
    response = await loop.run_in_executor(None, fn)
    return response.text


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def parse_edit_instruction(
    instruction: str,
    scene: WorldcraftScene,
) -> EditOperation:
    """
    FR-24, FR-25 — Convert a natural-language instruction into a
    structured EditOperation. Returns intent, not resolved coordinates.
    """
    object_list = "\n".join(
        f"  id={o.id} type={o.type} name={o.name}" for o in scene.objects
    )

    prompt = f"""You are a spatial-intelligence assistant for an interior design app.
Given the room scene and a user instruction, output ONLY a JSON EditOperation.

SCENE OBJECTS:
{object_list}

USER INSTRUCTION: "{instruction}"

Output JSON matching this schema (fill only relevant fields, use null for others):
{{
  "action": one of [move_object, rotate_object, change_color, change_material,
                    remove_object, replace_object, add_object,
                    change_wall_color, change_floor_color],
  "target_object_id": "obj-sofa-01" or null,
  "target_object_type": "sofa" or null,
  "destination": {{"reference": "left_wall", "relationship": "adjacent_to"}} or null,
  "rotation_delta_deg": {{"x":0,"y":90,"z":0}} or null,
  "new_color": "#hex" or null,
  "new_material": "material name" or null,
  "replacement_product_id": null,
  "constraints": ["keep_inside_room","avoid_object_intersection"],
  "ambiguity_note": "if instruction is ambiguous, describe here" or null,
  "requires_confirmation": false
}}

Rules:
- ONLY output JSON, no prose.
- Do NOT invent coordinates — use reference strings like "left_wall", "center", "near_window".
- If multiple objects match, set ambiguity_note and set target_object_id to null.
- Always include keep_inside_room and avoid_object_intersection in constraints.
"""

    text = await _generate(prompt)
    data = _extract_json(text)
    return EditOperation.model_validate(data)


async def generate_design_alternatives(
    scene: WorldcraftScene,
    style_preference: str,
    budget: Optional[float],
    items_to_retain: list[str],
    color_preference: Optional[str],
) -> list[dict]:
    """
    FR-43, FR-47 — Generate exactly 2 alternative interior design concepts.
    Returns list of 2 dicts with design description + object modifications.
    """
    summary = _scene_summary(scene)
    budget_str = f"${budget:.0f}" if budget else "flexible"
    retain_str = ", ".join(items_to_retain) if items_to_retain else "none specified"

    prompt = f"""You are an expert interior designer. Generate exactly 2 distinct design alternatives
for this room. Each must retain the room's structure while suggesting furniture arrangements,
colors, and materials that fit the constraints.

CURRENT ROOM:
{summary}

CONSTRAINTS:
- Style: {style_preference}
- Budget: {budget_str}
- Items to retain: {retain_str}
- Color preference: {color_preference or 'open'}

Output ONLY this JSON (no prose):
{{
  "alternatives": [
    {{
      "name": "Alternative A name",
      "concept": "2-sentence design concept description",
      "color_palette": {{"walls": "#hex", "accent": "#hex", "floor": "#hex"}},
      "arrangement_description": "description of furniture layout",
      "key_changes": ["change 1", "change 2"],
      "estimated_cost_usd": 0,
      "accessibility_note": "circulation and access considerations",
      "compromises": ["any trade-offs"]
    }},
    {{
      "name": "Alternative B name",
      "concept": "...",
      "color_palette": {{"walls": "#hex", "accent": "#hex", "floor": "#hex"}},
      "arrangement_description": "...",
      "key_changes": ["change 1"],
      "estimated_cost_usd": 0,
      "accessibility_note": "...",
      "compromises": []
    }}
  ]
}}
"""

    text = await _generate(prompt)
    data = _extract_json(text)
    return data.get("alternatives", [])


async def analyze_accessibility(
    scene: WorldcraftScene,
    accessibility_needs: list[str],
) -> dict:
    """
    FR-52, FR-58, FR-59, FR-60 — AI-assisted accessibility analysis.
    NOTE: This is design guidance only, NOT a verified professional assessment (FR-61).
    Deterministic geometric checks in spatial_validator.py take precedence.
    """
    summary = _scene_summary(scene)
    needs_str = ", ".join(accessibility_needs) if accessibility_needs else "general accessibility"

    prompt = f"""You are an accessibility-aware interior design advisor.
Review this room layout for the following needs: {needs_str}

ROOM:
{summary}

Output ONLY JSON:
{{
  "overall_assessment": "brief assessment",
  "issues": [
    {{
      "type": "circulation|clearance|reach|hazard|emergency_exit",
      "affected_area": "description",
      "description": "what the issue is",
      "suggestion": "actionable improvement",
      "severity": "error|warning|info"
    }}
  ],
  "positive_aspects": ["good things about current layout"],
  "disclaimer": "These are automated design suggestions, not certified accessibility assessments. Professional review recommended for compliance requirements."
}}
"""

    text = await _generate(prompt)
    return _extract_json(text)


async def generate_color_recommendation(
    scene: WorldcraftScene,
    preference: str,
) -> dict:
    """FR-45 — Color palette recommendations with visual effect explanations."""
    summary = _scene_summary(scene)

    prompt = f"""You are a color theory expert for interior design.
Recommend color combinations for this room.

CURRENT ROOM: {summary}
PREFERENCE: {preference}

Output ONLY JSON:
{{
  "palettes": [
    {{
      "name": "palette name",
      "wall_color": "#hex",
      "accent_wall_color": "#hex",
      "floor_color": "#hex",
      "trim_color": "#hex",
      "visual_effect": "1-2 sentence description of how it will feel",
      "style": "Modern|Scandinavian|etc"
    }}
  ],
  "recommendation": "brief overall recommendation"
}}
"""

    text = await _generate(prompt)
    return _extract_json(text)


async def explain_scene_instruction(
    instruction: str,
    change_description: str,
    validation_messages: list[str],
) -> str:
    """FR-38, FR-29 — Plain-English explanation of what was done and why."""
    prompt = f"""Explain this interior design change in one clear sentence for a user:
Instruction: "{instruction}"
What happened: {change_description}
Validation: {'; '.join(validation_messages[:3])}

Output ONLY the explanation sentence, no JSON."""

    return (await _generate(prompt)).strip()
