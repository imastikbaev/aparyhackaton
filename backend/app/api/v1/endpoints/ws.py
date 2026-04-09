from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services import ws_manager

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/orders/{order_id}")
async def order_status_ws(order_id: int, ws: WebSocket) -> None:
    """WebSocket для real-time статусов заказа."""
    await ws_manager.connect(order_id, ws)
    try:
        while True:
            await ws.receive_text()  # держим соединение живым (ping от клиента)
    except WebSocketDisconnect:
        ws_manager.disconnect(order_id, ws)
