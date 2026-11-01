"""
services/mock_scene.py

Returns a deterministic WORLDCRAFT scene without any GPU inference.
Used when RECONSTRUCTION_MODE=mock (default for local dev).
"""

import math
from datetime import datetime, timezone
from schemas import (
    ArchiTechScene, SceneObject, RoomSpecification, RoomDimensions,
    SceneConstraint, SceneValidation, Position, Dimensions3D, Rotation,
)


def build_mock_scene(scene_id: str, n_images: int = 2) -> ArchiTechScene:
    """
    Constructs a realistic Nordic living-room scene that mirrors the
    default used by the TypeScript frontend (DEFAULT_LIVING_ROOM).
    """
    return ArchiTechScene(
        scene_id=scene_id,
        name="Nordic Contemporary Living Room",
        units="meters",
        room=RoomSpecification(
            type="Living Room",
            dimensions=RoomDimensions(
                width=5.4,
                length=6.2,
                height=2.8,
                status=f"estimated_from_pure_pi3_{n_images}_images",
            ),
            wallColor="#202632",
            accentWallColor="#1d232e",
            floorColor="#36302a",
        ),
        objects=[
            SceneObject(
                id="obj-sofa-01", type="sofa",
                name="Kivik 3-Seat Lounge Sofa",
                position=Position(x=-0.2, y=0.45, z=-1.2),
                dimensions=Dimensions3D(width=2.2, height=0.9, depth=0.95),
                rotation=Rotation(x=0, y=0, z=0),
                movable=True, confidence=0.94,
                color="#3d4452", material="Charcoal Linen",
                category="sofa", price=899,
            ),
            SceneObject(
                id="obj-table-02", type="table",
                name="Stockholm Oak Coffee Table",
                position=Position(x=-0.2, y=0.22, z=0.1),
                dimensions=Dimensions3D(width=1.4, height=0.45, depth=0.65),
                rotation=Rotation(x=0, y=0, z=0),
                movable=True, confidence=0.91,
                color="#b58b57", material="Solid White Oak",
                category="table", price=349,
            ),
            SceneObject(
                id="obj-armchair-03", type="chair",
                name="Eames Style Lounge Armchair",
                position=Position(x=1.4, y=0.42, z=-0.5),
                dimensions=Dimensions3D(width=0.85, height=0.85, depth=0.85),
                rotation=Rotation(x=0, y=-0.6, z=0),
                movable=True, confidence=0.88,
                color="#2b231d", material="Walnut & Cognac Leather",
                category="chair", price=649,
            ),
            SceneObject(
                id="obj-tvunit-04", type="storage",
                name="Besta Media Console",
                position=Position(x=-0.2, y=0.35, z=2.2),
                dimensions=Dimensions3D(width=1.8, height=0.65, depth=0.42),
                rotation=Rotation(x=0, y=math.pi, z=0),
                movable=True, confidence=0.92,
                color="#1a1d24", material="Matte Ash Veneer",
                category="storage", price=420,
            ),
            SceneObject(
                id="obj-floorlamp-05", type="lighting",
                name="ArchiArc Brass Floor Lamp",
                position=Position(x=-1.8, y=1.0, z=-1.6),
                dimensions=Dimensions3D(width=0.5, height=2.0, depth=0.5),
                rotation=Rotation(x=0, y=0.4, z=0),
                movable=True, confidence=0.83,
                color="#d4af37", material="Brushed Brass",
                category="lighting", price=189,
            ),
            SceneObject(
                id="obj-rug-06", type="decor",
                name="Geometric Wool Area Rug",
                position=Position(x=-0.1, y=0.01, z=-0.5),
                dimensions=Dimensions3D(width=2.4, height=0.02, depth=3.0),
                rotation=Rotation(x=0, y=0, z=0),
                movable=True, confidence=0.96,
                color="#656b78", material="Woven New Zealand Wool",
                category="decor", price=299,
            ),
        ],
        constraints=[
            SceneConstraint(
                type="pathway", target="door-entry",
                description="Minimum 90cm egress clearance to patio doorway",
                satisfied=True,
            ),
            SceneConstraint(
                type="clearance", target="obj-sofa-01",
                description="At least 45cm clearance between sofa and coffee table",
                satisfied=True,
            ),
            SceneConstraint(
                type="collision", target="room-boundaries",
                description="All items enclosed within 5.4m x 6.2m perimeter",
                satisfied=True,
            ),
        ],
        version=1,
        timestamp=datetime.now(timezone.utc).isoformat(),
        promptHistory=["Initial reconstruction from dual-view photographic alignment (mock)"],
        validation=SceneValidation(
            collisions=0,
            clearanceOk=True,
            pathwayClear=True,
            messages=[
                f"Mock reconstruction: {n_images} image(s) ingested",
                "PURE Pi3 point-cloud alignment: verified 294x518 grid mapping (mock)",
                "YOLO11-seg inference: 6 interior objects identified with >80% confidence (mock)",
                "Spatial clearance: 0.92m main pathway clearance validated",
            ],
        ),
    )
