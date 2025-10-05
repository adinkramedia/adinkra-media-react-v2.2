# backend/routers/ancestor_stream.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Literal
import asyncio
import re

from backend.ai.local_ai import generate_response, stream_response

router = APIRouter(prefix="/ancestor", tags=["Ancestor AI"])

class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

# --- Helpers ---
def clean_token(token: str) -> str:
    """Normalize token spacing before streaming to frontend."""
    if not token:
        return ""
    token = re.sub(r"([,.!?])(?=\S)", r"\1 ", token)  # space after punctuation
    token = re.sub(r"\s+", " ", token)                # collapse spaces
    return token.strip()

# --- Standard chat (returns full JSON response) ---
@router.post("")
async def ancestor_chat(req: ChatRequest):
    try:
        user_msg = next((m.content for m in reversed(req.messages) if m.role == "user"), "")
        text = generate_response(user_msg, max_tokens=180)
        if not text.strip():
            text = "Ancestor has no response yet."
        return JSONResponse({"response": text})
    except Exception as e:
        print(f"[ERROR] Ancestor chat error: {e}")
        return JSONResponse({"response": "⚠️ Ancestor AI is currently unavailable."})

# --- Streaming chat (returns partial tokens) ---
@router.post("/stream")
async def ancestor_stream(req: ChatRequest):
    try:
        user_msg = next((m.content for m in reversed(req.messages) if m.role == "user"), "")

        async def token_generator():
            async for token in stream_response(user_msg, max_tokens=180):
                cleaned = clean_token(token)
                if cleaned:
                    print("[STREAMING]", cleaned)  # Debug log
                    yield cleaned + " "
                await asyncio.sleep(0)

        return StreamingResponse(token_generator(), media_type="text/plain")
    except Exception as e:
        print(f"[ERROR] Ancestor stream error: {e}")

        async def fallback():
            yield "⚠️ Ancestor AI is currently unavailable."

        return StreamingResponse(fallback(), media_type="text/plain")

# --- Legacy GET endpoint for quick tests ---
@router.get("")
async def ancestor_get(q: str):
    try:
        text = generate_response(q, max_tokens=180)
        if not text.strip():
            text = "Ancestor has no response yet."
        return JSONResponse({"response": text})
    except Exception as e:
        print(f"[ERROR] Ancestor GET error: {e}")
        return JSONResponse({"response": "⚠️ Ancestor AI is currently unavailable."})
