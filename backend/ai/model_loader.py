# backend/ai/model_loader.py
import threading
import os
from pathlib import Path
from llama_cpp import Llama

# Path defaults, can override with env var MODEL_FILE
MODEL_FILE = os.getenv(
    "MODEL_FILE",
    "capybarahermes-2.5-mistral-7b.Q3_K_S.gguf"
)
MODEL_PATH = Path(__file__).parent / "models" / MODEL_FILE

_model = None
_lock = threading.Lock()

def get_model():
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                n_ctx = int(os.getenv("MODEL_N_CTX", "2048"))
                # default threads: number of CPUs - 1 (but at least 1)
                try:
                    import os as _os
                    cpus = _os.cpu_count() or 1
                except Exception:
                    cpus = 1
                n_threads = int(os.getenv("MODEL_THREADS", str(max(1, cpus - 1))))
                n_batch = int(os.getenv("MODEL_N_BATCH", "512"))

                print(f"[model_loader] Loading model {MODEL_PATH} n_ctx={n_ctx} n_threads={n_threads} n_batch={n_batch}")
                _model = Llama(
                    model_path=str(MODEL_PATH),
                    n_ctx=n_ctx,
                    n_threads=n_threads,
                    n_batch=n_batch
                )
                print("[model_loader] Model loaded successfully ✅")
    return _model
