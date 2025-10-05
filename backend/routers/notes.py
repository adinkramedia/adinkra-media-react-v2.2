from fastapi import APIRouter, Depends
import sqlite3

router = APIRouter()

def get_db():
    conn = sqlite3.connect("ancestor.db")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

@router.post("/notes/")
def create_note(text: str, completed: bool = False, db=Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO notes (text, completed) VALUES (?, ?)", (text, completed)
    )
    db.commit()
    return {"id": cursor.lastrowid, "text": text, "completed": completed}

@router.get("/notes/")
def get_notes(db=Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM notes")
    return cursor.fetchall()
