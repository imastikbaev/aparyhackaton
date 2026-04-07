from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.api.deps import DBDep, RedisDep
from app.core.config import settings
from app.core.security import create_access_token
from app.repositories import UserRepository
from app.schemas.auth import OTPRequest, OTPVerify, TokenResponse
from app.services import OTPService

router = APIRouter(prefix="/auth", tags=["auth"])


class OTPSendResponse(BaseModel):
    """В mock-режиме возвращает код прямо в ответе."""
    dev_code: str | None = None


@router.post("/send-otp", response_model=OTPSendResponse)
async def send_otp(body: OTPRequest, redis: RedisDep) -> OTPSendResponse:
    """Отправить OTP на номер телефона."""
    otp_service = OTPService(redis)
    code = await otp_service.send(body.phone)

    # В mock-режиме возвращаем код в ответе для удобства разработки
    if settings.SMS_PROVIDER == "mock":
        return OTPSendResponse(dev_code=code)
    return OTPSendResponse()


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(body: OTPVerify, db: DBDep, redis: RedisDep) -> TokenResponse:
    """Подтвердить OTP и получить JWT токен."""
    otp_service = OTPService(redis)
    is_valid = await otp_service.verify(body.phone, body.code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный или истёкший код",
        )

    repo = UserRepository(db)
    user, is_new = await repo.get_or_create(body.phone)
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, is_new_user=is_new)
