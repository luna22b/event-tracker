from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.manager import manager


router = APIRouter()


@router.websocket("/ws/restaurants/{restaurant_id}")
async def restaurant_updates(
    websocket: WebSocket,
    restaurant_id: int
):

    await manager.connect(
        restaurant_id,
        websocket
    )

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(
            restaurant_id,
            websocket
        )