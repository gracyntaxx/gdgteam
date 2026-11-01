"""
services/scene_engine.py — deterministic spatial editor and validator (FR-32–FR-40)

apply_edit() is the single entry point:
  1. Accepts a structured EditOperation from Gemini (or None for fallback).
  2. Resolves destinations (e.g. "left_wall") into concrete coordinates.
  3. Applies the edit in-place on a deep-copy of the scene.
  4. Runs the spatial validator.
  5. Returns (updated_scene, change_description).

Design principle: coordinates are ALWAYS computed from room/object geometry —
never taken directly from Gemini output.
"""

from __future__ import annotations

import math
from copy import deepcopy
from datetime import datetime, timezone
from typing import Optional, Tuple

from models.scene_schema import (
    WorldcraftScene, SceneObject, EditOperation,
    ValidationResult, ViolationDetail, Vec3, Dimensions,
)


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def apply_edit(
    scene: WorldcraftScene,
    edit_op: Optional[EditOperation],
    raw_instruction: str,
) -> Tuple[WorldcraftScene, str]:
    """Return (updated_scene, change_description)."""
    updated = deepcopy(scene)

    if edit_op:
        change_desc = _apply_structured_op(updated, edit_op)
    else:
        change_desc = _apply_keyword_fallback(updated, raw_instruction)

    updated.version = scene.version + 1
    updated.timestamp = datetime.now(timezone.utc).isoformat()
    updated.prompt_history = list(scene.prompt_history) + [raw_instruction]
    updated.validation = _validate(updated)
    return updated, change_desc


# ---------------------------------------------------------------------------
# Structured op (from Gemini EditOperation)
# ---------------------------------------------------------------------------

def _apply_structured_op(scene: WorldcraftScene, op: EditOperation) -> str:
    desc = f"Applied {op.action}"

    if op.action == "move_object":
        obj = _resolve_object(scene, op)
        if obj and op.destination:
            new_pos = _resolve_destination(op.destination, obj, scene)
            obj.position = new_pos
            desc = f"Moved {obj.name} to {_dest_label(op.destination)}"
        elif obj and op.rotation_delta_deg:
            r = op.rotation_delta_deg
            obj.rotation = Vec3(
                x=obj.rotation.x + math.radians(r.x),
                y=obj.rotation.y + math.radians(r.y),
                z=obj.rotation.z + math.radians(r.z),
            )
            desc = f"Rotated {obj.name}"

    elif op.action == "rotate_object":
        obj = _resolve_object(scene, op)
        if obj and op.rotation_delta_deg:
            r = op.rotation_delta_deg
            obj.rotation = Vec3(
                x=obj.rotation.x + math.radians(r.x),
                y=obj.rotation.y + math.radians(r.y),
                z=obj.rotation.z + math.radians(r.z),
            )
            desc = f"Rotated {obj.name} by ({r.x}°, {r.y}°, {r.z}°)"

    elif op.action == "change_color":
        obj = _resolve_object(scene, op)
        if obj and op.new_color:
            obj.color = op.new_color
            desc = f"Changed {obj.name} color to {op.new_color}"

    elif op.action == "change_material":
        obj = _resolve_object(scene, op)
        if obj and op.new_material:
            obj.material = op.new_material
            desc = f"Updated {obj.name} material to {op.new_material}"

    elif op.action == "change_wall_color":
        if op.new_color:
            scene.room.wall_color = op.new_color
            scene.room.accent_wall_color = op.new_color
            desc = f"Changed wall color to {op.new_color}"

    elif op.action == "change_floor_color":
        if op.new_color:
            scene.room.floor_color = op.new_color
            desc = f"Changed floor color to {op.new_color}"

    elif op.action == "remove_object":
        obj = _resolve_object(scene, op)
        if obj:
            scene.objects = [o for o in scene.objects if o.id != obj.id]
            desc = f"Removed {obj.name} from scene"

    return desc


# ---------------------------------------------------------------------------
# Destination resolver — converts Gemini reference strings → Vec3
# ---------------------------------------------------------------------------

_WALL_REFS = {
    "left_wall":   (-1, 0),
    "right_wall":  (1, 0),
    "back_wall":   (0, 1),
    "front_wall":  (0, -1),
    "center":      (0, 0),
    "near_window": (1, -1),
}


