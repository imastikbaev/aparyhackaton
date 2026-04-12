from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderStatus
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    model = Order

    async def get_with_relations(self, order_id: int) -> Order | None:
        result = await self.session.execute(
            select(Order)
            .options(selectinload(Order.driver), selectinload(Order.qr_point))
            .where(Order.id == order_id)
        )
        return result.scalar_one_or_none()

    async def get_user_orders(self, user_id: int, limit: int = 20) -> list[Order]:
        result = await self.session.execute(
            select(Order)
            .options(selectinload(Order.driver))
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_recent_with_relations(self, limit: int = 100) -> list[Order]:
        result = await self.session.execute(
            select(Order)
            .options(
                selectinload(Order.driver),
                selectinload(Order.qr_point),
                selectinload(Order.user),
            )
            .order_by(Order.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def update_status(self, order: Order, status: OrderStatus) -> Order:
        order.status = status
        self.session.add(order)
        await self.session.flush()
        return order
