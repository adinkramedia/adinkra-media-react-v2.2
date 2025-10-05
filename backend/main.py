# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv

# --- Routers ---
from .routers import dreams, calc, news, notes, ancestor_stream

# --- Persona / AI helpers ---
from backend.ai.local_ai import generate_response

# --- Load .env from project root ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / ".env"
if not ENV_PATH.exists():
    print(f"WARNING: .env not found at {ENV_PATH}")
load_dotenv(dotenv_path=ENV_PATH)

# --- FastAPI App ---
app = FastAPI(
    title="Ancestor AI",
    version="0.6.0",
    description="Ancestor AI — Dreams, Calculations, News & Ancestral Knowledge"
)

# --- CORS ---
frontend_origins = [
    "https://adinkramedia.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(dreams.router, tags=["Dreams"])
app.include_router(calc.router, tags=["Calculator"])
app.include_router(news.router, tags=["News"])
app.include_router(notes.router, tags=["Notes"])
app.include_router(ancestor_stream.router, tags=["Ancestor AI"])

# --- Root & Health ---
@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Ancestor AI 🚀",
        "routes": [
            "/ancestor",
            "/ancestor/stream",
            "/dreams",
            "/calc",
            "/news",
            "/notes"
        ]
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
