from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from models.events import Feed
from schemas.events import FeedCreate, FeedRead, FeedUpdate
from typing import List, Optional
import json
import os

router = APIRouter()

BASE_URL = "http://127.0.0.1:8000"
UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def safe_json_loads(val):
    if isinstance(val, list):
        return val
    try:
        loaded = json.loads(val)
        if isinstance(loaded, str):
            return json.loads(loaded)
        return loaded
    except Exception:
        return []

def to_full_url(path: str) -> str:
    if path and not path.startswith('http'):
        return f"{BASE_URL}{path}"
    return path

def process_feed_urls(feed: Feed):
    images = safe_json_loads(feed.images)
    if isinstance(images, list):
        feed.images = [to_full_url(img) for img in images]
    
    tags = safe_json_loads(feed.tags)
    if isinstance(tags, list):
        feed.tags = tags
    else:
        feed.tags = []

@router.get("/", response_model=List[FeedRead])
def get_feeds(db: Session = Depends(get_db)):
    feeds = db.query(Feed).all()
    for feed in feeds:
        process_feed_urls(feed)
    return feeds

@router.post("/", response_model=FeedRead)
def create_feed(
    username: str = Form(...),
    subject: str = Form(...),
    category: int = Form(...),
    content: str = Form(...),
    tags: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db)
):
    if not images or len(images) == 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="이미지 파일을 1장 이상 첨부해야 합니다.")
    # 이미지 파일 저장
    image_urls = []
    for image in images:
        file_location = os.path.join(UPLOAD_DIR, image.filename)
        with open(file_location, "wb") as f:
            f.write(image.file.read())
        image_urls.append(f"/{UPLOAD_DIR}/{image.filename}")

    tag_list = json.loads(tags) if tags else []
    db_feed = Feed(
        username=username,
        subject=subject,
        category=category,
        images=json.dumps(image_urls),
        content=content,
        tags=json.dumps(tag_list)
    )
    db.add(db_feed)
    db.commit()
    db.refresh(db_feed)
    
    process_feed_urls(db_feed)
    return db_feed

@router.get("/{feed_id}", response_model=FeedRead)
def get_feed(feed_id: int, db: Session = Depends(get_db)):
    feed = db.query(Feed).filter(Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="피드를 찾을 수 없습니다.")
    process_feed_urls(feed)
    return feed

@router.put("/{feed_id}", response_model=FeedRead)
def update_feed(feed_id: int, feed_update: FeedUpdate, db: Session = Depends(get_db)):
    feed = db.query(Feed).filter(Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="피드를 찾을 수 없습니다.")
    if feed_update.subject is not None:
        feed.subject = feed_update.subject
    if feed_update.content is not None:
        feed.content = feed_update.content
    if feed_update.images is not None:
        feed.images = json.dumps(feed_update.images)
    if feed_update.tags is not None:
        feed.tags = json.dumps(feed_update.tags)
    db.commit()
    db.refresh(feed)
    process_feed_urls(feed)
    return feed

@router.delete("/{feed_id}")
def delete_feed(feed_id: int, db: Session = Depends(get_db)):
    feed = db.query(Feed).filter(Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="피드를 찾을 수 없습니다.")
    db.delete(feed)
    db.commit()
    return {"message": "피드가 삭제되었습니다."}

@router.post("/{feed_id}/like")
def like_feed(feed_id: int, db: Session = Depends(get_db)):
    feed = db.query(Feed).filter(Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="피드를 찾을 수 없습니다.")
    feed.likes += 1
    db.commit()
    db.refresh(feed)
    return {"message": "좋아요가 추가되었습니다.", "likes": feed.likes}
