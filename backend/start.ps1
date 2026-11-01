# WORLDCRAFT backend — start script
# Usage: ./start.ps1          (mock mode, instant)
#        ./start.ps1 -colab   (colab mode, needs COLAB_ENDPOINT_URL in .env)

param([switch]$colab)

$env:PYTHONDONTWRITEBYTECODE = "1"

if ($colab) {
    Write-Host "Starting in COLAB mode — make sure COLAB_ENDPOINT_URL is set in .env" -ForegroundColor Cyan
    $env:RECONSTRUCTION_MODE = "colab"
} else {
    Write-Host "Starting in MOCK mode (no GPU required)" -ForegroundColor Green
    $env:RECONSTRUCTION_MODE = "mock"
}

Write-Host ""
Write-Host "API docs at: http://localhost:8000/api/docs" -ForegroundColor Yellow
Write-Host "Health:      http://localhost:8000/api/health" -ForegroundColor Yellow
Write-Host ""

python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
