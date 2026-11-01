"""
POST /api/reconstruct

Accepts one or more uploaded room images.  Depending on RECONSTRUCTION_MODE:

  mock  — Returns a realistic canned scene immediately (no GPU needed).
  colab — Forwards images to the Colab endpoint and returns the parsed scene.

The response always conforms to ReconstructResponse so the frontend never
needs to know which backend was used.
"""

import uuid
import logging
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi import status as http_status

from config import settings
from schemas import ReconstructResponse, ArchiTechScene
from services.mock_scene import build_mock_scene
from services.colab_client import forward_images_to_colab

logger = logging.getLogger(__name__)
router = APIRouter(tags=["reconstruct"])


@router.post("/reconstruct", response_model=ReconstructResponse)
async def reconstruct(files: list[UploadFile] = File(...)):
    """
    Accepts 1–N room photos and returns a WORLDCRAFT scene.
    """
    if not files:
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one image file is required.",
        )

    # Basic size guard
    max_bytes = settings.UPLOAD_MAX_SIZE_MB * 1024 * 1024
    image_bytes: list[bytes] = []
    for f in files:
        data = await f.read()
        if len(data) > max_bytes:
            raise HTTPException(
                status_code=http_status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File {f.filename!r} exceeds {settings.UPLOAD_MAX_SIZE_MB} MB limit.",
            )
        image_bytes.append(data)

    scene_id = f"scene-{uuid.uuid4().hex[:8]}"

    # ------------------------------------------------------------------ #
    # Reconstruction dispatch
    # ------------------------------------------------------------------ #
    mode = settings.RECONSTRUCTION_MODE

    if mode == "colab":
        if not settings.COLAB_ENDPOINT_URL:
            raise HTTPException(
                status_code=http_status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="RECONSTRUCTION_MODE=colab but COLAB_ENDPOINT_URL is not set.",
            )
        try:
            scene = await forward_images_to_colab(
                image_bytes=image_bytes,
                filenames=[f.filename or f"image_{i}.jpg" for i, f in enumerate(files)],
                scene_id=scene_id,
            )
        except Exception as exc:
            logger.error("Colab reconstruction failed: %s", exc)
            raise HTTPException(
                status_code=http_status.HTTP_502_BAD_GATEWAY,
                detail=f"Colab reconstruction error: {exc}",
            )
    else:
        # mock — useful for local development without a Colab session
        scene = build_mock_scene(scene_id=scene_id, n_images=len(files))

    return ReconstructResponse(
        scene_id=scene_id,
        status="reconstructed",
        scene=scene,
        reconstruction_mode=mode,
    )
