import json
import logging
from collections import defaultdict

from fastapi import WebSocket

from app.models.order import OrderStatus

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Менеджер WebSocket-соединений для real-time статусов заказов."""

    def __init__(self) -> None:
        # order_id → list of active WebSocket connections
        self._connections: dict[int, list[WebSocket]] = defaultdict(list)

    async def connect(self, order_id: int, ws: WebSocket) -> None:
        await ws.accept()
        self._connections[order_id].append(ws)
        logger.info("WS connected: order=%s, total=%s", order_id, len(self._connections[order_id]))

    def disconnect(self, order_id: int, ws: WebSocket) -> None:
        self._connections[order_id].discard(ws) if hasattr(
            self._connections[order_id], "discard"
        ) else self._connections[order_id].remove(ws)
        if not self._connections[order_id]:
            del self._connections[order_id]

    async def broadcast_order_status(self, order_id: int, status: OrderStatus, **extra: object) -> None:
        payload = json.dumps({"type": "status_update", "order_id": order_id, "status": status, **extra})
        dead: list[WebSocket] = []
        for ws in self._connections.get(order_id, []):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(order_id, ws)


ws_manager = WebSocketManager()
