"""
services/colab_client.py

Sends uploaded images to the Google Colab ngrok/localtunnel endpoint
(COLAB_ENDPOINT_URL) and parses the JSON response back into an
ArchiTechScene.

The Colab notebook exposes two routes:
    POST /reconstruct  — multipart images → scene JSON
    GET  /health       — liveness probe

If the Colab session is dead, RECONSTRUCTION_MODE should be flipped to
"mock" in backend/.env so the FastAPI server continues to work.
"""

import httpx
import logging
from schemas import ArchiTechScene
from config import settings

logger = logging.getLogger(__name__)

# httpx timeout: Colab inference can take 30–90 s on a T4
COLAB_TIMEOUT = httpx.Timeout(120.0, connect=10.0)


async def forward_images_to_colab(
    image_bytes: list[bytes],
    filenames: list[str],
    scene_id: str,
) -> ArchiTechScene:
    """
    POSTs raw image bytes to the Colab endpoint and returns a parsed scene.

    Args:
        image_bytes: Raw bytes for each uploaded image.
        filenames:   Original filenames (used as multipart field names).
        scene_id:    Scene ID to include in the request metadata.

    Returns:
        Parsed ArchiTechScene from Colab JSON response.

    Raises:
        RuntimeError if the Colab endpoint returns a non-2xx response or
        the response cannot be parsed as a valid scene.
    """
    url = settings.COLAB_ENDPOINT_URL.rstrip("/") + "/reconstruct"
    logger.info("Forwarding %d image(s) to Colab: %s", len(image_bytes), url)

    # Build multipart payload
    files = []
    for i, (data, name) in enumerate(zip(image_bytes, filenames)):
        files.append(("files", (name, data, "image/jpeg")))

    async with httpx.AsyncClient(timeout=COLAB_TIMEOUT) as client:
        response = await client.post(
            url,
            files=files,
            data={"scene_id": scene_id},
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Colab endpoint returned HTTP {response.status_code}: {response.text[:300]}"
        )

    payload = response.json()

    # The Colab notebook may return the scene nested or flat
    scene_data = payload.get("scene") or payload
    return ArchiTechScene.model_validate(scene_data)


async def ping_colab() -> bool:
    """Returns True if the Colab health endpoint is reachable."""
    if not settings.COLAB_ENDPOINT_URL:
        return False
    url = settings.COLAB_ENDPOINT_URL.rstrip("/") + "/health"
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
            r = await client.get(url)
            return r.status_code == 200
    except Exception:
        return False
