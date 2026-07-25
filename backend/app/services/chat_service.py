"""Chat orchestration service."""



from __future__ import annotations



import asyncio



from app.agent.graph import get_agent_graph

from app.config import get_settings

from app.db.mongodb import log_chat_interaction, save_itinerary

from app.extensions import trace_to_langsmith

from app.models.schemas import ChatRequest, ChatResponse, ExecutionTrace, Recommendation


from litellm.exceptions import RateLimitError


async def handle_chat(request: ChatRequest) -> ChatResponse:

    settings = get_settings()

    user_turns = sum(1 for m in request.messages if m.role == "user")

    if user_turns > settings.max_conversation_turns:

        return ChatResponse(

            reply=(

                "We've reached the maximum number of turns for this conversation. "

                "Please start a new chat with a summary of your requirements."

            ),

            recommendations=[],

            sources=[],

            end_of_conversation=True,

            execution_traces=[],

        )



    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    graph = get_agent_graph()



    try:

        result = await asyncio.wait_for(

            graph.ainvoke({"messages": messages, "execution_traces": []}),

            timeout=settings.chat_timeout_seconds,

        )

    except asyncio.TimeoutError:

        return ChatResponse(

            reply="Sorry, that took too long. Please try a simpler question or start a new chat.",

            recommendations=[],

            sources=[],

            end_of_conversation=False,

            execution_traces=[],

        )

    except RateLimitError:

        return ChatResponse(

            reply="The API rate limit has been reached. Please wait a moment and try again.",

            recommendations=[],

            sources=[],

            end_of_conversation=False,

            execution_traces=[],

        )

    except Exception as e:

        return ChatResponse(

            reply=f"An error occurred: {str(e)}. Please try again.",

            recommendations=[],

            sources=[],

            end_of_conversation=False,

            execution_traces=[],

        )



    traces = [

        ExecutionTrace(

            step=t.get("step", ""),

            status=t.get("status", "completed"),

            detail=t.get("detail", ""),

            timestamp=t.get("timestamp", ""),

        )

        for t in result.get("execution_traces", [])

    ]



    recommendations = [

        Recommendation(

            title=r.get("title", ""),

            type=r.get("type", "general"),

            city=r.get("city", ""),

            url=r.get("url", ""),

        )

        for r in result.get("recommendations", [])

        if r.get("title")

    ]



    response = ChatResponse(

        reply=result.get("reply", "I couldn't generate a response. Please try again."),

        recommendations=recommendations,

        sources=result.get("sources", []),

        end_of_conversation=result.get("end_of_conversation", False),

        execution_traces=traces,

    )



    await log_chat_interaction(

        {

            "user_id": request.user_id,

            "user_turns": user_turns,

            "intent": result.get("intent"),

            "city": result.get("city"),

            "sources_count": len(response.sources),

            "end_of_conversation": response.end_of_conversation,

            "execution_traces": result.get("execution_traces", []),

        }

    )



    if response.end_of_conversation and response.recommendations:

        await save_itinerary(

            {

                "user_id": request.user_id,

                "city": result.get("city"),

                "intent": result.get("intent"),

                "recommendations": [r.model_dump() for r in response.recommendations],

                "sources": response.sources,

            }

        )



    trace_to_langsmith(result.get("execution_traces", []))

    return response

