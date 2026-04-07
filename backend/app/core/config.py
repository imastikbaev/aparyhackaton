from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # App
    APP_NAME: str = "APARU QR Taxi"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/aparu"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # SMS (пример: Twilio)
    SMS_PROVIDER: str = "mock"  # "twilio" | "mock"
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    # OTP
    OTP_EXPIRE_SECONDS: int = 300  # 5 минут
    OTP_LENGTH: int = 4

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://aparu.kz"]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
