from redis.asyncio import Redis

from app.core.config import settings
from app.core.security import generate_otp
from app.services.sms_service import sms_provider

OTP_PREFIX = "otp:"


class OTPService:
    def __init__(self, redis: Redis) -> None:
        self._redis = redis

    async def send(self, phone: str) -> str:
        """Генерирует и отправляет OTP. Возвращает код (для mock-режима)."""
        code = generate_otp()
        key = f"{OTP_PREFIX}{phone}"
        await self._redis.setex(key, settings.OTP_EXPIRE_SECONDS, code)
        await sms_provider.send_otp(phone, code)
        return code

    async def verify(self, phone: str, code: str) -> bool:
        key = f"{OTP_PREFIX}{phone}"
        stored = await self._redis.get(key)
        if stored and stored == code:
            await self._redis.delete(key)
            return True
        return False
