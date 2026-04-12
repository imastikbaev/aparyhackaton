from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.core.redis import close_redis, get_redis
from app.models.qr_point import QRPoint
import app.models  # noqa: F401 — регистрируем все модели в SQLAlchemy


async def ensure_demo_qr_point() -> None:
    async with AsyncSessionLocal() as session:
        demo_point = await session.get(QRPoint, "demo")
        if demo_point:
            return

        session.add(
            QRPoint(
                id="demo",
                name="Oskemen Hub",
                address="ул. Казахстан 59/1, Oskemen Hub, Усть-Каменогорск",
                latitude=49.949607,
                longitude=82.627735,
                is_active=True,
            )
        )
        await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await ensure_demo_qr_point()
    await get_redis()
    yield
    await close_redis()
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",  # всегда включаем для хакатона
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "version": settings.APP_VERSION}
