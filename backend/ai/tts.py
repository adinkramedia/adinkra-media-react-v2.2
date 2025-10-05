# backend/ai/tts.py
import torch
from TTS.api import TTS
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent / "tts_output"
OUTPUT_DIR.mkdir(exist_ok=True)

# Load XTTS model once
_tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cpu")

def synthesize_speech(text: str, file_name: str = "output.wav") -> str:
    out_path = OUTPUT_DIR / file_name
    _tts.tts_to_file(text=text, file_path=str(out_path))
    return str(out_path)
