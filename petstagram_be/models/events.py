from sqlalchemy import Column, Integer, String, DateTime, Text, func
from database.connection import Base

class Feed(Base):
    __tablename__ = "feeds"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    category = Column(Integer, nullable=False)
    images = Column(Text, nullable=False)  # JSON 문자열로 저장
    content = Column(Text, nullable=False)
    tags = Column(Text, nullable=True)     # JSON 문자열로 저장
    likes = Column(Integer, default=0)
    views = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    subject = Column(String(255), nullable=True)
