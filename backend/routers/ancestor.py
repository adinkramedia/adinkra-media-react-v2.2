# backend/routers/ancestor.py
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Literal, Optional
from pathlib import Path
from ..ai.ancestor_ai import ask_ancestor

router = APIRouter(tags=["Ancestor AI"])

class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    tts: Optional[bool] = False

# GET for quick browser testing: /ancestor?q=hello&audio=false
@router.get("/ancestor")
def ancestor_get(q: str = Query(..., description="User question"), audio: bool = Query(False)):
    result = ask_ancestor(q, with_audio=audio)
    if audio and result.get("audio"):
        return FileResponse(Path(result["audio"]), media_type="audio/wav")
    return JSONResponse({"response": result["text"]})

# POST that the frontend should use:
@router.post("/ancestor")
def ancestor_post(req: ChatRequest):
    # Find the last user role message
    last_user = None
    for m in reversed(req.messages):
        if m.role == "user":
            last_user = m.content
            break

    if not last_user:
        raise HTTPException(status_code=400, detail="No user message found in messages[]")

    result = ask_ancestor(last_user, with_audio=bool(req.tts))

    if req.tts and result.get("audio"):
        # Return JSON pointing to the audio file path (or you can return the file directly)
        return JSONResponse({"response": result["text"], "tts_file": str(result["audio"])})

    return JSONResponse({"response": result["text"]})
