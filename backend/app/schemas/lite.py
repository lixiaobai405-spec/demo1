from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field

class PublicSource(BaseModel):
    url: str
    title: str
    excerpt: str
    retrieved_at: datetime
    kind: str = "public"

class LiteProfile(BaseModel):
    industry: str
    main_business: str
    scale: str
    region: str
    recent_developments: str
    summary: str
    missing_information: list[str] = Field(default_factory=list)

class LiteDirection(BaseModel):
    title: str
    rationale: str
    feasibility: str
    resources: list[str]

class LiteRecommendation(BaseModel):
    current_situation: str
    directions: list[LiteDirection] = Field(min_length=2, max_length=3)
    next_steps: list[str]
    risks: list[str]

class LiteResult(BaseModel):
    id: str
    company_name: str
    status: Literal["profile_ready", "insufficient", "complete", "failed"]
    version: str
    generated_at: datetime
    profile_generated_at: datetime | None = None
    cache_hit: bool = False
    sources: list[PublicSource]
    profile: LiteProfile | None = None
    recommendation: LiteRecommendation | None = None
    warnings: list[str] = Field(default_factory=list)
