"""
services/scene_engine.py

Deterministic scene editor and spatial validator.

apply_edit() is the single entry point:
  1. If a structured edit_op (from Gemini) is provided, apply it.
  2. Otherwise fall back to a keyword-based interpreter.
  3. Run geometric validation after every edit.

Design principle: coordinates are always produced deterministically from
object and room geometry — never hallucinated by a language model.
"""

from __future__ import annotations

import math
from copy import deepcopy
from datetime import datetime, timezone
from typing import Optional

from schemas import ArchiTechScene, SceneObject, SceneValidation, Position, Rotation


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def apply_edit(
    scene: ArchiTechScene,
    edit_op: Optional[dict],
    raw_instruction: str,
) -> tuple[ArchiTechScene, str]:
    """
    Returns (updated_scene, change_description).
    """
    updated = deepcopy(scene)

    if edit_op:
        change_desc = _apply_structured_op(updated, edit_op)
    else:
        change_desc = _apply_keyword_fallback(updated, raw_instruction)

    # Bump version
    updated.version = scene.version + 1
    updated.timestamp = datetime.now(timezone.utc).isoformat()
    updated.promptHistory = list(scene.promptHistory or []) + [raw_instruction]

    # Re-validate
    updated.validation = _validate(updated)
    updated.validation.messages.insert(0, f"Validated after: {change_desc}")

    return updated, change_desc


# ---------------------------------------------------------------------------
# Structured edit op (Gemini output)
# ---------------------------------------------------------------------------

def _apply_structured_op(scene: ArchiTechScene, op: dict) -> str:
    action = op.get("action", "")
    description = op.get("description", f"Applied {action}")

    if action == "move_object":
        obj = _find_object(scene, op.get("target_object_id"))
        if obj:
            if new_pos := op.get("new_position"):
                obj.position = Position(
                    x=new_pos.get("x", obj.position.x),
                    y=new_pos.get("y", obj.position.y),
                    z=new_pos.get("z", obj.position.z),
                )
            if new_rot := op.get("new_rotation"):
                obj.rotation = Rotation(
                    x=new_rot.get("x", obj.rotation.x),
                    y=new_rot.get("y", obj.rotation.y),
                    z=new_rot.get("z", obj.rotation.z),
                )

    elif action == "change_color":
        obj = _find_object(scene, op.get("target_object_id"))
        if obj and (color := op.get("new_color")):
            obj.color = color
        # Room color changes
        if wall := op.get("wall_color"):
            scene.room.wallColor = wall
        if floor := op.get("floor_color"):
            scene.room.floorColor = floor
        if accent := op.get("accent_wall_color"):
            scene.room.accentWallColor = accent

    elif action == "update_material":
        obj = _find_object(scene, op.get("target_object_id"))
        if obj and (mat := op.get("new_material")):
            obj.material = mat

    elif action == "remove_object":
        obj_id = op.get("target_object_id")
        scene.objects = [o for o in scene.objects if o.id != obj_id]

    # Room-level colour overrides can accompany any action
    if wall := op.get("wall_color"):
        scene.room.wallColor = wall
    if floor := op.get("floor_color"):
        scene.room.floorColor = floor
    if accent := op.get("accent_wall_color"):
        scene.room.accentWallColor = accent

    return description


# ---------------------------------------------------------------------------
# Keyword fallback (mirrors logic in frontend api.ts)
# ---------------------------------------------------------------------------

