"""
Google Colab PURE Pi3 Adapter — §6.4
Connects to a PURE Pi3 inference server running in Google Colab via ngrok.

HOW TO SET UP COLAB:
1. Run the companion notebook: backend/colab/pure_pi3_server.ipynb
2. The notebook starts a FastAPI endpoint inside Colab and exposes it via ngrok
3. Copy the ngrok HTTPS URL into .env as COLAB_ENDPOINT_URL
4. Set RECONSTRUCTION_MODE=colab in .env
5. The backend will route reconstruction calls to Colab automatically

Colab endpoint contract (POST /reconstruct):
  - Multipart form: files (images) or video
  - Returns JSON matching WorldcraftScene (after normalization here)
"""

from __future__ import annotations
import httpx
from pathlib import Path
from typing import List

from models.scene_schema import WorldcraftScene
from services.reconstruction.adapter import ReconstructionAdapter
from config import settings


class ColabReconstructionAdapter(ReconstructionAdapter):
    """Forwards images/video to running Colab PURE Pi3 server."""

    def model_name(self) -> str:
        return "pure_pi3_colab"

    def supports_video(self) -> bool:
        return True

    async def reconstruct(
        self,
        image_paths: List[Path],
        video_path: Path | None = None,
        reference_measurements: dict | None = None,
    ) -> WorldcraftScene:
        if not settings.COLAB_ENDPOINT_URL:
            raise RuntimeError(
                "COLAB_ENDPOINT_URL not set in .env. "
                "Start the Colab notebook and paste the ngrok URL."
            )

        endpoint = settings.COLAB_ENDPOINT_URL.rstrip("/") + "/reconstruct"

        # Build multipart payload
        files_payload = []
        if video_path:
            files_payload.append(
                ("video", (video_path.name, video_path.read_bytes(), "video/mp4"))
            )
        else:
            for idx, img_path in enumerate(image_paths):
                suffix = img_path.suffix.lower()
                mime = "image/jpeg" if suffix in (".jpg", ".jpeg") else "image/png"
                files_payload.append(
                    (f"image_{idx}", (img_path.name, img_path.read_bytes(), mime))
                )

        data = {}
        if reference_measurements:
            import json
            data["reference_measurements"] = json.dumps(reference_measurements)

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(endpoint, files=files_payload, data=data)
            response.raise_for_status()
            payload = response.json()

        # Normalize Colab output into WorldcraftScene
        # Colab server should already return this format; validate defensively
        return WorldcraftScene.model_validate(payload)
