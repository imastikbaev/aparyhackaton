from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import DBDep
from app.core.config import settings
from app.repositories.order_repo import OrderRepository
from app.schemas.order import AdminOrderOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/orders", response_model=list[AdminOrderOut])
async def list_recent_orders(
    db: DBDep,
    key: str = Query(..., description="Read-only dashboard key"),
    limit: int = Query(100, ge=1, le=500),
) -> list[AdminOrderOut]:
    if key != settings.ADMIN_DASHBOARD_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный ключ доступа",
        )

    repo = OrderRepository(db)
    orders = await repo.get_recent_with_relations(limit=limit)

    return [
        AdminOrderOut(
            id=order.id,
            status=order.status,
            pickup_address=order.pickup_address,
            destination_address=order.destination_address,
            tariff=order.tariff,
            payment_method=order.payment_method,
            price_estimate=order.price_estimate,
            created_at=order.created_at,
            user_phone=order.user.phone,
            qr_point_name=order.qr_point.name,
            driver_name=order.driver.name if order.driver else None,
            car_number=order.driver.car_number if order.driver else None,
        )
        for order in orders
    ]
