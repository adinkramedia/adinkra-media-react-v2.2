from fastapi import APIRouter

router = APIRouter()

# Placeholder - later fetch live from Adinkra Media site
fake_news = [
    {"title": "African Union launches new peace initiative", "url": "https://adinrkmedia.com/news1"},
    {"title": "Adinkra Media expands cultural coverage", "url": "https://adinrkmedia.com/news2"},
]

@router.get("/news")
def get_news():
    return {"news": fake_news}
