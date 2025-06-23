import json
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from models.events import Feed


def seed_feeds():
    with open("database/feeds_mock.json", "r", encoding="utf-8") as f:
        feeds = json.load(f)
    db: Session = SessionLocal()
    for feed in feeds:
        # 이미 존재하는 id는 건너뛰기(중복 방지)
        if db.query(Feed).filter(Feed.id == feed["id"]).first():
            continue
        db_feed = Feed(
            id=feed["id"],
            username=feed["username"],
            subject=feed.get("subject", ""),
            images=json.dumps(feed["images"]),
            content=feed["content"],
            tags=json.dumps(feed.get("tags", [])),
            category=feed["category"]
        )
        db.add(db_feed)
    db.commit()
    db.close()
    print("목업 피드 데이터가 DB에 저장되었습니다.")

if __name__ == "__main__":
    seed_feeds() 