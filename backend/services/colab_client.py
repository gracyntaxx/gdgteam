"""
services/colab_client.py

Thin wrapper around the Colab HTTP endpoint.
ping_colab() is imported by the health router.
The actual reconstruction call goes through ColabReconstructionAdapter.
"""

import httpx
import logging
from config import settings

logger = logging.getLogger(__name__)


async def ping_colab() -> bool:
    """Returns True if the configured Colab endpoint is alive."""
    if not settings.COLAB_ENDPOINT_URL:
        return False
    url = settings.COLAB_ENDPOINT_URL.rstrip("/") + "/health"
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
            r = await client.get(url, headers={"ngrok-skip-browser-warning": "true"})
            return r.status_code == 200
    except Exception as exc:
        logger.debug("Colab ping failed: %s", exc)
        return False
