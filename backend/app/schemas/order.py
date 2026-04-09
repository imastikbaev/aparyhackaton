from datetime import datetime

from pydantic import BaseModel

from app.models.order import OrderStatus, PaymentMethod
from app.schemas.driver import DriverOut


class OrderCreate(BaseModel):
    qr_point_id: str
    destination_address: str | None = None
    destination_lat: float | None = None
    destination_lon: float | None = None
    tariff: str = "standard"
    payment_method: PaymentMethod = PaymentMethod.CASH


class OrderOut(BaseModel):
    id: int
    status: OrderStatus
    pickup_address: str
    pickup_lat: float
    pickup_lon: float
    destination_address: str | None
    destination_lat: float | None = None
    destination_lon: float | None = None
    tariff: str
    payment_method: PaymentMethod
    price_estimate: float | None
    driver: DriverOut | None
    eta_minutes: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    eta_minutes: int | None = None
