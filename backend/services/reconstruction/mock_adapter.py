"""
Mock Reconstruction Adapter — Phase 2 stand-in.

Returns a realistic-looking WorldcraftScene that matches what PURE Pi3
would produce for a typical living room. The frontend gets fully working
data; swap this for colab_adapter.py when the Colab endpoint is ready.

FR-08, FR-15, FR-16 — image reconstruction with uncertainty labels.
"""

from __future__ import annotations
import uuid
from pathlib import Path
from typing import List
from datetime import datetime, timezone

from models.scene_schema import (
    WorldcraftScene, RoomSpec, RoomDimensions, SceneObject,
    Vec3, Dimensions, SceneConstraint, ValidationResult,
    SpatialRelationship, CoordinateSystem,
)
from services.reconstruction.adapter import ReconstructionAdapter


class MockReconstructionAdapter(ReconstructionAdapter):
    """Deterministic mock — always returns the reference living-room scene."""

    def model_name(self) -> str:
        return "pure_pi3_mock"

    def supports_video(self) -> bool:
        return True  # mock supports both for demo

    async def reconstruct(
        self,
        image_paths: List[Path],
        video_path: Path | None = None,
        reference_measurements: dict | None = None,
    ) -> WorldcraftScene:
        dim_status = "estimated_from_pure_pi3"
        if reference_measurements:
            dim_status = "estimated"  # user supplied a ref — still estimated until calibrated

        room = RoomSpec(
            type="living_room",
            dimensions=RoomDimensions(
                width=5.4, length=6.2, height=2.8,
                status=dim_status,
            ),
            wall_color="#202632",
            accent_wall_color="#1d232e",
            floor_color="#36302a",
        )

        objects: List[SceneObject] = [
            SceneObject(
                id="obj-sofa-01", type="sofa", name="3-Seat Lounge Sofa",
                position=Vec3(x=-0.2, y=0.45, z=-1.2),
                dimensions=Dimensions(width=2.2, height=0.9, depth=0.95),
                rotation=Vec3(x=0, y=0, z=0),
                movable=True, confidence=0.94,
                color="#3d4452", material="Charcoal Linen", category="sofa",
                provenance="yolo11", uncertainty_note="Dimensions estimated from PURE Pi3 point cloud",
            ),
            SceneObject(
                id="obj-table-02", type="table", name="Oak Coffee Table",
                position=Vec3(x=-0.2, y=0.22, z=0.1),
                dimensions=Dimensions(width=1.4, height=0.45, depth=0.65),
                rotation=Vec3(x=0, y=0, z=0),
                movable=True, confidence=0.91,
                color="#b58b57", material="Solid White Oak", category="table",
                provenance="yolo11",
            ),
            SceneObject(
                id="obj-chair-03", type="chair", name="Lounge Armchair",
                position=Vec3(x=1.4, y=0.42, z=-0.5),
                dimensions=Dimensions(width=0.85, height=0.85, depth=0.85),
                rotation=Vec3(x=0, y=-0.6, z=0),
                movable=True, confidence=0.88,
                color="#2b231d", material="Leather", category="chair",
                provenance="yolo11",
            ),
            SceneObject(
                id="obj-storage-04", type="storage", name="Media Console",
                position=Vec3(x=-0.2, y=0.35, z=2.2),
                dimensions=Dimensions(width=1.8, height=0.65, depth=0.42),
                rotation=Vec3(x=0, y=3.14159, z=0),
                movable=True, confidence=0.92,
                color="#1a1d24", material="Ash Veneer", category="storage",
                provenance="yolo11",
            ),
            SceneObject(
                id="obj-lamp-05", type="lighting", name="Floor Lamp",
                position=Vec3(x=-1.8, y=1.0, z=-1.6),
                dimensions=Dimensions(width=0.5, height=2.0, depth=0.5),
                rotation=Vec3(x=0, y=0.4, z=0),
                movable=True, confidence=0.83,
                color="#d4af37", material="Brushed Brass", category="lighting",
                provenance="yolo11",
            ),
            SceneObject(
                id="obj-rug-06", type="decor", name="Area Rug",
                position=Vec3(x=-0.1, y=0.01, z=-0.5),
                dimensions=Dimensions(width=2.4, height=0.02, depth=3.0),
                rotation=Vec3(x=0, y=0, z=0),
                movable=True, confidence=0.96,
                color="#656b78", material="Wool", category="decor",
                provenance="yolo11",
            ),
        ]

        relationships: List[SpatialRelationship] = [
            SpatialRelationship(
                subject_id="obj-table-02", relation="in_front_of",
                object_id="obj-sofa-01", confidence=0.9,
            ),
            SpatialRelationship(
                subject_id="obj-chair-03", relation="near",
                object_id="obj-sofa-01", confidence=0.85,
            ),
            SpatialRelationship(
                subject_id="obj-lamp-05", relation="near",
                object_id="obj-sofa-01", confidence=0.82,
            ),
            SpatialRelationship(
                subject_id="obj-rug-06", relation="below",
                object_id="obj-table-02", confidence=0.95,
            ),
        ]

        constraints: List[SceneConstraint] = [
            SceneConstraint(
                type="pathway",
                target="door-entry",
                description="Minimum 90cm egress clearance to doorway",
                satisfied=True,
                min_clearance_m=0.9,
            ),
            SceneConstraint(
                type="clearance",
                target="obj-sofa-01",
                description="At least 45cm between sofa and coffee table",
                satisfied=True,
                min_clearance_m=0.45,
            ),
            SceneConstraint(
                type="keep_inside_room",
                target="all",
                description="All items within 5.4m × 6.2m perimeter",
                satisfied=True,
            ),
        ]

        validation = ValidationResult(
            collisions=0,
            clearance_ok=True,
            pathway_clear=True,
            boundary_ok=True,
            messages=[
                f"Mock PURE Pi3 reconstruction: {len(image_paths)} image(s) processed",
                "YOLO11-seg inference: 6 interior objects identified (>80% confidence)",
                "Spatial clearance: 0.92m main pathway clearance validated",
                "NOTE: Coordinates are model-relative; metric scale unverified",
            ],
        )

        return WorldcraftScene(
            scene_id=f"scene-{uuid.uuid4().hex[:12]}",
            name="Reconstructed Living Room",
            units="meters",
            coordinate_system=CoordinateSystem(),
            room=room,
            objects=objects,
            relationships=relationships,
            constraints=constraints,
            validation=validation,
            input_type="image" if not video_path else "video",
            reconstruction_model=self.model_name(),
            timestamp=datetime.now(timezone.utc).isoformat(),
            prompt_history=[f"Reconstructed from {len(image_paths)} image(s)"],
        )
