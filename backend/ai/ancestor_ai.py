# backend/ai/ancestor_ai.py
from .local_ai import generate_response
from .tts import synthesize_speech  # your Coqui wrapper (returns file path or None)

def ask_ancestor(question: str, with_audio: bool = False) -> dict:
    """
    Returns {'text': <reply>, 'audio': <wav_path|null>}.
    Only uses the most recent user message (question).
    """
    text = generate_response(question, max_tokens=int(__import__("os").environ.get("MODEL_MAX_TOKENS", "128")),
                             temperature=float(__import__("os").environ.get("MODEL_TEMPERATURE", "0.2")))
    audio_path = None
    if with_audio:
        try:
            audio_path = synthesize_speech(text)
        except Exception as e:
            print(f"[ancestor_ai] TTS failed: {e}")
            audio_path = None

    return {"text": text, "audio": audio_path}
