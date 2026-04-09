from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    car_model: Mapped[str] = mapped_column(String(100), nullable=False)
    car_color: Mapped[str] = mapped_column(String(50), nullable=False)
    car_number: Mapped[str] = mapped_column(String(20), nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    current_latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    orders: Mapped[list["Order"]] = relationship("Order", back_populates="driver")  # noqa: F821
