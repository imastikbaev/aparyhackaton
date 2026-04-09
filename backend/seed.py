"""
Тестовые данные для Оскемена (Усть-Каменогорск).
Запуск: docker compose exec backend python seed.py
"""
import asyncio

# Используем движок приложения — он уже правильно сконфигурирован через env vars
from app.core.database import Base, AsyncSessionLocal, engine
import app.models  # noqa: F401  — регистрирует все модели в Base.metadata

from app.models.driver import Driver
from app.models.qr_point import QRPoint
from sqlalchemy import select


async def seed() -> None:
    print("Подключаемся к БД через app.core.database...")

    # Создаём таблицы, если ещё не существуют
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("  ✓ Таблицы готовы")

    async with AsyncSessionLocal() as session:

        # ── QR-точки (Оскемен) ───────────────────────────────────────────
        qr_points = [
            QRPoint(
                id="oskemen-hub",
                name="Oskemen Hub",
                address="ул. Казахстан, 59, Оскемен",
                latitude=49.949583,  # 49°56'58.5"N
                longitude=82.627750, # 82°37'39.9"E
            ),
            QRPoint(
                id="airport-oskemen",
                name="Аэропорт Оскемен",
                address="ул. Аэропортная, 1, Оскемен",
                latitude=50.0066,
                longitude=82.4862,
            ),
            QRPoint(
                id="trts-slon",
                name='ТРЦ "Слон"',
                address="пр. Независимости, 58, Оскемен",
                latitude=49.9508,
                longitude=82.6208,
            ),
            QRPoint(
                id="vokzal-oskemen",
                name="ЖД Вокзал Оскемен",
                address="ул. Железнодорожная, 1, Оскемен",
                latitude=49.9621,
                longitude=82.6276,
            ),
        ]
        for p in qr_points:
            existing = await session.get(QRPoint, p.id)
            if not existing:
                session.add(p)
                print(f"  + QR-точка: {p.name}")
            else:
                print(f"  ~ Уже есть:  {p.name}")

        # ── Водители (Оскемен) ────────────────────────────────────────────
        result = await session.execute(select(Driver).limit(1))
        if not result.scalar_one_or_none():
            drivers = [
                Driver(
                    name="Азамат Байжанов",
                    phone="+77771234501",
                    car_model="Toyota Camry 70",
                    car_color="Белый",
                    car_number="777 ALA 01",
                    rating=4.9,
                    is_available=True,
                    current_latitude=49.9518,
                    current_longitude=82.6090,
                ),
                Driver(
                    name="Ерлан Сейткалиев",
                    phone="+77771234502",
                    car_model="Hyundai Sonata",
                    car_color="Чёрный",
                    car_number="333 EKO 02",
                    rating=4.8,
                    is_available=True,
                    current_latitude=49.9495,
                    current_longitude=82.6070,
                ),
                Driver(
                    name="Нуржан Алибеков",
                    phone="+77771234503",
                    car_model="Kia K5",
                    car_color="Серебристый",
                    car_number="555 VOS 03",
                    rating=4.7,
                    is_available=True,
                    current_latitude=49.9530,
                    current_longitude=82.6100,
                ),
            ]
            for d in drivers:
                session.add(d)
                print(f"  + Водитель:  {d.name} — {d.car_model}")
        else:
            print("  ~ Водители уже добавлены")

        await session.commit()

    await engine.dispose()

    print("\n✅ Тестовые данные добавлены!")
    print("   Открой: http://localhost:3000/scan/oskemen-hub")
    print("   Другие точки: airport-oskemen, trts-slon, vokzal-oskemen")


asyncio.run(seed())
