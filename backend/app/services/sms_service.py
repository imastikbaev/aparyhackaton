import logging
from abc import ABC, abstractmethod

from app.core.config import settings

logger = logging.getLogger(__name__)


class SMSProvider(ABC):
    @abstractmethod
    async def send_otp(self, phone: str, code: str) -> bool: ...


class MockSMSProvider(SMSProvider):
    """Для разработки — логирует OTP вместо отправки."""

    async def send_otp(self, phone: str, code: str) -> bool:
        logger.info("[MOCK SMS] phone=%s otp=%s", phone, code)
        return True


class TwilioSMSProvider(SMSProvider):
    def __init__(self) -> None:
        from twilio.rest import Client  # type: ignore

        self._client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        self._from = settings.TWILIO_FROM_NUMBER

    async def send_otp(self, phone: str, code: str) -> bool:
        try:
            self._client.messages.create(
                body=f"Ваш код APARU: {code}",
                from_=self._from,
                to=phone,
            )
            return True
        except Exception as exc:
            logger.error("SMS send error: %s", exc)
            return False


def get_sms_provider() -> SMSProvider:
    if settings.SMS_PROVIDER == "twilio":
        return TwilioSMSProvider()
    return MockSMSProvider()


sms_provider = get_sms_provider()
