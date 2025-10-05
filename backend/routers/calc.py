# backend/routers/calc.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/calc/add")
def add(a: int, b: int):
    return {"operation": "add", "a": a, "b": b, "result": a + b}

@router.get("/calc/subtract")
def subtract(a: int, b: int):
    return {"operation": "subtract", "a": a, "b": b, "result": a - b}

@router.get("/calc/multiply")
def multiply(a: int, b: int):
    return {"operation": "multiply", "a": a, "b": b, "result": a * b}

@router.get("/calc/divide")
def divide(a: int, b: int):
    if b == 0:
        return {"error": "Division by zero is not allowed"}
    return {"operation": "divide", "a": a, "b": b, "result": a / b}
