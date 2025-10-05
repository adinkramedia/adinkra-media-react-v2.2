# backend/ai/local_ai.py
import asyncio
import re
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "capybarahermes-2.5-mistral-7b.Q3_K_S.gguf"
LLAMA_CLI = Path(__file__).resolve().parent.parent.parent / "llama.cpp" / "build" / "bin" / "llama-cli"

SYSTEM_PROMPT = (
    "You are *Ancestor*, a wise African elder and guide. Speak warmly, concisely, "
    "and respectfully. Use gentle, wise phrasing. "
    "Do NOT prefix responses with any role labels. Return plain text only."
)

def _clean_text(s: str) -> str:
    if not s:
        return s
    s = re.sub(r"<\|im_start\|>.*?\n", "", s)
    s = re.sub(r"<\|im_end\|>", "", s)
    return s.strip()

def generate_response(user_prompt: str, max_tokens: int = 180, temperature: float = 0.2) -> str:
    """Synchronous call to llama-cli."""
    import subprocess

    prompt = f"{SYSTEM_PROMPT}\n\nUser: {user_prompt}\nAssistant:"

    try:
        result = subprocess.run(
            [
                str(LLAMA_CLI),
                "-m", str(MODEL_PATH),
                "-p", prompt,
                "-n", str(max_tokens),
                "-t", "4",  # threads
                "--temp", str(temperature)
            ],
            capture_output=True,
            text=True,
            check=True
        )
        text = result.stdout
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Llama CLI failed: {e}")
        text = "Ancestor is currently unavailable."

    return _clean_text(text)

# --- Streaming version ---
async def stream_response(user_prompt: str, max_tokens: int = 180, temperature: float = 0.2):
    """Async generator streaming tokens from llama-cli"""
    prompt = f"{SYSTEM_PROMPT}\n\nUser: {user_prompt}\nAssistant:"

    proc = await asyncio.create_subprocess_exec(
        str(LLAMA_CLI),
        "-m", str(MODEL_PATH),
        "-p", prompt,
        "-n", str(max_tokens),
        "-t", "4",
        "--temp", str(temperature),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    buffer = ""
    while True:
        line = await proc.stdout.readline()
        if not line:
            break
        buffer += line.decode("utf-8")
        yield _clean_text(buffer)

    await proc.wait()
