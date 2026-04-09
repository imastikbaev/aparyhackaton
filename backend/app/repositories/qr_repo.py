from sqlalchemy import select

from app.models.qr_point import QRPoint
from app.repositories.base import BaseRepository


class QRPointRepository(BaseRepository[QRPoint]):
    model = QRPoint

    async def get_active(self, qr_id: str) -> QRPoint | None:
        result = await self.session.execute(
            select(QRPoint).where(QRPoint.id == qr_id, QRPoint.is_active.is_(True))
        )
        return result.scalar_one_or_none()
