"""
WORLDCRAFT/ArchiTech Backend Configuration
Loads environment variables and provides typed settings.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory
_env_path = Path(__file__).parent / ".env"
load_dotenv(_env_path)


class Settings:
    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # Reconstruction
    RECONSTRUCTION_MODE: str = os.getenv("RECONSTRUCTION_MODE", "mock")  # "mock" | "colab"
    COLAB_ENDPOINT_URL: str = os.getenv("COLAB_ENDPOINT_URL", "")

    # Server
    CORS_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    ]
    UPLOAD_MAX_SIZE_MB: int = int(os.getenv("UPLOAD_MAX_SIZE_MB", "20"))

    # Paths
    BASE_DIR: Path = Path(__file__).parent
    UPLOAD_DIR: Path = BASE_DIR / "storage" / "uploads"
    PROJECTS_DIR: Path = BASE_DIR / "storage" / "projects"

    def __init__(self):
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.PROJECTS_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
