from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from ...domains.reasoning.llm_provider import generate_chat_response, RateLimitError

router = APIRouter()


class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Conversation history")
    system_prompt: Optional[str] = Field(
        default="You are a helpful study abroad advisor. Provide concise, accurate advice about universities, programs, and application processes.",
        description="System prompt for chatbot personality"
    )
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=1.0, description="Sampling temperature")
    max_tokens: Optional[int] = Field(default=None, description="Max tokens to generate")


class ChatResponse(BaseModel):
    text: str = Field(..., description="AI response text")
    citations: List[Any] = Field(default_factory=list, description="Citations (placeholder)")


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Multi-turn chat endpoint for the advice drawer chatbot.

    Handles rate limits gracefully with user-friendly messages.

    Example:
        {
            "messages": [
                {"role": "user", "content": "Tell me about universities in Canada"}
            ]
        }
    """
    try:
        # Convert Pydantic models to dicts
        messages_dict = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        response = await generate_chat_response(
            messages=messages_dict,
            system_prompt=request.system_prompt,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
        )

        return ChatResponse(**response)

    except RateLimitError as e:
        raise HTTPException(
            status_code=429,
            detail=str(e)  # "Rate limit reached. Try again in a minute."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat generation failed: {str(e)}"
        )
