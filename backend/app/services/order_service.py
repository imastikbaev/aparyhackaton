import asyncio
import logging
import random

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderStatus
from app.repositories import OrderRepository, QRPointRepository
from app.schemas.order import OrderCreate
from app.services.ws_manager import ws_manager

logger = logging.getLogger(__name__)


class OrderService:
    def __init__(self, session: AsyncSession) -> None:
        self._order_repo = OrderRepository(session)
        self._qr_repo = QRPointRepository(session)

    async def create_order(self, user_id: int, data: OrderCreate) -> Order:
        qr_point = await self._qr_repo.get_active(data.qr_point_id)
        if not qr_point:
            raise ValueError("QR-точка не найдена или неактивна")

        order = await self._order_repo.create(
            user_id=user_id,
            qr_point_id=data.qr_point_id,
            pickup_address=qr_point.address,
            pickup_lat=qr_point.latitude,
            pickup_lon=qr_point.longitude,
            destination_address=data.destination_address,
            destination_lat=data.destination_lat,
            destination_lon=data.destination_lon,
            tariff=data.tariff,
            payment_method=data.payment_method,
            price_estimate=self._estimate_price(data.tariff),
        )

        # Запускаем поиск водителя в фоне
        asyncio.create_task(self._dispatch_driver(order.id))
        return order

    async def get_order(self, order_id: int) -> Order | None:
        return await self._order_repo.get_with_relations(order_id)

    async def update_status(self, order_id: int, status: OrderStatus) -> Order | None:
        order = await self._order_repo.get_by_id(order_id)
        if not order:
            return None
        updated = await self._order_repo.update_status(order, status)
        await ws_manager.broadcast_order_status(order_id, status)
        return updated

    async def _dispatch_driver(self, order_id: int) -> None:
        """Имитация назначения водителя (заменить реальной интеграцией)."""
        await asyncio.sleep(3)
        await ws_manager.broadcast_order_status(order_id, OrderStatus.DRIVER_ASSIGNED)
        logger.info("Driver assigned for order %s", order_id)

    @staticmethod
    def _estimate_price(tariff: str) -> float:
        base = {"economy": 500, "standard": 700, "comfort": 1000}.get(tariff, 700)
        return round(base + random.uniform(-50, 100), 2)
