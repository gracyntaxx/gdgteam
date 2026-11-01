"""
POST /api/reconstruct

Accepts one or more uploaded room images (or a short video).
Dispatches to the correct ReconstructionAdapter based on RECONSTRUCTION_MODE:

  mock  → MockReconstructionAdapter  (instant, no GPU, deterministic)
  colab → ColabReconstructionAdapter (forwards to PURE Pi3 GPU server in Colab)

Response always returns a normalized WorldcraftScene.
"""

import uuid
import shutil
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel

from config import settings
from models.scene_schema import WorldcraftScene
from services.reconstruction.mock_adapter import MockReconstructionAdapter
from services.reconstruction.colab_adapter import ColabReconstructionAdapter

logger = logging.getLogger(__name__)
router = APIRouter(tags=["reconstruct"])

# Map mode strings → adapter classes
_ADAPTERS = {
    "mock":  MockReconstructionAdapter,
    "colab": ColabReconstructionAdapter,
}

# Accepted MIME types
_ALLOWED_IMAGE_MIME = {"image/jpeg", "image/png", "image/webp"}
_ALLOWED_VIDEO_MIME = {"video/mp4", "video/quicktime", "video/mpeg"}


class ReconstructResponse(BaseModel):
    scene_id: str
    status: str
    scene: WorldcraftScene
    reconstruction_mode: str


def _get_adapter():
    mode = settings.RECONSTRUCTION_MODE
    cls = _ADAPTERS.get(mode)
    if cls is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unknown RECONSTRUCTION_MODE '{mode}'. Must be 'mock' or 'colab'.",
        )
    return cls()


@router.post("/reconstruct", response_model=ReconstructResponse)
async def reconstruct(
    files: list[UploadFile] = File(default=[]),
    video: Optional[UploadFile] = File(default=None),
    reference_measurements: Optional[str] = Form(default=None),  # JSON string
):
    """
    Accept images and/or a video; return a WORLDCRAFT scene.

    - Images: supply via the 'files' field (multipart). 2 images are recommended
      for PURE Pi3 multi-view reconstruction.
    - Video: supply via the 'video' field (multipart). Max ~20MB.
    - reference_measurements: optional JSON string, e.g.
      '{"room_width_m": 4.5, "door_height_m": 2.1}'
    """
    if not files and video is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide at least one image via 'files' or a video via 'video'.",
        )

    max_bytes = settings.UPLOAD_MAX_SIZE_MB * 1024 * 1024
    job_id = uuid.uuid4().hex[:12]
    upload_dir: Path = settings.UPLOAD_DIR / job_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    # ── Save images ──────────────────────────────────────────────────────────
    image_paths: list[Path] = []
    for upload in files:
        if upload.content_type not in _ALLOWED_IMAGE_MIME:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported image type '{upload.content_type}'. Use JPEG/PNG/WebP.",
            )
        data = await upload.read()
        if len(data) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File '{upload.filename}' exceeds {settings.UPLOAD_MAX_SIZE_MB} MB.",
            )
        dest = upload_dir / (upload.filename or f"image_{len(image_paths)}.jpg")
        dest.write_bytes(data)
        image_paths.append(dest)

    # ── Save video ───────────────────────────────────────────────────────────
    video_path: Optional[Path] = None
    if video is not None:
        if video.content_type not in _ALLOWED_VIDEO_MIME:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported video type '{video.content_type}'.",
            )
        vdata = await video.read()
        if len(vdata) > max_bytes:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                                detail="Video exceeds upload size limit.")
        video_path = upload_dir / (video.filename or "input.mp4")
        video_path.write_bytes(vdata)

    # ── Parse optional reference measurements ────────────────────────────────
    ref_meas = None
    if reference_measurements:
        import json
        try:
            ref_meas = json.loads(reference_measurements)
        except json.JSONDecodeError:
            raise HTTPException(status_code=422, detail="reference_measurements must be valid JSON.")

    # ── Reconstruct ───────────────────────────────────────────────────────────
    adapter = _get_adapter()
    try:
        scene = await adapter.reconstruct(
            image_paths=image_paths,
            video_path=video_path,
            reference_measurements=ref_meas,
        )
    except Exception as exc:
        logger.error("Reconstruction failed [mode=%s]: %s", settings.RECONSTRUCTION_MODE, exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Reconstruction error: {exc}",
        )
    finally:
        # Clean up uploaded files
        shutil.rmtree(upload_dir, ignore_errors=True)

    return ReconstructResponse(
        scene_id=scene.scene_id,
        status="reconstructed",
        scene=scene,
        reconstruction_mode=adapter.model_name(),
    )
