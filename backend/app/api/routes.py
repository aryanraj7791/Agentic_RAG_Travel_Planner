"""FastAPI route definitions."""

from fastapi import APIRouter

from app.models.schemas import ChatRequest, ChatResponse, HealthResponse
from app.services.chat_service import handle_chat

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    return await handle_chat(request)