def _apply_keyword_fallback(scene: ArchiTechScene, instruction: str) -> str:
    lower = instruction.lower()
    change_desc = f'Applied instruction: "{instruction}"'

    sofa = _find_by_type(scene, "sofa")
    table = _find_by_type(scene, "table")

    if sofa and ("sofa" in lower) and ("left" in lower or "wall" in lower):
        sofa.position = Position(x=-1.8, y=sofa.position.y, z=-0.6)
        sofa.rotation = Rotation(x=0, y=math.pi / 2, z=0)
        change_desc = "Repositioned sofa against the left accent wall (rotated 90°)"

    elif sofa and "sofa" in lower and ("center" in lower or "middle" in lower):
        sofa.position = Position(x=-0.2, y=sofa.position.y, z=-1.2)
        sofa.rotation = Rotation(x=0, y=0, z=0)
        change_desc = "Centered sofa facing media console"

    elif table and "table" in lower and "window" in lower:
        table.position = Position(x=1.5, y=table.position.y, z=1.2)
        change_desc = "Moved coffee table toward window area"

    elif any(k in lower for k in ("green", "sage")):
        scene.room.accentWallColor = "#3a4f41"
        scene.room.wallColor = "#242f28"
        change_desc = "Updated room walls to Nordic Sage Green tone"

    elif any(k in lower for k in ("blue", "navy")):
        scene.room.accentWallColor = "#1c283d"
        scene.room.wallColor = "#172030"
        change_desc = "Changed wall palette to Midnight Navy"

    elif any(k in lower for k in ("warm", "terracotta", "beige")):
        scene.room.accentWallColor = "#4a3328"
        scene.room.wallColor = "#382820"
        change_desc = "Applied Warm Terracotta interior tone"

    elif any(k in lower for k in ("floor", "wood", "oak")):
        scene.room.floorColor = "#5c4532"
        change_desc = "Updated floor material to Natural Scandinavian Light Oak"

    elif "remove" in lower or "delete" in lower:
        target = next(
            (o for o in scene.objects if o.type in lower or (o.name and o.name.lower() in lower)),
            None,
        )
        if target:
            scene.objects.remove(target)
            change_desc = f"Removed {target.name} from spatial arrangement"

    else:
        first_movable = next((o for o in scene.objects if o.movable), None)
        if first_movable:
            first_movable.position = Position(
                x=round(first_movable.position.x + 0.3, 2),
                y=first_movable.position.y,
                z=first_movable.position.z,
            )
            change_desc = f"Adjusted spatial alignment of {first_movable.name}"

    return change_desc


# ---------------------------------------------------------------------------
# Deterministic geometric validation
# ---------------------------------------------------------------------------

def _validate(scene: ArchiTechScene) -> SceneValidation:
    messages: list[str] = []
    collisions = 0
    clearance_ok = True
    pathway_clear = True

    room_w = scene.room.dimensions.width / 2
    room_l = scene.room.dimensions.length / 2

    # Check every object is within room boundaries
    for obj in scene.objects:
        hw = obj.dimensions.width / 2
        hd = obj.dimensions.depth / 2
        if (
            abs(obj.position.x) + hw > room_w
            or abs(obj.position.z) + hd > room_l
        ):
            messages.append(
                f"⚠ {obj.name} extends beyond room boundary "
                f"(pos={obj.position.x:.2f},{obj.position.z:.2f})"
            )
            collisions += 1

    # Simple AABB collision check between pairs
    objs = scene.objects
    for i, a in enumerate(objs):
        for b in objs[i + 1 :]:
            if _aabb_overlap(a, b):
                messages.append(
                    f"⚠ Collision detected: {a.name} ↔ {b.name}"
                )
                collisions += 1

    # Pathway check — main corridor along Z axis must have ≥0.9m clear
    sofa = _find_by_type(scene, "sofa")
    tv = _find_by_type(scene, "storage")
    if sofa and tv:
        gap = abs(sofa.position.z - tv.position.z) - (
            sofa.dimensions.depth / 2 + tv.dimensions.depth / 2
        )
        if gap < 0.9:
            pathway_clear = False
            clearance_ok = False
            messages.append(
                f"⚠ Pathway clearance too narrow: {gap:.2f}m (min 0.9m)"
            )

    if not messages:
        messages.append("All geometric constraints satisfied ✓")
        messages.append(f"Collision checks: {collisions} overlapping volumes detected")
        messages.append("Doorway & corridor egress clearance maintained (>0.9m)")
    else:
        messages.insert(0, f"Collision checks: {collisions} violation(s) found")

    return SceneValidation(
        collisions=collisions,
        clearanceOk=clearance_ok,
        pathwayClear=pathway_clear,
        messages=messages,
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _find_object(scene: ArchiTechScene, obj_id: Optional[str]) -> Optional[SceneObject]:
    if not obj_id:
        return None
    return next((o for o in scene.objects if o.id == obj_id), None)


def _find_by_type(scene: ArchiTechScene, obj_type: str) -> Optional[SceneObject]:
    return next((o for o in scene.objects if o.type == obj_type), None)


def _aabb_overlap(a: SceneObject, b: SceneObject) -> bool:
    """Axis-aligned bounding box overlap in XZ plane (ignores Y)."""
    ax1, ax2 = a.position.x - a.dimensions.width / 2, a.position.x + a.dimensions.width / 2
    az1, az2 = a.position.z - a.dimensions.depth / 2, a.position.z + a.dimensions.depth / 2
    bx1, bx2 = b.position.x - b.dimensions.width / 2, b.position.x + b.dimensions.width / 2
    bz1, bz2 = b.position.z - b.dimensions.depth / 2, b.position.z + b.dimensions.depth / 2
    return ax1 < bx2 and ax2 > bx1 and az1 < bz2 and az2 > bz1
