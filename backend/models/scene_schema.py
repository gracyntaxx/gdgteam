"""
WORLDCRAFT Scene Schema — §6.2 of SRS
Versioned, technology-independent scene representation.
All model outputs must be normalized into this schema.
"""

from __future__ import annotations
from typing import Optional, List, Literal
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, timezone


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class Vec3(BaseModel):
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0


class Dimensions(BaseModel):
    width: float
    height: float
    depth: float


class CoordinateSystem(BaseModel):
    up_axis: Literal["Y", "Z"] = "Y"
    description: str = "Application-defined right-handed coordinate system"


class RoomDimensions(BaseModel):
    width: float
    length: float
    height: float
    status: Literal[
        "estimated", "measured", "estimated_from_pure_pi3", "unknown"
    ] = "estimated"


class RoomSpec(BaseModel):
    type: str = "living_room"
    dimensions: RoomDimensions
    wall_color: Optional[str] = "#202632"
    accent_wall_color: Optional[str] = "#1d232e"
    floor_color: Optional[str] = "#36302a"
    ceiling_color: Optional[str] = "#1a1e26"


class SpatialRelationship(BaseModel):
    """FR-18 — relative positional relationships between objects."""
    subject_id: str
    relation: Literal[
        "left_of", "right_of", "in_front_of", "behind",
        "above", "below", "inside", "near", "attached_to", "supported_by"
    ]
    object_id: str
    confidence: Optional[float] = None


class SceneConstraint(BaseModel):
    """FR-39 — spatial constraints that must survive edits."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    type: Literal[
        "keep_inside_room", "pathway", "clearance",
        "collision", "support", "accessibility"
    ]
    target: str  # object id or area name
    description: Optional[str] = None
    satisfied: Optional[bool] = None
    min_clearance_m: Optional[float] = None   # for clearance constraints


class ValidationResult(BaseModel):
    """FR-37, FR-38 — result of geometry/constraint checks."""
    collisions: int = 0
    clearance_ok: bool = True
    pathway_clear: bool = True
    boundary_ok: bool = True
    violations: List[ViolationDetail] = Field(default_factory=list)
    messages: List[str] = Field(default_factory=list)


class ViolationDetail(BaseModel):
    """FR-38 — explainable violation entry."""
    violation_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    type: Literal["collision", "boundary", "pathway", "clearance", "support"]
    affected_object_ids: List[str]
    description: str
    suggestion: Optional[str] = None
    severity: Literal["error", "warning", "info"] = "warning"


# Resolve forward ref
ValidationResult.model_rebuild()


class SceneObject(BaseModel):
    """FR-12, FR-13 — reconstructed or manually placed object."""
    id: str = Field(default_factory=lambda: f"obj-{uuid.uuid4().hex[:8]}")
    type: str   # sofa, table, chair, bed, lamp, storage, decor, wall, floor, door, window
    name: str
    position: Vec3 = Field(default_factory=Vec3)
    dimensions: Dimensions
    rotation: Vec3 = Field(default_factory=Vec3)
    movable: bool = True
    confidence: Optional[float] = None     # FR-15
    color: Optional[str] = None
    material: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    selected: bool = False
    provenance: Optional[str] = None       # "pure_pi3", "yolo11", "user", "gemini"
    uncertainty_note: Optional[str] = None # FR-15 — explicit uncertainty label


# ---------------------------------------------------------------------------
# Root scene model — §6.2
# ---------------------------------------------------------------------------

class WorldcraftScene(BaseModel):
    """
    Top-level versioned scene representation.
    All adapters must output this schema; all consumers read only this schema.
    """
    scene_id: str = Field(default_factory=lambda: f"scene-{uuid.uuid4().hex[:12]}")
    name: str = "Untitled Room"
    schema_version: int = 1
    units: Literal["meters"] = "meters"
    coordinate_system: CoordinateSystem = Field(default_factory=CoordinateSystem)

    # Room geometry
    room: RoomSpec

    # Objects
    objects: List[SceneObject] = Field(default_factory=list)

    # Spatial intelligence
    relationships: List[SpatialRelationship] = Field(default_factory=list)
    constraints: List[SceneConstraint] = Field(default_factory=list)

    # Meta
    version: int = 1
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    prompt_history: List[str] = Field(default_factory=list)
    input_type: Optional[Literal["image", "video", "floor_plan", "manual"]] = None
    reconstruction_model: Optional[str] = None   # "pure_pi3_mock", "pure_pi3_colab"

    # Validation
    validation: Optional[ValidationResult] = None


# ---------------------------------------------------------------------------
# Edit operation schema — §6.3
# ---------------------------------------------------------------------------

class EditOperation(BaseModel):
    """
    Structured edit request produced by Gemini NL adapter — §6.3.
    Expresses *intent*, not final coordinates.
    The scene engine resolves geometry after receiving this.
    """
    action: Literal[
        "move_object", "rotate_object", "change_color",
        "change_material", "remove_object", "replace_object",
        "add_object", "change_wall_color", "change_floor_color"
    ]
    target_object_id: Optional[str] = None
    target_object_type: Optional[str] = None   # fallback if id unknown
    destination: Optional[dict] = None          # {reference, relationship} or {x,y,z}
    rotation_delta_deg: Optional[Vec3] = None
    new_color: Optional[str] = None
    new_material: Optional[str] = None
    replacement_product_id: Optional[str] = None
    constraints: List[str] = Field(default_factory=list)
    ambiguity_note: Optional[str] = None       # FR-26 — unresolved ambiguity
    requires_confirmation: bool = False         # FR-29
