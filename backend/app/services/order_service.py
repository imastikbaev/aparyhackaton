import asyncio
import logging
from math import atan2, cos, radians, sin, sqrt

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
            price_estimate=self._estimate_price(
                data.tariff,
                qr_point.latitude,
                qr_point.longitude,
                data.destination_lat,
                data.destination_lon,
            ),
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
    def _estimate_price(
        tariff: str,
        pickup_lat: float,
        pickup_lon: float,
        destination_lat: float | None,
        destination_lon: float | None,
    ) -> float:
        tariffs = {
            "economy": {"base": 300, "per_km": 100, "minimum": 500},
            "standard": {"base": 350, "per_km": 120, "minimum": 600},
            "comfort": {"base": 500, "per_km": 150, "minimum": 800},
        }
        config = tariffs.get(tariff, tariffs["standard"])

        if destination_lat is None or destination_lon is None:
            return float(config["minimum"])

        distance_meters = OrderService._distance_meters(
            pickup_lat,
            pickup_lon,
            destination_lat,
            destination_lon,
        )
        price = config["base"] + (distance_meters / 1000) * config["per_km"]
        return float(round(max(price, config["minimum"]), 2))

    @staticmethod
    def _distance_meters(
        pickup_lat: float,
        pickup_lon: float,
        destination_lat: float,
        destination_lon: float,
    ) -> float:
        earth_radius = 6_371_000
        lat1 = radians(pickup_lat)
        lat2 = radians(destination_lat)
        delta_lat = radians(destination_lat - pickup_lat)
        delta_lon = radians(destination_lon - pickup_lon)

        a = (
            sin(delta_lat / 2) ** 2
            + cos(lat1) * cos(lat2) * sin(delta_lon / 2) ** 2
        )
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return earth_radius * c