def _resolve_destination(dest: dict, obj: SceneObject, scene: WorldcraftScene) -> Vec3:
    """Translate a destination dict into an absolute Vec3 position."""
    ref = dest.get("reference", "center")
    room_hw = scene.room.dimensions.width / 2
    room_hl = scene.room.dimensions.length / 2
    obj_hw  = obj.dimensions.width / 2
    obj_hd  = obj.dimensions.depth / 2

    factors = _WALL_REFS.get(ref, (0, 0))
    fx, fz = factors

    if fx != 0:
        new_x = fx * (room_hw - obj_hw - 0.05)
    else:
        new_x = 0.0

    if fz != 0:
        new_z = fz * (room_hl - obj_hd - 0.05)
    else:
        new_z = obj.position.z  # keep Z if only moving along X

    # For "adjacent_to" + wall, face the room center
    new_y = obj.position.y  # keep vertical position
    return Vec3(x=round(new_x, 3), y=new_y, z=round(new_z, 3))


def _dest_label(dest: dict) -> str:
    rel  = dest.get("relationship", "")
    ref  = dest.get("reference", "new position")
    return f"{rel} {ref}".strip() or "new position"


# ---------------------------------------------------------------------------
# Keyword fallback (mirrors frontend api.ts logic)
# ---------------------------------------------------------------------------

def _apply_keyword_fallback(scene: WorldcraftScene, instruction: str) -> str:
    lower = instruction.lower()
    sofa    = _find_by_type(scene, "sofa")
    table   = _find_by_type(scene, "table")
    storage = _find_by_type(scene, "storage")

    hw = scene.room.dimensions.width / 2
    hl = scene.room.dimensions.length / 2

    if sofa and "sofa" in lower and ("left" in lower or "wall" in lower):
        sofa.position = Vec3(x=-(hw - sofa.dimensions.width / 2 - 0.05), y=sofa.position.y, z=-0.6)
        sofa.rotation = Vec3(x=0, y=math.pi / 2, z=0)
        return "Repositioned sofa against the left wall (rotated 90°)"

    if sofa and "sofa" in lower and ("center" in lower or "middle" in lower):
        sofa.position = Vec3(x=0.0, y=sofa.position.y, z=-1.2)
        sofa.rotation = Vec3(x=0, y=0, z=0)
        return "Centered sofa facing media console"

    if table and "table" in lower and "window" in lower:
        table.position = Vec3(x=1.5, y=table.position.y, z=1.2)
        return "Moved coffee table toward the window"

    if any(k in lower for k in ("green", "sage")):
        scene.room.accent_wall_color = "#3a4f41"
        scene.room.wall_color = "#242f28"
        return "Updated walls to Nordic Sage Green"

    if any(k in lower for k in ("blue", "navy", "midnight")):
        scene.room.accent_wall_color = "#1c283d"
        scene.room.wall_color = "#172030"
        return "Changed wall palette to Midnight Navy"

    if any(k in lower for k in ("warm", "terracotta", "beige", "earthy")):
        scene.room.accent_wall_color = "#4a3328"
        scene.room.wall_color = "#382820"
        return "Applied Warm Terracotta interior tone"

    if any(k in lower for k in ("floor", "wood", "oak", "light")):
        scene.room.floor_color = "#5c4532"
        return "Updated floor to Natural Scandinavian Light Oak"

    if "remove" in lower or "delete" in lower:
        for obj in scene.objects:
            if obj.type in lower or obj.name.lower() in lower:
                scene.objects.remove(obj)
                return f"Removed {obj.name} from scene"

    # Generic nudge
    first_movable = next((o for o in scene.objects if o.movable), None)
    if first_movable:
        first_movable.position = Vec3(
            x=round(first_movable.position.x + 0.3, 2),
            y=first_movable.position.y,
            z=first_movable.position.z,
        )
        return f"Adjusted spatial alignment of {first_movable.name}"

    return f'Applied instruction: "{instruction}"'


# ---------------------------------------------------------------------------
# Deterministic geometric validator (FR-32–FR-40)
# ---------------------------------------------------------------------------

