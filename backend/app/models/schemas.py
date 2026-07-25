"""Pydantic request/response models for the Travel Planner API."""

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1)
    user_id: str | None = None


class Recommendation(BaseModel):
    title: str
    type: str
    city: str = ""
    url: str = ""


class ExecutionTrace(BaseModel):
    step: str
    status: str = "completed"
    detail: str = ""
    timestamp: str = ""


class ChatResponse(BaseModel):
    reply: str
    recommendations: list[Recommendation] = Field(default_factory=list)
    sources: list[str] = Field(default_factory=list)
    end_of_conversation: bool = False
    execution_traces: list[ExecutionTrace] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str = "ok"
