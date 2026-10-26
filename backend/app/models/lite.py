from datetime import datetime
from uuid import uuid4
from sqlalchemy import DateTime, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base

class LitePublicCache(Base):
    """Only public evidence belongs here. Never store user uploads in this table."""
    __tablename__ = "lite_public_cache"
    company_key: Mapped[str] = mapped_column(String(64), primary_key=True)
    company_name: Mapped[str] = mapped_column(String(255))
    state: Mapped[str] = mapped_column(String(20), default="fetching")
    sources_json: Mapped[str] = mapped_column(Text, default="[]")
    warnings_json: Mapped[str] = mapped_column(Text, default="[]")
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    lease_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    lease_token: Mapped[str | None] = mapped_column(String(36), nullable=True)

class LiteAssessment(Base):
    __tablename__ = "lite_assessments"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), index=True)
    company_name: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(30))
    version: Mapped[str] = mapped_column(String(80))
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    profile_generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    cache_hit: Mapped[bool] = mapped_column(Boolean, default=False)
    sources_json: Mapped[str] = mapped_column(Text)
    profile_json: Mapped[str] = mapped_column(Text)
    recommendation_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    warnings_json: Mapped[str] = mapped_column(Text, default="[]")
    uploaded_text: Mapped[str | None] = mapped_column(Text, nullable=True)