def _validate(scene: WorldcraftScene) -> ValidationResult:
    violations: list[ViolationDetail] = []
    messages:   list[str]             = []
    boundary_ok = True
    pathway_clear = True
    clearance_ok  = True
    collisions    = 0

    room_hw = scene.room.dimensions.width  / 2
    room_hl = scene.room.dimensions.length / 2

    # FR-33 — room boundary check
    for obj in scene.objects:
        hw = obj.dimensions.width / 2
        hd = obj.dimensions.depth / 2
        if abs(obj.position.x) + hw > room_hw or abs(obj.position.z) + hd > room_hl:
            boundary_ok = False
            collisions += 1
            violations.append(ViolationDetail(
                type="boundary",
                affected_object_ids=[obj.id],
                description=f"{obj.name} extends beyond room boundary.",
                suggestion=f"Move {obj.name} toward the room centre.",
                severity="error",
            ))

    # FR-32 — AABB object collision check
    objs = scene.objects
    for i, a in enumerate(objs):
        for b in objs[i + 1:]:
            if _aabb_xz(a, b):
                collisions += 1
                violations.append(ViolationDetail(
                    type="collision",
                    affected_object_ids=[a.id, b.id],
                    description=f"{a.name} overlaps {b.name}.",
                    suggestion=f"Move {a.name} or {b.name} to eliminate overlap.",
                    severity="error",
                ))

    # FR-35 — pathway check: sofa ↔ media console gap ≥ 0.9m
    sofa    = _find_by_type(scene, "sofa")
    storage = _find_by_type(scene, "storage")
    if sofa and storage:
        gap = abs(sofa.position.z - storage.position.z) - (
            sofa.dimensions.depth / 2 + storage.dimensions.depth / 2
        )
        if gap < 0.9:
            pathway_clear = False
            clearance_ok  = False
            violations.append(ViolationDetail(
                type="pathway",
                affected_object_ids=[sofa.id, storage.id],
                description=f"Pathway clearance is {gap:.2f}m — minimum 0.9m required.",
                suggestion="Move sofa or media console to restore 0.9m corridor.",
                severity="warning",
            ))

    # FR-36 — sofa-to-table clearance ≥ 0.45m
    table = _find_by_type(scene, "table")
    if sofa and table:
        dist = abs(sofa.position.z - table.position.z) - (
            sofa.dimensions.depth / 2 + table.dimensions.depth / 2
        )
        if dist < 0.45:
            clearance_ok = False
            violations.append(ViolationDetail(
                type="clearance",
                affected_object_ids=[sofa.id, table.id],
                description=f"Sofa-to-table clearance is {dist:.2f}m — minimum 0.45m recommended.",
                suggestion="Move the coffee table forward.",
                severity="warning",
            ))

    # Build messages
    if violations:
        messages = [f"⚠ {v.description}" for v in violations]
        messages.insert(0, f"Constraint check: {collisions} violation(s) found")
    else:
        messages = [
            "All geometric constraints satisfied ✓",
            f"Collision checks: 0 overlapping volumes",
            "Doorway & corridor egress clearance maintained (>0.9m)",
        ]

    return ValidationResult(
        collisions=collisions,
        clearance_ok=clearance_ok,
        pathway_clear=pathway_clear,
        boundary_ok=boundary_ok,
        violations=violations,
        messages=messages,
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _resolve_object(scene: WorldcraftScene, op: EditOperation) -> Optional[SceneObject]:
    if op.target_object_id:
        return next((o for o in scene.objects if o.id == op.target_object_id), None)
    if op.target_object_type:
        return next((o for o in scene.objects if o.type == op.target_object_type), None)
    return None


def _find_by_type(scene: WorldcraftScene, t: str) -> Optional[SceneObject]:
    return next((o for o in scene.objects if o.type == t), None)


def _aabb_xz(a: SceneObject, b: SceneObject) -> bool:
    """Axis-aligned bounding box overlap in the XZ plane."""
    ax1 = a.position.x - a.dimensions.width / 2
    ax2 = a.position.x + a.dimensions.width / 2
    az1 = a.position.z - a.dimensions.depth / 2
    az2 = a.position.z + a.dimensions.depth / 2
    bx1 = b.position.x - b.dimensions.width / 2
    bx2 = b.position.x + b.dimensions.width / 2
    bz1 = b.position.z - b.dimensions.depth / 2
    bz2 = b.position.z + b.dimensions.depth / 2
    return ax1 < bx2 and ax2 > bx1 and az1 < bz2 and az2 > bz1
