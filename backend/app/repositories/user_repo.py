from sqlalchemy import select

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    async def get_by_phone(self, phone: str) -> User | None:
        result = await self.session.execute(select(User).where(User.phone == phone))
        return result.scalar_one_or_none()

    async def get_or_create(self, phone: str) -> tuple[User, bool]:
        user = await self.get_by_phone(phone)
        if user:
            return user, False
        user = await self.create(phone=phone)
        return user, True
