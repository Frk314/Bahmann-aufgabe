import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# backend/data/providers.json
DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "providers.json"

app = FastAPI(title="Coach Santé API")

# Autorise le front (port Vite) à appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/providers")
def get_providers():
    """Relit le fichier à chaque requête : toute modification est visible immédiatement."""
    if not DATA_FILE.exists():
        raise HTTPException(status_code=404, detail="providers.json introuvable")

    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="providers.json invalide")

    updated_at = datetime.fromtimestamp(DATA_FILE.stat().st_mtime, tz=timezone.utc)
    return {"providers": data["providers"], "updated_at": updated_at.isoformat()}