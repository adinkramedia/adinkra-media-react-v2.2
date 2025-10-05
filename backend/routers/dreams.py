from fastapi import APIRouter, Query
from backend.utils.dream_dict import dream_dictionary 

router = APIRouter()

@router.get("/dreams/")
def interpret_dream(symbol: str = Query(..., description="Dream symbol to interpret")):
    meaning = dream_dictionary.get(symbol.lower(), "No interpretation found.")
    return {"symbol": symbol, "meaning": meaning}
