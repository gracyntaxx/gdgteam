"""
Shared Pydantic schemas that mirror the TypeScript types in src/types/scene.ts.
All downstream routers import from here to stay in sync with the frontend contract.
"""

from __future__ import annotations
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Scene primitives
# ---------------------------------------------------------------------------

class Position(BaseModel):
    x: float
    y: float
    z: float


class Dimensions3D(BaseModel):
    width: float
    height: float
    depth: float


class Rotation(BaseModel):
    x: float
    y: float
    z: float


class SceneObject(BaseModel):
    id: str
    type: str
    name: str
    position: Position
    dimensions: Dimensions3D
    rotation: Rotation
    movable: bool = True
    confidence: Optional[float] = None
    color: Optional[str] = None
    material: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    selected: Optional[bool] = None


class RoomDimensions(BaseModel):
    width: float
    length: float
    height: float
    status: str = "estimated"


class RoomSpecification(BaseModel):
    type: str
    dimensions: RoomDimensions
    wallColor: Optional[str] = None
    floorColor: Optional[str] = None
    accentWallColor: Optional[str] = None


class SceneConstraint(BaseModel):
    type: str
    target: str
    description: Optional[str] = None
    satisfied: Optional[bool] = None


class SceneValidation(BaseModel):
    collisions: int = 0
    clearanceOk: bool = True
    pathwayClear: bool = True
    messages: List[str] = Field(default_factory=list)


class ArchiTechScene(BaseModel):
    scene_id: str
    name: str
    units: str = "meters"
    room: RoomSpecification
    objects: List[SceneObject]
    constraints: List[SceneConstraint] = Field(default_factory=list)
    version: int = 1
    timestamp: str
    promptHistory: Optional[List[str]] = None
    validation: Optional[SceneValidation] = None


# ---------------------------------------------------------------------------
# Product catalog
# ---------------------------------------------------------------------------

class ProductDimensions(BaseModel):
    width: float
    height: float
    depth: float
    unit: str = "m"


class ProductItem(BaseModel):
    id: str
    name: str
    company: str
    category: str
    price: float
    currency: str = "USD"
    rating: float
    dimensions: ProductDimensions
    material: str
    style: str
    inStock: bool
    imageUrl: Optional[str] = None
    description: str
    color: str
    compatibilityScore: float
    dimensionsMm: Optional[str] = None


# ---------------------------------------------------------------------------
# Request / Response envelopes
# ---------------------------------------------------------------------------

class ReconstructResponse(BaseModel):
    scene_id: str
    status: str
    scene: ArchiTechScene
    reconstruction_mode: str  # "mock" | "colab"


class EditRequest(BaseModel):
    scene_id: str
    instruction: str
    current_scene: ArchiTechScene


class EditResponse(BaseModel):
    scene: ArchiTechScene
    changeDescription: str
    edit_operation: Optional[dict] = None


class ColabWebhookPayload(BaseModel):
    """Shape of the JSON that the Colab notebook POSTs back to /api/colab/callback."""
    job_id: str
    status: Literal["complete", "error"]
    scene: Optional[ArchiTechScene] = None
    error_message: Optional[str] = None
