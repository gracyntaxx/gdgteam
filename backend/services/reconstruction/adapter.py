"""
Reconstruction Adapter Interface — §6.4 of SRS.

Every reconstruction backend (mock, Colab, future cloud) implements this
abstract class. The router only calls `.reconstruct()` and gets a
WorldcraftScene back — no model-specific code leaks upward.
"""

from __future__ import annotations
from abc import ABC, abstractmethod
from typing import List
from pathlib import Path
from models.scene_schema import WorldcraftScene


class ReconstructionAdapter(ABC):
    """Base adapter — §6.4."""

    @abstractmethod
    async def reconstruct(
        self,
        image_paths: List[Path],
        video_path: Path | None = None,
        reference_measurements: dict | None = None,
    ) -> WorldcraftScene:
        """
        Accept validated input files and return a normalized WorldcraftScene.
        Must not return raw model output directly — always normalize into schema.
        Coordinates are model-relative; mark dimensions.status='estimated'
        unless a reference measurement was validated.
        """
        ...

    @abstractmethod
    def supports_video(self) -> bool: ...

    @abstractmethod
    def model_name(self) -> str: ...
